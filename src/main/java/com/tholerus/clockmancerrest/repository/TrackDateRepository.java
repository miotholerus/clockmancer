package com.tholerus.clockmancerrest.repository;

import com.tholerus.clockmancerrest.model.TrackDate;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TrackDateRepository extends MongoRepository<TrackDate, String> {
}
