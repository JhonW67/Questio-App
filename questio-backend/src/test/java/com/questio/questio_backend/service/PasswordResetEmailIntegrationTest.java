package com.questio.questio_backend.service;

import com.questio.questio_backend.entity.User;
import com.questio.questio_backend.entity.enums.TipoUsuario;
import com.questio.questio_backend.repository.PasswordResetTokenRepository;
import com.questio.questio_backend.repository.UserRepository;
import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;

@SpringBootTest
@Transactional
class PasswordResetEmailIntegrationTest {

    private static HttpServer brevoFakeServer;
    private static final AtomicReference<String> lastRequestBody = new AtomicReference<>();
    private static final AtomicReference<String> lastRequestPath = new AtomicReference<>();
    private static final AtomicReference<String> lastApiKey = new AtomicReference<>();
    private static final AtomicInteger requestCount = new AtomicInteger();

    @BeforeAll
    static void startFakeBrevo() throws IOException {
        brevoFakeServer = HttpServer.create(new InetSocketAddress(18080), 0);
        brevoFakeServer.createContext("/v3/smtp/email", exchange -> {
            lastRequestPath.set(exchange.getRequestURI().getPath());
            lastApiKey.set(exchange.getRequestHeaders().getFirst("api-key"));
            lastRequestBody.set(new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8));
            requestCount.incrementAndGet();

            byte[] response = "{\"messageId\":\"fake-brevo-id\"}".getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().add("Content-Type", "application/json");
            exchange.sendResponseHeaders(201, response.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(response);
            }
        });
        brevoFakeServer.start();
    }

    @AfterAll
    static void stopFakeBrevo() {
        if (brevoFakeServer != null) {
            brevoFakeServer.stop(0);
        }
    }

    @DynamicPropertySource
    static void configureBrevo(DynamicPropertyRegistry registry) {
        registry.add("brevo.api.base-url", () -> "http://127.0.0.1:18080/v3");
        registry.add("brevo.api.key", () -> "test-brevo-key");
    }

    @Autowired
    private PasswordResetServiceImpl passwordResetService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    @Test
    void solicitarReset_deveEnviarEmailProfissionalComLinkValido() {
        requestCount.set(0);
        lastRequestBody.set(null);
        lastRequestPath.set(null);
        lastApiKey.set(null);

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

        assertThat(requestCount.get()).isEqualTo(1);
        assertThat(lastRequestPath.get()).isEqualTo("/v3/smtp/email");
        assertThat(lastApiKey.get()).isEqualTo("test-brevo-key");
        assertThat(lastRequestBody.get()).contains("\"subject\":\"Questio | Redefinicao de senha\"");
        assertThat(lastRequestBody.get()).contains("\"email\":\"professor.questio@teste.com\"");
        assertThat(lastRequestBody.get()).contains("Professor Questio");
        assertThat(lastRequestBody.get()).contains("questio-app://screens/(Authenticator)/ResetPassWord?token=");
        assertThat(lastRequestBody.get()).contains("email=professor.questio@teste.com");
        assertThat(lastRequestBody.get()).contains("Redefinir senha");
        assertThat(tokenRepository.findAll()).hasSize(1);
    }

    @Test
    void solicitarReset_paraEmailInexistenteNaoDeveFalharNemEnviarChamadaHttp() {
        requestCount.set(0);
        lastRequestBody.set(null);
        lastRequestPath.set(null);

        assertThatCode(() -> passwordResetService.solicitarReset("naoexiste@teste.com"))
                .doesNotThrowAnyException();

        assertThat(requestCount.get()).isZero();
        assertThat(lastRequestBody.get()).isNull();
        assertThat(tokenRepository.findAll()).isEmpty();
    }
}
