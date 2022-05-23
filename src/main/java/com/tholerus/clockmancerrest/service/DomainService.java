package com.tholerus.clockmancerrest.service;

import com.tholerus.clockmancerrest.model.Domain;
import com.tholerus.clockmancerrest.repository.DomainRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class DomainService {
    private DomainRepository repository;

    private boolean matchingDates(Date dateA, Date dateB) {
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd");
        return formatter.format(dateA).equals(formatter.format(dateB));
    }

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

    public Optional<Domain> getDomainByHostname(String hostname) {
        return repository.getDomainByHostname(hostname);
    }

    public List<Domain> getDomainsForToday() {
        Date today = new Date();
        List<Domain> allDomains = repository.findAll();
        // TODO: Clarify this mess
        List<Domain> domainsToday = allDomains.stream().filter(d -> d.getTrackDates().stream().filter(td -> matchingDates(td.getDate(), today)).collect(Collectors.toList()).size() > 0).collect(Collectors.toList());
        return domainsToday;
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
