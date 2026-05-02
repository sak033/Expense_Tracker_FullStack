package com.expensetracker.backend.entity;

import jakarta.persistence.*;

@Entity
public class Settlement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fromUser;
    private String toUser;
    private double amount;

    private String status; // PENDING, PAID
    private Long groupId;

    // getters & setters
    public Long getId() { return id; }

    public String getFromUser() { return fromUser; }
    public void setFromUser(String fromUser) { this.fromUser = fromUser; }

    public String getToUser() { return toUser; }
    public void setToUser(String toUser) { this.toUser = toUser; }

    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public long getGroupId(){ return groupId;}
    public void setGroupId(long groupId) {this.groupId = groupId;}

}