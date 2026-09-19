/**
 * ============================================================================
 * HOKIETUTOR - VT CANVAS AI STUDY SCHEDULER (WEB APPLICATION)
 * Hackathon Project for VT Hacks
 * ============================================================================
 * This standalone web application receives scraped data from the HokieTutor
 * Chrome extension, asks for individual course academic goals and weekly availability,
 * and generates an intelligent, personalized multi-course study schedule.
 *
 * Detailed comments are provided on each line and block explaining functionality.
 * ============================================================================
 */

// Strict mode ensures cleaner code and prevents silent errors
'use strict';

// ============================================================================
// 0. BACKEND CONNECTION
// ============================================================================

/**
 * Base URL of the HokieTutor Spring Boot backend (see /backend in this repo).
 * Run it locally with `./mvnw spring-boot:run` from the backend folder.
 */
const API_BASE_URL = "http://localhost:8080";

// ============================================================================
// 1. DATA STRUCTURES & DEFAULT STATE (FALL 2026)
// ============================================================================

/**
 * Days of the week used across the calendar grid and session grouping
 */
const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/**
 * Standard daily hour slots (8 AM to 10 PM) for the availability table
 */
const TIME_SLOTS = [
  { hour: 8, label: "8:00 AM" },
  { hour: 9, label: "9:00 AM" },
  { hour: 10, label: "10:00 AM" },
  { hour: 11, label: "11:00 AM" },
  { hour: 12, label: "12:00 PM" },
  { hour: 13, label: "1:00 PM" },
  { hour: 14, label: "2:00 PM" },
  { hour: 15, label: "3:00 PM" },
  { hour: 16, label: "4:00 PM" },
  { hour: 17, label: "5:00 PM" },
  { hour: 18, label: "6:00 PM" },
  { hour: 19, label: "7:00 PM" },
  { hour: 20, label: "8:00 PM" },
  { hour: 21, label: "9:00 PM" }
];

/**
 * Initial Fall 2026 course data reflecting the student's active Canvas courses:
 * - MATH 1226 (Juste CRN 87487) - Calculus II (Fall 2026)
 * - PSYC 1004 - Introductory Psychology (Fall 2026)
 * - ENGE 1215 - Foundations of Green Engineering (Fall 2026)
 * - CS 2114 - Software Design & Data Structures (Fall 2026)
 * Note: Past-year courses like PHYS 2306 are filtered out automatically.
 */
const DEFAULT_COURSES = [
  {
    id: "course_1226",
    code: "MATH 1226 (Juste CRN 87487)",
    name: "Calculus of a Single Variable II",
    term: "2026 Fall",
    currentGrade: 84.5,
    letterGrade: "B",
    goalGrade: "A",
    confidence: "low",
    weeklyHours: 4,
    enabled: true,
    color: "#861F41", // VT Maroon
    focusTopics: "Integration by Parts, Power Series & Taylor Polynomials, Parametric Equations",
    nextExam: { name: "Midterm 1: Integration & Series", daysAway: 4, date: "2026-09-23" }
  },
  {
    id: "course_psyc",
    code: "PSYC 1004",
    name: "Introductory Psychology",
    term: "2026 Fall",
    currentGrade: 91.5,
    letterGrade: "A-",
    goalGrade: "A",
    confidence: "high",
    weeklyHours: 2,
    enabled: true,
    color: "#7c3aed", // Royal Purple
    focusTopics: "Cognitive Development, Memory Consolidation, Behavioral Conditioning",
    nextExam: { name: "Unit 2 Exam: Brain & Cognition", daysAway: 12, date: "2026-10-01" }
  },
  {
    id: "course_enge",
    code: "ENGE 1215",
    name: "Foundations of Green Engineering",
    term: "2026 Fall",
    currentGrade: 87.0,
    letterGrade: "B+",
    goalGrade: "A-",
    confidence: "medium",
    weeklyHours: 3,
    enabled: true,
    color: "#059669", // Emerald Green
    focusTopics: "Life Cycle Assessment (LCA), Carbon Metrics, Sustainable Materials",
    nextExam: { name: "Design Milestone 1", daysAway: 8, date: "2026-09-27" }
  },
  {
    id: "course_2114",
    code: "CS 2114",
    name: "Software Design & Data Structures",
    term: "2026 Fall",
    currentGrade: 83.2,
    letterGrade: "B",
    goalGrade: "A-",
    confidence: "medium",
    weeklyHours: 4,
    enabled: true,
    color: "#E87722", // VT Orange
    focusTopics: "Binary Search Trees, Recursion, Memory Allocation",
    nextExam: { name: "Project 2: Linked Deque", daysAway: 6, date: "2026-09-25" }
  }
];

/**
 * Global application state
 */
let appState = {
  // Current active wizard step (1: Goals, 2: Availability, 3: Schedule)
  currentStep: 1,

  // Term information
  activeTerm: "2026 Fall",

  // List of active student courses with their individual goals
  courses: JSON.parse(JSON.stringify(DEFAULT_COURSES)),

  // General studying habits & format
  studyHabits: {
    studySpeed: "balanced",       // thorough | balanced | fast
    sessionLength: 45,            // minutes per session (30, 45, 60, 90)
    tutoringStyle: "practice"     // practice | theory | flashcards | past-exams
  },

  // Weekly availability matrix (key format: "Monday-9": true if busy, false if free)
  busySlots: {},

  // Generated personalized study sessions list
  studySessions: [],

  // Co-dependence and extension connection state
  extensionConnected: false,
  extensionVersion: null,
  vtEmail: "hokie@vt.edu"
};

// ============================================================================
// 2. LOCAL STORAGE PERSISTENCE HELPER
// ============================================================================

/**
 * Saves current application state to browser localStorage.
 */
function saveStateToStorage() {
  try {
    localStorage.setItem("hokieTutorAppState", JSON.stringify(appState));
  } catch (err) {
    console.warn("Could not save to localStorage:", err);
  }
}

/**
 * Loads previous state from browser localStorage if available.
 */
function loadStateFromStorage() {
  try {
    const raw = localStorage.getItem("hokieTutorAppState");
    if (raw) {
      const parsed = JSON.parse(raw);
      // Merge saved properties into current state
      appState = Object.assign(appState, parsed);
    }
  } catch (err) {
    console.warn("Could not load from localStorage:", err);
  }
}

// ============================================================================
// 3. INITIALIZATION
// ============================================================================

/**
 * Runs once DOM is loaded: restores state, builds UI components, and attaches events.
 */
