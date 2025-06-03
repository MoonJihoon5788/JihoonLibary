package com.example.jihoonlibary_back.service;

import com.example.jihoonlibary_back.dto.BookCreateDto;
import com.example.jihoonlibary_back.dto.BookDto;
import com.example.jihoonlibary_back.dto.BookUpdateDto;
import com.example.jihoonlibary_back.entity.Book;
import com.example.jihoonlibary_back.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class BookService {
    private final BookRepository bookRepository;

    // 도서 등록
    public BookDto createBook(BookCreateDto bookCreateDto) {
        Book book = Book.builder()
                .title(bookCreateDto.getTitle())
                .author(bookCreateDto.getAuthor())
                .publisher(bookCreateDto.getPublisher())
                .publicationYear(bookCreateDto.getPublicationYear())
                .price(bookCreateDto.getPrice())
                .status('A') // Available
                .build();

        Book savedBook = bookRepository.save(book);
        return BookDto.builder().
                id(savedBook.getId()).
                title(savedBook.getTitle()).
                author(savedBook.getAuthor()).
                publisher(savedBook.getPublisher()).
                publicationYear(savedBook.getPublicationYear()).
                price(savedBook.getPrice()).
                status(savedBook.getStatus()).
                isLoaned(false)
                .build();
    }

    public BookDto updateBook(Long bookId, BookUpdateDto bookUpdateDto) {
        Optional<Book> optionalBook = bookRepository.findById(bookId);
        if (optionalBook.isEmpty()){
            throw new IllegalArgumentException("책을 찾을 수 없습니다.");
        }
        Book book = optionalBook.get();

        // 도서 정보 업데이트
        book.updateBook(
                bookUpdateDto.getTitle(),
                bookUpdateDto.getAuthor(),
                bookUpdateDto.getPublisher(),
                bookUpdateDto.getPublicationYear(),
                bookUpdateDto.getPrice()
        );

        Book savedBook = bookRepository.save(book);
        return BookDto.builder().
                id(savedBook.getId()).
                title(savedBook.getTitle()).
                author(savedBook.getAuthor()).
                publisher(savedBook.getPublisher()).
                publicationYear(savedBook.getPublicationYear()).
                price(savedBook.getPrice()).
                status(savedBook.getStatus()).
                isLoaned(savedBook.isAvailable())
                .build();
    }

    // 도서 삭제
    public void deleteBook(Long bookId) {
        Optional<Book> optionalBook = bookRepository.findById(bookId);
        if (optionalBook.isEmpty()){
            throw new IllegalArgumentException("책을 찾을 수 없습니다.");
        }
        Book book = optionalBook.get();

        // 대출 중인 도서는 삭제 불가
        if (book.getStatus().equals('L')) {
            throw new IllegalStateException("대출 중인 책은 삭제할 수 없습니다.");
        }
        bookRepository.delete(book);
    }
}
