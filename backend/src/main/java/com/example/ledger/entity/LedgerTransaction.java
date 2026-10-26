package com.example.ledger.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions",
       uniqueConstraints = @UniqueConstraint(name = "uk_transaction_account_reference",
           columnNames = {"account_id", "reference_id"}),
       indexes = @Index(name = "idx_transaction_account_created", columnList = "account_id, created_at"))
public class LedgerTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "account_id", nullable = false, updatable = false)
    private Account account;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10, updatable = false)
    private TransactionType type;

    @Column(nullable = false, precision = 19, scale = 2, updatable = false)
    private BigDecimal amount;

    @Column(nullable = false, length = 255, updatable = false)
    private String description;

    @Column(name = "reference_id", nullable = false, length = 100, updatable = false)
    private String referenceId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    protected LedgerTransaction() {}

    public LedgerTransaction(Account account, TransactionType type, BigDecimal amount,
                             String description, String referenceId) {
        this.account = account;
        this.type = type;
        this.amount = amount;
        this.description = description;
        this.referenceId = referenceId;
    }

    @PrePersist
    void beforeInsert() { createdAt = LocalDateTime.now(); }

    public Long getId() { return id; }
    public Account getAccount() { return account; }
    public TransactionType getType() { return type; }
    public BigDecimal getAmount() { return amount; }
    public String getDescription() { return description; }
    public String getReferenceId() { return referenceId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
