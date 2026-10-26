package com.example.ledger.dto;

import com.example.ledger.entity.LedgerTransaction;
import com.example.ledger.entity.TransactionType;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TransactionResponse(Long id, Long accountId, TransactionType type, BigDecimal amount,
                                  String description, String referenceId, LocalDateTime createdAt) {
    public static TransactionResponse from(LedgerTransaction t) {
        return new TransactionResponse(t.getId(), t.getAccount().getId(), t.getType(), t.getAmount(),
            t.getDescription(), t.getReferenceId(), t.getCreatedAt());
    }
}
