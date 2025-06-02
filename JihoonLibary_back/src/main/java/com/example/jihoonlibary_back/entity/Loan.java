package com.example.jihoonlibary_back.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Loan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "l_id")
    private Long id;

    @Column(nullable = false)
    private LocalDate loan_date;

    @Column(nullable = false)
    private LocalDate return_date;
    // 반납 여부
    @Column(nullable = false)
    private Character status;

    @ManyToOne
    @JoinColumn(name="b_id")
    private Book book;

    @ManyToOne
    @JoinColumn(name="c_id")
    private Member member;

}
