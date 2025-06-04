package com.example.jihoonlibary_back.service;

import com.example.jihoonlibary_back.dto.LoanDto;
import com.example.jihoonlibary_back.dto.LoanRequestDto;
import com.example.jihoonlibary_back.dto.ReturnRequestDto;
import com.example.jihoonlibary_back.entity.Book;
import com.example.jihoonlibary_back.entity.Loan;
import com.example.jihoonlibary_back.entity.Member;
import com.example.jihoonlibary_back.repository.BookRepository;
import com.example.jihoonlibary_back.repository.LoanRepository;
import com.example.jihoonlibary_back.repository.MemberRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class LoanService {
    private final LoanRepository loanRepository;
    private final MemberRepository memberRepository;
    private final BookRepository bookRepository;

    // 도서 대출
    public LoanDto loanBook(LoanRequestDto loanRequestDto) {
        Optional<Book> optionalBook = bookRepository.findById(loanRequestDto.getBookId());
        if (optionalBook.isEmpty()){
            throw new IllegalArgumentException("책을 찾을 수 없습니다.");
        }
        Book book = optionalBook.get();

        Optional<Member> optionalMember = memberRepository.findById(loanRequestDto.getMemberId());
        if (optionalMember.isEmpty()) {
            throw new IllegalArgumentException("사용자를 찾을수 없습니다.");
        }
        Member member = optionalMember.get();
        
        // 책의 상태 확인
        if (!book.isAvailable()) {
            throw new IllegalStateException("이미 대출 중인 책입니다.");
        }

        // 대출이 2개이상이면 대출 못하게 하기
        long currentLoans = loanRepository.countByMemberAndStatusIn(member, List.of('L', 'O'));
        if (currentLoans >= 2) {
            throw new IllegalStateException("대출 가능한 책 수를 초과했습니다.");
        }
        // 연체된 책 있는지 확인
        if (loanRepository.existsByMemberAndStatus(member, 'O')) {
            throw new IllegalStateException("연체된 책이 있어 대출할 수 없습니다.");
        }
        // 대출 처리
        Loan loan = Loan.createLoan(book, member);
        book.updateStatus('L');
        Loan savedLoan = loanRepository.save(loan);
        bookRepository.save(book);

        return convertToDto(savedLoan);
    }

    // 도서 반납
    public LoanDto returnBook(ReturnRequestDto returnRequestDto) {

        Optional<Book> optionalBook = bookRepository.findById(returnRequestDto.getBookId());
        if (optionalBook.isEmpty()){
            throw new IllegalArgumentException("책을 찾을 수 없습니다.");
        }
        Book book = optionalBook.get();

        Optional<Member> optionalMember = memberRepository.findById(returnRequestDto.getMemberId());
        if (optionalMember.isEmpty()) {
            throw new IllegalArgumentException("사용자를 찾을수 없습니다.");
        }
        Member member = optionalMember.get();

        // 대출 되어있거나 연체된책 찾기
        Optional<Loan> optionalLoan = loanRepository.findByBookAndMemberAndStatusIn(book, member, List.of('L', 'O'));
        if (optionalLoan.isEmpty()) {
            throw new IllegalArgumentException("대출을 찾을수 없습니다.");
        }
        Loan loan = optionalLoan.get();
        // 반납 처리
        loan.returnBook();
        book.updateStatus('A');
        loanRepository.save(loan);
        bookRepository.save(book);
        return convertToDto(loan);
    }

    @Scheduled(fixedRate = 60000) // 테스트때매 1분마다 스케줄링을 돌리게 했습니다.
    @Transactional
    public void updateOverdueStatus() {
        List<Loan> overdueLoans = loanRepository.findByStatusAndReturnDateBefore('L', LocalDate.now());
        for (Loan loan : overdueLoans) {
            loan.updateStatus('O');
        }
        if (!overdueLoans.isEmpty()) {
            loanRepository.saveAll(overdueLoans);
        }
    }

    private LoanDto convertToDto(Loan loan) {
        return LoanDto.builder()
                .id(loan.getId())
                .bookId(loan.getBook().getId())
                .bookTitle(loan.getBook().getTitle())
                .bookAuthor(loan.getBook().getAuthor())
                .memberId(loan.getMember().getId())
                .memberLoginId(loan.getMember().getLoginId())
                .memberPhone(loan.getMember().getPhone())
                .loanDate(loan.getLoanDate())
                .returnDate(loan.getReturnDate())
                .realReturnDate(loan.getRealReturnDate())
                .status(loan.getStatus())
                .statusDescription(loan.getStatusDescription())
                .isOverdue(loan.isOverdue())
                .build();
    }

}
