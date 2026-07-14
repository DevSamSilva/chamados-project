package com.samuel.helpdesk.controller;

import com.samuel.helpdesk.dto.TicketRequest;
import com.samuel.helpdesk.dto.TicketResponse;
import com.samuel.helpdesk.dto.TicketUpdateRequest;
import com.samuel.helpdesk.entity.TicketStatus;
import com.samuel.helpdesk.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping
    public ResponseEntity<TicketResponse> create(@Valid @RequestBody TicketRequest request) {
        TicketResponse response = ticketService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> findById(@PathVariable Long id) {
        TicketResponse response = ticketService.findById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<TicketResponse>> findAll(
        @RequestParam(required = false) Long clienteId,
        @RequestParam(required = false) Long tecnicoId,
        @RequestParam(required = false) TicketStatus status) {
        List<TicketResponse> response;
        if (clienteId != null) {
            response = ticketService.findByClienteId(clienteId);
        } else if (tecnicoId != null) {
            response = ticketService.findByTecnicoId(tecnicoId);
        } else if (status != null) {
            response = ticketService.findByStatus(status);
        } else {
            response = ticketService.findAll();
        }
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TicketResponse> update(@PathVariable Long id, @Valid @RequestBody TicketUpdateRequest request) {
        TicketResponse response = ticketService.update(id, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TicketResponse> changeStatus(@PathVariable Long id, @RequestParam TicketStatus status) {
        TicketResponse response = ticketService.changeStatus(id, status);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{ticketId}/assign/{tecnicoId}")
    public ResponseEntity<TicketResponse> assignTechnician(@PathVariable Long ticketId, @PathVariable Long tecnicoId) {
        TicketResponse response = ticketService.assignTechnician(ticketId, tecnicoId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        ticketService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
