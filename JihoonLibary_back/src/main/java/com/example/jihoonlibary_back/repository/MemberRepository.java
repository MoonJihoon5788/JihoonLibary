package com.example.jihoonlibary_back.repository;

import com.example.jihoonlibary_back.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;


@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {
    Optional<Member> findByLoginId(String id);

    Optional<Member> findByPhone(String number);
}