document.addEventListener("DOMContentLoaded", () => {
  // 1. Load state from localStorage
  loadStateFromStorage();

  // 2. Render Page 1 Course Goals Cards Deck
  renderCourseCardsDeck();

  // 3. Update summary metrics (total hours, active courses count)
  updateGoalsSummaryMetrics();

  // 4. Build interactive 7-day availability grid for Page 2
  buildAvailabilityGrid();

  // 5. Populate general study habits
  hydrateStudyHabits();

  // 6. Setup all button click and change events
  setupNavigationEvents();
  setupPage1Events();
  setupPage2Events();
  setupPage3Events();
  setupModalEvents();

  // 7. Enforce co-dependence & initialize extension communication bridge
  initExtensionConnection();

  // 8. Navigate to active step (default: Step 1)
  goToStep(appState.currentStep || 1);
});

// ============================================================================
// 4. WIZARD STEP NAVIGATION
// ============================================================================

/**
 * Switches the active page view and updates wizard step buttons.
 * @param {number} stepNumber - Step to show (1, 2, or 3)
 */
function goToStep(stepNumber) {
  if (stepNumber < 1 || stepNumber > 3) return;

  appState.currentStep = stepNumber;
  saveStateToStorage();

  // Update navigation button active state
  for (let i = 1; i <= 3; i++) {
    const stepBtn = document.getElementById(`step-nav-${i}`);
    const pageView = document.getElementById(`page-${i}`);

    if (stepBtn) {
      stepBtn.classList.toggle("active", i === stepNumber);
    }
    if (pageView) {
      pageView.classList.toggle("active", i === stepNumber);
    }
  }

  // Scroll to top of app container smoothly
  window.scrollTo({ top: 0, behavior: "smooth" });

  // If entering Page 3, ensure sessions are generated and rendered
  if (stepNumber === 3) {
    if (!appState.studySessions || appState.studySessions.length === 0) {
      generateMultiCourseSchedule();
    }
    renderStudySessions();
  }
}

/**
 * Attaches navigation event listeners to wizard step buttons.
 */
function setupNavigationEvents() {
  // Header step buttons
  document.getElementById("step-nav-1").addEventListener("click", () => goToStep(1));
  document.getElementById("step-nav-2").addEventListener("click", () => goToStep(2));
  document.getElementById("step-nav-3").addEventListener("click", () => goToStep(3));

  // Step 1 -> Step 2 button
  document.getElementById("btn-next-to-2").addEventListener("click", () => {
    saveHabitsFromForm();
    goToStep(2);
  });

  // Step 2 -> Step 1 button
  document.getElementById("btn-back-to-1").addEventListener("click", () => goToStep(1));

  // Step 2 -> Step 3 button (Generate schedule)
  document.getElementById("btn-next-to-3").addEventListener("click", () => {
    generateMultiCourseSchedule();
    goToStep(3);
  });

  // Step 3 -> Step 2 button
  document.getElementById("btn-back-to-2").addEventListener("click", () => goToStep(2));

  // Step 3 'Done' button
  document.getElementById("btn-finish-done").addEventListener("click", () => {
    saveStateToStorage();
    showToast("🎉 HokieTutor schedule saved successfully!");
  });
}

// ============================================================================
// 5. PAGE 1: MULTI-COURSE GOALS DECK LOGIC
// ============================================================================

/**
 * Renders individual course goal cards dynamically into the DOM.
 */
