package com.example.jihoonlibary_back.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberResponseDto {
    private Long id;
    private String loginId;
    private String phone;
    private String memo;
    private String role;
    private int currentLoans; // 현재 대출 중인 도서 수
    private boolean hasOverdueBooks; // 연체 도서 여부
}
