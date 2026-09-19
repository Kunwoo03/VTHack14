package com.vthacks.studyscheduler.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public record ActualHoursRequest(
        @NotNull @DecimalMin("0.0") Double actualHours
) {
}
