package com.vthacks.studyscheduler.dto;

import com.vthacks.studyscheduler.domain.LearningPace;
import com.vthacks.studyscheduler.domain.StudentProfile;

import java.util.Comparator;
import java.util.List;

public record OnboardingResponse(
        Long id,
        String name,
        LearningPace learningPace,
        Double currentGpa,
        Double targetGpa,
        List<StudyBlockResponse> preferredStudyBlocks,
        Double dailyStudyHours
) {
    public static OnboardingResponse from(StudentProfile profile) {
        List<StudyBlockResponse> blocks = profile.getPreferredStudyBlocks().stream()
                .map(StudyBlockResponse::from)
                .sorted(Comparator.comparing(StudyBlockResponse::dayOfWeek)
                        .thenComparing(StudyBlockResponse::startTime))
                .toList();

        return new OnboardingResponse(
                profile.getId(),
                profile.getName(),
                profile.getLearningPace(),
                profile.getCurrentGpa(),
                profile.getTargetGpa(),
                blocks,
                profile.getDailyStudyHours()
        );
    }
}
