package com.XLeague.demo.Controller;

import com.XLeague.demo.Entity.Transfer;
import com.XLeague.demo.Service.TransferService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transfers")
@CrossOrigin
public class TransferController {

    private static final Logger logger = LoggerFactory.getLogger(TransferController.class);

    @Autowired
    private TransferService transferService;

    @GetMapping("/available")
    public List<Transfer> available(){
        return transferService.getAvailableTransfers();
    }

    @GetMapping("/my-offers")
    public List<Transfer> myOffers(@RequestParam String username){
        return transferService.getMyOffers(username);
    }

    // New endpoint: List a player for sale
    @PostMapping("/list")
    public Transfer listPlayer(@RequestBody Map<String, Object> body) {
        logger.info("Listing player for sale: {}", body);

        Long playerId = ((Number) body.get("playerId")).longValue();
        Long fromTeamId = ((Number) body.get("fromTeamId")).longValue();
        Double price = ((Number) body.get("price")).doubleValue();

        return transferService.listPlayerForSale(playerId, fromTeamId, price);
    }

    // New endpoint: Make an offer
    @PostMapping("/offer")
    public Transfer makeOffer(@RequestBody Map<String, Object> body) {
        logger.info("Making offer: {}", body);

        Long transferId = ((Number) body.get("transferId")).longValue();
        Long toTeamId = ((Number) body.get("toTeamId")).longValue();
        Double price = ((Number) body.get("price")).doubleValue();

        return transferService.makeOffer(transferId, toTeamId, price);
    }

    // New endpoint: Accept an offer
    @PostMapping("/accept/{id}")
    public Transfer acceptOffer(@PathVariable Long id) {
        logger.info("Accepting offer: {}", id);
        return transferService.acceptOffer(id);
    }

    // New endpoint: Cancel listing
    @PostMapping("/cancel/{id}")
    public Transfer cancelListing(@PathVariable Long id) {
        logger.info("Cancelling listing: {}", id);
        return transferService.cancelListing(id);
    }

    // Get offers made by my team (to buy players)
    @GetMapping("/my-offers-made")
    public List<Transfer> myOffersMade(@RequestParam String username) {
        logger.info("Fetching offers made by username: {}", username);
        return transferService.getMyOffersMade(username);
    }
}