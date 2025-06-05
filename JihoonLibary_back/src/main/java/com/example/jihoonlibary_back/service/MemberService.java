package com.example.jihoonlibary_back.service;

import com.example.jihoonlibary_back.dto.*;
import com.example.jihoonlibary_back.entity.Loan;
import com.example.jihoonlibary_back.entity.Member;
import com.example.jihoonlibary_back.repository.LoanRepository;
import com.example.jihoonlibary_back.repository.MemberRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final LoanRepository loanRepository;

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
                .name(memberJoinDto.getName())
                .phone(memberJoinDto.getPhone())
                .memo(memberJoinDto.getMemo())
                .role(memberJoinDto.getRole() != null ? memberJoinDto.getRole() : "USER")
                .build();
        Member save = memberRepository.save(member);
        return MemberDto.builder().
                id(save.getId()).
                name(save.getName()).
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

        if (memberUpdateDto.getLoginId() != null && !memberUpdateDto.getLoginId().equals(member.getLoginId())) {
            Optional<Member> existingMemberByLoginId = memberRepository.findByLoginId(memberUpdateDto.getLoginId());
            if (existingMemberByLoginId.isPresent() && !existingMemberByLoginId.get().getId().equals(memberId)) {
                throw new IllegalArgumentException("이미 등록된 아이디입니다.");
            }
        }

        // 전화번호 중복 체크
        if (memberUpdateDto.getPhone() != null && !memberUpdateDto.getPhone().equals(member.getPhone())) {
            Optional<Member> existingMemberByPhone = memberRepository.findByPhone(memberUpdateDto.getPhone());
            if (existingMemberByPhone.isPresent() && !existingMemberByPhone.get().getId().equals(memberId)) {
                throw new IllegalArgumentException("이미 등록된 전화번호입니다.");
            }
        }

        // 비밀번호
        if (memberUpdateDto.getPassword() != null && !memberUpdateDto.getPassword().trim().isEmpty()) {
            member.updatePassword(passwordEncoder.encode(memberUpdateDto.getPassword()));
        }

        // 정보 업데이트
        member.updateMember(
                memberUpdateDto.getLoginId() != null ? memberUpdateDto.getLoginId() : member.getLoginId(),
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
            if (loan.getStatus().equals('L') || loan.getStatus().equals('O')) {
                isActiveLoans = true;
                break;
            }
        }
        if (isActiveLoans) {
            throw new IllegalStateException("대출 중인 도서가 있는 사용자는 삭제할 수 없습니다.");
        }

        memberRepository.delete(member);
    }

    // 모든 사용자 조회 (페이징)
    @Transactional(readOnly = true)
    public Page<MemberResponseDto> getAllMembers(Pageable pageable) {
        // 정렬 필드명 매핑
        if (pageable.getSort().isSorted()) {
            Sort mappedSort = Sort.unsorted();
            for (Sort.Order order : pageable.getSort()) {
                String mappedField = mapSortField(order.getProperty());
                mappedSort = mappedSort.and(Sort.by(order.getDirection(), mappedField));
            }
            pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), mappedSort);
        }

        Page<Member> members = memberRepository.findAll(pageable);
        return members.map(this::convertToResponseDto);
    }

    // 사용자 상세 조회 (대출 현황 포함)
    @Transactional(readOnly = true)
    public MemberDetailDto getMemberDetail(Long memberId) {
        Optional<Member> optionalMember = memberRepository.findById(memberId);
        if (optionalMember.isEmpty()) {
            throw new IllegalArgumentException("사용자를 찾을 수 없습니다.");
        }
        Member member = optionalMember.get();

        return convertToDetailDto(member);
    }
    
    //유틸

    private String mapSortField(String sortBy) {
        switch (sortBy) {
            case "name":
                return "name";
            case "loginId":
                return "loginId";
            case "role":
                return "role";
            case "phone":
                return "phone";
            default:
                return "name";
        }
    }


    private MemberResponseDto convertToResponseDto(Member member) {
        long currentLoans = loanRepository.countByMemberIdAndStatusIn(member.getId(), List.of('L', 'O'));
        boolean hasOverdueBooks = loanRepository.existsByMemberIdAndStatus(member.getId(), 'O');

        return MemberResponseDto.builder()
                .id(member.getId())
                .loginId(member.getLoginId())
                .phone(member.getPhone())
                .memo(member.getMemo())
                .role(member.getRole())
                .currentLoans((int) currentLoans)
                .hasOverdueBooks(hasOverdueBooks)
                .build();
    }

    private MemberDetailDto convertToDetailDto(Member member) {
        long currentLoans = loanRepository.countByMemberIdAndStatusIn(member.getId(), List.of('L', 'O'));
        boolean hasOverdueBooks = loanRepository.existsByMemberIdAndStatus(member.getId(), 'O');
        long overdueCount = loanRepository.countByMemberIdAndStatus(member.getId(), 'O');

        // 현재 대출 중인 도서 목록
        List<LoanHistoryDto> currentLoanList = member.getLoans().stream()
                .filter(Loan::currentLoan)
                .map(this::convertToLoanHistoryDto)
                .collect(Collectors.toList());

        // 전체 대출 이력
        List<LoanHistoryDto> loanHistory = member.getLoans().stream()
                .sorted((l1, l2) -> l2.getLoanDate().compareTo(l1.getLoanDate()))
                .map(this::convertToLoanHistoryDto)
                .collect(Collectors.toList());

        // 회원 상태 결정
        String memberStatus;
        if (overdueCount > 0) {
            memberStatus = "연체중";
        } else if (currentLoans >= 2) {
            memberStatus = "대출제한";
        } else {
            memberStatus = "정상";
        }

        return MemberDetailDto.builder()
                .id(member.getId())
                .loginId(member.getLoginId())
                .name(member.getName())
                .phone(member.getPhone())
                .memo(member.getMemo())
                .role(member.getRole())
                .currentLoans((int) currentLoans)
                .overdueCount((int)overdueCount)
                .hasOverdueBooks(hasOverdueBooks)
                .memberStatus(memberStatus)
                .currentLoanList(currentLoanList)
                .loanHistory(loanHistory)
                .totalLoanCount(member.getLoans().size())
                .build();
    }

    private MemberResponseDto convertToDto(Member member) {
        // 현재 대출 중인 도서 수와 연체 여부 계산
        long currentLoans = loanRepository.countByMemberIdAndStatusIn(member.getId(), List.of('L', 'O'));
        boolean hasOverdueBooks = loanRepository.existsByMemberIdAndStatus(member.getId(), 'O');

        return MemberResponseDto.builder()
                .id(member.getId())
                .loginId(member.getLoginId())
                .phone(member.getPhone())
                .memo(member.getMemo())
                .role(member.getRole())
                .currentLoans((int)currentLoans)
                .hasOverdueBooks(hasOverdueBooks)
                .build();
    }

    private LoanHistoryDto convertToLoanHistoryDto(Loan loan) {
        return LoanHistoryDto.builder()
                .id(loan.getId())
                .bookTitle(loan.getBook().getTitle())
                .bookAuthor(loan.getBook().getAuthor())
                .memberLoginId(loan.getMember().getLoginId())
                .loanDate(loan.getLoanDate())
                .returnDate(loan.getReturnDate())
                .realReturnDate(loan.getRealReturnDate())
                .status(loan.getStatus())
                .statusDescription(loan.getStatusDescription())
                .isOverdue(loan.isOverdue())
                .build();
    }
}