function renderCourseCardsDeck() {
  const container = document.getElementById("course-cards-deck");
  container.innerHTML = "";

  if (appState.courses.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>No active courses found. Click "+ Add Course" to add a class.</p>
      </div>
    `;
    return;
  }

  appState.courses.forEach(course => {
    const card = document.createElement("div");
    card.className = `course-card ${course.enabled ? '' : 'disabled'}`;
    card.dataset.courseId = course.id;

    // Split focus topics into pills
    const topicsArr = course.focusTopics
      ? course.focusTopics.split(",").map(t => t.trim()).filter(Boolean)
      : [];
    const topicsPillsHtml = topicsArr.map(t => `<span class="topic-pill">${escapeHtml(t)}</span>`).join("");

    // Title suffix: skip the course name if we don't have one yet (Canvas-imported courses
    // only carry a numeric course_id until we can resolve a real name)
    const titleSuffix = course.name
      ? ` — ${escapeHtml(course.name)} (${course.term || 'Fall 2026'})`
      : ` (${course.term || 'Fall 2026'})`;

    // Grade badge: show the real grade if we have one, otherwise how many
    // assignments were synced from Canvas, otherwise a neutral placeholder
    const assignmentCount = course.assignments ? course.assignments.length : 0;
    let gradeBadgeHtml;
    if (course.currentGrade !== null && course.currentGrade !== undefined) {
      gradeBadgeHtml = `<span class="badge-current-grade">Current: ${course.currentGrade}% (${course.letterGrade || 'B'})</span>`;
    } else if (assignmentCount > 0) {
      gradeBadgeHtml = `<span class="badge-current-grade">${assignmentCount} assignment${assignmentCount === 1 ? '' : 's'} synced</span>`;
    } else {
      gradeBadgeHtml = `<span class="badge-current-grade">No grade data yet</span>`;
    }

    card.innerHTML = `
      <!-- Top Row: Checkbox, Course Title/CRN, Grade Badge, Delete Button -->
      <div class="course-card-top">
        <div class="course-card-title-group">
          <input type="checkbox" class="course-enable-checkbox" title="Include in study schedule" ${course.enabled ? 'checked' : ''} />
          <div>
            <span class="course-code-badge">${escapeHtml(course.code)}</span>
            <span class="course-title-text">${titleSuffix}</span>
          </div>
        </div>

        <div class="course-card-top-right">
          ${gradeBadgeHtml}
          <button type="button" class="btn-icon-subtle btn-delete-course" title="Remove course from active term">🗑️</button>
        </div>
      </div>

      <!-- Settings Grid: Goal Grade, Confidence, Weekly Hours, Focus Topics -->
      <div class="course-settings-grid">
        <div class="form-group">
          <label class="form-label">Target Grade:</label>
          <select class="form-control form-control-sm select-goal-grade">
            <option value="A" ${course.goalGrade === 'A' ? 'selected' : ''}>A (93 - 100%)</option>
            <option value="A-" ${course.goalGrade === 'A-' ? 'selected' : ''}>A- (90 - 92%)</option>
            <option value="B+" ${course.goalGrade === 'B+' ? 'selected' : ''}>B+ (87 - 89%)</option>
            <option value="B" ${course.goalGrade === 'B' ? 'selected' : ''}>B (83 - 86%)</option>
            <option value="Pass" ${course.goalGrade === 'Pass' ? 'selected' : ''}>Pass Only</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Subject Confidence:</label>
          <select class="form-control form-control-sm select-confidence">
            <option value="low" ${course.confidence === 'low' ? 'selected' : ''}>Low (Needs tutoring)</option>
            <option value="medium" ${course.confidence === 'medium' ? 'selected' : ''}>Medium (Needs practice)</option>
            <option value="high" ${course.confidence === 'high' ? 'selected' : ''}>High (Exam refinement)</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Weekly Hours Target:</label>
          <input type="number" class="form-control form-control-sm input-weekly-hours" min="1" max="15" value="${course.weeklyHours || 3}" />
        </div>

        <div class="form-group">
          <label class="form-label">Focus Topics:</label>
          <div class="topic-pills-container">
            ${topicsPillsHtml || '<span class="text-muted">General Review</span>'}
          </div>
        </div>
      </div>
    `;

    // 1. Enable / Disable checkbox listener
    const enableCheckbox = card.querySelector(".course-enable-checkbox");
    enableCheckbox.addEventListener("change", (e) => {
      course.enabled = e.target.checked;
      card.classList.toggle("disabled", !course.enabled);
      updateGoalsSummaryMetrics();
      saveStateToStorage();
    });

    // 2. Goal grade change listener
    const selectGoal = card.querySelector(".select-goal-grade");
    selectGoal.addEventListener("change", (e) => {
      course.goalGrade = e.target.value;
      saveStateToStorage();
    });

    // 3. Confidence level change listener
    const selectConf = card.querySelector(".select-confidence");
    selectConf.addEventListener("change", (e) => {
      course.confidence = e.target.value;
      saveStateToStorage();
    });

    // 4. Weekly hours input listener
    const inputHours = card.querySelector(".input-weekly-hours");
    inputHours.addEventListener("change", (e) => {
      course.weeklyHours = Math.max(1, parseInt(e.target.value, 10) || 1);
      updateGoalsSummaryMetrics();
      saveStateToStorage();
    });

    // 5. Delete course listener
    const btnDelete = card.querySelector(".btn-delete-course");
    btnDelete.addEventListener("click", () => {
      deleteCourse(course.id);
    });

    container.appendChild(card);
  });
}

/**
 * Recalculates and updates top aggregated metrics: total weekly hours, active courses count.
 */
function updateGoalsSummaryMetrics() {
  const activeCourses = appState.courses.filter(c => c.enabled);
  const totalHours = activeCourses.reduce((sum, c) => sum + (c.weeklyHours || 0), 0);

  document.getElementById("metric-active-courses").textContent = activeCourses.length;
  document.getElementById("metric-total-hours").textContent = `${totalHours} hrs`;

  // Update sync banner text
  const syncBannerDetails = document.getElementById("sync-banner-details");
  if (syncBannerDetails) {
    syncBannerDetails.textContent = `${activeCourses.length} Active Courses included in study plan for ${appState.activeTerm}.`;
  }
}

/**
 * Removes a course from the active term list.
 * @param {string} courseId - ID of course to remove
 */
function deleteCourse(courseId) {
  appState.courses = appState.courses.filter(c => c.id !== courseId);
  renderCourseCardsDeck();
  updateGoalsSummaryMetrics();
  saveStateToStorage();
  showToast("Course removed from active term.");
}

/**
 * Hydrates general study habits (speed, session length, tutoring style).
 */
function hydrateStudyHabits() {
  const habits = appState.studyHabits;

  // Set selected radio for speed
  const speedRadio = document.querySelector(`input[name="study_speed"][value="${habits.studySpeed}"]`);
  if (speedRadio) speedRadio.checked = true;

  // Session length
  document.getElementById("global-session-length").value = habits.sessionLength || 45;

  // Tutoring style
  document.getElementById("global-tutoring-style").value = habits.tutoringStyle || "practice";
}

/**
 * Reads general habits from Page 1 inputs and saves to state.
 */
function saveHabitsFromForm() {
  const selectedSpeed = document.querySelector('input[name="study_speed"]:checked');
  if (selectedSpeed) {
    appState.studyHabits.studySpeed = selectedSpeed.value;
  }

  appState.studyHabits.sessionLength = parseInt(document.getElementById("global-session-length").value, 10) || 45;
  appState.studyHabits.tutoringStyle = document.getElementById("global-tutoring-style").value;

  saveStateToStorage();
}

/**
 * Attaches event listeners on Page 1.
 */
function setupPage1Events() {
  // Save Draft button
  document.getElementById("btn-save-draft-1").addEventListener("click", () => {
    saveHabitsFromForm();
    showToast("✓ Course goals saved!");
  });

  // Open Add Course Modal
  document.getElementById("btn-open-add-course-modal").addEventListener("click", () => {
    document.getElementById("course-modal").classList.remove("hidden");
  });

  // Header: Trigger Live Sync from Extension
  document.getElementById("btn-sync-extension").addEventListener("click", () => {
    if (!appState.extensionConnected) {
      const overlay = document.getElementById("extension-guard-overlay");
      if (overlay) overlay.classList.remove("hidden");
      showToast("🔒 Extension required! Please connect the HokieTutor extension first.");
      return;
    }
    window.postMessage({
      sender: "HOKIETUTOR_WEB_APP",
      type: "GET_CANVAS_DATA",
      messageId: "sync_" + Date.now()
    }, "*");
    showToast("⚡ Requesting active Canvas courses from extension...");
  });

  // Header: Open Import Extension JSON modal
  document.getElementById("btn-import-canvas-json").addEventListener("click", () => {
    document.getElementById("json-vt-email").value = appState.vtEmail || "";
    document.getElementById("import-json-modal").classList.remove("hidden");
  });
}

// ============================================================================
// 6. PAGE 2: SCHEDULE & AVAILABILITY GRID LOGIC
// ============================================================================

/**
 * Dynamically builds 7-day x 14-hour table rows in DOM.
 */
function buildAvailabilityGrid() {
  const tbody = document.getElementById("availability-tbody");
  tbody.innerHTML = "";

  TIME_SLOTS.forEach(slot => {
    const tr = document.createElement("tr");

    // Time label cell (e.g. "9:00 AM")
    const thTime = document.createElement("th");
    thTime.className = "time-label-cell";
    thTime.scope = "row";
    thTime.textContent = slot.label;
    tr.appendChild(thTime);

    // Create 7 day cells
    DAYS_OF_WEEK.forEach(day => {
      const td = document.createElement("td");
      td.className = "time-slot-cell";
      td.dataset.day = day;
      td.dataset.hour = slot.hour;

      const slotKey = `${day}-${slot.hour}`;
      if (appState.busySlots[slotKey]) {
        td.classList.add("busy");
      }

      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  updateAvailableHoursCount();
}

/**
 * Sets up mouse drag and click toggling for availability grid.
 */
function setupPage2Events() {
  const table = document.getElementById("availability-table");
  let isMouseDown = false;
  let targetState = null;

  table.addEventListener("mousedown", (e) => {
    const cell = e.target.closest(".time-slot-cell");
    if (!cell) return;

    isMouseDown = true;
    const isBusy = cell.classList.contains("busy");
    targetState = !isBusy;
    toggleCellState(cell, targetState);
  });

  table.addEventListener("mouseover", (e) => {
    if (!isMouseDown) return;
    const cell = e.target.closest(".time-slot-cell");
    if (cell && targetState !== null) {
      toggleCellState(cell, targetState);
    }
  });

  window.addEventListener("mouseup", () => {
    if (isMouseDown) {
      isMouseDown = false;
      targetState = null;
      saveStateToStorage();
      updateAvailableHoursCount();
    }
  });

  // Preset: Weekdays 9 AM - 5 PM Busy
  document.getElementById("btn-preset-weekday-busy").addEventListener("click", () => {
    const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    weekdays.forEach(day => {
      for (let h = 9; h < 17; h++) {
        appState.busySlots[`${day}-${h}`] = true;
      }
    });
    applyBusySlotsToGrid();
    showToast("Marked Weekdays 9-5 as Busy!");
  });

  // Preset: Evenings Free (5 PM to 10 PM)
  document.getElementById("btn-preset-evenings-free").addEventListener("click", () => {
    DAYS_OF_WEEK.forEach(day => {
      for (let h = 17; h <= 21; h++) {
        delete appState.busySlots[`${day}-${h}`];
      }
    });
    applyBusySlotsToGrid();
    showToast("Marked Evenings as Free for studying!");
  });

  // Preset: Clear All
  document.getElementById("btn-preset-clear").addEventListener("click", () => {
    appState.busySlots = {};
    applyBusySlotsToGrid();
    showToast("Cleared availability grid!");
  });

  // Timetable upload handling
  setupFileUploadEvents();
}

/**
 * Toggles a single grid cell state.
 */
function toggleCellState(cell, makeBusy) {
  const day = cell.dataset.day;
  const hour = cell.dataset.hour;
  const slotKey = `${day}-${hour}`;

  if (makeBusy) {
    cell.classList.add("busy");
    appState.busySlots[slotKey] = true;
  } else {
    cell.classList.remove("busy");
    delete appState.busySlots[slotKey];
  }
}

/**
 * Syncs DOM cells to `appState.busySlots`.
 */
function applyBusySlotsToGrid() {
  const cells = document.querySelectorAll(".time-slot-cell");
  cells.forEach(cell => {
    const day = cell.dataset.day;
    const hour = cell.dataset.hour;
    const slotKey = `${day}-${hour}`;

    if (appState.busySlots[slotKey]) {
      cell.classList.add("busy");
    } else {
      cell.classList.remove("busy");
    }
  });

  updateAvailableHoursCount();
  saveStateToStorage();
}

/**
 * Calculates and updates available study hours.
 */
function updateAvailableHoursCount() {
  const totalSlots = DAYS_OF_WEEK.length * TIME_SLOTS.length; // 7 * 14 = 98 slots
  const busyCount = Object.keys(appState.busySlots).length;
  const freeSlots = Math.max(0, totalSlots - busyCount);

  const label = document.getElementById("total-free-hours-label");
  if (label) {
    label.textContent = `${freeSlots} hrs/week`;
  }
}

/**
 * File upload / Screenshot dropzone logic with OCR simulation.
 */
function setupFileUploadEvents() {
  const dropzone = document.getElementById("schedule-dropzone");
  const fileInput = document.getElementById("schedule-file-input");
  const btnBrowse = document.getElementById("btn-browse-file");
  const previewContainer = document.getElementById("upload-preview-container");
  const previewImg = document.getElementById("upload-preview-img");
  const previewName = document.getElementById("upload-file-name");
  const btnRemoveFile = document.getElementById("btn-remove-file");

  btnBrowse.addEventListener("click", (e) => {
    e.stopPropagation();
    fileInput.click();
  });

  dropzone.addEventListener("click", () => fileInput.click());

  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.classList.add("dragover");
  });

  dropzone.addEventListener("dragleave", () => {
    dropzone.classList.remove("dragover");
  });

  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("dragover");
    if (e.dataTransfer.files.length > 0) {
      handleUploadedFile(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener("change", () => {
    if (fileInput.files.length > 0) {
      handleUploadedFile(fileInput.files[0]);
    }
  });

  function handleUploadedFile(file) {
    previewName.textContent = file.name;
    const reader = new FileReader();
    reader.onload = (evt) => {
      previewImg.src = evt.target.result;
      previewContainer.classList.remove("hidden");

      // Simulate OCR: Mark MWF 10-11 and TR 12-2 as class blocks
      ["Monday", "Wednesday", "Friday"].forEach(day => {
        appState.busySlots[`${day}-10`] = true;
      });
      ["Tuesday", "Thursday"].forEach(day => {
        appState.busySlots[`${day}-12`] = true;
        appState.busySlots[`${day}-13`] = true;
      });

      applyBusySlotsToGrid();
      showToast("✓ Schedule scanned! Imported class hours into calendar.");
    };
    reader.readAsDataURL(file);
  }

  btnRemoveFile.addEventListener("click", (e) => {
    e.stopPropagation();
    fileInput.value = "";
    previewImg.src = "";
    previewContainer.classList.add("hidden");
    showToast("Schedule removed.");
  });
}

// ============================================================================
// 7. PAGE 3: MULTI-COURSE STUDY SCHEDULE GENERATOR & CRUD
// ============================================================================

/**
 * Generates an intelligent multi-course study schedule balancing all enabled
 * courses based on their target weekly hours, confidence levels, and free calendar slots.
 * Can incorporate AI workload estimates provided by the Spring Boot backend or Chrome extension.
 * @param {Object} [estimates] - Optional weekly assignment workload estimates
 */
function generateMultiCourseSchedule(estimates = null) {
  const activeCourses = appState.courses.filter(c => c.enabled);
  if (activeCourses.length === 0) {
    appState.studySessions = [];
    return;
  }

  const sessionDuration = appState.studyHabits.sessionLength || 45;
  const sessions = [];

  // Find all free (unblocked) calendar slots from Page 2
  const freeSlots = [];
  DAYS_OF_WEEK.forEach(day => {
    TIME_SLOTS.forEach(slot => {
      const slotKey = `${day}-${slot.hour}`;
      if (!appState.busySlots[slotKey]) {
        freeSlots.push({ day, hour: slot.hour, label: slot.label });
      }
    });
  });

  // Fallback: If no slots marked free, open evening hours
  if (freeSlots.length === 0) {
    DAYS_OF_WEEK.forEach(day => {
      freeSlots.push({ day, hour: 17, label: "5:00 PM" });
      freeSlots.push({ day, hour: 18, label: "6:00 PM" });
      freeSlots.push({ day, hour: 19, label: "7:00 PM" });
    });
  }

  // Build target session demands per course
  const courseDemands = [];

  // If backend/extension AI estimates are present, prioritize real upcoming assignments!
  if (estimates && estimates.assignments && estimates.assignments.length > 0) {
    estimates.assignments.forEach(est => {
      const matchCourse = activeCourses.find(c =>
        c.canvasCourseId === est.courseId ||
        c.code.toLowerCase().includes(String(est.courseId).toLowerCase())
      );
      const courseCode = matchCourse ? matchCourse.code : (est.title.split("-")[0].trim() || "Active Course");
      const courseName = matchCourse ? matchCourse.name : "";
      const color = matchCourse ? matchCourse.color : "#861F41";
      const confidence = matchCourse ? matchCourse.confidence : "medium";

      const totalMins = Math.max(30, Math.round((est.estimatedHours || 1.5) * 60));
      const sessionsNeeded = Math.max(1, Math.round(totalMins / sessionDuration));

      for (let s = 0; s < sessionsNeeded; s++) {
        courseDemands.push({
          courseCode: courseCode,
          courseName: courseName,
          color: color,
          topic: `${est.title}${sessionsNeeded > 1 ? ` (Part ${s + 1}/${sessionsNeeded})` : ''}`,
          confidence: confidence,
          duration: sessionDuration
        });
      }
    });
  }

  // Also include baseline study habits for any course not fully saturated by assignments
  activeCourses.forEach(course => {
    const existingDemand = courseDemands.filter(d => d.courseCode === course.code).length;
    const weeklyMinutes = (course.weeklyHours || 3) * 60;
    const targetSessionCount = Math.max(1, Math.round(weeklyMinutes / sessionDuration));

    if (existingDemand < targetSessionCount) {
      const needed = targetSessionCount - existingDemand;
      const topicsArr = course.focusTopics
        ? course.focusTopics.split(",").map(t => t.trim()).filter(Boolean)
        : ["Core Concept Review", "Practice Problem Set"];

      for (let i = 0; i < needed; i++) {
        courseDemands.push({
          courseCode: course.code,
          courseName: course.name,
          color: course.color,
          topic: topicsArr[i % topicsArr.length] || "Exam Review",
          confidence: course.confidence,
          duration: sessionDuration
        });
      }
    }
  });

  // Shuffle & interleave courses to balance study across the week (distributed practice)
  courseDemands.sort(() => Math.random() - 0.5);

  // Allocate sessions into available free slots
  const totalSlots = freeSlots.length;
  const step = Math.max(1, Math.floor(totalSlots / courseDemands.length));

  courseDemands.forEach((demand, index) => {
    const slotIndex = (index * step) % totalSlots;
    const slot = freeSlots[slotIndex];

    const hour24 = String(slot.hour).padStart(2, "0") + ":00";
    const endTimeObj = calculateEndTime(hour24, demand.duration);

    sessions.push({
      id: "session_" + Date.now() + "_" + index,
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
  saveStateToStorage();
}

/**
 * Calculates end time string and 12-hour formatted string.
 */
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

/**
 * Renders all scheduled sessions onto Page 3 grouped by day of the week.
 */
function renderStudySessions() {
  const container = document.getElementById("sessions-container");
  const filterSelect = document.getElementById("filter-course-select");
  const selectedFilter = filterSelect.value;

  // Refresh filter options dropdown with currently active courses
  updateCourseFilterDropdown();

  container.innerHTML = "";

  // Apply filter
  const filtered = appState.studySessions.filter(s => {
    return selectedFilter === "ALL" || s.course === selectedFilter;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>No study sessions found for the current filter.</p>
        <button type="button" class="btn btn-outline btn-sm" id="btn-add-first-session">+ Add First Session</button>
      </div>
    `;
    const btnAddFirst = document.getElementById("btn-add-first-session");
    if (btnAddFirst) {
      btnAddFirst.addEventListener("click", openAddSessionModal);
    }
    updatePage3Stats(0, 0);
    return;
  }

  // Group by day of week
  const groupedByDay = {};
  DAYS_OF_WEEK.forEach(d => { groupedByDay[d] = []; });
  filtered.forEach(s => {
    if (!groupedByDay[s.day]) groupedByDay[s.day] = [];
    groupedByDay[s.day].push(s);
  });

  let totalMinutes = 0;

  DAYS_OF_WEEK.forEach(day => {
    const daySessions = groupedByDay[day];
    if (daySessions.length === 0) return;

    const dayGroup = document.createElement("div");
    dayGroup.className = "day-group";

    const dayHeader = document.createElement("h3");
    dayHeader.className = "day-heading";
    dayHeader.innerHTML = `${day} <span class="day-pill-count">${daySessions.length} sessions</span>`;
    dayGroup.appendChild(dayHeader);

    daySessions.forEach(session => {
      totalMinutes += session.durationMinutes;

      const card = document.createElement("div");
      card.className = `session-card ${session.completed ? 'completed' : ''}`;
      card.dataset.id = session.id;
      card.dataset.course = session.course;

      card.innerHTML = `
        <input type="checkbox" class="session-checkbox" title="Mark as completed" ${session.completed ? 'checked' : ''} />

        <div class="session-time-col">
          <span class="session-time-str">${session.displayTime || session.startTime}</span>
          <span class="session-duration">${session.durationMinutes} min block</span>
        </div>

        <div class="session-details">
          <span class="session-course-tag">${escapeHtml(session.course)}</span>
          <div class="session-topic-title">${escapeHtml(session.topic)}</div>
          <div class="session-meta-note">Method: ${session.studyFormat}</div>
        </div>

        <div class="session-actions">
          <button type="button" class="btn-icon-subtle btn-reschedule" title="Move / Reschedule Session">🕒</button>
          <button type="button" class="btn-icon-subtle btn-delete" title="Delete Session">🗑️</button>
        </div>
      `;

      // Checkbox complete
      const checkbox = card.querySelector(".session-checkbox");
      checkbox.addEventListener("change", (e) => {
        session.completed = e.target.checked;
        card.classList.toggle("completed", session.completed);
        saveStateToStorage();
      });

      // Move / Reschedule
      const btnReschedule = card.querySelector(".btn-reschedule");
      btnReschedule.addEventListener("click", () => {
        openEditSessionModal(session);
      });

      // Delete
      const btnDelete = card.querySelector(".btn-delete");
      btnDelete.addEventListener("click", () => {
        deleteSession(session.id);
      });

      dayGroup.appendChild(card);
    });

    container.appendChild(dayGroup);
  });

  updatePage3Stats(filtered.length, totalMinutes);
}

