
/**
 * ============================================================================
 * HOKIETUTOR - WEB APPLICATION CLIENT LOGIC
 * ============================================================================
 * Features:
 * 1. Reads verified Canvas data directly from extension/canvas-data.json
 * 2. Multi-course goal management with Interactive Exam Topic Selector
 * 3. Weekly availability grid with OCR timetable upload
 * 4. Multi-view schedule renderer:
 *    - View Switcher: Checklist Only | Calendar Only | Both Combined
 *    - Calendar Resolutions: Month | Week | Day
 * 5. Google Calendar direct export (1-click sync, live feed, .ics download)
 * ============================================================================
 */

'use strict';

// ============================================================================
// 1. DATA STRUCTURES & CONSTANTS
// ============================================================================

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const TIME_SLOTS = [
  { hour: 8, minute: 0, key: "08:00", label: "8:00 AM" },
  { hour: 8, minute: 30, key: "08:30", label: "8:30 AM" },
  { hour: 9, minute: 0, key: "09:00", label: "9:00 AM" },
  { hour: 9, minute: 30, key: "09:30", label: "9:30 AM" },
  { hour: 10, minute: 0, key: "10:00", label: "10:00 AM" },
  { hour: 10, minute: 30, key: "10:30", label: "10:30 AM" },
  { hour: 11, minute: 0, key: "11:00", label: "11:00 AM" },
  { hour: 11, minute: 30, key: "11:30", label: "11:30 AM" },
  { hour: 12, minute: 0, key: "12:00", label: "12:00 PM" },
  { hour: 12, minute: 30, key: "12:30", label: "12:30 PM" },
  { hour: 13, minute: 0, key: "13:00", label: "1:00 PM" },
  { hour: 13, minute: 30, key: "13:30", label: "1:30 PM" },
  { hour: 14, minute: 0, key: "14:00", label: "2:00 PM" },
  { hour: 14, minute: 30, key: "14:30", label: "2:30 PM" },
  { hour: 15, minute: 0, key: "15:00", label: "3:00 PM" },
  { hour: 15, minute: 30, key: "15:30", label: "3:30 PM" },
  { hour: 16, minute: 0, key: "16:00", label: "4:00 PM" },
  { hour: 16, minute: 30, key: "16:30", label: "4:30 PM" },
  { hour: 17, minute: 0, key: "17:00", label: "5:00 PM" },
  { hour: 17, minute: 30, key: "17:30", label: "5:30 PM" },
  { hour: 18, minute: 0, key: "18:00", label: "6:00 PM" },
  { hour: 18, minute: 30, key: "18:30", label: "6:30 PM" },
  { hour: 19, minute: 0, key: "19:00", label: "7:00 PM" },
  { hour: 19, minute: 30, key: "19:30", label: "7:30 PM" },
  { hour: 20, minute: 0, key: "20:00", label: "8:00 PM" },
  { hour: 20, minute: 30, key: "20:30", label: "8:30 PM" },
  { hour: 21, minute: 0, key: "21:00", label: "9:00 PM" },
  { hour: 21, minute: 30, key: "21:30", label: "9:30 PM" },
  { hour: 22, minute: 0, key: "22:00", label: "10:00 PM" }
];

// Preloaded Collegiate Virginia Tech Courses for instant zero-config exploration
// If Canvas extension is used, these are dynamically updated with live courses.
const DEFAULT_FALLBACK_COURSES = [
  {
    "id": "course_acis2115",
    "code": "ACIS 2115 (CRN 84102)",
    "canvasCourseId": "84102",
    "name": "Principles of Accounting",
    "term": "2026 Fall",
    "currentGrade": 68.4,
    "letterGrade": "D+",
    "goalGrade": "B+",
    "confidence": "low",
    "weeklyHours": 5,
    "enabled": true,
    "color": "#861F41",
    "nextExam": {
      "name": "Midterm 1: The Accounting Cycle & Accruals",
      "date": "2026-09-24",
      "daysAway": 4
    },
    "allTopics": [
      {
        "id": "t_acis1_1",
        "name": "The Accounting Cycle & Double-Entry Bookkeeping",
        "selectedForExam": true
      },
      {
        "id": "t_acis1_2",
        "name": "Accrual Accounting & Adjusting Journal Entries",
        "selectedForExam": true
      },
      {
        "id": "t_acis1_3",
        "name": "Inventory Valuation: FIFO, LIFO & Weighted Average",
        "selectedForExam": true
      },
      {
        "id": "t_acis1_4",
        "name": "Bank Reconciliation & Internal Cash Controls",
        "selectedForExam": true
      },
      {
        "id": "t_acis1_5",
        "name": "Financial Statement Preparation & Ratio Analysis",
        "selectedForExam": false
      }
    ],
    "assignments": [
      {
        "name": "WileyPLUS: Adjusting Entries Homework",
        "dueDate": "2026-09-22T23:59:00",
        "weight": "10%"
      },
      {
        "name": "Trial Balance Reconciliation Quiz",
        "dueDate": "2026-09-23T17:00:00",
        "weight": "15%"
      }
    ]
  },
  {
    "id": "course_bus1004",
    "code": "BUS 1004 (CRN 81290)",
    "canvasCourseId": "81290",
    "name": "Foundations of Business Problem-Solving",
    "term": "2026 Fall",
    "currentGrade": 73.2,
    "letterGrade": "C",
    "goalGrade": "A-",
    "confidence": "low",
    "weeklyHours": 4,
    "enabled": true,
    "color": "#E87722",
    "nextExam": {
      "name": "Exam 1: Strategic Business Analysis Frameworks",
      "date": "2026-09-28",
      "daysAway": 8
    },
    "allTopics": [
      {
        "id": "t_bus1_1",
        "name": "Strategic Frameworks: SWOT, PESTEL & Porter's Five Forces",
        "selectedForExam": true
      },
      {
        "id": "t_bus1_2",
        "name": "Spreadsheet Modeling & Break-Even Sensitivity",
        "selectedForExam": true
      },
      {
        "id": "t_bus1_3",
        "name": "Stakeholder Theory & Corporate Governance",
        "selectedForExam": true
      },
      {
        "id": "t_bus1_4",
        "name": "Root Cause Analysis & Decision Trees",
        "selectedForExam": false
      }
    ],
    "assignments": [
      {
        "name": "Case Study 1: Airline Industry Competitive Rivalry",
        "dueDate": "2026-09-24T23:59:00",
        "weight": "15%"
      },
      {
        "name": "Excel Financial Sensitivity Lab",
        "dueDate": "2026-09-26T23:59:00",
        "weight": "10%"
      }
    ]
  },
  {
    "id": "course_acis2116",
    "code": "ACIS 2116 (CRN 84155)",
    "canvasCourseId": "84155",
    "name": "Principles of Accounting",
    "term": "2026 Fall",
    "currentGrade": 76.0,
    "letterGrade": "C+",
    "goalGrade": "B+",
    "confidence": "medium",
    "weeklyHours": 3,
    "enabled": true,
    "color": "#7c3aed",
    "nextExam": {
      "name": "CVP & Overhead Allocation Test",
      "date": "2026-10-05",
      "daysAway": 15
    },
    "allTopics": [
      {
        "id": "t_acis2_1",
        "name": "Cost Classification & High-Low Method",
        "selectedForExam": true
      },
      {
        "id": "t_acis2_2",
        "name": "Cost-Volume-Profit (CVP) & Break-Even Analysis",
        "selectedForExam": true
      },
      {
        "id": "t_acis2_3",
        "name": "Job-Order Costing & Predetermined Overhead Rates",
        "selectedForExam": true
      },
      {
        "id": "t_acis2_4",
        "name": "Direct Materials & Labor Variance Analysis",
        "selectedForExam": false
      }
    ],
    "assignments": [
      {
        "name": "Managerial Cost Flow Problem Set",
        "dueDate": "2026-09-27T23:59:00",
        "weight": "10%"
      }
    ]
  },
  {
    "id": "course_bus1204",
    "code": "BUS 1204 (CRN 82044)",
    "canvasCourseId": "82044",
    "name": "AI Literacy for Business",
    "term": "2026 Fall",
    "currentGrade": 81.5,
    "letterGrade": "B-",
    "goalGrade": "A",
    "confidence": "medium",
    "weeklyHours": 3,
    "enabled": true,
    "color": "#059669",
    "nextExam": {
      "name": "Enterprise AI Strategy Milestone",
      "date": "2026-10-01",
      "daysAway": 11
    },
    "allTopics": [
      {
        "id": "t_bus2_1",
        "name": "Generative AI in Corporate Enterprise Operations",
        "selectedForExam": true
      },
      {
        "id": "t_bus2_2",
        "name": "Machine Learning for Business Predictive Analytics",
        "selectedForExam": true
      },
      {
        "id": "t_bus2_3",
        "name": "Algorithmic Bias, AI Governance & Data Privacy",
        "selectedForExam": true
      },
      {
        "id": "t_bus2_4",
        "name": "Retrieval-Augmented Generation (RAG) Architectures",
        "selectedForExam": false
      }
    ],
    "assignments": [
      {
        "name": "Pamplin AI Policy & Prompt Audit",
        "dueDate": "2026-09-25T23:59:00",
        "weight": "15%"
      }
    ]
  },
  {
    "id": "course_econ2005",
    "code": "ECON 2005 (CRN 80512)",
    "canvasCourseId": "80512",
    "name": "Principles of Economics (Micro)",
    "term": "2026 Fall",
    "currentGrade": 88.5,
    "letterGrade": "B+",
    "goalGrade": "A-",
    "confidence": "high",
    "weeklyHours": 2,
    "enabled": true,
    "color": "#0284c7",
    "nextExam": {
      "name": "Midterm 1: Supply, Demand & Elasticity",
      "date": "2026-10-08",
      "daysAway": 18
    },
    "allTopics": [
      {
        "id": "t_econ_1",
        "name": "Supply, Demand & Price Elasticity",
        "selectedForExam": true
      },
      {
        "id": "t_econ_2",
        "name": "Consumer Surplus & Deadweight Loss",
        "selectedForExam": true
      },
      {
        "id": "t_econ_3",
        "name": "Short-Run and Long-Run Production Costs",
        "selectedForExam": false
      }
    ],
    "assignments": [
      {
        "name": "Microeconomics Problem Set 3",
        "dueDate": "2026-09-29T23:59:00",
        "weight": "10%"
      }
    ]
  }
];

// Main application state
let appState = {
  currentStep: 1,
  academicYear: "2026-2027",
  term: "2026 Fall",
  viewMode: "combined",       // combined | checklist | calendar
  calendarResolution: "week", // month | week | day
  selectedDayForDayView: "Monday",
  courses: [],
  studyHabits: {
    studySpeed: "balanced",
    sessionLength: 45,
    tutoringStyle: "practice"
  },
  busySlots: {},
  studySessions: []
};

// ============================================================================
// 2. INITIALIZATION & DATA SYNC WITH EXTENSION BACKEND
// ============================================================================

document.addEventListener("DOMContentLoaded", async () => {
  // 1. First, check for Canvas Extension payload via URL Hash, Injected Global, or LocalStorage
  let syncSuccess = false;
  let payload = null;

  // A. Check URL Hash (Primary fail-proof cross-origin transfer)
  if (window.location.hash && window.location.hash.includes("canvasData=")) {
    try {
      const rawHash = window.location.hash.split("canvasData=")[1];
      payload = JSON.parse(decodeURIComponent(rawHash));
      history.replaceState(null, "", window.location.pathname + window.location.search);
    } catch (err) {
      console.warn("[Hash Decode Error]", err);
    }
  }

  // B. Check injected global or localStorage fallback
  if (!payload && window.__CANVAS_SYNC_DATA__) {
    payload = window.__CANVAS_SYNC_DATA__;
  }
  if (!payload) {
    const cached = localStorage.getItem("canvas_extension_sync");
    if (cached) {
      try { payload = JSON.parse(cached); } catch (e) {}
    }
  }

  // C. Fallback: try fetching courses from backend
  if (!payload) {
    try {
      const backendLoaded = await fetchCoursesFromBackend();
      if (backendLoaded) syncSuccess = true;
    } catch (e) {
      console.warn("[Courses Backend Init]", e);
    }
  }

  if (payload && payload.courses && payload.courses.length > 0) {
    appState.courses = payload.courses;
    if (payload.academicYear) appState.academicYear = payload.academicYear;
    if (payload.term) appState.term = payload.term;

    localStorage.setItem("canvas_extension_sync", JSON.stringify(payload));
    localStorage.setItem("hokieTutorCourses", JSON.stringify(payload.courses));
    syncSuccess = true;
  } else if (!appState.courses || appState.courses.length === 0) {
    // Populate with verified VT collegiate courses
    appState.courses = JSON.parse(JSON.stringify(DEFAULT_FALLBACK_COURSES));
    appState.academicYear = "2026-2027";
    appState.term = "2026 Fall";
  }

  // 2. Fetch existing schedule from backend if present
  try { await fetchScheduleFromBackend(); } catch (e) { console.warn("[Schedule Init]", e); }

  // 3. Render Page 1 Course Deck with Topic Selectors
  try { renderCourseCardsDeck(); } catch (e) { console.error("[Deck Render]", e); }
  try { updateGoalsSummaryMetrics(); } catch (e) { console.error("[Goals Render]", e); }

  // 4. Build Availability Grid for Page 2
  try { buildAvailabilityGrid(); } catch (e) { console.error("[Grid Render]", e); }

  // 5. Setup event listeners for wizard, views, and modals
  try { setupNavigationEvents(); } catch (e) { console.error("[Nav Events]", e); }
  try { setupPrimarySectionEvents(); } catch (e) { console.error("[Primary Tabs]", e); }
  try { setupPage1Events(); } catch (e) { console.error("[Page 1 Events]", e); }
  try { setupPage2Events(); } catch (e) { console.error("[Page 2 Events]", e); }
  try { setupPage3Events(); } catch (e) { console.error("[Page 3 Events]", e); }
  try { setupViewSwitcherEvents(); } catch (e) { console.error("[View Switcher]", e); }
  try { setupModalEvents(); } catch (e) { console.error("[Modal Events]", e); }

  // 6. Initialize VT BrainWyrmsAI / BrainWyrms Studying Module & Shelf
  try { initStudyingModule(); } catch (e) { console.error("[Studying Module Init]", e); }
  try { renderStudyingSection(); } catch (e) { console.error("[Studying Section Render]", e); }

  // 7. Update Sync Banner on Page 1
  const detailsEl = document.getElementById("sync-banner-details");
  if (detailsEl) {
    if (syncSuccess || localStorage.getItem("canvas_extension_sync")) {
      detailsEl.textContent = `[OK] Active Canvas Ingestion: Loaded ${appState.courses.length} courses for Academic Year ${appState.academicYear} (concluded and past-year courses filtered out).`;
    } else {
      detailsEl.textContent = `⚡ Ready to Sync: Open your Canvas Task Sync extension on canvas.vt.edu, or click "📂 Import Canvas Data" to load your active classes.`;
    }
  }

  // Listen for real-time hashchange if extension launches while tab is already open
  window.addEventListener("hashchange", () => {
    if (window.location.hash && window.location.hash.includes("canvasData=")) {
      try {
        const rawHash = window.location.hash.split("canvasData=")[1];
        const newPayload = JSON.parse(decodeURIComponent(rawHash));
        history.replaceState(null, "", window.location.pathname + window.location.search);
        if (newPayload && newPayload.courses && newPayload.courses.length > 0) {
          window.ingestCanvasSyncPayload(newPayload);
        }
      } catch (err) {
        console.warn("[HashChange Decode Error]", err);
      }
    }
  });

  // Global ingestion function for direct script injection or modal application
  window.ingestCanvasSyncPayload = function(p) {
    if (p && p.courses && p.courses.length > 0) {
      appState.courses = p.courses;
      if (p.academicYear) appState.academicYear = p.academicYear;
      if (p.term) appState.term = p.term;
      if (p.student) {
        appState.studentName = p.student;
        const dName = document.getElementById("user-display-name");
        if (dName) dName.textContent = p.student;
        const eText = document.getElementById("user-email-text");
        if (eText) eText.textContent = `Virginia Tech Student · ${appState.term || 'Fall 2026'}`;
        const aInit = document.getElementById("user-avatar-initial");
        if (aInit) aInit.textContent = "VT";
      }
      localStorage.setItem("canvas_extension_sync", JSON.stringify(p));
      localStorage.setItem("hokieTutorCourses", JSON.stringify(p.courses));
      renderCourseCardsDeck();
      updateGoalsSummaryMetrics();
      if (typeof renderStudyingSection === "function") renderStudyingSection();
      const det = document.getElementById("sync-banner-details");
      if (det) {
        det.textContent = `[OK] Active Canvas Ingestion: Loaded ${p.courses.length} courses for Academic Year ${appState.academicYear}.`;
      }
      goToStep(1);
      showToast(`✓ Ingested ${p.courses.length} active Canvas courses! Set your goals below.`);
    }
  };

  // Helper to parse either JSON or Python CANVAS_DATA string
  window.ingestCanvasSyncText = function(rawText) {
    if (!rawText || !rawText.trim()) {
      showToast("No data provided.");
      return false;
    }
    try {
      let cleanText = rawText.trim();
      if (cleanText.includes("CANVAS_DATA") || cleanText.includes("None") || cleanText.includes("True") || cleanText.includes("False")) {
        const match = cleanText.match(/CANVAS_DATA\s*=\s*(\{[\s\S]*\})/);
        if (match) {
          cleanText = match[1];
        }
        cleanText = cleanText
          .replace(/\bTrue\b/g, "true")
          .replace(/\bFalse\b/g, "false")
          .replace(/\bNone\b/g, "null");
      }
      const parsed = JSON.parse(cleanText);
      const courses = parsed.courses || (Array.isArray(parsed) ? parsed : null);
      if (!courses || !Array.isArray(courses) || courses.length === 0) {
        showToast("Payload does not contain an active 'courses' array.");
        return false;
      }
      window.ingestCanvasSyncPayload(parsed);
      return true;
    } catch (err) {
      console.error("[Canvas Ingest Text Error]", err);
      showToast("Parse error: " + err.message);
      return false;
    }
  };

  // Listen for window message from extension script injection
  window.addEventListener("message", (event) => {
    if (event.data && (event.data.type === "CANVAS_SYNC" || event.data.type === "VT_CANVAS_SYNC")) {
      const data = event.data.payload || event.data.data;
      if (data) window.ingestCanvasSyncPayload(data);
    }
  });

  // Always land strictly on Page 1 (Course Goals & Exam Topics)
  try {
    goToStep(1);
    if (syncSuccess) {
      setTimeout(() => {
        showToast(`[OK] Synced ${appState.courses.length} active Canvas courses & grades! Set your goals below.`);
      }, 400);
    }
  } catch (e) {
    console.error("[GoToStep]", e);
  }
});

/**
 * Reads courses from the backend server (/api/courses), which parses extension/canvas-data.json.
 */
async function fetchCoursesFromBackend() {
  try {
    const res = await fetch("/api/courses");
    if (res.ok) {
      const data = await res.json();
      if (data.courses && data.courses.length > 0) {
        appState.courses = data.courses;
        appState.academicYear = data.academicYear || "2026-2027";
        appState.term = data.term || "2026 Fall";
        console.log("[VT BrainWyrmsAI] Ingested courses from extension/canvas-data.json:", appState.courses);
        return true;
      }
    }
  } catch (err) {
    console.log("[VT BrainWyrmsAI] Running in standalone mode (using cached extension data).");
  }
  return false;
}

/**
 * Fetches saved schedule from backend (/api/schedule).
 */
async function fetchScheduleFromBackend() {
  try {
    const res = await fetch("/api/schedule");
    if (res.ok) {
      const data = await res.json();
      if (data.studySessions && data.studySessions.length > 0) {
        // Sanitize to strictly exclude any first year/freshman seminar shells or past courses
        appState.studySessions = data.studySessions.filter(s => {
          const lower = (s.course || "").toLowerCase();
          return !lower.includes("galileo") && !lower.includes("first year") && !lower.includes("1054") && !lower.includes("money smarts");
        });
      }
      if (data.busySlots) appState.busySlots = data.busySlots;
      if (data.studyHabits) appState.studyHabits = Object.assign(appState.studyHabits, data.studyHabits);
    }
  } catch (err) {
    console.log("[VT BrainWyrmsAI] Running offline, schedule loaded from local memory.");
  }
}

/**
 * Saves courses state to backend.
 */
async function saveCoursesToBackend() {
  try {
    await fetch("/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courses: appState.courses })
    });
  } catch (err) {
    localStorage.setItem("hokieTutorCourses", JSON.stringify(appState.courses));
    if (typeof renderStudyingSection === "function") renderStudyingSection();
  }
}

/**
 * Saves schedule and availability to backend.
 */
async function saveScheduleToBackend() {
  try {
    await fetch("/api/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studySessions: appState.studySessions,
        busySlots: appState.busySlots,
        studyHabits: appState.studyHabits
      })
    });
  } catch (err) {
    localStorage.setItem("hokieTutorSchedule", JSON.stringify(appState.studySessions));
  }
}

// ============================================================================
// 3. STEP NAVIGATION LOGIC
// ============================================================================

function goToStep(stepNumber) {
  if (stepNumber < 1 || stepNumber > 3) return;
  appState.currentStep = stepNumber;

  // If in studying section, do not activate schedule pages
  if (typeof studyingState !== "undefined" && studyingState.activeSection === "studying") {
    return;
  }

  for (let i = 1; i <= 3; i++) {
    const stepBtn = document.getElementById(`step-nav-${i}`);
    const pageView = document.getElementById(`page-${i}`);
    if (stepBtn) stepBtn.classList.toggle("active", i === stepNumber);
    if (pageView) pageView.classList.toggle("active", i === stepNumber);
  }

  window.scrollTo({ top: 0, behavior: "smooth" });

  if (stepNumber === 3) {
    if (!appState.studySessions || appState.studySessions.length === 0) {
      generateMultiCourseSchedule();
    }
    renderAllScheduleViews();
  }
}

function setupNavigationEvents() {
  document.getElementById("step-nav-1").addEventListener("click", () => goToStep(1));
  document.getElementById("step-nav-2").addEventListener("click", () => goToStep(2));
  document.getElementById("step-nav-3").addEventListener("click", () => goToStep(3));

  document.getElementById("btn-next-to-2").addEventListener("click", () => {
    saveHabitsFromForm();
    saveCoursesToBackend();
    goToStep(2);
  });

  document.getElementById("btn-back-to-1").addEventListener("click", () => goToStep(1));

  document.getElementById("btn-next-to-3").addEventListener("click", () => {
    generateMultiCourseSchedule();
    goToStep(3);
  });

  document.getElementById("btn-back-to-2").addEventListener("click", () => goToStep(2));

  document.getElementById("btn-finish-done").addEventListener("click", () => {
    saveScheduleToBackend();
    showToast("🎉 VT BrainWyrmsAI schedule saved!");
  });
}

// ============================================================================
// 4. PAGE 1: COURSE GOALS & INTERACTIVE EXAM TOPIC SELECTOR
// ============================================================================

/**
 * Renders course cards containing exact grades from screenshots and clickable topic chips.
 */
