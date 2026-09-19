package com.vthacks.studyscheduler.dto;

public record AssignmentImportResponse(
        int importedCount,
        int courseCount
) {
}
