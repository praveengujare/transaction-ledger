package com.example.ledger.dto;

import com.example.ledger.entity.Account;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AccountResponse(Long id, String name, BigDecimal balance, LocalDateTime createdAt) {
    public static AccountResponse from(Account a) {
        return new AccountResponse(a.getId(), a.getName(), a.getBalance(), a.getCreatedAt());
    }
}
