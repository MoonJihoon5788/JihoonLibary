package com.example.jihoonlibary_back.repository;

import com.example.jihoonlibary_back.entity.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BookRepository  extends JpaRepository<Book, Long> {
    // 제목으로 검색
    Page<Book> findByTitleContainingIgnoreCase(String title, Pageable pageable);

    // 저자로 검색
    Page<Book> findByAuthorContainingIgnoreCase(String author, Pageable pageable);

    // 출판사로 검색
    Page<Book> findByPublisherContainingIgnoreCase(String publisher, Pageable pageable);

    // 전체 검색 (제목, 저자, 출판사)
    Page<Book> findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCaseOrPublisherContainingIgnoreCase(
            String title, String author, String publisher, Pageable pageable);
}
