package com.example.backend.model;

import lombok.Data;

@Data
public class GhnResponseWrapper<T> {
    private Integer code;
    private String message;
    private T data;
}
