package com.example.jihoonlibary_back.service;

import com.example.jihoonlibary_back.dto.MemberDto;
import com.example.jihoonlibary_back.dto.MemberJoinDto;
import com.example.jihoonlibary_back.entity.Member;
import com.example.jihoonlibary_back.repository.MemberRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;


    @Transactional
    public MemberDto createMember(MemberJoinDto memberJoinDto) {
        Optional<Member> optionalMember = memberRepository.findByLoginId(memberJoinDto.getLoginId());
        if (optionalMember.isPresent()) {
            throw new IllegalArgumentException("이미 등록된 아이디 입니다.");
        }
        Optional<Member> optionalMember1 = memberRepository.findByLoginId(memberJoinDto.getPhone());
        if (optionalMember1.isPresent()) {
            throw new IllegalArgumentException("이미 등록된 전화번호 입니다.");
        }
        Member member = Member.builder()
                .loginId(memberJoinDto.getLoginId())
                .password(passwordEncoder.encode(memberJoinDto.getPassword()))
                .phone(memberJoinDto.getPhone())
                .memo(memberJoinDto.getMemo())
                .role(memberJoinDto.getRole() != null ? memberJoinDto.getRole() : "USER")
                .build();
        Member save = memberRepository.save(member);
        return MemberDto.builder().
                id(save.getId()).
                phone(save.getPhone()).
                loginId(save.getLoginId()).
                memo(save.getMemo()).
                role(save.getRole())
                .build();
    }
}
