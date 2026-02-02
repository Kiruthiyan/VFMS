package com.vfms.trip.model;

public class Trip {
    private Long id;
    private String destination;
    private String date;

    public Trip(Long id, String destination, String date) {
        this.id = id;
        this.destination = destination;
        this.date = date;
    }

    public Long getId() {
        return id;
    }

    public String getDestination() {
        return destination;
    }

    public String getDate() {
        return date;
    }
}
