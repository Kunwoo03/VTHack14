/**
 * HokieTutor Chrome Extension - Background Service Worker
 * ============================================================================
 * Coordinates Canvas assignment sync, caches Fall 2026 course data,
 * and interfaces directly with the HokieTutor Spring Boot backend (localhost:8080).
 * ============================================================================
 */

'use strict';

const BACKEND_API_BASE = "http://localhost:8080";

/**
 * Default seed courses and assignments reflecting active Fall 2026 registration.
 */
const DEFAULT_FALL_COURSES = [
  {
    id: "course_math_1226",
    canvasCourseId: 234299,
    code: "MATH 1226 (Juste CRN 87487)",
    name: "Calculus II",
    term: "Fall 2026",
    currentGrade: 88.5,
    letterGrade: "B+",
    goalGrade: "A",
    confidence: "medium",
    weeklyHours: 4,
    enabled: true,
    color: "#861F41",
    focusTopics: "Integration by parts, Taylor series, Volumes of revolution",
    assignments: [
      {
        id: 101,
        title: "WebAssign 4.2 - Integration Techniques",
        course_id: 234299,
        due_at: new Date(Date.now() + 2 * 86400000).toISOString(),
        points_possible: 100,
        description_raw: "Integration by parts and trigonometric substitution problem set."
      },
      {
        id: 102,
        title: "Calculus Written Quiz 3",
        course_id: 234299,
        due_at: new Date(Date.now() + 5 * 86400000).toISOString(),
        points_possible: 50,
        description_raw: "Written quiz covering Taylor series approximations."
      }
    ]
  },
  {
    id: "course_psyc_1004",
    canvasCourseId: 234310,
    code: "PSYC 1004",
    name: "Introductory Psychology",
    term: "Fall 2026",
    currentGrade: 92.0,
    letterGrade: "A-",
    goalGrade: "A",
    confidence: "high",
    weeklyHours: 3,
    enabled: true,
    color: "#E87722",
    focusTopics: "Cognitive development, Neuroplasticity, Memory retention",
    assignments: [
      {
        id: 201,
        title: "Psychology Research Paper Outline",
        course_id: 234310,
        due_at: new Date(Date.now() + 4 * 86400000).toISOString(),
        points_possible: 100,
        description_raw: "Research paper draft on neuroplasticity and cognitive behavior."
      }
    ]
  },
  {
    id: "course_enge_1215",
    canvasCourseId: 234325,
    code: "ENGE 1215",
    name: "Foundations of Engineering",
    term: "Fall 2026",
    currentGrade: 85.0,
    letterGrade: "B",
    goalGrade: "A-",
    confidence: "low",
    weeklyHours: 4,
    enabled: true,
    color: "#059669",
    focusTopics: "Design matrices, Algorithm flowcharts, CAD modeling",
    assignments: [
      {
        id: 301,
        title: "Design Matrix & Feasibility Report",
        course_id: 234325,
        due_at: new Date(Date.now() + 3 * 86400000).toISOString(),
        points_possible: 100,
        description_raw: "Team engineering design project report and decision matrix."
      }
    ]
  },
  {
    id: "course_cs_2114",
    canvasCourseId: 234350,
    code: "CS 2114",
    name: "Software Design & Data Structures",
    term: "Fall 2026",
    currentGrade: 90.0,
    letterGrade: "A-",
    goalGrade: "A",
    confidence: "medium",
    weeklyHours: 4,
    enabled: true,
    color: "#2563eb",
    focusTopics: "Binary search trees, Polymorphism, Linked lists",
    assignments: [
      {
        id: 401,
        title: "Project 2 - Doubly Linked List Implementation",
        course_id: 234350,
        due_at: new Date(Date.now() + 6 * 86400000).toISOString(),
        points_possible: 150,
        description_raw: "Comprehensive Java project implementing generic linked lists with unit tests."
      }
    ]
  }
];

// Initialize storage on installation
chrome.runtime.onInstalled.addListener(async () => {
  const existing = await chrome.storage.local.get(["courses", "assignments"]);
  if (!existing.courses) {
    const flatAssignments = DEFAULT_FALL_COURSES.flatMap(c => c.assignments);
    await chrome.storage.local.set({
      courses: DEFAULT_FALL_COURSES,
      assignments: flatAssignments,
      lastSync: new Date().toISOString()
    });
  }
  console.log("[HokieTutor Extension] Background worker active and initialized.");
});

