# Transaction Ledger API — Backend

## Requirements
- Java 17+
- Maven 3.8+
- MySQL 8+

## Setup
1. Create the database:
   ```sql
   CREATE DATABASE transaction_ledger;
   ```
2. Update `src/main/resources/application.properties` with your MySQL username/password.
3. Run from this directory:
   ```bash
   mvn spring-boot:run
   ```
API base URL: `http://localhost:8080/api`

## Endpoints
- `POST /api/accounts` body: `{"name":"Praveen"}`
- `GET /api/accounts`
- `GET /api/accounts/{id}/balance`
- `POST /api/accounts/{id}/transactions` body: `{"type":"CREDIT","amount":100.00,"description":"Opening credit","referenceId":"REF-001"}`
- `GET /api/accounts/{id}/transactions?type=CREDIT&page=0&limit=10`

Transaction types are `CREDIT` and `DEBIT`. The reference ID is unique per account. Page numbers start at 0.
This project is an assessment starter, not a production banking system. Add authentication, rate limits, audit/monitoring, and stronger operational controls before production use.