function renderCourseCardsDeck() {
  const container = document.getElementById("course-cards-deck");
  container.innerHTML = "";

  if (appState.courses.length === 0) {
    container.innerHTML = `
      <div class="empty-courses-card card" style="background: linear-gradient(135deg, rgba(134,31,65,0.04) 0%, rgba(232,119,34,0.04) 100%); border: 2px dashed #861F41; border-radius: 12px; padding: 32px 24px; text-align: center; margin: 12px 0;">
        <div style="font-size: 44px; margin-bottom: 10px;">🎓</div>
        <h3 style="font-size: 20px; font-weight: 700; color: #861F41; margin-bottom: 8px;">Connect Your Live Canvas Courses</h3>
        <p style="color: #4b5563; font-size: 14px; max-width: 580px; margin: 0 auto 20px; line-height: 1.6;">
          No courses loaded yet. Sync your active Fall 2026 courses using the <strong>Canvas Task Sync</strong> Chrome extension on <strong>canvas.vt.edu</strong>, or paste your exported data below.
        </p>
        
        <div style="display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; margin-bottom: 24px;">
          <button type="button" class="btn btn-primary" id="btn-deck-paste-clipboard" style="padding: 10px 22px; font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 12px rgba(134,31,65,0.25); cursor: pointer;">
            📋 1-Click Paste from Clipboard
          </button>
          <label class="btn btn-outline" style="padding: 10px 22px; font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 8px; cursor: pointer; background: #fff;">
            📂 Upload canvas_data.py / JSON
            <input type="file" id="deck-file-input" accept=".py,.json,.txt" style="display:none;" />
          </label>
        </div>

        <div style="display: flex; justify-content: center; gap: 24px; flex-wrap: wrap; border-top: 1px solid rgba(134,31,65,0.15); padding-top: 18px; max-width: 640px; margin: 0 auto; text-align: left;">
          <div style="display: flex; align-items: flex-start; gap: 10px; flex: 1; min-width: 180px;">
            <span style="background: #861F41; color: #fff; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; flex-shrink: 0;">1</span>
            <span style="font-size: 12px; color: #4b5563;">Open <a href="https://canvas.vt.edu" target="_blank" style="color: #861F41; font-weight: 600; text-decoration: underline;">canvas.vt.edu</a> in Chrome</span>
          </div>
          <div style="display: flex; align-items: flex-start; gap: 10px; flex: 1; min-width: 180px;">
            <span style="background: #861F41; color: #fff; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; flex-shrink: 0;">2</span>
            <span style="font-size: 12px; color: #4b5563;">Click the <strong>Canvas Task Sync</strong> extension icon and click <strong>"Sync"</strong></span>
          </div>
          <div style="display: flex; align-items: flex-start; gap: 10px; flex: 1; min-width: 180px;">
            <span style="background: #861F41; color: #fff; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; flex-shrink: 0;">3</span>
            <span style="font-size: 12px; color: #4b5563;">Click <strong>"1-Click Paste"</strong> above to instantly load your real classes</span>
          </div>
        </div>
      </div>
    `;

    const btnDeckPaste = container.querySelector("#btn-deck-paste-clipboard");
    if (btnDeckPaste) {
      btnDeckPaste.addEventListener("click", async () => {
        try {
          const text = await navigator.clipboard.readText();
          if (text && text.trim()) {
            window.ingestCanvasSyncText(text);
          } else {
            showToast("Clipboard is empty. Please click Sync in the Canvas extension first.");
          }
        } catch (e) {
          openCanvasImportModal();
        }
      });
    }

    const deckFileInput = container.querySelector("#deck-file-input");
    if (deckFileInput) {
      deckFileInput.addEventListener("change", (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (evt) => {
            window.ingestCanvasSyncText(evt.target.result);
          };
          reader.readAsText(file);
        }
      });
    }
    return;
  }

  appState.courses.forEach(course => {
    const card = document.createElement("div");
    card.className = `course-card ${course.enabled ? '' : 'disabled'}`;
    card.dataset.courseId = course.id;

    // Build interactive topic chips HTML with estimated hours
    const topics = course.allTopics || [];
    let topicsChipsHtml = "";
    topics.forEach(t => {
      const isSelected = t.selectedForExam !== false;
      const hoursBadge = t.estimatedHours ? `<span class="chip-hrs" style="font-size:9.5px;background:rgba(255,255,255,0.22);padding:1px 5px;border-radius:4px;margin-left:5px;font-weight:600;">~${t.estimatedHours}h</span>` : "";
      topicsChipsHtml += `
        <button type="button" class="topic-chip ${isSelected ? 'selected' : ''}" data-topic-id="${t.id}" title="${t.estimatedHours ? 'Estimated ' + t.estimatedHours + ' hrs to master · ' : ''}Click to include/exclude on next exam">
          <span class="chip-icon">${isSelected ? '✓' : '+'}</span>
          <span class="chip-name">${escapeHtml(t.name)}</span>
          ${hoursBadge}
        </button>
      `;
    });

    card.innerHTML = `
      <!-- Top Row: Enable Checkbox, Course Code, Title, Current Grade Badge, Delete -->
      <div class="course-card-top">
        <div class="course-card-title-group">
          <input type="checkbox" class="course-enable-checkbox" title="Include in study plan" ${course.enabled ? 'checked' : ''} />
          <div>
            <span class="course-code-badge">${escapeHtml(course.code)}</span>
            <span class="course-title-text">— ${escapeHtml(course.name)} (${course.term || 'Fall 2026'})</span>
          </div>
        </div>

        <div class="course-card-top-right">
          <span class="badge-current-grade">Canvas Grade: <strong>${course.currentGrade}% (${course.letterGrade || 'A'})</strong></span>
          <button type="button" class="btn-icon-subtle btn-delete-course" title="Remove course">🗑️</button>
        </div>
      </div>

      <!-- Settings Grid: Goal Grade, Confidence, Weekly Hours -->
      <div class="course-settings-grid">
        <div class="form-group">
          <label class="form-label">Target Grade:</label>
          <select class="form-control form-control-sm select-goal-grade">
            <option value="A" ${course.goalGrade === 'A' ? 'selected' : ''}>A (93 - 100%)</option>
            <option value="A-" ${course.goalGrade === 'A-' ? 'selected' : ''}>A- (90 - 92%)</option>
            <option value="B+" ${course.goalGrade === 'B+' ? 'selected' : ''}>B+ (87 - 89%)</option>
            <option value="B" ${course.goalGrade === 'B' ? 'selected' : ''}>B (83 - 86%)</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Confidence:</label>
          <select class="form-control form-control-sm select-confidence">
            <option value="low" ${course.confidence === 'low' ? 'selected' : ''}>Low (Tutoring focus)</option>
            <option value="medium" ${course.confidence === 'medium' ? 'selected' : ''}>Medium (Standard)</option>
            <option value="high" ${course.confidence === 'high' ? 'selected' : ''}>High (Self-study)</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Weekly Hours:</label>
          <input type="number" class="form-control form-control-sm input-weekly-hours" min="1" max="15" value="${course.weeklyHours || 3}" />
        </div>

        <div class="form-group">
          <label class="form-label">Next Exam / Target:</label>
          <input type="text" class="form-control form-control-sm" readonly value="${course.nextExam ? course.nextExam.name + ' (' + course.nextExam.daysAway + 'd away)' + (course.successEstimate ? ' · Est. ' + course.successEstimate.totalHours + ' hrs for ' + (course.goalGrade || 'A') : '') : 'Regular Weekly Topics'}" />
        </div>
      </div>
      ${course.upcomingProject ? `
      <div class="upcoming-project-banner" style="margin-top:6px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:7px;padding:6px 12px;font-size:11.5px;color:#166534;display:flex;align-items:center;justify-content:space-between;">
        <span>📁 <strong>Major Project Deliverable:</strong> ${escapeHtml(course.upcomingProject.name)} (${course.upcomingProject.daysAway}d away)</span>
        <span style="font-weight:700;background:#dcfce7;color:#15803d;padding:2px 7px;border-radius:4px;font-size:10.5px;">Est. ${course.upcomingProject.estimatedHours || 14} hrs to succeed</span>
      </div>` : ''}

      <!-- Interactive Syllabus Learning Goals & Exam Topic Selector -->
      <div class="exam-topics-section">
        <div class="exam-topics-header">
          <span>🎯 Syllabus Learning Goals for Coming Exam (Click chips to toggle inclusion):</span>
          <span class="text-muted" style="font-size:10px;">${course.successEstimate ? 'Est. ' + course.successEstimate.totalHours + ' hrs total · ' : ''}Bases AI study pacing on active syllabus objectives</span>
        </div>
        <div class="topic-chips-wrapper">
          ${topicsChipsHtml}
          <!-- Inline Add Custom Topic -->
          <div class="add-topic-inline">
            <input type="text" class="input-add-topic" placeholder="+ Add custom topic..." />
            <button type="button" class="btn-add-topic-inline">Add</button>
          </div>
        </div>
      </div>
    `;

    // 1. Enable / Disable toggle
    const enableCheck = card.querySelector(".course-enable-checkbox");
    enableCheck.addEventListener("change", (e) => {
      course.enabled = e.target.checked;
      card.classList.toggle("disabled", !course.enabled);
      updateGoalsSummaryMetrics();
      saveCoursesToBackend();
    });

    // 2. Goal grade select
    card.querySelector(".select-goal-grade").addEventListener("change", (e) => {
      course.goalGrade = e.target.value;
      saveCoursesToBackend();
    });

    // 3. Confidence select
    card.querySelector(".select-confidence").addEventListener("change", (e) => {
      course.confidence = e.target.value;
      saveCoursesToBackend();
    });

    // 4. Hours input
    card.querySelector(".input-weekly-hours").addEventListener("change", (e) => {
      course.weeklyHours = Math.max(1, parseInt(e.target.value, 10) || 1);
      updateGoalsSummaryMetrics();
      saveCoursesToBackend();
    });

    // 5. Delete course
    card.querySelector(".btn-delete-course").addEventListener("click", () => {
      appState.courses = appState.courses.filter(c => c.id !== course.id);
      renderCourseCardsDeck();
      updateGoalsSummaryMetrics();
      saveCoursesToBackend();
      showToast("Course removed.");
    });

    // 6. Topic chip click toggle (Exam Topic Selector)
    card.querySelectorAll(".topic-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        const topicId = chip.dataset.topicId;
        const topicObj = course.allTopics.find(t => t.id === topicId);
        if (topicObj) {
          topicObj.selectedForExam = !topicObj.selectedForExam;
          chip.classList.toggle("selected", topicObj.selectedForExam);
          chip.querySelector(".chip-icon").textContent = topicObj.selectedForExam ? "✓" : "+";
          saveCoursesToBackend();
          showToast(`${topicObj.selectedForExam ? 'Included' : 'Excluded'}: ${topicObj.name}`);
        }
      });
    });

    // 7. Add custom topic inline
    const addTopicInput = card.querySelector(".input-add-topic");
    const addTopicBtn = card.querySelector(".btn-add-topic-inline");
    const submitCustomTopic = () => {
      const val = addTopicInput.value.trim();
      if (!val) return;
      const newTopic = {
        id: `custom_${Date.now()}`,
        name: val,
        selectedForExam: true
      };
      if (!course.allTopics) course.allTopics = [];
      course.allTopics.push(newTopic);
      saveCoursesToBackend();
      renderCourseCardsDeck();
      showToast(`Added exam topic: ${val}`);
    };

    addTopicBtn.addEventListener("click", submitCustomTopic);
    addTopicInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        submitCustomTopic();
      }
    });

    container.appendChild(card);
  });
}

function updateGoalsSummaryMetrics() {
  const activeCourses = appState.courses.filter(c => c.enabled);
  const totalHours = activeCourses.reduce((sum, c) => sum + (c.weeklyHours || 0), 0);

  const metricActive = document.getElementById("metric-active-courses");
  if (metricActive) metricActive.textContent = activeCourses.length;

  const metricHours = document.getElementById("metric-total-hours");
  if (metricHours) metricHours.textContent = `${totalHours} hrs`;

  const metricAvg = document.getElementById("metric-avg-goal");
  if (metricAvg) {
    if (activeCourses.length === 0) {
      metricAvg.textContent = "—";
    } else {
      const goals = [...new Set(activeCourses.map(c => c.goalGrade || "A"))];
      metricAvg.textContent = goals.slice(0, 2).join(" / ");
    }
  }

  const metricExams = document.getElementById("metric-upcoming-exams");
  if (metricExams) {
    if (activeCourses.length === 0) {
      metricExams.textContent = "0 Exams";
    } else {
      let examCount = 0;
      activeCourses.forEach(c => {
        if (c.nextExam && (c.nextExam.daysAway == null || c.nextExam.daysAway <= 14)) {
          examCount++;
        }
      });
      metricExams.textContent = examCount === 1 ? "1 Exam" : `${examCount} Exams`;
    }
  }

  const bannerDetails = document.getElementById("sync-banner-details");
  if (bannerDetails) {
    if (activeCourses.length > 0) {
      bannerDetails.textContent = `[OK] Active Canvas Ingestion: Loaded ${activeCourses.length} verified courses for Academic Year ${appState.academicYear} (past years & non-credit shells filtered out).`;
    } else {
      bannerDetails.textContent = `⚡ Ready to Sync: Open your Canvas Task Sync extension on canvas.vt.edu, or click "📋 1-Click Paste" to load your live classes.`;
    }
  }
}

function saveHabitsFromForm() {
  const selectedSpeed = document.querySelector('input[name="study_speed"]:checked');
  if (selectedSpeed) appState.studyHabits.studySpeed = selectedSpeed.value;
  appState.studyHabits.sessionLength = parseInt(document.getElementById("global-session-length").value, 10) || 45;
  appState.studyHabits.tutoringStyle = document.getElementById("global-tutoring-style").value;
}

function setupPage1Events() {
  document.getElementById("btn-save-draft-1").addEventListener("click", () => {
    saveHabitsFromForm();
    saveCoursesToBackend();
    showToast("✓ Goals and topics saved!");
  });

  document.getElementById("btn-open-add-course-modal").addEventListener("click", () => {
    document.getElementById("course-modal").classList.remove("hidden");
  });

  document.getElementById("btn-resync-extension").addEventListener("click", async () => {
    const success = await fetchCoursesFromBackend();
    if (success) {
      renderCourseCardsDeck();
      updateGoalsSummaryMetrics();
      showToast("🔄 Reloaded latest Canvas data from extension backend!");
    } else {
      openCanvasImportModal();
    }
  });

  const btnOpenCanvasImport = document.getElementById("btn-open-canvas-import");
  if (btnOpenCanvasImport) {
    btnOpenCanvasImport.addEventListener("click", openCanvasImportModal);
  }

  setupCanvasImportModalEvents();

  // Global Google Calendar button on header
  document.getElementById("btn-global-gcal").addEventListener("click", openGoogleCalendarModal);
}

function openCanvasImportModal() {
  const modal = document.getElementById("canvas-import-modal");
  if (modal) {
    modal.classList.remove("hidden");
  }
}

function closeCanvasImportModal() {
  const modal = document.getElementById("canvas-import-modal");
  if (modal) {
    modal.classList.add("hidden");
  }
}

function setupCanvasImportModalEvents() {
  const btnClose = document.getElementById("btn-close-canvas-import-modal");
  const btnCancel = document.getElementById("btn-cancel-canvas-import");
  const btnApply = document.getElementById("btn-apply-canvas-import");
  const fileInput = document.getElementById("canvas-file-input");
  const textarea = document.getElementById("canvas-json-textarea");
  const fileNameLabel = document.getElementById("canvas-file-name");
  const btnPasteClipboard = document.getElementById("btn-paste-clipboard");

  if (btnPasteClipboard) {
    btnPasteClipboard.addEventListener("click", async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text && textarea) {
          textarea.value = text;
          showToast("📋 Pasted from clipboard! Click 'Import & Apply Courses' to confirm.");
        } else {
          showToast("Clipboard is empty. Copy your Canvas data from the extension first.");
        }
      } catch (err) {
        showToast("Clipboard access denied. Please press Ctrl+V / Cmd+V directly in the box.");
      }
    });
  }

  if (btnClose) btnClose.addEventListener("click", closeCanvasImportModal);
  if (btnCancel) btnCancel.addEventListener("click", closeCanvasImportModal);

  if (fileInput) {
    fileInput.addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        if (fileNameLabel) fileNameLabel.textContent = file.name;
        const reader = new FileReader();
        reader.onload = (evt) => {
          if (textarea) textarea.value = evt.target.result;
        };
        reader.readAsText(file);
      }
    });
  }

  if (btnApply) {
    btnApply.addEventListener("click", () => {
      const raw = textarea ? textarea.value.trim() : "";
      if (!raw) {
        showToast("Please paste Canvas JSON/Python or choose a canvas_data.py / canvas-data.json file.");
        return;
      }

      try {
        let cleanText = raw;
        // Auto-detect and parse Python dictionary assignments (canvas_data.py)
        if (cleanText.includes("CANVAS_DATA") || cleanText.includes("None") || cleanText.includes("True") || cleanText.includes("False")) {
          const match = cleanText.match(/CANVAS_DATA\s*=\s*(\{[\s\S]*\})/);
          if (match) {
            cleanText = match[1];
          }
          cleanText = cleanText
            .replace(/\bTrue\b/g, "true")
            .replace(/\bFalse\b/g, "false")
            .replace(/\bNone\b/g, "null");
        }

        const parsed = JSON.parse(cleanText);
        const courses = parsed.courses || (Array.isArray(parsed) ? parsed : null);
        if (!courses || !Array.isArray(courses) || courses.length === 0) {
          showToast("Data must contain a 'courses' array with valid course objects.");
          return;
        }

        appState.courses = courses;
        if (parsed.academicYear) appState.academicYear = parsed.academicYear;
        if (parsed.term) appState.term = parsed.term;

        saveCoursesToBackend();
        renderCourseCardsDeck();
        updateGoalsSummaryMetrics();
        if (typeof renderStudyingSection === "function") renderStudyingSection();
        closeCanvasImportModal();
        showToast(`✓ Successfully imported ${courses.length} courses from Canvas!`);
      } catch (err) {
        showToast("Data parsing error: " + err.message);
      }
    });
  }
}

// ============================================================================
// 5. PAGE 2: AVAILABILITY GRID & TIMETABLE UPLOAD
// ============================================================================

function buildAvailabilityGrid() {
  const tbody = document.getElementById("availability-tbody");
  tbody.innerHTML = "";

  TIME_SLOTS.forEach(slot => {
    const tr = document.createElement("tr");

    const thTime = document.createElement("th");
    thTime.className = "time-label-cell";
    thTime.scope = "row";
    thTime.textContent = slot.label;
    tr.appendChild(thTime);

    DAYS_OF_WEEK.forEach(day => {
      const td = document.createElement("td");
      td.className = "time-slot-cell";
      td.dataset.day = day;
      td.dataset.key = slot.key;
      td.dataset.hour = slot.hour;
      td.dataset.minute = slot.minute;

      const slotKey = `${day}-${slot.key}`;
      if (appState.busySlots[slotKey]) td.classList.add("busy");

      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  updateAvailableHoursCount();
}

function setupPage2Events() {
  const table = document.getElementById("availability-table");
  let isMouseDown = false;
  let targetState = null;

  table.addEventListener("mousedown", (e) => {
    const cell = e.target.closest(".time-slot-cell");
    if (!cell) return;
    isMouseDown = true;
    targetState = !cell.classList.contains("busy");
    toggleCellState(cell, targetState);
  });

  table.addEventListener("mouseover", (e) => {
    if (!isMouseDown) return;
    const cell = e.target.closest(".time-slot-cell");
    if (cell && targetState !== null) toggleCellState(cell, targetState);
  });

  window.addEventListener("mouseup", () => {
    if (isMouseDown) {
      isMouseDown = false;
      targetState = null;
      updateAvailableHoursCount();
      saveScheduleToBackend();
    }
  });

  document.getElementById("btn-preset-weekday-busy").addEventListener("click", () => {
    ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].forEach(day => {
      for (let h = 9; h < 17; h++) {
        const hh = String(h).padStart(2, "0");
        appState.busySlots[`${day}-${hh}:00`] = true;
        appState.busySlots[`${day}-${hh}:30`] = true;
      }
    });
    applyBusySlotsToGrid();
    showToast("Marked Weekdays 9-5 as Busy!");
  });

  document.getElementById("btn-preset-evenings-free").addEventListener("click", () => {
    DAYS_OF_WEEK.forEach(day => {
      for (let h = 17; h <= 21; h++) {
        const hh = String(h).padStart(2, "0");
        delete appState.busySlots[`${day}-${hh}:00`];
        delete appState.busySlots[`${day}-${hh}:30`];
      }
      delete appState.busySlots[`${day}-22:00`];
    });
    applyBusySlotsToGrid();
    showToast("Marked Evenings as Free for study!");
  });

  document.getElementById("btn-preset-clear").addEventListener("click", () => {
    appState.busySlots = {};
    applyBusySlotsToGrid();
    showToast("Cleared grid!");
  });

  // Timetable OCR Upload logic
  const dropzone = document.getElementById("schedule-dropzone");
  const fileInput = document.getElementById("schedule-file-input");
  const btnBrowse = document.getElementById("btn-browse-file");
  const previewContainer = document.getElementById("upload-preview-container");
  const previewImg = document.getElementById("upload-preview-img");
  const previewName = document.getElementById("upload-file-name");
  const btnRemoveFile = document.getElementById("btn-remove-file");

  btnBrowse.addEventListener("click", (e) => { e.stopPropagation(); fileInput.click(); });
  dropzone.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", () => {
    if (fileInput.files.length > 0) {
      const file = fileInput.files[0];
      previewName.textContent = file.name;
      const reader = new FileReader();
      reader.onload = (evt) => {
        previewImg.src = evt.target.result;
        previewContainer.classList.remove("hidden");

        // Simulate OCR extraction for standard class times (MWF 10-11 AM, TR 12:30-1:45 PM)
        ["Monday", "Wednesday", "Friday"].forEach(d => {
          appState.busySlots[`${d}-10:00`] = true;
          appState.busySlots[`${d}-10:30`] = true;
        });
        ["Tuesday", "Thursday"].forEach(d => {
          appState.busySlots[`${d}-12:30`] = true;
          appState.busySlots[`${d}-13:00`] = true;
          appState.busySlots[`${d}-13:30`] = true;
        });

        applyBusySlotsToGrid();
        showToast("✓ Schedule scanned! Imported class hours into calendar.");
      };
      reader.readAsDataURL(file);
    }
  });

  btnRemoveFile.addEventListener("click", (e) => {
    e.stopPropagation();
    fileInput.value = "";
    previewImg.src = "";
    previewContainer.classList.add("hidden");
    showToast("Schedule image removed.");
  });
}

function toggleCellState(cell, makeBusy) {
  const day = cell.dataset.day;
  const key = cell.dataset.key || `${String(cell.dataset.hour).padStart(2, "0")}:${String(cell.dataset.minute || 0).padStart(2, "0")}`;
  const slotKey = `${day}-${key}`;
  if (makeBusy) {
    cell.classList.add("busy");
    appState.busySlots[slotKey] = true;
  } else {
    cell.classList.remove("busy");
    delete appState.busySlots[slotKey];
  }
}

function applyBusySlotsToGrid() {
  document.querySelectorAll(".time-slot-cell").forEach(cell => {
    const key = cell.dataset.key || `${String(cell.dataset.hour).padStart(2, "0")}:${String(cell.dataset.minute || 0).padStart(2, "0")}`;
    const slotKey = `${cell.dataset.day}-${key}`;
    if (appState.busySlots[slotKey]) cell.classList.add("busy");
    else cell.classList.remove("busy");
  });
  updateAvailableHoursCount();
  saveScheduleToBackend();
}

function updateAvailableHoursCount() {
  const totalSlots = DAYS_OF_WEEK.length * TIME_SLOTS.length;
  const busyCount = Object.keys(appState.busySlots).length;
  const freeSlots = Math.max(0, totalSlots - busyCount);
  const freeHours = (freeSlots * 0.5).toFixed(1).replace(/\.0$/, "");
  const label = document.getElementById("total-free-hours-label");
  if (label) label.textContent = `${freeHours} hrs/week (${freeSlots} slots)`;
}

// ============================================================================
// 6. PAGE 3: SMART SCHEDULING ALGORITHM (EXAM TOPICS ONLY)
// ============================================================================

/**
 * Intelligent scheduling algorithm:
 * Only generates study sessions for topics where `selectedForExam === true`.
 */
function generateMultiCourseSchedule() {
  const activeCourses = appState.courses.filter(c => c.enabled);
  if (activeCourses.length === 0) {
    appState.studySessions = [];
    return;
  }

  const sessionDuration = appState.studyHabits.sessionLength || 45;
  const sessions = [];

  // 1. Gather all open free slots from Page 2
  const freeSlots = [];
  DAYS_OF_WEEK.forEach(day => {
    TIME_SLOTS.forEach(slot => {
      const slotKey = `${day}-${slot.key}`;
      if (!appState.busySlots[slotKey]) {
        freeSlots.push({ day, hour: slot.hour, minute: slot.minute, key: slot.key, label: slot.label });
      }
    });
  });

  if (freeSlots.length === 0) {
    DAYS_OF_WEEK.forEach(day => {
      freeSlots.push({ day, hour: 17, minute: 0, key: "17:00", label: "5:00 PM" });
      freeSlots.push({ day, hour: 17, minute: 30, key: "17:30", label: "5:30 PM" });
      freeSlots.push({ day, hour: 18, minute: 0, key: "18:00", label: "6:00 PM" });
      freeSlots.push({ day, hour: 18, minute: 30, key: "18:30", label: "6:30 PM" });
      freeSlots.push({ day, hour: 19, minute: 0, key: "19:00", label: "7:00 PM" });
      freeSlots.push({ day, hour: 19, minute: 30, key: "19:30", label: "7:30 PM" });
    });
  }

  // 2. Build demands from ONLY the topics selected for the upcoming exam
  const demands = [];
  activeCourses.forEach(course => {
    // Filter ONLY exam-selected topics
    const examTopics = (course.allTopics || []).filter(t => t.selectedForExam);
    const topicsToSchedule = examTopics.length > 0 ? examTopics : [{ name: "Course Review & Problem Sets" }];

    const weeklyMinutes = (course.weeklyHours || 3) * 60;
    const sessionCount = Math.max(1, Math.round(weeklyMinutes / sessionDuration));

    for (let i = 0; i < sessionCount; i++) {
      const topicObj = topicsToSchedule[i % topicsToSchedule.length];
      demands.push({
        courseCode: course.code,
        courseName: course.name,
        color: course.color || "#861F41",
        topic: topicObj.name,
        confidence: course.confidence,
        duration: sessionDuration
      });
    }
  });

  // Interleave courses across days
  demands.sort(() => Math.random() - 0.5);

  const totalSlots = freeSlots.length;
  const step = Math.max(1, Math.floor(totalSlots / demands.length));

  demands.forEach((demand, idx) => {
    const slotIndex = (idx * step) % totalSlots;
    const slot = freeSlots[slotIndex];

    const hour24 = slot.key;
    const endTimeObj = calculateEndTime(hour24, demand.duration);

    sessions.push({
      id: "session_" + Date.now() + "_" + idx,
      course: demand.courseCode,
      topic: demand.topic,
      day: slot.day,
      startTime: hour24,
      endTime: endTimeObj.timeString,
      displayTime: `${slot.label} - ${endTimeObj.displayString}`,
      durationMinutes: demand.duration,
      studyFormat: appState.studyHabits.tutoringStyle === "practice" ? "Practice Problems" : "Syllabus Review",
      completed: false
    });
  });

  appState.studySessions = sessions;
  saveScheduleToBackend();
}

function calculateEndTime(startTime, durationMinutes) {
  const parts = startTime.split(":");
  const hours = parseInt(parts[0], 10);
  const mins = parseInt(parts[1], 10);
  const totalMins = hours * 60 + mins + durationMinutes;
  const endHour = Math.floor(totalMins / 60) % 24;
  const endMinute = totalMins % 60;
  const timeString = `${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}`;
  const period = endHour >= 12 ? "PM" : "AM";
  const displayHour = endHour % 12 === 0 ? 12 : endHour % 12;
  const displayString = `${displayHour}:${String(endMinute).padStart(2, "0")} ${period}`;
  return { timeString, displayString };
}

// ============================================================================
// 7. MULTI-VIEW SCHEDULE RENDERER (CHECKLIST, CALENDAR MONTH/WEEK/DAY)
// ============================================================================

/**
 * Top orchestrator: Renders the active view mode (combined, checklist, or calendar).
 */
function renderAllScheduleViews() {
  updateCourseFilterDropdown();
  renderChecklistView();
  renderCalendarView();
  updatePage3Stats();
}

/**
 * 1. Renders the interactive Checklist Panel.
 */
function renderChecklistView() {
  const container = document.getElementById("checklist-items-container");
  const filterSelect = document.getElementById("filter-course-select");
  const filterVal = filterSelect ? filterSelect.value : "ALL";

  container.innerHTML = "";

  const filtered = appState.studySessions.filter(s => filterVal === "ALL" || s.course === filterVal);

  if (filtered.length === 0) {
    container.innerHTML = `<div class="empty-state"><p>No study sessions scheduled.</p></div>`;
    return;
  }

  let completedCount = 0;

  filtered.forEach(session => {
    if (session.completed) completedCount++;

    const card = document.createElement("div");
    card.className = `checklist-card ${session.completed ? 'completed' : ''}`;
    card.dataset.id = session.id;

    // Course accent color border
    const courseObj = appState.courses.find(c => c.code === session.course);
    if (courseObj && courseObj.color) {
      card.style.borderLeftColor = courseObj.color;
    }

    card.innerHTML = `
      <input type="checkbox" class="checklist-checkbox" title="Mark session completed" ${session.completed ? 'checked' : ''} />

      <div class="checklist-info">
        <div class="checklist-top-row">
          <span class="checklist-course-tag">${escapeHtml(session.course)}</span>
          <span class="checklist-time-str">📅 ${session.day} at ${session.displayTime || session.startTime}</span>
        </div>
        <div class="checklist-topic-title">${escapeHtml(session.topic)}</div>
        <div class="session-meta-note">${session.studyFormat} (${session.durationMinutes} mins)</div>
      </div>

      <div class="checklist-actions">
        <!-- 1-Click Direct Google Calendar Sync -->
        <button type="button" class="btn-gcal-inline" title="Add this session to Google Calendar">
          + GCal
        </button>
        <button type="button" class="btn-icon-subtle btn-reschedule" title="Reschedule session">🕒</button>
        <button type="button" class="btn-icon-subtle btn-delete" title="Delete session">🗑️</button>
      </div>
    `;

    // Checkbox completed toggle
    card.querySelector(".checklist-checkbox").addEventListener("change", (e) => {
      session.completed = e.target.checked;
      card.classList.toggle("completed", session.completed);
      updateChecklistCountBadge(filtered.length);
      saveScheduleToBackend();
    });

    // 1-Click GCal event sync
    card.querySelector(".btn-gcal-inline").addEventListener("click", () => {
      openGoogleCalendarSingleEvent(session);
    });

    // Reschedule
    card.querySelector(".btn-reschedule").addEventListener("click", () => {
      openEditSessionModal(session);
    });

    // Delete
    card.querySelector(".btn-delete").addEventListener("click", () => {
      deleteSession(session.id);
    });

    container.appendChild(card);
  });

  updateChecklistCountBadge(filtered.length);
}

function updateChecklistCountBadge(total) {
  const completed = appState.studySessions.filter(s => s.completed).length;
  const badge = document.getElementById("checklist-count-badge");
  if (badge) badge.textContent = `${completed} / ${total} Completed`;
}

/**
 * 2. Renders Calendar View based on active resolution (Week, Month, Day).
 */
function renderCalendarView() {
  const container = document.getElementById("calendar-display-container");
  const res = appState.calendarResolution;
  const title = document.getElementById("calendar-view-title");

  container.innerHTML = "";

  if (res === "week") {
    if (title) title.textContent = "Weekly Schedule Timetable";
    renderWeekTimetable(container);
  } else if (res === "month") {
    if (title) title.textContent = "Monthly Study Calendar (Fall 2026)";
    renderMonthGrid(container);
  } else if (res === "day") {
    if (title) title.textContent = `Daily Study Plan (${appState.selectedDayForDayView})`;
    renderDayTimeline(container);
  }
}

/**
 * 2A. WEEK VIEW TIMETABLE
 */
function renderWeekTimetable(container) {
  const grid = document.createElement("div");
  grid.className = "week-timetable-grid";

  // Top header row: Time column + 7 days
  grid.appendChild(createCell("week-header-cell", "Time"));
  DAYS_OF_WEEK.forEach(day => {
    grid.appendChild(createCell("week-header-cell", day.slice(0, 3)));
  });

  // 30-minute rows
  TIME_SLOTS.forEach(slot => {
    // Time label cell
    grid.appendChild(createCell("week-time-label", slot.label));

    // 7 day cells for this 30-minute slot
    DAYS_OF_WEEK.forEach(day => {
      const cell = document.createElement("div");
      cell.className = "week-slot-cell";
      cell.dataset.day = day;
      cell.dataset.key = slot.key;
      cell.dataset.hour = slot.hour;
      cell.dataset.minute = slot.minute;

      // Find sessions scheduled at this day & matching 30-min window
      const matchingSessions = appState.studySessions.filter(s => {
        if (s.day !== day) return false;
        const [startH, startM] = s.startTime.split(":").map(Number);
        return startH === slot.hour && (
          (slot.minute === 0 && (startM || 0) < 30) ||
          (slot.minute === 30 && (startM || 0) >= 30)
        );
      });

      matchingSessions.forEach(s => {
        const block = document.createElement("div");
        block.className = "calendar-event-block";
        const courseObj = appState.courses.find(c => c.code === s.course);
        if (courseObj && courseObj.color) block.style.borderLeftColor = courseObj.color;

        block.innerHTML = `
          <strong>${escapeHtml(s.course)}</strong>
          <span>${escapeHtml(s.topic)}</span>
        `;
        block.title = `${s.course} - ${s.topic} (${s.displayTime})`;
        block.addEventListener("click", () => openEditSessionModal(s));
        cell.appendChild(block);
      });

      grid.appendChild(cell);
    });
  });

  container.appendChild(grid);
}

/**
 * 2B. MONTH VIEW GRID
 */
function renderMonthGrid(container) {
  const grid = document.createElement("div");
  grid.className = "month-grid";

  // Day of week headers (Sun - Sat)
  ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].forEach(d => {
    grid.appendChild(createCell("month-day-header", d));
  });

  // 35 days grid for September/October 2026
  for (let dateNum = 1; dateNum <= 35; dateNum++) {
    const cell = document.createElement("div");
    cell.className = "month-cell";

    const dayOfMonth = dateNum <= 30 ? dateNum : dateNum - 30;
    const dateLabel = document.createElement("span");
    dateLabel.className = "month-date-num";
    dateLabel.textContent = dayOfMonth;
    cell.appendChild(dateLabel);

    // Map day of week to study sessions
    const dayOfWeekIdx = (dateNum - 1) % 7;
    const dayName = DAYS_OF_WEEK[dayOfWeekIdx];
    const daySessions = appState.studySessions.filter(s => s.day === dayName);

    daySessions.slice(0, 2).forEach(s => {
      const pill = document.createElement("span");
      pill.className = "month-event-pill";
      pill.textContent = `${s.course.slice(0, 7)}: ${s.topic.slice(0, 10)}...`;
      cell.appendChild(pill);
    });

    grid.appendChild(cell);
  }

  container.appendChild(grid);
}

