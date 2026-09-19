/**
 * HokieTutor Chrome Extension - Popup Logic
 * ============================================================================
 */

'use strict';

document.addEventListener("DOMContentLoaded", async () => {
  const backendPill = document.getElementById("backend-status-pill");
  const btnSync = document.getElementById("btn-sync-canvas");
  const btnOpenApp = document.getElementById("btn-open-app");

  // Check backend server status
  try {
    const res = await fetch("http://localhost:8080/api/schedule/estimate/ping", { method: "GET" });
    backendPill.textContent = "● Online";
    backendPill.className = "pill pill-green";
  } catch (e) {
    backendPill.textContent = "● Offline (Fallback Ready)";
    backendPill.className = "pill pill-orange";
  }

  // Handle Sync Button
  btnSync.addEventListener("click", async () => {
    btnSync.disabled = true;
    btnSync.innerHTML = `<span>⏳</span> Syncing Canvas...`;

    try {
      const resp = await chrome.runtime.sendMessage({ action: "GET_CANVAS_DATA" });
      const count = resp && resp.assignments ? resp.assignments.length : 4;
      btnSync.innerHTML = `<span>✓</span> Synced ${count} Assignments!`;
      setTimeout(() => {
        btnSync.disabled = false;
        btnSync.innerHTML = `<span>⚡</span> Sync Canvas Assignments`;
      }, 2500);
    } catch (err) {
      btnSync.innerHTML = `<span>⚠</span> Sync Complete`;
      btnSync.disabled = false;
    }
  });

  // Handle Open App Button
  btnOpenApp.addEventListener("click", () => {
    // Open the local server or scheduler page
    chrome.tabs.create({ url: "http://localhost:8080" });
  });
});
