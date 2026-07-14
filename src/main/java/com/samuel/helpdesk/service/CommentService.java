package com.samuel.helpdesk.service;

import com.samuel.helpdesk.dto.CommentRequest;
import com.samuel.helpdesk.dto.CommentResponse;
import com.samuel.helpdesk.entity.Comment;
import com.samuel.helpdesk.entity.Ticket;
import com.samuel.helpdesk.entity.User;
import com.samuel.helpdesk.exception.ResourceNotFoundException;
import com.samuel.helpdesk.mapper.CommentMapper;
import com.samuel.helpdesk.repository.CommentRepository;
import com.samuel.helpdesk.repository.TicketRepository;
import com.samuel.helpdesk.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    public CommentService(CommentRepository commentRepository, TicketRepository ticketRepository, UserRepository userRepository) {
        this.commentRepository = commentRepository;
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
    }

    public CommentResponse create(Long ticketId, CommentRequest request) {
        Ticket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new ResourceNotFoundException("Ticket não encontrado com id: " + ticketId));
        User usuario = userRepository.findById(request.usuarioId())
            .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com id: " + request.usuarioId()));
        Comment comment = new Comment();
        comment.setConteudo(request.conteudo());
        comment.setTicket(ticket);
        comment.setUsuario(usuario);
        comment = commentRepository.save(comment);
        return CommentMapper.toResponse(comment);
    }

    public List<CommentResponse> findByTicketId(Long ticketId) {
        if (!ticketRepository.existsById(ticketId)) {
            throw new ResourceNotFoundException("Ticket não encontrado com id: " + ticketId);
        }
        return commentRepository.findByTicketIdOrderByDataCriacaoAsc(ticketId).stream()
            .map(CommentMapper::toResponse)
            .toList();
    }
}
