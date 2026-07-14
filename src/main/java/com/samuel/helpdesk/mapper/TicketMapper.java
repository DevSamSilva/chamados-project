package com.samuel.helpdesk.mapper;

import com.samuel.helpdesk.dto.TicketRequest;
import com.samuel.helpdesk.dto.TicketResponse;
import com.samuel.helpdesk.dto.TicketUpdateRequest;
import com.samuel.helpdesk.entity.Ticket;

public class TicketMapper {

    public static TicketResponse toResponse(Ticket ticket) {
        return new TicketResponse(
            ticket.getId(),
            ticket.getTitulo(),
            ticket.getDescricao(),
            ticket.getStatus(),
            ticket.getPrioridade(),
            ticket.getCliente().getId(),
            ticket.getCliente().getNome(),
            ticket.getTecnico() != null ? ticket.getTecnico().getId() : null,
            ticket.getTecnico() != null ? ticket.getTecnico().getNome() : null,
            ticket.getDataAbertura(),
            ticket.getDataFechamento()
        );
    }

    public static Ticket toEntity(TicketRequest request) {
        Ticket ticket = new Ticket();
        ticket.setTitulo(request.titulo());
        ticket.setDescricao(request.descricao());
        ticket.setPrioridade(request.prioridade());
        return ticket;
    }

    public static void updateEntity(Ticket ticket, TicketUpdateRequest request) {
        if (request.titulo() != null) ticket.setTitulo(request.titulo());
        if (request.descricao() != null) ticket.setDescricao(request.descricao());
        if (request.status() != null) ticket.setStatus(request.status());
        if (request.prioridade() != null) ticket.setPrioridade(request.prioridade());
    }
}
