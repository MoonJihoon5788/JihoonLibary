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

    // 현재 대출 중인 도서 수 조회 (L: 대출중, O: 연체)
    long countByMemberIdAndStatusIn(Long memberId, List<Character> statuses);

    // 연체 도서 여부 확인 (O: 연체)
    boolean existsByMemberIdAndStatus(Long memberId, Character status);

    // 현재 연체 중인 도서 수 조회
    long countByMemberIdAndStatus(Long memberId, Character status);
}
