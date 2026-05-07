package com.XLeague.demo.scheduler;

import com.XLeague.demo.Service.MatchService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class MatchScheduler {

    private static final Logger logger = LoggerFactory.getLogger(MatchScheduler.class);

    @Autowired
    private MatchService matchService;

    // Run every 30 seconds for testing (change to 1 hour later)
    @Scheduled(fixedDelay = 30000) // Every 30 seconds for testing
    public void playDueMatches() {
        logger.info("=== Checking for matches to play at {} ===", new java.util.Date());
        try {
            matchService.playDueMatches();
            logger.info("Match check completed successfully");
        } catch (Exception e) {
            logger.error("Error playing matches: ", e);
        }
    }
}