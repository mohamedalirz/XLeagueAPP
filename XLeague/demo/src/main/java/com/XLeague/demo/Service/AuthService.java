package com.XLeague.demo.Service;

import com.XLeague.demo.Entity.User;
import com.XLeague.demo.Repository.UserRepository;
import com.XLeague.demo.Security.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class AuthService {

    @Autowired private UserRepository userRepo;

    public Map<String, Object> signup(String username, String password) {

        if(userRepo.findByUsername(username).isPresent()){
            throw new RuntimeException("Username already exists");
        }

        User user = new User();
        user.setUsername(username);
        user.setPassword(password);

        userRepo.save(user);

        return Map.of(
                "message", "User created",
                "username", username
        );
    }

    public Map<String, Object> login(String username, String password) {

        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if(!user.getPassword().equals(password)){
            throw new RuntimeException("Invalid password");
        }

        return Map.of(
                "message", "Login success",
                "username", username
        );
    }
}