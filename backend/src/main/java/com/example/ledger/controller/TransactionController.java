package com.example.ledger.controller;

import com.example.ledger.dto.*;
import com.example.ledger.entity.TransactionType;
import com.example.ledger.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/accounts/{accountId}")
@CrossOrigin(origins = "http://localhost:5173")
public class TransactionController {
    private final TransactionService service;
    public TransactionController(TransactionService service) { this.service = service; }

    @GetMapping("/balance")
    public Map<String, Object> balance(@PathVariable Long accountId) {
        return service.balance(accountId);
    }

    @PostMapping("/transactions")
    public ResponseEntity<TransactionResponse> create(@PathVariable Long accountId,
            @Valid @RequestBody CreateTransactionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(accountId, request));
    }

    @GetMapping("/transactions")
    public Map<String, Object> history(@PathVariable Long accountId,
            @RequestParam(required = false) TransactionType type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int limit) {
        return service.history(accountId, type, page, limit);
    }
}
