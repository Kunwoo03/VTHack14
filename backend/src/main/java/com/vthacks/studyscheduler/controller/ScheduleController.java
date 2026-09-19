package com.vthacks.studyscheduler.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.vthacks.studyscheduler.ai.AssignmentTimeEstimationService;
import com.vthacks.studyscheduler.dto.WeeklyEstimateResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/schedule")
@CrossOrigin(origins = "*")
public class ScheduleController {

    private final AssignmentTimeEstimationService estimationService;

    public ScheduleController(AssignmentTimeEstimationService estimationService) {
        this.estimationService = estimationService;
    }

    /**
     * Gemini 3.6 Flash 기반 주간 시간표 생성 (Payload 직접 수신)
     */
    @PostMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> generateScheduleFromPayload(@RequestBody(required = false) JsonNode payload) {
        try {
            String resultJson = estimationService.generateWeeklyTimeBlocks("default", payload);
            return ResponseEntity.ok(resultJson);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\": \"" + e.getMessage().replace("\"", "'") + "\"}");
        }
    }

    /**
     * DB 저장 데이터 기반 특정 학생 주간 시간표 생성
     */
    @GetMapping(value = "/{name}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> generateScheduleForStudent(@PathVariable String name) {
        try {
            String resultJson = estimationService.generateWeeklyTimeBlocks(name, null);
            return ResponseEntity.ok(resultJson);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\": \"" + e.getMessage().replace("\"", "'") + "\"}");
        }
    }

    /**
     * 기존 규칙 기반 주간 예상 총 시간 계산
     */
    @GetMapping("/estimate/{name}")
    public ResponseEntity<WeeklyEstimateResponse> estimateNextWeek(@PathVariable String name) {
        return ResponseEntity.ok(estimationService.estimateNextWeek(name));
    }
}