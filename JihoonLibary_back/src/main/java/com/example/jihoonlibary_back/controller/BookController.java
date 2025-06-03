package com.example.jihoonlibary_back.controller;


import com.example.jihoonlibary_back.dto.BookCreateDto;
import com.example.jihoonlibary_back.dto.BookDto;
import com.example.jihoonlibary_back.dto.BookUpdateDto;
import com.example.jihoonlibary_back.service.BookService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class BookController {
    private final BookService bookService;
    // 관리자 용 api
    @PostMapping("/admin/books")
    public ResponseEntity<BookDto> createBook(@RequestBody BookCreateDto bookCreateDto) {
        try {
            BookDto bookDto = bookService.createBook(bookCreateDto);
            return ResponseEntity.ok(bookDto);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // 도서 수정 (관리자만)
    @PutMapping("/admin/books/{bookId}")
    public ResponseEntity<BookDto> updateBook(@PathVariable Long bookId,
                                              @RequestBody BookUpdateDto bookUpdateDto) {
        try {
            BookDto bookDto = bookService.updateBook(bookId, bookUpdateDto);
            return ResponseEntity.ok(bookDto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // 도서 삭제 
    @DeleteMapping("/admin/books/{bookId}")
    public ResponseEntity<Void> deleteBook(@PathVariable Long bookId) {
        try {
            bookService.deleteBook(bookId);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
