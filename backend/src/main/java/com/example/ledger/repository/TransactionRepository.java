package com.example.ledger.repository;

import com.example.ledger.entity.LedgerTransaction;
import com.example.ledger.entity.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransactionRepository extends JpaRepository<LedgerTransaction, Long> {
    boolean existsByAccount_IdAndReferenceId(Long accountId, String referenceId);
    Page<LedgerTransaction> findByAccount_Id(Long accountId, Pageable pageable);
    Page<LedgerTransaction> findByAccount_IdAndType(Long accountId, TransactionType type, Pageable pageable);
}
