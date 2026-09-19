package com.vthacks.studyscheduler.ai;

import com.vthacks.studyscheduler.domain.Assignment;
import com.vthacks.studyscheduler.domain.LearningPace;
import com.vthacks.studyscheduler.domain.StudentProfile;
import com.vthacks.studyscheduler.dto.AssignmentEstimate;
import com.vthacks.studyscheduler.dto.WeeklyEstimateResponse;
import com.vthacks.studyscheduler.repository.AssignmentRepository;
import com.vthacks.studyscheduler.repository.StudentProfileRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

/**
 * Estimates how many hours each of a student's upcoming (next 7 days) assignments
 * will take, using a rule-based heuristic (points, keywords, description length)
 * rather than an external AI API -- no API key, no cost, no network call.
 * Personalizes using the student's learning pace, GPA goal gap, and their
 * actual-vs-estimated history on past assignments.
 */
@Service
public class AssignmentTimeEstimationService {

    private static final Pattern HTML_TAG = Pattern.compile("<[^>]*>");
    private static final Pattern WHITESPACE = Pattern.compile("\\s+");

    /** Extra hours added when the title/description mentions a heavier assignment type. */
    private static final String[][] KEYWORD_BONUSES = {
            {"presentation", "3.0"}, {"project", "3.0"}, {"paper", "2.5"}, {"essay", "2.5"},
            {"report", "2.0"}, {"exam", "2.0"}, {"midterm", "2.0"}, {"final", "1.5"},
            {"lab", "1.5"}, {"quiz", "0.5"}, {"discussion", "0.5"}, {"reading", "0.5"},
            {"survey", "0.3"}
    };

    private final AssignmentRepository assignmentRepository;
    private final StudentProfileRepository studentProfileRepository;

    public AssignmentTimeEstimationService(AssignmentRepository assignmentRepository,
                                            StudentProfileRepository studentProfileRepository) {
        this.assignmentRepository = assignmentRepository;
        this.studentProfileRepository = studentProfileRepository;
    }

    public WeeklyEstimateResponse estimateNextWeek(String name) {
        Instant now = Instant.now();
        Instant weekFromNow = now.plus(7, ChronoUnit.DAYS);

        List<Assignment> upcoming = assignmentRepository.findByNameOrderByDueAtAsc(name).stream()
                .filter(a -> a.getDueAt() != null && a.getDueAt().isAfter(now) && a.getDueAt().isBefore(weekFromNow))
                .toList();

        if (upcoming.isEmpty()) {
            return new WeeklyEstimateResponse(List.of(), 0.0);
        }

        StudentProfile profile = studentProfileRepository.findByName(name).orElse(null);
        double historyMultiplier = calculateHistoryMultiplier(name);

        List<AssignmentEstimate> estimates = upcoming.stream()
                .map(a -> {
                    double hours = estimateHours(a, profile, historyMultiplier);
                    a.setEstimatedHours(hours);
                    assignmentRepository.save(a);
                    return new AssignmentEstimate(a.getId(), a.getTitle(), a.getCourseId(), a.getDueAt().toString(), hours);
                })
                .toList();

        double total = estimates.stream().mapToDouble(AssignmentEstimate::estimatedHours).sum();

        return new WeeklyEstimateResponse(estimates, total);
    }

    private double estimateHours(Assignment assignment, StudentProfile profile, double historyMultiplier) {
        String text = ((assignment.getTitle() != null ? assignment.getTitle() : "") + " "
                + stripHtml(assignment.getDescriptionRaw())).toLowerCase(Locale.ROOT);

        double points = assignment.getPointsPossible() != null ? assignment.getPointsPossible() : 10.0;
        double base = clamp(points / 25.0, 0.5, 6.0);

        double keywordBonus = 0.0;
        for (String[] entry : KEYWORD_BONUSES) {
            if (text.contains(entry[0])) {
                keywordBonus += Double.parseDouble(entry[1]);
            }
        }

        int wordCount = text.isBlank() ? 0 : text.trim().split("\\s+").length;
        double lengthBonus = Math.min(2.0, wordCount / 300.0);

        double raw = base + keywordBonus + lengthBonus;

        LearningPace pace = profile != null && profile.getLearningPace() != null ? profile.getLearningPace() : LearningPace.AVERAGE;
        double paceMultiplier = switch (pace) {
            case VERY_FAST -> 0.6;
            case FAST -> 0.8;
            case AVERAGE -> 1.0;
            case SLOW -> 1.3;
            case VERY_SLOW -> 1.6;
        };

        double gpaMultiplier = 1.0;
        if (profile != null && profile.getCurrentGpa() != null && profile.getTargetGpa() != null
                && profile.getTargetGpa() - profile.getCurrentGpa() >= 0.3) {
            gpaMultiplier = 1.15;
        }

        double hours = raw * paceMultiplier * gpaMultiplier * historyMultiplier;
        return Math.round(hours * 10.0) / 10.0;
    }

    /**
     * Looks at this student's past assignments where we have both an estimate and a
     * logged actual time, and returns the average actual/estimated ratio -- e.g. 1.3
     * means they typically take 30% longer than our estimate, so future estimates
     * should scale up to match. Falls back to 1.0 (no adjustment) with no history.
     */
    private double calculateHistoryMultiplier(String name) {
        List<Assignment> history = assignmentRepository.findByNameAndActualHoursIsNotNullOrderByDueAtDesc(name);

        double sumRatio = 0.0;
        int count = 0;
        for (Assignment a : history) {
            if (a.getEstimatedHours() != null && a.getEstimatedHours() > 0) {
                sumRatio += a.getActualHours() / a.getEstimatedHours();
                count++;
            }
        }

        if (count == 0) {
            return 1.0;
        }

        return clamp(sumRatio / count, 0.6, 1.8);
    }

    private String stripHtml(String html) {
        if (html == null || html.isBlank()) {
            return "";
        }
        String text = HTML_TAG.matcher(html).replaceAll(" ");
        return WHITESPACE.matcher(text).replaceAll(" ").trim();
    }

    private double clamp(double value, double min, double max) {
        return Math.max(min, Math.min(max, value));
    }
}