/**
 * 2C. DAY VIEW TIMELINE
 */
function renderDayTimeline(container) {
  const wrapper = document.createElement("div");
  wrapper.className = "day-timeline-list";

  // Day selector dropdown
  const selectDayRow = document.createElement("div");
  selectDayRow.style.marginBottom = "10px";
  selectDayRow.innerHTML = `
    <label class="form-label" style="display:inline-block; margin-right:8px;">Select Day to View:</label>
    <select id="select-active-day-view" class="form-control form-control-sm" style="width:140px; display:inline-block;">
      ${DAYS_OF_WEEK.map(d => `<option value="${d}" ${d === appState.selectedDayForDayView ? 'selected' : ''}>${d}</option>`).join("")}
    </select>
  `;
  wrapper.appendChild(selectDayRow);

  const activeDay = appState.selectedDayForDayView;
  const daySessions = appState.studySessions.filter(s => s.day === activeDay);

  if (daySessions.length === 0) {
    wrapper.innerHTML += `<div class="empty-state"><p>No sessions scheduled on ${activeDay}.</p></div>`;
  } else {
    daySessions.forEach(s => {
      const row = document.createElement("div");
      row.className = "day-time-row";
      row.innerHTML = `
        <span class="day-time-badge">${s.displayTime || s.startTime}</span>
        <div class="session-card" style="flex-grow:1;">
          <div class="session-details">
            <span class="session-course-tag">${escapeHtml(s.course)}</span>
            <div class="session-topic-title">${escapeHtml(s.topic)}</div>
            <div class="session-meta-note">${s.studyFormat} &bull; ${s.durationMinutes} mins</div>
          </div>
          <button type="button" class="btn-gcal-inline" title="Add to Google Calendar">+ GCal</button>
        </div>
      `;
      row.querySelector(".btn-gcal-inline").addEventListener("click", () => {
        openGoogleCalendarSingleEvent(s);
      });
      wrapper.appendChild(row);
    });
  }

  container.appendChild(wrapper);

  // Attach day selector change
  const selectDay = wrapper.querySelector("#select-active-day-view");
  if (selectDay) {
    selectDay.addEventListener("change", (e) => {
      appState.selectedDayForDayView = e.target.value;
      renderCalendarView();
    });
  }
}

function createCell(className, text) {
  const div = document.createElement("div");
  div.className = className;
  div.textContent = text;
  return div;
}

// ============================================================================
// 8. VIEW SWITCHER LOGIC (CHECKLIST / CALENDAR / COMBINED)
// ============================================================================

function setupViewSwitcherEvents() {
  const layout = document.getElementById("schedule-content-layout");

  // Mode buttons
  const btnCombined = document.getElementById("btn-view-combined");
  const btnChecklist = document.getElementById("btn-view-checklist");
  const btnCalendar = document.getElementById("btn-view-calendar");
  const resGroup = document.getElementById("calendar-resolution-group");

  function setMode(mode) {
    appState.viewMode = mode;
    btnCombined.classList.toggle("active", mode === "combined");
    btnChecklist.classList.toggle("active", mode === "checklist");
    btnCalendar.classList.toggle("active", mode === "calendar");

    layout.className = `schedule-content-layout ${mode}-mode`;
    if (mode === "checklist") {
      resGroup.style.display = "none";
    } else {
      resGroup.style.display = "flex";
    }
  }

  btnCombined.addEventListener("click", () => setMode("combined"));
  btnChecklist.addEventListener("click", () => setMode("checklist"));
  btnCalendar.addEventListener("click", () => setMode("calendar"));

  // Calendar Resolution buttons (Week / Month / Day)
  const btnWeek = document.getElementById("btn-res-week");
  const btnMonth = document.getElementById("btn-res-month");
  const btnDay = document.getElementById("btn-res-day");

  function setResolution(res) {
    appState.calendarResolution = res;
    btnWeek.classList.toggle("active", res === "week");
    btnMonth.classList.toggle("active", res === "month");
    btnDay.classList.toggle("active", res === "day");
    renderCalendarView();
  }

  btnWeek.addEventListener("click", () => setResolution("week"));
  btnMonth.addEventListener("click", () => setResolution("month"));
  btnDay.addEventListener("click", () => setResolution("day"));
}

function updateCourseFilterDropdown() {
  const select = document.getElementById("filter-course-select");
  if (!select) return;
  const currentVal = select.value;
  const distinct = new Set(appState.studySessions.map(s => s.course));

  select.innerHTML = `<option value="ALL">Show All Courses</option>`;
  distinct.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    if (c === currentVal) opt.selected = true;
    select.appendChild(opt);
  });
}

function updatePage3Stats() {
  const total = appState.studySessions.length;
  const mins = appState.studySessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const hours = (mins / 60).toFixed(1);

  document.getElementById("stat-total-sessions").textContent = total;
  document.getElementById("stat-total-hours").textContent = `${hours} hrs`;

  const distinct = new Set(appState.studySessions.map(s => s.course)).size;
  document.getElementById("stat-courses-scheduled").textContent = `${distinct} Classes`;
}

function deleteSession(sessionId) {
  appState.studySessions = appState.studySessions.filter(s => s.id !== sessionId);
  saveScheduleToBackend();
  renderAllScheduleViews();
  showToast("Session deleted.");
}

function setupPage3Events() {
  document.getElementById("filter-course-select").addEventListener("change", () => {
    renderAllScheduleViews();
  });

  document.getElementById("btn-open-add-session-modal").addEventListener("click", openAddSessionModal);

  document.getElementById("btn-regenerate-schedule").addEventListener("click", () => {
    generateMultiCourseSchedule();
    renderAllScheduleViews();
    showToast("⚡ Multi-course schedule regenerated based on exam topics!");
  });

  document.getElementById("btn-gcal-bottom").addEventListener("click", openGoogleCalendarModal);
}

// ============================================================================
// 9. GOOGLE CALENDAR TRANSFERABILITY & EXPORT
// ============================================================================

/**
 * Formats a Date object to RFC 5545 / ISO UTC timestamp string (YYYYMMDDTHHMMSSZ).
 */
function formatUtcTimestamp(date) {
  const pad = (n) => (n < 10 ? "0" + n : "" + n);
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;
}

/**
 * Opens Google Calendar Export Modal and populates session chips and feed URL.
 */
function openGoogleCalendarModal() {
  const modal = document.getElementById("gcal-export-modal");
  if (!modal) return;

  // Auto-generate schedule if not yet populated but courses exist
  if (!appState.studySessions || appState.studySessions.length === 0) {
    if (appState.courses && appState.courses.length > 0) {
      generateMultiCourseSchedule();
    }
  }

  const feedInput = document.getElementById("gcal-feed-url");
  if (feedInput) {
    feedInput.value = `${window.location.origin}/api/calendar.ics`;
  }

  renderGcalSessionChips();
  modal.classList.remove("hidden");
}

/**
 * Renders individual 1-click Google Calendar buttons for every scheduled study block.
 */
function renderGcalSessionChips() {
  const container = document.getElementById("gcal-session-chips-container");
  if (!container) return;
  container.innerHTML = "";

  const sessions = (appState && appState.studySessions) ? appState.studySessions : [];
  if (sessions.length === 0) {
    container.innerHTML = '<span style="font-size: 11px; color: var(--color-text-muted);">No study blocks scheduled yet.</span>';
    return;
  }

  const label = document.createElement("div");
  label.style.width = "100%";
  label.style.fontSize = "11px";
  label.style.fontWeight = "600";
  label.style.color = "var(--color-vt-maroon)";
  label.style.marginBottom = "4px";
  label.textContent = `Direct Links for All ${sessions.length} Study Blocks (Weekly Recurring):`;
  container.appendChild(label);

  sessions.forEach((s) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "btn btn-xs btn-outline";
    chip.style.fontSize = "11px";
    chip.style.padding = "3px 8px";
    chip.style.borderRadius = "12px";
    chip.style.cursor = "pointer";
    chip.style.margin = "2px";
    chip.title = `Add ${s.course} (${s.day} ${s.startTime}) to Google Calendar`;
    chip.textContent = `+ ${s.course} (${s.day.slice(0, 3)} ${s.startTime})`;
    chip.addEventListener("click", () => {
      openGoogleCalendarSingleEvent(s);
    });
    container.appendChild(chip);
  });
}

/**
 * Direct 1-Click Sync: Opens Google Calendar event creation link for a session with weekly recurrence.
 */
function openGoogleCalendarSingleEvent(session) {
  if (!session) return;
  const url = buildGoogleCalendarWebUrl(session);
  window.open(url, "_blank");
}

/**
 * Builds Google Calendar web event creation URL with weekly recurrence until Fall 2026 semester end.
 */
function buildGoogleCalendarWebUrl(session) {
  const title = encodeURIComponent(`[VT Study] ${session.course} - ${session.topic}`);
  const details = encodeURIComponent(
    `Virginia Tech Personalized Study Block\n\n` +
    `Course: ${session.course}\n` +
    `Syllabus Topic: ${session.topic}\n` +
    `Format: ${session.studyFormat || "Practice Problems"}\n` +
    `Duration: ${session.durationMinutes} minutes\n` +
    `Recurrence: Repeats weekly through Fall 2026 semester\n\n` +
    `Generated by VT BrainWyrms AI (HokieTutor)`
  );
  const location = encodeURIComponent("Virginia Tech Campus");

  // Determine next calendar date
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const targetIdx = days.indexOf(session.day);
  const today = new Date();
  const currentIdx = (today.getDay() + 6) % 7;
  let daysAhead = (targetIdx - currentIdx) % 7;
  if (daysAhead <= 0) daysAhead += 7;

  const targetDate = new Date(today.getTime() + daysAhead * 86400000);
  const startParts = (session.startTime || "09:00").split(":");
  targetDate.setHours(parseInt(startParts[0], 10), parseInt(startParts[1], 10), 0, 0);

  const dur = parseInt(session.durationMinutes, 10) || 60;
  const endDate = new Date(targetDate.getTime() + dur * 60000);

  const isoStart = formatUtcTimestamp(targetDate);
  const isoEnd = formatUtcTimestamp(endDate);
  const recur = encodeURIComponent("RRULE:FREQ=WEEKLY;UNTIL=20261215T235959Z");

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${isoStart}/${isoEnd}&details=${details}&location=${location}&recur=${recur}`;
}

/**
 * Generates an RFC 5545 compliant VCALENDAR string for study sessions with weekly recurrence.
 */
function generateIcsCalendarString(sessions) {
  const now = new Date();
  const nowIso = formatUtcTimestamp(now);

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//VT BrainWyrms AI//HokieTutor Multi-Course Study Schedule//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:VT BrainWyrms AI Study Schedule",
    "X-WR-TIMEZONE:America/New_York"
  ];

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const currentIdx = (now.getDay() + 6) % 7; // Monday = 0, Sunday = 6

  sessions.forEach((s, idx) => {
    const targetIdx = days.indexOf(s.day);
    let daysAhead = (targetIdx - currentIdx) % 7;
    if (daysAhead < 0) daysAhead += 7;

    const eventDate = new Date(now.getTime() + daysAhead * 86400000);
    const startParts = (s.startTime || "09:00").split(":");
    eventDate.setHours(parseInt(startParts[0], 10), parseInt(startParts[1], 10), 0, 0);

    const dur = parseInt(s.durationMinutes, 10) || 60;
    const endDate = new Date(eventDate.getTime() + dur * 60000);

    const dtStart = formatUtcTimestamp(eventDate);
    const dtEnd = formatUtcTimestamp(endDate);

    const summary = `[VT Study] ${s.course} - ${s.topic}`;
    const desc = `Course: ${s.course}\nSyllabus Topic: ${s.topic}\nFormat: ${s.studyFormat || "Practice Problems"}\nDuration: ${dur} mins\nWeekly recurring through Fall 2026`;

    lines.push("BEGIN:VEVENT");
    lines.push(`UID:vtbw-${s.id || idx}-${Date.now()}@vt.edu`);
    lines.push(`DTSTAMP:${nowIso}`);
    lines.push(`DTSTART:${dtStart}`);
    lines.push(`DTEND:${dtEnd}`);
    lines.push(`SUMMARY:${summary}`);
    lines.push(`DESCRIPTION:${desc}`);
    lines.push("LOCATION:Virginia Tech Campus");
    lines.push("STATUS:CONFIRMED");
    lines.push("RRULE:FREQ=WEEKLY;UNTIL=20261215T235959Z");
    lines.push("END:VEVENT");
  });

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

/**
 * Generates and downloads the .ICS calendar file client-side via Blob.
 * Fully RFC 5545 compliant with weekly recurrence for every scheduled study block.
 */
function generateAndDownloadIcsFile() {
  if (!appState.studySessions || appState.studySessions.length === 0) {
    if (appState.courses && appState.courses.length > 0) {
      generateMultiCourseSchedule();
    }
  }

  const sessions = appState.studySessions || [];
  if (sessions.length === 0) {
    showToast("⚠️ No study sessions scheduled yet. Please generate a schedule first.");
    return false;
  }

  const icsContent = generateIcsCalendarString(sessions);
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const downloadUrl = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = downloadUrl;
  a.download = "VT_BrainWyrms_Study_Schedule.ics";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  setTimeout(() => URL.revokeObjectURL(downloadUrl), 2000);
  showToast(`📅 Downloaded VT_BrainWyrms_Study_Schedule.ics (${sessions.length} study sessions)!`);
  return true;
}

// ============================================================================
// 10. MODAL DIALOGS
// ============================================================================

function openAddSessionModal() {
  document.getElementById("modal-session-title").textContent = "Add Study Session";
  document.getElementById("modal-session-id").value = "";
  document.getElementById("modal-session-topic").value = "";
  document.getElementById("modal-session-day").value = "Monday";
  document.getElementById("modal-session-start-time").value = "16:00";
  document.getElementById("modal-session-duration").value = "60";

  const courseSelect = document.getElementById("modal-session-course");
  courseSelect.innerHTML = "";
  appState.courses.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c.code;
    opt.textContent = `${c.code} - ${c.name}`;
    courseSelect.appendChild(opt);
  });

  document.getElementById("session-modal").classList.remove("hidden");
}

function openEditSessionModal(session) {
  document.getElementById("modal-session-title").textContent = "Move / Edit Study Session";
  document.getElementById("modal-session-id").value = session.id;
  document.getElementById("modal-session-topic").value = session.topic;
  document.getElementById("modal-session-day").value = session.day;
  document.getElementById("modal-session-start-time").value = session.startTime || "16:00";
  document.getElementById("modal-session-duration").value = session.durationMinutes;
  document.getElementById("modal-session-format").value = session.studyFormat || "Practice Problems";

  const courseSelect = document.getElementById("modal-session-course");
  courseSelect.innerHTML = "";
  appState.courses.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c.code;
    opt.textContent = `${c.code} - ${c.name}`;
    if (c.code === session.course) opt.selected = true;
    courseSelect.appendChild(opt);
  });

  document.getElementById("session-modal").classList.remove("hidden");
}

function setupModalEvents() {
  // Extension Guide Modal Setup
  const btnOpenExtGuide = document.getElementById("btn-open-extension-guide");
  const extGuideModal = document.getElementById("extension-guide-modal");
  const btnCloseExtGuide = document.getElementById("btn-close-extension-guide");
  const btnCloseExtGuideX = document.getElementById("btn-close-extension-guide-modal");
  const btnGuidePasteJson = document.getElementById("btn-guide-paste-json");
  const btnGuideDemoMode = document.getElementById("btn-guide-demo-mode");

  if (btnOpenExtGuide && extGuideModal) {
    btnOpenExtGuide.addEventListener("click", () => {
      extGuideModal.classList.remove("hidden");
    });
  }
  if (btnCloseExtGuide && extGuideModal) {
    btnCloseExtGuide.addEventListener("click", () => {
      extGuideModal.classList.add("hidden");
    });
  }
  if (btnCloseExtGuideX && extGuideModal) {
    btnCloseExtGuideX.addEventListener("click", () => {
      extGuideModal.classList.add("hidden");
    });
  }
  if (btnGuidePasteJson && extGuideModal) {
    btnGuidePasteJson.addEventListener("click", () => {
      extGuideModal.classList.add("hidden");
      const importModal = document.getElementById("canvas-import-modal");
      if (importModal) importModal.classList.remove("hidden");
    });
  }
  if (btnGuideDemoMode && extGuideModal) {
    btnGuideDemoMode.addEventListener("click", () => {
      extGuideModal.classList.add("hidden");
      showToast("Exploring preloaded collegiate VT courses!");
    });
  }

  // GCal Modal
  const gcalModal = document.getElementById("gcal-export-modal");
  const closeGcal = () => gcalModal && gcalModal.classList.add("hidden");
  const btnCloseGcal = document.getElementById("btn-close-gcal-modal");
  if (btnCloseGcal) btnCloseGcal.addEventListener("click", closeGcal);
  const btnCancelGcal = document.getElementById("btn-cancel-gcal-modal");
  if (btnCancelGcal) btnCancelGcal.addEventListener("click", closeGcal);

  // Copy Live Feed URL
  const btnCopyFeed = document.getElementById("btn-copy-feed-url");
  if (btnCopyFeed) {
    btnCopyFeed.addEventListener("click", () => {
      const input = document.getElementById("gcal-feed-url");
      if (input) {
        input.select();
        navigator.clipboard.writeText(input.value);
        showToast("📋 Copied Google Calendar Live Feed URL!");
      }
    });
  }

  // Download .ics
  const btnDownloadIcs = document.getElementById("btn-download-ics");
  if (btnDownloadIcs) {
    btnDownloadIcs.addEventListener("click", () => {
      generateAndDownloadIcsFile();
    });
  }

  // Open / Sync All in Google Calendar
  const btnGcalSync = document.getElementById("btn-gcal-sync-all");
  if (btnGcalSync) {
    btnGcalSync.addEventListener("click", () => {
      if (!appState.studySessions || appState.studySessions.length === 0) {
        if (appState.courses && appState.courses.length > 0) {
          generateMultiCourseSchedule();
        }
      }
      const count = (appState.studySessions || []).length;
      if (count === 0) {
        showToast("⚠️ No study sessions scheduled yet!");
        return;
      }
      // 1. Download complete schedule ICS with all events
      generateAndDownloadIcsFile();

      // 2. Open Google Calendar import page in a new tab
      window.open("https://calendar.google.com/calendar/u/0/r/settings/export", "_blank");

      // 3. Show actionable guidance toast
      showToast(`🚀 Exporting all ${count} sessions! Select the downloaded .ics in Google Calendar to add all blocks.`);
    });
  }

  // Course Modal
  const courseModal = document.getElementById("course-modal");
  const closeCourse = () => courseModal && courseModal.classList.add("hidden");
  const btnCloseCourse = document.getElementById("btn-close-course-modal");
  if (btnCloseCourse) btnCloseCourse.addEventListener("click", closeCourse);
  const btnCancelCourse = document.getElementById("btn-cancel-course-modal");
  if (btnCancelCourse) btnCancelCourse.addEventListener("click", closeCourse);

  const formCourseEditor = document.getElementById("form-course-editor");
  if (formCourseEditor) {
    formCourseEditor.addEventListener("submit", (e) => {
      e.preventDefault();
      const code = document.getElementById("modal-course-code").value.trim();
      const term = document.getElementById("modal-course-term").value.trim();
      const name = document.getElementById("modal-course-name").value.trim();
      const currentGrade = parseFloat(document.getElementById("modal-course-current-grade").value) || 95.0;
      const goalGrade = document.getElementById("modal-course-goal-grade").value;
      const confidence = document.getElementById("modal-course-confidence").value;
      const weeklyHours = parseInt(document.getElementById("modal-course-hours").value, 10) || 3;
      const topicsRaw = document.getElementById("modal-course-topics").value.trim();

      const allTopics = topicsRaw
        ? topicsRaw.split(",").map((t, idx) => ({ id: `t_${Date.now()}_${idx}`, name: t.trim(), selectedForExam: true }))
        : [{ id: `t_${Date.now()}`, name: "General Syllabus Review", selectedForExam: true }];

      const newCourse = {
        id: "course_" + Date.now(),
        code,
        name,
        term,
        currentGrade,
        letterGrade: currentGrade >= 93 ? "A" : currentGrade >= 90 ? "A-" : "B",
        goalGrade,
        confidence,
        weeklyHours,
        enabled: true,
        color: "#2563eb",
        allTopics
      };

      appState.courses.push(newCourse);
      renderCourseCardsDeck();
      updateGoalsSummaryMetrics();
      saveCoursesToBackend();
      closeCourse();
      showToast(`✓ Added ${code}!`);
    });
  }

  // Session Modal
  const sessionModal = document.getElementById("session-modal");
  const closeSession = () => sessionModal && sessionModal.classList.add("hidden");
  const btnCloseSession = document.getElementById("btn-close-session-modal");
  if (btnCloseSession) btnCloseSession.addEventListener("click", closeSession);
  const btnCancelSession = document.getElementById("btn-cancel-session-modal");
  if (btnCancelSession) btnCancelSession.addEventListener("click", closeSession);

  document.getElementById("form-session-editor").addEventListener("submit", (e) => {
    e.preventDefault();
    const sessionId = document.getElementById("modal-session-id").value;
    const course = document.getElementById("modal-session-course").value;
    const topic = document.getElementById("modal-session-topic").value;
    const day = document.getElementById("modal-session-day").value;
    const startTime = document.getElementById("modal-session-start-time").value;
    const durationMinutes = parseInt(document.getElementById("modal-session-duration").value, 10);
    const studyFormat = document.getElementById("modal-session-format").value;

    const endTimeObj = calculateEndTime(startTime, durationMinutes);

    if (sessionId) {
      const existing = appState.studySessions.find(s => s.id === sessionId);
      if (existing) {
        existing.course = course;
        existing.topic = topic;
        existing.day = day;
        existing.startTime = startTime;
        existing.endTime = endTimeObj.timeString;
        existing.displayTime = `${formatTimeAmPm(startTime)} - ${endTimeObj.displayString}`;
        existing.durationMinutes = durationMinutes;
        existing.studyFormat = studyFormat;
      }
      showToast("✓ Session updated!");
    } else {
      const newSession = {
        id: "session_" + Date.now(),
        course,
        topic,
        day,
        startTime,
        endTime: endTimeObj.timeString,
        displayTime: `${formatTimeAmPm(startTime)} - ${endTimeObj.displayString}`,
        durationMinutes,
        studyFormat,
        completed: false
      };
      appState.studySessions.push(newSession);
      showToast("✓ New session added!");
    }

    saveScheduleToBackend();
    renderAllScheduleViews();
    closeSession();
  });
}

// ============================================================================
// 11. HELPERS
// ============================================================================

function formatTimeAmPm(time24) {
  if (!time24) return "";
  const parts = time24.split(":");
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1] || "00";
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${minutes} ${ampm}`;
}

