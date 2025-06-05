package com.example.jihoonlibary_back.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MemberUpdateDto {
    private String loginId;
    private String password;
    private String phone;
    private String memo;
    private String role;
    // 사용자의 이름은 변경이 불가능하다 생각해서 변경 하지 않음
}
