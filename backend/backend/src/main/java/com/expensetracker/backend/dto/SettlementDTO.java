package com.expensetracker.backend.dto;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SettlementDTO {
    private String from;
    private String to;
    private double amount;
}