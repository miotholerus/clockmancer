package com.tholerus.clockmancerrest.repository;

import com.tholerus.clockmancerrest.model.Limitation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LimitationRepository extends MongoRepository<Limitation, String> {
}
