package com.vthacks.studyscheduler.dto;

import com.vthacks.studyscheduler.domain.PreferredStudyBlock;

import java.time.DayOfWeek;

public record StudyBlockResponse(
        DayOfWeek dayOfWeek,
        String startTime,
        String endTime
) {
    public static StudyBlockResponse from(PreferredStudyBlock block) {
        return new StudyBlockResponse(
                block.getDayOfWeek(),
                block.getStartTime().toString(),
                block.getEndTime().toString());
    }
}
