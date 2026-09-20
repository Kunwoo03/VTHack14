# 🐉 VT BrainWyrms AI (HokieTutor) — Complete Suite

A comprehensive, collegiate AI tutoring and schedule generation platform tailored for Virginia Tech students.

---

## 📁 Package Contents

```text
VT-BrainWyrmsAI-Suite/
├── Launch.bat                <-- Windows interactive launcher menu
├── START_HERE.html           <-- Universal browser launchpad
├── Application/              <-- Standalone Web Application
│   ├── VT-BrainWyrmsAI.html  <-- Main application (zero install)
│   └── run_app.bat           <-- Double-click to launch app & prompt
└── Extension/                <-- Chrome / Edge / Brave Extension
    ├── manifest.json         <-- Manifest V3 definition
    ├── popup.html / popup.js <-- Extension popup with Canvas scraper
    ├── app.html / app.js     <-- Parity application inside extension
    ├── setup_extension.bat   <-- Double-click to open instructions
    └── HOW_TO_INSTALL.txt    <-- 10-second installation guide
```

---

## 🚀 How to Run

### Method 1: The Master Launcher (Recommended)
Double-click `Launch.bat` to choose:
- **[1] Launch Web Application**
- **[2] Setup Chrome Extension**
- **[3] Launch BOTH**
- **[4] Open START_HERE.html**

### Method 2: Instant Browser Launch
Double-click `START_HERE.html` or `Application/VT-BrainWyrmsAI.html`. It runs directly in any browser with zero installation.

### Method 3: Load the Chrome Extension
1. Open `chrome://extensions` in Chrome, Edge, or Brave.
2. Turn ON **Developer mode** in the top-right.
3. Click **Load unpacked** and select the `Extension` folder.
4. Visit `canvas.vt.edu` and click the extension icon to sync live courses!

---

## ✨ Features
1. **Syllabus & Learning Goals Grounding**: Extracts authentic conceptual objectives for each course, filtering out orientation/setup noise.
2. **Upcoming Exam & Project Alignment**: Predicts hours needed to succeed based on actual exam targets.
3. **Interactive Practice Engine**: Generates concept checkpoints, formula walkthroughs, and office hours worksheets.
4. **Full Schedule Export**: RFC 5545 compliant `.ics` calendar download and 1-click Google Calendar sync with weekly recurrence.
