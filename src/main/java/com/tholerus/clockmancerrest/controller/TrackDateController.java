package com.tholerus.clockmancerrest.controller;

import com.tholerus.clockmancerrest.model.TrackDate;
import com.tholerus.clockmancerrest.service.TrackDateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/trackdate")
public class TrackDateController {
    private TrackDateService service;

    @Autowired
    public TrackDateController(TrackDateService service) {
        this.service = service;
    }

    @GetMapping("")
    public ResponseEntity<List<TrackDate>> getAllTrackDates() {
        return ResponseEntity.ok().body(service.getAllTrackDates());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TrackDate> getTrackDateById(@PathVariable String id) {
        Optional<TrackDate> trackDateOpt = service.getTrackDateById(id);
        if (trackDateOpt.isPresent()) return ResponseEntity.ok().body(trackDateOpt.get());
        else return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PostMapping("")
    public ResponseEntity<TrackDate> createTrackDate(@RequestBody TrackDate trackDate) throws URISyntaxException {
        TrackDate createdTrackDate = service.saveTrackDate(trackDate);
        return ResponseEntity
                .created(new URI("/trackdate/" + createdTrackDate.getId()))
                //.headers?
                .body(createdTrackDate);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TrackDate> updateTrackDate(@PathVariable String id, @RequestBody TrackDate newTrackDate) throws URISyntaxException {
        Optional<TrackDate> trackDateOpt = service.getTrackDateById(id);
        if (trackDateOpt.isPresent()) {
            TrackDate trackDate = trackDateOpt.get();
            trackDate.setDate(newTrackDate.getDate());
            trackDate.setSeconds(newTrackDate.getSeconds());
            TrackDate updatedTrackDate = service.saveTrackDate(trackDate);
            return ResponseEntity.created(new URI("/trackdate/" + updatedTrackDate.getId())).body(updatedTrackDate);
        } else {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTrackDate(@PathVariable String id) {
        service.deleteTrackDate(id);
        return ResponseEntity
                .noContent()
                //.headers?
                .build();
    }
}
