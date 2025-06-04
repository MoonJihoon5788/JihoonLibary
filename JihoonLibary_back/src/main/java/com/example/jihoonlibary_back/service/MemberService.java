package com.example.jihoonlibary_back.service;

import com.example.jihoonlibary_back.dto.MemberDto;
import com.example.jihoonlibary_back.dto.MemberJoinDto;
import com.example.jihoonlibary_back.dto.MemberResponseDto;
import com.example.jihoonlibary_back.dto.MemberUpdateDto;
import com.example.jihoonlibary_back.entity.Loan;
import com.example.jihoonlibary_back.entity.Member;
import com.example.jihoonlibary_back.repository.MemberRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
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
        Optional<Member> optionalMember1 = memberRepository.findByPhone(memberJoinDto.getPhone());
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

    // 사용자 수정
    public MemberResponseDto updateMember(Long memberId, MemberUpdateDto memberUpdateDto) {
        Optional<Member> optionalMember = memberRepository.findById(memberId);
        if (optionalMember.isEmpty()) {
            throw new IllegalArgumentException("사용자를 찾을수 없습니다.");
        }
        Member member = optionalMember.get();
        // 전화번호 중복 체크
        if (memberUpdateDto.getPhone() != null && !memberUpdateDto.getPhone().equals(member.getPhone())) {
            Optional<Member> existingMember = memberRepository.findByPhone(memberUpdateDto.getPhone());
            if (existingMember.isPresent() && !existingMember.get().getId().equals(memberId)) {
                throw new IllegalArgumentException("이미 등록된 전화번호입니다.");
            }
        }
        // 정보 업데이트
        member.updateMember(
                memberUpdateDto.getPhone() != null ? memberUpdateDto.getPhone() : member.getPhone(),
                memberUpdateDto.getMemo() != null ? memberUpdateDto.getMemo() : member.getMemo(),
                memberUpdateDto.getRole() != null ? memberUpdateDto.getRole() : member.getRole()
        );

        Member savedMember = memberRepository.save(member);
        return convertToDto(savedMember);
    }
    // 사용자 삭제
    public void deleteMember(Long memberId) {
        Optional<Member> optionalMember = memberRepository.findById(memberId);
        if (optionalMember.isEmpty()) {
            throw new IllegalArgumentException("사용자를 찾을수 없습니다.");
        }
        Member member = optionalMember.get();

        // 대출 중인 도서가 있는지 확인
        boolean isActiveLoans = false;
        for (Loan loan : member.getLoans()) {
            if (loan.getStatus() == 'L') {
                isActiveLoans = true;
                break;
            }
        }
        if (isActiveLoans) {
            throw new IllegalStateException("대출 중인 도서가 있는 사용자는 삭제할 수 없습니다.");
        }

        memberRepository.delete(member);
    }


    private MemberResponseDto convertToDto(Member member) {
        // 현재 대출 중인 도서 수 계산
        int currentLoans = 0;
        for (Loan loan : member.getLoans()) {
            if (loan.getStatus() == 'L') {
                currentLoans++;
            }
        }
        // 연체 도서 있는지 확인
        boolean overdueBooks = false;
        for (Loan loan : member.getLoans()) {
            if (loan.getStatus() == 'L' && loan.getReturnDate().isBefore(LocalDate.now())) {
                overdueBooks = true;
                break;
            }
        }
        return MemberResponseDto.builder()
                .id(member.getId())
                .loginId(member.getLoginId())
                .phone(member.getPhone())
                .memo(member.getMemo())
                .role(member.getRole())
                .currentLoans(currentLoans)
                .hasOverdueBooks(overdueBooks)
                .build();
    }
}
