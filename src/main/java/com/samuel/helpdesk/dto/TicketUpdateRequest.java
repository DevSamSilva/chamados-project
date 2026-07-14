package com.samuel.helpdesk.dto;

import com.samuel.helpdesk.entity.TicketPriority;
import com.samuel.helpdesk.entity.TicketStatus;

public record TicketUpdateRequest(
    String titulo,
    String descricao,
    TicketStatus status,
    TicketPriority prioridade
) {}
