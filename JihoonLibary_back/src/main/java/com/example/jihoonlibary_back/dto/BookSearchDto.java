package com.example.jihoonlibary_back.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookSearchDto {
    private String keyword;
    private String searchType; // "title", "author", "publisher", "all"
    private String sortBy; // "title", "author", "publicationYear"
    private String sortDirection; // "asc", "desc"
    private int page = 0;
    private int size = 10;
}