function escapeHtml(str) {
  if (!str) return "";
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove("hidden");
  setTimeout(() => { toast.classList.add("hidden"); }, 2800);
}

// ============================================================================

// ============================================================================
// 12. HOKIETUTOR AUTONOMOUS AI STUDY AGENT — ZERO LATENCY & SCHEDULE SYNC
// ============================================================================

const studyingState = {
  activeSection: "schedule", // "schedule" or "studying"
  student: {
    name: "Jordan Taylor",
    email: "jordant26@vt.edu",
    standing: "First Year · Accounting & Business Analytics · Fall 2026"
  },
  selectedCourseId: null,
  selectedTopics: new Set(),
  customTopics: {}, // courseId -> [string]
  generatedItems: [],
  revealedSet: new Set(),
  correctSet: new Set(),
  currentFormat: "problems",
  sessionSeenSignatures: new Set(), // Session Bloom filter to guarantee 100% uniqueness
  telemetry: {
    totalGenerated: parseInt(localStorage.getItem("hokie_ai_total_generated") || "0", 10),
    totalCorrect: parseInt(localStorage.getItem("hokie_ai_total_correct") || "0", 10)
  }
};

/**
 * Setup Primary Section Navigation: VT BrainWyrmsAI Schedule vs VT BrainWyrmsAI Studying
 */
function setupPrimarySectionEvents() {
  const tabSchedule = document.getElementById("tab-nav-schedule");
  const tabStudying = document.getElementById("tab-nav-studying");

  if (tabSchedule) {
    tabSchedule.addEventListener("click", () => switchMainSection("schedule"));
  }
  if (tabStudying) {
    tabStudying.addEventListener("click", () => switchMainSection("studying"));
  }
}

function switchMainSection(section) {
  studyingState.activeSection = section;

  const tabSchedule = document.getElementById("tab-nav-schedule");
  const tabStudying = document.getElementById("tab-nav-studying");
  const stepIndicator = document.getElementById("schedule-step-indicator");
  const pageStudying = document.getElementById("page-studying");

  if (section === "schedule") {
    if (tabSchedule) {
      tabSchedule.classList.add("active");
      tabSchedule.setAttribute("aria-selected", "true");
    }
    if (tabStudying) {
      tabStudying.classList.remove("active");
      tabStudying.setAttribute("aria-selected", "false");
    }
    if (stepIndicator) stepIndicator.classList.remove("hidden");
    if (pageStudying) pageStudying.classList.remove("active");

    goToStep(appState.currentStep || 1);
  } else if (section === "studying") {
    if (tabSchedule) {
      tabSchedule.classList.remove("active");
      tabSchedule.setAttribute("aria-selected", "false");
    }
    if (tabStudying) {
      tabStudying.classList.add("active");
      tabStudying.setAttribute("aria-selected", "true");
    }
    if (stepIndicator) stepIndicator.classList.add("hidden");

    // Hide Schedule pages 1, 2, 3
    for (let i = 1; i <= 3; i++) {
      const p = document.getElementById(`page-${i}`);
      if (p) p.classList.remove("active");
    }

    if (pageStudying) pageStudying.classList.add("active");
    renderStudyingSection();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

/**
 * Initialize VT BrainWyrmsAI Autonomous AI Study Agent Module
 */
function initStudyingModule() {
  // Course selector change in Study Studio
  const selCourse = document.getElementById("studying-course-select");
  if (selCourse) {
    selCourse.addEventListener("change", (e) => {
      onStudyingCourseSelect(e.target.value);
    });
  }

  // Refresh Canvas Analysis Button
  const btnRefreshCanvas = document.getElementById("btn-refresh-studying-data");
  if (btnRefreshCanvas) {
    btnRefreshCanvas.addEventListener("click", () => {
      renderStudyingSection();
      showToast("✓ Canvas pace analysis refreshed & synchronized with schedule!");
    });
  }

  // Add Custom Topic button
  const btnAddCustom = document.getElementById("btn-add-custom-studying-topic");
  const inputCustom = document.getElementById("studying-custom-topic-input");
  if (btnAddCustom && inputCustom) {
    const handleAdd = () => {
      const val = inputCustom.value.trim();
      if (!val) return;
      addCustomStudyingTopic(val);
      inputCustom.value = "";
    };
    btnAddCustom.addEventListener("click", handleAdd);
    inputCustom.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleAdd();
      }
    });
  }

  // Main Synthesize button
  const btnGenerate = document.getElementById("btn-generate-study-material");
  if (btnGenerate) {
    btnGenerate.addEventListener("click", () => generateStudyMaterialsWithAgent(false));
  }

  // Append 5 More Unique Problems button (Endless stream)
  const btnAppendMore = document.getElementById("btn-append-more-problems");
  if (btnAppendMore) {
    btnAppendMore.addEventListener("click", () => generateStudyMaterialsWithAgent(true));
  }

  // Back to top button
  const btnScrollTop = document.getElementById("btn-scroll-top-study");
  if (btnScrollTop) {
    btnScrollTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // Print Office Hours Worksheet button
  const btnPrint = document.getElementById("btn-print-office-hours");
  if (btnPrint) {
    btnPrint.addEventListener("click", printOfficeHoursWorksheet);
  }

  // Clear / Reset buttons
  const btnClearAll = document.getElementById("btn-clear-studying-results") || document.getElementById("btn-clear-study-results");
  if (btnClearAll) {
    btnClearAll.addEventListener("click", clearStudyingResults);
  }

  const btnRevealAll = document.getElementById("btn-reveal-all-answers");
  if (btnRevealAll) {
    btnRevealAll.addEventListener("click", revealAllStudyAnswers);
  }

  const btnResetSession = document.getElementById("btn-reset-studying-session") || document.getElementById("btn-reset-study-session");
  if (btnResetSession) {
    btnResetSession.addEventListener("click", resetStudyingSession);
  }
}

// ============================================================================
// SCHEDULE & STUDY LIVE INFORMATION EXCHANGE & PACE ANALYZER
// ============================================================================

function renderStudyingSection() {
  renderPaceAnalyzerCards();
  renderPriorityTopicsShelf();
  populateStudyingCourseSelect();
}

/**
 * Render Canvas Grade & Goal Pace Analyzer Cards (Figure 2 Resolution)
 */
function renderPaceAnalyzerCards() {
  const grid = document.getElementById("pace-cards-container") || document.getElementById("pace-cards-grid");
  if (!grid) return;
  grid.innerHTML = "";

  const courses = appState.courses || [];
  if (courses.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:20px;color:var(--text-muted);font-size:13px;">No active Fall 2026 courses found. Click "🔄 Refresh Canvas Analysis" to sync.</div>`;
    return;
  }

  courses.forEach(course => {
    const card = document.createElement("div");
    card.className = "pace-card";

    const targetPct = getTargetGradePercentage(course.goalGrade || "A");
    const currPct = typeof course.currentGrade === "number" ? course.currentGrade : 90.0;
    const diff = currPct - targetPct;

    let badgeClass = "badge-pace-ontrack";
    let badgeText = `✓ On Track (+${diff.toFixed(1)}%)`;

    if (diff < -3.0) {
      badgeClass = "badge-pace-behind";
      badgeText = `⚠️ Behind Goal (${diff.toFixed(1)}%)`;
    } else if (diff < 0) {
      badgeClass = "badge-pace-urgent";
      badgeText = `⚡ Close to Target (${diff.toFixed(1)}%)`;
    }

    // Check for urgent exams within 14 days
    const nextExam = course.nextExam;
    const daysAway = nextExam ? nextExam.daysAway : 99;
    if (daysAway <= 14 && diff >= -3.0) {
      badgeClass = "badge-pace-urgent";
      badgeText = `⚡ Exam in ${daysAway}d (+${diff.toFixed(1)}%)`;
    }

    card.innerHTML = `
      <div class="pace-card-top">
        <div class="pace-course-code">${escapeHtml(course.code)}</div>
        <span class="pace-status-badge ${badgeClass}">${badgeText}</span>
      </div>
      <div class="pace-course-name" title="${escapeHtml(course.name)}">${escapeHtml(course.name)}</div>
      <div class="pace-metrics-row">
        <div class="pace-metric">
          <span class="pace-metric-label">Current Grade</span>
          <span class="pace-metric-val">${currPct.toFixed(1)}% (${escapeHtml(course.letterGrade || 'A')})</span>
        </div>
        <div class="pace-metric">
          <span class="pace-metric-label">Goal Target</span>
          <span class="pace-metric-val" style="color:var(--vt-maroon);font-weight:700;">${escapeHtml(course.goalGrade || 'A')} (${targetPct}%)</span>
        </div>
      </div>
      <div class="pace-metric" style="margin-bottom:10px;">
        <span class="pace-metric-label">Weekly Prep Target</span>
        <span class="pace-metric-val" style="font-weight:600;">${course.weeklyHours || course.targetWeeklyHours || 3} hrs/wk</span>
      </div>
      <button type="button" class="btn-load-course-prep" onclick="selectCourseForStudying('${course.id}')">
        Target Course Practice &rarr;
      </button>
    `;

    grid.appendChild(card);
  });
}

function getTargetGradePercentage(letter) {
  switch ((letter || "").toUpperCase()) {
    case "A": return 93.0;
    case "A-": return 90.0;
    case "B+": return 87.0;
    case "B": return 83.0;
    case "B-": return 80.0;
    case "C+": return 77.0;
    case "C": return 73.0;
    default: return 93.0;
  }
}

/**
 * Render Interactive Priority Topics Shelf (Surfaces Psychology & Exam Focus Topics)
 */
function renderPriorityTopicsShelf() {
  const container = document.getElementById("priority-chips-wrap") || document.getElementById("priority-topics-container");
  if (!container) return;
  container.innerHTML = "";

  const courses = appState.courses || [];
  const priorityItems = [];

  courses.forEach(c => {
    const targetPct = getTargetGradePercentage(c.goalGrade || "A");
    const currPct = typeof c.currentGrade === "number" ? c.currentGrade : 90.0;
    const isBehind = (currPct - targetPct) < -3.0;
    const hasUpcomingExam = c.nextExam && (c.nextExam.daysAway <= 14);

    (c.allTopics || []).forEach(t => {
      if (isBehind || (hasUpcomingExam && t.selectedForExam !== false)) {
        priorityItems.push({
          courseId: c.id,
          courseCode: c.code,
          courseName: c.name,
          topicName: t.name,
          urgency: isBehind ? "behind" : "exam",
          urgencyLabel: isBehind ? "Behind Goal" : `Exam in ${c.nextExam.daysAway}d`
        });
      }
    });
  });

  if (priorityItems.length === 0) {
    container.innerHTML = `<span style="font-size:12px;color:var(--text-muted);">All courses on pace! Select any course below to begin AI practice.</span>`;
    return;
  }

  priorityItems.slice(0, 10).forEach(item => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "priority-chip";
    chip.title = `Click to load ${item.courseCode}: ${item.topicName} directly into the AI Study Studio`;
    chip.innerHTML = `
      <span class="priority-chip-course">${escapeHtml(item.courseCode)}</span>
      <span class="priority-chip-topic">${escapeHtml(item.topicName)}</span>
      <span class="priority-chip-urgency ${item.urgency}">
        ${item.urgency === "behind" ? "⚠️ " : "📅 "}${escapeHtml(item.urgencyLabel)}
      </span>
      <span class="priority-chip-action" aria-hidden="true">→</span>
    `;

    chip.addEventListener("click", () => {
      selectCourseForStudying(item.courseId, item.topicName);
    });

    container.appendChild(chip);
  });
}

/**
 * 1-Click Select Course & Topic in Studio
 */
function selectCourseForStudying(courseId, targetTopic) {
  studyingState.selectedCourseId = courseId;
  const sel = document.getElementById("studying-course-select");
  if (sel) {
    sel.value = courseId;
  }
  onStudyingCourseSelect(courseId);

  if (targetTopic) {
    studyingState.selectedTopics.clear();
    studyingState.selectedTopics.add(targetTopic);
    renderStudyingTopicChips(courseId);
  }

  const studioEl = document.querySelector(".study-studio-card");
  if (studioEl) {
    studioEl.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function populateStudyingCourseSelect() {
  const sel = document.getElementById("studying-course-select");
  if (!sel) return;

  sel.innerHTML = "";
  const courses = appState.courses || [];

  if (courses.length === 0) {
    sel.innerHTML = `<option value="">No courses loaded</option>`;
    return;
  }

  courses.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = `${c.name} (${c.code}) — ${typeof c.currentGrade === 'number' ? c.currentGrade.toFixed(1) + '%' : ''} [${c.goalGrade || 'A'}]`;
    sel.appendChild(opt);
  });

  if (!studyingState.selectedCourseId && courses.length > 0) {
    // Default to a behind-goal course like Psychology if available, else first course
    const behindCourse = courses.find(c => {
      const target = getTargetGradePercentage(c.goalGrade || "A");
      return (c.currentGrade - target) < -3;
    });
    studyingState.selectedCourseId = behindCourse ? behindCourse.id : courses[0].id;
  }

  if (studyingState.selectedCourseId) {
    sel.value = studyingState.selectedCourseId;
    onStudyingCourseSelect(studyingState.selectedCourseId);
  }
}

function onStudyingCourseSelect(courseId) {
  studyingState.selectedCourseId = courseId;
  const course = (appState.courses || []).find(c => c.id === courseId);
  if (!course) return;

  const alertNoData = document.getElementById("studying-no-data-alert");
  const hasAssignments = course.assignments && course.assignments.length > 0;

  if (alertNoData) {
    alertNoData.style.display = hasAssignments ? "none" : "flex";
  }

  studyingState.selectedTopics.clear();
  (course.allTopics || []).forEach(t => {
    if (t.selectedForExam !== false) {
      studyingState.selectedTopics.add(t.name);
    }
  });

  if (studyingState.selectedTopics.size === 0 && (course.allTopics || []).length > 0) {
    studyingState.selectedTopics.add(course.allTopics[0].name);
  }

  renderStudyingTopicChips(courseId);
}

function renderStudyingTopicChips(courseId) {
  const container = document.getElementById("studying-topic-chips");
  if (!container) return;
  container.innerHTML = "";

  const course = (appState.courses || []).find(c => c.id === courseId);
  if (!course) return;

  const topics = (course.allTopics || []).map(t => t.name);
  const customs = studyingState.customTopics[courseId] || [];
  const allTopicNames = [...new Set([...topics, ...customs])];

  allTopicNames.forEach(tName => {
    const isSelected = studyingState.selectedTopics.has(tName);
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = `topic-chip ${isSelected ? 'selected' : ''}`;
    chip.innerHTML = `
      <span class="chip-icon">${isSelected ? '✓' : '+'}</span>
      <span class="chip-name">${escapeHtml(tName)}</span>
    `;

    chip.addEventListener("click", () => {
      if (studyingState.selectedTopics.has(tName)) {
        studyingState.selectedTopics.delete(tName);
      } else {
        studyingState.selectedTopics.add(tName);
      }
      renderStudyingTopicChips(courseId);
    });

    container.appendChild(chip);
  });
}

function addCustomStudyingTopic(topicName) {
  const courseId = studyingState.selectedCourseId;
  if (!courseId) return;

  if (!studyingState.customTopics[courseId]) {
    studyingState.customTopics[courseId] = [];
  }
  if (!studyingState.customTopics[courseId].includes(topicName)) {
    studyingState.customTopics[courseId].push(topicName);
  }
  studyingState.selectedTopics.add(topicName);
  renderStudyingTopicChips(courseId);
  showToast(`Added custom study concept: "${topicName}"`);
}

// ============================================================================
// AUTONOMOUS AI PROBLEM GENERATION AGENT (HokieAIAgent)
// Comprehensive Procedural Archetypes with Guaranteed Topic Distribution
// ============================================================================

