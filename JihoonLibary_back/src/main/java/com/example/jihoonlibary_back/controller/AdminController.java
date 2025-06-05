package com.example.jihoonlibary_back.controller;

import com.example.jihoonlibary_back.dto.*;
import com.example.jihoonlibary_back.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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


    // 모든 사용자 조회 (페이징)
    @GetMapping("/members")
    public ResponseEntity<Page<MemberResponseDto>> getAllMembers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection) {

        Sort sort = Sort.by(
                sortDirection.equals("desc") ? Sort.Direction.DESC : Sort.Direction.ASC,
                sortBy
        );
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<MemberResponseDto> members = memberService.getAllMembers(pageable);
        return ResponseEntity.ok(members);
    }

    // 사용자 상세 조회 (대출 현황 포함)
    @GetMapping("/members/{memberId}")
    public ResponseEntity<MemberDetailDto> getMemberDetail(@PathVariable Long memberId) {
        try {
            MemberDetailDto memberDetail = memberService.getMemberDetail(memberId);
            return ResponseEntity.ok(memberDetail);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
