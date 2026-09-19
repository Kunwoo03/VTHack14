package com.vthacks.studyscheduler.controller;

import com.vthacks.studyscheduler.domain.PreferredStudyBlock;
import com.vthacks.studyscheduler.domain.StudentProfile;
import com.vthacks.studyscheduler.dto.OnboardingRequest;
import com.vthacks.studyscheduler.dto.OnboardingResponse;
import com.vthacks.studyscheduler.dto.StudyBlockRequest;
import com.vthacks.studyscheduler.repository.StudentProfileRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/onboarding")
public class OnboardingController {

    private final StudentProfileRepository repository;

    public OnboardingController(StudentProfileRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public ResponseEntity<OnboardingResponse> submitOnboarding(@Valid @RequestBody OnboardingRequest request) {
        StudentProfile profile = repository.findByName(request.name())
                .orElseGet(StudentProfile::new);

        profile.setName(request.name());
        profile.setLearningPace(request.learningPace());
        profile.setCurrentGpa(request.currentGpa());
        profile.setTargetGpa(request.targetGpa());
        profile.setPreferredStudyBlocks(toStudyBlocks(request.preferredStudyBlocks()));
        profile.setDailyStudyHours(request.dailyStudyHours());

        StudentProfile saved = repository.save(profile);

        return ResponseEntity.ok(OnboardingResponse.from(saved));
    }

    @GetMapping("/{name}")
    public ResponseEntity<OnboardingResponse> getOnboarding(@PathVariable String name) {
        StudentProfile profile = repository.findByName(name)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No onboarding profile found for " + name));

        return ResponseEntity.ok(OnboardingResponse.from(profile));
    }

    private Set<PreferredStudyBlock> toStudyBlocks(List<StudyBlockRequest> requests) {
        return requests.stream()
                .map(r -> {
                    LocalTime start = LocalTime.parse(r.startTime());
                    LocalTime end = LocalTime.parse(r.endTime());
                    if (!start.isBefore(end)) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                "Study block start time must be before end time: " + r.dayOfWeek() + " "
                                        + r.startTime() + "-" + r.endTime());
                    }
                    return new PreferredStudyBlock(r.dayOfWeek(), start, end);
                })
                .collect(Collectors.toSet());
    }
}