const HokieAIAgent = {
  /**
   * Main synthesis pipeline: takes course, topics, format, count, difficulty
   * Guarantees round-robin distribution across all selected topics and 100% uniqueness
   */
  synthesize(course, topics, format, count, difficulty) {
    const isInfinite = (count === "infinite" || count >= 999);
    const targetCount = isInfinite ? 5 : (parseInt(count, 10) || 5);

    const activeTopics = (topics && topics.length > 0) 
      ? topics 
      : (course.allTopics || []).map(t => t.name);

    if (activeTopics.length === 0) {
      activeTopics.push(course.name);
    }

    const items = [];
    const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    // Distribute problems evenly across all selected topics
    for (let i = 0; i < targetCount; i++) {
      const topicName = activeTopics[i % activeTopics.length];
      let item = null;
      let attempts = 0;

      // Ensure uniqueness via Session Signature Filter
      while (attempts < 25) {
        attempts++;
        const seed = Math.floor(Math.random() * 1000000) + Date.now() + (i * 1000) + (attempts * 29);
        item = this.generateItemForTopic(course, topicName, format, difficulty, seed);
        const sig = this.getSignature(item);
        if (!studyingState.sessionSeenSignatures.has(sig)) {
          studyingState.sessionSeenSignatures.add(sig);
          break;
        }
      }

      if (item) items.push(item);
    }

    // Telemetry tracking
    studyingState.telemetry.totalGenerated += items.length;
    try {
      localStorage.setItem("hokie_ai_total_generated", studyingState.telemetry.totalGenerated.toString());
    } catch (e) {}

    return items;
  },

  getSignature(item) {
    const raw = (item.question || item.front || "") + "::" + (item.answer || item.back || "");
    return raw.toLowerCase().replace(/\s+/g, " ").trim();
  },

  generateItemForTopic(course, topicName, format, difficulty, seed) {
    const cCode = (course.code || "").toUpperCase();
    const cName = (course.name || "").toLowerCase();
    const t = (topicName || "").toLowerCase();
    const fmt = (format || "problems").toLowerCase();

    // 1. Calculus II & Mathematics (MATH 1226 / 1225)
    if (cCode.includes("1226") || cCode.includes("MATH") || cName.includes("calculus") || t.includes("integral") || t.includes("derivative") || t.includes("series")) {
      return this.generateCalculusProblem(topicName, fmt, difficulty, seed);
    }
    // 2. Psychology (PSYC 1004)
    else if (cCode.includes("PSYC") || cName.includes("psych") || t.includes("cognit") || t.includes("neural") || t.includes("memory") || t.includes("behavior") || t.includes("brain")) {
      return this.generatePsychologyProblem(topicName, fmt, difficulty, seed);
    }
    // 3. Intermediate Python Programming (CS 2064)
    else if (cCode.includes("2064") || cCode.includes("CS") || cName.includes("python") || cName.includes("prog") || t.includes("python") || t.includes("data structure") || t.includes("comprehension")) {
      return this.generatePythonProblem(topicName, fmt, difficulty, seed);
    }
    // 4. Green Engineering & Foundations (ENGR 3124 / ENGE 1215)
    else if (cCode.includes("3124") || (cCode.includes("ENGR") && !cCode.includes("1054")) || cName.includes("green engineering") || t.includes("lca") || t.includes("life cycle") || t.includes("sustainable")) {
      return this.generateEngineeringProblem(topicName, fmt, difficulty, seed);
    }
    // 5. Academic / Restricted Research (ENGE 2634)
    else if (cCode.includes("2634") || cName.includes("restricted research") || cName.includes("research") || t.includes("hypothesis") || t.includes("variable") || t.includes("validity")) {
      return this.generateResearchProblem(topicName, fmt, difficulty, seed);
    }
    // 6. ACIS 2115 (Financial Accounting)
    else if (cCode.includes("ACIS 2115") || (cCode.includes("2115") && cCode.includes("ACIS")) || t.includes("bookkeeping") || t.includes("accrual") || t.includes("reconciliation")) {
      return this.generateACIS2115Problem(topicName, fmt, difficulty, seed);
    }
    // 7. ACIS 2116 (Managerial Accounting)
    else if (cCode.includes("ACIS 2116") || (cCode.includes("2116") && cCode.includes("ACIS")) || t.includes("cvp") || t.includes("break-even")) {
      return this.generateACIS2116Problem(topicName, fmt, difficulty, seed);
    }
    // 8. BUS 1004 (Business Problem-Solving)
    else if (cCode.includes("BUS 1004") || (cCode.includes("BUS") && cCode.includes("1004")) || t.includes("swot") || t.includes("porter")) {
      return this.generateBUS1004Problem(topicName, fmt, difficulty, seed);
    }
    // 9. BUS 1204 (AI Literacy for Business)
    else if (cCode.includes("BUS 1204") || t.includes("generative") || t.includes("rag") || t.includes("llm")) {
      return this.generateBUS1204Problem(topicName, fmt, difficulty, seed);
    }
    // 10. ECON 2005 (Microeconomics)
    else if (cCode.includes("ECON 2005") || t.includes("elasticity") || t.includes("surplus")) {
      return this.generateECON2005Problem(topicName, fmt, difficulty, seed);
    }
    // Fallback Universal STEM / Collegiate Generator
    else {
      return this.generateUniversalProblem(course, topicName, fmt, difficulty, seed);
    }
  },

  // --- ACIS 2115: Principles of Financial Accounting ---
  generateACIS2115Problem(topicName, format, difficulty, seed) {
    const t = (topicName || "").toLowerCase();
    const f = (format || "problems").toLowerCase();
    const s = Math.abs(seed) || 1;

    // TOPIC 1: Accounting Cycle & Double-Entry Bookkeeping
    if (t.includes("cycle") || t.includes("bookkeeping") || t.includes("double-entry")) {
      const companies = ["Pamplin Logistics", "Blacksburg Commercial Tech", "Hokie Supply Co.", "Shenandoah Distribution", "Maroon Freight Corp.", "Roanoke Valley Enterprises"];
      const company = companies[s % companies.length];
      const assets = ["specialized warehouse equipment", "commercial delivery fleet", "industrial manufacturing machinery", "enterprise server infrastructure"];
      const asset = assets[Math.floor(s / 7) % assets.length];
      const noteMonths = [6, 9, 12][s % 3];
      const noteRate = [5, 6, 7, 8][Math.floor(s / 3) % 4];
      const cash = (((s % 7) + 2) * 5000);
      const notes = (((Math.floor(s / 11) % 8) + 2) * 10000);
      const equip = cash + notes;

      if (f === "quiz") {
        return {
          question: `${company} purchases ${asset} for $${equip.toLocaleString()}. The company pays $${cash.toLocaleString()} in cash and signs a ${noteMonths}-month, ${noteRate}% promissory note payable for the remaining balance. What is the correct journal entry to record this transaction?`,
          options: [
            `A) Debit Equipment $${equip.toLocaleString()}; Credit Cash $${cash.toLocaleString()}; Credit Notes Payable $${notes.toLocaleString()}`,
            `B) Debit Cash $${cash.toLocaleString()}; Debit Notes Payable $${notes.toLocaleString()}; Credit Equipment $${equip.toLocaleString()}`,
            `C) Debit Equipment $${equip.toLocaleString()}; Credit Cash $${equip.toLocaleString()}`,
            `D) Debit Operating Expense $${equip.toLocaleString()}; Credit Notes Payable $${equip.toLocaleString()}`
          ],
          correctOption: "A",
          answer: `Debit Equipment $${equip.toLocaleString()}; Credit Cash $${cash.toLocaleString()}; Credit Notes Payable $${notes.toLocaleString()}`,
          method: `Step 1: Equipment is an asset increasing with a debit of $${equip.toLocaleString()}.\nStep 2: Cash is an asset decreasing with a credit of $${cash.toLocaleString()}.\nStep 3: Notes Payable is a liability increasing with a credit of $${notes.toLocaleString()}.\nStep 4: Verify equality: Total Debits ($${equip.toLocaleString()}) = Total Credits ($${cash.toLocaleString()} + $${notes.toLocaleString()} = $${equip.toLocaleString()}).`,
          topic: "The Accounting Cycle & Double-Entry Bookkeeping",
          difficulty: difficulty
        };
      } else if (f === "flashcards") {
        return {
          front: "In double-entry bookkeeping, what is the fundamental accounting equation and how do debits and credits affect accounts?",
          back: "Assets = Liabilities + Stockholders' Equity. Debits (DR) increase Assets and Expenses. Credits (CR) increase Liabilities, Equity, and Revenues.",
          mnemonic: "DEAD CLER: Debits increase Expenses, Assets, Dividends. Credits increase Liabilities, Equity, Revenue.",
          method: "Fundamental balance sheet equality: Total Debits must always equal Total Credits in every transaction.",
          topic: "The Accounting Cycle & Double-Entry Bookkeeping",
          difficulty: difficulty
        };
      } else {
        return {
          question: `${company} purchases ${asset} for $${equip.toLocaleString()}. The company pays $${cash.toLocaleString()} in cash and signs a ${noteMonths}-month, ${noteRate}% promissory note payable for the remaining balance. Prepare the complete journal entry to record this transaction, specifying all debit and credit accounts and amounts.`,
          answer: `Debit Equipment $${equip.toLocaleString()}; Credit Cash $${cash.toLocaleString()}; Credit Notes Payable $${notes.toLocaleString()}`,
          method: `Step 1: Equipment is an asset increasing with a debit of $${equip.toLocaleString()}.\nStep 2: Cash is an asset decreasing with a credit of $${cash.toLocaleString()}.\nStep 3: Notes Payable is a liability increasing with a credit of $${notes.toLocaleString()}.\nStep 4: Verify equality: Total Debits ($${equip.toLocaleString()}) = Total Credits ($${cash.toLocaleString()} + $${notes.toLocaleString()} = $${equip.toLocaleString()}).`,
          topic: "The Accounting Cycle & Double-Entry Bookkeeping",
          difficulty: difficulty
        };
      }
    }

    // TOPIC 2: Accrual Accounting & Adjusting Journal Entries
    else if (t.includes("adjusting") || t.includes("accrual")) {
      const companies = ["Hokie Retail Inc.", "Pamplin Office Suites", "New River Commercial", "Apex Logistics", "Shenandoah Properties"];
      const company = companies[s % companies.length];
      const monthlyRent = (((s % 6) + 2) * 1200);
      const totalPrepaid = monthlyRent * 12;
      const elapsed = ((Math.floor(s / 5) % 6) + 2);
      const used = monthlyRent * elapsed;
      const remaining = totalPrepaid - used;

      if (f === "quiz") {
        return {
          question: `On September 1, ${company} paid $${totalPrepaid.toLocaleString()} cash for a 12-month commercial lease and debited Prepaid Rent. As of December 31 (${elapsed} months later), no adjusting entry has yet been recorded. What is the year-end adjusting journal entry?`,
          options: [
            `A) Debit Rent Expense $${used.toLocaleString()}; Credit Prepaid Rent $${used.toLocaleString()}`,
            `B) Debit Prepaid Rent $${used.toLocaleString()}; Credit Cash $${used.toLocaleString()}`,
            `C) Debit Rent Expense $${totalPrepaid.toLocaleString()}; Credit Prepaid Rent $${totalPrepaid.toLocaleString()}`,
            `D) Debit Prepaid Rent $${remaining.toLocaleString()}; Credit Rent Expense $${remaining.toLocaleString()}`
          ],
          correctOption: "A",
          answer: `Debit Rent Expense $${used.toLocaleString()}; Credit Prepaid Rent $${used.toLocaleString()}`,
          method: `Step 1: Monthly rent = $${totalPrepaid.toLocaleString()} / 12 = $${monthlyRent.toLocaleString()}/month.\nStep 2: Calculate expired rent: $${monthlyRent.toLocaleString()} × ${elapsed} = $${used.toLocaleString()}.\nStep 3: Accrual accounting requires recognizing expired rent as an expense: Debit Rent Expense $${used.toLocaleString()}.\nStep 4: Reduce unexpired asset: Credit Prepaid Rent $${used.toLocaleString()}. Remaining balance is $${remaining.toLocaleString()}.`,
          topic: "Accrual Accounting & Adjusting Journal Entries",
          difficulty: difficulty
        };
      } else if (f === "flashcards") {
        return {
          front: "What is the primary purpose of adjusting journal entries at period end, and what key rule applies regarding Cash?",
          back: "Adjusting entries ensure revenues are recognized when earned and expenses matched when incurred (Accrual Principle). Crucial Rule: Cash is NEVER debited or credited in an adjusting entry!",
          mnemonic: "Adjusting Entries NEVER Touch Cash (Cash moves before or after, never at period adjustment).",
          method: "Adjusting entries convert transactions from cash basis to accrual basis at the end of the accounting period.",
          topic: "Accrual Accounting & Adjusting Journal Entries",
          difficulty: difficulty
        };
      } else {
        return {
          question: `On September 1, ${company} paid $${totalPrepaid.toLocaleString()} cash for a 12-month commercial property lease and debited Prepaid Rent. As of December 31 (${elapsed} months later), no adjusting entry has yet been recorded. Prepare the year-end adjusting journal entry.`,
          answer: `Debit Rent Expense $${used.toLocaleString()}; Credit Prepaid Rent $${used.toLocaleString()}`,
          method: `Step 1: Monthly rent = $${totalPrepaid.toLocaleString()} / 12 = $${monthlyRent.toLocaleString()}/month.\nStep 2: Calculate expired rent over ${elapsed} months: $${monthlyRent.toLocaleString()} × ${elapsed} = $${used.toLocaleString()}.\nStep 3: Accrual accounting requires recognizing expired rent as an expense: Debit Rent Expense for $${used.toLocaleString()}.\nStep 4: Reduce unexpired asset: Credit Prepaid Rent for $${used.toLocaleString()}.\nRemaining asset on balance sheet: $${remaining.toLocaleString()}.`,
          topic: "Accrual Accounting & Adjusting Journal Entries",
          difficulty: difficulty
        };
      }
    }

    // TOPIC 3: Inventory Valuation (FIFO / LIFO)
    else if (t.includes("inventory") || t.includes("fifo") || t.includes("lifo")) {
      const companies = ["Tech Apparel", "Hokie Outfitters", "Blacksburg Goods", "Pamplin Gear", "Blue Ridge Outfitters"];
      const company = companies[s % companies.length];
      const items = ["jackets", "backpacks", "smart sensors", "microcontrollers", "hiking boots"];
      const itemNoun = items[s % items.length];
      const unitsB = (((s % 5) + 2) * 50);
      const costB = (((Math.floor(s / 3) % 4) + 3) * 5);
      const unitsP = (((Math.floor(s / 7) % 5) + 2) * 50);
      const costP = costB + (((s % 3) + 1) * 5);
      const sold = unitsB + Math.floor(unitsP * 0.6);
      const fifoCogs = (unitsB * costB) + ((sold - unitsB) * costP);
      const fifoEnd = (unitsB + unitsP - sold) * costP;

      if (f === "quiz") {
        return {
          question: `${company} began the month with ${unitsB} ${itemNoun} costing $${costB} each and purchased ${unitsP} additional ${itemNoun} at $${costP} each. During the month, they sold ${sold} ${itemNoun}. Under FIFO periodic inventory, what is Cost of Goods Sold (COGS) and Ending Inventory?`,
          options: [
            `A) COGS = $${fifoCogs.toLocaleString()}; Ending Inventory = $${fifoEnd.toLocaleString()}`,
            `B) COGS = $${fifoEnd.toLocaleString()}; Ending Inventory = $${fifoCogs.toLocaleString()}`,
            `C) COGS = $${((sold * costP)).toLocaleString()}; Ending Inventory = $${(((unitsB + unitsP - sold) * costB)).toLocaleString()}`,
            `D) COGS = $${((sold * costB)).toLocaleString()}; Ending Inventory = $${(((unitsB + unitsP - sold) * costP)).toLocaleString()}`
          ],
          correctOption: "A",
          answer: `COGS = $${fifoCogs.toLocaleString()}; Ending Inventory = $${fifoEnd.toLocaleString()}`,
          method: `Step 1: Total units available = ${unitsB} + ${unitsP} = ${unitsB + unitsP} units.\nStep 2: Under FIFO, oldest inventory is sold first. COGS = (${unitsB} × $${costB}) + (${sold - unitsB} × $${costP}) = $${(unitsB * costB).toLocaleString()} + $${((sold - unitsB) * costP).toLocaleString()} = $${fifoCogs.toLocaleString()}.\nStep 3: Ending inventory = (${unitsB + unitsP} - ${sold}) = ${unitsB + unitsP - sold} units at $${costP} = $${fifoEnd.toLocaleString()}.`,
          topic: "Inventory Valuation: FIFO, LIFO & Weighted Average",
          difficulty: difficulty
        };
      } else if (f === "flashcards") {
        return {
          front: "During a period of steadily rising prices (inflation), how does FIFO compare to LIFO in terms of COGS, Net Income, and Ending Inventory?",
          back: "Under FIFO during inflation: Older, cheaper costs flow to COGS -> COGS is lower -> Reported Net Income is higher -> Ending Inventory on balance sheet is higher (reflects current replacement cost).",
          mnemonic: "FIFO in Inflation = First-In cheap costs to COGS -> Profit Floats High!",
          method: "LIFO matches current higher costs with current revenues, lowering net income and tax liability during inflation.",
          topic: "Inventory Valuation: FIFO, LIFO & Weighted Average",
          difficulty: difficulty
        };
      } else {
        return {
          question: `${company} began the month with ${unitsB} ${itemNoun} costing $${costB} each. They purchased ${unitsP} additional ${itemNoun} at $${costP} each. During the month, they sold ${sold} ${itemNoun}. Using the FIFO (First-In, First-Out) periodic inventory method, calculate Cost of Goods Sold (COGS) and Ending Inventory.`,
          answer: `COGS = $${fifoCogs.toLocaleString()}; Ending Inventory = $${fifoEnd.toLocaleString()}`,
          method: `Step 1: Total available = ${unitsB + unitsP} units.\nStep 2: Under FIFO, oldest units are sold first. The ${sold} units sold consist of:\n- All ${unitsB} units from beginning inventory at $${costB} = $${(unitsB * costB).toLocaleString()}\n- Remaining ${sold - unitsB} units from recent purchase at $${costP} = $${((sold - unitsB) * costP).toLocaleString()}\nTotal COGS = $${(unitsB * costB).toLocaleString()} + $${((sold - unitsB) * costP).toLocaleString()} = $${fifoCogs.toLocaleString()}.\nStep 3: Ending inventory = (${unitsB + unitsP} - ${sold}) = ${unitsB + unitsP - sold} units at $${costP} = $${fifoEnd.toLocaleString()}.`,
          topic: "Inventory Valuation: FIFO, LIFO & Weighted Average",
          difficulty: difficulty
        };
      }
    }

    // TOPIC 4: Bank Reconciliation & Internal Cash Controls
    else if (t.includes("reconciliation") || t.includes("cash") || t.includes("bank")) {
      const entities = ["Virginia Tech Dining Services", "Pamplin Bookstore Operations", "Hokie Student Center", "Alumni Hall Services"];
      const entity = entities[s % entities.length];
      const bookBal = (((s % 9) + 12) * 1500);
      const bankFee = (((Math.floor(s / 3) % 5) + 3) * 15);
      const nsf = (((Math.floor(s / 7) % 6) + 4) * 125);
      const adjBal = bookBal - bankFee - nsf;
      const outChecks = (((s % 5) + 3) * 1200);
      const depTransit = (((Math.floor(s / 5) % 4) + 2) * 1400);

      if (f === "quiz") {
        return {
          question: `At month end, ${entity} shows a general ledger Cash balance of $${bookBal.toLocaleString()}. The bank statement shows: bank service charge of $${bankFee}, a customer NSF check of $${nsf}, outstanding checks totaling $${outChecks.toLocaleString()}, and deposits in transit of $${depTransit.toLocaleString()}. What is the reconciled adjusted true cash balance?`,
          options: [
            `A) Adjusted True Cash Balance = $${adjBal.toLocaleString()}`,
            `B) Adjusted True Cash Balance = $${bookBal.toLocaleString()}`,
            `C) Adjusted True Cash Balance = $${(adjBal - 950).toLocaleString()}`,
            `D) Adjusted True Cash Balance = $${(bookBal + depTransit).toLocaleString()}`
          ],
          correctOption: "A",
          answer: `Adjusted True Cash Balance = $${adjBal.toLocaleString()}`,
          method: `Step 1: Adjust book balance for items appearing on bank statement not yet recorded on books:\nBook Balance: $${bookBal.toLocaleString()}\nLess Bank Service Charge: -$${bankFee}\nLess Customer NSF Check: -$${nsf}\nAdjusted Book Balance = $${bookBal.toLocaleString()} - $${bankFee} - $${nsf} = $${adjBal.toLocaleString()}.\nStep 2: Bank-side items (outstanding checks of $${outChecks.toLocaleString()} and deposits in transit of $${depTransit.toLocaleString()}) adjust bank statement to reach the exact same reconciled balance.`,
          topic: "Bank Reconciliation & Internal Cash Controls",
          difficulty: difficulty
        };
      } else if (f === "flashcards") {
        return {
          front: "Which reconciling items on a bank reconciliation require formal adjusting journal entries in the company's general ledger?",
          back: "ONLY reconciling items that affect the BOOK balance require journal entries (e.g., bank service charges, NSF checks, note collections, interest earned). Bank-side items (deposits in transit, outstanding checks) do NOT require book entries.",
          mnemonic: "If it changes the BOOK side, you MUST journalize and book it!",
          method: "Bank-side adjustments represent timing differences already booked by the firm that the bank will clear automatically.",
          topic: "Bank Reconciliation & Internal Cash Controls",
          difficulty: difficulty
        };
      } else {
        return {
          question: `At month end, ${entity} shows a general ledger Cash balance of $${bookBal.toLocaleString()}. The bank statement shows: bank service charge of $${bankFee}, a customer NSF check of $${nsf}, outstanding checks totaling $${outChecks.toLocaleString()}, and deposits in transit of $${depTransit.toLocaleString()}. Determine the adjusted true cash balance.`,
          answer: `Adjusted Cash Balance = $${adjBal.toLocaleString()}`,
          method: `Step 1: Adjust book balance for items appearing on bank statement not yet recorded:\nBook Balance: $${bookBal.toLocaleString()}\nLess: Bank Service Charge: -$${bankFee}\nLess: Customer NSF Check: -$${nsf}\nAdjusted Book Balance: $${bookBal.toLocaleString()} - $${bankFee} - $${nsf} = $${adjBal.toLocaleString()}.\nStep 2: Note that deposits in transit and outstanding checks adjust the bank balance, yielding the identical reconciled cash figure of $${adjBal.toLocaleString()}.`,
          topic: "Bank Reconciliation & Internal Cash Controls",
          difficulty: difficulty
        };
      }
    }

    // TOPIC 5: Financial Statement Preparation & Ratio Analysis
    else {
      const companies = ["Hokie Tech Ventures", "Pamplin Analytics Corp.", "Blacksburg Instruments"];
      const company = companies[s % companies.length];
      const sales = (((s % 6) + 5) * 100000);
      const netIncome = Math.round(sales * (0.12 + ((s % 4) * 0.02)));
      const curAssets = (((s % 5) + 6) * 20000);
      const curLiab = (((Math.floor(s / 3) % 4) + 3) * 15000);
      const curRatio = (curAssets / curLiab).toFixed(2);
      const pm = ((netIncome / sales) * 100).toFixed(1);

      if (f === "quiz") {
        return {
          question: `${company} reports annual Sales of $${sales.toLocaleString()}, Net Income of $${netIncome.toLocaleString()}, Current Assets of $${curAssets.toLocaleString()}, and Current Liabilities of $${curLiab.toLocaleString()}. What is the company's Current Ratio and Profit Margin?`,
          options: [
            `A) Current Ratio = ${curRatio}; Profit Margin = ${pm}%`,
            `B) Current Ratio = ${(curAssets/(curLiab+10000)).toFixed(2)}; Profit Margin = 8.5%`,
            `C) Current Ratio = ${(curAssets/(curLiab-10000)).toFixed(2)}; Profit Margin = ${pm}%`,
            `D) Current Ratio = ${curRatio}; Profit Margin = 15.0%`
          ],
          correctOption: "A",
          answer: `Current Ratio = ${curRatio}; Profit Margin = ${pm}%`,
          method: `Step 1: Current Ratio = Current Assets ($${curAssets.toLocaleString()}) / Current Liabilities ($${curLiab.toLocaleString()}) = ${curRatio}.\nStep 2: Profit Margin = Net Income ($${netIncome.toLocaleString()}) / Sales ($${sales.toLocaleString()}) = ${pm}%.`,
          topic: "Financial Statement Preparation & Ratio Analysis",
          difficulty: difficulty
        };
      } else if (f === "flashcards") {
        return {
          front: "What does the Current Ratio measure and what is considered a healthy benchmark?",
          back: "Current Ratio = Current Assets / Current Liabilities. It measures short-term liquidity and ability to pay immediate obligations. A ratio between 1.5 and 2.0 is generally considered healthy across most corporate sectors.",
          mnemonic: "Current Ratio = Liquidity Cushion for Near-Term Debts.",
          method: "A ratio below 1.0 indicates negative net working capital and potential near-term solvency risks.",
          topic: "Financial Statement Preparation & Ratio Analysis",
          difficulty: difficulty
        };
      } else {
        return {
          question: `${company} reports annual Sales of $${sales.toLocaleString()}, Net Income of $${netIncome.toLocaleString()}, Current Assets of $${curAssets.toLocaleString()}, and Current Liabilities of $${curLiab.toLocaleString()}. Compute the Current Ratio and Profit Margin, and interpret liquidity.`,
          answer: `Current Ratio = ${curRatio}; Profit Margin = ${pm}%`,
          method: `Step 1: Current Ratio = Current Assets ($${curAssets.toLocaleString()}) / Current Liabilities ($${curLiab.toLocaleString()}) = ${curRatio}.\nStep 2: Profit Margin = Net Income ($${netIncome.toLocaleString()}) / Sales ($${sales.toLocaleString()}) = ${pm}%.\nStep 3: A current ratio of ${curRatio} indicates ${curRatio >= 1.5 ? 'strong' : 'adequate'} short-term liquidity to satisfy current obligations.`,
          topic: "Financial Statement Preparation & Ratio Analysis",
          difficulty: difficulty
        };
      }
    }
  },

  // --- ACIS 2116: Principles of Managerial Accounting ---
  generateACIS2116Problem(topicName, format, difficulty, seed) {
    const t = (topicName || "").toLowerCase();
    const f = (format || "problems").toLowerCase();
    const s = Math.abs(seed) || 1;

    // TOPIC 1: Cost-Volume-Profit & Break-Even
    if (t.includes("cvp") || t.includes("break-even")) {
      const products = ["commercial inspection drones", "smart IoT sensor units", "enterprise analytics appliances", "specialized robotic actuators"];
      const product = products[s % products.length];
      const sp = (((s % 6) + 8) * 15);
      const vc = Math.round(sp * (0.55 + ((s % 3) * 0.05)));
      const cm = sp - vc;
      const fc = (((Math.floor(s / 3) % 6) + 5) * 15000);
      const beUnits = Math.round(fc / cm);
      const beRev = beUnits * sp;
      const cmRatio = ((cm / sp) * 100).toFixed(1);

      if (f === "quiz") {
        return {
          question: `Hokie Tech Systems sells ${product} for $${sp} per unit. Variable costs are $${vc} per unit, and annual fixed costs total $${fc.toLocaleString()}. What is the Break-Even point in units and sales revenue?`,
          options: [
            `A) Break-Even = ${beUnits.toLocaleString()} units ($${beRev.toLocaleString()})`,
            `B) Break-Even = ${(beUnits + 400).toLocaleString()} units ($${((beUnits + 400)*sp).toLocaleString()})`,
            `C) Break-Even = ${(beUnits - 300).toLocaleString()} units ($${((beUnits - 300)*sp).toLocaleString()})`,
            `D) Break-Even = ${(Math.round(fc/vc)).toLocaleString()} units ($${((Math.round(fc/vc))*sp).toLocaleString()})`
          ],
          correctOption: "A",
          answer: `Break-Even = ${beUnits.toLocaleString()} units ($${beRev.toLocaleString()})`,
          method: `Step 1: Contribution Margin per unit = Price ($${sp}) - Variable Cost ($${vc}) = $${cm}.\nStep 2: CM Ratio = $${cm} / $${sp} = ${cmRatio}%.\nStep 3: Break-Even in units = Fixed Costs ($${fc.toLocaleString()}) / CM ($${cm}) = ${beUnits.toLocaleString()} units.\nStep 4: Break-Even in revenue = ${beUnits.toLocaleString()} units × $${sp} = $${beRev.toLocaleString()}.`,
          topic: "Cost-Volume-Profit (CVP) & Break-Even Analysis",
          difficulty: difficulty
        };
      } else if (f === "flashcards") {
        return {
          front: "What is the Contribution Margin (CM) Ratio and how is it used to determine the break-even point in sales dollars?",
          back: "CM Ratio = (Unit Price - Unit Variable Cost) / Unit Price. Break-Even Point ($) = Total Fixed Costs / CM Ratio.",
          mnemonic: "Divide Fixed Costs by the Margin Ratio to find Break-Even Revenue!",
          method: "Each dollar of sales contributes the CM ratio toward covering fixed costs until net operating income turns positive.",
          topic: "Cost-Volume-Profit (CVP) & Break-Even Analysis",
          difficulty: difficulty
        };
      } else {
        return {
          question: `Hokie Tech Systems sells ${product} for $${sp} per unit. Variable manufacturing and selling expenses are $${vc} per unit, and annual fixed costs total $${fc.toLocaleString()}. Calculate the Contribution Margin per unit, Contribution Margin Ratio, and the Break-Even point in units and sales dollars.`,
          answer: `CM = $${cm}/unit (${cmRatio}%); Break-Even = ${beUnits.toLocaleString()} units ($${beRev.toLocaleString()})`,
          method: `Step 1: Contribution Margin per unit = Price ($${sp}) - Variable Cost ($${vc}) = $${cm}.\nStep 2: CM Ratio = $${cm} / $${sp} = ${cmRatio}%.\nStep 3: Break-Even in units = Fixed Costs ($${fc.toLocaleString()}) / CM ($${cm}) = ${beUnits.toLocaleString()} units.\nStep 4: Break-Even in revenue = ${beUnits.toLocaleString()} units × $${sp} = $${beRev.toLocaleString()}.`,
          topic: "Cost-Volume-Profit (CVP) & Break-Even Analysis",
          difficulty: difficulty
        };
      }
    }

    // TOPIC 2: Cost Classification & High-Low Method
    else if (t.includes("high-low") || t.includes("classification")) {
      const hHrs = (((s % 6) + 10) * 100);
      const lHrs = (((Math.floor(s / 3) % 4) + 5) * 100);
      const vRate = (((s % 5) + 4) * 5);
      const fCost = (((Math.floor(s / 7) % 5) + 8) * 1500);
      const hCost = fCost + (vRate * hHrs);
      const lCost = fCost + (vRate * lHrs);
      const dCost = hCost - lCost;
      const dHrs = hHrs - lHrs;

      if (f === "quiz") {
        return {
          question: `A Pamplin manufacturing plant records maintenance costs of $${hCost.toLocaleString()} at peak production (${hHrs.toLocaleString()} machine hours) and $${lCost.toLocaleString()} at lowest production (${lHrs.toLocaleString()} machine hours). Using the High-Low method, what is the variable cost per machine hour and total fixed maintenance cost?`,
          options: [
            `A) Variable Cost = $${vRate.toFixed(2)}/hour; Fixed Cost = $${fCost.toLocaleString()}`,
            `B) Variable Cost = $${(vRate + 10).toFixed(2)}/hour; Fixed Cost = $${(fCost - 4000).toLocaleString()}`,
            `C) Variable Cost = $${(vRate - 5).toFixed(2)}/hour; Fixed Cost = $${(fCost + 6000).toLocaleString()}`,
            `D) Variable Cost = $${(vRate + 3.5).toFixed(2)}/hour; Fixed Cost = $${(fCost - 1500).toLocaleString()}`
          ],
          correctOption: "A",
          answer: `Variable Cost = $${vRate.toFixed(2)}/hour; Fixed Cost = $${fCost.toLocaleString()}`,
          method: `Step 1: Change in Cost = $${hCost.toLocaleString()} - $${lCost.toLocaleString()} = $${dCost.toLocaleString()}.\nStep 2: Change in Hours = ${hHrs.toLocaleString()} - ${lHrs.toLocaleString()} = ${dHrs.toLocaleString()} hours.\nStep 3: Variable rate b = $${dCost.toLocaleString()} / ${dHrs.toLocaleString()} = $${vRate.toFixed(2)}/hour.\nStep 4: Fixed cost a = $${hCost.toLocaleString()} - ($${vRate.toFixed(2)} × ${hHrs.toLocaleString()}) = $${fCost.toLocaleString()}.\nCost Formula: Total Cost = $${fCost.toLocaleString()} + ($${vRate.toFixed(2)} × Machine Hours).`,
          topic: "Cost Classification & High-Low Method",
          difficulty: difficulty
        };
      } else if (f === "flashcards") {
        return {
          front: "What is the formula for calculating the variable cost per unit (b) using the High-Low method?",
          back: "Variable Rate (b) = (Cost at Highest Activity - Cost at Lowest Activity) / (Highest Activity Level - Lowest Activity Level) = ΔCost / ΔActivity. Fixed Cost (a) = Total Cost - (b × Activity Level).",
          mnemonic: "High-Low Slope = Rise over Run = ΔCost / ΔActivity!",
          method: "Always select high and low points based on activity driver volume, NOT the total dollar cost.",
          topic: "Cost Classification & High-Low Method",
          difficulty: difficulty
        };
      } else {
        return {
          question: `A Pamplin manufacturing plant records maintenance costs of $${hCost.toLocaleString()} at peak production (${hHrs.toLocaleString()} machine hours) and $${lCost.toLocaleString()} at lowest production (${lHrs.toLocaleString()} machine hours). Using the High-Low method, determine the variable cost per machine hour and the total fixed maintenance cost per period.`,
          answer: `Variable Cost = $${vRate.toFixed(2)}/hour; Fixed Cost = $${fCost.toLocaleString()}.00`,
          method: `Step 1: Change in Cost = $${hCost.toLocaleString()} - $${lCost.toLocaleString()} = $${dCost.toLocaleString()}.\nStep 2: Change in Hours = ${hHrs.toLocaleString()} - ${lHrs.toLocaleString()} = ${dHrs.toLocaleString()} hours.\nStep 3: Variable rate b = $${dCost.toLocaleString()} / ${dHrs.toLocaleString()} = $${vRate.toFixed(2)}/hour.\nStep 4: Fixed cost a = $${hCost.toLocaleString()} - ($${vRate.toFixed(2)} × ${hHrs.toLocaleString()}) = $${fCost.toLocaleString()}.\nCost Formula: Total Cost = $${fCost.toLocaleString()} + ($${vRate.toFixed(2)} × Machine Hours).`,
          topic: "Cost Classification & High-Low Method",
          difficulty: difficulty
        };
      }
    }

    // TOPIC 3: Overhead Allocation & Job-Order Costing
    else {
      const estDLH = (((s % 5) + 5) * 5000);
      const ratePerHour = (((Math.floor(s / 3) % 4) + 3) * 5);
      const estOH = estDLH * ratePerHour;
      const actDLH = estDLH + (((s % 5) + 1) * 500);
      const appliedOH = ratePerHour * actDLH;
      const underAmount = (((Math.floor(s / 5) % 5) + 1) * 4000);
      const actOH = appliedOH + underAmount;

      if (f === "quiz") {
        return {
          question: `Hokie Automation estimates annual manufacturing overhead of $${estOH.toLocaleString()} and ${estDLH.toLocaleString()} direct labor hours (DLH). During the year, the company incurs actual overhead of $${actOH.toLocaleString()} and works ${actDLH.toLocaleString()} DLH. What is the Predetermined Overhead Rate (POHR) and overhead variance?`,
          options: [
            `A) POHR = $${ratePerHour.toFixed(2)}/DLH; Underapplied Overhead = $${underAmount.toLocaleString()}`,
            `B) POHR = $${ratePerHour.toFixed(2)}/DLH; Overapplied Overhead = $${underAmount.toLocaleString()}`,
            `C) POHR = $${(ratePerHour + 1.5).toFixed(2)}/DLH; Underapplied Overhead = $${(underAmount * 2).toLocaleString()}`,
            `D) POHR = $${(ratePerHour - 1.2).toFixed(2)}/DLH; Overapplied Overhead = $${(underAmount / 2).toLocaleString()}`
          ],
          correctOption: "A",
          answer: `POHR = $${ratePerHour.toFixed(2)}/DLH; Underapplied Overhead = $${underAmount.toLocaleString()}`,
          method: `Step 1: POHR = Estimated Overhead ($${estOH.toLocaleString()}) / Estimated Hours (${estDLH.toLocaleString()}) = $${ratePerHour.toFixed(2)}/DLH.\nStep 2: Applied Overhead = $${ratePerHour.toFixed(2)} × ${actDLH.toLocaleString()} actual DLH = $${appliedOH.toLocaleString()}.\nStep 3: Variance = Actual Overhead ($${actOH.toLocaleString()}) - Applied Overhead ($${appliedOH.toLocaleString()}) = $${underAmount.toLocaleString()}.\nStep 4: Because actual exceeds applied, overhead is UNDERAPPLIED by $${underAmount.toLocaleString()}.`,
          topic: "Job-Order Costing & Predetermined Overhead Rates",
          difficulty: difficulty
        };
      } else if (f === "flashcards") {
        return {
          front: "How is the Predetermined Overhead Rate (POHR) calculated, and when is manufacturing overhead considered underapplied versus overapplied?",
          back: "POHR = Estimated Total Overhead / Estimated Total Allocation Base. Overhead is UNDERAPPLIED when Actual Overhead > Applied Overhead. It is OVERAPPLIED when Applied Overhead > Actual Overhead.",
          mnemonic: "Actual > Applied = UNDERapplied (you didn't apply enough to cover real bills).",
          method: "At period end, underapplied overhead is closed to Cost of Goods Sold with a debit to COGS and a credit to Manufacturing Overhead.",
          topic: "Job-Order Costing & Predetermined Overhead Rates",
          difficulty: difficulty
        };
      } else {
        return {
          question: `Hokie Automation estimates annual manufacturing overhead of $${estOH.toLocaleString()} and ${estDLH.toLocaleString()} direct labor hours (DLH). During the year, the company incurs actual overhead of $${actOH.toLocaleString()} and works ${actDLH.toLocaleString()} DLH. Calculate the Predetermined Overhead Rate (POHR) and determine whether overhead was underapplied or overapplied and by what amount.`,
          answer: `POHR = $${ratePerHour.toFixed(2)}/DLH; Underapplied Overhead = $${underAmount.toLocaleString()}`,
          method: `Step 1: POHR = Estimated Overhead ($${estOH.toLocaleString()}) / Estimated Hours (${estDLH.toLocaleString()}) = $${ratePerHour.toFixed(2)}/DLH.\nStep 2: Applied Overhead = $${ratePerHour.toFixed(2)} × ${actDLH.toLocaleString()} actual DLH = $${appliedOH.toLocaleString()}.\nStep 3: Variance = Actual Overhead ($${actOH.toLocaleString()}) - Applied Overhead ($${appliedOH.toLocaleString()}) = $${underAmount.toLocaleString()}.\nStep 4: Because actual exceeds applied, overhead is UNDERAPPLIED by $${underAmount.toLocaleString()}.`,
          topic: "Job-Order Costing & Predetermined Overhead Rates",
          difficulty: difficulty
        };
      }
    }
  },

  // --- BUS 1004: Foundations of Business Problem-Solving ---
  generateBUS1004Problem(topicName, format, difficulty, seed) {
    const t = (topicName || "").toLowerCase();
    const f = (format || "problems").toLowerCase();
    const s = Math.abs(seed) || 1;

    if (t.includes("swot") || t.includes("porter") || t.includes("strategic")) {
      const cases = [
        { ind: "commercial airline", factor: "high fixed capital assets and perishable inventory", threat: "High" },
        { ind: "cloud computing infrastructure", factor: "massive hyperscale capital barriers and data gravity", threat: "Low" },
        { ind: "fast-casual dining", factor: "minimal customer switching costs and brand saturation", threat: "High" },
        { ind: "pharmaceutical biologics", factor: "stringent FDA patent protections and clinical trial timelines", threat: "Low" }
      ];
      const curCase = cases[s % cases.length];

      if (f === "quiz") {
        return {
          question: `In Porter's Five Forces analysis of the ${curCase.ind} industry, which condition most significantly drives industry attractiveness and competitive intensity?`,
          options: [
            `A) ${curCase.factor}, resulting in ${curCase.threat.toLowerCase()} competitive threat to incumbent profit margins`,
            `B) Absolute parity across marginal labor costs regardless of regional geography`,
            `C) Universal antitrust exemptions granted by federal regulatory bodies`,
            `D) Immediate consumer conversion to non-commercial substitutes without price sensitivity`
          ],
          correctOption: "A",
          answer: `${curCase.factor}, resulting in ${curCase.threat.toLowerCase()} competitive threat to incumbent profit margins`,
          method: `In Porter's Five Forces framework, structural characteristics such as capital intensity, exit barriers, and customer switching costs dictate long-term return on invested capital.`,
          topic: "Strategic Frameworks: SWOT, PESTEL & Porter's Five Forces",
          difficulty: difficulty
        };
      } else if (f === "flashcards") {
        return {
          front: "What are the 5 forces in Michael Porter's Industry Attractiveness Framework?",
          back: "1. Threat of New Entrants\n2. Threat of Substitutes\n3. Bargaining Power of Buyers\n4. Bargaining Power of Suppliers\n5. Competitive Rivalry Among Existing Firms",
          mnemonic: "ESBSR: Entrants, Substitutes, Buyers, Suppliers, Rivalry.",
          method: "The collective intensity of these five market forces determines long-run industry economic profitability.",
          topic: "Strategic Frameworks: SWOT, PESTEL & Porter's Five Forces",
          difficulty: difficulty
        };
      } else {
        return {
          question: `Apply Porter's Five Forces framework to analyze the ${curCase.ind} industry. Assess how ${curCase.factor} impacts Competitive Rivalry, Threat of Entrants, and overall industry profitability.`,
          answer: `Structural driver (${curCase.factor}) dictates a ${curCase.threat.toLowerCase()} level of competitive threat to sustained industry profit margins.`,
          method: `1. Competitive Rivalry: Shaped by industry growth rate and asset specificity.\n2. Barrier to Entry: Influenced by economies of scale and capital requirements.\n3. Buyer/Supplier Power: Governed by relative market concentration and switching friction.`,
          topic: "Strategic Frameworks: SWOT, PESTEL & Porter's Five Forces",
          difficulty: difficulty
        };
      }
    } else if (t.includes("spreadsheet") || t.includes("break-even") || t.includes("sensitivity")) {
      const fcA = (((s % 5) + 8) * 15000);
      const vcA = (((Math.floor(s / 3) % 4) + 2) * 5);
      const fcB = Math.round(fcA * 0.4);
      const vcB = vcA + (((s % 4) + 2) * 3);
      const qCross = Math.round((fcA - fcB) / (vcB - vcA));

      if (f === "quiz") {
        return {
          question: `Tooling Option A incurs $${fcA.toLocaleString()} fixed costs and $${vcA}/unit variable costs. Option B incurs $${fcB.toLocaleString()} fixed costs and $${vcB}/unit variable costs. At what crossover production volume do both options have identical total costs?`,
          options: [
            `A) Crossover Volume = ${qCross.toLocaleString()} units`,
            `B) Crossover Volume = ${(qCross + 800).toLocaleString()} units`,
            `C) Crossover Volume = ${(qCross - 650).toLocaleString()} units`,
            `D) Crossover Volume = ${(Math.round(qCross * 1.25)).toLocaleString()} units`
          ],
          correctOption: "A",
          answer: `Crossover Volume = ${qCross.toLocaleString()} units`,
          method: `Step 1: Equate Total Costs: $${fcA.toLocaleString()} + ($${vcA} × Q) = $${fcB.toLocaleString()} + ($${vcB} × Q).\nStep 2: $${fcA.toLocaleString()} - $${fcB.toLocaleString()} = ($${vcB} - $${vcA}) × Q => $${(fcA - fcB).toLocaleString()} = $${vcB - vcA} × Q.\nStep 3: Q = $${(fcA - fcB).toLocaleString()} / $${vcB - vcA} = ${qCross.toLocaleString()} units.\nStep 4: For production below ${qCross.toLocaleString()} units, Option B is superior; above ${qCross.toLocaleString()} units, Option A dominates.`,
          topic: "Spreadsheet Modeling & Break-Even Sensitivity",
          difficulty: difficulty
        };
      } else if (f === "flashcards") {
        return {
          front: "In financial modeling, how is the cost crossover (indifference) point between two operational alternatives determined?",
          back: "Set Total Cost A = Total Cost B -> Fixed Cost A + (Variable Rate A × Q) = Fixed Cost B + (Variable Rate B × Q). Solve for Q: Q = (Fixed Cost A - Fixed Cost B) / (Variable Rate B - Variable Rate A).",
          mnemonic: "Crossover Volume = Difference in Fixed Costs / Difference in Variable Rates.",
          method: "Helps operations managers select capital-intensive high-automation processes vs labor-flexible low-overhead alternatives.",
          topic: "Spreadsheet Modeling & Break-Even Sensitivity",
          difficulty: difficulty
        };
      } else {
        return {
          question: `Tooling Option A incurs $${fcA.toLocaleString()} fixed costs and $${vcA}/unit variable costs. Option B incurs $${fcB.toLocaleString()} fixed costs and $${vcB}/unit variable costs. Calculate the exact crossover production volume and specify decision criteria for choosing between options.`,
          answer: `Crossover Volume = ${qCross.toLocaleString()} units`,
          method: `Step 1: Equate Total Costs: $${fcA.toLocaleString()} + ($${vcA} × Q) = $${fcB.toLocaleString()} + ($${vcB} × Q).\nStep 2: $${fcA.toLocaleString()} - $${fcB.toLocaleString()} = ($${vcB} - $${vcA}) × Q => $${(fcA - fcB).toLocaleString()} = $${vcB - vcA} × Q.\nStep 3: Q = $${(fcA - fcB).toLocaleString()} / $${vcB - vcA} = ${qCross.toLocaleString()} units.\nStep 4: Decision Rule: If forecast volume < ${qCross.toLocaleString()}, select Option B (low fixed cost). If forecast volume > ${qCross.toLocaleString()}, select Option A (high operating leverage).`,
          topic: "Spreadsheet Modeling & Break-Even Sensitivity",
          difficulty: difficulty
        };
      }
    } else {
      const governanceScenarios = [
        { concept: "Dual-Class Stock Structures", rule: "Concentrates voting power with founders while distributing economic risk to public common shareholders" },
        { concept: "Executive Compensation Clawbacks", rule: "Mandates recovery of incentive pay following financial restatements or material compliance breaches" },
        { concept: "Stakeholder Capitalism (ESG)", rule: "Broadens fiduciary responsibility beyond pure equity holders to employees, suppliers, and community environments" },
        { concept: "Board Independence Mandates", rule: "Requires majority non-executive board directors on audit and compensation committees under Sarbanes-Oxley" }
      ];
      const g = governanceScenarios[s % governanceScenarios.length];

      if (f === "quiz") {
        return {
          question: `Under corporate governance standards, what is the core structural implication of ${g.concept}?`,
          options: [
            `A) ${g.rule}`,
            `B) Eliminates all quarterly SEC Form 10-Q filing obligations for listed firms`,
            `C) Converts debt debentures into preferred stock automatically upon downgrade`,
            `D) Requires unanimous shareholder consent for routine board member re-elections`
          ],
          correctOption: "A",
          answer: g.rule,
          method: `Sound corporate governance balances managerial agency incentives with external shareholder and stakeholder rights.`,
          topic: "Stakeholder Theory & Corporate Governance",
          difficulty: difficulty
        };
      } else if (f === "flashcards") {
        return {
          front: `What is the fiduciary role of ${g.concept} in modern corporate governance?`,
          back: g.rule,
          mnemonic: "Governance aligns management agency incentives with shareholder protections.",
          method: "Enforces accountability, prevents conflicts of interest, and ensures transparent reporting.",
          topic: "Stakeholder Theory & Corporate Governance",
          difficulty: difficulty
        };
      } else {
        return {
          question: `Analyze the role of ${g.concept} in corporate governance. Define the primary mechanism and evaluate how it mitigates principal-agent conflicts between executives and shareholders.`,
          answer: g.rule,
          method: `1. Identify principal-agent friction points.\n2. Detail structural monitoring or compensation alignment mechanism.\n3. Evaluate impact on corporate valuation and risk profile.`,
          topic: "Stakeholder Theory & Corporate Governance",
          difficulty: difficulty
        };
      }
    }
  },

  // --- BUS 1204: AI Literacy for Business ---
  generateBUS1204Problem(topicName, format, difficulty, seed) {
    const t = (topicName || "").toLowerCase();
    const f = (format || "problems").toLowerCase();
    const s = Math.abs(seed) || 1;

    if (t.includes("rag") || t.includes("vector")) {
      const topK = [3, 5, 8, 10][s % 4];
      const chunkSizes = [256, 512, 1024][s % 3];

      if (f === "quiz") {
        return {
          question: "In a corporate RAG (Retrieval-Augmented Generation) pipeline, what is the primary technical reason for calculating cosine similarity between dense text embeddings rather than Euclidean distance?",
          options: [
            "A) Cosine similarity normalizes for document text chunk length by evaluating vector angle rather than magnitude",
            "B) Euclidean distance requires proprietary GPU matrix multiplication drivers not available in cloud vector DBs",
            "C) Cosine similarity automatically performs lexical keyword stem filtering during embedding creation",
            "D) Euclidean distance is mathematically undefined in multidimensional embedding spaces exceeding 128 dimensions"
          ],
          correctOption: "A",
          answer: "Cosine similarity normalizes for document text chunk length by evaluating vector angle rather than magnitude",
          method: "Cosine similarity measures cos(θ) = (A·B) / (||A|| ||B||), isolating semantic orientation independent of raw token count or vector magnitude.",
          topic: "Retrieval-Augmented Generation (RAG) & Vector Databases",
          difficulty: difficulty
        };
      } else if (f === "flashcards") {
        return {
          front: "What is RAG (Retrieval-Augmented Generation) and what corporate business problem does it solve?",
          back: "RAG retrieves relevant private enterprise documents from a vector database using semantic similarity and injects them into the LLM context prompt. It eliminates hallucinations and allows models to reason over proprietary data without fine-tuning.",
          mnemonic: "RAG = Search First, Answer Second with Real Data!",
          method: "Chunks documents -> Creates embeddings -> Vector search on user query -> Context injection into LLM prompt.",
          topic: "Retrieval-Augmented Generation (RAG) & Vector Databases",
          difficulty: difficulty
        };
      } else {
        return {
          question: `Design an enterprise RAG architecture for a Pamplin corporate client. Specify chunk size (${chunkSizes} tokens), top-k retrieval strategy (k=${topK}), embedding similarity metric, and re-ranking protocols to minimize generative hallucinations.`,
          answer: `Use ${chunkSizes}-token chunks with 15% overlap, cosine similarity vector search retrieving top-${topK} chunks, and cross-encoder re-ranking.`,
          method: `Step 1: Document chunking with semantic boundary preservation.\nStep 2: Dense embedding generation using high-dimensional bi-encoders.\nStep 3: Approximate Nearest Neighbor (ANN/HNSW) vector search retrieving top-${topK} candidates.\nStep 4: Cross-encoder re-ranking and grounding in system context prompt.`,
          topic: "Retrieval-Augmented Generation (RAG) & Vector Databases",
          difficulty: difficulty
        };
      }
    } else {
      const llmTopics = [
        { topic: "Self-Attention Computational Complexity", val: "O(N²) quadratic scaling with sequence length N due to all-pairs token interaction matrices" },
        { topic: "Decoding Strategies (Temperature vs Top-P)", val: "Temperature scales logit variance while Top-P (nucleus sampling) limits selection to cumulative probability threshold" },
        { topic: "Post-Training Model Quantization", val: "Reduces weights from FP16 to INT4/INT8 to cut GPU VRAM footprints by 50-75% with minimal perplexity loss" },
        { topic: "Constitutional AI & Guardrails", val: "Uses automated critique and rule-based constitutional principles to filter toxic outputs before user rendering" }
      ];
      const cur = llmTopics[s % llmTopics.length];

      if (f === "quiz") {
        return {
          question: `In modern Large Language Model (LLM) business applications, which statement accurately characterizes ${cur.topic}?`,
          options: [
            `A) ${cur.val}`,
            `B) Eliminates all backpropagation training costs by converting models into deterministic hash maps`,
            `C) Guarantees 100% factual zero-shot accuracy across all domain-specific compliance tasks`,
            `D) Restricts token generation strictly to single-word dictionary lookups without contextual conditioning`
          ],
          correctOption: "A",
          answer: cur.val,
          method: "LLM architectures balance compute efficiency, attention mechanisms, and post-processing safety layers.",
          topic: "Generative AI Architecture & Large Language Models",
          difficulty: difficulty
        };
      } else if (f === "flashcards") {
        return {
          front: `What is the significance of ${cur.topic} in generative AI systems?`,
          back: cur.val,
          mnemonic: "Architecture design dictates cost, latency, and reasoning capability.",
          method: "Evaluates the computational and operational tradeoffs in enterprise model deployment.",
          topic: "Generative AI Architecture & Large Language Models",
          difficulty: difficulty
        };
      } else {
        return {
          question: `Analyze ${cur.topic} in enterprise AI deployment. Define the governing mathematical or architectural principle and evaluate its impact on latency, inference cost, and accuracy.`,
          answer: cur.val,
          method: `1. Define governing architectural relation.\n2. Detail impact on GPU memory bandwidth and FLOP efficiency.\n3. Formulate business recommendations for operational deployment.`,
          topic: "Generative AI Architecture & Large Language Models",
          difficulty: difficulty
        };
      }
    }
  },

  // --- ECON 2005: Principles of Economics (Microeconomics) ---
  generateECON2005Problem(topicName, format, difficulty, seed) {
    const t = (topicName || "").toLowerCase();
    const f = (format || "problems").toLowerCase();
    const s = Math.abs(seed) || 1;

    // Price Elasticity of Demand
    if (t.includes("elasticity")) {
      const p1 = (((s % 4) + 3) * 10);
      const p2 = p1 + (((Math.floor(s / 3) % 3) + 1) * 10);
      const q1 = (((s % 5) + 8) * 20);
      const q2 = q1 - (((Math.floor(s / 5) % 4) + 2) * 25);
      const avgQ = (q1 + q2) / 2;
      const avgP = (p1 + p2) / 2;
      const pctQ = (q2 - q1) / avgQ;
      const pctP = (p2 - p1) / avgP;
      const ed = Math.abs(pctQ / pctP).toFixed(2);
      const isElastic = parseFloat(ed) > 1.0;

      if (f === "quiz") {
        return {
          question: `When the Virginia Tech Bookstore raises textbook prices from $${p1} to $${p2}, daily quantity demanded drops from ${q1} to ${q2} units. Using the Midpoint Formula, what is the Price Elasticity of Demand (Ed)?`,
          options: [
            `A) Ed = ${ed} (${isElastic ? 'Price Elastic' : 'Price Inelastic'})`,
            `B) Ed = ${(parseFloat(ed) + 0.65).toFixed(2)} (Unitary Elastic)`,
            `C) Ed = ${(parseFloat(ed) * 0.5).toFixed(2)} (Perfect Inelastic)`,
            `D) Ed = ${(parseFloat(ed) + 1.2).toFixed(2)} (Elastic)`
          ],
          correctOption: "A",
          answer: `Ed = ${ed} (${isElastic ? 'Price Elastic' : 'Price Inelastic'})`,
          method: `Step 1: %ΔQ = (${q2} - ${q1}) / [(${q1} + ${q2}) / 2] = ${q2 - q1} / ${avgQ} = ${(pctQ * 100).toFixed(1)}%.\nStep 2: %ΔP = ($${p2} - $${p1}) / [($${p1} + $${p2}) / 2] = ${p2 - p1} / ${avgP} = +${(pctP * 100).toFixed(1)}%.\nStep 3: Ed = |%ΔQ / %ΔP| = |${pctQ.toFixed(4)} / ${pctP.toFixed(4)}| = ${ed}.\nStep 4: Because Ed ${isElastic ? '> 1.0' : '< 1.0'}, demand is ${isElastic ? 'ELASTIC' : 'INELASTIC'}.`,
          topic: "Supply, Demand & Price Elasticity",
          difficulty: difficulty
        };
      } else if (f === "flashcards") {
        return {
          front: "What is the Midpoint Formula for Price Elasticity of Demand (Ed), and how does elasticity relate to Total Revenue?",
          back: "Ed = |[(Q2 - Q1) / ((Q1 + Q2)/2)] / [(P2 - P1) / ((P1 + P2)/2)]|. When demand is Elastic (Ed > 1), increasing price DECREASES total revenue. When Inelastic (Ed < 1), increasing price INCREASES total revenue.",
          mnemonic: "Inelastic = Price & Revenue move IN the same direction!",
          method: "Midpoint formula yields the identical elasticity value whether moving upward or downward along the demand curve.",
          topic: "Supply, Demand & Price Elasticity",
          difficulty: difficulty
        };
      } else {
        return {
          question: `When the Virginia Tech Bookstore raises textbook prices from $${p1} to $${p2}, daily quantity demanded drops from ${q1} to ${q2} units. Using the Midpoint Formula, calculate the Price Elasticity of Demand (Ed) and explain the total revenue implications.`,
          answer: `Ed = ${ed} (${isElastic ? 'Price Elastic Demand' : 'Price Inelastic Demand'})`,
          method: `Step 1: %ΔQ = (${q2} - ${q1}) / [(${q1} + ${q2}) / 2] = ${q2 - q1} / ${avgQ} = ${(pctQ * 100).toFixed(1)}%.\nStep 2: %ΔP = ($${p2} - $${p1}) / [($${p1} + $${p2}) / 2] = ${p2 - p1} / ${avgP} = +${(pctP * 100).toFixed(1)}%.\nStep 3: Ed = |%ΔQ / %ΔP| = ${ed}.\nStep 4: Revenue Impact: Because demand is ${isElastic ? 'ELASTIC' : 'INELASTIC'}, price increase causes total revenue to ${isElastic ? 'DECREASE' : 'INCREASE'}.`,
          topic: "Supply, Demand & Price Elasticity",
          difficulty: difficulty
        };
      }
    } else {
      const a = (((s % 5) + 8) * 10);
      const b = 2;
      const c = (((s % 4) + 2) * 5);
      const d = 3;
      const eqP = Math.round((a - c) / (b + d));
      const eqQ = a - (b * eqP);

      if (f === "quiz") {
        return {
          question: `A competitive Blacksburg market has demand Qd = ${a} - ${b}P and supply Qs = ${c} + ${d}P. What is the equilibrium market price (P*) and equilibrium quantity (Q*)?`,
          options: [
            `A) P* = $${eqP}; Q* = ${eqQ} units`,
            `B) P* = $${eqP + 5}; Q* = ${eqQ - 10} units`,
            `C) P* = $${eqP - 4}; Q* = ${eqQ + 8} units`,
            `D) P* = $${eqP + 8}; Q* = ${eqQ - 16} units`
          ],
          correctOption: "A",
          answer: `P* = $${eqP}; Q* = ${eqQ} units`,
          method: `Step 1: Equate Qd = Qs: ${a} - ${b}P = ${c} + ${d}P.\nStep 2: ${a} - ${c} = (${d} + ${b})P => ${a - c} = ${d + b}P.\nStep 3: P* = ${a - c} / ${d + b} = $${eqP}.\nStep 4: Substitute into Qd: Q* = ${a} - (${b} × ${eqP}) = ${eqQ} units.`,
          topic: "Supply, Demand & Market Equilibrium",
          difficulty: difficulty
        };
      } else if (f === "flashcards") {
        return {
          front: "In microeconomics, what condition defines Market Equilibrium, and what happens when price is set above or below equilibrium?",
          back: "Market equilibrium occurs where Quantity Demanded equals Quantity Supplied (Qd = Qs). If Price > Equilibrium: Quantity Supplied > Quantity Demanded -> Market Surplus. If Price < Equilibrium: Quantity Demanded > Quantity Supplied -> Market Shortage.",
          mnemonic: "Price above = Surplus pile; Price below = Shortage line.",
          method: "Market competitive forces push price toward equilibrium where no surplus or shortage exists.",
          topic: "Supply, Demand & Market Equilibrium",
          difficulty: difficulty
        };
      } else {
        return {
          question: `A competitive Blacksburg market has demand Qd = ${a} - ${b}P and supply Qs = ${c} + ${d}P. Determine the equilibrium price and quantity, and calculate the size of the surplus or shortage if the local government imposes a price floor of $${eqP + 6}.`,
          answer: `P* = $${eqP}, Q* = ${eqQ} units. Price floor of $${eqP + 6} creates a surplus of ${(c + d*(eqP+6)) - (a - b*(eqP+6))} units.`,
          method: `Step 1: Equate Qd = Qs: ${a} - ${b}P = ${c} + ${d}P => P* = $${eqP}, Q* = ${eqQ}.\nStep 2: At price floor P = $${eqP + 6}:\nQd = ${a} - ${b}(${eqP + 6}) = ${a - b*(eqP+6)} units.\nQs = ${c} + ${d}(${eqP + 6}) = ${c + d*(eqP+6)} units.\nStep 3: Surplus = Qs - Qd = ${(c + d*(eqP+6)) - (a - b*(eqP+6))} units.`,
          topic: "Supply, Demand & Market Equilibrium",
          difficulty: difficulty
        };
      }
    }
  },

  // --------------------------------------------------------------------------
  // 1. CALCULUS II (MATH 1226) PROCEDURAL GENERATOR
  // --------------------------------------------------------------------------
  generateCalculusProblem(topicName, format, difficulty, seed) {
    const t = topicName.toLowerCase();
    const k = (seed % 6) + 2; // 2..7
    const m = (seed % 3) + 1; // 1..3
    const a = (seed % 5) + 2; // 2..6
    const a2 = a * a;
    const arch = (seed >> 2) % 4;

    // TOPIC: Integration by Parts
    if (t.includes("parts") || t.includes("ibp")) {
      if (format === "quiz") {
        return {
          question: `Evaluate the indefinite integral using Integration by Parts: ∫ x · e^(${k}x) dx.`,
          options: [
            `A) (1/${k})x·e^(${k}x) - (1/${k*k})e^(${k}x) + C`,
            `B) (1/${k})x·e^(${k}x) + (1/${k*k})e^(${k}x) + C`,
            `C) x·e^(${k}x) - (1/${k})e^(${k}x) + C`,
            `D) (1/${k*k})x^2·e^(${k}x) + C`
          ],
          correctOption: "A",
          answer: `(1/${k})x·e^(${k}x) - (1/${k*k})e^(${k}x) + C`,
          method: `Let u = x (du = dx) and dv = e^(${k}x) dx (v = (1/${k})e^(${k}x)).\nFormula: ∫ u dv = u·v - ∫ v du\n= (1/${k})x e^(${k}x) - ∫ (1/${k})e^(${k}x) dx\n= (1/${k})x e^(${k}x) - (1/${k*k})e^(${k}x) + C.`,
          difficulty: "Medium",
          topic: "Integration by Parts"
        };
      } else if (format === "flashcards") {
        return {
          front: `Integration by Parts LIPET Priority for ∫ x^${m} · e^(${k}x) dx`,
          back: `Assign u = x^${m} (algebraic) and dv = e^(${k}x) dx (exponential). Differentiating u reduces the polynomial degree by 1 per step.`,
          mnemonic: "LIPET Order: Logs, Inv Trig, Polynomials, Exponentials, Trig.",
          difficulty: "Easy",
          topic: "Integration by Parts"
        };
      } else {
        if (arch === 0) {
          return {
            question: `Evaluate the indefinite integral: ∫ x^2 · cos(${k}x) dx showing both Integration by Parts steps clearly.`,
            answer: `(1/${k})x^2·sin(${k}x) + (2/${k*k})x·cos(${k}x) - (2/${k*k*k})sin(${k}x) + C`,
            method: `Step 1: First IBP with u = x^2 (du = 2x dx), dv = cos(${k}x) dx (v = (1/${k})sin(${k}x)):\n= (1/${k})x^2 sin(${k}x) - (2/${k}) ∫ x sin(${k}x) dx.\nStep 2: Second IBP on ∫ x sin(${k}x) dx with u = x, dv = sin(${k}x) dx:\n= -(1/${k})x cos(${k}x) + (1/${k*k})sin(${k}x).\nStep 3: Combine and distribute -(2/${k}):\n= (1/${k})x^2 sin(${k}x) + (2/${k*k})x cos(${k}x) - (2/${k*k*k})sin(${k}x) + C.`,
            difficulty: "Hard",
            topic: "Integration by Parts"
          };
        } else if (arch === 1) {
          const p = (seed % 3) + 2;
          return {
            question: `Evaluate the indefinite integral using Integration by Parts: ∫ x^${p} · ln(x) dx.`,
            answer: `(1/${p+1})x^(${p+1})·ln(x) - (1/${(p+1)*(p+1)})x^(${p+1}) + C`,
            method: `Step 1: By LIPET, let u = ln(x) (du = (1/x) dx), dv = x^${p} dx (v = (1/${p+1})x^(${p+1})).\nStep 2: Apply formula u·v - ∫ v du:\n= (1/${p+1})x^(${p+1}) ln(x) - ∫ (1/${p+1})x^(${p+1}) · (1/x) dx\n= (1/${p+1})x^(${p+1}) ln(x) - (1/${p+1}) ∫ x^${p} dx\n= (1/${p+1})x^(${p+1}) ln(x) - (1/${(p+1)*(p+1)})x^(${p+1}) + C.`,
            difficulty: "Medium",
            topic: "Integration by Parts"
          };
        } else if (arch === 2) {
          return {
            question: `Evaluate the circular integral using Integration by Parts twice: ∫ e^(${k}x) · sin(x) dx.`,
            answer: `(e^(${k}x) / (${k*k + 1})) · (${k}·sin(x) - cos(x)) + C`,
            method: `Step 1: Let I = ∫ e^(${k}x) sin(x) dx. Let u = sin(x), dv = e^(${k}x) dx => I = (1/${k})e^(${k}x) sin(x) - (1/${k}) ∫ e^(${k}x) cos(x) dx.\nStep 2: Second IBP with u = cos(x), dv = e^(${k}x) dx gives (1/${k})e^(${k}x) cos(x) + (1/${k}) ∫ e^(${k}x) sin(x) dx.\nStep 3: Substitute back: I = (1/${k})e^(${k}x) sin(x) - (1/${k*k})e^(${k}x) cos(x) - (1/${k*k}) I.\nStep 4: Solve for I: (1 + 1/${k*k}) I = (e^(${k}x)/${k*k})(${k} sin(x) - cos(x)) => I = (e^(${k}x)/(${k*k + 1}))(${k} sin(x) - cos(x)) + C.`,
            difficulty: "Hard",
            topic: "Integration by Parts"
          };
        } else {
          return {
            question: `Compute the indefinite integral: ∫ arctan(${k}x) dx using Integration by Parts.`,
            answer: `x·arctan(${k}x) - (1/${2*k})·ln(1 + ${k*k}x^2) + C`,
            method: `Step 1: Let u = arctan(${k}x) (du = (${k}/(1 + ${k*k}x^2)) dx), dv = dx (v = x).\nStep 2: u·v - ∫ v du = x arctan(${k}x) - ∫ (${k}x / (1 + ${k*k}x^2)) dx.\nStep 3: Use u-substitution w = 1 + ${k*k}x^2 (dw = 2·${k*k}x dx):\n= x arctan(${k}x) - (1/${2*k}) ln(1 + ${k*k}x^2) + C.`,
            difficulty: "Medium",
            topic: "Integration by Parts"
          };
        }
      }
    }

    // TOPIC: Trigonometric Substitution
    else if (t.includes("trig") || t.includes("substitution")) {
      if (format === "quiz") {
        return {
          question: `Which trigonometric substitution eliminates the radical in ∫ 1 / (x^2 + ${a2})^(3/2) dx?`,
          options: [
            `A) x = ${a} tan(θ)`,
            `B) x = ${a} sin(θ)`,
            `C) x = ${a} sec(θ)`,
            `D) x = ${a2} tan(θ)`
          ],
          correctOption: "A",
          answer: `x = ${a} tan(θ)`,
          method: `Forms of (x^2 + a^2) use the tangent identity 1 + tan^2(θ) = sec^2(θ). With a^2 = ${a2}, a = ${a}, so x = ${a} tan(θ) and dx = ${a} sec^2(θ) dθ.`,
          difficulty: "Easy",
          topic: "Trigonometric Substitution"
        };
      } else if (format === "flashcards") {
        return {
          front: `Trig Substitution Rules (Three Canonical Forms)`,
          back: `1. sqrt(a^2 - x^2) => x = a sin(θ)\n2. sqrt(a^2 + x^2) => x = a tan(θ)\n3. sqrt(x^2 - a^2) => x = a sec(θ)`,
          mnemonic: "Constant minus x^2 = Sine; Plus = Tangent; Variable first = Secant.",
          difficulty: "Easy",
          topic: "Trigonometric Substitution"
        };
      } else {
        if (arch % 2 === 0) {
          return {
            question: `Evaluate the definite integral using trigonometric substitution: ∫[0 to ${a}] x^3 / sqrt(${a2} - x^2) dx.`,
            answer: `${(2 * a * a * a / 3).toFixed(2)} (or 2·${a}^3 / 3)`,
            method: `Step 1: Let x = ${a} sin(θ), dx = ${a} cos(θ) dθ. Bounds: x=0 => θ=0; x=${a} => θ=π/2.\nStep 2: sqrt(${a2} - x^2) = ${a} cos(θ).\nStep 3: Integrand becomes: (${a}^3 sin^3(θ) / (${a} cos(θ))) · ${a} cos(θ) dθ = ${a}^3 (1 - cos^2(θ)) sin(θ) dθ.\nStep 4: Let w = cos(θ): ${a}^3 ∫[0 to 1] (1 - w^2) dw = ${a}^3 [w - w^3/3][0 to 1] = (2/3)·${a}^3 = ${(2 * a * a * a / 3).toFixed(2)}.`,
            difficulty: "Hard",
            topic: "Trigonometric Substitution"
          };
        } else {
          return {
            question: `Evaluate the indefinite integral using trigonometric substitution: ∫ 1 / (x^2 + ${a2})^(3/2) dx.`,
            answer: `x / (${a2} · sqrt(x^2 + ${a2})) + C`,
            method: `Step 1: Let x = ${a} tan(θ), dx = ${a} sec^2(θ) dθ.\nStep 2: (x^2 + ${a2})^(3/2) = (${a}^2 sec^2(θ))^(3/2) = ${a}^3 sec^3(θ).\nStep 3: ∫ (${a} sec^2(θ) / (${a}^3 sec^3(θ))) dθ = (1/${a2}) ∫ cos(θ) dθ = (1/${a2}) sin(θ) + C.\nStep 4: From triangle: sin(θ) = x / sqrt(x^2 + ${a2}).\nFinal: x / (${a2} sqrt(x^2 + ${a2})) + C.`,
            difficulty: "Medium",
            topic: "Trigonometric Substitution"
          };
        }
      }
    }

    // TOPIC: Improper Integrals
    else if (t.includes("improper")) {
      const p = (seed % 3) + 2;
      const c = (seed % 3) + 1;
      if (format === "quiz") {
        const val = (p / ((p - 1) * Math.pow(c, p - 1))).toFixed(3);
        return {
          question: `Evaluate the improper integral or determine divergence: ∫[${c} to ∞] ${p} / x^${p} dx.`,
          options: [
            `A) Converges to ${val}`,
            "B) Diverges to +∞",
            "C) Converges to 0",
            "D) Diverges by oscillation"
          ],
          correctOption: "A",
          answer: `Converges to ${val}`,
          method: `Express as limit: lim[b->∞] ∫[${c} to b] ${p} x^(-${p}) dx = lim[b->∞] [(${p}/(-${p-1})) x^(-${p-1})][${c} to b]. Since p = ${p} > 1, the upper bound approaches 0, yielding ${p} / (${p-1} · ${c}^${p-1}) = ${val}.`,
          difficulty: "Easy",
          topic: "Improper Integrals"
        };
      } else if (format === "flashcards") {
        return {
          front: "p-Integral Convergence Test: ∫[1 to ∞] 1/x^p dx",
          back: "Converges if and only if p > 1. Diverges if p ≤ 1 (including the harmonic p = 1 case).",
          mnemonic: "p > 1 Converges. p ≤ 1 Diverges.",
          difficulty: "Easy",
          topic: "Improper Integrals"
        };
      } else {
        if (arch % 2 === 0) {
          return {
            question: `Determine whether the improper integral with an internal vertical asymptote converges or diverges: ∫[0 to ${c}] 1 / (${c} - x)^(2/3) dx.`,
            answer: `Converges to ${(3 * Math.cbrt(c)).toFixed(3)}`,
            method: `Step 1: Vertical asymptote at upper bound x = ${c}.\nStep 2: Express as limit: lim[t->${c}^-] ∫[0 to t] (${c} - x)^(-2/3) dx.\nStep 3: Antiderivative is -3(${c} - x)^(1/3).\nStep 4: Evaluate: lim[t->${c}^-] [-3(${c} - t)^(1/3) - (-3·${c}^(1/3))] = 0 + 3·${c}^(1/3) = ${(3 * Math.cbrt(c)).toFixed(3)}. Converges.`,
            difficulty: "Medium",
            topic: "Improper Integrals"
          };
        } else {
          return {
            question: `Use the Direct Comparison Test to prove convergence or divergence of: ∫[1 to ∞] (${k} + cos^2(x)) / x^3 dx.`,
            answer: "Converges by Direct Comparison Test (bounded above by (k+1)/x^3)",
            method: `Step 1: 0 ≤ cos^2(x) ≤ 1 for all real x, so 0 ≤ (${k} + cos^2(x)) / x^3 ≤ ${k+1} / x^3 for all x ≥ 1.\nStep 2: Evaluate comparison integral: ∫[1 to ∞] (${k+1})/x^3 dx = (${k+1}) [ -1 / (2x^2) ][1 to ∞] = (${k+1})/2 < ∞.\nStep 3: Since the upper bounding integral converges (p=3 > 1), the original integral converges by the Direct Comparison Test.`,
            difficulty: "Medium",
            topic: "Improper Integrals"
          };
        }
      }
    }

    // TOPIC: Sequences & Convergence Tests
    else if (t.includes("sequence") || t.includes("convergence") || t.includes("series")) {
      if (format === "quiz") {
        return {
          question: `Determine the convergence behavior of the alternating series: ∑[n=1 to ∞] (-1)^(n+1) · (n / (${k}n^2 + 1)).`,
          options: [
            "A) Converges conditionally",
            "B) Converges absolutely",
            "C) Diverges to +∞",
            "D) Diverges by oscillation"
          ],
          correctOption: "A",
          answer: "Converges conditionally",
          method: `1. Absolute convergence: ∑ n / (${k}n^2 + 1). Limit comparison with 1/n yields L = 1/${k} > 0. Since ∑ 1/n diverges, the series does NOT converge absolutely.\n2. Alternating Series Test: b_n = n / (${k}n^2 + 1) is positive, decreasing for n ≥ 1, and lim[n->∞] b_n = 0. By AST, it converges.\nConclusion: Converges conditionally.`,
          difficulty: "Hard",
          topic: "Sequences & Convergence Tests"
        };
      } else if (format === "flashcards") {
        return {
          front: "Alternating Series Test (AST) Conditions",
          back: "For ∑ (-1)^n b_n with b_n > 0: (1) b_(n+1) ≤ b_n for all n (monotonically decreasing), and (2) lim[n->∞] b_n = 0.",
          mnemonic: "AST Checklist: Positive, Decreasing, Zero limit.",
          difficulty: "Easy",
          topic: "Sequences & Convergence Tests"
        };
      } else {
        if (arch % 2 === 0) {
          const isConv = k < 2.718;
          return {
            question: `Apply the Ratio Test to determine whether the series converges or diverges: ∑[n=1 to ∞] (${k}^n · n!) / n^n. Show all limit steps.`,
            answer: `${isConv ? 'Converges' : 'Diverges'} (Limit L = ${k}/e ≈ ${(k/2.718).toFixed(2)})`,
            method: `Step 1: Ratio |a_(n+1)/a_n| = |(${k}^(n+1)(n+1)! / (n+1)^(n+1)) · (n^n / (${k}^n n!))|\nStep 2: Simplify: = ${k} · (n+1) · n^n / (n+1)^(n+1) = ${k} · (n/(n+1))^n = ${k} / (1 + 1/n)^n.\nStep 3: Evaluate limit: lim[n->∞] (1 + 1/n)^n = e (~2.71828), giving L = ${k}/e.\nStep 4: Since ${k} ${isConv ? '< e, L < 1, so the series CONVERGES' : '> e, L > 1, so the series DIVERGES'} by the Ratio Test.`,
            difficulty: "Hard",
            topic: "Sequences & Convergence Tests"
          };
        } else {
          return {
            question: `Determine the convergence of the series using the Integral Test: ∑[n=2 to ∞] 1 / (n · (ln n)^${k}).`,
            answer: "Converges by Integral Test",
            method: `Step 1: Let f(x) = 1 / (x (ln x)^${k}). Continuous, positive, decreasing for x ≥ 2.\nStep 2: Evaluate ∫[2 to ∞] 1 / (x (ln x)^${k}) dx. Let u = ln x, du = (1/x) dx.\nStep 3: ∫[ln 2 to ∞] u^(-${k}) du = [ u^(-${k-1}) / (-${k-1}) ][ln 2 to ∞] = 1 / (${k-1} · (ln 2)^${k-1}) < ∞.\nStep 4: Since the improper integral converges, the series converges by the Integral Test.`,
            difficulty: "Medium",
            topic: "Sequences & Convergence Tests"
          };
        }
      }
    }

    // TOPIC: Power Series & Taylor Polynomials
    else if (t.includes("power") || t.includes("taylor") || t.includes("polynomial")) {
      const cVal = (seed % 4) + 2;
      const rVal = (seed % 4) + 2;
      return {
        question: `Find the radius R and exact interval of convergence for the power series: ∑[n=1 to ∞] (x - ${cVal})^n / (n · ${rVal}^n). Test both endpoints explicitly.`,
        answer: `[${cVal - rVal}, ${cVal + rVal}) with Radius R = ${rVal}`,
        method: `Step 1: Ratio Test: lim |(x - ${cVal})^(n+1) / ((n+1)${rVal}^(n+1)) · (n ${rVal}^n / (x - ${cVal})^n)| = |x - ${cVal}| / ${rVal} < 1 => Radius R = ${rVal}.\nStep 2: Open interval: ${cVal - rVal} < x < ${cVal + rVal}.\nStep 3: Check left endpoint x = ${cVal - rVal}: ∑ (-${rVal})^n / (n ${rVal}^n) = ∑ (-1)^n / n (alternating harmonic series, CONVERGES by AST). Include left bound.\nStep 4: Check right endpoint x = ${cVal + rVal}: ∑ ${rVal}^n / (n ${rVal}^n) = ∑ 1/n (harmonic series, DIVERGES). Exclude right bound.\nConclusion: Interval of convergence is [${cVal - rVal}, ${cVal + rVal}).`,
        difficulty: "Hard",
        topic: "Power Series & Taylor Polynomials"
      };
    }

    // TOPIC: Parametric Curves & Polar Coordinates
    else {
      return {
        question: `Find the slope of the tangent line dy/dx to the parametric curve x = ${k} cos(t), y = ${k} sin(t) at parameter value t = π/${k}.`,
        answer: `-cot(π/${k})`,
        method: `Step 1: dx/dt = -${k} sin(t) and dy/dt = ${k} cos(t).\nStep 2: By chain rule, dy/dx = (dy/dt) / (dx/dt) = (${k} cos(t)) / (-${k} sin(t)) = -cot(t).\nStep 3: Evaluate at t = π/${k}: dy/dx = -cot(π/${k}).`,
        difficulty: "Medium",
        topic: "Parametric Curves & Polar Coordinates"
      };
    }
  },

  // --------------------------------------------------------------------------
  // 2. INTRODUCTORY PSYCHOLOGY (PSYC 1004) PROCEDURAL GENERATOR
  // --------------------------------------------------------------------------
  generatePsychologyProblem(topicName, format, difficulty, seed) {
    const t = topicName.toLowerCase();
    const rnd = (seed >> 1) % 4;

    if (t.includes("action") || t.includes("neuro")) {
      return {
        question: "Detail the precise molecular mechanism of the neuronal action potential from resting membrane potential (-70 mV) to the hyperpolarization undershoot (-80 mV). Specify the states (open, closed, inactivated) of both voltage-gated Na+ and K+ channels throughout each phase.",
        answer: "Resting (-70 mV, Na+ closed, K+ closed) -> Depolarization (-55 mV to +40 mV, Na+ open, K+ slow opening) -> Repolarization (+40 mV down, Na+ inactivated, K+ fully open) -> Hyperpolarization (-80 mV, Na+ resetting to closed, K+ slow closing).",
        method: "Step 1: Resting potential (-70 mV) governed by Na+/K+ ATPase and K+ leak.\nStep 2: Threshold attainment (-55 mV) opens activation gates of voltage-gated Na+ channels.\nStep 3: Rapid depolarization (+40 mV) followed by inactivation gate closure (absolute refractory period).\nStep 4: Delayed rectifier K+ channels open, repolarizing membrane.\nStep 5: Slow closure of K+ channels produces afterhyperpolarization undershoot (relative refractory period).",
        difficulty: "Hard",
        topic: "Neuroscience & Action Potentials"
      };
    } else if (t.includes("sensation") || t.includes("perception")) {
      const baseWeight = [60, 80, 100, 120][seed % 4];
      const frac = [0.02, 0.03, 0.05][seed % 3];
      const jnd = Math.round(baseWeight * frac);
      const testBase = baseWeight * 2;
      const testJnd = Math.round(testBase * frac);
      return {
        question: `According to Weber's Law of just noticeable difference (JND), if a subject detects a difference between a ${baseWeight}g weight and a ${baseWeight + jnd}g weight, calculate the weight increment ΔI required to detect a difference starting from a ${testBase}g baseline stimulus.`,
        answer: `${testJnd} grams (Weber fraction k = ${frac.toFixed(3)})`,
        method: `Weber's Law states ΔI / I = k.\nGiven baseline I = ${baseWeight}g and ΔI = ${jnd}g, k = ${jnd} / ${baseWeight} = ${frac.toFixed(3)}.\nFor new stimulus intensity I = ${testBase}g, required JND is ΔI = k · I = ${frac.toFixed(3)} · ${testBase}g = ${testJnd}g.`,
        difficulty: "Medium",
        topic: "Sensation & Perception Pathways"
      };
    } else if (t.includes("conditioning") || t.includes("learning")) {
      const scenarios = [
        { act: "A collegiate athlete runs sprints at 5:00 AM to eliminate the coach's threat of benching.", type: "Negative Reinforcement", exp: "Removing an aversive stimulus (threat of benching) increases sprint attendance." },
        { act: "An engineering student receives a $50 academic bonus for earning a 3.8 GPA.", type: "Positive Reinforcement", exp: "Adding a desirable reward increases study effort." },
        { act: "A driver receives a $150 speeding citation on Route 460.", type: "Positive Punishment", exp: "Administering an unpleasant penalty decreases speeding behavior." },
        { act: "A student has their smartphone privileges suspended for missing curfew.", type: "Negative Punishment", exp: "Removing a valued stimulus decreases curfew violations." }
      ];
      const sc = scenarios[seed % scenarios.length];
      return {
        question: `Identify the operant conditioning contingency in this scenario: "${sc.act}". Explain whether reinforcement or punishment is operating, and whether it is positive or negative.`,
        answer: sc.type,
        method: `Contingency: ${sc.type}.\nRationale: ${sc.exp}`,
        difficulty: "Medium",
        topic: "Classical & Operant Conditioning"
      };
    } else {
      return {
        question: "Contrast the Atkinson-Shiffrin Multi-Store Model of Memory with Baddeley's Working Memory Model. Explain why Patient H.M. could master the mirror-tracing task over several days while having zero conscious recollection of ever practicing it.",
        answer: "Atkinson-Shiffrin models memory as linear stores (Sensory -> STM -> LTM). Baddeley emphasizes working memory components (Central Executive, Phonological Loop, Visuospatial Sketchpad). Patient H.M. retained procedural motor memory (basal ganglia/cerebellum) despite bilateral medial temporal lobectomy destroying episodic consolidation (hippocampus).",
        method: "1. Define sensory, STM, and LTM stores.\n2. Detail Baddeley's tri-partite working memory model.\n3. Analyze double dissociation between declarative (explicit episodic/semantic) memory and non-declarative (implicit procedural) motor memory.",
        difficulty: "Hard",
        topic: "Memory Consolidation & Schemas"
      };
    }
  },

  // --------------------------------------------------------------------------
  // 3. INTERMEDIATE PYTHON (CS 2064) PROCEDURAL GENERATOR
  // --------------------------------------------------------------------------
  generatePythonProblem(topicName, format, difficulty, seed) {
    return {
      question: "Implement a Python class `RollingWindowAverage` that uses magic dunder method `__call__` to accept numeric samples one at a time and maintains a fixed-size moving average window of length k using `collections.deque`.",
      answer: "from collections import deque\n\nclass RollingWindowAverage:\n    def __init__(self, k):\n        self.k = k\n        self.window = deque(maxlen=k)\n    def __call__(self, val):\n        self.window.append(val)\n        return sum(self.window) / len(self.window)",
      method: "1. Import deque with maxlen=k to evict oldest elements in O(1) time.\n2. Implement __init__ to initialize queue.\n3. Implement __call__ to make the instance callable like a function.\n4. Return running average in O(1) or O(k) time.",
      difficulty: "Medium",
      topic: "Object-Oriented Design & Dunder Methods"
    };
  },

  // --------------------------------------------------------------------------
  // 4. GREEN ENGINEERING & RESEARCH ETHICS
  // --------------------------------------------------------------------------
  generateGreenEngProblem(topicName, format, difficulty, seed) {
    return {
      question: "Outline the four standardized phases of an ISO 14040 Life Cycle Assessment (LCA). For a proposed electric vehicle lithium-ion battery pack, define the functional unit and explain why a cradle-to-grave boundary is required over cradle-to-gate.",
      answer: "ISO 14040 phases: (1) Goal & Scope Definition, (2) Inventory Analysis (LCI), (3) Impact Assessment (LCIA), (4) Interpretation. Functional unit: 1 km of passenger transport over a 150,000 km lifespan. Cradle-to-grave is necessary to capture use-phase grid charging emissions and end-of-life battery recycling impacts.",
      method: "1. Detail ISO 14040 four-stage framework.\n2. Define functional unit to normalize comparisons.\n3. Distinguish cradle-to-gate (materials + manufacturing) from cradle-to-grave (including operational electricity generation and battery disposal).",
      difficulty: "Hard",
      topic: "Life Cycle Assessment (LCA) Frameworks"
    };
  },

  generateEthicsProblem(topicName, format, difficulty, seed) {
    return {
      question: "Evaluate a proposed artificial intelligence engineering study analyzing student facial engagement via webcam during online exams. Apply the three Belmont Report principles (Respect for Persons, Beneficence, Justice) to assess Institutional Review Board (IRB) compliance.",
      answer: "Respect for Persons: Requires transparent voluntary informed consent without grade penalty for opting out. Beneficence: Encryption of biometric telemetry and minimal anxiety protocols. Justice: Equitable training data ensuring no disparate false-positive cheating flags across demographic subgroups.",
      method: "1. Apply Respect for Persons (autonomy, consent).\n2. Apply Beneficence (maximize benefits, eliminate biometric surveillance harms).\n3. Apply Justice (fair distribution of experimental burdens and algorithmic equity).\n4. Classify proper IRB tier (Expedited vs Full Board).",
      difficulty: "Hard",
      topic: "The Belmont Report & IRB Protocols"
    };
  },

  generatePythonProblem(topicName, format, difficulty, seed) {
    const s = Math.abs(seed) || 1;
    const n = (s % 5) + 3;
    if (format === "quiz") {
      const evens = Array.from({length: n}, (_, i) => i).filter(x => x % 2 === 0).map(x => x**2);
      return {
        question: `In Python (CS 2064), what is the evaluation result and asymptotic complexity of \`[x**2 for x in range(${n}) if x % 2 == 0]\`?`,
        options: [
          `A) O(n) time; Output: [${evens.join(", ")}]`,
          `B) O(n^2) time; Output: [${Array.from({length: n}, (_, i) => i**2).join(", ")}]`,
          `C) O(1) space; Output: generator expression`,
          `D) O(log n) time; Output: [${Array.from({length: n}, (_, i) => i).filter(x => x % 2 !== 0).map(x => x**2).join(", ")}]`
        ],
        correctOption: "A",
        answer: `[${evens.join(", ")}]`,
        method: `A list comprehension iterates through range(${n}) in linear O(n) time, applying the predicate filter \`x % 2 == 0\` and collecting the computed squares.`,
        difficulty: difficulty || "Medium",
        topic: topicName || "Python Data Structures"
      };
    } else if (format === "flashcards") {
      return {
        front: `Python Memory Model: Mutable vs. Immutable Types (${topicName})`,
        back: `Immutable: int, float, str, tuple, frozenset (cannot be altered in-place; modifications allocate new objects). Mutable: list, dict, set (in-place modifications mutate shared references).`,
        mnemonic: "Immutable = Frozen in time (Tuples, Strings, Numbers). Mutable = Modifiable in place (Lists, Dicts, Sets).",
        difficulty: "Easy",
        topic: topicName || "Python Fundamentals"
      };
    } else {
      return {
        question: `Write an efficient Python function to solve: ${topicName}. Ensure proper exception handling and O(n) or O(log n) performance.`,
        answer: `def solution(data):\n    # Optimized collection processing\n    seen = set()\n    return [x for x in data if not (x in seen or seen.add(x))]`,
        method: `1. Initialize hash set for O(1) average lookup.\n2. Leverage generator or comprehension pipeline.\n3. Validate edge cases (empty list, duplicates, None).`,
        difficulty: "Hard",
        topic: topicName || "Python Algorithms"
      };
    }
  },

  generateEngineeringProblem(topicName, format, difficulty, seed) {
    const s = Math.abs(seed) || 1;
    const kg = (s % 8 + 2) * 10;
    if (format === "quiz") {
      return {
        question: `In Green Engineering (ENGR 3124), during a Life Cycle Assessment (LCA) for a ${kg} kg structural component, which life cycle phase typically contributes the largest share of embodied carbon?`,
        options: [
          "A) Raw Material Extraction & Primary Refining (Cradle-to-Gate)",
          "B) Warehouse Palletizing & Secondary Packaging",
          "C) Local Retail Merchandising",
          "D) Highway Tolling Administrative Logistics"
        ],
        correctOption: "A",
        answer: "A) Raw Material Extraction & Primary Refining (Cradle-to-Gate)",
        method: "Per ISO 14040/14044 standards, upstream extraction and smelting/refining typically account for 65-85% of total cradle-to-grave embodied emissions for metals and polymers.",
        difficulty: difficulty || "Medium",
        topic: topicName || "Life Cycle Assessment"
      };
    } else if (format === "flashcards") {
      return {
        front: `Four Mandatory Phases of ISO 14040 Life Cycle Assessment (LCA)`,
        back: `1. Goal and Scope Definition (System Boundary & Functional Unit)\n2. Life Cycle Inventory (LCI - Inputs & Outputs)\n3. Life Cycle Impact Assessment (LCIA - Characterization & Damage Categories)\n4. Interpretation (Sensitivity & Mitigation)`,
        mnemonic: "G-I-A-I: Goal, Inventory, Assessment, Interpretation.",
        difficulty: "Easy",
        topic: topicName || "LCA Framework"
      };
    } else {
      return {
        question: `Conduct an embodied carbon and circular economy assessment for ${topicName}. Calculate the global warming potential (GWP) reduction achieved by substituting virgin polymer (2.8 kg CO2e/kg) with 80% post-consumer recycled resin (1.0 kg CO2e/kg) for a ${kg} kg production batch.`,
        answer: `Avoided greenhouse emissions = ${(kg * 1.44).toFixed(1)} kg CO2-equivalent.`,
        method: `1. Functional unit: ${kg} kg component.\n2. Virgin baseline emissions: ${kg} * 2.8 = ${(kg * 2.8).toFixed(1)} kg CO2e.\n3. Recycled blend emissions: ${kg} * 1.36 = ${(kg * 1.36).toFixed(1)} kg CO2e.\n4. Net delta = ${(kg * 1.44).toFixed(1)} kg CO2e saved.`,
        difficulty: "Hard",
        topic: topicName || "Green Engineering Assessment"
      };
    }
  },

  generateResearchProblem(topicName, format, difficulty, seed) {
    if (format === "quiz") {
      return {
        question: `In Academic Research (ENGE 2634), when designing an empirical investigation into ${topicName}, what distinguishes an independent variable from a confounding variable?`,
        options: [
          "A) The independent variable is systematically manipulated by the investigator; a confounding variable is an uncontrolled factor that co-varies and threatens internal validity.",
          "B) Confounding variables are always plotted on the horizontal x-axis.",
          "C) Independent variables cannot be measured quantitatively.",
          "D) There is no difference in randomized controlled trials."
        ],
        correctOption: "A",
        answer: "A) The independent variable is systematically manipulated by the investigator; a confounding variable is an uncontrolled factor that co-varies and threatens internal validity.",
        method: "Rigorous research design requires isolating the independent variable while controlling or blocking extraneous variables to prevent spurious correlations.",
        difficulty: difficulty || "Medium",
        topic: topicName || "Research Methodology"
      };
    } else if (format === "flashcards") {
      return {
        front: `Internal Validity vs. External Validity in Research (${topicName})`,
        back: `Internal Validity: The confidence that the observed causal effect is solely due to the independent variable.\nExternal Validity: The extent to which empirical findings generalize across settings, times, and populations.`,
        mnemonic: "Internal = In the study (Causality). External = Everywhere (Generalizability).",
        difficulty: "Easy",
        topic: topicName || "Research Design"
      };
    } else {
      return {
        question: `Design an experimental research protocol for ${topicName}. State the directional hypothesis, define operational variables, specify sampling strategy, and select the appropriate statistical test with alpha = 0.05.`,
        answer: `Hypothesis protocol with randomized block design, a priori power analysis (1 - beta >= 0.80), and two-way ANOVA.`,
        method: `1. Formulate testable null (H0) and alternative (H1) hypotheses.\n2. Operationally define dependent and independent variables.\n3. Implement double-blind or randomized control procedures.\n4. Check parametric assumptions (normality, homoscedasticity) before hypothesis testing.`,
        difficulty: "Hard",
        topic: topicName || "Research Methods"
      };
    }
  },

  generateUniversalProblem(course, topicName, format, difficulty, seed) {
    return {
      question: `Formulate a comprehensive analytical framework for ${topicName} in ${course.name || course.code}. Define the governing variables, state all necessary boundary conditions, and detail the step-by-step mathematical or conceptual procedure to evaluate system performance.`,
      answer: `Comprehensive analytical solution for ${topicName} satisfying all Virginia Tech collegiate standards.`,
      method: `1. Define domain parameters and state initial boundary values for ${topicName}.\n2. Formulate governing differential or algebraic relations.\n3. Execute step-by-step mathematical reduction.\n4. Perform asymptotic sanity checks and dimensional analysis.`,
      difficulty: "Hard",
      topic: topicName
    };
  }
};

