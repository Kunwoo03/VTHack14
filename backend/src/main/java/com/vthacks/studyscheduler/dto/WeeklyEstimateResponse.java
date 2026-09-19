package com.vthacks.studyscheduler.dto;

import java.util.List;

public record WeeklyEstimateResponse(
        List<AssignmentEstimate> assignments,
        double totalHours
) {
}
