package com.example.jihoonlibary_back.dto;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MemberJoinDto {
    private String loginId;
    private String password;
    private String name;
    private String phone;
    private String memo;
    private String role;
}
