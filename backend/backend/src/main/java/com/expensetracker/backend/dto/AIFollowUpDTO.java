package com.expensetracker.backend.dto;

import lombok.Data;

@Data
public class AIFollowUpDTO {

    private String question;

    private String previousExplanation;
}