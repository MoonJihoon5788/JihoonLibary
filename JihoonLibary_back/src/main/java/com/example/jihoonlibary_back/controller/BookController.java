package com.example.jihoonlibary_back.controller;


import com.example.jihoonlibary_back.dto.*;
import com.example.jihoonlibary_back.service.BookService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
    // 도서 상세 조회
    @GetMapping("/admin/books/{bookId}")
    public ResponseEntity<BookDetailDto> getBook(@PathVariable Long bookId) {
        try {
            BookDetailDto bookDetailDto = bookService.getBook(bookId);
            return ResponseEntity.ok(bookDetailDto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/user/books/search")
    public ResponseEntity<Page<BookDto>> searchBooks(
            @RequestParam(required = false, defaultValue = "") String keyword,
            @RequestParam(defaultValue = "all") String searchType,
            @RequestParam(defaultValue = "title") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        BookSearchDto searchDto = new BookSearchDto();
        searchDto.setKeyword(keyword);
        searchDto.setSearchType(searchType);
        searchDto.setSortBy(sortBy);
        searchDto.setSortDirection(sortDirection);
        searchDto.setPage(page);
        searchDto.setSize(size);

        Page<BookDto> books = bookService.searchBooks(searchDto);
        return ResponseEntity.ok(books);
    }

    @GetMapping("/user/books")
    public ResponseEntity<Page<BookDto>> getUserBooks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "title") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection) {

        Sort sort = Sort.by(
                sortDirection.equals("desc") ? Sort.Direction.DESC : Sort.Direction.ASC,
                sortBy
        );
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<BookDto> books = bookService.getBooks(pageable);
        return ResponseEntity.ok(books);
    }

}
