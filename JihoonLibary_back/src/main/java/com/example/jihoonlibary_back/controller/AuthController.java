package com.example.jihoonlibary_back.controller;

import com.example.jihoonlibary_back.dto.LoginDto;
import com.example.jihoonlibary_back.dto.TokenDto;
import com.example.jihoonlibary_back.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDto loginDto) {
        try {
            TokenDto tokenDto = authService.login(loginDto);
            return ResponseEntity.ok(tokenDto);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("로그인 실패: " + e.getMessage());
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenDto> refresh(@RequestHeader("Authorization") String refreshToken) {
        try {
            String token = refreshToken.substring(7); // "Bearer " 제거
            TokenDto tokenDto = authService.refreshToken(token);
            return ResponseEntity.ok(tokenDto);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String refreshToken) {
        try {
            String token = refreshToken.substring(7);
            authService.logout(token);
            return ResponseEntity.ok().body("로그아웃 성공");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("로그아웃 실패: " + e.getMessage());
        }
    }
}