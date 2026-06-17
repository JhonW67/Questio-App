package com.questio.questio_backend.service;

import com.questio.questio_backend.entity.User;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.UUID;

@Service
public class TokenService {

    @Value("${api.security.token.secret}")
    private String secret;

    @Value("${api.security.token.expiration-ms}")
    private long expirationMs;

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(User user) {
        return Jwts.builder()
                .subject(user.getEmail())
                .claim("nome", user.getNome())
                .claim("tipo", user.getTipoUsuario())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(getSigningKey())
                .compact();
    }

    public String validateToken(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload()
                    .getSubject();
        } catch (JwtException e) {
            return "";
        }
    }

    public String generateAttachmentToken(UUID idSubmissao, UUID idUsuario, long expirationInMs) {
        return Jwts.builder()
                .subject("attachment")
                .claim("submissionId", idSubmissao.toString())
                .claim("userId", idUsuario.toString())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationInMs))
                .signWith(getSigningKey())
                .compact();
    }

    public Claims validateAttachmentToken(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            if (!"attachment".equals(claims.getSubject())) {
                return null;
            }

            return claims;
        } catch (JwtException e) {
            return null;
        }
    }

    public String generateTaskMaterialToken(UUID idMaterial, UUID idUsuario, long expirationInMs) {
        return Jwts.builder()
                .subject("task_material")
                .claim("materialId", idMaterial.toString())
                .claim("userId", idUsuario.toString())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationInMs))
                .signWith(getSigningKey())
                .compact();
    }

    public Claims validateTaskMaterialToken(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            if (!"task_material".equals(claims.getSubject())) {
                return null;
            }

            return claims;
        } catch (JwtException e) {
            return null;
        }
    }
}
