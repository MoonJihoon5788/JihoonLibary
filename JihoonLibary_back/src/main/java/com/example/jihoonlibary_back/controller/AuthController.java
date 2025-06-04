package com.example.jihoonlibary_back.controller;

import com.example.jihoonlibary_back.dto.LoginDto;
import com.example.jihoonlibary_back.dto.RefreshTokenRequestDto;
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
    public ResponseEntity<TokenDto> refresh(@RequestBody RefreshTokenRequestDto refreshTokenRequestDto) {
        try {
            TokenDto tokenDto = authService.refreshToken(refreshTokenRequestDto.getRefreshToken());
            return ResponseEntity.ok(tokenDto);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody RefreshTokenRequestDto refreshTokenRequestDto) {
        try {
            authService.logout(refreshTokenRequestDto.getRefreshToken());
            return ResponseEntity.ok().body("로그아웃 성공");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("로그아웃 실패: " + e.getMessage());
        }
    }
}