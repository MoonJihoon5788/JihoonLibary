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
    private LocalDate loanDate;

    @Column(nullable = false)
    private LocalDate returnDate; //반납 예정일

    private LocalDate realReturnDate; // 실제 반납일

    // 반납 상태 'L'oan 'O'ver 'R'eturn
    @Column(nullable = false)
    private Character status;

    @ManyToOne
    @JoinColumn(name="b_id")
    private Book book;

    @ManyToOne
    @JoinColumn(name="m_id")
    private Member member;


    // 대출 처리
    public static Loan createLoan(Book book, Member member) {
        LocalDate today = LocalDate.now();
        LocalDate returnDate = today.plusDays(15); // 15일
        return Loan.builder()
                .book(book)
                .member(member)
                .loanDate(today)
                .returnDate(returnDate)
                .status('L') // Loan
                .build();
    }

    // 반납 처리
    public void returnBook() {
        if (this.status.equals('R')) {
            throw new IllegalStateException("이미 반납된 책입니다.");
        }
        this.status = 'R';
        this.realReturnDate = LocalDate.now();
    }
    // 연체 상태로 변경
    public void updateStatus(Character status) {
        this.status = status;
    }

    // 날짜로 연체 주인거 확인
    public boolean isOverdueByDate() {
        if (this.status.equals('R')) {
            return this.realReturnDate.isAfter(this.returnDate);
        } else {
            return LocalDate.now().isAfter(this.returnDate);
        }
    }

    // 연체 여부 확인
    public boolean isOverdue() {
        return this.status.equals('O') || isOverdueByDate();
    }

    // 현제 대출
    public boolean currentLoan() {
        return this.status.equals('L') || this.status.equals('O');
    }

    public String getStatusDescription() {
        return switch (this.status) {
            case 'L' -> "대출중";
            case 'O' -> "연체";
            case 'R' -> "반납완료";
            default -> "알수없음";
        };
    }
}
