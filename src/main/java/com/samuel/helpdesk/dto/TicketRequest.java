package com.samuel.helpdesk.dto;

import com.samuel.helpdesk.entity.TicketPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record TicketRequest(
    @NotBlank(message = "Título é obrigatório")
    String titulo,

    @NotBlank(message = "Descrição é obrigatória")
    String descricao,

    @NotNull(message = "Prioridade é obrigatória")
    TicketPriority prioridade,

    @NotNull(message = "Cliente é obrigatório")
    Long clienteId
) {}
