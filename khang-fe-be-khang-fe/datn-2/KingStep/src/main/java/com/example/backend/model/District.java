package com.example.backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class District {
    @JsonProperty("DistrictID")
    private Integer districtID;

    @JsonProperty("DistrictName")
    private String districtName;
}