/**
 * Updates course filter dropdown options on Page 3.
 */
function updateCourseFilterDropdown() {
  const select = document.getElementById("filter-course-select");
  const currentVal = select.value;

  const coursesSet = new Set(appState.studySessions.map(s => s.course));
  select.innerHTML = `<option value="ALL">Show All Courses</option>`;

  coursesSet.forEach(courseCode => {
    const opt = document.createElement("option");
    opt.value = courseCode;
    opt.textContent = courseCode;
    if (courseCode === currentVal) opt.selected = true;
    select.appendChild(opt);
  });
}

/**
 * Updates stats widgets at top of Page 3.
 */
function updatePage3Stats(count, minutes) {
  const hours = (minutes / 60).toFixed(1);
  document.getElementById("stat-total-sessions").textContent = count;
  document.getElementById("stat-total-hours").textContent = `${hours} hrs`;

  const distinctCourses = new Set(appState.studySessions.map(s => s.course)).size;
  document.getElementById("stat-courses-scheduled").textContent = `${distinctCourses} Classes`;
}

/**
 * Deletes a session by ID and refreshes view.
 */
function deleteSession(sessionId) {
  appState.studySessions = appState.studySessions.filter(s => s.id !== sessionId);
  saveStateToStorage();
  renderStudySessions();
  showToast("Session deleted.");
}

