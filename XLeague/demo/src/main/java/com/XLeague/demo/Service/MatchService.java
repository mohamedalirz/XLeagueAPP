package com.XLeague.demo.Service;

import com.XLeague.demo.Entity.League;
import com.XLeague.demo.Entity.Match;
import com.XLeague.demo.Entity.Player;
import com.XLeague.demo.Entity.Team;
import com.XLeague.demo.Repository.MatchRepository;
import com.XLeague.demo.Repository.PlayerRepository;
import com.XLeague.demo.Repository.TeamRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class MatchService {

    private static final Logger logger = LoggerFactory.getLogger(MatchService.class);

    @Autowired
    private MatchRepository matchRepo;

    @Autowired
    private TeamRepository teamRepo;

    @Autowired
    private PlayerRepository playerRepo;

    // =========================
    // GENERATE FULL SEASON SCHEDULE (Home & Away)
    // =========================
    @Transactional
    public void generateSeasonSchedule(League league) {
        List<Team> teams = league.getTeams();
        int numberOfTeams = teams.size();
        int totalRounds = (numberOfTeams - 1) * 2; // Each team plays twice (home and away)

        logger.info("Generating schedule for {} teams. Total rounds: {}", numberOfTeams, totalRounds);

        LocalDateTime startDate = LocalDateTime.now()
                .withHour(20)
                .withMinute(0)
                .withSecond(0)
                .withNano(0);

        int matchId = 1;
        int roundNumber = 1;

        // FIRST HALF OF SEASON (aller - each team plays each other once)
        List<Team> roundTeams = new ArrayList<>(teams);

        for (int round = 0; round < numberOfTeams - 1; round++) {
            for (int i = 0; i < numberOfTeams / 2; i++) {
                Team home = roundTeams.get(i);
                Team away = roundTeams.get(numberOfTeams - 1 - i);

                Match match = new Match();
                match.setTeamA(home);
                match.setTeamB(away);
                match.setRound(roundNumber);
                match.setMatchTime(startDate.plusDays((roundNumber - 1) * 3)); // Match every 3 days
                match.setPlayed(false);
                match.setLeague(league);

                matchRepo.save(match);
                logger.debug("Created match {}: {} vs {} (Round {})", matchId, home.getName(), away.getName(), roundNumber);
                matchId++;
            }

            // Rotate teams (classic round-robin algorithm)
            Team last = roundTeams.remove(roundTeams.size() - 1);
            roundTeams.add(1, last);
            roundNumber++;
        }

        // SECOND HALF OF SEASON (retour - reverse of first half with home/away swapped)
        // Get all matches from first half and create reverse matches
        List<Match> firstHalfMatches = matchRepo.findByLeagueId(league.getId());

        for (Match firstHalfMatch : firstHalfMatches) {
            Match returnMatch = new Match();
            returnMatch.setTeamA(firstHalfMatch.getTeamB()); // Swap home and away
            returnMatch.setTeamB(firstHalfMatch.getTeamA());
            returnMatch.setRound(roundNumber);
            returnMatch.setMatchTime(startDate.plusDays((roundNumber - 1) * 1));
            returnMatch.setPlayed(false);
            returnMatch.setLeague(league);

            matchRepo.save(returnMatch);
            logger.debug("Created return match {}: {} vs {} (Round {})",
                    matchId, returnMatch.getTeamA().getName(), returnMatch.getTeamB().getName(), roundNumber);
            matchId++;
            roundNumber++;
        }

        int totalMatches = matchRepo.findByLeagueId(league.getId()).size();
        logger.info("Season schedule generated successfully! Total matches: {}", totalMatches);
    }

    // =========================
    // PLAY MATCH
    // =========================
    @Transactional
    public Match playMatch(Match match) {
        Team a = match.getTeamA();
        Team b = match.getTeamB();

        logger.info("Playing match: {} vs {}", a.getName(), b.getName());

        double avgA = a.getPlayers().stream().mapToInt(Player::getPower).average().orElse(0);
        double avgB = b.getPlayers().stream().mapToInt(Player::getPower).average().orElse(0);

        // Home advantage: +5% for home team
        double homeAdvantage = 1.05;
        double adjustedAvgA = avgA * homeAdvantage;

        int scoreA = (int) (Math.random() * 5) + (int) (adjustedAvgA / 20);
        int scoreB = (int) (Math.random() * 5) + (int) (avgB / 20);

        match.setScoreA(scoreA);
        match.setScoreB(scoreB);
        match.setPlayed(true);

        // Update standings
        if (scoreA > scoreB) {
            a.setPoints(a.getPoints() + 3);
            a.setWins(a.getWins() + 1);
            b.setLosses(b.getLosses() + 1);
            logger.info("{} wins! Score: {}-{}", a.getName(), scoreA, scoreB);
        } else if (scoreB > scoreA) {
            b.setPoints(b.getPoints() + 3);
            b.setWins(b.getWins() + 1);
            a.setLosses(a.getLosses() + 1);
            logger.info("{} wins! Score: {}-{}", b.getName(), scoreA, scoreB);
        } else {
            a.setPoints(a.getPoints() + 1);
            b.setPoints(b.getPoints() + 1);
            logger.info("Draw! Score: {}-{}", scoreA, scoreB);
        }

        a.setMatchesPlayed(a.getMatchesPlayed() + 1);
        b.setMatchesPlayed(b.getMatchesPlayed() + 1);

        // XP SYSTEM
        updateXP(a);
        updateXP(b);

        teamRepo.save(a);
        teamRepo.save(b);

        return matchRepo.save(match);
    }

    // =========================
    // XP SYSTEM
    // =========================
    private void updateXP(Team team) {
        for (Player p : team.getPlayers()) {
            int xpGain = 10 + (int)(Math.random() * 10); // Random XP between 10-20
            p.setXp(p.getXp() + xpGain);

            if (p.getXp() >= 100) {
                p.setPower(p.getPower() + 1);
                p.setXp(0);
                logger.info("Player {} leveled up! Power increased to {}", p.getName(), p.getPower());
            }

            playerRepo.save(p);
        }
    }

    // =========================
    // GET MATCHES BY LEAGUE
    // =========================
    public List<Match> getMatchesByLeague(Long leagueId) {
        return matchRepo.findByLeagueId(leagueId);
    }

    // =========================
    // GET UPCOMING MATCHES
    // =========================
    public List<Match> getUpcomingMatches() {
        return matchRepo.findUpcomingMatches(LocalDateTime.now());
    }

    // =========================
    // GET MATCH BY ID
    // =========================
    public Match getMatchById(Long matchId) {
        return matchRepo.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found with ID: " + matchId));
    }

    // =========================
    // PLAY DUE MATCHES
    // =========================
    @Transactional
    public void playDueMatches() {
        LocalDateTime now = LocalDateTime.now();
        List<Match> matches = matchRepo.findByMatchTimeBefore(now);

        logger.info("Found {} matches due to be played", matches.size());

        for (Match match : matches) {
            if (!match.isPlayed()) {
                playMatch(match);
            }
        }
    }
}