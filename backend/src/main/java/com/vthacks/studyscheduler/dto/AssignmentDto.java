package com.vthacks.studyscheduler.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.vthacks.studyscheduler.domain.Assignment;
import jakarta.validation.constraints.NotNull;

/**
 * Mirrors the exact shape the HokieTutor Chrome extension scrapes off Canvas:
 * id, title, course_id, due_at, points_possible, html_url, description_raw.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record AssignmentDto(
        @NotNull Long id,
        String title,
        @JsonProperty("course_id") Long courseId,
        @JsonProperty("due_at") String dueAt,
        @JsonProperty("points_possible") Double pointsPossible,
        @JsonProperty("html_url") String htmlUrl,
        @JsonProperty("description_raw") String descriptionRaw
) {
    public static AssignmentDto from(Assignment a) {
        return new AssignmentDto(
                a.getId(),
                a.getTitle(),
                a.getCourseId(),
                a.getDueAt() != null ? a.getDueAt().toString() : null,
                a.getPointsPossible(),
                a.getHtmlUrl(),
                a.getDescriptionRaw());
    }
}