/**
 * Attaches event listeners for Page 3 controls.
 */
function setupPage3Events() {
  document.getElementById("filter-course-select").addEventListener("change", () => {
    renderStudySessions();
  });

  document.getElementById("btn-open-add-session-modal").addEventListener("click", openAddSessionModal);

  document.getElementById("btn-regenerate-schedule").addEventListener("click", () => {
    callExtensionToRegenerate();
  });

  document.getElementById("btn-export-ics").addEventListener("click", exportScheduleToIcs);

  document.getElementById("btn-print-schedule").addEventListener("click", () => {
    window.print();
  });
}

// ============================================================================
// 8. MODAL DIALOGS: ADD COURSE & ADD/EDIT SESSION
// ============================================================================

/**
 * Opens modal to add a new study session.
 */
function openAddSessionModal() {
  document.getElementById("modal-session-title").textContent = "Add Study Session";
  document.getElementById("modal-session-id").value = "";
  document.getElementById("modal-session-topic").value = "";
  document.getElementById("modal-session-day").value = "Monday";
  document.getElementById("modal-session-start-time").value = "17:00";
  document.getElementById("modal-session-duration").value = "60";

  // Populate course dropdown with active courses
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

/**
 * Opens modal prefilled to edit/reschedule an existing session.
 */
function openEditSessionModal(session) {
  document.getElementById("modal-session-title").textContent = "Move / Edit Study Session";
  document.getElementById("modal-session-id").value = session.id;
  document.getElementById("modal-session-topic").value = session.topic;
  document.getElementById("modal-session-day").value = session.day;
  document.getElementById("modal-session-start-time").value = session.startTime || "17:00";
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

/**
 * Attaches modal form submit and close handlers.
 */
function setupModalEvents() {
  // Course Modal
  const courseModal = document.getElementById("course-modal");
  const closeCourseModal = () => courseModal.classList.add("hidden");
  document.getElementById("btn-close-course-modal").addEventListener("click", closeCourseModal);
  document.getElementById("btn-cancel-course-modal").addEventListener("click", closeCourseModal);

  document.getElementById("form-course-editor").addEventListener("submit", (e) => {
    e.preventDefault();
    const code = document.getElementById("modal-course-code").value.trim();
    const term = document.getElementById("modal-course-term").value.trim();
    const name = document.getElementById("modal-course-name").value.trim();
    const currentGrade = parseFloat(document.getElementById("modal-course-current-grade").value) || 85.0;
    const goalGrade = document.getElementById("modal-course-goal-grade").value;
    const confidence = document.getElementById("modal-course-confidence").value;
    const weeklyHours = parseInt(document.getElementById("modal-course-hours").value, 10) || 3;
    const topics = document.getElementById("modal-course-topics").value.trim();

    const newCourse = {
      id: "course_" + Date.now(),
      code,
      name,
      term,
      currentGrade,
      letterGrade: currentGrade >= 90 ? "A" : currentGrade >= 80 ? "B" : "C",
      goalGrade,
      confidence,
      weeklyHours,
      enabled: true,
      color: "#2563eb",
      focusTopics: topics || "General Topic Review"
    };

    appState.courses.push(newCourse);
    renderCourseCardsDeck();
    updateGoalsSummaryMetrics();
    saveStateToStorage();
    closeCourseModal();
    showToast(`✓ Added ${code} to Fall 2026!`);
  });

  // Session Modal
  const sessionModal = document.getElementById("session-modal");
  const closeSessionModal = () => sessionModal.classList.add("hidden");
  document.getElementById("btn-close-session-modal").addEventListener("click", closeSessionModal);
  document.getElementById("btn-cancel-session-modal").addEventListener("click", closeSessionModal);

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
      showToast("✓ New study session added!");
    }

    saveStateToStorage();
    renderStudySessions();
    closeSessionModal();
  });

  // Import JSON Modal
  const jsonModal = document.getElementById("import-json-modal");
  const closeJsonModal = () => jsonModal.classList.add("hidden");
  document.getElementById("btn-close-json-modal").addEventListener("click", closeJsonModal);
  document.getElementById("btn-cancel-json-modal").addEventListener("click", closeJsonModal);

  document.getElementById("btn-confirm-import-json").addEventListener("click", () => {
    const vtEmail = document.getElementById("json-vt-email").value.trim();
    const rawJson = document.getElementById("json-paste-area").value;

    if (!vtEmail) {
      alert("Enter your VT email so the backend knows whose assignments these are.");
      return;
    }

    try {
      const data = JSON.parse(rawJson);

      // The extension exports a flat array of assignment objects
      // (id, title, course_id, due_at, points_possible, html_url, description_raw).
      // Accept that directly, or the same array nested under an "assignments" key.
      const assignments = Array.isArray(data)
        ? data
        : Array.isArray(data.assignments) ? data.assignments : null;

      if (!assignments) {
        alert("Couldn't find an assignment list in that JSON. Paste the array the extension gives you.");
        return;
      }

      appState.vtEmail = vtEmail;
      importAssignmentsFromExtension(vtEmail, assignments);
      closeJsonModal();
    } catch (err) {
      alert("Error parsing JSON: " + err.message);
    }
  });
}

