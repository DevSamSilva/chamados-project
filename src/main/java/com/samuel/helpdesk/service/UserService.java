package com.samuel.helpdesk.service;

import com.samuel.helpdesk.dto.UserRequest;
import com.samuel.helpdesk.dto.UserResponse;
import com.samuel.helpdesk.dto.UserUpdateRequest;
import com.samuel.helpdesk.entity.User;
import com.samuel.helpdesk.exception.DatabaseException;
import com.samuel.helpdesk.exception.EmailAlreadyExistsException;
import com.samuel.helpdesk.exception.ResourceNotFoundException;
import com.samuel.helpdesk.mapper.UserMapper;
import com.samuel.helpdesk.repository.UserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserResponse create(UserRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new EmailAlreadyExistsException("Email " + request.email() + " já está em uso");
        }
        User user = UserMapper.toEntity(request);
        user.setSenha(passwordEncoder.encode(request.senha()));
        user = userRepository.save(user);
        return UserMapper.toResponse(user);
    }

    public UserResponse findById(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com id: " + id));
        return UserMapper.toResponse(user);
    }

    public List<UserResponse> findAll() {
        return userRepository.findAll().stream()
            .map(UserMapper::toResponse)
            .toList();
    }

    public UserResponse update(Long id, UserUpdateRequest request) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com id: " + id));
        if (!user.getEmail().equals(request.email()) && userRepository.existsByEmail(request.email())) {
            throw new EmailAlreadyExistsException("Email " + request.email() + " já está em uso");
        }
        UserMapper.updateEntity(user, request);
        user = userRepository.save(user);
        return UserMapper.toResponse(user);
    }

    public void delete(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("Usuário não encontrado com id: " + id);
        }
        try {
            userRepository.deleteById(id);
        } catch (DataIntegrityViolationException e) {
            throw new DatabaseException("Usuário não pode ser removido pois está vinculado a outros registros");
        }
    }
}
