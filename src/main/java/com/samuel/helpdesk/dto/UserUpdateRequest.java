package com.samuel.helpdesk.dto;

import com.samuel.helpdesk.entity.UserEnum;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UserUpdateRequest(
    @NotBlank(message = "Nome é obrigatório")
    String nome,

    @NotBlank(message = "Email é obrigatório")
    @Email(message = "Email inválido")
    String email,

    @NotNull(message = "Role é obrigatória")
    UserEnum role
) {}
