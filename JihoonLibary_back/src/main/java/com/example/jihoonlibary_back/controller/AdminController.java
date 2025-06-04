package com.example.jihoonlibary_back.controller;

import com.example.jihoonlibary_back.dto.MemberDto;
import com.example.jihoonlibary_back.dto.MemberJoinDto;
import com.example.jihoonlibary_back.dto.MemberResponseDto;
import com.example.jihoonlibary_back.dto.MemberUpdateDto;
import com.example.jihoonlibary_back.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    // 회원 수정
    @PutMapping("/members/{memberId}")
    public ResponseEntity<MemberResponseDto> updateMember(@PathVariable Long memberId,
                                                          @RequestBody MemberUpdateDto updateDto) {
        try {
            MemberResponseDto memberDto = memberService.updateMember(memberId, updateDto);
            return ResponseEntity.ok(memberDto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // 회원 삭제
    @DeleteMapping("/members/{memberId}")
    public ResponseEntity<Void> deleteMember(@PathVariable Long memberId) {
        try {
            memberService.deleteMember(memberId);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
