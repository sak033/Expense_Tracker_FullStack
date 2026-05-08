package com.expensetracker.backend.dto;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SettlementDTO {

    private Long id;

    private String from;

    private String to;

    private double amount;
}