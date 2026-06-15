package com.questio.questio_backend.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${app.mail.from}")
    private String fromAddress;

    public void enviarEmailResetSenha(String para, String nome, String urlLink, int minutosExpiracao) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            Context context = new Context();
            context.setVariable("nomeUsuario", nome);
            context.setVariable("urlLink", urlLink);
            context.setVariable("minutosExpiracao", minutosExpiracao);

            String htmlConteudo = templateEngine.process("emails/reset-password", context);

            helper.setTo(para);
            helper.setSubject("Questio | Redefinição de senha");
            helper.setText(htmlConteudo, true);
            helper.setFrom(fromAddress);

            mailSender.send(mimeMessage);
        } catch (Exception e) {
            throw new RuntimeException("Erro ao enviar e-mail de redefinição de senha", e);
        }
    }

    public void enviarEmailVerificacaoHtml(String para, String nome, String urlLink) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            Context context = new Context();
            context.setVariable("nomeUsuario", nome);
            context.setVariable("urlLink", urlLink);

            String htmlConteudo = templateEngine.process("emails/verificar-email", context);

            helper.setTo(para);
            helper.setSubject("Bem-vindo ao Questio - Confirme seu e-mail");
            helper.setText(htmlConteudo, true);
            helper.setFrom(fromAddress);

            mailSender.send(mimeMessage);
        } catch (Exception e) {
            throw new RuntimeException("Erro ao enviar email de verificação", e);
        }
    }
}
