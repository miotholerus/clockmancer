package com.tholerus.clockmancerrest.service;

import com.tholerus.clockmancerrest.model.Domain;
import com.tholerus.clockmancerrest.repository.DomainRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DomainService {
    private DomainRepository repository;

    @Autowired
    public DomainService(DomainRepository repository) {
        this.repository = repository;
    }

    public List<Domain> getAllDomains() {
        return repository.findAll();
    }

    public Optional<Domain> getDomainById(String id) {
        return repository.findById(id);
    }

    public Domain saveDomain(Domain domain) {
        return repository.save(domain); // Why do I have to cast?
    }

    public void deleteDomain(String id) {
        repository.deleteById(id);
    }

    public void deleteAllDomains() {
        repository.deleteAll();
    }
}
