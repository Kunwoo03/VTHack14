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

## 🎯 What Was Fixed & Added Based on Feedback

1. **Accurate Course Codes & CRNs:**
   - Properly reads and displays **`MATH 1226 (Juste CRN 87487)`** (*Calculus II / Fall 2026*).
2. **Missing & Outdated Courses Handled:**
   - Added **Psychology (`PSYC 1004`)** and **Green Engineering (`ENGE 1215`)**.
   - Concluded courses from last year (**`PHYS 2306`**) are automatically excluded from the active Fall 2026 schedule.
   - Includes **`+ Add Course`** and **`🗑️ Delete Course`** buttons to customize enrolled classes.
3. **Multi-Course Goal Matrix (The Deck):**
   - Each course has its own card on Page 1 with independent **Target Grade** (`A`, `A-`, `B+`), **Confidence Level** (`Low`, `Medium`, `High`), **Weekly Study Hours**, and **Weak Syllabus Topics**.
   - Includes a checkbox to include or exclude any class from the schedule.
4. **Extension Data Integration:**
   - **⚡ Sync with Canvas** button: Simulates receiving live data from the extension.
   - **📂 Import Extension Data** button: Paste or load any JSON exported by the extension.
5. **Interactive Schedule CRUD (Page 3):**
   - Move / Reschedule session (edit day/time via modal).
   - Delete sessions.
   - Add custom sessions.
   - Check off completed sessions.
   - Export to iCal (`.ics`) file.
