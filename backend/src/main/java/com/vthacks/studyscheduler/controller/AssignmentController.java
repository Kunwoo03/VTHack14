package com.vthacks.studyscheduler.controller;

import com.vthacks.studyscheduler.domain.Assignment;
import com.vthacks.studyscheduler.dto.AssignmentDto;
import com.vthacks.studyscheduler.dto.AssignmentImportRequest;
import com.vthacks.studyscheduler.dto.AssignmentImportResponse;
import com.vthacks.studyscheduler.repository.AssignmentRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/assignments")
@CrossOrigin(origins = "*")
public class AssignmentController {

    private final AssignmentRepository assignmentRepository;

    public AssignmentController(AssignmentRepository assignmentRepository) {
        this.assignmentRepository = assignmentRepository;
    }

    @PostMapping("/import")
    public ResponseEntity<AssignmentImportResponse> importAssignments(@Valid @RequestBody AssignmentImportRequest request) {
        String studentName = request.name();
        Set<Long> uniqueCourses = new HashSet<>();

        List<Assignment> savedList = request.assignments().stream().map(dto -> {
            Assignment a = new Assignment();
            a.setId(dto.id());
            a.setName(studentName);
            a.setTitle(dto.title());
            a.setCourseId(dto.courseId());
            if (dto.courseId() != null) {
                uniqueCourses.add(dto.courseId());
            }
            if (dto.dueAt() != null && !dto.dueAt().isBlank()) {
                try {
                    a.setDueAt(Instant.parse(dto.dueAt()));
                } catch (Exception ignored) {
                    a.setDueAt(null);
                }
            }
            a.setPointsPossible(dto.pointsPossible());
            a.setHtmlUrl(dto.htmlUrl());
            a.setDescriptionRaw(dto.descriptionRaw());
            return assignmentRepository.save(a);
        }).toList();

        return ResponseEntity.ok(new AssignmentImportResponse(savedList.size(), uniqueCourses.size()));
    }

    @GetMapping("/{name}")
    public ResponseEntity<List<AssignmentDto>> getAssignments(@PathVariable String name) {
        List<AssignmentDto> list = assignmentRepository.findByNameOrderByDueAtAsc(name).stream()
                .map(AssignmentDto::from)
                .toList();
        return ResponseEntity.ok(list);
    }
}