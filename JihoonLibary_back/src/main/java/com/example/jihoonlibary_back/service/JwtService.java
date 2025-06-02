package com.example.jihoonlibary_back.service;

import com.example.jihoonlibary_back.config.JwtProperties;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Duration;
import java.util.Date;

@Service
public class JwtService {
    private final JwtProperties jwtProperties;
    private final SecretKey secretKey;
    private final SecretKey refreshKey;
    private final JwtParser jwtParser;
    private final JwtParser refreshParser;
    private final UserDetailsService userDetailsService;

    public JwtService(JwtProperties jwtProperties, UserDetailsService userDetailsService) {
        this.jwtProperties = jwtProperties;
        this.userDetailsService = userDetailsService;
        this.secretKey = Keys.hmacShaKeyFor(Decoders.BASE64URL.decode(jwtProperties.getSecretKey()));
        this.refreshKey = Keys.hmacShaKeyFor(Decoders.BASE64URL.decode(jwtProperties.getRefreshKey()));
        this.jwtParser = Jwts.parser().verifyWith(secretKey).build();
        this.refreshParser = Jwts.parser().verifyWith(refreshKey).build();
    }

    public String generateAccessToken(String username) {
        return generateToken(username, jwtProperties.getDuration(), secretKey);
    }

    public String generateRefreshToken(String username) {
        return generateToken(username, jwtProperties.getRefreshDuration(), refreshKey);
    }

    private String generateToken(String username, int minutes, SecretKey key) {
        Date now = new Date();
        Date expiration = new Date(now.getTime() + Duration.ofMinutes(minutes).toMillis());
        return Jwts.builder()
                .issuer(jwtProperties.getIssuer())
                .subject(username)
                .expiration(expiration)
                .signWith(key)
                .compact();
    }

    public Authentication verifyToken(String token) throws JwtException, UsernameNotFoundException {
        String username = jwtParser.parseSignedClaims(token).getPayload().getSubject();
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        return new UsernamePasswordAuthenticationToken(userDetails.getUsername(), null, userDetails.getAuthorities());
    }

    public String validateAndGetUsernameFromRefreshToken(String refreshToken) {
        return refreshParser.parseSignedClaims(refreshToken).getPayload().getSubject();
    }
}