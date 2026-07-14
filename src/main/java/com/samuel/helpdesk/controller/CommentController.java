package com.samuel.helpdesk.controller;

import com.samuel.helpdesk.dto.CommentRequest;
import com.samuel.helpdesk.dto.CommentResponse;
import com.samuel.helpdesk.service.CommentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets/{ticketId}/comments")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @PostMapping
    public ResponseEntity<CommentResponse> create(@PathVariable Long ticketId, @Valid @RequestBody CommentRequest request) {
        CommentResponse response = commentService.create(ticketId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<CommentResponse>> findByTicketId(@PathVariable Long ticketId) {
        List<CommentResponse> response = commentService.findByTicketId(ticketId);
        return ResponseEntity.ok(response);
    }
}
