package com.example.jihoonlibary_back.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberDto {
    private Long id;
    private String loginId;
    private String name;
    private String phone;
    private String memo;
    private String role;
}
