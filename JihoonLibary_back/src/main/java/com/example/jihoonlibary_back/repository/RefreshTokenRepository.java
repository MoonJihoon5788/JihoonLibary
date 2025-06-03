package com.example.jihoonlibary_back.repository;

import com.example.jihoonlibary_back.entity.Member;
import com.example.jihoonlibary_back.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByRefreshToken(String refreshToken);
    Optional<RefreshToken> findByMember(Member member);
}