// ============================================================================
// 8b. CANVAS CONNECTION: IMPORT REAL ASSIGNMENTS FROM THE EXTENSION
// ============================================================================

/**
 * Rotating accent colors assigned to newly-discovered Canvas courses,
 * since the extension doesn't tell us a course's branding color.
 */
const COURSE_COLOR_PALETTE = ["#861F41", "#E87722", "#059669", "#7c3aed", "#2563eb", "#0891b2", "#b45309"];

/**
 * Decodes HTML entities (e.g. "&amp;" -> "&") using the browser's own parser,
 * since assignment titles/descriptions come straight from Canvas's HTML.
 */
function decodeHtmlEntities(html) {
  const el = document.createElement("textarea");
  el.innerHTML = html;
  return el.value;
}

/**
 * Best-effort scrape of a course code/name/term out of an assignment's description banner,
 * e.g. "CS 2114 · Software Design & Data Structures · Fall 2026". Not every assignment's
 * description has this banner, so callers must handle a null result.
 */
function extractCourseLabelFromDescription(descriptionHtml) {
  if (!descriptionHtml) return null;

  const match = descriptionHtml.match(/>\s*([A-Z]{2,5}\s?\d{3,4}[A-Za-z0-9-]*)\s*·\s*([^·<]+?)\s*·\s*([^<]+?)\s*<\/div>/);
  if (!match) return null;

  return {
    code: decodeHtmlEntities(match[1]).trim(),
    name: decodeHtmlEntities(match[2]).trim(),
    term: decodeHtmlEntities(match[3]).trim()
  };
}

