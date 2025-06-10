package com.example.jihoonlibary_back.service;

import com.example.jihoonlibary_back.dto.*;
import com.example.jihoonlibary_back.entity.Book;
import com.example.jihoonlibary_back.entity.Loan;
import com.example.jihoonlibary_back.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

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
        return convertToDto(savedBook);
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
        return convertToDto(savedBook);
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

    // 도서 상세 검색
    @Transactional(readOnly = true)
    public BookDetailDto getBook(Long bookId) {
        Optional<Book> optionalBook = bookRepository.findById(bookId);
        if (optionalBook.isEmpty()){
            throw new IllegalArgumentException("책을 찾을 수 없습니다.");
        }
        Book book = optionalBook.get();

        List<LoanHistoryDto> loanHistory = book.getLoans().stream()
                .sorted((l1, l2) -> l2.getLoanDate().compareTo(l1.getLoanDate()))
                .map(this::convertToLoanHistoryDto)
                .collect(Collectors.toList());

        boolean isAvailable = book.getStatus().equals('A');

        return BookDetailDto.builder()
                .id(book.getId())
                .title(book.getTitle())
                .author(book.getAuthor())
                .publisher(book.getPublisher())
                .publicationYear(book.getPublicationYear())
                .price(book.getPrice())
                .status(book.getStatus())
                .isLoaned(!isAvailable)  // A가 아니면 대출중
                .isAvailable(isAvailable)  // A면 대출가능
                .loanStatus(isAvailable ? "대출가능" : "대출불가")
                .loanHistory(loanHistory)
                .build();
    }

    // 도서 목록 조회 (페이징)
    @Transactional(readOnly = true)
    public Page<BookDto> getBooks(Pageable pageable) {
        // 정렬 정보가 있다면 필드명 매핑 적용
        if (pageable.getSort().isSorted()) {
            Sort mappedSort = Sort.unsorted();
            for (Sort.Order order : pageable.getSort()) {
                String mappedField = mapSortField(order.getProperty());
                mappedSort = mappedSort.and(Sort.by(order.getDirection(), mappedField));
            }
            pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), mappedSort);
        }

        Page<Book> books = bookRepository.findAll(pageable);
        return books.map(this::convertToDto);
    }


    // 도서 검색
    @Transactional(readOnly = true)
    public Page<BookDto> searchBooks(BookSearchDto searchDto) {
        // 정렬 필드명 매핑
        String sortField = mapSortField(searchDto.getSortBy());

        // 정렬 설정
        Sort sort = Sort.by(
                searchDto.getSortDirection().equals("desc") ? Sort.Direction.DESC : Sort.Direction.ASC,
                sortField
        );

        Pageable pageable = PageRequest.of(searchDto.getPage(), searchDto.getSize(), sort);

        Page<Book> books;
        String keyword = searchDto.getKeyword();

        switch (searchDto.getSearchType()) {
            case "title":
                books = bookRepository.findByTitleContainingIgnoreCase(keyword, pageable);
                break;
            case "author":
                books = bookRepository.findByAuthorContainingIgnoreCase(keyword, pageable);
                break;
            case "publisher":
                books = bookRepository.findByPublisherContainingIgnoreCase(keyword, pageable);
                break;
            default: // "all"
                books = bookRepository.findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCaseOrPublisherContainingIgnoreCase(
                        keyword, keyword, keyword, pageable);
                break;
        }

        return books.map(this::convertToDto);
    }

    private String mapSortField(String sortBy) {
        switch (sortBy) {
            case "publicationYear":
                return "publicationYear";
            case "title":
                return "title";
            case "author":
                return "author";
            default:
                return "title";
        }
    }

    private LoanHistoryDto convertToLoanHistoryDto(Loan loan) {
        return LoanHistoryDto.builder()
                .id(loan.getId())
                .bookTitle(loan.getBook().getTitle())
                .bookAuthor(loan.getBook().getAuthor())
                .memberLoginId(loan.getMember().getLoginId())
                .loanDate(loan.getLoanDate())
                .returnDate(loan.getReturnDate())
                .realReturnDate(loan.getRealReturnDate())
                .status(loan.getStatus())
                .statusDescription(loan.getStatusDescription())
                .isOverdue(loan.isOverdue())
                .build();
    }

    private BookDto convertToDto(Book book) {
        boolean isAvailable = book.getStatus().equals('A');

        return BookDto.builder()
                .id(book.getId())
                .title(book.getTitle())
                .author(book.getAuthor())
                .publisher(book.getPublisher())
                .publicationYear(book.getPublicationYear())
                .price(book.getPrice())
                .status(book.getStatus())
                .isLoaned(!isAvailable)  // A가 아니면 대출중
                .isAvailable(isAvailable)  // A면 대출가능
                .loanStatus(isAvailable ? "대출가능" : "대출불가")
                .build();
    }
}