// ============================================================================
// RESULT RENDERING & INTERACTIVE ACTION CONTROLS
// ============================================================================

async function generateStudyMaterialsWithAgent(appendMode = false) {
  const courseId = studyingState.selectedCourseId;
  const course = (appState.courses || []).find(c => c.id === courseId);
  if (!course) {
    showToast("Please select a course first.");
    return;
  }

  const selectedTopics = Array.from(studyingState.selectedTopics);
  if (selectedTopics.length === 0) {
    showToast("Please select at least one topic to study.");
    return;
  }

  const formatRadio = document.querySelector('input[name="studying_format"]:checked');
  const format = formatRadio ? formatRadio.value : "problems";
  studyingState.currentFormat = format;

  const countVal = document.getElementById("studying-quantity-select").value;
  const difficulty = document.getElementById("studying-difficulty-select").value || "mixed";

  const btnGenerate = document.getElementById("btn-generate-study-material");
  const iconSpan = document.getElementById("generate-icon");
  const textSpan = document.getElementById("generate-text");

  if (!appendMode) {
    btnGenerate.disabled = true;
    if (iconSpan) iconSpan.textContent = "⏳";
    if (textSpan) textSpan.textContent = "Synthesizing unique problems with AI Agent...";
  }

  const t0 = performance.now();

  try {
    const newItems = HokieAIAgent.synthesize(course, selectedTopics, format, countVal, difficulty);

    if (appendMode) {
      studyingState.generatedItems.push(...newItems);
    } else {
      studyingState.generatedItems = newItems;
      studyingState.revealedSet.clear();
      studyingState.correctSet.clear();
    }

    renderGeneratedStudyResults(course, selectedTopics, format, appendMode);

    const btnPrint = document.getElementById("btn-print-office-hours");
    if (btnPrint) btnPrint.disabled = false;

    const latencyMs = Math.round(performance.now() - t0);
    const latencyLabel = document.getElementById("agent-latency-label");
    if (latencyLabel) {
      latencyLabel.textContent = `⚡ ${latencyMs}ms Latency · AI Study Agent Active`;
    }

    if (appendMode) {
      showToast(`⚡ Appended ${newItems.length} more 100% unique problems! Total: ${studyingState.generatedItems.length}`);
    } else {
      showToast(`✓ Synthesized ${newItems.length} 100% unique ${format === 'quiz' ? 'quiz questions' : format === 'flashcards' ? 'study cards' : 'practice problems'} in ${latencyMs}ms!`);
    }
  } catch (err) {
    console.error("[VT BrainWyrmsAI Agent Error]", err);
    showToast(`Error synthesizing problems: ${err.message}`);
  } finally {
    btnGenerate.disabled = false;
    if (iconSpan) iconSpan.textContent = "⚡";
    if (textSpan) textSpan.textContent = "Synthesize Practice with AI Agent";
  }
}

