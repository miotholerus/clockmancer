package com.tholerus.clockmancerrest.service;

import com.tholerus.clockmancerrest.model.TrackDate;
import com.tholerus.clockmancerrest.repository.TrackDateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TrackDateService {
    private TrackDateRepository repository;

    @Autowired
    public TrackDateService(TrackDateRepository repository) {
        this.repository = repository;
    }

    public List<TrackDate> getAllTrackDates() {
        return repository.findAll();
    }

    public Optional<TrackDate> getTrackDateById(String id) {
        return repository.findById(id);
    }

    public TrackDate saveTrackDate(TrackDate trackDate) {
        return repository.save(trackDate);
    }

    public void deleteTrackDate(String id) {
        repository.deleteById(id);
    }
}
