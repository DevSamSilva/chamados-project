package com.samuel.helpdesk.repository;

import com.samuel.helpdesk.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByTicketIdOrderByDataCriacaoAsc(Long ticketId);
}
