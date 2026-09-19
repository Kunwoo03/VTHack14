package com.vthacks.studyscheduler.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.time.DayOfWeek;

public record StudyBlockRequest(
        @NotNull DayOfWeek dayOfWeek,
        @Pattern(regexp = "^([01]\\d|2[0-3]):[0-5]\\d$", message = "must be a time in HH:mm format")
        String startTime,
        @Pattern(regexp = "^([01]\\d|2[0-3]):[0-5]\\d$", message = "must be a time in HH:mm format")
        String endTime
) {
}
