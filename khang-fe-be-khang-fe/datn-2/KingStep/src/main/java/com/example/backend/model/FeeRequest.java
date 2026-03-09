package com.example.backend.model;

import lombok.Data;

@Data
public class FeeRequest {
    private int serviceTypeId;
    private int insuranceValue;
    private int fromDistrict;
    private int toDistrict;
    private String toWardCode;
    private int height;
    private int length;
    private int weight;
    private int width;
}
