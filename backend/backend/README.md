# Smart Expense Tracker Backend API

This document describes the REST API for the Smart Expense Tracker backend Spring Boot application.

Base URL: `http://localhost:8080`

## Overview

The backend exposes endpoints for managing users, groups, expenses, and group settlement information.

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
  "password": "password123"
}
```

#### Response Example
```json
{
  "id": 1,
  "name": "Alice",
  "email": "alice@example.com",
  "password": "password123"
}
```

> Note: Password storage is currently plain text in the entity model. In production, use hashed passwords and exclude them from API responses.

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
      "password": "password123"
    },
    {
      "id": 2,
      "name": "Bob",
      "email": "bob@example.com",
      "password": "password456"
    },
    {
      "id": 3,
      "name": "Charlie",
      "email": "charlie@example.com",
      "password": "password789"
    }
  ]
}
```

> Note: The group creation logic resolves member `id` values to full user objects before saving.

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
    "password": "password123"
  },
  "group": {
    "id": 1,
    "name": "Weekend Trip",
    "members": [
      { "id": 1, "name": "Alice", "email": "alice@example.com", "password": "password123" },
      { "id": 2, "name": "Bob", "email": "bob@example.com", "password": "password456" },
      { "id": 3, "name": "Charlie", "email": "charlie@example.com", "password": "password789" }
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
        "password": "password123"
      }
    },
    {
      "id": 2,
      "amountOwed": 400.0,
      "user": {
        "id": 2,
        "name": "Bob",
        "email": "bob@example.com",
        "password": "password456"
      }
    },
    {
      "id": 3,
      "amountOwed": 400.0,
      "user": {
        "id": 3,
        "name": "Charlie",
        "email": "charlie@example.com",
        "password": "password789"
      }
    }
  ]
}
```

> Note: Expense splits are normalized to equal shares by the backend and stored with `amountOwed` on each split.

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
  "Bob pays Alice ₹400.0",
  "Charlie pays Alice ₹400.0"
]
```

> Settlement output is a list of human-readable transactions based on current group balances.

## Data Models

### User
- `id` (Long)
- `name` (String)
- `email` (String)
- `password` (String)

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
- There is no dedicated validation or custom error response handling in the current controller implementation.
- If a referenced user or group does not exist, the controller will throw an exception and return a server error.

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
