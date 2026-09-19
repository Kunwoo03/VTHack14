/**
 * HokieTutor Chrome Extension - Content Bridge
 * ============================================================================
 * Runs on the HokieTutor Web Application pages (localhost and file URLs).
 * Facilitates secure two-way communication between the main web scheduler
 * application and the HokieTutor Chrome extension service worker.
 * ============================================================================
 */

'use strict';

const EXTENSION_VERSION = "1.0.0";
const EXTENSION_NAME = "HokieTutor Canvas Companion";

// Mark extension presence in DOM
try {
  window.__HOKIETUTOR_EXTENSION_ACTIVE__ = true;
  window.__HOKIETUTOR_EXTENSION_VERSION__ = EXTENSION_VERSION;
} catch (e) {
  // Ignore in isolated worlds if window is restricted
}

/**
 * Broadcasts an extension presence beacon to the page so the web app
 * immediately recognizes the extension is installed and unlocks the UI.
 */
function sendPresenceBeacon() {
  window.postMessage({
    sender: "HOKIETUTOR_EXTENSION",
    type: "EXTENSION_PRESENCE_BEACON",
    version: EXTENSION_VERSION,
    status: "active",
    name: EXTENSION_NAME
  }, "*");
}

// Send beacon immediately upon script start and repeatedly every 1.5 seconds
sendPresenceBeacon();
const beaconInterval = setInterval(sendPresenceBeacon, 1500);

/**
 * Listens for messages dispatched by the HokieTutor web application (`app.js`).
 */
window.addEventListener("message", async (event) => {
  // Accept messages originating only from the current window and identified as HOKIETUTOR_WEB_APP
  if (event.source !== window || !event.data || event.data.sender !== "HOKIETUTOR_WEB_APP") {
    return;
  }

  const { type, payload, messageId } = event.data;

  // 1. Connection Ping
  if (type === "PING_EXTENSION") {
    window.postMessage({
      sender: "HOKIETUTOR_EXTENSION",
      type: "PONG_EXTENSION",
      version: EXTENSION_VERSION,
      status: "connected",
      messageId
    }, "*");
    return;
  }

  // 2. Schedule Regeneration Request (Triggered when user clicks "⚡ Regenerate")
  if (type === "REGENERATE_SCHEDULE") {
    try {
      const response = await chrome.runtime.sendMessage({
        action: "REGENERATE_SCHEDULE",
        payload: payload || {}
      });

      window.postMessage({
        sender: "HOKIETUTOR_EXTENSION",
        type: "REGENERATE_SCHEDULE_SUCCESS",
        data: response,
        messageId
      }, "*");
    } catch (err) {
      window.postMessage({
        sender: "HOKIETUTOR_EXTENSION",
        type: "REGENERATE_SCHEDULE_ERROR",
        error: err.message || "Failed to communicate with extension service worker",
        messageId
      }, "*");
    }
    return;
  }

  // 3. Request Live Canvas Data
  if (type === "GET_CANVAS_DATA") {
    try {
      const response = await chrome.runtime.sendMessage({
        action: "GET_CANVAS_DATA",
        payload: payload || {}
      });

      window.postMessage({
        sender: "HOKIETUTOR_EXTENSION",
        type: "GET_CANVAS_DATA_SUCCESS",
        data: response,
        messageId
      }, "*");
    } catch (err) {
      window.postMessage({
        sender: "HOKIETUTOR_EXTENSION",
        type: "GET_CANVAS_DATA_ERROR",
        error: err.message,
        messageId
      }, "*");
    }
  }
});
