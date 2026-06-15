package com.questio.questio_backend.service;

import com.icegreen.greenmail.junit5.GreenMailExtension;
import com.icegreen.greenmail.util.GreenMailUtil;
import com.icegreen.greenmail.util.ServerSetup;
import com.questio.questio_backend.entity.User;
import com.questio.questio_backend.entity.enums.TipoUsuario;
import com.questio.questio_backend.repository.PasswordResetTokenRepository;
import com.questio.questio_backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.RegisterExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;

@SpringBootTest
@Transactional
class PasswordResetEmailIntegrationTest {
    private static final int SMTP_TEST_PORT = 3025;

    @RegisterExtension
    static GreenMailExtension greenMail = new GreenMailExtension(new ServerSetup(SMTP_TEST_PORT, "127.0.0.1", "smtp"));

    @DynamicPropertySource
    static void configureMail(DynamicPropertyRegistry registry) {
        registry.add("spring.mail.host", () -> "127.0.0.1");
        registry.add("spring.mail.port", () -> SMTP_TEST_PORT);
        registry.add("spring.mail.properties.mail.smtp.auth", () -> "false");
        registry.add("spring.mail.properties.mail.smtp.starttls.enable", () -> "false");
    }

    @Autowired
    private PasswordResetServiceImpl passwordResetService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    private String normalizarCorpoMime(String corpo) {
        return corpo
                .replace("=\r\n", "")
                .replace("=\n", "")
                .replace("=3D", "=")
                .replace("&amp;", "&");
    }

    @Test
    void solicitarReset_deveEnviarEmailProfissionalComLinkValido() throws Exception {
        var user = userRepository.save(User.builder()
                .nome("Professor Questio")
                .email("professor.questio@teste.com")
                .senha("senha123")
                .curso("Sistemas")
                .tipoUsuario(TipoUsuario.PROFESSOR.getValor())
                .termoAceito(true)
                .emailVerificado(true)
                .build());

        passwordResetService.solicitarReset(user.getEmail());

        assertThat(greenMail.waitForIncomingEmail(5_000, 1)).isTrue();
        var mensagens = greenMail.getReceivedMessages();

        assertThat(mensagens).hasSize(1);
        assertThat(mensagens[0].getAllRecipients()[0].toString()).isEqualTo(user.getEmail());
        assertThat(mensagens[0].getSubject()).isEqualTo("Questio | Redefinição de senha");

        String corpo = normalizarCorpoMime(GreenMailUtil.getBody(mensagens[0]));
        assertThat(corpo).contains("Redefinir senha");
        assertThat(corpo).contains("Professor Questio");
        assertThat(corpo).contains("questio-app://screens/(Authenticator)/ResetPassWord?token=");
        assertThat(corpo).contains("email=professor.questio@teste.com");
        assertThat(tokenRepository.findAll()).hasSize(1);
    }

    @Test
    void solicitarReset_paraEmailInexistenteNaoDeveFalharNemEnviarEmail() {
        assertThatCode(() -> passwordResetService.solicitarReset("naoexiste@teste.com"))
                .doesNotThrowAnyException();

        assertThat(greenMail.getReceivedMessages()).isEmpty();
        assertThat(tokenRepository.findAll()).isEmpty();
    }
}
