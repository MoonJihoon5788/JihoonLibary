package com.example.jihoonlibary_back.repository;

import com.example.jihoonlibary_back.entity.Book;
import com.example.jihoonlibary_back.entity.Loan;
import com.example.jihoonlibary_back.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;


@Repository
public interface LoanRepository extends JpaRepository<Loan, Long> {
    long countByMemberAndStatusIn(Member member, List<Character> statuses);
    boolean existsByMemberAndStatus(Member member, Character status);
    Optional<Loan> findByBookAndMemberAndStatusIn(Book book, Member member, List<Character> statuses);
    List<Loan> findByStatusAndReturnDateBefore(Character status, LocalDate date);
}
