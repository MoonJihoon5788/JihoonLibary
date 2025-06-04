package com.example.jihoonlibary_back.controller;

import com.example.jihoonlibary_back.dto.LoanDto;
import com.example.jihoonlibary_back.dto.LoanRequestDto;
import com.example.jihoonlibary_back.dto.ReturnRequestDto;
import com.example.jihoonlibary_back.service.LoanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class LoanController {
    private final LoanService loanService;

    // 도서 대출
    @PostMapping("/admin/loans")
    public ResponseEntity<LoanDto> loanBook(@RequestBody LoanRequestDto loanRequestDto) {
        try {
            LoanDto loanDto = loanService.loanBook(loanRequestDto);
            return ResponseEntity.ok(loanDto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // 도서 반납
    @PostMapping("/admin/returns")
    public ResponseEntity<LoanDto> returnBook(@RequestBody ReturnRequestDto returnRequestDto) {
        try {
            LoanDto loanDto = loanService.returnBook(returnRequestDto);
            return ResponseEntity.ok(loanDto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
