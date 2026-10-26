package com.example.ledger.controller;

import com.example.ledger.dto.*;
import com.example.ledger.service.AccountService;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@CrossOrigin(origins = "http://localhost:5173") 
public class AccountController {
    private final AccountService service;
    public AccountController(AccountService service) { this.service = service; }

    //create madak
    @PostMapping
    public ResponseEntity<AccountResponse> create(@Valid @RequestBody CreateAccountRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    
    // get all id 
    @GetMapping
    public List<AccountResponse> all() { 
    	return service.findAll(); 
    	}
//get id only with primary keyn or id
    @GetMapping("/{id}")
    public AccountResponse byId(@PathVariable Long id) { 
    	return service.findById(id); 
    	}
}
