package com.samuel.helpdesk.dto;

import com.samuel.helpdesk.entity.TicketPriority;
import com.samuel.helpdesk.entity.TicketStatus;

import java.time.LocalDateTime;

public record TicketResponse(
    Long id,
    String titulo,
    String descricao,
    TicketStatus status,
    TicketPriority prioridade,
    Long clienteId,
    String clienteNome,
    Long tecnicoId,
    String tecnicoNome,
    LocalDateTime dataAbertura,
    LocalDateTime dataFechamento
) {}
