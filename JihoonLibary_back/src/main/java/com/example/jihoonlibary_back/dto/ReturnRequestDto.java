package com.example.jihoonlibary_back.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReturnRequestDto {
    private Long bookId;
    private Long memberId;
}