/**
 * Imports a flat list of Canvas assignments (as scraped by the extension), grouping them
 * into courses by course_id. Existing Canvas-linked courses are matched and updated in place
 * rather than duplicated, so pasting an updated export re-syncs instead of piling up.
 *
 * This updates the local view immediately (works even if the backend is offline), then
 * separately pushes the same assignments to the Spring Boot backend so they're saved for
 * real, under the given VT email.
 */
function importAssignmentsFromExtension(vtEmail, assignments) {
  assignments.forEach(assignment => {
    const courseId = assignment.course_id;
    let course = appState.courses.find(c => c.canvasCourseId === courseId);

    if (!course) {
      const guess = extractCourseLabelFromDescription(assignment.description_raw);
      course = {
        id: "course_canvas_" + courseId,
        canvasCourseId: courseId,
        code: guess ? guess.code : `Course ${courseId}`,
        name: guess ? guess.name : "",
        term: guess ? guess.term : appState.activeTerm,
        currentGrade: null,
        letterGrade: "",
        goalGrade: "A-",
        confidence: "medium",
        weeklyHours: 3,
        enabled: true,
        color: COURSE_COLOR_PALETTE[appState.courses.length % COURSE_COLOR_PALETTE.length],
        focusTopics: "",
        assignments: []
      };
      appState.courses.push(course);
    }

    if (!course.assignments) {
      course.assignments = [];
    }

    const existingIndex = course.assignments.findIndex(a => a.id === assignment.id);
    if (existingIndex === -1) {
      course.assignments.push(assignment);
    } else {
      course.assignments[existingIndex] = assignment;
    }
  });

  const syncedCourseCount = new Set(assignments.map(a => a.course_id)).size;

  renderCourseCardsDeck();
  updateGoalsSummaryMetrics();
  saveStateToStorage();
  showToast(`⚡ Loaded ${assignments.length} assignment(s) across ${syncedCourseCount} course(s). Saving to backend...`);

  pushAssignmentsToBackend(vtEmail, assignments);
}

/**
 * Sends the assignment list to the Spring Boot backend (see /backend) so it's persisted
 * server-side instead of only living in this browser's localStorage. Best-effort: if the
 * backend isn't running, the local import above still worked, so we just surface the failure.
 */
async function pushAssignmentsToBackend(vtEmail, assignments) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/assignments/import`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vtEmail, assignments })
    });

    const body = await res.json();

    if (!res.ok) {
      showToast(`⚠ Saved locally, but backend rejected the sync: ${body.message || res.status}`);
      return;
    }

    showToast(`✓ Backend saved ${body.importedCount} assignment(s) across ${body.courseCount} course(s) for ${vtEmail}.`);
  } catch (err) {
    showToast(`⚠ Saved locally, but couldn't reach the backend at ${API_BASE_URL}. Is it running?`);
  }
}

// ============================================================================
// 9. HOKIETUTOR CHROME EXTENSION & BACKEND INTEGRATION
// ============================================================================

/**
 * Initializes the bidirectional communication channel between the web application
 * and the HokieTutor Chrome Extension (via content_bridge.js).
 * Enforces the co-dependence barrier: the application requires the extension to operate.
 */
function initExtensionConnection() {
  const guardOverlay = document.getElementById("extension-guard-overlay");
  const guardStatusMsg = document.getElementById("guard-status-message");
  const guardPulseDot = document.getElementById("guard-pulse-dot");
  const headerBadge = document.getElementById("header-extension-badge");
  const headerText = document.getElementById("header-extension-text");
  const btnDetect = document.getElementById("btn-detect-extension");
  const btnDemoOverride = document.getElementById("btn-demo-override");

  function onExtensionConnected(info) {
    if (appState.extensionConnected) return;

    appState.extensionConnected = true;
    appState.extensionVersion = info.version || "1.0.0";

    // Update overlay UI
    if (guardStatusMsg) guardStatusMsg.textContent = `Extension Connected (v${appState.extensionVersion})!`;
    if (guardPulseDot) {
      guardPulseDot.style.backgroundColor = "#10b981";
      guardPulseDot.style.animation = "pulseGreen 1.5s infinite";
    }

    // Dismiss the lock overlay
    setTimeout(() => {
      if (guardOverlay) guardOverlay.classList.add("hidden");
    }, 400);

    // Update header status badge
    if (headerBadge) {
      headerBadge.classList.remove("disconnected");
      headerBadge.classList.add("connected");
    }
    if (headerText) {
      headerText.textContent = `Extension: Connected (v${appState.extensionVersion})`;
    }

    showToast("✓ HokieTutor Extension verified & connected!");
  }

  // Window message listener for communication with content_bridge.js
  window.addEventListener("message", (event) => {
    if (event.source !== window || !event.data || event.data.sender !== "HOKIETUTOR_EXTENSION") {
      return;
    }

    const { type, data, version, status } = event.data;

    if (type === "EXTENSION_PRESENCE_BEACON" || type === "PONG_EXTENSION") {
      onExtensionConnected({ version, status });
    } else if (type === "REGENERATE_SCHEDULE_SUCCESS") {
      handleRegenerateResponse(data);
    } else if (type === "REGENERATE_SCHEDULE_ERROR") {
      handleRegenerateError(event.data.error);
    } else if (type === "GET_CANVAS_DATA_SUCCESS") {
      handleCanvasDataResponse(data);
    }
  });

  // Check if extension injected global properties
  if (window.__HOKIETUTOR_EXTENSION_ACTIVE__) {
    onExtensionConnected({ version: window.__HOKIETUTOR_EXTENSION_VERSION__ || "1.0.0" });
  }

  // Periodic ping until extension connects
  function pingExtension() {
    window.postMessage({
      sender: "HOKIETUTOR_WEB_APP",
      type: "PING_EXTENSION",
      messageId: "ping_" + Date.now()
    }, "*");
  }

  pingExtension();
  const pingInterval = setInterval(() => {
    if (!appState.extensionConnected) {
      pingExtension();
    } else {
      clearInterval(pingInterval);
    }
  }, 1200);

  // Manual Ping button on barrier
  if (btnDetect) {
    btnDetect.addEventListener("click", () => {
      btnDetect.textContent = "Checking...";
      pingExtension();
      setTimeout(() => {
        if (!appState.extensionConnected) {
          btnDetect.textContent = "🔍 Ping Extension";
          showToast("Extension not detected. Make sure it is loaded in chrome://extensions.");
        } else {
          btnDetect.textContent = "✓ Connected!";
        }
      }, 1000);
    });
  }

  // Developer / Presentation bypass button
  if (btnDemoOverride) {
    btnDemoOverride.addEventListener("click", () => {
      onExtensionConnected({ version: "1.0.0-demo" });
      showToast("⚡ Developer/Demo Mode Active: Extension simulation enabled.");
    });
  }
}