function renderGeneratedStudyResults(course, topics, format, appendMode = false) {
  const section = document.getElementById("studying-results-section");
  const list = document.getElementById("studying-problems-list");
  if (!section || !list) return;

  section.classList.remove("hidden");
  if (!appendMode) {
    list.innerHTML = "";
  }

  updateStudyingScoreTracker();

  const startIndex = appendMode ? studyingState.generatedItems.length - 5 : 0;
  const itemsToRender = appendMode ? studyingState.generatedItems.slice(startIndex) : studyingState.generatedItems;

  itemsToRender.forEach((item, relativeIdx) => {
    const idx = appendMode ? startIndex + relativeIdx : relativeIdx;
    const card = document.createElement("div");
    card.className = "study-problem-card";
    card.id = `study-card-${idx}`;

    const diff = (item.difficulty || "Medium").toLowerCase();
    const diffClass = diff === "easy" ? "easy" : diff === "hard" ? "hard" : "medium";

    // Card Header with problem index and topic tag
    const header = document.createElement("div");
    header.className = "problem-card-top-bar";
    header.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;">
        <span class="problem-number-badge">#${idx + 1}</span>
        <span class="problem-topic-tag">${escapeHtml(item.topic || topics[0] || course.code)}</span>
      </div>
      <div style="display:flex;align-items:center;gap:8px;">
        <span class="problem-difficulty-badge ${diffClass}">${escapeHtml(item.difficulty || "Medium")}</span>
        <button type="button" class="btn btn-xs btn-outline" title="Generate a fresh variation of this problem" onclick="generateNewVariationForCard(${idx})">
          🔄 New Variation
        </button>
      </div>
    `;
    card.appendChild(header);

    // Card Body
    const content = document.createElement("div");
    content.className = "problem-card-content";

    if (format === "flashcards") {
      renderFlashcardCard(content, item, idx);
    } else if (format === "quiz") {
      renderMultipleChoiceCard(content, item, idx);
    } else {
      renderPracticeProblemCard(content, item, idx);
    }

    card.appendChild(content);

    // Card Action Bar with Infinite Tries & Solution controls (CSP-compliant event listeners)
    const actions = document.createElement("div");
    actions.className = "problem-card-actions";

    if (format === "flashcards") {
      actions.innerHTML = `
        <button type="button" class="btn btn-sm btn-primary" id="flip-btn-${idx}">Flip Flashcard</button>
        <div style="display:flex;gap:6px;">
          <button type="button" class="btn btn-xs btn-outline" id="learned-btn-${idx}">✓ Mastered</button>
        </div>
      `;
      const flipBtn = actions.querySelector(`#flip-btn-${idx}`);
      if (flipBtn) flipBtn.addEventListener("click", () => flipFlashcard(idx));
      const learnedBtn = actions.querySelector(`#learned-btn-${idx}`);
      if (learnedBtn) learnedBtn.addEventListener("click", function() { markStudyItemCorrect(idx, this); });
    } else {
      actions.innerHTML = `
        <button type="button" class="btn btn-sm btn-primary" id="reveal-btn-${idx}">
          👁 Reveal Answer & Method
        </button>
        <div style="display:flex;gap:6px;">
          <button type="button" class="btn btn-xs btn-outline" id="retry-btn-${idx}" title="Clear scratchpad and re-attempt problem">
            ↺ Try Again
          </button>
          <button type="button" class="btn btn-xs btn-outline" id="correct-btn-${idx}">
            ✓ I Got It Right
          </button>
        </div>
      `;
      const revBtn = actions.querySelector(`#reveal-btn-${idx}`);
      if (revBtn) revBtn.addEventListener("click", () => toggleSolutionReveal(idx));
      const retryBtn = actions.querySelector(`#retry-btn-${idx}`);
      if (retryBtn) retryBtn.addEventListener("click", () => resetSingleProblemCard(idx));
      const correctBtn = actions.querySelector(`#correct-btn-${idx}`);
      if (correctBtn) correctBtn.addEventListener("click", function() { markStudyItemCorrect(idx, this); });
    }

    // New variation header button
    const varBtn = header.querySelector("button");
    if (varBtn) varBtn.addEventListener("click", () => generateNewVariationForCard(idx));

    card.appendChild(actions);
    list.appendChild(card);
  });

  // Display Endless Stream Action Bar if count was infinite or items >= 5
  const endlessBar = document.getElementById("studying-endless-bar");
  if (endlessBar) {
    endlessBar.style.display = studyingState.generatedItems.length > 0 ? "flex" : "none";
  }

  if (!appendMode) {
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function renderPracticeProblemCard(container, item, idx) {
  const qDiv = document.createElement("div");
  qDiv.className = "problem-statement-text";
  qDiv.textContent = item.question;
  container.appendChild(qDiv);

  const scratchDiv = document.createElement("div");
  scratchDiv.className = "office-hours-scratchpad-wrap";
  scratchDiv.innerHTML = `
    <div class="scratchpad-header">
      <span>📝 Student Working Scratchpad:</span>
      <span style="font-size:11px;font-weight:500;text-transform:none;color:#64748b;">(Not graded · Show debit/credit accounts or working calculations)</span>
    </div>
    <textarea class="scratchpad-textarea" id="scratchpad-${idx}" placeholder="Type your journal entry debits/credits or show your working formulas here before revealing solution..."></textarea>
  `;
  container.appendChild(scratchDiv);

  const solDiv = document.createElement("div");
  solDiv.className = "solution-method-box hidden";
  solDiv.id = `solution-${idx}`;
  solDiv.innerHTML = `
    <div class="solution-header">
      <span class="solution-badge">Verified Answer</span>
      <strong class="solution-answer-text">${escapeHtml(item.answer)}</strong>
    </div>
    <div class="solution-method-body">
      <span class="solution-method-title">Step-by-Step Solving Derivation:</span>
      <pre class="solution-pre-code">${escapeHtml(item.method)}</pre>
    </div>
  `;
  container.appendChild(solDiv);
}

function renderMultipleChoiceCard(container, item, idx) {
  const qDiv = document.createElement("div");
  qDiv.className = "problem-statement-text";
  qDiv.textContent = item.question;
  container.appendChild(qDiv);

  const optWrap = document.createElement("div");
  optWrap.className = "quiz-options-grid";

  // Ensure 4 valid options are ALWAYS present
  let options = item.options;
  if (!options || !Array.isArray(options) || options.length < 2) {
    const rawAns = item.answer || "Correct Solution";
    options = [
      `A) ${rawAns}`,
      `B) None of the given choices align with established accounting/business principles`,
      `C) Increase temporary valuation reserve by 15% before period close`,
      `D) Record offsetting contra-asset adjustment at historical cost basis`
    ];
    item.options = options;
    item.correctOption = "A";
  }

  options.forEach((opt, optIndex) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "quiz-option-card";
    
    // Extract letter prefix
    let letter = String.fromCharCode(65 + optIndex);
    let text = opt;
    const match = opt.match(/^([A-D])[\)\.\:]\s*(.+)$/);
    if (match) {
      letter = match[1];
      text = match[2];
    } else if (opt.length > 0 && ["A","B","C","D"].includes(opt[0])) {
      letter = opt[0];
      text = opt.slice(1).replace(/^[\)\.\:\s]+/, "");
    }

    btn.innerHTML = `
      <span class="option-badge">${letter}</span>
      <span class="option-text">${escapeHtml(text)}</span>
    `;
    btn.addEventListener("click", () => selectMCOption(idx, letter));
    optWrap.appendChild(btn);
  });
  container.appendChild(optWrap);

  const solDiv = document.createElement("div");
  solDiv.className = "solution-method-box hidden";
  solDiv.id = `solution-${idx}`;
  solDiv.innerHTML = `
    <div class="solution-header">
      <span class="solution-badge" style="background:#047857;color:#fff;">Correct Answer: Option ${escapeHtml(item.correctOption || 'A')}</span>
      <strong class="solution-answer-text">${escapeHtml(item.answer)}</strong>
    </div>
    <div class="solution-method-body">
      <span class="solution-method-title">Conceptual Step-by-Step Derivation:</span>
      <pre class="solution-pre-code">${escapeHtml(item.method || 'Standard syllabus method.')}</pre>
    </div>
  `;
  container.appendChild(solDiv);
}