/**
 * Message listener for content scripts (Canvas & Web App Bridge).
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleExtensionMessage(message).then(sendResponse);
  return true; // Keep channel open for async response
});

async function handleExtensionMessage(message) {
  const { action, payload } = message;

  switch (action) {
    case "GET_CANVAS_DATA": {
      const data = await chrome.storage.local.get(["courses", "assignments", "lastSync"]);
      return {
        courses: data.courses || DEFAULT_FALL_COURSES,
        assignments: data.assignments || [],
        lastSync: data.lastSync || null
      };
    }

    case "SAVE_CANVAS_DATA": {
      if (payload && payload.assignments && payload.assignments.length > 0) {
        await chrome.storage.local.set({
          assignments: payload.assignments,
          lastSync: payload.syncTime || new Date().toISOString()
        });
      }
      return { success: true };
    }

    case "REGENERATE_SCHEDULE": {
      return await executeRegeneration(payload);
    }

    default:
      return { error: `Unknown action: ${action}` };
  }
}

/**
 * Executes schedule regeneration by:
 * 1. Pulling stored Canvas courses and assignments.
 * 2. Contacting the Spring Boot backend (/api/assignments/import and /api/schedule/estimate).
 * 3. Falling back to local AI estimation if backend is currently launching.
 * 4. Returning the estimates and sync timestamp back to the web application.
 */
async function executeRegeneration(payload) {
  const storage = await chrome.storage.local.get(["courses", "assignments"]);
  const courses = storage.courses || DEFAULT_FALL_COURSES;
  const assignments = storage.assignments || courses.flatMap(c => c.assignments);
  const studentName = payload.studentName || "HokieStudent";

  let backendReachable = false;
  let backendEstimates = null;

  // Step A: Attempt Spring Boot backend sync
  try {
    const importRes = await fetch(`${BACKEND_API_BASE}/api/assignments/import`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: studentName,
        assignments: assignments
      })
    });

    if (importRes.ok) {
      backendReachable = true;
      // Fetch estimates from backend estimation service
      const estimateRes = await fetch(`${BACKEND_API_BASE}/api/schedule/estimate/${encodeURIComponent(studentName)}`);
      if (estimateRes.ok) {
        backendEstimates = await estimateRes.json();
      }
    }
  } catch (backendErr) {
    console.info("[HokieTutor Extension] Spring Boot backend offline or unreachable:", backendErr.message);
    backendReachable = false;
  }

  // Step B: Calculate heuristic estimates if backend was offline
  if (!backendEstimates) {
    backendEstimates = calculateHeuristicEstimates(assignments);
  }

  return {
    success: true,
    timestamp: new Date().toISOString(),
    backendReachable,
    courses,
    assignments,
    estimates: backendEstimates
  };
}

/**
 * Client-side mirror of backend AssignmentTimeEstimationService algorithm
 * when Spring Boot server is not running.
 */
function calculateHeuristicEstimates(assignments) {
  const KEYWORD_BONUSES = [
    { key: "project", bonus: 3.0 },
    { key: "presentation", bonus: 3.0 },
    { key: "paper", bonus: 2.5 },
    { key: "essay", bonus: 2.5 },
    { key: "report", bonus: 2.0 },
    { key: "exam", bonus: 2.0 },
    { key: "midterm", bonus: 2.0 },
    { key: "lab", bonus: 1.5 },
    { key: "quiz", bonus: 0.5 },
    { key: "reading", bonus: 0.5 }
  ];

  let totalHours = 0;
  const estimates = assignments.map(a => {
    const text = ((a.title || "") + " " + (a.description_raw || "")).toLowerCase();
    const points = a.points_possible || 10.0;
    let base = Math.max(0.5, Math.min(6.0, points / 25.0));

    let keywordBonus = 0;
    for (const kb of KEYWORD_BONUSES) {
      if (text.includes(kb.key)) {
        keywordBonus += kb.bonus;
      }
    }

    const hours = Math.round((base + keywordBonus) * 10) / 10;
    totalHours += hours;

    return {
      assignmentId: a.id,
      title: a.title,
      courseId: a.course_id,
      dueAt: a.due_at,
      estimatedHours: hours
    };
  });

  return {
    assignments: estimates,
    totalHours: Math.round(totalHours * 10) / 10
  };
}
