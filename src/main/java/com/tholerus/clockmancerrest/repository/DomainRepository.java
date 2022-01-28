package com.tholerus.clockmancerrest.repository;

import com.tholerus.clockmancerrest.model.Domain;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DomainRepository extends MongoRepository<Domain, String> {
}
