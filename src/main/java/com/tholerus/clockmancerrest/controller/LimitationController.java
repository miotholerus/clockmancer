package com.tholerus.clockmancerrest.controller;

import com.tholerus.clockmancerrest.model.Limitation;
import com.tholerus.clockmancerrest.service.LimitationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/limitation")
public class LimitationController {
    private LimitationService service;

    @Autowired
    public LimitationController(LimitationService service) {
        this.service = service;
    }

    @GetMapping("")
    public ResponseEntity<List<Limitation>> getAllLimitations() {
        return ResponseEntity.ok().body(service.getAllLimitations());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Limitation> getLimitationById(@PathVariable String id) {
        Optional<Limitation> limitationOpt = service.getLimitationById(id);
        if (limitationOpt.isPresent()) return ResponseEntity.ok().body(limitationOpt.get());
        else return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PostMapping("")
    public ResponseEntity<Limitation> createLimitation(@RequestBody Limitation limitation) throws URISyntaxException {
        Limitation createdLimitation = service.saveLimitation(limitation);
        return ResponseEntity
                .created(new URI("/limitation/" + createdLimitation.getId()))
                //.headers?
                .body(createdLimitation);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Limitation> updateLimitation(@PathVariable String id, @RequestBody Limitation newLimitation) throws URISyntaxException {
        Optional<Limitation> limitationOpt = service.getLimitationById(id);
        if (limitationOpt.isPresent()) {
            Limitation limitation = limitationOpt.get();
            limitation.setTimeAllowedPerDay(newLimitation.getTimeAllowedPerDay());
            Limitation updatedLimitation = service.saveLimitation(limitation);
            return ResponseEntity.created(new URI("/limitation/" + updatedLimitation.getId())).body(updatedLimitation);
        } else {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLimitation(@PathVariable String id) {
        service.deleteLimitation(id);
        return ResponseEntity
                .noContent()
                //.headers?
                .build();
    }
}
