package com.vthacks.studyscheduler.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vthacks.studyscheduler.domain.Assignment;
import com.vthacks.studyscheduler.domain.StudentProfile;
import com.vthacks.studyscheduler.dto.AssignmentEstimate;
import com.vthacks.studyscheduler.dto.WeeklyEstimateResponse;
import com.vthacks.studyscheduler.repository.AssignmentRepository;
import com.vthacks.studyscheduler.repository.StudentProfileRepository;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

@Service
public class AssignmentTimeEstimationService {

    private static final Pattern HTML_TAG = Pattern.compile("<[^>]*>");
    private static final Pattern WHITESPACE = Pattern.compile("\\s+");

    private final AssignmentRepository assignmentRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate = new RestTemplate();

    public AssignmentTimeEstimationService(AssignmentRepository assignmentRepository,
                                           StudentProfileRepository studentProfileRepository) {
        this.assignmentRepository = assignmentRepository;
        this.studentProfileRepository = studentProfileRepository;
    }

    /**
     * Gemini 3.6 Flash API를 직접 호출하여 과제별 난이도 기반 동적 소요 시간 계산
     */
    public WeeklyEstimateResponse estimateNextWeek(String name) {
        Instant now = Instant.now();
        Instant weekFromNow = now.plus(7, ChronoUnit.DAYS);

        List<Assignment> allAssignments = assignmentRepository.findByNameOrderByDueAtAsc(name);
        System.out.println(">>> [DEBUG] Total assignments in DB for " + name + ": " + allAssignments.size());

        if (allAssignments.isEmpty()) {
            return new WeeklyEstimateResponse(List.of(), 0.0);
        }

        // 1차 필터: 마감일이 향후 7일 이내인 과제
        List<Assignment> upcoming = allAssignments.stream()
                .filter(a -> a.getDueAt() != null && a.getDueAt().isAfter(now) && a.getDueAt().isBefore(weekFromNow))
                .toList();

        // 방어 로직: 7일 내 마감 과제가 없더라도 DB에 있는 과제 중 상위 8개를 자동 타겟팅
        if (upcoming.isEmpty()) {
            System.out.println(">>> [DEBUG] No assignments in strict 7-day window. Using top available assignments.");
            upcoming = allAssignments.stream().limit(8).toList();
        }

        StudentProfile profile = studentProfileRepository.findByName(name).orElse(null);
        String apiKey = System.getenv("GEMINI_API_KEY");

        // API Key가 없거나 빈 값이면 자체 스마트 휴리스틱으로 대체
        if (apiKey == null || apiKey.isBlank()) {
            System.out.println(">>> [WARN] GEMINI_API_KEY is not set. Using local difficulty heuristic.");
            return fallbackHeuristicEstimate(upcoming, profile);
        }

        try {
            System.out.println(">>> [INFO] Calling Gemini 3.6 Flash for " + upcoming.size() + " assignments...");

            Map<String, Object> studentInfo = new HashMap<>();
            studentInfo.put("learningPace", profile != null && profile.getLearningPace() != null ? profile.getLearningPace().name() : "AVERAGE");
            studentInfo.put("currentGpa", profile != null && profile.getCurrentGpa() != null ? profile.getCurrentGpa() : 3.2);
            studentInfo.put("targetGpa", profile != null && profile.getTargetGpa() != null ? profile.getTargetGpa() : 3.8);
            studentInfo.put("dailyStudyHours", profile != null && profile.getDailyStudyHours() != null ? profile.getDailyStudyHours() : 3.0);

            List<Map<String, Object>> assignmentPayloadList = new ArrayList<>();
            for (Assignment a : upcoming) {
                Map<String, Object> item = new HashMap<>();
                item.put("id", a.getId());
                item.put("title", a.getTitle() != null ? a.getTitle() : "Assignment");
                item.put("pointsPossible", a.getPointsPossible() != null ? a.getPointsPossible() : 10.0);
                item.put("dueAt", a.getDueAt() != null ? a.getDueAt().toString() : "Upcoming");
                String cleanDesc = stripHtml(a.getDescriptionRaw());
                item.put("description", cleanDesc.length() > 300 ? cleanDesc.substring(0, 300) : cleanDesc);
                assignmentPayloadList.add(item);
            }

            String prompt = """
                You are an expert university engineering workload estimator.
                Analyze each assignment's Title, Points, and Description to determine its true difficulty and estimate completion hours.
                
                DIFFICULTY CRITERIA:
                - Light survey, pre-survey, peer review: 0.2 to 0.5 hours.
                - Quiz, brief reflection, discussion prompt: 0.5 to 1.5 hours.
                - Standard homework, problem set, lab report, data structures tasks (Stacks, Efficiency): 1.5 to 3.0 hours.
                - Major multi-stage projects, build deliverables, presentations: 4.0 to 7.0 hours.
                
                OUTPUT REQUIREMENT:
                Return ONLY a valid JSON array without markdown backticks or commentary:
                [
                  {"assignmentId": 12345, "estimatedHours": 2.5}
                ]
                """;

            String userContent = "Student Profile: " + objectMapper.writeValueAsString(studentInfo)
                    + "\n\nAssignments: " + objectMapper.writeValueAsString(assignmentPayloadList);

            String endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=" + apiKey;

            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt + "\n\n" + userContent))))
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(endpoint, entity, String.class);
            JsonNode root = objectMapper.readTree(response.getBody());
            String rawOutput = root.at("/candidates/0/content/parts/0/text").asText();
            rawOutput = rawOutput.replaceAll("(?s)```json\\s*", "").replaceAll("(?s)```\\s*", "").trim();

            JsonNode estimationsArray = objectMapper.readTree(rawOutput);
            Map<Long, Double> estimateMap = new HashMap<>();
            if (estimationsArray.isArray()) {
                for (JsonNode node : estimationsArray) {
                    long id = node.path("assignmentId").asLong();
                    double hours = node.path("estimatedHours").asDouble(2.0);
                    estimateMap.put(id, hours);
                }
            }

            List<AssignmentEstimate> resultList = new ArrayList<>();
            for (Assignment a : upcoming) {
                double hours = estimateMap.getOrDefault(a.getId(), calculateBaseDifficulty(a));
                hours = Math.round(hours * 10.0) / 10.0;
                a.setEstimatedHours(hours);
                assignmentRepository.save(a);

                resultList.add(new AssignmentEstimate(
                        a.getId(),
                        a.getTitle() != null ? a.getTitle() : "Untitled",
                        a.getCourseId(),
                        a.getDueAt() != null ? a.getDueAt().toString() : "Upcoming",
                        hours
                ));
            }

            double total = Math.round(resultList.stream().mapToDouble(AssignmentEstimate::estimatedHours).sum() * 10.0) / 10.0;
            System.out.println(">>> [SUCCESS] Gemini estimation completed successfully! Total hours: " + total);
            return new WeeklyEstimateResponse(resultList, total);

        } catch (Exception e) {
            System.err.println(">>> [ERROR] Gemini API call failed: " + e.getMessage());
            e.printStackTrace();
            return fallbackHeuristicEstimate(upcoming, profile);
        }
    }

    /**
     * Gemini 주간 캘린더 타임 블록 생성
     */
    public String generateWeeklyTimeBlocks(String name, JsonNode manualPayload) {
        try {
            String apiKey = System.getenv("GEMINI_API_KEY");
            if (apiKey == null || apiKey.isBlank()) {
                throw new IllegalStateException("GEMINI_API_KEY environment variable is missing.");
            }

            StudentProfile profile = studentProfileRepository.findByName(name).orElse(null);
            List<Assignment> upcoming = assignmentRepository.findByNameOrderByDueAtAsc(name);

            Map<String, Object> profileMap = new HashMap<>();
            profileMap.put("learnerType", profile != null && profile.getLearningPace() != null ? profile.getLearningPace().name() : "AVERAGE");
            profileMap.put("currentGpa", profile != null && profile.getCurrentGpa() != null ? profile.getCurrentGpa() : 3.2);
            profileMap.put("targetGpa", profile != null && profile.getTargetGpa() != null ? profile.getTargetGpa() : 3.8);
            profileMap.put("availableDailyHours", profile != null && profile.getDailyStudyHours() != null ? profile.getDailyStudyHours() : 4.0);

            String assignmentsJsonStr = (manualPayload != null && manualPayload.has("assignments"))
                    ? manualPayload.get("assignments").toString()
                    : objectMapper.writeValueAsString(upcoming);

            String systemPrompt = """
                You are an elite academic time-blocking scheduler for university engineering students.
                Current Reference Date: Saturday, September 19, 2026.
                
                RULES:
                1. Allocate study blocks according to task difficulty. Major projects must get multiple 2-3h blocks across several days.
                2. Short surveys/quizzes must only get a single 20-30 min slot.
                3. Total daily study hours must not exceed profile.availableDailyHours.
                4. Output pure JSON without markdown backticks.
                """;

            String endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=" + apiKey;

            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(Map.of("parts", List.of(Map.of("text", systemPrompt + "\n\nProfile: " + objectMapper.writeValueAsString(profileMap) + "\n\nAssignments: " + assignmentsJsonStr))))
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(endpoint, entity, String.class);

            JsonNode geminiRes = objectMapper.readTree(response.getBody());
            String rawText = geminiRes.at("/candidates/0/content/parts/0/text").asText();
            return rawText.replaceAll("(?s)```json\\s*", "").replaceAll("(?s)```\\s*", "").trim();

        } catch (Exception e) {
            throw new RuntimeException("Gemini Scheduling Error: " + e.getMessage(), e);
        }
    }

    private WeeklyEstimateResponse fallbackHeuristicEstimate(List<Assignment> upcoming, StudentProfile profile) {
        List<AssignmentEstimate> list = new ArrayList<>();
        for (Assignment a : upcoming) {
            double hours = calculateBaseDifficulty(a);
            hours = Math.round(hours * 10.0) / 10.0;
            a.setEstimatedHours(hours);
            assignmentRepository.save(a);
            list.add(new AssignmentEstimate(
                    a.getId(),
                    a.getTitle() != null ? a.getTitle() : "Untitled",
                    a.getCourseId(),
                    a.getDueAt() != null ? a.getDueAt().toString() : "Upcoming",
                    hours
            ));
        }
        double total = Math.round(list.stream().mapToDouble(AssignmentEstimate::estimatedHours).sum() * 10.0) / 10.0;
        return new WeeklyEstimateResponse(list, total);
    }

    private double calculateBaseDifficulty(Assignment a) {
        double pts = a.getPointsPossible() != null ? a.getPointsPossible() : 10.0;
        String title = a.getTitle() != null ? a.getTitle().toLowerCase() : "";
        if (title.contains("survey") || title.contains("peer")) return 0.3;
        if (title.contains("project") || title.contains("presentation")) return 5.0;
        if (title.contains("homework") || title.contains("efficiency") || title.contains("stack")) return 2.5;
        return Math.max(0.5, Math.min(4.0, pts / 25.0));
    }

    private String stripHtml(String html) {
        if (html == null || html.isBlank()) return "";
        return WHITESPACE.matcher(HTML_TAG.matcher(html).replaceAll(" ")).replaceAll(" ").trim();
    }
}