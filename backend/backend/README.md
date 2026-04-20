# Smart Expense Tracker Backend API

This document describes the REST API for the Smart Expense Tracker backend Spring Boot application.

Base URL: `http://localhost:8080`

## Overview

The backend exposes endpoints for managing users, groups, expenses, group settlement information, and QR-based UPI payment links.

## JWT Authentication

The backend uses JWT-based authentication for protected group and expense endpoints.

- Login endpoint: `POST /auth/login`
- Request body: email and password
- Response: JWT token string
- Use token in `Authorization` header for protected requests:
  - `Authorization: Bearer <token>`

## Endpoints

### 1. Create User

- Method: `POST`
- URL: `/users`
- Description: Create a new user record.

#### Request Body
```json
{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "password123",
  "upiId": "alice@upi"
}
```

#### Response Example
```json
{
  "id": 1,
  "name": "Alice",
  "email": "alice@example.com",
  "upiId": "alice@upi"
}
```

> Note: Passwords must never appear in API responses. In production, passwords should be stored securely hashed and excluded from response DTOs.

---

### 2. Create Group

- Method: `POST`
- URL: `/groups`
- Description: Create a group and associate existing users as members.

#### Request Body
```json
{
  "name": "Weekend Trip",
  "members": [
    { "id": 1 },
    { "id": 2 },
    { "id": 3 }
  ]
}
```

#### Response Example
```json
{
  "id": 1,
  "name": "Weekend Trip",
  "members": [
    {
      "id": 1,
      "name": "Alice",
      "email": "alice@example.com",
      "upiId": "alice@upi"
    },
    {
      "id": 2,
      "name": "Bob",
      "email": "bob@example.com",
      "upiId": "bob@upi"
    },
    {
      "id": 3,
      "name": "Charlie",
      "email": "charlie@example.com",
      "upiId": "charlie@upi"
    }
  ]
}
```

> Note: The group creation logic resolves member `id` values to full user objects before saving. Passwords are excluded from responses.

---

### 3. Add Expense

- Method: `POST`
- URL: `/expenses`
- Description: Add an expense in a group. The controller calculates equal split amounts across the provided users.

#### Request Body
```json
{
  "amount": 1200.0,
  "paidBy": { "id": 1 },
  "group": { "id": 1 },
  "splits": [
    { "user": { "id": 1 } },
    { "user": { "id": 2 } },
    { "user": { "id": 3 } }
  ]
}
```

#### Response Example
```json
{
  "id": 1,
  "amount": 1200.0,
  "paidBy": {
    "id": 1,
    "name": "Alice",
    "email": "alice@example.com",
    "upiId": "alice@upi"
  },
  "group": {
    "id": 1,
    "name": "Weekend Trip",
    "members": [
      { "id": 1, "name": "Alice", "email": "alice@example.com", "upiId": "alice@upi" },
      { "id": 2, "name": "Bob", "email": "bob@example.com", "upiId": "bob@upi" },
      { "id": 3, "name": "Charlie", "email": "charlie@example.com", "upiId": "charlie@upi" }
    ]
  },
  "splits": [
    {
      "id": 1,
      "amountOwed": 400.0,
      "user": {
        "id": 1,
        "name": "Alice",
        "email": "alice@example.com",
        "upiId": "alice@upi"
      }
    },
    {
      "id": 2,
      "amountOwed": 400.0,
      "user": {
        "id": 2,
        "name": "Bob",
        "email": "bob@example.com",
        "upiId": "bob@upi"
      }
    },
    {
      "id": 3,
      "amountOwed": 400.0,
      "user": {
        "id": 3,
        "name": "Charlie",
        "email": "charlie@example.com",
        "upiId": "charlie@upi"
      }
    }
  ]
}
```

> Note: Expense splits are normalized to equal shares by the backend and stored with `amountOwed` on each split. Passwords are not returned in API responses.

---

### 4. Get Group Balances

- Method: `GET`
- URL: `/groups/{groupId}/balances`
- Description: Retrieve the net balance for each member of a group.

#### Response Example
```json
{
  "Alice": 800.0,
  "Bob": -400.0,
  "Charlie": -400.0
}
```

> Positive balances indicate the user is owed money. Negative balances indicate the user owes money.

---

### 5. Get Settlement Recommendations

- Method: `GET`
- URL: `/groups/{groupId}/settle`
- Description: Return a minimal set of payment instructions to settle debts within the group.

#### Response Example
```json
[
  {
    "from": "Bob",
    "to": "Alice",
    "amount": 400.0
  },
  {
    "from": "Charlie",
    "to": "Alice",
    "amount": 400.0
  }
]
```

> Settlement output is returned as a structured DTO list for easier client integration.

---

### 6. Add Member to Group

- Method: `POST`
- URL: `/groups/{groupId}/add-member/{userId}`
- Description: Add an existing user to an existing group.

#### Response Example
```json
{
  "id": 1,
  "name": "Weekend Trip",
  "members": [
    { "id": 1, "name": "Alice", "email": "alice@example.com", "upiId": "alice@upi" },
    { "id": 2, "name": "Bob", "email": "bob@example.com", "upiId": "bob@upi" },
    { "id": 3, "name": "Charlie", "email": "charlie@example.com", "upiId": "charlie@upi" },
    { "id": 4, "name": "Dave", "email": "dave@example.com", "upiId": "dave@upi" }
  ]
}
```

---

### 7. Get Group Join Link

- Method: `GET`
- URL: `/groups/{groupId}/join-link`
- Description: Retrieve a shareable group join link for a given group.

#### Response Example
```json
"http://localhost:3000/join?groupId=1"
```

---

### 8. Generate Group Join QR

- Method: `GET`
- URL: `/groups/{groupId}/qr`
- Description: Generate a QR code image for the group join link.

> This endpoint returns binary PNG content suitable for rendering or download by the client.

---

### 9. Generate Payment QR (UPI)

- Method: `GET`
- URL: `/groups/{groupId}/payment-qr`
- Description: Generate a UPI payment QR code for the group's payee.

> This endpoint returns binary PNG content for UPI payment scanning.

## Data Models

### User
- `id` (Long)
- `name` (String)
- `email` (String)
- `upiId` (String)

### Group
- `id` (Long)
- `name` (String)
- `members` (List<User>)

### Expense
- `id` (Long)
- `amount` (Double)
- `paidBy` (User)
- `group` (Group)
- `splits` (List<ExpenseSplit>)

### ExpenseSplit
- `id` (Long)
- `amountOwed` (Double)
- `user` (User)

## Notes

- The backend currently uses JPA entity serialization directly for API responses.
- Protected endpoints require a valid JWT in the `Authorization` header.
- Passwords are not shown in API responses and should be stored securely hashed in production.
- The current controllers do not provide custom error payloads; missing entities may return runtime errors.
- QR endpoints return PNG image content for client rendering or download.

## Running the Application

From the `backend/backend` folder:

```bash
./mvnw spring-boot:run
```

Or build the jar first and then run:

```bash
./mvnw clean package
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

After startup, the API is available at `http://localhost:8080`.
