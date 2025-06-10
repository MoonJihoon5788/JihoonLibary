package com.example.jihoonlibary_back.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookDetailDto {
    private Long id;
    private String title;
    private String author;
    private String publisher;
    private LocalDate publicationYear;
    private Integer price;
    private Character status; // 'A'vailable, 'L'oaned
    private boolean isLoaned; // 대출 여부
    private boolean isAvailable; // 대출 가능 여부
    private String loanStatus; // "대출가능", "대출불가"
    private List<LoanHistoryDto> loanHistory;
}
