package com.tholerus.clockmancerrest.model;

import org.springframework.data.mongodb.core.mapping.Document;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Entity
@Document
public class Limitation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private String id;
    private int timeAllowedPerDay;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public int getTimeAllowedPerDay() {
        return timeAllowedPerDay;
    }

    public void setTimeAllowedPerDay(int timeAllowedPerDay) {
        this.timeAllowedPerDay = timeAllowedPerDay;
    }
}
