package com.example.jihoonlibary_back.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MemberUpdateDto {
    private String phone;
    private String memo;
    private String role;
}
