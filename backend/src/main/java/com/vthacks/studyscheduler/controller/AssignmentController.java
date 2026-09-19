package com.vthacks.studyscheduler.controller;

import com.vthacks.studyscheduler.domain.Assignment;
import com.vthacks.studyscheduler.dto.ActualHoursRequest;
import com.vthacks.studyscheduler.dto.AssignmentDto;
import com.vthacks.studyscheduler.dto.AssignmentImportRequest;
import com.vthacks.studyscheduler.dto.AssignmentImportResponse;
import com.vthacks.studyscheduler.repository.AssignmentRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Receives the assignment list scraped by the HokieTutor Chrome extension and
 * persists it. No prior onboarding is required -- pasting an assignment list
 * for a new name just starts tracking assignments under that name.
 */
@RestController
@RequestMapping("/api/assignments")
public class AssignmentController {

    private final AssignmentRepository assignmentRepository;

    public AssignmentController(AssignmentRepository assignmentRepository) {
        this.assignmentRepository = assignmentRepository;
    }

    @PostMapping("/import")
    public ResponseEntity<AssignmentImportResponse> importAssignments(@Valid @RequestBody AssignmentImportRequest request) {
        Set<Long> courseIds = new HashSet<>();

        for (AssignmentDto dto : request.assignments()) {
            Assignment assignment = assignmentRepository.findById(dto.id()).orElseGet(Assignment::new);
            assignment.setId(dto.id());
            assignment.setName(request.name());
            assignment.setTitle(dto.title());
            assignment.setCourseId(dto.courseId());
            assignment.setDueAt(dto.dueAt() != null ? Instant.parse(dto.dueAt()) : null);
            assignment.setPointsPossible(dto.pointsPossible());
            assignment.setHtmlUrl(dto.htmlUrl());
            assignment.setDescriptionRaw(dto.descriptionRaw());
            assignmentRepository.save(assignment);

            if (dto.courseId() != null) {
                courseIds.add(dto.courseId());
            }
        }

        return ResponseEntity.ok(new AssignmentImportResponse(request.assignments().size(), courseIds.size()));
    }

    @GetMapping("/{name}")
    public ResponseEntity<List<AssignmentDto>> listAssignments(@PathVariable String name) {
        List<AssignmentDto> dtos = assignmentRepository.findByNameOrderByDueAtAsc(name).stream()
                .map(AssignmentDto::from)
                .toList();

        return ResponseEntity.ok(dtos);
    }

    /**
     * Logs how long an assignment actually took, once the student finishes it.
     * Feeds future AI time estimates for this student.
     */
    @PatchMapping("/{id}/actual-hours")
    public ResponseEntity<AssignmentDto> logActualHours(@PathVariable Long id, @Valid @RequestBody ActualHoursRequest request) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No assignment found with id " + id));

        assignment.setActualHours(request.actualHours());
        assignmentRepository.save(assignment);

        return ResponseEntity.ok(AssignmentDto.from(assignment));
    }
}
