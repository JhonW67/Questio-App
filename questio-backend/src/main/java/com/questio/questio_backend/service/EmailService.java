package com.questio.questio_backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.List;
import java.util.Map;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final TemplateEngine templateEngine;
    private final RestClient brevoClient;

    @Value("${app.mail.from}")
    private String fromAddress;

    @Value("${app.mail.from-name:Questio}")
    private String fromName;

    public EmailService(
            TemplateEngine templateEngine,
            @Value("${brevo.api.base-url:https://api.brevo.com/v3}") String brevoBaseUrl,
            @Value("${brevo.api.key}") String brevoApiKey
    ) {
        this.templateEngine = templateEngine;
        this.brevoClient = RestClient.builder()
                .baseUrl(brevoBaseUrl)
                .defaultHeader("api-key", brevoApiKey)
                .defaultHeader("accept", MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader("content-type", MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    public void enviarEmailResetSenha(String para, String nome, String urlLink, int minutosExpiracao) {
        Context context = new Context();
        context.setVariable("nomeUsuario", nome);
        context.setVariable("urlLink", urlLink);
        context.setVariable("minutosExpiracao", minutosExpiracao);

        String htmlConteudo = templateEngine.process("emails/reset-password", context);
        enviarEmail(para, nome, "Questio | Redefinicao de senha", htmlConteudo,
                "Erro ao enviar e-mail de redefinicao de senha");
    }

    public void enviarEmailVerificacaoHtml(String para, String nome, String urlLink) {
        Context context = new Context();
        context.setVariable("nomeUsuario", nome);
        context.setVariable("urlLink", urlLink);

        String htmlConteudo = templateEngine.process("emails/verificar-email", context);
        enviarEmail(para, nome, "Bem-vindo ao Questio - Confirme seu e-mail", htmlConteudo,
                "Erro ao enviar email de verificacao");
    }

    private void enviarEmail(String para, String nome, String assunto, String htmlConteudo, String mensagemErro) {
        Map<String, Object> payload = Map.of(
                "sender", Map.of(
                        "name", fromName,
                        "email", fromAddress
                ),
                "to", List.of(Map.of(
                        "email", para,
                        "name", nome
                )),
                "subject", assunto,
                "htmlContent", htmlConteudo
        );

        try {
            brevoClient.post()
                    .uri("/smtp/email")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientResponseException e) {
            log.error("Falha ao enviar e-mail via Brevo. Status: {}, Body: {}", e.getStatusCode(), e.getResponseBodyAsString(), e);
            throw new RuntimeException(mensagemErro, e);
        } catch (Exception e) {
            log.error("Falha inesperada ao enviar e-mail via Brevo", e);
            throw new RuntimeException(mensagemErro, e);
        }
    }
}
