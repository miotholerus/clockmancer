package com.tholerus.clockmancerrest.service;

import com.tholerus.clockmancerrest.model.Limitation;
import com.tholerus.clockmancerrest.repository.LimitationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LimitationService {
    private LimitationRepository repository;

    @Autowired
    public LimitationService(LimitationRepository repository) {
        this.repository = repository;
    }

    public List<Limitation> getAllLimitations() {
        return repository.findAll();
    }

    public Optional<Limitation> getLimitationById(String id) {
        return repository.findById(id);
    }

    public Limitation saveLimitation(Limitation limitation) {
        return repository.save(limitation);
    }

    public void deleteLimitation(String id) {
        repository.deleteById(id);
    }
}
