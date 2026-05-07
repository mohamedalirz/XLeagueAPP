package com.XLeague.demo.Service;

import com.XLeague.demo.Entity.Team;
import com.XLeague.demo.Entity.Player;
import com.XLeague.demo.Entity.User;
import com.XLeague.demo.Repository.TeamRepository;
import com.XLeague.demo.Repository.PlayerRepository;
import com.XLeague.demo.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TeamService {

    @Autowired
    private TeamRepository teamRepo;

    @Autowired
    private PlayerRepository playerRepo;

    @Autowired
    private UserRepository userRepo;

    // GET TEAM OF USER
    public Team getMyTeam(String username) {

        return teamRepo.findByUser_Username(username)
                .orElseThrow(() -> new RuntimeException("Team not found"));
    }

    // GET PLAYERS OF TEAM
    public List<Player> getPlayers(String username) {

        Team team = teamRepo.findByUser_Username(username)
                .orElseThrow(() -> new RuntimeException("Team not found"));

        return team.getPlayers();
    }

    // CREATE TEAM (for league join)
    public Team createTeam(String name, String username) {

        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Team team = new Team();
        team.setName(name);
        team.setUser(user); // ✅ correct relation
        team.setPoints(0);
        team.setWins(0);
        team.setLosses(0);

        return teamRepo.save(team);
    }
}