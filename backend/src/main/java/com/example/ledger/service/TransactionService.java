package com.example.ledger.service;

import com.example.ledger.dto.*;
import com.example.ledger.entity.*;
import com.example.ledger.exception.ApiException;
import com.example.ledger.repository.*;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class TransactionService {
    private final AccountRepository accounts;
    private final TransactionRepository transactions;

    public TransactionService(AccountRepository accounts, TransactionRepository transactions) {
        this.accounts = accounts;
        this.transactions = transactions;
    }

    @Transactional
    public TransactionResponse create(Long accountId, CreateTransactionRequest request) {
        Account account = accounts.findByIdForUpdate(accountId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Account not found: " + accountId));

        if (transactions.existsByAccount_IdAndReferenceId(accountId, request.referenceId().trim())) {
            throw new ApiException(HttpStatus.CONFLICT, "Transaction already exists for this reference ID");
        }

        BigDecimal amount = request.amount();
        BigDecimal newBalance;
        if (request.type() == TransactionType.CREDIT) {
            newBalance = account.getBalance().add(amount);
        } else {
            if (account.getBalance().compareTo(amount) < 0) {
                throw new ApiException(HttpStatus.CONFLICT, "Insufficient balance");
            }
            newBalance = account.getBalance().subtract(amount);
        }

        account.setBalance(newBalance);
        accounts.save(account); // save madtyti account
        
//        but save the transation and wipe out sql 
        LedgerTransaction tx = new LedgerTransaction(account, request.type(), amount,
            request.description().trim(), request.referenceId().trim());
        return TransactionResponse.from(transactions.saveAndFlush(tx));
    }
    
    
    
    

    @Transactional(readOnly = true)
    public Map<String, Object> history(Long accountId, TransactionType type, int page, int limit) {
    	
        if (!accounts.existsById(accountId)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Account not found: " + accountId);
        }
        
        if (page < 0) {
        	throw new ApiException(HttpStatus.BAD_REQUEST, "Page must be zero or greater");
        	
        }
        if 
        (limit < 1 || limit > 100) {
        	throw new ApiException(HttpStatus.BAD_REQUEST, "Limit must be between 1 and 100");
        }
        
        Pageable pageable = PageRequest.of(page, limit, 
        		Sort.by(Sort.Direction.DESC, "createdAt").and(Sort.by(Sort.Direction.DESC, "id")));
        
        
        Page<LedgerTransaction> result = type == null
        	? transactions.findByAccount_Id(accountId, pageable)
            : transactions.findByAccount_IdAndType(accountId, type, pageable);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("content", result.getContent().stream().map(TransactionResponse::from).toList());
        response.put("currentPage", result.getNumber());
        response.put("pageSize", result.getSize());
        response.put("totalRecords", result.getTotalElements());
        response.put("totalPages", result.getTotalPages());
        response.put("hasNext", result.hasNext());
        response.put("hasPrevious", result.hasPrevious());
        return response;
    }

    
    
    
    @Transactional(readOnly = true)
    public Map<String, Object> balance(Long accountId) {
        Account account = accounts.findById(accountId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Account not found: " + accountId));
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("accountId", account.getId());
        response.put("balance", account.getBalance());
        return response;
    }
}
