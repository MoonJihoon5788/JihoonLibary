package com.example.jihoonlibary_back.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Book {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "b_id")
    private Long id;

    @Column(nullable = false , length = 30)
    private String title;

    @Column(nullable = false, length = 20)
    private String author;

    @Column(nullable = false, length = 20)
    private String publisher;
    @Column(nullable = false)
    private LocalDate publication_year;
    @Column(nullable = false)
    private Integer price;
    //도서 상태
    @Column(nullable = false)
    private Character status;

    @OneToMany(mappedBy = "book", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Loan> loans = new ArrayList<>();
}
