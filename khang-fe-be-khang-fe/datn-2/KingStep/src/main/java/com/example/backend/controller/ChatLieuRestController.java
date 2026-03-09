package com.example.backend.controller;

import com.example.backend.service.ChatLieuService;
import com.example.backend.entity.ChatLieu;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat-lieu")
public class ChatLieuRestController {

    @Autowired
    private ChatLieuService chatLieuService;

    @GetMapping("/getAll")
    public List<ChatLieu> getAll() {
        return chatLieuService.getAll();
    }

    @GetMapping("/getAllFull")
    public List<ChatLieu> getAllFull() {
        return chatLieuService.getAllFull();
    }

    @GetMapping("/getById/{id}")
    public ResponseEntity<?> getById(@PathVariable Integer id) {
        return chatLieuService.getById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Không tìm thấy Chất liệu với ID: " + id));
    }

    @PostMapping("/add")
    public ResponseEntity<?> create(@RequestBody ChatLieu chatLieu) {
        return chatLieuService.create(chatLieu);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> update(@PathVariable Integer id, @RequestBody ChatLieu chatLieu) {
        return chatLieuService.update(id, chatLieu);
    }
    @PutMapping("/khoi-phuc/{id}")
    public ResponseEntity<?> khoiPhucChatLieu(@PathVariable Integer id) {
        chatLieuService.khoiPhucChatLieu(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/del/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        return chatLieuService.delete(id);
    }

    @GetMapping("/getThungRac")
    public List<ChatLieu> getThungRac() {
        return chatLieuService.getThungRac();
    }
}

