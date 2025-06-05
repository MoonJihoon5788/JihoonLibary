package com.example.jihoonlibary_back.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberDetailDto {
    private Long id;
    private String loginId;
    private String name;
    private String phone;
    private String memo;
    private String role;

    // 대출 현황 정보
    private int currentLoans;           // 현재 대출 중인 도서 수
    private int overdueCount;           // 연체 중인 도서 수
    private boolean hasOverdueBooks;    // 연체 도서 여부
    private String memberStatus;        // "정상", "연체중", "대출제한" 등

    // 현재 대출 중인 도서 목록
    private List<LoanHistoryDto> currentLoanList;

    // 전체 대출 이력
    private List<LoanHistoryDto> loanHistory;

    // 통계 정보
    private int totalLoanCount;         // 총 대출 횟수
}