package com.XLeague.demo.Controller;

import com.XLeague.demo.Entity.Match;
import com.XLeague.demo.Service.MatchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/matches")
@CrossOrigin
public class MatchController {

    @Autowired
    private MatchService matchService;

    @GetMapping("/league/{leagueId}")
    public List<Match> getMatchesByLeague(@PathVariable Long leagueId) {
        return matchService.getMatchesByLeague(leagueId);
    }

    @GetMapping("/upcoming")
    public List<Match> getUpcomingMatches() {
        return matchService.getUpcomingMatches();
    }

    @PostMapping("/simulate/{matchId}")
    public Match simulateMatch(@PathVariable Long matchId) {
        // You'll need to implement findById in MatchService
        // Match match = matchService.findById(matchId);
        // return matchService.playMatch(match);
        throw new UnsupportedOperationException("Implement findById first");
    }
}