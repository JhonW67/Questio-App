package com.questio.questio_backend.service;

import com.questio.questio_backend.dto.LoginRequestDTO;
import com.questio.questio_backend.dto.LoginResponseDTO;
import com.questio.questio_backend.dto.UserRegisterRequestDTO;
import com.questio.questio_backend.dto.UserResponseDTO;
import com.questio.questio_backend.entity.User;
import com.questio.questio_backend.entity.VerificationToken;
import com.questio.questio_backend.entity.enums.TipoUsuario;
import com.questio.questio_backend.repository.UserRepository;
import com.questio.questio_backend.repository.VerificationTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final TokenService tokenService;
    private final GamificationService gamificationService;
    private final VerificationTokenRepository verificationTokenRepository;
    private final EmailService emailService;

    @Value("${app.frontend.url:http://localhost:8081}")
    private String frontendUrl;

    @Override
    public UserResponseDTO registerNewUser(UserRegisterRequestDTO request) {

        if (userRepository.existsByEmail(request.email())) {
            return UserResponseDTO.builder()
                    .mensagem("E-mail já cadastrado!!")
                    .build();
        }

        if (Boolean.FALSE.equals(request.termoAceito())) {
            return UserResponseDTO.builder()
                    .mensagem("É necessario aceitar os termos")
                    .build();
        }

        TipoUsuario tipo = request.tipoUsuario();
        if (tipo == null) {
            return UserResponseDTO.builder()
                    .mensagem("Tipo de Usuário Inválido")
                    .build();
        }

        if (tipo != TipoUsuario.ALUNO) {
            return UserResponseDTO.builder()
                    .mensagem("Cadastro de professor e coordenação deve ser feito pela coordenação.")
                    .build();
        }

        User newUser = User.builder()
                .nome(request.nome())
                .email(request.email())
                .senha(passwordEncoder.encode(request.senha()))
                .curso(request.curso() == null ? "" : request.curso())
                .tipoUsuario(tipo.getValor())
                .termoAceito(true)
                .xpTotal(0)
                .nivel(1)
                .streakAtual(0)
                .emailVerificado(false)
                .build();

        User salvo = userRepository.save(newUser);

        String tokenString = UUID.randomUUID().toString();
        VerificationToken verificationToken = VerificationToken.builder()
                .token(tokenString)
                .usuario(salvo)
                .dataExpiracao(LocalDateTime.now().plusHours(24))
                .build();

        verificationTokenRepository.save(verificationToken);

        String linkConfirmacao = frontendUrl + "/verificar-email?token=" + tokenString;
        emailService.enviarEmailVerificacaoHtml(salvo.getEmail(), salvo.getNome(), linkConfirmacao);

        TipoUsuario tipoDeRetorno = TipoUsuario.fromString(salvo.getTipoUsuario());
        return UserResponseDTO.builder()
                .idUsuario(salvo.getIdUsuario())
                .nome(salvo.getNome())
                .email(salvo.getEmail())
                .curso(salvo.getCurso())
                .tipoUsuario(tipoDeRetorno)
                .termoAceito(salvo.getTermoAceito())
                .xpTotal(salvo.getXpTotal())
                .nivel(salvo.getNivel())
                .streakAtual(salvo.getStreakAtual())
                .mensagem("Usuário criado com sucesso! Verifique seu e-mail para ativar a conta.")
                .build();

    }

    public LoginResponseDTO login(LoginRequestDTO data) {
        User user = userRepository.findByEmail(data.email())
                .orElseThrow(() -> new RuntimeException("Credenciais inválidas"));

        if (Boolean.TRUE.equals(user.getAcessoBloqueado())) {
            throw new RuntimeException("Seu acesso está bloqueado. Contate a coordenação.");
        }

        if (Boolean.FALSE.equals(user.getEmailVerificado())) {
            throw new RuntimeException("Sua conta ainda não foi ativada. Verifique sua caixa de entrada para confirmar o e-mail.");
        }

        var usernamePassword = new UsernamePasswordAuthenticationToken(data.email(), data.senha());
        var auth = this.authenticationManager.authenticate(usernamePassword);

        var token = tokenService.generateToken((User) auth.getPrincipal());

        return new LoginResponseDTO(token, "Login bem-sucedido!");
    }

    public void verificarEmail(String tokenString) {
        VerificationToken token = verificationTokenRepository.findByToken(tokenString)
                .orElseThrow(() -> new RuntimeException("Link de verificação inválido!"));

        if (token.isExpirado()) {
            verificationTokenRepository.delete(token);
            throw new RuntimeException("Este link expirou! Por favor, solicite um novo cadastro.");
        }

        User usuario = token.getUsuario();
        usuario.setEmailVerificado(true);
        userRepository.save(usuario);

        verificationTokenRepository.delete(token);
    }

    @Override
    public UserResponseDTO getUserProfile(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        TipoUsuario tipo = TipoUsuario.fromString(user.getTipoUsuario());
        return UserResponseDTO.builder()
                .idUsuario(user.getIdUsuario())
                .nome(user.getNome())
                .email(user.getEmail())
                .curso(user.getCurso())
                .tipoUsuario(tipo)
                .termoAceito(user.getTermoAceito())
                .xpTotal(user.getXpTotal())
                .nivel(user.getNivel())
                .streakAtual(user.getStreakAtual())
                .acessoBloqueado(Boolean.TRUE.equals(user.getAcessoBloqueado()))
                .build();
    }

    @Override
    public UserResponseDTO updateStreak(UUID userId, Integer novosPontos) {
        return gamificationService.checkin(userId);
    }
}
