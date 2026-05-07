package com.XLeague.demo.Controller;

import com.XLeague.demo.Entity.Player;
import com.XLeague.demo.Entity.Team;
import com.XLeague.demo.Service.TeamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teams")
public class TeamController {

    @Autowired
    private TeamService teamService;

    @GetMapping("/my-team")
    public Team getMyTeam(@RequestParam String username) {
        return teamService.getMyTeam(username);
    }

    @GetMapping("/players")
    public List<Player> getPlayers(@RequestParam String username) {
        return teamService.getPlayers(username);
    }

    @GetMapping("/my-team/players")
    public List<Player> getMyTeamPlayers(@RequestParam String username) {
        return teamService.getPlayers(username);
    }
}