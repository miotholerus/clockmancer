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
        // Prevents domain from being added if one with the same hostname already exists
        Optional<Domain> domainOpt = repository.getDomainByHostname(domain.getHostname());
        if (domainOpt.isPresent()) {
            domain.setId(domainOpt.get().getId());
            // OBS - detta KAN skriva över seconds till 0, håll koll
        }
        return repository.save(domain);
    }

    public void deleteDomain(String id) {
        repository.deleteById(id);
    }

    public void deleteAllDomains() {
        repository.deleteAll();
    }
}
