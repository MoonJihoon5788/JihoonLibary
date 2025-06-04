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
public class LoanHistoryDto {
    private Long id;
    private String bookTitle;
    private String bookAuthor;
    private String memberLoginId;
    private LocalDate loanDate;
    private LocalDate returnDate;
    private LocalDate realReturnDate;
    private Character status;
    private String statusDescription;
    private boolean isOverdue;
}