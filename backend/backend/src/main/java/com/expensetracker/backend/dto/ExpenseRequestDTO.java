package com.expensetracker.backend.dto;

import lombok.Data;

@Data
public class ExpenseRequestDTO {
    private double amount;
    private String paidByName;
    private Long groupId;
    private String description;
}