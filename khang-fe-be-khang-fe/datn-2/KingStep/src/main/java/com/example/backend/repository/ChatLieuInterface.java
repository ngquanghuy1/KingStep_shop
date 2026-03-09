package com.example.backend.repository;

import com.example.backend.entity.ChatLieu;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChatLieuInterface extends JpaRepository<ChatLieu,Integer> {
    List<ChatLieu> findAllByTrangThai(Integer trangThai);
    Optional<ChatLieu> findByTenChatLieuIgnoreCase(String tenChatLieu);
}
