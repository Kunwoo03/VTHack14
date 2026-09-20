package com.vthacks.studyscheduler.dto;

import com.vthacks.studyscheduler.domain.LearningPace;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record OnboardingRequest(
        @NotBlank String name,
        @NotNull LearningPace learningPace,
        @DecimalMin("0.0") @DecimalMax("4.0") Double currentGpa,
        @DecimalMin("0.0") @DecimalMax("4.0") Double targetGpa,
        @NotEmpty @Valid List<StudyBlockRequest> preferredStudyBlocks,
        @NotNull @DecimalMin("0.0") @DecimalMax("24.0") Double dailyStudyHours,
        String sleepStart, // 수면 시작 시간 필드 추가
        String sleepEnd    // 수면 종료 시간 필드 추가
) {
}