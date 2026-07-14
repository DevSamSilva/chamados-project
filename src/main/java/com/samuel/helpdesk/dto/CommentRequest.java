package com.samuel.helpdesk.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CommentRequest(
    @NotBlank(message = "Conteúdo é obrigatório")
    String conteudo,

    @NotNull(message = "Usuário é obrigatório")
    Long usuarioId
) {}
