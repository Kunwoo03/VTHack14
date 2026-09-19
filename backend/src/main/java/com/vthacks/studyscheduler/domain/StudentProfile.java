package com.vthacks.studyscheduler.domain;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "student_profiles")
@Getter
@Setter
@NoArgsConstructor
public class StudentProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LearningPace learningPace;

    private Double currentGpa;

    private Double targetGpa;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "student_preferred_study_blocks", joinColumns = @JoinColumn(name = "student_profile_id"))
    private Set<PreferredStudyBlock> preferredStudyBlocks = new HashSet<>();

    @Column(nullable = false)
    private Double dailyStudyHours;
}
