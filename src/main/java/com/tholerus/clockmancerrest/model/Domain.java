package com.tholerus.clockmancerrest.model;

import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import javax.persistence.*;
import java.util.Set;

@Document
public class Domain {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private String id;
    @Indexed(unique = true)
    private String hostname;
    private boolean limited;
    @OneToMany
    private Set<TrackDate> trackDates;

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

    public boolean getLimited() {
        return limited;
    }

    public void setLimited(boolean limited) {
        this.limited = limited;
    }

    public Set<TrackDate> getTrackDates() {
        return trackDates;
    }

    public void setTrackDates(Set<TrackDate> trackDates) {
        this.trackDates = trackDates;
    }
}
