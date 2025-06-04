package com.example.jihoonlibary_back.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoanDto {
    private Long id;
    private Long bookId;
    private String bookTitle;
    private String bookAuthor;
    private Long memberId;
    private String memberLoginId;
    private String memberPhone;
    private LocalDate loanDate;
    private LocalDate returnDate;
    private LocalDate realReturnDate;
    private Character status;
    private String statusDescription;
    private boolean isOverdue;      // 연체 여부
}
