package com.XLeague.demo.Controller;

import com.XLeague.demo.Service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;

    // SIGNUP
    @PostMapping("/signup")
    public Map<String, Object> signup(@RequestBody Map<String, String> body){
        return authService.signup(
                body.get("username"),
                body.get("password")
        );
    }

    // LOGIN
    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> body){
        return authService.login(
                body.get("username"),
                body.get("password")
        );
    }
}
