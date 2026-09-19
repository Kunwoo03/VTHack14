# HokieTutor - VT Canvas AI Study Scheduler (Web Application)

**VT Hacks Project**  
A full-featured standalone web application designed for Virginia Tech students. It takes course data, syllabi, grades, and assignments gathered by the lightweight HokieTutor Chrome Extension, collects student academic goals and weekly availability, and generates an optimized, personalized study schedule.

---

## 🌟 How the Extension & Application Work Together

```
   ┌───────────────────────────────┐
   │  VT Canvas (canvas.vt.edu)    │
   └──────────────┬────────────────┘
                  │  Scraped via Content Script
                  ▼
   ┌───────────────────────────────┐
   │  HokieTutor Chrome Extension  │
   │  - Gathers active Fall 2026   │
   │    courses, grades & syllabi  │
   │  - Exports or passes payload  │
   └──────────────┬────────────────┘
                  │  JSON Import / Live Sync / URL Parameter
                  ▼
   ┌─────────────────────────────────────────────────────────────┐
   │  HokieTutor Web Application (This Project)                  │
   │                                                             │
   │  Page 1: Multi-Course Goals & Habits                        │
   │  - Set individual target grades for MATH 1226, PSYC, ENGE...│
   │  - Filter out past courses (PHYS 2306)                      │
   │  - Set confidence & weekly study hours per class            │
   │                                                             │
   │  Page 2: Schedule & Availability Input                      │
   │  - Drag-and-drop timetable screenshot (OCR simulation)      │
   │  - Interactive 7-day x 14-hour busy/free time blocking      │
   │                                                             │
   │  Page 3: AI Study Schedule & Controls                       │
   │  - Intelligent multi-course balanced allocation             │
   │  - Move / Reschedule, Delete, and Add study sessions        │
   │  - Export to Google Calendar / Apple Calendar (.ics)        │
   └─────────────────────────────────────────────────────────────┘
```

---

## 🚀 How to Run the Application

### Method 1: Double Click `run.bat` or `index.html`
Simply double-click [`index.html`](file:///C:/Users/supre/.gemini/antigravity/scratch/vthacks-tutor-app/index.html) or `run.bat`. It opens directly in your browser with zero installation required!

### Method 2: Local Python Server (Optional)
If you prefer running on `localhost`:
```bash
python -m http.server 8080
```
Then visit `http://localhost:8080` in your browser.

---

## 🧩 Installing & Using the HokieTutor Chrome Extension

The application is **co-dependent** and requires the companion HokieTutor Chrome Extension to run and generate schedules.

1. Open **Google Chrome** (or Edge/Brave) and navigate to `chrome://extensions`.
2. Enable **Developer mode** toggle in the top-right corner.
3. Click **Load unpacked** and select the [`extension/`](file:///c:/Users/lilsm/OneDrive/Documents/GitHub/VTHack14/extension) directory from this project.
4. Open or refresh `index.html` (or `standalone-app.html`).
5. The application detects the extension, the "Extension Required" barrier unlocks, and the header displays `🟢 Extension: Connected (v1.0)`.

---

## 🎯 What Was Built & Integrated

1. **Co-Dependent Architecture:**
   - The web app requires the extension to be active. If disconnected, a barrier overlay directs the student to load the extension.
   - A presentation / developer demo mode bypass is included for quick evaluations.
2. **"⚡ Call Extension & Regenerate" Flow:**
   - Clicking **⚡ Call Extension & Regenerate** on Page 3 contacts the extension's background worker.
   - The extension refreshes Canvas data, forwards assignments to the Spring Boot backend (`http://localhost:8080/api/assignments/import`), and requests weekly study estimates (`/api/schedule/estimate/{name}`).
   - The scheduler dynamically allocates study blocks into the student's free calendar slots based on real assignment estimates.
3. **Canvas Content Scraper & Floating Action:**
   - Content script on `https://canvas.vt.edu/*` extracts enrolled Fall 2026 courses, assignment due dates, and point weights.
   - Adds a floating Virginia Tech branded sync widget directly onto Canvas pages.
4. **Accurate Course Codes & CRNs:**
   - Displays **`MATH 1226 (Juste CRN 87487)`** (*Calculus II / Fall 2026*), **`PSYC 1004`**, **`ENGE 1215`**, and **`CS 2114`**.
   - Concluded courses (**`PHYS 2306`**) are automatically filtered out.
5. **Interactive Schedule CRUD & Calendar Export (Page 3):**
   - Move / Reschedule session (edit day/time via modal).
   - Delete sessions and add custom sessions.
   - Check off completed sessions.
   - Export to iCal (`.ics`) file.

