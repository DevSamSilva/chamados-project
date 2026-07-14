package com.samuel.helpdesk.dto;

import com.samuel.helpdesk.entity.UserEnum;

public record UserResponse(
    Long id,
    String nome,
    String email,
    UserEnum role
) {}