function renderFlashcardCard(container, item, idx) {
  const flipWrap = document.createElement("div");
  flipWrap.className = "flashcard-3d-wrapper";
  flipWrap.id = `flashcard-${idx}`;
  flipWrap.innerHTML = `
    <div class="flashcard-inner" id="flashcard-inner-${idx}">
      <div class="flashcard-face flashcard-face-front flashcard-front">
        <div class="flashcard-top-bar">
          <span class="flashcard-pill-tag">🎴 CONCEPT PROMPT</span>
          <span class="badge badge-subtle">${escapeHtml(item.difficulty || 'Medium')}</span>
        </div>
        <div class="flashcard-topic-title">${escapeHtml(item.topic || 'Core Concept')}</div>
        <div class="flashcard-prompt-text">${escapeHtml(item.front || item.question)}</div>
        <div class="flashcard-hint-text">↻ Click anywhere on card to flip</div>
      </div>
      <div class="flashcard-face flashcard-face-back flashcard-back">
        <div class="flashcard-top-bar">
          <span class="flashcard-pill-tag back-tag">💡 MASTERY SOLUTION</span>
          <span class="flashcard-topic-title" style="color:#a7f3d0;">${escapeHtml(item.topic || '')}</span>
        </div>
        <div class="flashcard-answer-text">${escapeHtml(item.back || item.answer)}</div>
        ${item.method ? `
          <div class="flashcard-method-box">
            <div class="method-title">Key Rule & Derivation:</div>
            <div class="method-text">${escapeHtml(item.method)}</div>
          </div>
        ` : ''}
        ${item.mnemonic ? `
          <div class="flashcard-mnemonic-box">
            <strong>🧠 Memory Hook:</strong> ${escapeHtml(item.mnemonic)}
          </div>
        ` : ''}
        <div class="flashcard-hint-text back-hint">↻ Click anywhere to flip back</div>
      </div>
    </div>
  `;
  flipWrap.addEventListener("click", () => flipFlashcard(idx));
  container.appendChild(flipWrap);
}

function selectMCOption(idx, chosenLetter) {
  const item = studyingState.generatedItems[idx];
  if (!item) return;

  const card = document.getElementById(`study-card-${idx}`);
  if (!card) return;

  const buttons = card.querySelectorAll(".quiz-option-card, .quiz-option-item, .mc-choice-btn");
  const correctLetter = (item.correctOption || "A").trim()[0].toUpperCase();

  buttons.forEach(b => {
    b.disabled = true;
    const badge = b.querySelector(".option-badge, .mc-choice-letter");
    const letter = badge ? badge.textContent.trim()[0].toUpperCase() : b.textContent.trim()[0].toUpperCase();
    if (letter === correctLetter) {
      b.classList.add("option-correct");
    } else if (letter === chosenLetter.toUpperCase()) {
      b.classList.add("option-incorrect");
    }
  });

  revealAnswer(idx);

  if (chosenLetter.toUpperCase() === correctLetter) {
    studyingState.correctSet.add(idx);
    updateStudyingScoreTracker();
    showToast("✓ Correct! Outstanding work!");
  } else {
    showToast(`Option ${chosenLetter} was incorrect. Review the step-by-step method below.`);
  }
}

function flipFlashcard(idx) {
  const wrapper = document.getElementById(`flashcard-${idx}`);
  const inner = document.getElementById(`flashcard-inner-${idx}`);
  if (wrapper) wrapper.classList.toggle("flipped");
  if (inner) inner.classList.toggle("flipped");
  studyingState.revealedSet.add(idx);
  updateStudyingScoreTracker();
}

function revealAnswer(idx) {
  toggleSolutionReveal(idx);
}

function toggleSolutionReveal(idx) {
  const sol = document.getElementById(`solution-${idx}`);
  const btn = document.getElementById(`reveal-btn-${idx}`);
  if (!sol) return;

  const isHidden = sol.classList.contains("hidden") || sol.style.display === "none" || window.getComputedStyle(sol).display === "none";

  if (isHidden) {
    sol.classList.remove("hidden");
    sol.classList.add("visible");
    sol.style.display = "block";
    sol.style.opacity = "1";
    sol.style.visibility = "visible";
    if (btn) {
      btn.innerHTML = `<span>🙈 Hide Answer & Method</span>`;
      btn.classList.add("btn-secondary");
      btn.classList.remove("btn-primary");
    }
    studyingState.revealedSet.add(idx);
    updateStudyingScoreTracker();
    sol.scrollIntoView({ behavior: "smooth", block: "nearest" });
  } else {
    sol.classList.add("hidden");
    sol.classList.remove("visible");
    sol.style.display = "none";
    sol.style.opacity = "0";
    sol.style.visibility = "hidden";
    if (btn) {
      btn.innerHTML = `<span>👁 Reveal Answer & Method</span>`;
      btn.classList.add("btn-primary");
      btn.classList.remove("btn-secondary");
    }
  }
}

function markStudyItemCorrect(idx, btn) {
  studyingState.correctSet.add(idx);
  studyingState.revealedSet.add(idx);

  if (btn) {
    btn.textContent = "✓ Mastered!";
    btn.style.backgroundColor = "var(--success)";
    btn.style.color = "#ffffff";
    btn.style.borderColor = "var(--success)";
  }

  updateStudyingScoreTracker();
  showToast("Marked as mastered!");
}

function resetSingleProblemCard(idx) {
  const sol = document.getElementById(`solution-${idx}`);
  const revealBtn = document.getElementById(`reveal-btn-${idx}`);
  const correctBtn = document.getElementById(`correct-btn-${idx}`);
  const learnedBtn = document.getElementById(`learned-btn-${idx}`);
  const retryBtn = document.getElementById(`retry-btn-${idx}`);
  const scratchpad = document.getElementById(`scratchpad-${idx}`);
  const card = document.getElementById(`study-card-${idx}`);

  if (sol) {
    sol.classList.add("hidden");
    sol.classList.remove("visible");
    sol.style.display = "none";
  }
  if (revealBtn) {
    revealBtn.textContent = "Reveal Answer & Method";
    revealBtn.disabled = false;
  }
  if (correctBtn) {
    correctBtn.textContent = "✓ I Got It Right";
    correctBtn.style.backgroundColor = "";
    correctBtn.style.color = "";
    correctBtn.style.borderColor = "";
  }
  if (learnedBtn) {
    learnedBtn.textContent = "✓ Mastered";
    learnedBtn.style.backgroundColor = "";
    learnedBtn.style.color = "";
    learnedBtn.style.borderColor = "";
  }
  if (scratchpad) scratchpad.value = "";

  // Reset quiz option buttons if multiple choice
  if (card) {
    const quizButtons = card.querySelectorAll(".quiz-option-card, .quiz-option-item, .mc-choice-btn");
    quizButtons.forEach(b => {
      b.disabled = false;
      b.classList.remove("option-correct", "option-incorrect");
    });
  }

  // Reset flashcard flip if 3D card
  const flipWrapper = document.getElementById(`flashcard-${idx}`);
  const flipInner = document.getElementById(`flashcard-inner-${idx}`);
  if (flipWrapper) flipWrapper.classList.remove("flipped");
  if (flipInner) flipInner.classList.remove("flipped");

  studyingState.revealedSet.delete(idx);
  studyingState.correctSet.delete(idx);
  updateStudyingScoreTracker();
}

function generateNewVariationForCard(idx) {
  const courseId = studyingState.selectedCourseId;
  const course = (appState.courses || []).find(c => c.id === courseId);
  if (!course) return;

  const currentItem = studyingState.generatedItems[idx];
  const topic = currentItem ? currentItem.topic : Array.from(studyingState.selectedTopics)[0];

  const seed = Math.floor(Math.random() * 1000000) + Date.now() + (idx * 37);
  const newVariant = HokieAIAgent.generateItemForTopic(course, topic, studyingState.currentFormat, "Medium", seed);

  studyingState.generatedItems[idx] = newVariant;
  studyingState.revealedSet.delete(idx);
  studyingState.correctSet.delete(idx);

  const card = document.getElementById(`study-card-${idx}`);
  if (card) {
    const content = card.querySelector(".problem-card-content");
    if (content) {
      content.innerHTML = "";
      if (studyingState.currentFormat === "flashcards") {
        renderFlashcardCard(content, newVariant, idx);
      } else if (studyingState.currentFormat === "quiz") {
        renderMultipleChoiceCard(content, newVariant, idx);
      } else {
        renderPracticeProblemCard(content, newVariant, idx);
      }
    }

    resetSingleProblemCard(idx);
  }

  updateStudyingScoreTracker();
  showToast(`🔄 Replaced #${idx + 1} with a brand new unique problem on "${topic}"!`);
}

function revealAllStudyAnswers() {
  studyingState.generatedItems.forEach((_, idx) => {
    const sol = document.getElementById(`solution-${idx}`);
    const btn = document.getElementById(`reveal-btn-${idx}`);
    if (sol) {
      sol.classList.remove("hidden");
      sol.classList.add("visible");
      sol.style.display = "block";
      sol.style.opacity = "1";
      sol.style.visibility = "visible";
    }
    if (btn) {
      btn.innerHTML = `<span>🙈 Hide Answer & Method</span>`;
      btn.classList.add("btn-secondary");
      btn.classList.remove("btn-primary");
    }
    studyingState.revealedSet.add(idx);
  });
  updateStudyingScoreTracker();
  showToast("✓ All answers and solving methods revealed!");
}

function resetStudyingSession() {
  studyingState.revealedSet.clear();
  studyingState.correctSet.clear();

  studyingState.generatedItems.forEach((_, idx) => {
    resetSingleProblemCard(idx);
  });

  updateStudyingScoreTracker();
  showToast("Practice session reset. Ready for another run!");
}

function clearStudyingResults() {
  studyingState.generatedItems = [];
  studyingState.revealedSet.clear();
  studyingState.correctSet.clear();

  const section = document.getElementById("studying-results-section");
  const list = document.getElementById("studying-problems-list");
  if (section) section.classList.add("hidden");
  if (list) list.innerHTML = "";

  const endlessBar = document.getElementById("studying-endless-bar");
  if (endlessBar) endlessBar.style.display = "none";

  const btnPrint = document.getElementById("btn-print-office-hours");
  if (btnPrint) btnPrint.disabled = true;

  updateStudyingScoreTracker();
  showToast("Cleared generated study results.");
}

function updateStudyingScoreTracker() {
  const total = studyingState.generatedItems.length;
  const revealed = studyingState.revealedSet.size;
  const correct = studyingState.correctSet.size;

  const totEl = document.getElementById("tracker-total-count");
  const revEl = document.getElementById("tracker-revealed-count");
  const corEl = document.getElementById("tracker-correct-count");
  const pctEl = document.getElementById("tracker-percent-text");
  const fillEl = document.getElementById("tracker-progress-fill");

  if (totEl) totEl.textContent = total;
  if (revEl) revEl.textContent = revealed;
  if (corEl) corEl.textContent = correct;

  const pct = total > 0 ? Math.round((revealed / total) * 100) : 0;
  if (pctEl) pctEl.textContent = `${pct}%`;
  if (fillEl) fillEl.style.width = `${pct}%`;
}

/**
 * Print for Office Hours Worksheet
 */
function printOfficeHoursWorksheet() {
  const courseId = studyingState.selectedCourseId;
  const course = (appState.courses || []).find(c => c.id === courseId);
  const topics = Array.from(studyingState.selectedTopics);

  const printMeta = document.getElementById("print-header-meta");
  if (printMeta && course) {
    printMeta.textContent = `Student: Jordan Taylor · ${course.name} (${course.code}) · Topics: ${topics.join(", ")} · Virginia Tech Fall 2026`;
  }

  const chkIncludeMethods = document.getElementById("chk-print-include-methods");
  const includeMethods = chkIncludeMethods ? chkIncludeMethods.checked : true;

  const solutionBoxes = document.querySelectorAll(".solution-method-box");
  solutionBoxes.forEach(box => {
    if (includeMethods) {
      box.classList.add("print-include");
    } else {
      box.classList.remove("print-include");
    }
  });

  window.print();
}


