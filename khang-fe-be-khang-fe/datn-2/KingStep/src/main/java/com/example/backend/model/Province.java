package com.example.backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class Province {
    @JsonProperty("ProvinceID")
    private Integer provinceID;

    @JsonProperty("ProvinceName")
    private String provinceName;
}