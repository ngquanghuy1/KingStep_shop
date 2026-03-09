package com.example.backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class Ward {
    @JsonProperty("WardCode")
    private String wardCode;

    @JsonProperty("WardName")
    private String wardName;
}
