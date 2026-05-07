package com.XLeague.demo.Controller;

import com.XLeague.demo.Entity.League;
import com.XLeague.demo.Entity.Team;
import com.XLeague.demo.Entity.Transfer;
import com.XLeague.demo.Service.LeagueService;
import com.XLeague.demo.Service.TransferService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leagues")
@CrossOrigin
public class LeagueController {

    private static final Logger logger = LoggerFactory.getLogger(LeagueController.class);

    @Autowired
    private LeagueService leagueService;

    @Autowired
    private TransferService transferService;

    @PostMapping("/create")
    public League create(@RequestBody Map<String,String> body){
        logger.info("Create league request: {}", body);
        return leagueService.createLeague(
                body.get("username"),
                body.get("leagueName"),
                body.get("teamName")
        );
    }

    @PostMapping("/join")
    public League join(@RequestBody Map<String,String> body){
        logger.info("Join league request: {}", body);
        return leagueService.joinLeague(
                body.get("code"),
                body.get("username"),
                body.get("teamName")
        );
    }

    @GetMapping("/{leagueId}/table")
    public List<Team> getTable(@PathVariable Long leagueId){
        logger.info("Get league table request for leagueId: {}", leagueId);
        return leagueService.getLeagueTable(leagueId);
    }

    @PostMapping("/offer")
    public Transfer offer(@RequestBody Map<String, Object> body) {
        logger.info("Transfer offer request: {}", body);

        try {
            // Check if this is an offer (has transferId) or a listing (has playerId)
            if (body.containsKey("transferId")) {
                // This is an offer to buy a player
                Long transferId = ((Number) body.get("transferId")).longValue();
                Long toTeamId = ((Number) body.get("toTeamId")).longValue();
                Double price = ((Number) body.get("price")).doubleValue();

                logger.info("Making offer - transferId: {}, toTeamId: {}, price: {}", transferId, toTeamId, price);
                return transferService.makeOffer(transferId, toTeamId, price);

            } else if (body.containsKey("playerId")) {
                // This is listing a player for sale
                Long playerId = ((Number) body.get("playerId")).longValue();
                Long fromTeamId = ((Number) body.get("fromTeamId")).longValue();
                Double price = ((Number) body.get("price")).doubleValue();
                Long toTeamId = body.get("toTeamId") != null ? ((Number) body.get("toTeamId")).longValue() : null;

                logger.info("Listing player - playerId: {}, fromTeamId: {}, toTeamId: {}, price: {}",
                        playerId, fromTeamId, toTeamId, price);
                return transferService.createOffer(playerId, fromTeamId, toTeamId, price);
            } else {
                throw new RuntimeException("Invalid request: missing playerId or transferId");
            }

        } catch (Exception e) {
            logger.error("Error in transfer offer: ", e);
            throw new RuntimeException("Failed to process transfer offer: " + e.getMessage());
        }
    }

    @PostMapping("/accept/{id}")
    public Transfer accept(@PathVariable Long id){
        logger.info("Accept transfer request for id: {}", id);
        return transferService.acceptTransfer(id);
    }

    @GetMapping("/my-league")
    public League getMyLeague(@RequestParam(required = false) String username){
        logger.info("Get my league request for username: {}", username);
        if(username == null){
            throw new RuntimeException("username is required");
        }
        return leagueService.getUserLeague(username);
    }

    // Start season and generate matches
    @PostMapping("/{leagueId}/start-season")
    public League startSeason(@PathVariable Long leagueId) {
        logger.info("Starting season for leagueId: {}", leagueId);
        return leagueService.startSeason(leagueId);
    }

    @PostMapping("/{leagueId}/next-season")
    public League nextSeason(@PathVariable Long leagueId) {
        logger.info("Advancing to next season for leagueId: {}", leagueId);
        return leagueService.nextSeason(leagueId);
    }
}