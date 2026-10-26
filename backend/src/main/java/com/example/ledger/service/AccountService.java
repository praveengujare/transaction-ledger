package com.example.ledger.service;

import com.example.ledger.dto.*;
import com.example.ledger.entity.Account;
import com.example.ledger.exception.ApiException;
import com.example.ledger.repository.AccountRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class AccountService {
    private final AccountRepository accounts;
    
    
    //constructor ayti
    public AccountService(AccountRepository accounts) 
    { 
    	this.accounts = accounts;
    }

    
    // create  
    @Transactional
    public AccountResponse create(CreateAccountRequest request) {
        Account account = new Account();
        account.setName(request.name().trim());
        account.setBalance(java.math.BigDecimal.ZERO); // Client cannot set opening balance.
        return AccountResponse.from(accounts.save(account));
    }

    @Transactional(readOnly = true)
    public List<AccountResponse> findAll() {
        return accounts.findAll().stream().map(AccountResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public AccountResponse findById(Long id) {
        return AccountResponse.from(accounts.findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Account not found: " + id)));
    }
}
