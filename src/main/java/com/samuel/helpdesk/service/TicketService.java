package com.samuel.helpdesk.service;

import com.samuel.helpdesk.dto.TicketRequest;
import com.samuel.helpdesk.dto.TicketResponse;
import com.samuel.helpdesk.dto.TicketUpdateRequest;
import com.samuel.helpdesk.entity.Ticket;
import com.samuel.helpdesk.entity.TicketStatus;
import com.samuel.helpdesk.entity.User;
import com.samuel.helpdesk.exception.ResourceNotFoundException;
import com.samuel.helpdesk.mapper.TicketMapper;
import com.samuel.helpdesk.repository.TicketRepository;
import com.samuel.helpdesk.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    public TicketService(TicketRepository ticketRepository, UserRepository userRepository) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
    }

    public TicketResponse create(TicketRequest request) {
        User cliente = userRepository.findById(request.clienteId())
            .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado com id: " + request.clienteId()));
        Ticket ticket = TicketMapper.toEntity(request);
        ticket.setCliente(cliente);
        ticket = ticketRepository.save(ticket);
        return TicketMapper.toResponse(ticket);
    }

    public TicketResponse findById(Long id) {
        Ticket ticket = ticketRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Ticket não encontrado com id: " + id));
        return TicketMapper.toResponse(ticket);
    }

    public List<TicketResponse> findAll() {
        return ticketRepository.findAll().stream()
            .map(TicketMapper::toResponse)
            .toList();
    }

    public List<TicketResponse> findByClienteId(Long clienteId) {
        return ticketRepository.findByClienteId(clienteId).stream()
            .map(TicketMapper::toResponse)
            .toList();
    }

    public List<TicketResponse> findByTecnicoId(Long tecnicoId) {
        return ticketRepository.findByTecnicoId(tecnicoId).stream()
            .map(TicketMapper::toResponse)
            .toList();
    }

    public List<TicketResponse> findByStatus(TicketStatus status) {
        return ticketRepository.findByStatus(status).stream()
            .map(TicketMapper::toResponse)
            .toList();
    }

    public TicketResponse update(Long id, TicketUpdateRequest request) {
        Ticket ticket = ticketRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Ticket não encontrado com id: " + id));
        TicketMapper.updateEntity(ticket, request);
        if (request.status() == TicketStatus.FECHADO) {
            ticket.setDataFechamento(LocalDateTime.now());
        }
        ticket = ticketRepository.save(ticket);
        return TicketMapper.toResponse(ticket);
    }

    public TicketResponse assignTechnician(Long ticketId, Long tecnicoId) {
        Ticket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new ResourceNotFoundException("Ticket não encontrado com id: " + ticketId));
        User tecnico = userRepository.findById(tecnicoId)
            .orElseThrow(() -> new ResourceNotFoundException("Técnico não encontrado com id: " + tecnicoId));
        ticket.setTecnico(tecnico);
        ticket.setStatus(TicketStatus.EM_ANDAMENTO);
        ticket = ticketRepository.save(ticket);
        return TicketMapper.toResponse(ticket);
    }

    public TicketResponse changeStatus(Long id, TicketStatus status) {
        Ticket ticket = ticketRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Ticket não encontrado com id: " + id));
        ticket.setStatus(status);
        if (status == TicketStatus.FECHADO) {
            ticket.setDataFechamento(LocalDateTime.now());
        }
        ticket = ticketRepository.save(ticket);
        return TicketMapper.toResponse(ticket);
    }

    public void delete(Long id) {
        if (!ticketRepository.existsById(id)) {
            throw new ResourceNotFoundException("Ticket não encontrado com id: " + id);
        }
        ticketRepository.deleteById(id);
    }
}
