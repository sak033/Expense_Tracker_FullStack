package com.expensetracker.backend.dto;

import java.util.List;

public class CreateGroupRequest {
    private String name;
    private List<Long> userIds;

    // getters and setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public List<Long> getUserIds() { return userIds; }
    public void setUserIds(List<Long> userIds) { this.userIds = userIds; }
}