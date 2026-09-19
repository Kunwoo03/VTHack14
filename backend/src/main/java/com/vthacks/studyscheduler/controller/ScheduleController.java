package com.vthacks.studyscheduler.controller;

import com.vthacks.studyscheduler.ai.AssignmentTimeEstimationService;
import com.vthacks.studyscheduler.dto.WeeklyEstimateResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/schedule")
public class ScheduleController {

    private final AssignmentTimeEstimationService estimationService;

    public ScheduleController(AssignmentTimeEstimationService estimationService) {
        this.estimationService = estimationService;
    }

    @GetMapping("/estimate/{name}")
    public ResponseEntity<WeeklyEstimateResponse> estimateNextWeek(@PathVariable String name) {
        return ResponseEntity.ok(estimationService.estimateNextWeek(name));
    }
}
