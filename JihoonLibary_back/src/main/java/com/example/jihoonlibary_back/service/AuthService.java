package com.example.jihoonlibary_back.service;

import com.example.jihoonlibary_back.config.JwtProperties;
import com.example.jihoonlibary_back.dto.LoginDto;
import com.example.jihoonlibary_back.dto.TokenDto;
import com.example.jihoonlibary_back.entity.Member;
import com.example.jihoonlibary_back.entity.RefreshToken;
import com.example.jihoonlibary_back.repository.MemberRepository;
import com.example.jihoonlibary_back.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final MemberRepository memberRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final JwtProperties jwtProperties;

    public TokenDto login(LoginDto loginDto) {
        Optional<Member> optionalMember = memberRepository.findByLoginId(loginDto.getLoginId());
        if (optionalMember.isEmpty()) {
            throw new IllegalArgumentException("이미 등록된 아이디 입니다.");
        }
        Member member = optionalMember.get();
        if (!passwordEncoder.matches(loginDto.getPassword(), member.getPassword())) {
            throw new BadCredentialsException("아이디 또는 비밀번호가 틀렸습니다.");
        }

        String accessToken = jwtService.generateAccessToken(member.getLoginId());
        String refreshToken = jwtService.generateRefreshToken(member.getLoginId());

        // 기존 리프레시 토큰 삭제
        Optional<RefreshToken> optionalRefreshToken = refreshTokenRepository.findByMember(member);
        if (optionalRefreshToken.isPresent()){
            refreshTokenRepository.delete(optionalRefreshToken.get());
        }

        // 새 리프레시 토큰 저장
        RefreshToken refreshTokenEntity = RefreshToken.builder()
                .refreshToken(refreshToken)
                .member(member)
                .build();
        refreshTokenRepository.save(refreshTokenEntity);

        return TokenDto.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn((long) jwtProperties.getDuration() * 60) // 분을 초로 변환
                .role(member.getRole())
                .loginId(member.getLoginId())
                .build();
    }

    public TokenDto refreshToken(String refreshToken) {
        Optional<RefreshToken> optionalRefreshToken = refreshTokenRepository.findByRefreshToken(refreshToken);
        if (optionalRefreshToken.isEmpty()){
            throw new BadCredentialsException("유효하지 않은 리프레시 토큰입니다.");
        }
        RefreshToken refreshTokenEntity = optionalRefreshToken.get();
        Member member = refreshTokenEntity.getMember();
        try {
            // 리프레시 토큰 검증하고 username 추출
            String username = jwtService.validateAndGetUsernameFromRefreshToken(refreshToken);

            if (!username.equals(member.getLoginId())) {
                throw new BadCredentialsException("토큰의 사용자 정보가 일치하지 않습니다.");
            }

            String newAccessToken = jwtService.generateAccessToken(member.getLoginId());
            String newRefreshToken = jwtService.generateRefreshToken(member.getLoginId());

            // 리프레시 토큰 업데이트
            refreshTokenEntity = RefreshToken.builder()
                    .id(refreshTokenEntity.getId())
                    .refreshToken(newRefreshToken)
                    .member(member)
                    .build();
            refreshTokenRepository.save(refreshTokenEntity);

            return TokenDto.builder()
                    .accessToken(newAccessToken)
                    .refreshToken(newRefreshToken)
                    .tokenType("Bearer")
                    .expiresIn((long) jwtProperties.getDuration() * 60)
                    .role(member.getRole())
                    .loginId(member.getLoginId())
                    .build();

        } catch (Exception e) {
            refreshTokenRepository.delete(refreshTokenEntity);
            throw new BadCredentialsException("만료된 리프레시 토큰입니다.");
        }
    }

    public void logout(String refreshToken) {
        Optional<RefreshToken> optionalRefreshToken = refreshTokenRepository.findByRefreshToken(refreshToken);
        if (optionalRefreshToken.isEmpty()){
            throw new BadCredentialsException("유효하지 않은 리프레시 토큰입니다.");
        }
        RefreshToken refreshTokenEntity = optionalRefreshToken.get();
        refreshTokenRepository.delete(refreshTokenEntity);
    }
}