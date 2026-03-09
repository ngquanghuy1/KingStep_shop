package com.example.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController

@RequestMapping("/api")

public class HelloSportLine {

    @GetMapping("/hello")
    public Map<String, String> hello() {
        Map<String, String> map = new HashMap<String, String>();
        map.put("message", "Hello World");
        return map;
    }


}
