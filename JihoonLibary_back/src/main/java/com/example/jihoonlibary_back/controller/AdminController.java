package com.example.jihoonlibary_back.controller;

import com.example.jihoonlibary_back.dto.MemberDto;
import com.example.jihoonlibary_back.dto.MemberJoinDto;
import com.example.jihoonlibary_back.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    private final MemberService memberService;

    @PostMapping("/members")
    public ResponseEntity<MemberDto> joinMember(@RequestBody MemberJoinDto memberJoinDto) {
        try {
            MemberDto memberDTO = memberService.createMember(memberJoinDto);
            return ResponseEntity.ok(memberDTO);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

}
