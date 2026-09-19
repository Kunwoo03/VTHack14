package com.vthacks.studyscheduler.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * A single Canvas assignment, scraped by the HokieTutor Chrome extension and
 * synced up from the web app. Uses Canvas's own assignment id as the primary
 * key so re-importing the same assignment updates it instead of duplicating it.
 */
@Entity
@Table(name = "assignments")
@Getter
@Setter
@NoArgsConstructor
public class Assignment {

    @Id
    private Long id;

    @Column(nullable = false)
    private String name;

    private String title;

    private Long courseId;

    private Instant dueAt;

    private Double pointsPossible;

    @Column(length = 1000)
    private String htmlUrl;

    @Lob
    private String descriptionRaw;

    /** The AI's most recent time estimate for this assignment, in hours. */
    private Double estimatedHours;

    /** How long this actually took, in hours -- logged by the student after finishing. */
    private Double actualHours;
}
