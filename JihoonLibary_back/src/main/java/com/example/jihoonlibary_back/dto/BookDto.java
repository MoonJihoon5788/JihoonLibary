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
public class BookDto {
    private Long id;
    private String title;
    private String author;
    private String publisher;
    private LocalDate publicationYear;
    private Integer price;
    private Character status; // 'A'vailable, 'L'oaned
    private boolean isLoaned; // 대출 여부
}