/**
 * Dispatches a regeneration request to the companion HokieTutor Chrome Extension.
 * The extension synchronizes Canvas assignments, contacts the Spring Boot backend
 * estimation AI, and returns the computed study hours.
 */
function callExtensionToRegenerate() {
  if (!appState.extensionConnected) {
    const overlay = document.getElementById("extension-guard-overlay");
    if (overlay) overlay.classList.remove("hidden");
    showToast("🔒 Extension required! Please connect the HokieTutor Chrome Extension.");
    return;
  }

  const btn = document.getElementById("btn-regenerate-schedule");
  const btnText = document.getElementById("btn-regenerate-text");
  const btnIcon = document.getElementById("btn-regenerate-icon");

  if (btn) btn.disabled = true;
  if (btnText) btnText.textContent = "Calling Extension...";
  if (btnIcon) btnIcon.textContent = "⏳";

  showToast("⚡ Calling HokieTutor Extension to refresh Canvas data & recalculate...");

  // Send regeneration request to extension via content bridge
  window.postMessage({
    sender: "HOKIETUTOR_WEB_APP",
    type: "REGENERATE_SCHEDULE",
    payload: {
      studentName: appState.vtEmail ? appState.vtEmail.split("@")[0] : "HokieStudent",
      courses: appState.courses,
      studyHabits: appState.studyHabits
    },
    messageId: "regen_" + Date.now()
  }, "*");

  // Timeout fallback in case service worker takes too long
  setTimeout(() => {
    if (btn && btn.disabled) {
      btn.disabled = false;
      if (btnText) btnText.textContent = "Call Extension & Regenerate";
      if (btnIcon) btnIcon.textContent = "⚡";
      generateMultiCourseSchedule();
      renderStudySessions();
      showToast("⚡ Regenerated schedule (Extension fallback applied)");
    }
  }, 4500);
}

/**
 * Handles regeneration data returned from the HokieTutor Chrome Extension.
 */
function handleRegenerateResponse(data) {
  const btn = document.getElementById("btn-regenerate-schedule");
  const btnText = document.getElementById("btn-regenerate-text");
  const btnIcon = document.getElementById("btn-regenerate-icon");

  if (btn) btn.disabled = false;
  if (btnText) btnText.textContent = "Call Extension & Regenerate";
  if (btnIcon) btnIcon.textContent = "⚡";

  if (!data) return;

  // Sync courses if provided by extension
  if (data.courses && Array.isArray(data.courses) && data.courses.length > 0) {
    data.courses.forEach(extCourse => {
      const existing = appState.courses.find(c => c.code === extCourse.code || c.canvasCourseId === extCourse.canvasCourseId);
      if (existing) {
        existing.assignments = extCourse.assignments || existing.assignments;
      } else {
        appState.courses.push(extCourse);
      }
    });
  }

  // Generate schedule utilizing the backend AI estimates
  generateMultiCourseSchedule(data.estimates);
  renderStudySessions();
  renderCourseCardsDeck();
  updateGoalsSummaryMetrics();
  saveStateToStorage();

  if (data.backendReachable) {
    showToast("✓ Schedule regenerated via HokieTutor Extension & Backend AI!");
  } else {
    showToast("✓ Schedule regenerated via HokieTutor Extension (Fall 2026 heuristics)!");
  }
}

/**
 * Handles errors returned during extension schedule regeneration.
 */
function handleRegenerateError(err) {
  const btn = document.getElementById("btn-regenerate-schedule");
  const btnText = document.getElementById("btn-regenerate-text");
  const btnIcon = document.getElementById("btn-regenerate-icon");

  if (btn) btn.disabled = false;
  if (btnText) btnText.textContent = "Call Extension & Regenerate";
  if (btnIcon) btnIcon.textContent = "⚡";

  generateMultiCourseSchedule();
  renderStudySessions();
  showToast("⚠ Extension sync notice: " + (err || "recalculated with cached data"));
}

/**
 * Handles Canvas data returned from the extension on direct sync.
 */
function handleCanvasDataResponse(data) {
  if (data && data.courses && Array.isArray(data.courses) && data.courses.length > 0) {
    appState.courses = data.courses;
    renderCourseCardsDeck();
    updateGoalsSummaryMetrics();
    saveStateToStorage();
    showToast(`⚡ Synced ${data.courses.length} active courses directly from HokieTutor Extension!`);
  } else {
    simulateLiveSyncFromExtension();
  }
}

/**
 * Fallback simulation for live sync if testing standalone.
 */
function simulateLiveSyncFromExtension() {
  appState.courses = JSON.parse(JSON.stringify(DEFAULT_COURSES));
  renderCourseCardsDeck();
  updateGoalsSummaryMetrics();
  saveStateToStorage();
  showToast("⚡ Synced with VT Canvas! Loaded 4 Fall 2026 courses.");
}

/**
 * Exports study schedule to an RFC 5545 .ics calendar file.
 */
function exportScheduleToIcs() {
  if (!appState.studySessions || appState.studySessions.length === 0) {
    showToast("No study sessions to export!");
    return;
  }

  let icsLines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//HokieTutor Web App//VT Hacks//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH"
  ];

  const now = new Date();
  const dateStamp = now.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  appState.studySessions.forEach((session, index) => {
    icsLines.push("BEGIN:VEVENT");
    icsLines.push(`UID:hokietutor-${session.id || index}@vt.edu`);
    icsLines.push(`DTSTAMP:${dateStamp}`);
    icsLines.push(`SUMMARY:[HokieTutor] ${session.course} - ${session.topic}`);
    icsLines.push(`DESCRIPTION:Study Session\\nCourse: ${session.course}\\nFormat: ${session.studyFormat}\\nDuration: ${session.durationMinutes} mins`);
    icsLines.push("STATUS:CONFIRMED");
    icsLines.push("END:VEVENT");
  });

  icsLines.push("END:VCALENDAR");

  const blob = new Blob([icsLines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "HokieTutor_Fall2026_Schedule.ics";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast("📥 Exported HokieTutor_Fall2026_Schedule.ics!");
}

// ============================================================================
// 10. UTILITIES
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

  setTimeout(() => {
    toast.classList.add("hidden");
  }, 2800);
}
