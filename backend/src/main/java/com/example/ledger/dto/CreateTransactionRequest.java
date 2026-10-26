package com.example.ledger.dto;

import com.example.ledger.entity.TransactionType;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record CreateTransactionRequest(
    @NotNull(message = "Type is required") TransactionType type,
    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
    @Digits(integer = 17, fraction = 2, message = "Amount supports at most 2 decimal places")
    BigDecimal amount,
    @NotBlank(message = "Description is required")
    @Size(max = 255, message = "Description must be at most 255 characters")
    String description,
    @NotBlank(message = "Reference ID is required")
    @Size(max = 100, message = "Reference ID must be at most 100 characters")
    String referenceId
) {}
