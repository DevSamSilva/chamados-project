package com.samuel.helpdesk.repository;

import com.samuel.helpdesk.entity.Ticket;
import com.samuel.helpdesk.entity.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByClienteId(Long clienteId);

    List<Ticket> findByTecnicoId(Long tecnicoId);

    List<Ticket> findByStatus(TicketStatus status);

    List<Ticket> findByClienteIdAndStatus(Long clienteId, TicketStatus status);

    List<Ticket> findByTecnicoIdAndStatus(Long tecnicoId, TicketStatus status);

    long countByStatus(TicketStatus status);
}
