package com.XLeague.demo.Service;

import com.XLeague.demo.Entity.League;
import com.XLeague.demo.Entity.Match;
import com.XLeague.demo.Entity.Team;
import com.XLeague.demo.Entity.User;
import com.XLeague.demo.Repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class LeagueService {

    private static final Logger logger = LoggerFactory.getLogger(LeagueService.class);

    @Autowired
    private LeagueRepository leagueRepo;

    @Autowired
    private TeamRepository teamRepo;

    @Autowired
    private PlayerService playerService;

    @Autowired
    private MatchService matchService;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private MatchRepository matchRepo;  // Add this missing dependency

    @Autowired
    private PlayerRepository playerRepo;

    @Transactional
    public League createLeague(String username, String leagueName, String teamName) {
        try {
            System.out.println("=== Creating League ===");
            System.out.println("Username: " + username);
            System.out.println("League Name: " + leagueName);
            System.out.println("Team Name: " + teamName);

            // Fetch existing user
            User user = userRepo.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found: " + username));

            // Create team
            Team team = new Team();
            team.setName(teamName);
            team.setUser(user);
            team.setPoints(0);
            team.setWins(0);
            team.setLosses(0);
            team.setMatchesPlayed(0);

            // Generate players
            List<com.XLeague.demo.Entity.Player> players = playerService.generatePlayers(team);
            team.setPlayers(players);

            // Save team FIRST
            Team savedTeam = teamRepo.save(team);
            System.out.println("Team saved with ID: " + savedTeam.getId());

            // Create league
            League league = new League();
            league.setName(leagueName);
            league.setCode(UUID.randomUUID().toString().substring(0, 6).toUpperCase());
            league.setTeams(new ArrayList<>());

            // Save league FIRST
            League savedLeague = leagueRepo.save(league);
            System.out.println("League saved with ID: " + savedLeague.getId());
            System.out.println("League Code: " + savedLeague.getCode());

            savedTeam.setLeague(savedLeague);
            teamRepo.save(savedTeam);

            // Add team to league's team list
            savedLeague.getTeams().add(savedTeam);
            League finalLeague = leagueRepo.save(savedLeague);

            // DO NOT generate schedule here - wait for startSeason button
            // matchService.generateSeasonSchedule(finalLeague);  // <-- REMOVE THIS LINE

            System.out.println("=== League Created Successfully ===");
            System.out.println("Team " + savedTeam.getName() + " is now in league " + finalLeague.getName());

            return finalLeague;

        } catch (Exception e) {
            System.err.println("Error creating league: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to create league: " + e.getMessage());
        }
    }

    @Transactional
    public League joinLeague(String code, String username, String teamName) {
        try {
            System.out.println("=== Joining League ===");
            System.out.println("Code: " + code);
            System.out.println("Username: " + username);
            System.out.println("Team Name: " + teamName);

            // Find league by code
            League league = leagueRepo.findByCode(code)
                    .orElseThrow(() -> new RuntimeException("League not found with code: " + code));
            System.out.println("Found league: " + league.getName() + " (ID: " + league.getId() + ")");

            // Fetch user
            User user = userRepo.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found: " + username));

            // Check if user already has a team
            Optional<Team> existingTeam = teamRepo.findByUser_Username(username);
            Team team;

            if (existingTeam.isPresent()) {
                System.out.println("Using existing team: " + existingTeam.get().getName());
                team = existingTeam.get();
                team.setName(teamName);

                // Check if team has players
                if (team.getPlayers() == null || team.getPlayers().isEmpty()) {
                    List<com.XLeague.demo.Entity.Player> players = playerService.generatePlayers(team);
                    team.setPlayers(players);
                }
            } else {
                System.out.println("Creating new team: " + teamName);
                team = new Team();
                team.setName(teamName);
                team.setUser(user);
                team.setPoints(0);
                team.setWins(0);
                team.setLosses(0);
                team.setMatchesPlayed(0);

                List<com.XLeague.demo.Entity.Player> players = playerService.generatePlayers(team);
                team.setPlayers(players);
            }

            // Save team
            Team savedTeam = teamRepo.save(team);
            System.out.println("Team saved with ID: " + savedTeam.getId());

            // Link team to league
            savedTeam.setLeague(league);
            teamRepo.save(savedTeam);

            // Add team to league's team list
            if (league.getTeams() == null) {
                league.setTeams(new ArrayList<>());
            }
            league.getTeams().add(savedTeam);

            League updatedLeague = leagueRepo.save(league);
            System.out.println("Team successfully joined league " + updatedLeague.getName());
            System.out.println("=== League Joined Successfully ===");

            return updatedLeague;

        } catch (Exception e) {
            System.err.println("Error joining league: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to join league: " + e.getMessage());
        }
    }

    public List<Team> getLeagueTable(Long leagueId){
        League league = leagueRepo.findById(leagueId)
                .orElseThrow(() -> new RuntimeException("League not found"));

        return league.getTeams()
                .stream()
                .sorted((a,b)-> b.getPoints() - a.getPoints())
                .toList();
    }

    public League getUserLeague(String username) {
        System.out.println("Getting league for user: " + username);

        // Find team first
        Optional<Team> team = teamRepo.findByUser_Username(username);

        if (team.isPresent() && team.get().getLeague() != null) {
            League league = team.get().getLeague();
            System.out.println("Found league: " + league.getName() + " via team");
            return league;
        }

        // Alternative: search by teams_user_username
        Optional<League> league = leagueRepo.findByTeams_User_Username(username);
        if (league.isPresent()) {
            System.out.println("Found league: " + league.get().getName() + " via teams list");
            return league.get();
        }

        throw new RuntimeException("League not found for user: " + username);
    }

    // Start season and generate matches
    @Transactional
    public League startSeason(Long leagueId) {
        logger.info("Starting season for league ID: {}", leagueId);

        League league = leagueRepo.findById(leagueId)
                .orElseThrow(() -> new RuntimeException("League not found with ID: " + leagueId));

        // Check if season is already started
        List<Match> existingMatches = matchRepo.findByLeagueId(leagueId);
        if (!existingMatches.isEmpty()) {
            throw new RuntimeException("Season has already been started for this league");
        }

        // Check if there are enough teams
        if (league.getTeams().size() < 2) {
            throw new RuntimeException("Need at least 2 teams to start the season. Current teams: " + league.getTeams().size());
        }

        // Generate season schedule
        matchService.generateSeasonSchedule(league);

        logger.info("Season started successfully for league: {}", league.getName());
        return league;
    }

    // Advance to next season
    @Transactional
    public League nextSeason(Long leagueId) {
        logger.info("Advancing to next season for league ID: {}", leagueId);

        League league = leagueRepo.findById(leagueId)
                .orElseThrow(() -> new RuntimeException("League not found with ID: " + leagueId));

        // Check if current season is completed
        List<Match> matches = matchRepo.findByLeagueId(leagueId);
        if (matches.isEmpty()) {
            throw new RuntimeException("Season hasn't started yet. Please start the season first.");
        }

        boolean allMatchesPlayed = matches.stream().allMatch(Match::isPlayed);
        if (!allMatchesPlayed) {
            throw new RuntimeException("Current season is not completed yet. Please finish all matches first.");
        }

        // 1. Increment season number
        league.setSeason(league.getSeason() + 1);

        // 2. Reset team statistics (keep players and budgets)
        for (Team team : league.getTeams()) {
            team.setPoints(0);
            team.setWins(0);
            team.setLosses(0);
            team.setMatchesPlayed(0);
            teamRepo.save(team);

            // Award bonus XP to all players for completing the season
            for (com.XLeague.demo.Entity.Player player : team.getPlayers()) {
                int bonusXP = 50 + (int)(Math.random() * 50); // 50-100 bonus XP
                player.setXp(player.getXp() + bonusXP);

                // Check for level up
                while (player.getXp() >= 100) {
                    player.setPower(player.getPower() + 1);
                    player.setXp(player.getXp() - 100);
                }
                playerRepo.save(player);
            }
        }

        // 3. Delete old matches
        matchRepo.deleteAll(matches);

        // 4. Generate new season schedule
        matchService.generateSeasonSchedule(league);

        // 5. Save league
        League savedLeague = leagueRepo.save(league);

        logger.info("Season {} started successfully for league: {}", league.getSeason(), league.getName());

        return savedLeague;
    }
}