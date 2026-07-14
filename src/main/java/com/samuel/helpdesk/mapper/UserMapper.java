package com.samuel.helpdesk.mapper;

import com.samuel.helpdesk.dto.UserRequest;
import com.samuel.helpdesk.dto.UserResponse;
import com.samuel.helpdesk.dto.UserUpdateRequest;
import com.samuel.helpdesk.entity.User;

public class UserMapper {

    public static UserResponse toResponse(User user) {
        return new UserResponse(
            user.getId(),
            user.getNome(),
            user.getEmail(),
            user.getRole()
        );
    }

    public static User toEntity(UserRequest request) {
        User user = new User();
        user.setNome(request.nome());
        user.setEmail(request.email());
        user.setSenha(request.senha());
        user.setRole(request.role());
        return user;
    }

    public static void updateEntity(User user, UserUpdateRequest request) {
        user.setNome(request.nome());
        user.setEmail(request.email());
        user.setRole(request.role());
    }
}
