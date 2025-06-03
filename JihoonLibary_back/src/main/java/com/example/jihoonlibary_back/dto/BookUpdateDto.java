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
public class BookUpdateDto {
    private String title;
    private String author;
    private String publisher;
    private LocalDate publicationYear;
    private Integer price;
}
