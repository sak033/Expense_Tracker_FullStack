package com.expensetracker.backend.dto;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GroupDTO {

    private Long id;
    private String name;
    private int memberCount;
    private String imageUrl;
}