package com.samuel.helpdesk.dto;

import java.time.LocalDateTime;

public record CommentResponse(
    Long id,
    String conteudo,
    Long ticketId,
    Long usuarioId,
    String usuarioNome,
    LocalDateTime dataCriacao
) {}
