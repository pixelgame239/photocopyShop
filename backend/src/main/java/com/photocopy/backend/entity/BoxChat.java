package com.photocopy.backend.entity;

import java.time.Instant;

import com.photocopy.backend.constant.MessageType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class BoxChat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MessageType messageType;
    @Column(nullable = false)
    private String participant;
    @Column(nullable = false)
    private boolean staffRead;
    @Column(nullable = false)
    private boolean userRead;
    @Column(nullable = false)
    private Instant lastUpdated;

    public void markAsReadByStaff() {
        this.staffRead = true;
    }
    public void markAsReadByUser() {
        this.userRead = true;
    }
    public void markAsUnreadByStaff() {
        this.staffRead = false;
    }
    public void markAsUnreadByUser() {
        this.userRead = false;
    }
    public void updateLastUpdated() {
        this.lastUpdated = Instant.now();
    }
}
