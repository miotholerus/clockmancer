package com.tholerus.clockmancerrest.controller;

import com.tholerus.clockmancerrest.model.Domain;
import com.tholerus.clockmancerrest.service.DomainService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Optional;

//@CrossOrigin("")
@RestController
@RequestMapping("/domain")
public class DomainController {
    private DomainService service;

    @Autowired
    public DomainController(DomainService service) {
        this.service = service;
    }

    @GetMapping("")
    public ResponseEntity<List<Domain>> getAllDomains() {
        return ResponseEntity.ok().body(service.getAllDomains());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Domain> getDomainById(@PathVariable String id) {
        Optional<Domain> domainOpt = service.getDomainById(id);
        if (domainOpt.isPresent()) return ResponseEntity.ok().body(domainOpt.get());
        else return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PostMapping("")
    public ResponseEntity<Domain> createDomain(@RequestBody Domain domain) throws URISyntaxException {
        Domain createdDomain = service.saveDomain(domain);
        return ResponseEntity
                .created(new URI("/domain/" + createdDomain.getId()))
                //.headers?
                .body(createdDomain);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Domain> updateDomain(@PathVariable String id, @RequestBody Domain newDomain) throws URISyntaxException {
        Optional<Domain> domainOpt = service.getDomainById(id);
        if (domainOpt.isPresent()) {
            Domain domain = domainOpt.get();
            domain.setHostname(newDomain.getHostname());
            domain.setLimited(newDomain.getLimited());
            domain.setTrackDates(newDomain.getTrackDates());
            Domain updatedDomain = service.saveDomain(domain);
            return ResponseEntity.created(new URI("/domain/" + updatedDomain.getId())).body(updatedDomain);
        } else {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDomain(@PathVariable String id) {
        service.deleteDomain(id);
        return ResponseEntity
                .noContent()
                //.headers?
                .build();
    }

    @DeleteMapping("/clear")
    public ResponseEntity<Void> deleteAllDomains() {
        service.deleteAllDomains();
        return ResponseEntity
                .noContent()
                //.headers?
                .build();
    }
}
