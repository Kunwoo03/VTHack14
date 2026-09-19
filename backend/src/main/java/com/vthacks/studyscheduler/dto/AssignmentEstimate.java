package com.vthacks.studyscheduler.dto;

public record AssignmentEstimate(
        Long assignmentId,
        String title,
        Long courseId,
        String dueAt,
        double estimatedHours
) {
}
