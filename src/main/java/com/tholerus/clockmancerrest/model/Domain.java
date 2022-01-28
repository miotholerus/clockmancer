package com.tholerus.clockmancerrest.model;

import org.springframework.data.mongodb.core.mapping.Document;

import javax.persistence.*;
import java.util.Set;

@Entity
@Document
public class Domain {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private String id;
    private String hostname;
    @OneToMany
    private Set<TrackDate> trackDates;
    @OneToOne
    private Limitation limitation;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getHostname() {
        return hostname;
    }

    public void setHostname(String hostname) {
        this.hostname = hostname;
    }

    public Set<TrackDate> getTrackDates() {
        return trackDates;
    }

    public void setTrackDates(Set<TrackDate> trackDates) {
        this.trackDates = trackDates;
    }

    public Limitation getLimitation() {
        return limitation;
    }

    public void setLimitation(Limitation limitation) {
        this.limitation = limitation;
    }
}
