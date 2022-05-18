package com.tholerus.clockmancerrest.repository;

import com.tholerus.clockmancerrest.model.Domain;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DomainRepository extends MongoRepository<Domain, String> {
    // get eller find, spelar det någon roll?
    Optional<Domain> getDomainByHostname(String hostname);
}
