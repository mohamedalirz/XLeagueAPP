package com.XLeague.demo.Service;

import com.XLeague.demo.Entity.Player;
import com.XLeague.demo.Entity.Team;
import com.XLeague.demo.Entity.Transfer;
import com.XLeague.demo.Repository.PlayerRepository;
import com.XLeague.demo.Repository.TeamRepository;
import com.XLeague.demo.Repository.TransferRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TransferService {

    private static final Logger logger = LoggerFactory.getLogger(TransferService.class);

    @Autowired
    private TransferRepository transferRepo;

    @Autowired
    private PlayerRepository playerRepo;

    @Autowired
    private TeamRepository teamRepo;

    // ===== EXISTING METHODS =====

    public List<Transfer> getAvailableTransfers() {
        logger.info("Fetching available transfers");
        return transferRepo.findByStatus(Transfer.TransferStatus.AVAILABLE);
    }

    public List<Transfer> getMyOffers(String username) {
        logger.info("Fetching offers for username: {}", username);
        return transferRepo.findByFromTeam_User_Username(username);
    }

    // ===== LIST PLAYER FOR SALE =====

    @Transactional
    public Transfer listPlayerForSale(Long playerId, Long fromTeamId, Double price) {
        logger.info("=== Listing Player for Sale ===");

        try {
            Player player = playerRepo.findById(playerId)
                    .orElseThrow(() -> new RuntimeException("Player not found"));

            Team fromTeam = teamRepo.findById(fromTeamId)
                    .orElseThrow(() -> new RuntimeException("Team not found"));

            // Check if player belongs to team
            if (!player.getTeam().getId().equals(fromTeam.getId())) {
                throw new RuntimeException("Player does not belong to this team");
            }

            // Create transfer listing
            Transfer transfer = new Transfer();
            transfer.setPlayer(player);
            transfer.setFromTeam(fromTeam);
            transfer.setToTeam(null);
            transfer.setPrice(price);
            transfer.setStatus(Transfer.TransferStatus.AVAILABLE);
            transfer.setCreatedAt(LocalDateTime.now());
            transfer.setExpiresAt(LocalDateTime.now().plusDays(7));

            return transferRepo.save(transfer);

        } catch (Exception e) {
            logger.error("Error listing player: ", e);
            throw new RuntimeException("Failed to list player: " + e.getMessage());
        }
    }

    // ===== MAKE OFFER =====

    @Transactional
    public Transfer makeOffer(Long transferId, Long toTeamId, Double offerPrice) {
        logger.info("=== Making Offer ===");

        try {
            Transfer originalListing = transferRepo.findById(transferId)
                    .orElseThrow(() -> new RuntimeException("Transfer listing not found"));

            if (originalListing.getStatus() != Transfer.TransferStatus.AVAILABLE) {
                throw new RuntimeException("This player is no longer available");
            }

            Team toTeam = teamRepo.findById(toTeamId)
                    .orElseThrow(() -> new RuntimeException("Team not found"));

            // Check if buying team has enough budget
            if (toTeam.getBudget() < offerPrice) {
                throw new RuntimeException("Insufficient budget! Your budget: $" +
                        String.format("%,.2f", toTeam.getBudget()) +
                        ", Offer: $" + String.format("%,.2f", offerPrice));
            }

            // Create offer (PENDING status)
            Transfer offer = new Transfer();
            offer.setPlayer(originalListing.getPlayer());
            offer.setFromTeam(originalListing.getFromTeam());
            offer.setToTeam(toTeam);
            offer.setPrice(offerPrice);
            offer.setStatus(Transfer.TransferStatus.PENDING);
            offer.setCreatedAt(LocalDateTime.now());
            offer.setExpiresAt(LocalDateTime.now().plusDays(3));

            return transferRepo.save(offer);

        } catch (Exception e) {
            logger.error("Error making offer: ", e);
            throw new RuntimeException("Failed to make offer: " + e.getMessage());
        }
    }

    // ===== ACCEPT OFFER (Complete Transfer) =====

    @Transactional
    public Transfer acceptOffer(Long offerId) {
        logger.info("=== Accepting Offer ===");

        try {
            Transfer offer = transferRepo.findById(offerId)
                    .orElseThrow(() -> new RuntimeException("Offer not found"));

            if (offer.getStatus() != Transfer.TransferStatus.PENDING) {
                throw new RuntimeException("This offer is no longer valid");
            }

            Player player = offer.getPlayer();
            Team sellerTeam = offer.getFromTeam();
            Team buyerTeam = offer.getToTeam();
            double transferPrice = offer.getPrice();

            // Check if buyer still has enough budget
            if (buyerTeam.getBudget() < transferPrice) {
                throw new RuntimeException("Buyer no longer has sufficient budget");
            }

            // 1. Transfer money from buyer to seller
            buyerTeam.setBudget(buyerTeam.getBudget() - transferPrice);
            sellerTeam.setBudget(sellerTeam.getBudget() + transferPrice);

            // 2. Transfer player to new team
            sellerTeam.getPlayers().remove(player);
            buyerTeam.getPlayers().add(player);
            player.setTeam(buyerTeam);

            // 3. Update player value (increase by 20% after transfer)
            player.setValue((int)(player.getValue() * 1.2));

            // 4. Update offer status
            offer.setStatus(Transfer.TransferStatus.SOLD);

            // 5. Update/Delete the original listing
            List<Transfer> originalListings = transferRepo.findByPlayerAndStatus(player, Transfer.TransferStatus.AVAILABLE);
            for (Transfer listing : originalListings) {
                listing.setStatus(Transfer.TransferStatus.SOLD);
                transferRepo.save(listing);
            }

            // 6. Delete or mark as SOLD all other pending offers for this player
            List<Transfer> otherOffers = transferRepo.findByPlayerAndStatus(player, Transfer.TransferStatus.PENDING);
            for (Transfer otherOffer : otherOffers) {
                if (!otherOffer.getId().equals(offerId)) {
                    otherOffer.setStatus(Transfer.TransferStatus.EXPIRED);
                    transferRepo.save(otherOffer);
                }
            }

            // Save all changes
            teamRepo.save(sellerTeam);
            teamRepo.save(buyerTeam);
            playerRepo.save(player);

            Transfer completedTransfer = transferRepo.save(offer);

            logger.info("=== TRANSFER COMPLETED ===");
            logger.info("Player: {} from {} to {}", player.getName(), sellerTeam.getName(), buyerTeam.getName());
            logger.info("Transfer Price: ${}", String.format("%,.2f", transferPrice));
            logger.info("Seller New Budget: ${}", String.format("%,.2f", sellerTeam.getBudget()));
            logger.info("Buyer New Budget: ${}", String.format("%,.2f", buyerTeam.getBudget()));

            return completedTransfer;

        } catch (Exception e) {
            logger.error("Error accepting offer: ", e);
            throw new RuntimeException("Failed to accept offer: " + e.getMessage());
        }
    }

    // ===== CREATE OFFER (for LeagueController compatibility) =====

    @Transactional
    public Transfer createOffer(Long playerId, Long fromTeamId, Long toTeamId, Double price) {
        if (toTeamId != null && toTeamId > 0) {
            // This is an offer to buy
            // First, find or create a listing
            List<Transfer> listings = transferRepo.findByPlayerIdAndStatus(playerId, Transfer.TransferStatus.AVAILABLE);
            if (listings.isEmpty()) {
                // Create a listing first
                listPlayerForSale(playerId, fromTeamId, price);
                listings = transferRepo.findByPlayerIdAndStatus(playerId, Transfer.TransferStatus.AVAILABLE);
            }
            if (!listings.isEmpty()) {
                return makeOffer(listings.get(0).getId(), toTeamId, price);
            }
        }
        // This is just listing for sale
        return listPlayerForSale(playerId, fromTeamId, price);
    }

    @Transactional
    public Transfer acceptTransfer(Long id) {
        return acceptOffer(id);
    }

    @Transactional
    public Transfer cancelListing(Long transferId) {
        Transfer listing = transferRepo.findById(transferId)
                .orElseThrow(() -> new RuntimeException("Transfer listing not found"));

        if (listing.getStatus() != Transfer.TransferStatus.AVAILABLE) {
            throw new RuntimeException("Cannot cancel listing that is not available");
        }

        listing.setStatus(Transfer.TransferStatus.CANCELLED);
        return transferRepo.save(listing);
    }

    // Get offers made by my team (to buy players)
    public List<Transfer> getMyOffersMade(String username) {
        logger.info("Fetching offers made by username: {}", username);
        return transferRepo.findByToTeam_User_UsernameAndStatus(username, Transfer.TransferStatus.PENDING);
    }
}