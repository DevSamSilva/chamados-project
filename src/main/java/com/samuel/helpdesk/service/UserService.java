package com.samuel.helpdesk.service;

import com.samuel.helpdesk.entity.User;
import com.samuel.helpdesk.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService  {

    private UserRepository userRepository;
    public UserService(UserRepository userRepository){
        this.userRepository = userRepository;
    }

    public User create(User user){
       return userRepository.save(user);
    }

    public List<User> findAll(){
        return userRepository.findAll();
    }
}
