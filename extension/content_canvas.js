/**
 * HokieTutor Chrome Extension - Canvas Scraper
 * ============================================================================
 * Runs on https://canvas.vt.edu/*
 * Scrapes enrolled Fall 2026 courses, upcoming assignments, and syllabus
 * deadlines to populate the HokieTutor AI Study Scheduler.
 * ============================================================================
 */

'use strict';

console.log("[HokieTutor] Canvas content script initialized on canvas.vt.edu");

/**
 * Scrapes course information from Canvas dashboard and cards.
 */
function scrapeCanvasCourses() {
  const courses = [];
  const cardElements = document.querySelectorAll(".ic-DashboardCard, .course-list-table-row");

  cardElements.forEach(el => {
    const titleEl = el.querySelector(".ic-DashboardCard__header-title, .name a");
    const subTitleEl = el.querySelector(".ic-DashboardCard__header-subtitle");
    const linkEl = el.querySelector("a[href*='/courses/']");

    if (titleEl && linkEl) {
      const title = titleEl.textContent.trim();
      const subTitle = subTitleEl ? subTitleEl.textContent.trim() : "";
      const match = linkEl.href.match(/\/courses\/(\d+)/);
      const courseId = match ? parseInt(match[1], 10) : Date.now();

      // Check for course code pattern like "MATH 1226", "CS 2114", "ENGE 1215", "PSYC 1004"
      const codeMatch = (title + " " + subTitle).match(/([A-Z]{2,5}\s?\d{3,4}[A-Za-z0-9-]*)/);
      const courseCode = codeMatch ? codeMatch[1] : title;

      courses.push({
        id: courseId,
        name: title,
        code: courseCode,
        term: "Fall 2026",
        url: linkEl.href
      });
    }
  });

  return courses;
}

/**
 * Scrapes assignments from the Canvas planner / list if available on DOM.
 */
function scrapeCanvasAssignments() {
  const assignments = [];
  const itemElements = document.querySelectorAll(".planner-item, .todo-list-item, .item-group-condensed-list li");

  itemElements.forEach(el => {
    const titleEl = el.querySelector(".planner-item-title, .todo-details a, .title");
    const dueEl = el.querySelector(".planner-item-date, .todo-date, .due_date");
    const courseEl = el.querySelector(".planner-item-course, .course-name");

    if (titleEl) {
      const title = titleEl.textContent.trim();
      const rawDate = dueEl ? dueEl.textContent.trim() : null;
      let dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 3); // default in 3 days

      if (rawDate) {
        const parsed = Date.parse(rawDate);
        if (!isNaN(parsed)) {
          dueDate = new Date(parsed);
        }
      }

      assignments.push({
        id: Math.floor(Math.random() * 1000000) + 100000,
        title: title,
        course_id: 234299,
        due_at: dueDate.toISOString(),
        points_possible: 100,
        description_raw: `<div>Course: ${courseEl ? courseEl.textContent.trim() : 'Active Course'}</div><p>${title}</p>`
      });
    }
  });

  return assignments;
}

/**
 * Saves scraped data to chrome.storage.local and notifies background worker.
 */
async function syncCanvasData() {
  const scrapedCourses = scrapeCanvasCourses();
  const scrapedAssignments = scrapeCanvasAssignments();

  try {
    await chrome.runtime.sendMessage({
      action: "SAVE_CANVAS_DATA",
      payload: {
        courses: scrapedCourses,
        assignments: scrapedAssignments,
        syncTime: new Date().toISOString()
      }
    });
    return true;
  } catch (err) {
    console.warn("[HokieTutor] Could not send data to background worker:", err);
    return false;
  }
}

/**
 * Injects a floating Virginia Tech branded sync button onto the Canvas page.
 */
function injectFloatingCanvasBadge() {
  if (document.getElementById("hokietutor-canvas-badge")) return;

  const badge = document.createElement("div");
  badge.id = "hokietutor-canvas-badge";
  badge.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: #861F41;
    color: #ffffff;
    padding: 10px 16px;
    border-radius: 24px;
    box-shadow: 0 4px 14px rgba(0,0,0,0.3);
    z-index: 999999;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    border: 2px solid #E87722;
    transition: transform 0.2s, background-color 0.2s;
  `;
  badge.innerHTML = `<span>⚡</span> <span>Sync to HokieTutor</span>`;

  badge.addEventListener("mouseenter", () => {
    badge.style.transform = "scale(1.05)";
    badge.style.backgroundColor = "#6d1834";
  });
  badge.addEventListener("mouseleave", () => {
    badge.style.transform = "scale(1)";
    badge.style.backgroundColor = "#861F41";
  });

  badge.addEventListener("click", async () => {
    badge.innerHTML = `<span>⏳</span> <span>Syncing...</span>`;
    const success = await syncCanvasData();
    if (success) {
      badge.innerHTML = `<span>✓</span> <span>Synced to HokieTutor!</span>`;
      badge.style.borderColor = "#10b981";
      setTimeout(() => {
        badge.innerHTML = `<span>⚡</span> <span>Sync to HokieTutor</span>`;
        badge.style.borderColor = "#E87722";
      }, 3000);
    } else {
      badge.innerHTML = `<span>⚠</span> <span>Sync Failed</span>`;
      badge.style.borderColor = "#ef4444";
    }
  });

  document.body.appendChild(badge);
}

// Auto-run when DOM is interactive
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    injectFloatingCanvasBadge();
    syncCanvasData();
  });
} else {
  injectFloatingCanvasBadge();
  syncCanvasData();
}
