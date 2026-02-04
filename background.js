let popupResponseQueue = new Map();
// ----- K E E P - A L I V E   M A N A G E R -----
const KEEP_ALIVE_ALARM_NAME = "keep-alive-alarm";

// ---------------------------------------------------------------------------
// Licensing is disabled for now. Keep extension fully unlocked.
// ---------------------------------------------------------------------------
async function ensureLicenseBypass() {
  try {
    await chrome.storage.local.set({
      licenseVerified: true,
      freePostsRemaining: 999999,
      lastValidated: Date.now(),
    });
    await chrome.storage.local.remove([
      "license_key",
      "licenseProvider",
      "licenseExpiration",
      "licenseValidationProgress",
      "hasSeenActivationSuccess",
    ]);
  } catch (e) {
    console.warn("[LicenseBypass] Failed to set default state:", e);
  }
}

// Always-authorized license status for now
async function checkLicenseStatus() {
  return { isAuthorized: true, message: "OK" };
}

// Backward-compatible stubs (activation/validation no-ops)
async function activateLicense() {
  await ensureLicenseBypass();
  return { success: true };
}

async function validateLicenseKey() {
  await chrome.storage.local.set({
    licenseVerified: true,
    licenseValidationProgress: {
      status: "completed",
      result: { isValid: true },
    },
  });
}

// Initialize bypass on service worker start
ensureLicenseBypass();

// This function is the heartbeat. It does a minimal, harmless async operation.
async function keepAlive() {
  try {
    await chrome.storage.local.get(null);
    // console.log('[Keep-Alive] Heartbeat sent.');
  } catch (e) {
    // This can happen if the extension context is invalidated.
    console.warn("[Keep-Alive] Heartbeat failed, context might be closing.", e);
  }
}

// Create the alarm when the service worker starts up.
// This will fire every 20 seconds, well within the 30-second idle limit.
chrome.alarms.create(KEEP_ALIVE_ALARM_NAME, {
  periodInMinutes: 1 / 3, // Fire every 20 seconds
});

// Listen for the alarm and execute the heartbeat.
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === KEEP_ALIVE_ALARM_NAME) {
    keepAlive();
    pollBridgeOnce();
  }
  // --- IMPORTANT: Keep your existing scheduler alarm logic here ---
  else if (alarm.name === SCHEDULE_CHECK_ALARM) {
    // console.log("Schedule check alarm triggered.");
    checkForDueScheduledPosts();
  }
});
// ---------------------------------------------
chrome.runtime.onStartup.addListener(() => {
  console.log("[Startup] Checking for stale locks...");
  chrome.storage.local.get("isPostingInProgress", (result) => {
    if (result.isPostingInProgress === "started") {
      // Browser restarted while we were working.
      // We must reset the state so the user can start again.
      console.warn("[Startup] Found stale 'started' state. Resetting to idle.");
      chrome.storage.local.remove(["isPostingInProgress", "postingStatus"]);
      clearPostingState(); // Clear session state
    }
  });
  initBridge();
});
chrome.runtime.onInstalled.addListener(() => {
  initBridge();
});
// =================================================================
// ----- S E S S I O N   S T A T E   M A N A G E M E N T -----
// These helpers use chrome.storage.session to create a stable state
// that survives service worker terminations.
// =================================================================

const STATE_KEY = "posting_state";

// Gets the entire state object
async function getPostingState() {
  try {
    const { [STATE_KEY]: state } = await chrome.storage.session.get(STATE_KEY);
    // Return the state or a default structure if it doesn't exist
    return (
      state || { isLocked: false, stopRequested: false, sharedTabId: null }
    );
  } catch (error) {
    console.error("Error getting posting state:", error);
    return { isLocked: false, stopRequested: false, sharedTabId: null }; // Return default on error
  }
}

// Sets one or more properties on the state object
async function setPostingState(newState) {
  try {
    const currentState = await getPostingState();
    const updatedState = { ...currentState, ...newState };
    await chrome.storage.session.set({ [STATE_KEY]: updatedState });
  } catch (error) {
    console.error("Error setting posting state:", error);
  }
}

// Clears the state, typically after a job is complete or on error
async function clearPostingState() {
  try {
    await chrome.storage.session.remove(STATE_KEY);
    console.log("Session posting state cleared.");
  } catch (error) {
    console.error("Error clearing posting state:", error);
  }
}

// const { response } = require("express");

const SCHEDULE_CHECK_ALARM = "checkScheduledPostsAlarm";

// ---------------- BRIDGE: LOCAL API POLLING ----------------
const BRIDGE_DEFAULT_CONFIG = {
  enabled: true,
  baseUrl: "http://127.0.0.1:3721",
  apiKey: "",
  pollIntervalMs: 5000,
};
let bridgePollTimer = null;
let bridgePollingInFlight = false;

async function initBridge() {
  const config = await ensureBridgeConfig();
  if (config.enabled) {
    startBridgePolling(config.pollIntervalMs);
  } else {
    stopBridgePolling();
  }
}

function startBridgePolling(intervalMs) {
  stopBridgePolling();
  const safeInterval =
    typeof intervalMs === "number" && intervalMs > 1000 ? intervalMs : 5000;
  bridgePollTimer = setInterval(() => {
    pollBridgeOnce();
  }, safeInterval);
}

function stopBridgePolling() {
  if (bridgePollTimer) {
    clearInterval(bridgePollTimer);
    bridgePollTimer = null;
  }
}

async function ensureBridgeConfig() {
  const { bridgeConfig } = await chrome.storage.local.get("bridgeConfig");
  let cfg = bridgeConfig ? { ...BRIDGE_DEFAULT_CONFIG, ...bridgeConfig } : null;
  if (!cfg) {
    cfg = { ...BRIDGE_DEFAULT_CONFIG };
  }

  if (!cfg.apiKey || cfg.apiKey === "CHANGE_ME") {
    cfg.apiKey = generateBridgeApiKey();
    await chrome.storage.local.set({ bridgeConfig: cfg });
  } else if (!bridgeConfig) {
    await chrome.storage.local.set({ bridgeConfig: cfg });
  }

  return cfg;
}

async function ensureBridgeClientId() {
  const { bridgeClientId } = await chrome.storage.local.get("bridgeClientId");
  if (bridgeClientId) return bridgeClientId;
  const id = `ext_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  await chrome.storage.local.set({ bridgeClientId: id });
  return id;
}

function generateBridgeApiKey() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function generateItemId(prefix) {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  const rand = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${prefix}_${rand}`;
}

function normalizeLinks(rawLinks) {
  const list = Array.isArray(rawLinks) ? rawLinks : [];
  return list
    .map((item) => {
      if (!item) return null;
      if (Array.isArray(item)) {
        const title = String(item[0] || "").trim();
        const url = String(item[1] || "").trim();
        if (!url) return null;
        return [title, url];
      }
      if (typeof item === "string") {
        const url = item.trim();
        if (!url) return null;
        return ["", url];
      }
      if (typeof item === "object") {
        const title = String(item.title || item.name || "").trim();
        const url = String(item.url || item.link || "").trim();
        if (!url) return null;
        return [title, url];
      }
      return null;
    })
    .filter(Boolean);
}

function normalizeTemplate(raw) {
  const template = raw && typeof raw === "object" ? raw : {};
  return {
    id: template.id || null,
    title: String(template.title || "").trim(),
    text: String(template.text || template.html || "").trim(),
    delta: template.delta || null,
    images: Array.isArray(template.images) ? template.images : [],
    links: Array.isArray(template.links) ? template.links : [],
    color: template.color || "#18191A",
    categoryIds: Array.isArray(template.categoryIds)
      ? template.categoryIds
      : [],
  };
}

function normalizeGroupCollection(raw) {
  const group = raw && typeof raw === "object" ? raw : {};
  return {
    id: group.id || null,
    title: String(group.title || "").trim(),
    links: normalizeLinks(group.links || group.groupLinks || []),
  };
}

async function loadTagsGroupsWithIds() {
  const data = await chrome.storage.local.get(["tags", "groups"]);
  let tags = Array.isArray(data.tags) ? data.tags : [];
  let groups = Array.isArray(data.groups) ? data.groups : [];
  let changed = false;

  tags = tags.map((t) => {
    if (t && typeof t === "object" && !t.id) {
      changed = true;
      return { ...t, id: generateItemId("tag") };
    }
    return t;
  });

  groups = groups.map((g) => {
    if (g && typeof g === "object" && !g.id) {
      changed = true;
      return { ...g, id: generateItemId("group") };
    }
    return g;
  });

  if (changed) {
    await chrome.storage.local.set({ tags, groups });
  }

  return { tags, groups, changed };
}

// ---------------- OFFSCREEN CLIPBOARD ----------------
const OFFSCREEN_DOCUMENT_URL = "offscreen.html";

async function hasOffscreenDocument() {
  if (!chrome.runtime?.getContexts) return false;
  const contexts = await chrome.runtime.getContexts({
    contextTypes: ["OFFSCREEN_DOCUMENT"],
  });
  return contexts.some(
    (c) => typeof c.documentUrl === "string" && c.documentUrl.endsWith(OFFSCREEN_DOCUMENT_URL),
  );
}

async function ensureOffscreenDocument() {
  if (!chrome.offscreen?.createDocument) {
    throw new Error("Offscreen API not available");
  }
  const exists = await hasOffscreenDocument();
  if (exists) return;
  await chrome.offscreen.createDocument({
    url: OFFSCREEN_DOCUMENT_URL,
    reasons: [chrome.offscreen.Reason.CLIPBOARD],
    justification: "Copy API key to clipboard",
  });
}

async function closeOffscreenDocument() {
  if (!chrome.offscreen?.closeDocument) return;
  const exists = await hasOffscreenDocument();
  if (exists) await chrome.offscreen.closeDocument();
}

async function copyTextWithOffscreen(text) {
  if (!text) throw new Error("Empty text");
  await ensureOffscreenDocument();
  const response = await chrome.runtime.sendMessage({
    action: "offscreen_copy",
    text,
  });
  if (!response?.ok) {
    throw new Error(response?.error || "Copy failed");
  }
  setTimeout(() => {
    closeOffscreenDocument().catch(() => {});
  }, 1000);
}

async function pollBridgeOnce() {
  if (bridgePollingInFlight) return;
  bridgePollingInFlight = true;
  try {
    const config = await ensureBridgeConfig();
    if (!config.enabled) return;
    if (!config.baseUrl || !config.apiKey || config.apiKey === "CHANGE_ME")
      return;

    const now = Date.now();
    const { bridgeDisabledUntil, bridgeFailureCount } =
      await chrome.storage.local.get([
        "bridgeDisabledUntil",
        "bridgeFailureCount",
      ]);
    if (bridgeDisabledUntil && now < bridgeDisabledUntil) return;

    const clientId = await ensureBridgeClientId();
    const cmd = await bridgeFetchJson(
      `${config.baseUrl}/v1/commands/next?clientId=${encodeURIComponent(
        clientId,
      )}`,
      config.apiKey,
    );

    if (cmd && cmd.id && cmd.action) {
      const result = await executeBridgeCommand(cmd);
      await bridgeFetchJson(
        `${config.baseUrl}/v1/commands/${encodeURIComponent(cmd.id)}/ack`,
        config.apiKey,
        {
          method: "POST",
          body: JSON.stringify({
            status: result.success ? "success" : "error",
            result: result.result || null,
            error: result.error || null,
          }),
        },
      );
      await sendBridgeStatus(true);
    } else {
      await sendBridgeStatus(false);
    }

    await chrome.storage.local.set({
      bridgeFailureCount: 0,
      bridgeDisabledUntil: 0,
    });
  } catch (error) {
    const { bridgeFailureCount = 0 } =
      await chrome.storage.local.get("bridgeFailureCount");
    const nextCount = bridgeFailureCount + 1;
    const backoffMs = Math.min(60000, nextCount * 5000);
    await chrome.storage.local.set({
      bridgeFailureCount: nextCount,
      bridgeDisabledUntil: Date.now() + backoffMs,
    });
  } finally {
    bridgePollingInFlight = false;
  }
}

async function bridgeFetchJson(url, apiKey, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  const response = await fetch(url, {
    method: "GET",
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      ...(options.headers || {}),
    },
    signal: controller.signal,
  });
  clearTimeout(timeout);

  if (response.status === 204) return null;
  if (!response.ok) {
    throw new Error(`Bridge HTTP ${response.status}`);
  }
  return await response.json();
}

async function executeBridgeCommand(cmd) {
  try {
    switch (cmd.action) {
      case "start_posting":
        return await bridgeStartPosting(cmd.payload || {});
      case "stop_posting":
        await stopPostingProcess();
        return { success: true, result: { stopped: true } };
      case "open":
        return await bridgeOpen(cmd.payload || {});
      case "click":
        return await bridgeClick(cmd.payload || {});
      case "list_templates":
        return await bridgeListTemplates();
      case "list_groups":
        return await bridgeListGroups();
      case "upsert_template":
        return await bridgeUpsertTemplate(cmd.payload || {});
      case "delete_template":
        return await bridgeDeleteTemplate(cmd.payload || {});
      case "upsert_group_collection":
        return await bridgeUpsertGroupCollection(cmd.payload || {});
      case "delete_group_collection":
        return await bridgeDeleteGroupCollection(cmd.payload || {});
      case "update_settings":
        await chrome.storage.local.set({
          defaultRemoteSettings: cmd.payload || {},
        });
        return { success: true };
      case "get_status": {
        const status = await buildBridgeStatus();
        return { success: true, result: status };
      }
      default:
        return { success: false, error: "Unknown action" };
    }
  } catch (error) {
    return { success: false, error: error.message || String(error) };
  }
}

async function bridgeStartPosting(payload) {
  const {
    postIds,
    groupCollectionIds,
    postingMethod,
    settingsOverrides,
    posts,
    groups,
    groupLinks,
  } = payload || {};

  const storage = await chrome.storage.local.get([
    "defaultRemoteSettings",
    "isPostingInProgress",
  ]);
  if (storage.isPostingInProgress === "started") {
    return { success: false, error: "Posting already in progress" };
  }

  const { tags, groups: storedGroups } = await loadTagsGroupsWithIds();

  let selectedPosts = [];
  let selectedGroups = [];
  let links = [];

  if (Array.isArray(posts) && posts.length > 0) {
    selectedPosts = posts.map((p) => normalizeTemplate(p));
  } else {
    selectedPosts = resolveByIdOrTitle(tags, postIds, "post");
  }

  if (Array.isArray(groupLinks) && groupLinks.length > 0) {
    links = normalizeLinks(groupLinks);
  } else if (Array.isArray(groups) && groups.length > 0) {
    selectedGroups = groups.map((g) => normalizeGroupCollection(g));
    selectedGroups.forEach((g) => {
      if (Array.isArray(g.links)) links.push(...g.links);
    });
  } else {
    selectedGroups = resolveByIdOrTitle(
      storedGroups,
      groupCollectionIds,
      "group",
    );
    selectedGroups.forEach((g) => {
      if (Array.isArray(g.links)) links.push(...g.links);
    });
  }

  if (selectedPosts.length === 0 || links.length === 0) {
    return { success: false, error: "No posts or groups resolved" };
  }

  const settings = {
    ...(storage.defaultRemoteSettings || {}),
    ...(settingsOverrides || {}),
  };
  if (postingMethod) settings.postingMethod = postingMethod;

  const request = {
    action:
      settings.postingMethod === "popup"
        ? "postPosts"
        : "postPostsDirectApi",
    selectedPosts,
    group: { title: "bridge", links },
    settings,
    source: "bridge",
  };

  const { logs } = await handlePostingRequest(request);
  return {
    success: true,
    result: {
      completed: logs.filter((l) => l.response === "successful").length,
      failed: logs.filter((l) => l.response === "failed").length,
      skipped: logs.filter((l) => l.response === "skipped").length,
    },
  };
}

function resolveByIdOrTitle(items, ids, kind) {
  if (!Array.isArray(ids) || ids.length === 0) return [];
  const results = [];
  ids.forEach((id) => {
    let match = null;
    if (id === null || id === undefined) return;
    const idStr = String(id).trim();
    match = items.find((it) => it && it.id && String(it.id) === idStr) || null;
    if (!match && !Number.isNaN(Number(idStr))) {
      const idx = Number(idStr);
      if (items[idx]) match = items[idx];
    }
    if (!match) {
      const candidates = items.filter(
        (it) =>
          it &&
          typeof it.title === "string" &&
          it.title.toLowerCase() === idStr.toLowerCase(),
      );
      if (candidates.length === 1) match = candidates[0];
      if (candidates.length > 1) {
        throw new Error(`Ambiguous ${kind} id: ${idStr}`);
      }
    }
    if (!match) {
      throw new Error(`Unknown ${kind} id: ${idStr}`);
    }
    results.push(match);
  });
  return results;
}

async function stopPostingProcess() {
  await setPostingState({ stopRequested: true });
  updatePostingStatus(`Stop signal received. Finishing current step...`);
}

async function bridgeListTemplates() {
  const { tags } = await loadTagsGroupsWithIds();
  return {
    success: true,
    result: tags.map((t, index) => ({
      id: t.id || null,
      title: t.title || "",
      index,
    })),
  };
}

async function bridgeListGroups() {
  const { groups } = await loadTagsGroupsWithIds();
  return {
    success: true,
    result: groups.map((g, index) => ({
      id: g.id || null,
      title: g.title || "",
      index,
    })),
  };
}

async function bridgeUpsertTemplate(payload) {
  const { tags, changed } = await loadTagsGroupsWithIds();
  const incoming = normalizeTemplate(payload || {});
  if (!incoming.title) {
    return { success: false, error: "Template title is required" };
  }

  let updated = false;
  for (let i = 0; i < tags.length; i++) {
    const t = tags[i];
    if (
      (incoming.id && t.id === incoming.id) ||
      t.title.toLowerCase() === incoming.title.toLowerCase()
    ) {
      tags[i] = { ...t, ...incoming, id: t.id || incoming.id };
      updated = true;
      break;
    }
  }

  if (!updated) {
    const newItem = { ...incoming, id: incoming.id || generateItemId("tag") };
    tags.push(newItem);
  }

  await chrome.storage.local.set({ tags });
  return { success: true };
}

async function bridgeDeleteTemplate(payload) {
  const idOrTitle = payload?.id || payload?.title;
  if (!idOrTitle) {
    return { success: false, error: "Missing id or title" };
  }
  const { tags } = await loadTagsGroupsWithIds();
  const idStr = String(idOrTitle).trim().toLowerCase();
  const next = tags.filter((t) => {
    const matchId = t.id && String(t.id).toLowerCase() === idStr;
    const matchTitle =
      t.title && String(t.title).toLowerCase() === idStr;
    return !(matchId || matchTitle);
  });
  await chrome.storage.local.set({ tags: next });
  return { success: true };
}

async function bridgeUpsertGroupCollection(payload) {
  const { groups } = await loadTagsGroupsWithIds();
  const incoming = normalizeGroupCollection(payload || {});
  if (!incoming.title) {
    return { success: false, error: "Group collection title is required" };
  }

  let updated = false;
  for (let i = 0; i < groups.length; i++) {
    const g = groups[i];
    if (
      (incoming.id && g.id === incoming.id) ||
      g.title.toLowerCase() === incoming.title.toLowerCase()
    ) {
      groups[i] = { ...g, ...incoming, id: g.id || incoming.id };
      updated = true;
      break;
    }
  }

  if (!updated) {
    const newItem = {
      ...incoming,
      id: incoming.id || generateItemId("group"),
    };
    groups.push(newItem);
  }

  await chrome.storage.local.set({ groups });
  return { success: true };
}

async function bridgeDeleteGroupCollection(payload) {
  const idOrTitle = payload?.id || payload?.title;
  if (!idOrTitle) {
    return { success: false, error: "Missing id or title" };
  }
  const { groups } = await loadTagsGroupsWithIds();
  const idStr = String(idOrTitle).trim().toLowerCase();
  const next = groups.filter((g) => {
    const matchId = g.id && String(g.id).toLowerCase() === idStr;
    const matchTitle =
      g.title && String(g.title).toLowerCase() === idStr;
    return !(matchId || matchTitle);
  });
  await chrome.storage.local.set({ groups: next });
  return { success: true };
}

async function getActiveTabId() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs && tabs[0] ? tabs[0].id : null;
}

async function bridgeOpen(payload) {
  const url = (payload && payload.url) || "";
  if (!url) return { success: false, error: "Missing url" };
  const active =
    typeof payload.active === "boolean" ? payload.active : true;
  const tab = await chrome.tabs.create({ url, active });
  return { success: true, result: { tabId: tab.id, url } };
}

async function bridgeClick(payload) {
  const selector = payload?.selector || null;
  const text = payload?.text || null;
  const tabId = payload?.tabId || (await getActiveTabId());

  if (!tabId) return { success: false, error: "No active tab" };
  if (!selector && !text)
    return { success: false, error: "Missing selector or text" };

  const results = await chrome.scripting.executeScript({
    target: { tabId },
    func: (sel, txt) => {
      let el = null;
      if (sel) el = document.querySelector(sel);
      if (!el && txt) {
        const candidates = Array.from(
          document.querySelectorAll(
            'button, a, [role="button"], [role="link"], input[type="button"], input[type="submit"]',
          ),
        );
        const needle = txt.trim();
        el = candidates.find((c) => {
          const label =
            (c.innerText || c.value || c.getAttribute("aria-label") || "").trim();
          return label === needle;
        });
      }
      if (!el) return { clicked: false, reason: "not_found" };
      el.click();
      return { clicked: true };
    },
    args: [selector, text],
  });

  const result = results && results[0] ? results[0].result : null;
  if (!result || !result.clicked) {
    return { success: false, error: "Element not found" };
  }
  return { success: true, result: { clicked: true } };
}

async function buildBridgeStatus() {
  const data = await chrome.storage.local.get([
    "isPostingInProgress",
    "postingStatus",
    "latestPostLog",
    "postingSummary",
  ]);
  return {
    isPosting: data.isPostingInProgress === "started",
    currentStatus: data.postingStatus || "",
    lastRun: data.postingSummary || null,
    latestPostLog: data.latestPostLog || null,
  };
}

async function sendBridgeStatus(force) {
  const config = await ensureBridgeConfig();
  if (!config.enabled || !config.baseUrl || !config.apiKey) return;

  const { bridgeLastStatusSentAt } =
    await chrome.storage.local.get("bridgeLastStatusSentAt");
  const now = Date.now();
  if (!force && bridgeLastStatusSentAt && now - bridgeLastStatusSentAt < 15000) {
    return;
  }

  const clientId = await ensureBridgeClientId();
  const status = await buildBridgeStatus();
  await bridgeFetchJson(`${config.baseUrl}/v1/status`, config.apiKey, {
    method: "POST",
    body: JSON.stringify({ clientId, ...status }),
  });
  await chrome.storage.local.set({ bridgeLastStatusSentAt: now });
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.bridgeConfig) {
    initBridge();
  }
});

// --------------- BEGIN Rule Management System ---------------
let currentRuleId = null;
let fbTabId = null;

// in background.js
// ACTION: Replace the entire createTab function with this version.

async function createTab(url, isActive = false, isPosting = false) {
  const MAX_RETRIES = 3;
  const TAB_LOAD_TIMEOUT = 60000;
  const NUDGE_DELAY = 5000; // 5s wait for redirects to settle

  // Helper to extract numeric Group ID from Facebook URL
  // This allows us to match https://www.facebook.com/groups/123
  // with https://web.facebook.com/groups/123 regardless of subdomain
  const getGroupId = (link) => {
    try {
      const match = link.match(/\/groups\/(\d+)/);
      return match ? match[1] : null;
    } catch (e) {
      return null;
    }
  };

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    console.log(
      `[createTab] Attempt ${attempt}/${MAX_RETRIES} to create tab for: ${url}`,
    );
    let resourceToCloseOnError = null;

    try {
      const resource = await new Promise((resolveCreate, rejectCreate) => {
        let listener = null;
        let removeListener = null;
        let timeoutId = null;
        let nudgeTimeoutId = null;

        const cleanup = () => {
          if (timeoutId) clearTimeout(timeoutId);
          if (nudgeTimeoutId) clearTimeout(nudgeTimeoutId);
          if (listener) chrome.tabs.onUpdated.removeListener(listener);
          if (removeListener)
            chrome.tabs.onRemoved.removeListener(removeListener);
        };

        const creationCallback = (windowOrTab) => {
          if (chrome.runtime.lastError) {
            cleanup();
            return rejectCreate(new Error(chrome.runtime.lastError.message));
          }
          if (!windowOrTab) {
            cleanup();
            return rejectCreate(
              new Error("Failed to create window or tab. Resource was null."),
            );
          }

          // Handle difference between windows.create (returns window with tabs array) and tabs.create (returns tab)
          const tab = isPosting ? windowOrTab.tabs[0] : windowOrTab;

          if (!tab || typeof tab.id === "undefined") {
            cleanup();
            return rejectCreate(
              new Error("Resource created but no valid tab ID found."),
            );
          }

          // Prevent Chrome from discarding this tab to save memory while we are using it
          chrome.tabs.update(tab.id, { autoDiscardable: false });

          const resourceObject = {
            type: "tab",
            id: tab.id,
            windowId: isPosting ? windowOrTab.id : null,
          };
          resourceToCloseOnError = resourceObject;

          // Fail-safe timeout
          timeoutId = setTimeout(() => {
            cleanup();
            rejectCreate(
              new Error(
                `Tab creation and navigation timed out after ${
                  TAB_LOAD_TIMEOUT / 1000
                }s.`,
              ),
            );
          }, TAB_LOAD_TIMEOUT);

          // Nudge logic: If tab stays on about:blank, force navigation
          nudgeTimeoutId = setTimeout(() => {
            chrome.tabs.get(tab.id, (currentTabInfo) => {
              if (
                currentTabInfo &&
                (currentTabInfo.url === "about:blank" || !currentTabInfo.url)
              ) {
                console.warn(
                  `[createTab] Tab ${tab.id} appears stuck. Nudging navigation to ${url}`,
                );
                chrome.tabs.update(tab.id, { url });
              }
            });
          }, NUDGE_DELAY);

          listener = (updatedTabId, changeInfo, updatedTab) => {
            if (updatedTabId !== tab.id) return;

            const isFacebook = (updatedTab.url || "").includes("facebook.com");
            const isReady = changeInfo.status === "complete";

            // If we are navigating to Facebook, wait for 'complete' status
            if (isFacebook && isReady) {
              console.log(
                `[createTab] Tab ${tab.id} successfully loaded Facebook URL: ${updatedTab.url}`,
              );
              cleanup();
              resolveCreate(resourceObject);
            }
            // If it's a non-Facebook URL (rare), just check for completeness
            else if (!url.includes("facebook.com") && isReady) {
              console.log(`[createTab] Tab ${tab.id} loaded generic URL.`);
              cleanup();
              resolveCreate(resourceObject);
            }
          };

          removeListener = (removedTabId) => {
            if (removedTabId === tab.id) {
              cleanup();
              rejectCreate(new Error(`Tab ${tab.id} was closed prematurely.`));
            }
          };

          chrome.tabs.onUpdated.addListener(listener);
          chrome.tabs.onRemoved.addListener(removeListener);
        };

        if (isPosting) {
          // Posting window logic: Create a popup window
          chrome.windows.create(
            {
              url: "about:blank", // Start blank, then navigate (more reliable for some extensions)
              type: "popup",
              width: 600,
              height: 700,
              focused: false,
            },
            creationCallback,
          );
        } else {
          // Standard tab logic
          chrome.tabs.create({ url, active: isActive }, creationCallback);
        }
      });

      // --- VERIFICATION PHASE ---
      const finalTab = await chrome.tabs.get(resource.id);

      const intendedGroupId = getGroupId(url);
      const actualGroupId = getGroupId(finalTab.url);

      // 1. Check if stuck on about:blank
      if (finalTab.url === "about:blank") {
        console.warn("[createTab] Tab stuck on about:blank. Forcing update.");
        await chrome.tabs.update(finalTab.id, { url: url });
      }
      // 2. ID Match Check (Primary Robust Check)
      else if (intendedGroupId && actualGroupId) {
        if (intendedGroupId === actualGroupId) {
          // IDs match perfectly. This covers www -> web, m -> www, etc.
          console.log(
            `[createTab] Verified Group ID match: ${intendedGroupId}`,
          );
        } else {
          // IDs exist but don't match. Could be a redirect to home feed or another group.
          console.warn(
            `[createTab] Redirect warning: Group ID mismatch. Wanted ${intendedGroupId}, got ${actualGroupId}. Proceeding as it might be a login flow.`,
          );
        }
      }
      // 3. Domain Check (Fallback if no ID found)
      else if (finalTab.url.includes("facebook.com")) {
        // We are on Facebook, assume it's valid.
      }
      // 4. Invalid Protocol Check
      else if (!finalTab.url.startsWith("http")) {
        throw new Error(`Tab navigated to invalid protocol: ${finalTab.url}`);
      }

      // Check if we can execute scripts (permission check)
      try {
        await chrome.scripting.executeScript({
          target: { tabId: finalTab.id },
          func: () => document.readyState,
        });
      } catch (e) {
        throw new Error(`Cannot execute scripts on page (${finalTab.url}).`);
      }

      // Window Positioning and Injection for Posting Mode
      if (isPosting && resource.windowId) {
        try {
          const results = await chrome.scripting.executeScript({
            target: { tabId: finalTab.id },
            func: () => ({
              width: window.screen.availWidth,
              height: window.screen.availHeight,
            }),
          });

          if (results && results[0] && results[0].result) {
            const screen = results[0].result;
            const winWidth = 600;
            const winHeight = 700;
            const leftPos = Math.floor(screen.width - winWidth);
            const topPos = Math.floor(screen.height - winHeight);

            await chrome.windows.update(resource.windowId, {
              left: leftPos,
              top: topPos,
              width: winWidth,
              height: winHeight,
              focused: true,
              state: "normal",
            });
          }
        } catch (posError) {
          console.warn("Could not auto-position window:", posError);
          await chrome.windows.update(resource.windowId, { focused: true });
        }

        console.log(
          `[createTab] Injecting always-active scripts into posting tab ${finalTab.id}`,
        );
        await chrome.scripting.executeScript({
          target: { tabId: finalTab.id },
          files: ["alwaysActive.js"],
          world: "MAIN",
        });
        await chrome.scripting.executeScript({
          target: { tabId: finalTab.id },
          files: ["alwaysActiveIsolated.js"],
          world: "ISOLATED",
        });

        // Only force update URL if we are NOT on facebook (e.g. still about:blank after init)
        if (!finalTab.url.includes("facebook.com")) {
          await chrome.tabs.update(finalTab.id, { url: url });
        }
      }

      return resource;
    } catch (error) {
      console.warn(`[createTab] Attempt ${attempt} failed: ${error.message}`);
      if (resourceToCloseOnError) {
        await closeTab(resourceToCloseOnError);
      }

      if (attempt === MAX_RETRIES) {
        throw new Error(
          `Failed to create tab after ${MAX_RETRIES} attempts: ${error.message}`,
        );
      } else {
        await uninterruptibleSleep(2);
      }
    }
  }
}

async function closeTab(resource) {
  if (!resource || !resource.type || typeof resource.id === "undefined") {
    console.error("Invalid resource object passed to closeTab:", resource);
    return;
  }

  try {
    // If a windowId exists (meaning it's a popup window), close the window.
    if (resource.windowId) {
      await chrome.windows.remove(resource.windowId);
      console.log(
        `Popup window ${resource.windowId} (containing tab ${resource.id}) closed successfully.`,
      );
    } else {
      // Otherwise, it's just a regular tab.
      await chrome.tabs.remove(resource.id);
      console.log(`Tab with ID ${resource.id} closed successfully.`);
    }
  } catch (error) {
    // This prevents the entire process from crashing if a window/tab was already closed.
    if (
      !error.message.includes("No tab with id") &&
      !error.message.includes("No window with id")
    ) {
      console.error(
        `Error closing resource (window: ${resource.windowId}, tab: ${resource.id}):`,
        error.message,
      );
    } else {
      // This is a common and safe-to-ignore condition.
      console.log(
        `Resource (window: ${resource.windowId}, tab: ${resource.id}) was already closed.`,
      );
    }
  }
}

// --------------- BEGIN Event Listeners ---------------

chrome.tabs.onRemoved.addListener(async (tabId) => {
  const key = `injected-${tabId}`;
  chrome.storage.local.remove(key, () => {
    if (chrome.runtime.lastError) {
      // Suppress error if key doesn't exist
    } else {
      console.log("Injection flag cleared for tab:", tabId);
    }
  });
});

// in background.js
// in background.js
// ACTION: Replace the chrome.action.onClicked listener

chrome.action.onClicked.addListener(async (tab) => {
  // Guard against undefined tab or tab.id
  if (!tab.id) {
    console.warn("Action clicked on a tab without an ID:", tab);
    return;
  }

  try {
    // Attempt to inject the content script. This ensures the script is there.
    // NOTE: This might throw on restricted pages (chrome://, web store), which we catch below.
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"],
    });

    // If injection succeeds, send the message.
    chrome.tabs.sendMessage(tab.id, "OpenAutoPoster", (response) => {
      // Check for errors
      if (chrome.runtime.lastError) {
        const msg = chrome.runtime.lastError.message;

        // *** THE FIX: Ignore the "port closed" error specifically ***
        // This happens if the content script acts successfully but forgets to return a value.
        // It is harmless for a UI toggle action.
        if (
          msg.includes("message port closed") ||
          msg.includes("receiving end does not exist")
        ) {
          // Debug log only, not a warning
          console.log("UI toggle sent (no response received/needed).");
          return;
        }

        // Log actual errors
        console.warn(
          "Could not establish connection with content script:",
          msg,
        );
      }
    });
  } catch (error) {
    // This 'catch' block executes if script injection fails (e.g. on restricted pages)
    console.warn(
      `Failed to inject content script on ${tab.url}. This is expected on restricted pages.`,
      error.message,
    );

    // Fallback: Open the restricted.html popup
    await chrome.action.setPopup({
      tabId: tab.id,
      popup: "restricted.html",
    });

    // Programmatically open the popup immediately
    chrome.action.openPopup();

    // Reset popup setting after a short delay so subsequent clicks re-evaluate
    setTimeout(async () => {
      await chrome.action.setPopup({
        tabId: tab.id,
        popup: "", // Reset to no popup (triggering background logic again next time)
      });
    }, 100);
  }
});

let avoidNightTimePosting = false;
let groupLinks = [];
let remainingGroups = [];

let currentPostIndex = 0;
let currentGroupIndex = 0;
let totalPosts = 0;
let totalGroups = 0;

// in background.js
// ACTION: Replace the entire onMessage listener with this definitive, correct version.

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  (async () => {
    if (request.action === "offscreen_copy") {
      // Handled by offscreen document, not background.
      return;
    }
    console.log("Background Listener -- Received action:", request.action);

    // Handle short-running, immediate responses first
    if (request.action === "directApiPostComplete") {
      handleDirectApiResponse(request, sender);
      return;
    }
    if (request.action === "popupPostComplete") {
      handlePopupResponse(request);
      return;
    }
    if (request.action === "runSchedulerCheck") {
      checkForDueScheduledPosts();
      sendResponse({ success: true });
      return;
    } else if (request.action === "focusTab" && sender.tab) {
      try {
        console.log(
          `Focusing tab ${sender.tab.id} as requested by content script.`,
        );
        // First, make the tab active within its window.
        await chrome.tabs.update(sender.tab.id, { active: true });

        // Then, bring the entire window to the front.
        if (sender.tab.windowId) {
          await chrome.windows.update(sender.tab.windowId, { focused: true });
        }
      } catch (error) {
        console.warn(
          `Could not focus tab ${sender.tab.id}. It may have already closed.`,
          error,
        );
      }
      return;
    }
    if (request.action === "stopPosting") {
      await setPostingState({ stopRequested: true });
      updatePostingStatus(`Stop signal received. Finishing current step...`);
      if (request.manualPause) {
        const pauseUntil = new Date(Date.now() + 5 * 60 * 1000);
        await chrome.storage.local.set({
          schedulerPausedUntil: pauseUntil.toISOString(),
        });
      }
      sendResponse({ stopped: true });
      return;
    }

    try {
      let responseData = { success: true, message: "Action completed." };

      switch (request.action) {
        case "copyToClipboard": {
          try {
            await copyTextWithOffscreen(request.text || "");
            sendResponse({ success: true });
          } catch (e) {
            sendResponse({
              success: false,
              error: e?.message || "Copy failed",
            });
          }
          return;
        }
        case "remoteLog":
          // Prefix with [Content] to distinguish from background logs
          const prefix = `[Content ${sender.tab?.id || "?"}]`;
          if (request.level === "error") {
            console.error(prefix, ...request.args);
          } else if (request.level === "warn") {
            console.warn(prefix, ...request.args);
          } else {
            console.log(prefix, ...request.args);
          }
          break;
        case "postPosts":
        case "postPostsDirectApi":
        case "retryFailedPosts": {
          const isRetry = request.action === "retryFailedPosts";

          const state = await getPostingState();
          const storageStatus = await chrome.storage.local.get(
            "isPostingInProgress",
          );

          // --- SMARTER LOCK CHECK ---
          if (state.isLocked) {
            // If session is locked, but local storage says we are NOT started, it's a stale lock.
            if (storageStatus.isPostingInProgress !== "started") {
              console.warn("Found stale session lock. Auto-releasing.");
              await clearPostingState();
            } else {
              throw new Error("Another posting process is currently active.");
            }
          }
          try {
            await setPostingState({ isLocked: true, stopRequested: false });
            await chrome.storage.local.set({
              isPostingInProgress: "started",
              lastActivityTimestamp: Date.now(),
            });

            await updatePostingProgress("started");

            const handlerFunction = isRetry
              ? handleRetryRequest
              : handlePostingRequest;

            // 1. Execute the Run
            const {
              logs: collectedLogs,
              telemetry: collectedTelemetry,
              wasStopped,
            } = await handlerFunction(request);

            // 2. Determine Final Status
            // Check both the return flag and the session state
            const finalState = await getPostingState();
            const actuallyStopped = wasStopped || finalState.stopRequested;

            let completionStatus = actuallyStopped ? "stopped" : "completed";
            if (
              completionStatus === "completed" &&
              collectedLogs.length > 0 &&
              collectedLogs.every(
                (l) =>
                  l.response !== "successful" &&
                  l.response !== "pending_approval",
              )
            ) {
              completionStatus = "error";
            }

            // 3. Prepare Info Object
            const postsInfo = {
              type: request.source || (isRetry ? "manual_retry" : "manual"),
              scheduleId: request.scheduleId,
              postTitle:
                request.selectedPosts?.[0]?.title ||
                (isRetry ? "Retry Attempt" : "Manual Post"),
              timeCompleted: new Date().toISOString(),
              settings: request.settings || request.originalSettings || {},
              telemetry: collectedTelemetry,
              originalSelectedPosts: request.selectedPosts, // Save specifically for telemetry media count
            };

            // 4. SAVE HISTORY (SINGLE POINT OF TRUTH)
            await finalizePosting(collectedLogs, postsInfo, completionStatus);

            responseData = {
              success: completionStatus === "completed",
              message: `${
                isRetry ? "Retry" : "Manual"
              } posting process finished.`,
              results: collectedLogs,
            };
          } finally {
            // 5. Clean Up
            await clearPostingProcessState();
          }
          break;
        }
        case "groupScrapeCompleted":
          // This message is a signal that the scraping tab has finished its work
          // and will close itself. The background script doesn't need to take
          // any further action, but we must handle the message to prevent it
          // from being treated as an "Unknown action" error.
          console.log(
            "Acknowledged groupScrapeCompleted signal. No action needed.",
          );
          // We simply do nothing and let the listener finish gracefully.
          break;
        // --- Other actions ---
        case "heartbeat":
          sendResponse({ status: "alive" });
          break;
        case "fetchGroups":
          newExtractGroupsWithApi(sender.tab.id);
          responseData.message = "Group extraction process initiated.";
          break;
        case "forceScrapeGroups":
          extractGroupsWithScraping(sender.tab.id);
          responseData.message = "Manual scraping process initiated.";
          break;
        case "autoJoinGroups": {
          const {
            searchParameter,
            groupSizeFilter,
            saveGroupsAfterJoining,
            saveGroupName,
            joinCounter,
          } = request;
          if (!searchParameter)
            throw new Error("Search parameter is required.");
          const searchURL = `https://www.facebook.com/groups/search/groups/?q=${encodeURIComponent(
            searchParameter,
          )}`;
          const { id: tabId } = await createTab(searchURL, true);
          sendMessagetoContent(tabId, {
            action: "startJoiningGroups",
            groupSizeFilter,
            saveGroupsAfterJoining,
            saveGroupName,
            joinCounter,
          });
          responseData.message = "Auto-joining process initiated.";
          break;
        }
        case "activateLicense":
          responseData = await activateLicense(request.licenseKey);
          break;
        case "validateLicense":
          validateLicenseKey(request.licenseKey, request.licenseProvider);
          responseData = { started: true };
          break;
        case "aiEnhancePost":
        case "aiGeneratePost":
          handleAiRequest(
            request.action === "aiEnhancePost"
              ? request.content
              : request.prompt,
            request.options, // Ensure this is passed!
            request.temperature,
            sender.tab?.id,
          );
          break;
        // in background.js
        // ACTION: Replace the 'aiSelectorFallback' case in the onMessage listener.

        // in background.js
        // ACTION: Replace the 'aiSelectorFallback' case.

        case "aiSelectorFallback":
          let systemPrompt = "";
          let userPrompt = "";

          if (request.isRawHtml) {
            // --- HTML MODE (Dialogs) ---
            systemPrompt = `You are an expert UI Automation Engineer. 
      Analyze the provided HTML of a modal dialog. Return a unique CSS selector for the element matching the user's intent.
      Rules:
      1. Prefer 'aria-label', 'role', or specific classes.
      2. Ignore language (look for structure/icons/color hints).
      3. Return JSON: { "selector": "div[aria-label='Post']" }`;

            userPrompt = `Intent: "${request.targetDescription}"\nHTML:\n${request.domSnapshot}`;
          } else {
            // --- LIST MODE (Global Feed) ---
            systemPrompt = `You are an expert UI Automation Engineer.
      Analyze the list of interactive elements. Identify the index of the element matching the user's intent.
      Rules:
      1. Look for "Create Post", "Write something", or the input area at the top of the feed.
      2. Return JSON: { "index": 5 } or { "index": -1 } if not found.`;

            userPrompt = `Intent: "${request.targetDescription}"\nCandidates:\n${request.domSnapshot}`;
          }

          try {
            const aiResponseStr = await callDeepSeekApi(
              userPrompt,
              null,
              0.2,
              systemPrompt,
            );
            const cleanJson = aiResponseStr.replace(/```json|```/g, "").trim();
            const result = JSON.parse(cleanJson);

            // Normalize response
            const responseData = { success: true };
            if (request.isRawHtml) responseData.selector = result.selector;
            else responseData.index = result.index;

            console.log(`[AI Selector] Success. Result:`, result);
            sendResponse(responseData);
          } catch (e) {
            console.error("AI Selector Failed:", e);
            sendResponse({ success: false, error: e.message });
          }
          break;
        case "aiGenerateCampaignStrategy":
          (async () => {
            try {
              const { goal, availableGroups } = request;

              // 1. Construct Group List String for Prompt
              // Limit list to avoid token overflow, formatted as "id: name"
              let groupListString = "";
              if (availableGroups && availableGroups.length > 0) {
                groupListString =
                  "\nAVAILABLE GROUPS LIST:\n" +
                  availableGroups
                    .map((g) => `- ID: "${g.id}", Name: "${g.name}"`)
                    .join("\n");
              }

              // 2. Construct System Prompt for Structured Output
              const systemPrompt = `You are a Marketing Automation Architect and Targeting Specialist. 
    Your task is to design a Facebook Group Posting Campaign.

    TASK 1: CAMPAIGN STRUCTURE
    Design a sequence of posts and wait times.
    - Create 3-5 steps.
    - Always start with a 'post'.
    - Follow 'post' with 'wait' (unless last).
    - 'content' must be high-quality HTML.
    - CRITICAL REQUIREMENT: The 'content' field MUST use Spintax ({Option A|Option B|Option C}) for key phrases, greetings, and calls to action.

    TASK 2: GROUP TARGETING
    Analyze the provided "AVAILABLE GROUPS LIST" against the user's "GOAL".
    - Select the specific groups that are most relevant to the goal.
    - Ignore irrelevant groups (e.g., if goal is "Real Estate", ignore "Funny Cat Memes").
    - If no groups list is provided, ignore this task.
    
    OUTPUT FORMAT:
    Return strictly valid JSON.
    {
        "title": "Campaign Name",
        "targetGroupIds": ["id1", "id2"], // Array of IDs from the list that match the goal. If no list provided, empty array.
        "steps": [
            {
                "type": "post",
                "title": "Step Name",
                "content": "<p>HTML content...</p>",
                "aiVariations": true
            },
            {
                "type": "wait",
                "days": 1,
                "hours": 0
            }
        ]
    }
    
    Do NOT wrap in markdown (\`\`\`json). Return RAW JSON only.
    `;

              const userPrompt = `GOAL: ${goal}\n${groupListString}\n\nCreate strategy and select best groups.`;

              // 3. Call AI
              const jsonStr = await callDeepSeekApi(
                userPrompt,
                null,
                0.5, // Lower temp for logic/selection accuracy
                systemPrompt,
              );

              // 4. Clean and Parse
              const cleanJson = jsonStr.replace(/```json|```/g, "").trim();
              const strategy = JSON.parse(cleanJson);

              sendResponse({ success: true, strategy: strategy });
            } catch (error) {
              console.error("Campaign Wizard Error:", error);
              sendResponse({ success: false, error: error.message });
            }
          })();
          return true; // Keep channel open
        case "groupScrapeCompleted":
          // This case should already exist from our previous fix.
          break;

        case "forceClearState":
          console.warn(
            "FORCE RESET TRIGGERED. Cleaning state and reloading extension.",
          );

          // We don't need to set the stop flag, as the reload will terminate everything.

          // 1. Immediately clean up any known tabs to be safe.
          try {
            const { sharedTabId } = await getPostingState();
            if (sharedTabId) {
              await cleanupSharedBackgroundTab();
            }
          } catch (e) {
            console.warn(
              "Could not clean up shared tab during force reset, it may have already been closed.",
              e,
            );
          }

          // 2. Clear all session and local storage state.
          await clearPostingProcessState();

          // 3. Send a quick confirmation back to the popup *before* reloading.
          // This allows the popup to perform its final actions.
          sendResponse({ success: true });

          // 4. THE KILL SWITCH: Reload the entire extension after a very brief delay.
          // The delay gives the `sendResponse` message time to reach the popup.
          setTimeout(() => {
            chrome.runtime.reload();
          }, 100);

          return; // We've handled the response.
        default:
          throw new Error(`Unknown action received: ${request.action}`);
      }

      sendResponse(responseData);
    } catch (error) {
      console.error("Critical error in onMessage listener:", error.message);
      // This 'catch' now primarily handles setup errors, like the "already active" error.
      // It does NOT need to clear the state, because a new state was never set.
      await updatePostingProgress("done");
      sendResponse({ success: false, error: `Error: ${error.message}` });
    }
  })();

  return true;
});
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "posting-keep-alive") {
    // Keeping this port open prevents the Service Worker from sleeping
    // while a post is being processed in the content script.
    port.onDisconnect.addListener(() => {
      // Connection closed, SW can sleep now if idle.
    });
  }
});
// (Keep all existing code below this point)
// --- END OF FILE background.js ---

function shouldApplyDelay(currentGroupIndex, groupNumberForDelay) {
  return (currentGroupIndex + 1) % groupNumberForDelay === 0;
}
function isLastPostAndGroup(postIdx, totalPosts, groupIdx, totalGroups) {
  return postIdx + 1 === totalPosts && groupIdx + 1 === totalGroups;
}
async function uninterruptibleSleep(seconds) {
  await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}
// NEW, MORE RELIABLE SLEEP FUNCTION FOR SERVICE WORKERS
async function sleep(seconds) {
  const keepAliveInterval = 15; // Interact with a Chrome API every 15 seconds
  const endTime = Date.now() + seconds * 1000;

  while (Date.now() < endTime) {
    const remainingTime = endTime - Date.now();
    const waitTime = Math.min(remainingTime, keepAliveInterval * 1000);

    if (waitTime <= 0) break;

    // Wait for the calculated time
    await new Promise((resolve) => setTimeout(resolve, waitTime));

    // After waiting, perform a "heartbeat" to keep the service worker alive
    // Getting storage is a lightweight and effective way to do this.
    try {
      await chrome.storage.local.get(null);
    } catch (e) {
      // This might happen if the extension context is invalidated.
      // The loop will break naturally.
      console.warn(
        "Heartbeat failed during sleep, context might be closing.",
        e,
      );
    }
  }
}
function updatePostingStatus(message) {
  chrome.storage.local.set({ postingStatus: message }, function () {
    console.log("Posting status updated:", message);
  });
}

async function updatePostingProgress(status) {
  await chrome.storage.local.set({ isPostingInProgress: status });
  console.log("Posting progress updated:", status);
}

async function sendMessagetoContent(tabId, contentAction) {
  chrome.tabs.sendMessage(tabId, contentAction);
  console.log("Content posting message sent:", contentAction);
  await sleep(5);
}

// in background.js
// ACTION: Replace the finalizePosting function

async function finalizePosting(
  finalLogs,
  postsInfo = {},
  completionStatus = "completed",
) {
  const logsToSave = Array.isArray(finalLogs) ? finalLogs : [];

  const successful = logsToSave.filter(
    (log) =>
      log.response === "successful" || log.response === "pending_approval",
  ).length;
  const failedOrSkipped = logsToSave.length - successful;

  console.log(
    `Finalizing: ${completionStatus}. Success: ${successful}, Fail/Skip: ${failedOrSkipped}`,
  );

  try {
    // This is the ONE place where history is saved
    await savePostingHistory(logsToSave, postsInfo);

    // Update state for UI to pick up "done"
    await chrome.storage.local.set({
      postsCompleted: logsToSave,
      postingSummary: {
        successful,
        failed: failedOrSkipped,
        completedAt: new Date().toISOString(),
        completionStatus,
      },
      latestRunTelemetry: postsInfo.telemetry || {},
    });

    await uninterruptibleSleep(0.15);

    const statusMsg =
      completionStatus === "stopped"
        ? "Posting stopped by user."
        : "Posting completed.";
    updatePostingStatus(statusMsg);

    // This triggers the popup listener
    await updatePostingProgress("done");
  } catch (error) {
    console.error("Error during finalizePosting:", error);
    // Force unlock on error
    await updatePostingProgress("done");
  }
}

async function clearPostingProcessState() {
  try {
    // 1. Clean up tab if it exists (Safety Net)
    const state = await getPostingState();
    if (state.sharedTabId) {
      console.log("Safety Net: Cleaning up lingering shared tab.");
      await cleanupSharedBackgroundTab().catch(() => {});
    }

    // 2. Clear Lock
    await clearPostingState();

    // 3. Clear Local Storage
    await chrome.storage.local.remove([
      "isPostingInProgress",
      "postingStatus",
      "liveLogEntries",
      "latestPostLog",
      "lastActivityTimestamp", // Clean this up too
    ]);
    console.log("Cleared all transient posting state.");
  } catch (error) {
    console.error("Error during posting state cleanup:", error);
  }
}

// function finalizePosting(postsCompleted) {
//   console.log(`postsCompleted`, postsCompleted);
//   console.log(`posting has been finalized, removed overlay`);
//   chrome.storage.local.set({ postsCompleted: postsCompleted }, () => {
//     console.log("postsCompleted saved");
//   });
//   updatePostingStatus(`Posting was successful.`);
//   updatePostingProgress("done");
// }

// Setup alarm when extension loads or updates
chrome.runtime.onInstalled.addListener((details) => {
  console.log("Extension installed/updated. Setting up schedule check alarm.");
  // Create alarm to check every minute (adjust frequency as needed)
  chrome.alarms.create(SCHEDULE_CHECK_ALARM, {
    delayInMinutes: 1, // Start checking after 1 minute
    periodInMinutes: 1, // Check every 1 minute thereafter
  });

  // Initialize storage if needed (e.g., default free posts) - Keep your existing logic here
  if (details.reason === "install") {
    chrome.storage.local.set({ tutorialShown: false }, () => {
      console.log("Set tutorialShown flag to false for new install.");
    });
    ensureLicenseBypass();
    // No external welcome page in standalone mode
    const samplePosts = [
      {
        title: "Welcome to Auto Poster!",
        text: "<p>🚀 <strong>Hey everyone!</strong></p><p><br></p><p>I'm excited to share {something amazing|this great opportunity|some valuable insights} with this group today!</p><p><br></p><p>Have you ever wondered how to {save time posting to Facebook groups|automate your social media workflow|reach more people with less effort}?</p><p><br></p><p>Let me know in the comments if you'd like to learn more about {increasing your online visibility|growing your audience|saving hours of work every week}!</p><p><br></p><p>👇 Drop a comment with \"YES\" if you're interested!</p>",
        images: [],
        links: [],
        color: "#26927f",
      },
    ];

    // Add sample group collections
    const sampleGroups = [
      {
        title: "Sample Facebook Groups",
        links: [
          ["Facebook", "https://www.facebook.com/"],
          ["My Profile Page", "https://www.facebook.com/me"],
        ],
      },
    ];

    // Get existing data first to prevent overwriting
    chrome.storage.local.get(["tags", "groups"], (result) => {
      // Only set sample posts if no existing posts
      if (!result.tags || result.tags.length === 0) {
        chrome.storage.local.set({ tags: samplePosts }, () => {
          console.log("Sample post templates added");
        });
      }

      // Only set sample groups if no existing groups
      if (!result.groups || result.groups.length === 0) {
        chrome.storage.local.set({ groups: sampleGroups }, () => {
          console.log("Sample group collection added");
        });
      }
    });
  }
  if (details.reason === "update") {
    // migrateOldData(); // Keep your migration logic if needed
    chrome.storage.local.remove(["iframeWidth", "iframeHeight"], () => {
      console.log("Reset iframe dimensions to default values.");
    });
  }
});

// In background.js

// in background.js
// ACTION: Replace the checkForDueScheduledPosts function

async function checkForDueScheduledPosts() {
  // console.log("Checking for due/missed posts...");
  try {
    await processActiveCampaigns();
  } catch (e) {
    console.error("Error in Campaign Engine cycle:", e);
  }
  try {
    const data = await chrome.storage.local.get([
      "isPostingInProgress",
      "scheduledPosts",
      "missedRecurringNotifications",
      "schedulerPausedUntil",
      "lastActivityTimestamp",
    ]);

    const now = Date.now();

    // --- SELF-HEALING LOGIC (The Fix) ---
    if (data.isPostingInProgress === "started") {
      const lastActivity = data.lastActivityTimestamp || 0;
      // 15 minutes timeout (900,000 ms)
      if (now - lastActivity > 10 * 60 * 1000) {
        console.warn(
          "Detected stale posting process (inactive > 15m). Force-clearing lock.",
        );

        // Clear the lock so the scheduler can proceed immediately
        await clearPostingProcessState();

        // Optional: Log a system event or notify the user next time they open popup
        // (For now, we just silently recover so the next post can run)
      } else {
        console.log(
          "Posting currently in progress (active). Skipping execution check.",
        );
        return;
      }
    }
    // ------------------------------------

    if (
      data.schedulerPausedUntil &&
      new Date(data.schedulerPausedUntil) > new Date()
    ) {
      console.log(
        `Scheduler is manually paused. Resumes at ${new Date(
          data.schedulerPausedUntil,
        ).toLocaleTimeString()}. Skipping check.`,
      );
      return;
    }

    if (!data.scheduledPosts || data.scheduledPosts.length === 0) {
      return;
    }

    let scheduledPosts = data.scheduledPosts;
    let missedRecurringNotifications = data.missedRecurringNotifications || [];
    let wasModified = false;

    const GRACE_PERIOD_MS = 5 * 60 * 1000; // 5 minutes
    const missedThreshold = new Date(now - GRACE_PERIOD_MS);

    scheduledPosts.forEach((post) => {
      if (
        post.status === "scheduled" &&
        new Date(post.nextRunTime) < missedThreshold
      ) {
        wasModified = true;
        if (post.frequency === "once") {
          post.status = "missed";
          console.log(`Flagged one-time post ID ${post.id} as 'missed'.`);
        } else {
          const notifId = `notif_${post.id}_${new Date(
            post.nextRunTime,
          ).getTime()}`;
          if (!missedRecurringNotifications.some((n) => n.id === notifId)) {
            missedRecurringNotifications.push({
              id: notifId,
              postId: post.id,
              title: post.posts[0]?.title || "Recurring Post",
              missedTime: post.nextRunTime,
            });
          }
          post.nextRunTime = calculateNextRunTime(post);
          console.log(
            `Rescheduled missed recurring post ID ${post.id} to ${post.nextRunTime}.`,
          );
        }
      }
    });

    if (wasModified) {
      await chrome.storage.local.set({
        scheduledPosts,
        missedRecurringNotifications,
      });
    }

    const duePost = scheduledPosts
      .filter(
        (p) =>
          p.status === "scheduled" &&
          new Date(p.nextRunTime) <= new Date() &&
          new Date(p.nextRunTime) >= missedThreshold,
      )
      .sort((a, b) => new Date(a.nextRunTime) - new Date(b.nextRunTime))[0];

    if (duePost) {
      console.log(`FOUND DUE POST. Preparing to run post ID ${duePost.id}.`);

      const postIndex = scheduledPosts.findIndex((p) => p.id === duePost.id);
      if (postIndex === -1) return;

      if (scheduledPosts[postIndex].frequency === "once") {
        scheduledPosts[postIndex].status = "completed";
      } else {
        scheduledPosts[postIndex].nextRunTime = calculateNextRunTime(
          scheduledPosts[postIndex],
        );
      }
      scheduledPosts[postIndex].lastRunTime = new Date().toISOString();

      await chrome.storage.local.set({ scheduledPosts });

      await startPostingProcess(duePost);
    }
  } catch (error) {
    const msg = error?.message || String(error);
    if (msg.includes("No SW")) {
      console.warn(
        "checkForDueScheduledPosts skipped: service worker not available.",
      );
      return;
    }
    console.error("Critical error in checkForDueScheduledPosts:", error);
  }
}
// in background.js

async function processActiveCampaigns() {
  const { campaigns, tags, groups, postingHistory, isPostingInProgress } =
    await chrome.storage.local.get([
      "campaigns",
      "tags",
      "groups",
      "postingHistory",
      "isPostingInProgress",
    ]);

  if (!campaigns || campaigns.length === 0) return;

  let hasChanges = false;
  const now = Date.now();

  for (let i = 0; i < campaigns.length; i++) {
    const camp = campaigns[i];

    if (camp.status !== "active") continue;

    // --- LOOP TO PROCESS INSTANT STEPS IMMEDIATELY ---
    // We allow up to 10 transitions in one tick to prevent infinite loops,
    // but ensure Logic/Loop blocks don't cause a 1-minute delay.
    let stepsProcessedThisTick = 0;
    let shouldContinue = true;

    while (shouldContinue && stepsProcessedThisTick < 10) {
      shouldContinue = false; // Default to stop unless we hit an instant transition
      stepsProcessedThisTick++;

      try {
        const stepIndex = camp.currentStepIndex || 0;
        const step = camp.steps[stepIndex];

        // --- END CONDITION ---
        if (!step) {
          const triggerStep = camp.steps[0];
          const isRecurring =
            triggerStep &&
            triggerStep.type === "trigger" &&
            triggerStep.data.type === "scheduled" &&
            triggerStep.data.frequency !== "once";

          if (isRecurring) {
            console.log(
              `[Campaign] "${camp.title}" cycle finished. Resetting for next cycle.`,
            );
            camp.currentStepIndex = 0;
            // We stop here to let the Trigger block logic handle the wait on the next loop/tick
          } else {
            console.log(
              `[Campaign] "${camp.title}" finished all steps. Marking Completed.`,
            );
            camp.status = "completed";
            camp.completedAt = new Date().toISOString();
          }
          hasChanges = true;
          break; // Stop processing this campaign
        }

        if (!camp.runtimeData) camp.runtimeData = {};
        const stepId = `${camp.id}_step_${step.id}`;

        // --- BLOCK: TRIGGER ---
        if (step.type === "trigger") {
          if (step.data.type === "immediate") {
            camp.currentStepIndex++;
            hasChanges = true;
            shouldContinue = true; // Instant! Move to next.
          } else {
            // Scheduled Logic
            if (!camp.nextRunTime) {
              // If missing nextRunTime, assume immediate or broken state and advance
              camp.currentStepIndex++;
              hasChanges = true;
              shouldContinue = true;
            } else {
              const runTime = new Date(camp.nextRunTime).getTime();

              if (now >= runTime) {
                console.log(`[Campaign] "${camp.title}" Trigger time reached!`);

                // Calculate NEXT occurrence if recurring
                if (step.data.frequency && step.data.frequency !== "once") {
                  const mockPost = {
                    frequency: step.data.frequency,
                    scheduleTime: step.data.scheduleTime,
                    weekdays: step.data.weekdays || [],
                    monthDays: step.data.monthDays || [],
                    // Pass current target as base
                    nextRunTime: camp.nextRunTime,
                  };
                  camp.nextRunTime = calculateNextRunTime(mockPost);
                  console.log(
                    `[Campaign] Next run scheduled for: ${camp.nextRunTime}`,
                  );
                } else {
                  camp.nextRunTime = null;
                }

                camp.currentStepIndex++;
                hasChanges = true;
                shouldContinue = true; // Instant! Move to next.
              }
              // Else: Wait. Time hasn't arrived. Stop loop.
            }
          }
        }

        // --- BLOCK: WAIT ---
        else if (step.type === "wait") {
          if (!camp.waitTargetTime) {
            // Start the timer
            const waitMinutes = step.data.totalMinutes || 1;
            camp.waitTargetTime = now + waitMinutes * 60 * 1000;
            console.log(
              `[Campaign] "${camp.title}" starting ${waitMinutes}m wait.`,
            );
            hasChanges = true;
            // Stop loop. We must wait.
          } else if (now >= camp.waitTargetTime) {
            // Timer done!
            console.log(`[Campaign] "${camp.title}" Wait finished.`);
            camp.waitTargetTime = null;
            camp.currentStepIndex++;
            hasChanges = true;
            shouldContinue = true; // Timer done! Move to next immediately.
          }
          // Else: Still waiting.
        }

        // --- BLOCK: LOOP ---
        else if (step.type === "loop") {
          const { type, targetStepIndex, maxLoops } = step.data;
          const loopKey = `loop_${step.id}`;
          const currentCount = camp.loopCounters[loopKey] || 0;

          if (type === "forever" || currentCount < maxLoops) {
            console.log(
              `[Campaign] Looping back to Step ${targetStepIndex + 1}.`,
            );
            camp.currentStepIndex = targetStepIndex;
            camp.loopCounters[loopKey] = currentCount + 1;
          } else {
            console.log(`[Campaign] Loop max reached. Moving next.`);
            camp.currentStepIndex++;
            camp.loopCounters[loopKey] = 0;
          }
          hasChanges = true;
          shouldContinue = true; // Logic is instant! Keep going.
        }

        // --- BLOCK: STOP ---
        else if (step.type === "stop") {
          camp.status = "completed";
          camp.completedAt = new Date().toISOString();
          hasChanges = true;
          break; // Stop.
        } else if (step.type === "post") {
          if (camp.executionState === "running_post") {
            // ... (Existing completion check logic remains the same) ...
            if (isPostingInProgress !== "started") {
              const latestEntry = postingHistory?.[0];
              if (latestEntry?.postsInfo?.scheduleId === stepId) {
                console.log(`[Campaign] Post Step Success.`);
                camp.executionState = "idle";
                camp.currentStepIndex++;
                hasChanges = true;
                shouldContinue = true;
              } else {
                console.warn(
                  `[Campaign] Post lock cleared but ID mismatch. Moving on.`,
                );
                camp.executionState = "idle";
                camp.currentStepIndex++;
                hasChanges = true;
                shouldContinue = true;
              }
            }
            continue;
          }

          // B. Try to Start
          if (isPostingInProgress === "started") continue; // Busy

          // --- NEW: LICENSE & QUOTA CHECK ---
          const licenseData = await chrome.storage.local.get([
            "licenseVerified",
            "freePostsRemaining",
          ]);
          const isVerified = licenseData.licenseVerified;
          let postsRemaining = licenseData.freePostsRemaining || 0;

          if (!isVerified) {
            if (postsRemaining <= 0) {
              console.warn(
                `[Campaign] Pausing "${camp.title}": No free posts remaining.`,
              );
              camp.status = "paused";
              camp.lastError =
                "Trial limit reached. Please upgrade to continue.";
              hasChanges = true;
              break; // Stop immediately
            }

            // Deduct 1 post for this BLOCK execution
            postsRemaining--;
            await chrome.storage.local.set({
              freePostsRemaining: postsRemaining,
            });
            console.log(
              `[Campaign] Trial deduction. Remaining: ${postsRemaining}`,
            );
          }
          // ----------------------------------

          // Resolve Data
          const resolvedGroups = resolveCampaignGroups(step, camp, groups);
          if (!resolvedGroups || resolvedGroups.length === 0) {
            camp.status = "paused";
            camp.lastError = "No groups found for step.";
            hasChanges = true;
            continue;
          }

          // Save for inheritance
          camp.runtimeData[`groups_step_${step.id}`] = resolvedGroups;

          const resolvedPosts = step.data.postIndices
            .map((idx) => tags[idx])
            .filter(Boolean);
          if (resolvedPosts.length === 0) {
            camp.status = "paused";
            camp.lastError = "No post templates found.";
            hasChanges = true;
            continue;
          }

          const postPayload = {
            id: stepId,
            posts: resolvedPosts,
            groups: [
              {
                title: `Campaign Step ${stepIndex + 1}`,
                links: resolvedGroups,
              },
            ],
            settings: step.data.settings,
          };

          console.log(`[Campaign] Launching Post Step ${stepIndex + 1}...`);
          await startPostingProcess(postPayload);
          camp.executionState = "running_post";
          hasChanges = true;
        }
      } catch (error) {
        console.error(`[Campaign Engine] Error:`, error);
        camp.status = "error";
        camp.lastError = error.message;
        hasChanges = true;
        break;
      }
    } // End While Loop
  }

  if (hasChanges) {
    await chrome.storage.local.set({ campaigns });
  }
}

function resolveCampaignGroups(step, campaign, allGroups) {
  let finalLinks = [];
  const visitedUrls = new Set();

  const addLinks = (links) => {
    links.forEach((link) => {
      if (link && link[1] && !visitedUrls.has(link[1])) {
        visitedUrls.add(link[1]);
        finalLinks.push(link);
      }
    });
  };

  // --- RUNTIME RANDOMIZATION HELPER ---
  const calculateDynamicGroup = (config) => {
    console.log(`[Campaign] Calculating dynamic random groups...`);
    let pool = [];

    if (config.manualLinks) pool.push(...config.manualLinks);

    if (config.collectionIndices) {
      config.collectionIndices.forEach((idx) => {
        if (allGroups[idx] && allGroups[idx].links) {
          pool.push(...allGroups[idx].links);
        }
      });
    }

    // Deduplicate
    const uniqueMap = new Map();
    pool.forEach((link) => uniqueMap.set(link[1], link));
    let uniquePool = Array.from(uniqueMap.values());

    // FRESHNESS PRIORITY LOGIC (If enabled)
    if (config.prioritizeFresh && typeof groupFreshnessCache !== "undefined") {
      uniquePool.sort((a, b) => {
        // Sort by last posted time (oldest/null first)
        const timeA = groupFreshnessCache.get(a[1]) || 0;
        const timeB = groupFreshnessCache.get(b[1]) || 0;
        return timeA - timeB;
      });

      // If prioritizing fresh, we might not want to shuffle everything randomly
      // but rather shuffle the "fresh" subset or pick from top.
      // For now, let's just pick the top X freshest if prioritized.
      return uniquePool.slice(0, config.randomCount);
    }

    // Standard Shuffle (Fisher-Yates)
    for (let i = uniquePool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [uniquePool[i], uniquePool[j]] = [uniquePool[j], uniquePool[i]];
    }

    return uniquePool.slice(0, config.randomCount);
  };

  // --- MAIN RESOLUTION LOGIC ---

  // Case A: Inheritance
  if (step.data.inheritFromStep !== undefined) {
    const parentStepId = step.data.inheritFromStep;

    // Check if the parent step had a DYNAMIC configuration saved
    // We need to look up the parent step's definition in the campaign steps array
    const parentStep = campaign.steps[parentStepId];

    if (parentStep && parentStep.data.groupDataList) {
      // If parent has dynamic rules, re-evaluate them FRESH
      let hasDynamic = false;

      parentStep.data.groupDataList.forEach((gData) => {
        if (gData.type === "dynamic_random") {
          hasDynamic = true;
          const freshSelection = calculateDynamicGroup(gData.config);
          addLinks(freshSelection);
        } else if (gData.type === "index") {
          // Static collections can just be re-read
          const grp = allGroups[gData.value];
          if (grp && grp.links) addLinks(grp.links);
        } else if (gData.type === "raw") {
          if (gData.data && gData.data.links) addLinks(gData.data.links);
        }
      });

      if (hasDynamic) {
        console.log(
          `[Campaign] Step ${step.id} re-calculated dynamic rules from Step ${parentStepId} for fresh results.`,
        );
        return finalLinks;
      }
    }

    // Fallback: If no dynamic rule found (or purely static), use the saved runtime result (Classic Inheritance)
    console.log(
      `[Campaign] Step ${step.id} inheriting static result from Step ${parentStepId}`,
    );
    const inherited = campaign.runtimeData[`groups_step_${parentStepId}`];
    if (inherited && inherited.length > 0) {
      addLinks(inherited);
    }
  }

  // Case B: Explicit Selection (Direct Groups)
  else {
    const groupDataList = step.data.groupDataList || [];

    groupDataList.forEach((gData) => {
      if (gData.type === "index") {
        const grp = allGroups[gData.value];
        if (grp && grp.links) addLinks(grp.links);
      } else if (gData.type === "raw") {
        if (gData.data && gData.data.links) addLinks(gData.data.links);
      } else if (gData.type === "dynamic_random") {
        const selection = calculateDynamicGroup(gData.config);
        addLinks(selection);
      }
    });
  }

  return finalLinks;
}
// in background.js
// ACTION: Replace the handlePostingRequest function

// in background.js
// ACTION: Replace the handlePostingRequest function

async function handlePostingRequest(request) {
  console.log(
    "--- Starting handlePostingRequest (v9 - Scope Safety) ---",
    request.action,
  );
  const runStartTime = performance.now();

  let methodLogs = [];
  let telemetryData = { timings: {}, ui_snapshots: [], errors: [] };
  let finalPosts = [];

  // --- 1. DEFINITIVE SCOPE VARIABLES ---
  // Renamed 'i' to 'currentLoopIndex' to prevent any possible shadowing errors.
  let currentLoopIndex = 0;
  let totalOperations = 0; // Calculated early to be safe

  let preprocessedPosts = [];
  let postOrder = "sequential";
  let groupLinks = [];

  try {
    const isDirectApiMode = request.action === "postPostsDirectApi";
    const isPopupMode = request.action === "postPosts";

    const settings = request.settings || {};
    finalPosts = request.selectedPosts || [];
    const groupData = request.group || { links: [] };

    // --- 2. PRE-CALCULATE TOTALS (Safe Fallback) ---
    groupLinks = groupData.links || [];
    postOrder = settings.postOrder || "sequential";

    if (finalPosts.length > 0 && groupLinks.length > 0) {
      totalOperations =
        postOrder === "sequential"
          ? finalPosts.length * groupLinks.length
          : groupLinks.length;
    }

    // AI VARIATION GENERATION
    if (settings.generateAiVariations && finalPosts.length === 1) {
      await ensureNetworkConnection();
      const aiStartTime = performance.now();
      updatePostingStatus("Generating AI post variations...");
      const originalPost = finalPosts[0];
      const postsWithVariations = [originalPost];

      try {
        for (let j = 0; j < settings.aiVariationCount; j++) {
          if ((await getPostingState()).stopRequested)
            throw new Error("Stop requested");

          await ensureNetworkConnection();
          updatePostingStatus(
            `Generating AI variation ${j + 1} of ${
              settings.aiVariationCount
            }...`,
          );

          const systemMessage = `You are an expert copywriter. Rewrite the following post maintaining the same language, goal, and HTML formatting. 
            CRITICAL RULES:
            1. Output ONLY the raw HTML content of the new variation.
            2. Do NOT include numbering (e.g. "Variation 1:").
            3. Do NOT include markdown code blocks (\`\`\`html).
            4. Do NOT include any conversational filler ("Here is the rewritten post").`;
          const aiContent = await callDeepSeekApi(
            originalPost.text,
            null,
            1.2,
            systemMessage,
          );

          if (aiContent) {
            postsWithVariations.push({
              ...originalPost,
              text: aiContent,
              title: `${originalPost.title} (AI Variation ${j + 1})`,
            });
          }
        }
        finalPosts = postsWithVariations;
        if (finalPosts.length > 1) settings.postOrder = "alternate";

        // Recalculate totals if AI added posts
        if (postOrder === "sequential") {
          totalOperations = finalPosts.length * groupLinks.length;
        }

        telemetryData.timings.aiGenerationMs = performance.now() - aiStartTime;
      } catch (aiError) {
        if (aiError.message === "Stop requested") throw aiError;
        console.error("AI variation generation failed:", aiError.message);
        telemetryData.errors.push({
          source: "ai_variation",
          message: aiError.message,
        });
        finalPosts = request.selectedPosts || [];
      }
    }

    preprocessedPosts = finalPosts;

    // EXECUTION
    if (isDirectApiMode) {
      console.log("Executing run via: Direct API");
      // Direct API handles its own skipping logic internally
      const result = await processPostsDirectApi(
        finalPosts,
        groupData,
        settings,
      );
      methodLogs.push(...result.logs);
      if (result.telemetry) {
        telemetryData.errors.push(...(result.telemetry.errors || []));
        telemetryData.ui_snapshots.push(
          ...(result.telemetry.ui_snapshots || []),
        );
        Object.assign(telemetryData.timings, result.telemetry.timings || {});
      }
    } else if (isPopupMode) {
      console.log("Executing run via: Classic Popup");

      if (preprocessedPosts.length === 0 || groupLinks.length === 0) {
        return {
          logs: [{ response: "skipped", reason: "No posts or groups." }],
          telemetry: telemetryData,
        };
      }

      // --- 3. EXECUTE LOOP USING GLOBAL INDEX ---
      for (
        currentLoopIndex = 0;
        currentLoopIndex < totalOperations;
        currentLoopIndex++
      ) {
        if ((await getPostingState()).stopRequested) break;
        await ensureNetworkConnection();
        // --- SELF-HEALING HEARTBEAT ---
        await chrome.storage.local.set({ lastActivityTimestamp: Date.now() });
        const postIndex =
          postOrder === "sequential"
            ? Math.floor(currentLoopIndex / groupLinks.length)
            : currentLoopIndex % preprocessedPosts.length;
        const groupIndex =
          postOrder === "sequential"
            ? currentLoopIndex % groupLinks.length
            : currentLoopIndex;

        if (!preprocessedPosts[postIndex] || !groupLinks[groupIndex]) continue;

        try {
          const { log, telemetry: singleTelemetry } =
            await executeSinglePopupOrAndroidPost(
              preprocessedPosts[postIndex],
              groupLinks[groupIndex],
              request,
              currentLoopIndex,
              totalOperations,
            );
          methodLogs.push(log);
          if (singleTelemetry) {
            telemetryData.ui_snapshots.push(
              ...(singleTelemetry.ui_snapshots || []),
            );
            telemetryData.errors.push(...(singleTelemetry.errors || []));
          }
          chrome.storage.local.set({ latestPostLog: log });
        } catch (error) {
          if (error.message === "Stop requested") break;
          console.error(
            `Error during classic mode operation ${currentLoopIndex}:`,
            error,
          );
          const errorLog = {
            linkTitle: groupLinks[groupIndex]?.[0] || "N/A",
            linkURL: groupLinks[groupIndex]?.[1] || "N/A",
            postTitle: preprocessedPosts[postIndex].title || "Untitled",
            response: "failed",
            reason: `Execution Error: ${error.message}`,
            timestamp: new Date().toISOString(),
            method: "popup_system_error",
          };
          methodLogs.push(errorLog);
          chrome.storage.local.set({ latestPostLog: errorLog });
        }
      }

      // --- HANDLE SKIPPED POSTS FOR POPUP MODE HERE ---
      if ((await getPostingState()).stopRequested) {
        handleRemainingPostsForLoop(
          currentLoopIndex,
          totalOperations,
          preprocessedPosts,
          groupLinks,
          postOrder,
          methodLogs,
        );
      }
    }
  } catch (error) {
    if (error.message !== "Stop requested") {
      console.error("Unexpected error in handlePostingRequest:", error);
      telemetryData.errors.push({
        source: "handlePostingRequest_toplevel_catch",
        message: error.message,
      });
      methodLogs.push({
        response: "failed",
        reason: `Top-Level Run Error: ${error.message}`,
        timestamp: new Date().toISOString(),
        method: "system_error",
      });
    }

    // --- 4. ROBUST RECOVERY LOGIC ---
    // If methodLogs is empty or incomplete, fill the rest with "Skipped".
    // We rely on 'currentLoopIndex' and 'totalOperations' which are guaranteed defined at top scope.

    // Recalculate fallback data if arrays were empty initially (rare)
    const postsToLog =
      finalPosts.length > 0 ? finalPosts : request.selectedPosts || [];
    const groupsToLog = request.group?.links || [];
    const pOrder = request.settings?.postOrder || "sequential";

    if (
      totalOperations === 0 &&
      postsToLog.length > 0 &&
      groupsToLog.length > 0
    ) {
      totalOperations =
        pOrder === "sequential"
          ? postsToLog.length * groupsToLog.length
          : groupsToLog.length;
    }

    if (methodLogs.length < totalOperations) {
      console.log("Critical error interrupted run. Logging remaining items.");
      // Use currentLoopIndex (defaults to 0 if loop never started)
      handleRemainingPostsForLoop(
        currentLoopIndex,
        totalOperations,
        postsToLog,
        groupsToLog,
        pOrder,
        methodLogs,
      );
    }
  } finally {
    telemetryData.timings.totalRunMs = performance.now() - runStartTime;
  }

  return { logs: methodLogs, telemetry: telemetryData };
}
// For your convenience, here is the complete, final version of the function to copy-paste:
async function executeClassicModeRun(request, postsToUse) {
  console.log("Executing full run in Classic Mode.");
  const logs = [];
  const telemetry = { timings: {}, ui_snapshots: [], errors: [] };

  const settings = request.settings || {};
  const finalPosts = postsToUse || request.selectedPosts || [];
  const groupData = request.group || { links: [] };
  const selectedGroups = groupData.links || [];
  const totalPosts = finalPosts.length;
  const totalGroups = selectedGroups.length;
  const postOrder = settings.postOrder || "sequential";
  const totalOperations =
    postOrder === "sequential" ? totalPosts * totalGroups : totalGroups;

  if (totalPosts === 0 || totalGroups === 0) {
    return {
      logs: [
        {
          response: "skipped",
          reason: "No posts or groups for Classic Mode run.",
        },
      ],
      telemetry,
    };
  }

  let i = 0;

  for (i = 0; i < totalOperations; i++) {
    await ensureNetworkConnection();
    // ---------------------

    // --- SELF-HEALING HEARTBEAT ---
    await chrome.storage.local.set({ lastActivityTimestamp: Date.now() });
    if ((await getPostingState()).stopRequested) {
      break;
    }

    const postIndex =
      postOrder === "sequential" ? Math.floor(i / totalGroups) : i % totalPosts;
    const groupIndex = postOrder === "sequential" ? i % totalGroups : i;

    const currentPost = { ...finalPosts[postIndex] };
    const groupLink = selectedGroups[groupIndex];

    try {
      const { log, telemetry: singleTelemetry } =
        await executeSinglePopupOrAndroidPost(
          currentPost,
          groupLink,
          request,
          i,
          totalOperations,
        );
      logs.push(log);
      if (singleTelemetry) {
        telemetry.ui_snapshots.push(...(singleTelemetry.ui_snapshots || []));
        telemetry.errors.push(...(singleTelemetry.errors || []));
      }
      chrome.storage.local.set({ latestPostLog: log });
    } catch (error) {
      // *** THE FIX IS HERE ***
      if (error.message === "Stop requested") {
        // A delay was interrupted. Break the loop cleanly. The logic after the loop will handle logging skipped posts.
        break;
      }

      // Handle other potential errors from the single post function
      console.error(`Error during classic mode operation ${i}:`, error);
      const errorLog = {
        linkTitle: groupLink?.[0] || "N/A",
        linkURL: groupLink?.[1] || "N/A",
        postTitle: currentPost.title || "Untitled Post",
        response: "failed",
        reason: `Execution Error: ${error.message}`,
        timestamp: new Date().toISOString(),
        method: "popup_system_error",
      };
      logs.push(errorLog);
      chrome.storage.local.set({ latestPostLog: errorLog });
    }
  }

  if ((await getPostingState()).stopRequested) {
    handleRemainingPostsForLoop(
      i,
      totalOperations,
      finalPosts,
      selectedGroups,
      postOrder,
      logs,
    );
  }

  return { logs, telemetry };
}
// ACTION: Replace the savePostingHistory function
async function savePostingHistory(completedPosts, postsInfo) {
  const logs = Array.isArray(completedPosts) ? completedPosts : [];

  const historyEntry = {
    id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    postsCompleted: logs,
    summary: {
      successful: logs.filter(
        (post) =>
          post.response === "successful" ||
          post.response === "pending_approval",
      ).length,
      failed: logs.filter(
        (post) =>
          post.response !== "successful" &&
          post.response !== "pending_approval",
      ).length,
      completedAt: new Date().toISOString(),
    },
    // *** FIX: Ensure postsInfo (which contains telemetry) is saved correctly ***
    postsInfo: postsInfo || {},
  };

  try {
    const result = await chrome.storage.local.get(["postingHistory"]);
    const history = result.postingHistory || [];
    history.unshift(historyEntry);
    const trimmedHistory = history.slice(0, 50);
    await chrome.storage.local.set({ postingHistory: trimmedHistory });
    console.log(
      `Posting history saved for ${postsInfo.type || "entry"}. ID: ${
        historyEntry.id
      }`,
    );
  } catch (error) {
    console.error("Error saving posting history:", error);
  }
}

function handleRemainingPostsForLoop(
  startIndex,
  totalOperations,
  posts,
  groups,
  postOrder,
  logArray,
) {
  if (startIndex >= totalOperations) {
    return; // Nothing to do if the loop finished normally.
  }

  console.log(
    `Stop request processed. Logging remaining ${
      totalOperations - startIndex
    } operations as 'skipped'.`,
  );

  for (let i = startIndex; i < totalOperations; i++) {
    // Recalculate the post and group index for the skipped operation
    const postIndex =
      postOrder === "sequential"
        ? Math.floor(i / groups.length)
        : i % posts.length;
    const groupIndex = postOrder === "sequential" ? i % groups.length : i;

    // Safety check to prevent errors if indices are somehow out of bounds
    if (posts[postIndex] && groups[groupIndex]) {
      logArray.push({
        linkTitle: groups[groupIndex][0] || "N/A",
        linkURL: groups[groupIndex][1] || "N/A",
        postTitle: posts[postIndex].title || "Untitled Post",
        response: "skipped",
        reason: "Stopped by user",
        timestamp: new Date().toISOString(),
        method: "system_stop",
      });
    }
  }
  console.log("Finished logging skipped posts.");
}

// in background.js
// ACTION: Replace startPostingProcess
// in background.js
// ACTION: Replace the checkAndResetDailyLimit and incrementDailyPostCount functions.

// Helper to get today's date string in a stable format (YYYY-MM-DD)
function getTodayString() {
  const now = new Date();
  // Using local time ensures it resets at midnight for the user
  const offset = now.getTimezoneOffset();
  const localDate = new Date(now.getTime() - offset * 60 * 1000);
  return localDate.toISOString().split("T")[0];
}

async function checkAndResetDailyLimit() {
  const data = await chrome.storage.local.get([
    "freePostsRemaining",
    "dailyPostCount",
    "lastDailyReset",
  ]);

  const today = getTodayString();
  const lastReset = data.lastDailyReset || "";

  // If the date has changed, reset everything
  if (lastReset !== today) {
    console.log(
      `[DailyLimit] New day detected (${today}). Resetting to 3 free posts.`,
    );
    const newRemaining = 3;
    const newCount = 0;

    await chrome.storage.local.set({
      freePostsRemaining: newRemaining,
      dailyPostCount: newCount,
      lastDailyReset: today,
    });

    return { count: newCount, remaining: newRemaining };
  }

  // Otherwise, return current state
  // Default to 3 if undefined (first run)
  const remaining =
    data.freePostsRemaining !== undefined ? data.freePostsRemaining : 3;
  const count = data.dailyPostCount || 0;

  return { count, remaining };
}

async function incrementDailyPostCount() {
  // 1. Get fresh state (handles reset if needed)
  const { count, remaining } = await checkAndResetDailyLimit();

  // 2. Decrement
  // We use Math.max to prevent negative numbers if multiple tabs race
  const newRemaining = Math.max(0, remaining - 1);
  const newCount = count + 1;

  console.log(
    `[DailyLimit] Post used. Remaining: ${newRemaining}, Used Today: ${newCount}`,
  );

  await chrome.storage.local.set({
    freePostsRemaining: newRemaining,
    dailyPostCount: newCount,
    // Ensure date is synced so we don't accidentally reset later
    lastDailyReset: getTodayString(),
  });

  // 3. Broadcast update to Popup if open
  // This is handled by storage.onChanged in popup.js automatically
}

async function startPostingProcess(post) {
  console.log(`[StartPosting] Starting process for post ID: ${post.id}`);
  const processStartTime = performance.now();

  try {
    const { licenseVerified } =
      await chrome.storage.local.get("licenseVerified");
    const isPro = !!licenseVerified;

    // --- FREEMIUM ENFORCEMENT ---
    if (!isPro) {
      // 1. Check current limit
      const { remaining } = await checkAndResetDailyLimit();

      if (remaining <= 0) {
        console.warn(
          `[StartPosting] BLOCKED: Daily limit reached (0 remaining).`,
        );

        // Optional: Mark the post as "Skipped - Limit Reached" in history
        // so the user knows why it didn't run.
        // For now, we just abort silently to avoid spamming errors.
        return;
      }

      // 2. Consume 1 Credit IMMEDIATELY
      // We deduct before starting. If the post fails later, we generally don't refund
      // to prevent "infinite retry" exploits, but you can change this policy if desired.
      await incrementDailyPostCount();
    }
    const state = await getPostingState();
    const statusData = await chrome.storage.local.get("isPostingInProgress");

    if (statusData.isPostingInProgress === "started") {
      // This is a genuine conflict with a running UI process
      console.warn(
        `[StartPosting] Skipped: Another posting process is active.`,
      );
      return;
    }

    // If we get here, storage says "not busy", so any session lock must be stale.
    if (state.isLocked) {
      console.warn("[StartPosting] Found stale session lock. Auto-releasing.");
      await clearPostingState();
    }

    await setPostingState({ isLocked: true, stopRequested: false });
    await chrome.storage.local.set({
      isPostingInProgress: "started",
      lastActivityTimestamp: Date.now(),
    });

    updatePostingStatus(`Starting scheduled post...`);

    // ... (Setup logic omitted for brevity, identical to before) ...
    const allGroupLinks = post.groups.reduce((acc, group) => {
      if (group.links && Array.isArray(group.links)) {
        acc.push(...group.links);
      }
      return acc;
    }, []);

    const effectiveSettings = {
      timeDelay: post.settings?.timeDelay ?? 300,
      groupNumberForDelay: post.settings?.linkCount ?? 1,
      avoidNightTimePosting: post.settings?.avoidNightPosting ?? false,
      compressImages: post.settings?.compressImages ?? true,
      commentOption: post.settings?.commentOption ?? "enable",
      firstCommentText: post.settings?.firstCommentText ?? "",
      postOrder: post.settings?.postOrder ?? "sequential",
      generateAiVariations: post.settings?.generateAiVariations ?? false,
      aiVariationCount: post.settings?.aiVariationCount ?? 2,
      securityLevel: post.settings?.securityLevel ?? "2",
      postingMethod: post.settings?.postingMethod ?? "directApi",
      delayAfterFailure: post.settings?.delayAfterFailure ?? false, // NEW
      postAnonymously: post.settings?.postAnonymously ?? false,
    };

    const preLogEntries = [];
    const postsToSend = post.posts || [];
    let effectiveTotalPostTemplates = postsToSend.length;
    if (effectiveSettings.generateAiVariations && postsToSend.length === 1) {
      effectiveTotalPostTemplates = 1 + effectiveSettings.aiVariationCount;
    }
    let finalPostOrder = effectiveSettings.postOrder;
    if (effectiveSettings.generateAiVariations && postsToSend.length === 1) {
      finalPostOrder = "alternate";
    }
    const totalTargetGroups = allGroupLinks.length;
    const totalOperations =
      finalPostOrder === "alternate"
        ? totalTargetGroups
        : effectiveTotalPostTemplates * totalTargetGroups;

    for (let i = 0; i < totalOperations; i++) {
      const postIndex =
        finalPostOrder === "sequential"
          ? Math.floor(i / totalTargetGroups)
          : i % effectiveTotalPostTemplates;
      const groupIndex =
        finalPostOrder === "sequential" ? i % totalTargetGroups : i;
      let postTitle = postsToSend[postIndex]?.title || "Untitled Post";
      if (effectiveSettings.generateAiVariations && postIndex > 0) {
        postTitle = `${postsToSend[0]?.title} (AI Variation ${postIndex})`;
      }
      preLogEntries.push({
        key: `op_${i}`,
        postTitle,
        linkTitle: allGroupLinks[groupIndex]?.[0] || "Unknown Group",
        linkURL: allGroupLinks[groupIndex]?.[1],
        status: "pending",
        reason: null,
        postUrl: null,
      });
    }
    await chrome.storage.local.set({ liveLogEntries: preLogEntries });

    const collectiveGroup = {
      title: `Scheduled Post Groups (${post.id})`,
      links: allGroupLinks,
    };
    const actionType =
      effectiveSettings.postingMethod === "popup"
        ? "postPosts"
        : "postPostsDirectApi";

    const request = {
      action: actionType,
      selectedPosts: postsToSend,
      group: collectiveGroup,
      source: "scheduled",
      scheduleId: post.id,
      settings: effectiveSettings,
    };

    console.log("[StartPosting] Calling handlePostingRequest...");
    const { logs: collectedLogs, telemetry: collectedTelemetry } =
      await handlePostingRequest(request);

    console.log(
      "[StartPosting] handlePostingRequest returned. Logs:",
      collectedLogs.length,
    );

    collectedTelemetry.timings.totalProcessMs =
      performance.now() - processStartTime;

    const completionStatus = (await getPostingState()).stopRequested
      ? "stopped"
      : "completed";

    const postsInfo = {
      type: "scheduled",
      scheduleId: post.id,
      postTitle: post.posts?.[0]?.title || "Scheduled Run",
      timeCompleted: new Date().toISOString(),
      settings: effectiveSettings,
      telemetry: collectedTelemetry,
      originalSelectedPosts: postsToSend, // Include for telemetry
    };

    console.log("[StartPosting] Calling finalizePosting...");
    await finalizePosting(collectedLogs, postsInfo, completionStatus);
    console.log("[StartPosting] Process complete.");
  } catch (error) {
    console.error(`[StartPosting] Error:`, error);
    await updatePostingProgress("done");
    // Ensure we clear the lock even on error
    await chrome.storage.local.remove("isPostingInProgress");
  }
}

function calculateNextRunTime(post) {
  try {
    const now = new Date();
    // Start with a clean date object based on inputs
    let nextRunTime = new Date();

    let scheduleHour = 0,
      scheduleMinute = 0;

    // 1. Parse the target time
    if (post.scheduleTime) {
      [scheduleHour, scheduleMinute] = post.scheduleTime.split(":").map(Number);
      nextRunTime.setHours(scheduleHour, scheduleMinute, 0, 0);
    } else if (post.scheduleDateTime) {
      // For 'once' or specific datetime inputs
      nextRunTime = new Date(post.scheduleDateTime);
      scheduleHour = nextRunTime.getHours();
      scheduleMinute = nextRunTime.getMinutes();
    }

    switch (post.frequency) {
      // *** FIX: Add explicit case for 'once' ***
      case "once":
        // For 'once', we simply respect the user's input.
        // The validation (checking if it's in the past) happens in the UI.
        // If it's passed here, we assume it's valid.
        // If no full date was provided (only time), we assume today/tomorrow logic logic below applies?
        // Actually, 'once' usually comes with a full date in scheduleDateTime.
        if (post.scheduleDateTime) {
          return new Date(post.scheduleDateTime).toISOString();
        }
        // If only time provided for 'once' (rare edge case), fall through to daily logic?
        // Better to just return the calculated time based on today.
        break;

      case "daily":
        if (nextRunTime <= now) {
          nextRunTime.setDate(nextRunTime.getDate() + 1);
        }
        break;

      case "weekly":
        const currentDayOfWeek = now.getDay(); // 0 = Sunday
        const sortedWeekdays = [...(post.weekdays || [])].sort((a, b) => a - b);

        if (sortedWeekdays.length === 0) return nextRunTime.toISOString();

        let daysToAdd = -1;

        // A. Check for days later THIS week
        for (const day of sortedWeekdays) {
          if (day > currentDayOfWeek) {
            daysToAdd = day - currentDayOfWeek;
            break;
          } else if (day === currentDayOfWeek) {
            if (nextRunTime > now) {
              daysToAdd = 0;
              break;
            }
          }
        }

        // B. If no valid day found this week, wrap to next week
        if (daysToAdd === -1) {
          const firstDayNextWeek = sortedWeekdays[0];
          daysToAdd = 7 - currentDayOfWeek + firstDayNextWeek;
        }

        nextRunTime.setDate(now.getDate() + daysToAdd);
        break;

      case "monthly":
        const currentDayOfMonth = now.getDate();
        const sortedMonthDays = [...(post.monthDays || [])].sort(
          (a, b) => a - b,
        );

        if (sortedMonthDays.length === 0) return nextRunTime.toISOString();

        let targetDay = -1;
        let targetMonth = now.getMonth();
        let targetYear = now.getFullYear();

        // A. Check for days later THIS month
        for (const day of sortedMonthDays) {
          if (day > currentDayOfMonth) {
            targetDay = day;
            break;
          } else if (day === currentDayOfMonth) {
            if (nextRunTime > now) {
              targetDay = day;
              break;
            }
          }
        }

        // B. If no valid day this month, move to next month
        if (targetDay === -1) {
          targetDay = sortedMonthDays[0];
          targetMonth++;
          if (targetMonth > 11) {
            targetMonth = 0;
            targetYear++;
          }
        }

        // Handle month lengths
        const daysInTargetMonth = new Date(
          targetYear,
          targetMonth + 1,
          0,
        ).getDate();
        const finalDay = Math.min(targetDay, daysInTargetMonth);

        nextRunTime = new Date(
          targetYear,
          targetMonth,
          finalDay,
          scheduleHour,
          scheduleMinute,
          0,
          0,
        );
        break;

      default:
        // Only fallback if no known frequency matched
        if (nextRunTime <= now) {
          nextRunTime.setHours(nextRunTime.getHours() + 1);
        }
    }

    return nextRunTime.toISOString();
  } catch (error) {
    console.error("Error calculating next run time:", error);
    const fallback = new Date();
    fallback.setHours(fallback.getHours() + 1);
    return fallback.toISOString();
  }
}
// Migrate old data
// async function migrateOldData() {
//   chrome.storage.local.get(["groups"], (result) => {
//     if (result && result.groups) {
//       let groups = result.groups;
//       let updatedGroups = [];
//       groups.forEach((group) => {
//         let updatedLinks = [];
//         if (group.links && group.links.length > 0) {
//           group.links.forEach((link, index) => {
//             if (typeof link === "string") {
//               updatedLinks.push([`Link ${index + 1}`, link]);
//             } else if (Array.isArray(link) && link.length === 2) {
//               updatedLinks.push(link);
//             }
//           });
//         }
//         updatedGroups.push({
//           title: group.title,
//           links: updatedLinks,
//         });
//       });
//       chrome.storage.local.set({ groups: updatedGroups }, () => {
//         console.log("Migration completed successfully:", updatedGroups);
//       });
//     }
//   });
// }

// --------------- BEGIN Direct API Posting System ---------------

async function ensureFreshTokens() {
  console.log("Ensuring fresh Facebook tokens...");
  try {
    const storedTokens = await chrome.storage.local.get([
      "fbDtsg",
      "userID",
      "lsd",
      "actorID",
      "tokenTimestamp",
    ]);
    const now = Date.now();
    const tokenAge = storedTokens.tokenTimestamp
      ? now - storedTokens.tokenTimestamp
      : Infinity;

    if (
      storedTokens.fbDtsg &&
      storedTokens.userID &&
      tokenAge < 15 * 60 * 1000 // 15 minutes cache
    ) {
      console.log("Using fresh, cached Facebook tokens.");
      return storedTokens; // Returns all keys
    }

    console.log("Tokens are stale or missing. Fetching new ones...");
    const validTabId = await createSharedBackgroundTab();

    // Fetch new tokens
    const newTokens = await fetchFacebookTokensUsingTab(validTabId);

    // Store all of them
    await chrome.storage.local.set({
      ...newTokens,
      tokenTimestamp: Date.now(),
    });

    return newTokens;
  } catch (error) {
    console.error("Critical error in ensureFreshTokens:", error);
    throw error;
  }
}

// Function to fetch tokens using an existing tab
async function fetchFacebookTokensUsingTab(tabId) {
  console.log("Fetching new Facebook tokens using existing tab");
  updatePostingStatus("Safety: Re-validating Facebook session..."); // Change

  return new Promise((resolve, reject) => {
    // Navigate tab to Facebook
    chrome.tabs.update(tabId, { url: "https://www.facebook.com/" }, () => {
      // Set timeout to handle failed token extraction
      const timeout = setTimeout(() => {
        reject(new Error("Timeout fetching Facebook tokens"));
      }, 30000);

      // Wait for tab to load completely
      chrome.tabs.onUpdated.addListener(function listener(id, changeInfo) {
        if (id === tabId && changeInfo.status === "complete") {
          chrome.tabs.onUpdated.removeListener(listener);

          // Execute script to extract tokens
          chrome.scripting.executeScript(
            {
              target: { tabId: tabId },
              function: extractFacebookTokens,
            },
            function (results) {
              // Clear timeout
              clearTimeout(timeout);

              // Process results
              if (results && results[0] && results[0].result) {
                const tokens = results[0].result;

                if (tokens.fbDtsg && tokens.userID) {
                  // Store tokens for future use
                  chrome.storage.local.set({
                    fbDtsg: tokens.fbDtsg,
                    userID: tokens.userID,
                    tokenTimestamp: Date.now(),
                  });

                  // Update global tokens
                  const fbTokens = {
                    fbDtsg: tokens.fbDtsg,
                    userID: tokens.userID,
                    tokenTimestamp: Date.now(),
                  };

                  console.log("Successfully extracted Facebook tokens");
                  resolve(fbTokens);
                } else {
                  reject(new Error("Failed to extract valid Facebook tokens"));
                }
              } else {
                reject(new Error("Failed to extract Facebook tokens"));
              }
            },
          );
        }
      });
    });
  });
}

// Function to fetch tokens from Facebook by creating a new tab
async function fetchFacebookTokens() {
  console.log("Fetching new Facebook tokens with a new tab");
  updatePostingStatus("Safety: Establishing secure Facebook session..."); //

  return new Promise((resolve, reject) => {
    chrome.tabs.create(
      {
        url: "https://www.facebook.com/",
        active: false,
        pinned: true,
      },
      function (tab) {
        // Make sure tab stays in background
        chrome.windows.getCurrent(function (win) {
          chrome.windows.update(win.id, { focused: true });
        });

        // Set timeout to handle failed token extraction
        const timeout = setTimeout(() => {
          chrome.tabs.remove(tab.id);
          reject(new Error("Timeout fetching Facebook tokens"));
        }, 30000);

        // Wait for tab to load completely
        chrome.tabs.onUpdated.addListener(function listener(id, changeInfo) {
          if (id === tab.id && changeInfo.status === "complete") {
            chrome.tabs.onUpdated.removeListener(listener);

            // Execute script to extract tokens
            chrome.scripting.executeScript(
              {
                target: { tabId: tab.id },
                function: extractFacebookTokens,
              },
              function (results) {
                // Clear timeout
                clearTimeout(timeout);

                // Process results
                if (results && results[0] && results[0].result) {
                  const tokens = results[0].result;

                  if (tokens.fbDtsg && tokens.userID) {
                    // Store tokens for future use
                    chrome.storage.local.set({
                      fbDtsg: tokens.fbDtsg,
                      userID: tokens.userID,
                      tokenTimestamp: Date.now(),
                    });

                    // Update global tokens
                    const fbTokens = {
                      fbDtsg: tokens.fbDtsg,
                      userID: tokens.userID,
                      tokenTimestamp: Date.now(),
                    };

                    console.log("Successfully extracted Facebook tokens");
                    chrome.tabs.remove(tab.id);
                    resolve(fbTokens);
                  } else {
                    chrome.tabs.remove(tab.id);
                    reject(
                      new Error("Failed to extract valid Facebook tokens"),
                    );
                  }
                } else {
                  chrome.tabs.remove(tab.id);
                  reject(new Error("Failed to extract Facebook tokens"));
                }
              },
            );
          }
        });
      },
    );
  });
}

function extractFacebookTokens() {
  try {
    let userID = null;
    let fbDtsg = null;
    let lsd = null;
    let actorID = null;
    let spinR = null; // Site Revision
    let spinB = null; // Site Branch
    let spinT = null; // Site Time

    const html = document.documentElement.innerHTML;

    // --- 1. User ID (Cookie - Source of Truth) ---
    const cookieMatch = document.cookie.match(/c_user=(\d+)/);
    if (cookieMatch && cookieMatch[1]) {
      userID = cookieMatch[1];
    }

    // --- 2. DTSG (Input or Script) ---
    const dtsgInput = document.querySelector('input[name="fb_dtsg"]');
    if (dtsgInput && dtsgInput.value) {
      fbDtsg = dtsgInput.value;
    } else {
      // Regex fallback for DTSG
      let match = html.match(/"DTSGInitialData".*?"token"\s*:\s*"([^"]+)"/);
      if (match) fbDtsg = match[1];
    }

    // --- 3. LSD Token (CRITICAL NEW FIND) ---
    // Pattern: ["LSD",[],{"token":"AVr..."}]
    const lsdMatch = html.match(/"LSD",\[\],\{"token":"([^"]+)"\}/);
    if (lsdMatch) {
      lsd = lsdMatch[1];
      console.log("[TokenExtract] Found LSD token.");
    }

    // --- 4. Actor ID (For Page/Profile Context) ---
    // Pattern: "actorID":"12345" inside RelayAPIConfigDefaults or CurrentUserInitialData
    const actorMatch = html.match(/"actorID":"(\d+)"/);
    if (actorMatch) {
      actorID = actorMatch[1];
    }
    // Fallback: If no specific actor found, use userID
    if (!actorID) actorID = userID;

    // --- 5. Spin/Site Data (Version Locking) ---
    // Pattern: "server_revision":1032601050
    const revMatch = html.match(/"server_revision":(\d+)/);
    if (revMatch) spinR = revMatch[1];

    // Pattern: "__spin_b":"trunk"
    const branchMatch = html.match(/"__spin_b":"([^"]+)"/);
    if (branchMatch) spinB = branchMatch[1];

    // Pattern: "__spin_t":1769648041
    const timeMatch = html.match(/"__spin_t":(\d+)/);
    if (timeMatch) spinT = timeMatch[1];

    return {
      userID,
      fbDtsg,
      lsd,
      actorID,
      spinR,
      spinB,
      spinT,
    };
  } catch (error) {
    console.error("Critical error during extractFacebookTokens:", error);
    return { userID: null, fbDtsg: null, lsd: null };
  }
}

// in background.js
// ACTION: Replace the entire existing createSharedBackgroundTab function with this definitive version.

async function createSharedBackgroundTab() {
  const MAX_RETRIES = 2;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`Attempt ${attempt}: Ensuring shared background tab exists.`);

      let state = await getPostingState();
      if (state.sharedTabId) {
        try {
          await chrome.tabs.get(state.sharedTabId);
          console.log(
            `Verified existing background tab is still active: ${state.sharedTabId}`,
          );
          await chrome.tabs.update(state.sharedTabId, {
            url: "https://www.facebook.com/",
            autoDiscardable: false,
          });
          return state.sharedTabId;
        } catch (e) {
          console.warn(
            `Background tab ${state.sharedTabId} no longer exists. Creating a new one.`,
          );
          await setPostingState({ sharedTabId: null });
        }
      }

      console.log("Creating new shared background tab.");
      const tab = await new Promise((resolve, reject) => {
        chrome.tabs.create(
          { url: "https://www.facebook.com/", active: false, pinned: true },
          (newTab) => {
            if (chrome.runtime.lastError)
              return reject(new Error(chrome.runtime.lastError.message));
            if (!newTab || typeof newTab.id === "undefined")
              return reject(new Error("Tab was created but ID is missing."));

            // --- START OF THE FIX ---

            // Cleanup function to remove both listeners
            const cleanupListeners = () => {
              chrome.tabs.onUpdated.removeListener(updateListener);
              chrome.tabs.onRemoved.removeListener(removeListener);
            };

            // Listener for when the tab successfully loads
            const updateListener = (tabId, changeInfo) => {
              if (tabId === newTab.id && changeInfo.status === "complete") {
                cleanupListeners();
                resolve(newTab);
              }
            };

            // Listener for when the tab is closed prematurely
            const removeListener = (tabId) => {
              if (tabId === newTab.id) {
                cleanupListeners();
                reject(
                  new Error(
                    `Shared background tab ${newTab.id} was closed before it finished loading.`,
                  ),
                );
              }
            };

            chrome.tabs.onUpdated.addListener(updateListener);
            chrome.tabs.onRemoved.addListener(removeListener);

            // --- END OF THE FIX ---
          },
        );
      });

      await setPostingState({ sharedTabId: tab.id });
      console.log(`Injecting always-active scripts into new tab ${tab.id}`);
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["alwaysActive.js"],
        world: "MAIN",
      });
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["alwaysActiveIsolated.js"],
        world: "ISOLATED",
      });

      console.log("New shared background tab is fully ready. ID:", tab.id);
      return tab.id;
    } catch (error) {
      console.error(
        `Attempt ${attempt} to create/verify background tab failed:`,
        error.message,
      );
      await setPostingState({ sharedTabId: null });
      if (attempt === MAX_RETRIES) {
        throw new Error(
          "Failed to create the shared background tab after multiple retries.",
        );
      }
      await sleep(1);
    }
  }
}

async function processPostsDirectApi(selectedPosts, group, settings) {
  console.log(
    "--- Starting Robust processPostsDirectApi (v10 - Production Ready) ---",
  );

  const methodLogs = [];
  const telemetry = {
    timings: {},
    ui_snapshots: [],
    errors: [],
  };

  let fbTokens = {};
  let localBackgroundTabId = null;

  try {
    try {
      await ensureNetworkConnection();
      // This nested try...catch handles the critical setup phase.
      const tokenStartTime = performance.now();
      updatePostingStatus("Safety: Establishing secure Facebook session...");
      fbTokens = await ensureFreshTokens();
      telemetry.timings.tokenFetchMs = performance.now() - tokenStartTime;

      const tabStartTime = performance.now();
      updatePostingStatus("Safety: Preparing background environment...");
      localBackgroundTabId = await createSharedBackgroundTab();
      telemetry.timings.tabCreationMs = performance.now() - tabStartTime;
    } catch (setupError) {
      // If ANY part of the setup fails (e.g., token fetching timeout), we fall back gracefully.
      console.warn(
        `Direct API setup failed: "${setupError.message}". Switching entire run to Classic Popup mode.`,
      );
      updatePostingStatus(
        "Direct API unavailable. Switching to Classic Mode...",
      );
      telemetry.errors.push({
        source: "direct_api_setup_fallback",
        message: setupError.message,
      });

      const fallbackRequest = { settings, selectedPosts, group };
      const fallbackResult = await executeClassicModeRun(
        fallbackRequest,
        selectedPosts,
      );
      return fallbackResult; // Return the logs and telemetry from the classic run.
    }

    let postsSinceTabRefresh = 0;
    let postsSinceTokenRefresh = 0;
    const securityLevel = settings.securityLevel || "2";
    const REFRESH_THRESHOLD =
      securityLevel === "1" ? 12 : securityLevel === "3" ? 4 : 7;
    const postOrder = settings.postOrder || "sequential";
    let i = 0;
    let preprocessedPosts = [];

    const mediaStartTime = performance.now();
    updatePostingStatus("Preparing media assets...");
    for (const post of selectedPosts) {
      if ((await getPostingState()).stopRequested)
        throw new Error("Stop requested during media processing");
      try {
        const newPost = { ...post, mediaUrls: [] };
        if (post.images?.length > 0) {
          for (const media of post.images) {
            const processed = await preprocessMedia(
              media,
              settings.compressImages,
            );
            if (processed && processed.data)
              newPost.mediaUrls.push(processed.data);
          }
        }
        preprocessedPosts.push(newPost);
      } catch (mediaError) {
        console.error(
          `Media processing failed for post "${post.title}":`,
          mediaError,
        );
        telemetry.errors.push({
          source: "media_preprocessing",
          message: mediaError.message,
          postTitle: post.title,
        });
        methodLogs.push({
          linkTitle: "N/A",
          postTitle: post.title,
          response: "failed",
          reason: `Media prep error: ${mediaError.message}`,
          method: "direct_api_media_error",
          timestamp: new Date().toISOString(),
        });
      }
    }
    telemetry.timings.mediaProcessingMs = performance.now() - mediaStartTime;
    if (preprocessedPosts.length === 0)
      throw new Error("All selected posts failed during media preparation.");

    const numPosts = preprocessedPosts.length;
    const totalGroups = group.links.length;
    const totalOperations =
      postOrder === "sequential" ? numPosts * totalGroups : totalGroups;
    updatePostingStatus(
      `Starting ${numPosts} post(s) to ${totalGroups} group(s).`,
    );

    for (i = 0; i < totalOperations; i++) {
      await ensureNetworkConnection();
      if ((await getPostingState()).stopRequested) break;

      const postIndex =
        postOrder === "sequential" ? Math.floor(i / totalGroups) : i % numPosts;
      const groupIndex = postOrder === "sequential" ? i % totalGroups : i;
      const currentPost = preprocessedPosts[postIndex];
      const currentGroupLink = group.links[groupIndex];

      const groupLinkURL = currentGroupLink?.[1];
      const groupLinkTitle = currentGroupLink?.[0] || `Group ${groupIndex + 1}`;
      let logEntry = {
        linkTitle: groupLinkTitle,
        linkURL: groupLinkURL || "N/A",
        postTitle: currentPost.title || "Untitled Post",
        timestamp: new Date().toISOString(),
      };

      if (!groupLinkURL) {
        logEntry.response = "skipped";
        logEntry.reason = "Invalid group link data";
        methodLogs.push(logEntry);
        continue;
      }

      if (settings.avoidNightTimePosting) {
        const nowHour = new Date().getHours();
        if (nowHour >= 22 || nowHour < 7) {
          updatePostingStatus(`Night pause active. Resuming at 7 AM...`);
          const now = new Date();
          let next7AM = new Date(now);
          next7AM.setHours(7, 0, 0, 0);
          if (now >= next7AM) next7AM.setDate(next7AM.getDate() + 1);
          await countdownDelay((next7AM.getTime() - now.getTime()) / 1000);
          if ((await getPostingState()).stopRequested) break;
          updatePostingStatus("Resuming posting...");
        }
      }

      if (
        postsSinceTabRefresh >= REFRESH_THRESHOLD ||
        postsSinceTokenRefresh >= REFRESH_THRESHOLD
      ) {
        if (postsSinceTabRefresh >= REFRESH_THRESHOLD) {
          updatePostingStatus("Safety: Optimizing background environment...");
          await cleanupSharedBackgroundTab();
          localBackgroundTabId = await createSharedBackgroundTab();
          if (!localBackgroundTabId)
            throw new Error(
              "Failed to recreate Direct API tab after rotation.",
            );
          postsSinceTabRefresh = 0;
        }
        if (postsSinceTokenRefresh >= REFRESH_THRESHOLD) {
          updatePostingStatus(
            "Safety: Securely refreshing Facebook session...",
          );
          await ensureNetworkConnection();
          fbTokens = await ensureFreshTokens();
          if (!fbTokens.fbDtsg || !fbTokens.userID)
            throw new Error("Failed to refresh Direct API tokens.");
          postsSinceTokenRefresh = 0;
        }
        if ((await getPostingState()).stopRequested) break;
      }

      updatePostingStatus(
        `Posting P${postIndex + 1}/${numPosts} to G${
          groupIndex + 1
        }/${totalGroups}...`,
      );
      await sleep(getRandomDelay(2500, 5000) / 1000);

      try {
        const result = await postToFacebookDirectApiShared(
          {
            text: currentPost.text,
            images: currentPost.mediaUrls,
            url: groupLinkURL,
            commentOption: settings.commentOption,
            firstCommentText: settings.firstCommentText,
          },
          fbTokens,
          localBackgroundTabId,
        );

        logEntry.response = "successful";
        logEntry.reason = null;
        logEntry.postUrl = result.url;
        logEntry.method = "direct_api";
        methodLogs.push(logEntry);
      } catch (directApiError) {
        telemetry.errors.push({
          source: "direct_api_attempt_fallback",
          message: directApiError.message,
          group: groupLinkTitle,
        });
        updatePostingStatus(
          `Direct API failed. Trying Classic Popup fallback...`,
        );

        try {
          const fallbackResult = await handleFallbackPostingWrapper(
            currentPost,
            groupLinkURL,
            settings,
          );
          logEntry.response = fallbackResult.success ? "successful" : "failed";
          logEntry.method = "popup_fallback";
          logEntry.reason = fallbackResult.success
            ? `Fallback successful after Direct API failed: ${directApiError.message}`
            : `Direct API and Fallback both failed. Fallback error: ${fallbackResult.error}`;
          if (fallbackResult.telemetry)
            telemetry.ui_snapshots.push(
              ...fallbackResult.telemetry.ui_snapshots,
            );
          methodLogs.push(logEntry);
        } catch (fallbackError) {
          telemetry.errors.push({
            source: "popup_fallback_catch",
            message: fallbackError.message,
            group: groupLinkTitle,
          });
          logEntry.response = "failed";
          logEntry.method = "popup_fallback_error";
          logEntry.reason = `Direct API failed (${directApiError.message}), and Fallback failed (${fallbackError.message}).`;
          methodLogs.push(logEntry);
        }
        postsSinceTabRefresh = REFRESH_THRESHOLD;
        postsSinceTokenRefresh = REFRESH_THRESHOLD;
      }

      chrome.storage.local.set({
        latestPostLog: methodLogs[methodLogs.length - 1],
      });
      postsSinceTabRefresh++;
      postsSinceTokenRefresh++;

      const isLastOverallPost = i + 1 === totalOperations;

      // 1. Pending is now treated as success for timing purposes
      const consideredSuccessful =
        logEntry.response === "successful" ||
        logEntry.response === "pending_approval";

      // 2. Check if we should wait (Success OR "Delay on Failure" is checked)
      const shouldWaitFullDelay =
        consideredSuccessful || settings.delayAfterFailure === true;

      if (shouldWaitFullDelay && !isLastOverallPost) {
        if (shouldApplyDelay(i, settings.groupNumberForDelay)) {
          await countdownDelay(getRandomizedDelay(settings.timeDelay));
        } else {
          let shortDelay = getRandomDelay(2, 7);
          if (securityLevel === "1") shortDelay = getRandomDelay(0, 3);
          if (securityLevel === "3") shortDelay = getRandomDelay(5, 11);
          await sleep(shortDelay);
        }
      } else if (!isLastOverallPost) {
        // Only take the short "error skip" delay if it failed AND the safety option is OFF
        await sleep(getRandomDelay(3, 8));
      }
    }

    if ((await getPostingState()).stopRequested) {
      handleRemainingPostsForLoop(
        i,
        totalOperations,
        preprocessedPosts,
        group.links,
        postOrder,
        methodLogs,
      );
    }
  } catch (error) {
    telemetry.errors.push({
      source: "processPostsDirectApi_outer_catch",
      message: error.message,
    });
    const totalOps = (selectedPosts.length || 1) * (group.links.length || 1); // Estimate total ops
    handleRemainingPostsForLoop(
      i || 0,
      totalOps,
      preprocessedPosts,
      group.links,
      postOrder,
      methodLogs,
    );
  } finally {
    if (localBackgroundTabId) {
      updatePostingStatus("Safety: Cleaning up background environment...");
      await cleanupSharedBackgroundTab();
    }
  }

  console.log(`--- Finished Direct API run. Logs: ${methodLogs.length} ---`);
  return { logs: methodLogs, telemetry };
}

// --- NEW: Centralized Direct API Response Handler ---
let directApiResponseQueue = []; // An array to hold resolve/reject functions for each post
let directApiResponsePromises = new Map();

function handleDirectApiResponse(message, sender) {
  if (message.action === "directApiPostComplete") {
    // --- START: MODIFICATION (Request ID Logic) ---
    const { requestId } = message;
    // 1. Check if we have a pending promise for this specific ID.
    if (directApiResponsePromises.has(requestId)) {
      console.log(
        `[Direct API Response] Received response for requestId: ${requestId}`,
        message,
      );

      // 2. Retrieve the specific { resolve, reject } functions for this request.
      const promise = directApiResponsePromises.get(requestId);

      // 3. Resolve or reject THAT specific promise.
      if (message.success) {
        promise.resolve({ success: true, url: message.postUrl });
      } else {
        console.error(`[Direct API Failure] Error: ${message.error}`);
        promise.reject({
          success: false,
          errorType: "api_error",
          message: message.error || "Failed to post via content script",
        });
      }

      // 4. IMPORTANT: We DO NOT delete from the map here. The `finally` block in
      //    `postToFacebookDirectApiShared` is now the single source of truth for cleanup.
      //    This prevents race conditions where the response arrives just as a timeout occurs.
    } else {
      // This can happen if a response arrives AFTER the request has already timed out.
      // This is now a harmless, expected condition, not an error.
      console.warn(
        `[Direct API Response] Received a response for an unknown or timed-out requestId: ${requestId}. Ignoring.`,
      );
    }
    // --- END: MODIFICATION ---
  }
}

function handleFallbackPostingWrapper(postData, groupLink, commentOptions) {
  return new Promise((resolve) => {
    handleFallbackPosting(postData, groupLink, commentOptions, (result) => {
      resolve(result); // Resolve the promise with the result from the callback
    });
  });
}

// in background.js

async function postToFacebookDirectApiShared(post, tokens, tabId) {
  if (!tabId) {
    throw new Error("No shared background tab available for Direct API post.");
  }

  const requestId = `direct_${Date.now()}_${Math.random()
    .toString(36)
    .substring(2, 9)}`;
  const TIMEOUT_DURATION = 240000; // 2 minutes

  try {
    const operationPromise = (async () => {
      const postResponsePromise = new Promise((resolve, reject) => {
        directApiResponsePromises.set(requestId, { resolve, reject });
      });

      // 1. Navigate and Wait
      console.log(`Navigating tab ${tabId} to URL: ${post.url}`);

      // Use the flexible createTab logic's navigation confirmation here implicitly
      // by waiting for the tab to update.
      await chrome.tabs.update(tabId, { url: post.url });

      // Wait for navigation to complete
      await new Promise((resolveNav, rejectNav) => {
        const NAV_TIMEOUT = 60000;
        const navTimeoutId = setTimeout(() => {
          chrome.tabs.onUpdated.removeListener(navigationListener);
          rejectNav(new Error(`Navigation timed out.`));
        }, NAV_TIMEOUT);

        const navigationListener = (updatedTabId, changeInfo, tab) => {
          if (updatedTabId !== tabId) return;
          // Accept ANY facebook domain (www, web, m, etc.)
          if (
            changeInfo.status === "complete" &&
            tab.url &&
            tab.url.includes("facebook.com")
          ) {
            chrome.tabs.onUpdated.removeListener(navigationListener);
            clearTimeout(navTimeoutId);
            setTimeout(resolveNav, getRandomDelay(1500, 3000));
          }
        };
        chrome.tabs.onUpdated.addListener(navigationListener);
      });

      // 2. Determine the correct API Endpoint based on where we landed
      // 2. Determine the correct API Endpoint based on where we landed
      const currentTab = await chrome.tabs.get(tabId);
      let currentDomain = "www.facebook.com"; // Default fallback

      try {
        if (currentTab.url && !currentTab.url.startsWith("about:")) {
          currentDomain = new URL(currentTab.url).hostname;
        }
      } catch (e) {
        console.warn(
          "Could not parse current tab URL, defaulting to www.facebook.com",
          e,
        );
      }

      // Ensure we are hitting the GraphQL endpoint
      const apiEndpoint = `https://${currentDomain}/api/graphql/`;

      console.log(
        `[Direct API] Detected domain: ${currentDomain}. Using endpoint: ${apiEndpoint}`,
      );
      // 3. Define the function to inject. It now accepts `params` which will include `requestId`.
      const aFunctionToInject = (params) => {
        console.log("Starting injected API posting process", params);

        // Helper function for random delays
        const addRandomDelay = async (minMs, maxMs) => {
          if (!params.useRandomDelay) return;
          const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
          await new Promise((resolve) => setTimeout(resolve, delay));
        };

        // All helper functions are defined inside the injected function scope
        function determinePostTarget() {
          const html = document.documentElement.innerHTML;
          const url = window.location.href;
          const groupIdMatch = url.match(/facebook\.com\/groups\/([^/]+)/);
          let targetInfo = {
            isGroup: false,
            isPage: false,
            isProfile: false,
            targetId: null,
          };
          if (groupIdMatch) {
            targetInfo.isGroup = true;
            if (/^\d+$/.test(groupIdMatch[1])) {
              targetInfo.targetId = groupIdMatch[1];
            } else {
              const patterns = [
                /"groupID":"(\d+)"/i,
                /group_id=(\d+)/i,
                /"group_id":"(\d+)"/i,
                /"id":"(\d+)"/i,
                /"entity_id":"(\d+)"/i,
                /\/groups\/(\d+)/,
              ];
              for (const pattern of patterns) {
                const match = html.match(pattern);
                if (match && match[1]) {
                  targetInfo.targetId = match[1];
                  break;
                }
              }
            }
          } else {
            const pageIdMatch = html.match(/"pageID":"([^"]+)"/);
            if (pageIdMatch) {
              targetInfo.isPage = true;
              targetInfo.targetId = pageIdMatch[1];
            } else {
              targetInfo.isProfile = true;
              const userIdMatch = html.match(/"USER_ID":"([^"]+)"/);
              targetInfo.targetId = userIdMatch
                ? userIdMatch[1]
                : params.userID;
            }
          }
          return targetInfo;
        }

        async function uploadImages(images, fbDtsg, userId, targetInfo) {
          if (!images || images.length === 0) return [];
          console.log(`Uploading ${images.length} images`);
          const uploadPromises = images.map(async (imageData, index) => {
            try {
              await addRandomDelay(300, 800, `preparing image ${index + 1}`);
              const blob = await fetch(imageData).then((r) => r.blob());
              const formData = new FormData();
              formData.append("source", 8);
              formData.append("profile_id", userId);
              formData.append("waterfallxapp", "comet");
              formData.append("farr", blob);

              const response = await fetch(
                `https://upload.facebook.com/ajax/react_composer/attachments/photo/upload?av=${userId}&__user=${userId}&__a=1&dpr=1&__comet_req=15&fb_dtsg=${fbDtsg}`,
                {
                  method: "POST",
                  credentials: "include",
                  headers: {
                    Accept: "*/*",
                    "Access-Control-Allow-Origin": "*",
                  },
                  body: formData,
                },
              );
              const responseText = await response.text();
              const jsonResponse = JSON.parse(
                responseText.replace("for (;;);", ""),
              );
              if (jsonResponse.payload && jsonResponse.payload.photoID) {
                return { photo: { id: jsonResponse.payload.photoID } };
              } else {
                console.error(
                  `Failed to upload image ${index + 1}:`,
                  jsonResponse,
                );
                throw new Error(`Failed to upload image ${index + 1}`);
              }
            } catch (error) {
              console.error(`Error uploading image ${index + 1}:`, error);
              throw error;
            }
          });
          return Promise.all(uploadPromises);
        }

        async function processPostText(post) {
          const rawHtml = post.text || "";
          const processedHtml = processSpintaxInHtml(rawHtml);
          const formatted = convertHtmlToFacebookFormat(processedHtml);
          return prepareFacebookTextFormat(formatted);
        }

        function processSpintaxInHtml(html) {
          if (!html) return html;
          const tempDiv = document.createElement("div");
          tempDiv.innerHTML = html;
          const textNodes = getAllTextNodes(tempDiv);
          textNodes.forEach((node) => {
            if (
              node.nodeValue &&
              node.nodeValue.includes("{") &&
              node.nodeValue.includes("}")
            ) {
              node.nodeValue = processSpintax(node.nodeValue);
            }
          });
          return tempDiv.innerHTML;
        }

        function getAllTextNodes(node) {
          let textNodes = [];
          if (node.nodeType === Node.TEXT_NODE) {
            textNodes.push(node);
          } else {
            const children = node.childNodes;
            for (let i = 0; i < children.length; i++) {
              textNodes = textNodes.concat(getAllTextNodes(children[i]));
            }
          }
          return textNodes;
        }

        function processSpintax(text) {
          if (!text) return text;

          function processNestedSpintax(input) {
            const regex = /\{([^{}]+)\}/;
            let result = input;
            while (regex.test(result)) {
              result = result.replace(regex, (match, options) => {
                const choices = options.split("|");
                const randomChoice =
                  choices[Math.floor(Math.random() * choices.length)].trim();
                return processNestedSpintax(randomChoice);
              });
            }
            return result;
          }
          return processNestedSpintax(text);
        }

        function convertHtmlToFacebookFormat(html) {
          const tempDiv = document.createElement("div");
          tempDiv.innerHTML = html;
          const blocks = [],
            blockTypes = [],
            blockDepths = [],
            inlineStyles = [];

          function processNodes(nodes) {
            for (let i = 0; i < nodes.length; i++) {
              const node = nodes[i];
              if (node.nodeType === Node.TEXT_NODE) {
                if (node.textContent.trim()) {
                  processTextNode(node);
                }
              } else if (node.nodeType === Node.ELEMENT_NODE) {
                processElementNode(node);
              }
            }
          }

          function processTextNode(node) {
            const text = node.textContent;
            if (!text.trim()) return;
            blocks.push(text);
            blockTypes.push(0);
            blockDepths.push(0);
            inlineStyles.push([]);
          }

          function processElementNode(node) {
            const tagName = node.tagName.toLowerCase();
            switch (tagName) {
              case "h1":
                processHeadingNode(node, 5);
                break;
              case "h2":
                processHeadingNode(node, 6);
                break;
              case "p":
                processParagraphNode(node);
                break;
              case "ul":
                processListNode(node, 2);
                break;
              case "ol":
                processListNode(node, 3);
                break;
              case "li":
                break;
              case "strong":
              case "b":
                processStyledNode(node, 1);
                break;
              case "em":
              case "i":
                processStyledNode(node, 2);
                break;
              default:
                processNodes(node.childNodes);
                break;
            }
          }

          function processHeadingNode(node, blockType) {
            const text = node.textContent;
            if (!text.trim()) return;
            blocks.push(text);
            blockTypes.push(blockType);
            blockDepths.push(0);
            inlineStyles.push(extractStyles(node));
          }

          function processParagraphNode(node) {
            const text = node.textContent;
            if (!text.trim()) return;
            blocks.push(text);
            blockTypes.push(0);
            blockDepths.push(0);
            inlineStyles.push(extractStyles(node));
          }

          function processListNode(node, blockType) {
            const listItems = node.querySelectorAll("li");
            listItems.forEach((item) => {
              const text = item.textContent;
              if (!text.trim()) return;
              blocks.push(text);
              blockTypes.push(blockType);
              blockDepths.push(0);
              inlineStyles.push(extractStyles(item));
            });
          }

          function processStyledNode(node, styleType) {
            const text = node.textContent;
            if (!text.trim()) return;
            blocks.push(text);
            blockTypes.push(0);
            blockDepths.push(0);
            inlineStyles.push([
              { offset: 0, length: text.length, style: styleType },
            ]);
          }

          function extractStyles(node) {
            const styles = [];
            const text = node.textContent;
            node.querySelectorAll("strong, b").forEach((el) => {
              const elText = el.textContent;
              const offset = text.indexOf(elText);
              if (offset >= 0)
                styles.push({ offset, length: elText.length, style: 1 });
            });
            node.querySelectorAll("em, i").forEach((el) => {
              const elText = el.textContent;
              const offset = text.indexOf(elText);
              if (offset >= 0)
                styles.push({ offset, length: elText.length, style: 2 });
            });
            return styles;
          }

          processNodes(tempDiv.childNodes);
          const plainText = blocks.join("");
          return {
            formatted: { blocks, blockTypes, blockDepths, inlineStyles },
            plainText,
          };
        }

        function convertHtmlToPlainTextForFacebook(html) {
          if (!html) return "";
          const tempDiv = document.createElement("div");
          let processedHtml = html
            .replace(/<\/p>/gi, "\n\n")
            .replace(/<\/h[1-6]>/gi, "\n\n")
            .replace(/<\/li>/gi, "\n")
            .replace(/<br\s*\/?>/gi, "\n");
          processedHtml = processedHtml.replace(/<li>/gi, "• ");
          tempDiv.innerHTML = processedHtml;
          let plainText = tempDiv.textContent || tempDiv.innerText || "";
          return plainText.replace(/\n{3,}/g, "\n\n").trim();
        }

        function prepareFacebookTextFormat(formattedData) {
          const { blocks, blockTypes, blockDepths, inlineStyles } =
            formattedData.formatted;
          const plainText = formattedData.plainText;
          const blockData = blocks.map(() => "{}");
          const entities = blocks.map(() => "[]");
          const formattedInlineStyles = inlineStyles.map((styles) => {
            if (!styles || !styles.length) return "[]";
            return JSON.stringify(styles);
          });
          return {
            message: { ranges: [], text: plainText },
            composed_text: {
              blocks,
              block_types: blockTypes,
              block_depths: blockDepths,
              block_data: blockData,
              entities,
              entity_map: "{}",
              inline_styles: formattedInlineStyles,
            },
          };
        }

        async function createPost(
          text,
          attachments,
          fbDtsg,
          userId,
          targetInfo,
          apiEndpoint,
        ) {
          // params.tokens is passed as the second argument to postToFacebookDirectApiShared
          // but inside this injected function context, we need to access them via arguments or scope.
          // IMPORTANT: The 'tokens' object containing LSD/ActorID is passed into the `aFunctionToInject`
          // args list. We need to make sure we access them.

          await addRandomDelay(800, 1500);

          // 1. Text Processing
          const spintaxProcessedHtml = processSpintax(text || "");
          const tempDiv = document.createElement("div");
          tempDiv.innerHTML = spintaxProcessedHtml;

          const hasHtmlLink = !!tempDiv.querySelector("a[href]");
          const plainTextContentForCheck = tempDiv.textContent;
          const urlRegex =
            /(https?:\/\/|www\.)[^\s/$.?#].[^\s]*|\b[a-zA-Z0-9-]+\.(com|org|net|edu|gov|io)\b/i;
          const hasPlainTextLink = urlRegex.test(plainTextContentForCheck);
          const hasLink = hasHtmlLink || hasPlainTextLink;

          let finalPayload;
          if (hasLink) {
            console.log("Link detected. Using plain text payload.");
            const plainText =
              convertHtmlToPlainTextForFacebook(spintaxProcessedHtml);
            finalPayload = { message: { text: plainText, ranges: [] } };
          } else {
            console.log("Using formatted text payload.");
            finalPayload = await processPostText({
              text: spintaxProcessedHtml,
            });
          }

          // 2. Audience Setup
          let audience =
            targetInfo.isGroup || targetInfo.isPage
              ? { to_id: targetInfo.targetId }
              : { privacy: { base_state: "EVERYONE" } };

          // 3. Generate UUID (v4)
          const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
            /[xy]/g,
            function (c) {
              var r = (Math.random() * 16) | 0,
                v = c == "x" ? r : (r & 0x3) | 0x8;
              return v.toString(16);
            },
          );

          // 4. Construct Variables
          const variables = {
            input: {
              composer_entry_point: "inline_composer",
              composer_source_surface: targetInfo.isGroup
                ? "group"
                : "timeline",
              composer_type: targetInfo.isGroup ? "group" : "timeline",
              source: "WWW",
              message: finalPayload.message,
              composed_text: finalPayload.composed_text || null,
              attachments: attachments,
              audience: audience,
              actor_id: params.actorID || userId, // Use ActorID if available (Page support)
              client_mutation_id: Math.floor(Math.random() * 100000).toString(),
              text_format_preset_id: "0",
              with_tags_ids: null,
              inline_activities: [],
              group_flair: { flair_id: null },
              tracking: [null],
              event_share_metadata: { surface: "newsfeed" },
              logging: { composer_session_id: uuid },
              navigation_data: {
                attribution_id_v2: `CometGroupDiscussionRoot.react,comet.group,via_cold_start,${Date.now()},854321,2361831622,,`,
              },
            },
            feedLocation: targetInfo.isGroup ? "GROUP" : "TIMELINE",
            feedbackSource: 0,
            focusCommentID: null,
            gridMediaWidth: null,
            groupID: null,
            scale: 2,
            privacySelectorRenderLocation: "COMET_STREAM",
            renderLocation: targetInfo.isGroup ? "group" : "timeline",
            useDefaultActor: false,
            inviteShortLinkKey: null,
            isFeed: false,
            isFundraiser: false,
            isFunFactPost: false,
            isGroup: targetInfo.isGroup,
            isEvent: false,
            isTimeline: !targetInfo.isGroup,
            isSocialLearning: false,
            isPageNewsFeed: false,
            isProfileReviews: false,
            isWorkSharedDraft: false,
            hashtag: null,
            canUserManageOffers: false,
            // Relay Flags
            __relay_internal__pv__CometUFIShareActionMigrationrelayprovider: false,
            __relay_internal__pv__GHLShouldChangeSponsoredDataFieldNamerelayprovider: true,
            __relay_internal__pv__GHLShouldChangeAdIdFieldNamerelayprovider: true,
            __relay_internal__pv__CometUFI_dedicated_comment_routable_dialog_gkrelayprovider: false,
            __relay_internal__pv__CometUFICommentAvatarStickerAnimatedImagerelayprovider: false,
            __relay_internal__pv__IsWorkUserrelayprovider: false,
            __relay_internal__pv__CometUFIReactionsEnableShortNamerelayprovider: false,
            __relay_internal__pv__TestPilotShouldIncludeDemoAdUseCaserelayprovider: false,
            __relay_internal__pv__FBReels_deprecate_short_form_video_context_gkrelayprovider: true,
            __relay_internal__pv__FeedDeepDiveTopicPillThreadViewEnabledrelayprovider: false,
            __relay_internal__pv__CometFeedStoryViewportMaxHeightMediaLayout_wearable_attribution_on_comet_feed_qerelayprovider: false,
            __relay_internal__pv__FBReels_enable_view_dubbed_audio_type_gkrelayprovider: false,
            __relay_internal__pv__CometImmersivePhotoCanUserDisable3DMotionrelayprovider: false,
            __relay_internal__pv__WorkCometIsEmployeeGKProviderrelayprovider: false,
            __relay_internal__pv__IsMergQAPollsrelayprovider: false,
            __relay_internal__pv__FBReels_enable_meta_ai_label_gkrelayprovider: true,
            __relay_internal__pv__FBReelsMediaFooter_comet_enable_reels_ads_gkrelayprovider: true,
            __relay_internal__pv__FBUnifiedLightweightVideoAttachmentWrapper_wearable_attribution_on_comet_reels_qerelayprovider: false,
            __relay_internal__pv__StoriesArmadilloReplyEnabledrelayprovider: true,
            __relay_internal__pv__FBReelsIFUTileContent_reelsIFUPlayOnHoverrelayprovider: true,
            __relay_internal__pv__GroupsCometGYSJFeedItemHeightrelayprovider: 206,
            __relay_internal__pv__ShouldEnableBakedInTextStoriesrelayprovider: false,
            __relay_internal__pv__StoriesShouldIncludeFbNotesrelayprovider: false,
            __relay_internal__pv__GHLShouldChangeSponsoredAuctionDistanceFieldNamerelayprovider: true,
            __relay_internal__pv__GHLShouldUseSponsoredAuctionLabelFieldNameV1relayprovider: true,
            __relay_internal__pv__GHLShouldUseSponsoredAuctionLabelFieldNameV2relayprovider: false,
          };

          // 5. Send Request
          const docId = "25506941462309420";

          // Build form data with ALL discovered tokens
          const formData = new URLSearchParams();
          formData.append("av", params.actorID || userId);
          formData.append("__user", userId);
          formData.append("__a", "1");
          formData.append("fb_dtsg", fbDtsg);
          formData.append("doc_id", docId);
          formData.append("variables", JSON.stringify(variables));
          formData.append("fb_api_caller_class", "RelayModern");
          formData.append(
            "fb_api_req_friendly_name",
            "ComposerStoryCreateMutation",
          );
          formData.append("server_timestamps", "true");

          // Inject LSD if found (Critical for validation)
          if (params.lsd) {
            formData.append("lsd", params.lsd);
          }

          // Inject Spin Data (Version Locking)
          if (params.spinR) formData.append("__spin_r", params.spinR);
          if (params.spinB) formData.append("__spin_b", params.spinB);
          if (params.spinT) formData.append("__spin_t", params.spinT);

          const response = await fetch(apiEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formData.toString(),
          });

          const responseText = await response.text();
          let jsonData = {};

          for (const line of responseText.split("\n")) {
            if (line.startsWith("{")) {
              try {
                const parsed = JSON.parse(line);
                if (parsed.data || parsed.errors) {
                  jsonData = parsed;
                  break;
                }
              } catch (e) {}
            }
          }

          console.log("Direct API Response:", jsonData);

          if (jsonData.data?.story_create?.story?.url) {
            return {
              url: jsonData.data.story_create.story.url,
              success: true,
              id: jsonData.data.story_create.story.id,
            };
          } else {
            const errorMsg =
              jsonData.errors?.[0]?.message || "Unknown API error";
            console.error("API Failure:", errorMsg, jsonData);
            throw new Error(errorMsg);
          }
        }
        (async function () {
          try {
            if (!params.fbDtsg || !params.userID)
              throw new Error("Missing auth tokens");
            const targetInfo = determinePostTarget();
            if (!targetInfo.targetId)
              throw new Error("Failed to determine post target ID.");
            let attachments = [];
            if (params.images && params.images.length > 0) {
              attachments = await uploadImages(
                params.images,
                params.fbDtsg,
                params.userID,
                targetInfo,
              );
            }
            const postResult = await createPost(
              params.postText,
              attachments,
              params.fbDtsg,
              params.userID,
              targetInfo,
              params.apiEndpoint,
            );

            // 4. When sending the success message, include the requestId from params.
            chrome.runtime.sendMessage({
              action: "directApiPostComplete",
              success: true,
              requestId: params.requestId, // <-- PASS THE ID BACK
              postUrl: postResult.url,
              postId: postResult.id,
            });
          } catch (error) {
            console.error("Error in injected posting process:", error);
            // 5. When sending the failure message, also include the requestId.
            chrome.runtime.sendMessage({
              action: "directApiPostComplete",
              success: false,
              requestId: params.requestId, // <-- PASS THE ID BACK
              error: error.message,
            });
          }
        })();
      };

      // 6. Inject the script, now PASSING THE requestId in the arguments.
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: aFunctionToInject,
        args: [
          {
            postText: post.text || "",
            fbDtsg: tokens.fbDtsg,
            userID: tokens.userID,
            // --- NEW FIELDS PASSED TO CONTENT ---
            lsd: tokens.lsd,
            actorID: tokens.actorID,
            spinR: tokens.spinR,
            spinB: tokens.spinB,
            spinT: tokens.spinT,
            // ------------------------------------
            images: post.images || [],
            commentOption: post.commentOption,
            firstCommentText: post.firstCommentText,
            useRandomDelay: true,
            requestId: requestId,
            apiEndpoint: apiEndpoint,
          },
        ],
      });

      // The function will now wait here for the `postResponsePromise` to be resolved or rejected
      // by the `handleDirectApiResponse` function.
      return await postResponsePromise;
    })();

    // --- Timeout Promise ---
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject({
          success: false,
          errorType: "timeout",
          message: `Direct API operation timed out after ${
            TIMEOUT_DURATION / 1000
          } seconds.`,
        });
      }, TIMEOUT_DURATION);
    });

    // Race the operation against the overall timeout.
    return await Promise.race([operationPromise, timeoutPromise]);
  } finally {
    // --- CRITICAL CLEANUP ---
    // 7. No matter what happens (success, failure, or timeout),
    // we MUST remove the promise from the Map to prevent memory leaks.
    if (directApiResponsePromises.has(requestId)) {
      directApiResponsePromises.delete(requestId);
      console.log(`Cleaned up promise for requestId: ${requestId}`);
    }
  }
}

async function handleFallbackPosting(
  postData, // this is currentPost from processPostsDirectApi
  groupLink,
  settings, // <-- We now receive the full settings object
  completedCallback,
) {
  let resource = null;
  let postKey = null;
  // *** THE FIX: Generate a unique requestId for the fallback operation ***
  const requestId = `fallback_${Date.now()}_${Math.random()
    .toString(36)
    .substring(2, 9)}`;

  try {
    console.log(`[Fallback] Attempting fallback for group: ${groupLink}`);
    updatePostingStatus("Trying alternative posting method...");

    resource = await createTab(groupLink, false, true); // createTab creates a popup window now
    await pingTabUntilReady(resource.id);

    // Prepare the post data, now including security level from settings.
    postKey = `post-${Date.now()}`;
    const postForContentScript = {
      ...postData,
      // Pass through comment options and security level to the content script.
      commentOption: settings.commentOption || "enable",
      firstCommentText: settings.firstCommentText || "",
      securityLevel: settings.securityLevel || "2", // Default to 'Balanced' if not set
    };

    await chrome.storage.local.set({ [postKey]: postForContentScript });

    // This promise will resolve/reject when the content script sends its response.
    const responsePromise = new Promise((resolve, reject) => {
      popupResponseQueue.set(requestId, { resolve, reject });
    });

    // *** THE FIX: Include the requestId in the message to the content script ***
    const contentAction = { action: "contentPostPost", postKey, requestId };
    await sendMessagetoContent(resource.id, contentAction);

    console.log(`[Fallback] Waiting for response with requestId: ${requestId}`);
    // Wait for the content script to report back success or failure.
    const result = await responsePromise;

    completedCallback({
      success: true, // If promise resolved, it was successful.
      status: result.status,
      error: null,
    });
  } catch (error) {
    console.error("[Fallback] Error during fallback posting:", error);
    popupResponseQueue.delete(requestId); // Clean up the queue on error
    completedCallback({
      success: false,
      error: error.message,
    });
  } finally {
    // This block ensures cleanup happens regardless of success or failure.
    if (resource)
      await closeTab(resource).catch((e) =>
        console.warn("Fallback tab cleanup warning:", e),
      );
    if (postKey)
      await chrome.storage.local
        .remove(postKey)
        .catch((e) => console.warn("Fallback postKey cleanup warning:", e));
  }
}

// Helper functions for Direct API posting
async function handleResponse() {
  let timeTaken = 0;
  while (timeTaken <= 60) {
    const response = await new Promise((resolve) => {
      chrome.storage.local.get(["operationDone"], (result) => {
        resolve(result.operationDone);
      });
    });
    console.log("operationDone:", response);
    if (response) {
      console.log("closing with successful - backend");
      await chrome.storage.local.remove("operationDone");
      return response === "successful";
    }
    await sleep(1);
    timeTaken++;
  }
  console.log("Timeout reached. No response found for operationDone.");
  console.log("closing with failed - backend");
  await chrome.storage.local.remove("operationDone");
  return false;
}

async function cleanupSharedBackgroundTab() {
  const { sharedTabId } = await getPostingState();

  if (sharedTabId !== null) {
    try {
      console.log("Attempting to clean up shared background tab:", sharedTabId);
      await chrome.tabs.remove(sharedTabId);
      console.log("Shared background tab successfully removed:", sharedTabId);
    } catch (error) {
      if (
        error.message.includes("No tab with id") ||
        error.message.includes("Invalid tab ID")
      ) {
        console.warn(`Cleanup notice: Tab ${sharedTabId} was already closed.`);
      } else {
        // Log other unexpected errors but don't let them crash the extension.
        console.error("Unexpected error during shared tab cleanup:", error);
      }
    } finally {
      // This is crucial: ALWAYS clear the ID from the session state,
      // even if the removal failed, to prevent trying to use a stale ID later.
      await setPostingState({ sharedTabId: null });
    }
  } else {
    console.log("Cleanup check: No shared background tab was active.");
  }
}

async function ensureNetworkConnection() {
  // 1. Check User Override
  const { skipNetworkCheck } =
    await chrome.storage.local.get("skipNetworkCheck");

  if (skipNetworkCheck) {
    console.log("[Network] Connectivity check skipped by user setting.");
    return true;
  }

  // 2. Multi-Target Logic
  const checkConnectivity = async () => {
    const targets = [
      { url: "https://www.facebook.com/favicon.ico", method: "HEAD" }, // Priority 1
      { url: "https://www.google.com/generate_204", method: "HEAD" }, // Priority 2
      { url: "https://1.1.1.1/", method: "HEAD" }, // Priority 3 (Cloudflare)
    ];

    try {
      // Promise.any resolves as soon as the FIRST request succeeds
      await Promise.any(
        targets.map((target) => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

          return fetch(target.url, {
            method: target.method,
            signal: controller.signal,
            cache: "no-store",
            mode: "no-cors", // Essential for opaque resources like favicon
          }).then(() => {
            clearTimeout(timeoutId);
            return true;
          });
        }),
      );

      return true; // At least one target is reachable
    } catch (e) {
      console.warn("[Network] All connectivity checks failed.");
      return false;
    }
  };

  // 3. Execution Loop
  if (await checkConnectivity()) {
    return true;
  }

  console.warn("Network unreachable. Pausing...");
  updatePostingStatus("⚠️ Connection unstable. Waiting...");

  while (!(await checkConnectivity())) {
    const state = await getPostingState();
    if (state.stopRequested) throw new Error("Stop requested");

    // Check setting again in case user toggles it while waiting
    const { skipNetworkCheck: dynamicSkip } =
      await chrome.storage.local.get("skipNetworkCheck");
    if (dynamicSkip) {
      console.log("[Network] User disabled check while waiting. Resuming.");
      return true;
    }

    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  console.log("Network connection confirmed.");
  updatePostingStatus("Connection restored. Resuming...");
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return true;
}

// in background.js
// ACTION: Replace the countdownDelay function

async function countdownDelay(totalSeconds) {
  if (totalSeconds <= 0) return;

  const endTime = Date.now() + totalSeconds * 1000;
  console.log(`Starting delay of ${totalSeconds}s...`);

  // Heartbeat intervals
  const keepAliveInterval = 15 * 1000; // 15s for Service Worker
  const activityUpdateInterval = 30 * 1000; // 30s for Self-Healing logic

  let nextKeepAlive = Date.now() + keepAliveInterval;
  let nextActivityUpdate = Date.now() + activityUpdateInterval;

  while (Date.now() < endTime) {
    const state = await getPostingState();
    if (state.stopRequested) {
      console.log("[countdownDelay] Stop requested. Exiting delay early.");
      return;
    }

    const remainingMs = endTime - Date.now();
    const waitTime = Math.min(1000, remainingMs);

    await new Promise((resolve) => setTimeout(resolve, waitTime));

    const now = Date.now();

    // 1. Service Worker Keep-Alive
    if (now >= nextKeepAlive) {
      try {
        await chrome.storage.local.get(null); // Dummy read
        nextKeepAlive = now + keepAliveInterval;
      } catch (e) {}
    }

    // 2. Self-Healing Heartbeat (The Fix)
    // Updates the timestamp so checkForDueScheduledPosts knows we are still active
    if (now >= nextActivityUpdate) {
      await chrome.storage.local.set({ lastActivityTimestamp: now });
      nextActivityUpdate = now + activityUpdateInterval;
      console.log("[countdownDelay] Updated activity timestamp.");
    }

    const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    updatePostingStatus(`Break: ${minutes}m ${seconds}s remaining...`);
  }

  const state = await getPostingState();
  if (!state.stopRequested) {
    console.log("Delay finished.");
    updatePostingStatus("Resuming posting...");
  }
}
// Helper function to get randomized delay
function getRandomizedDelay(baseSeconds) {
  // Randomize between 70% and 150% of the base delay
  const multiplier = Math.random() * (1.5 - 0.7) + 0.7;
  return Math.round(baseSeconds * multiplier);
}

// Helper function for random delays - more human-like behavior
function getRandomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Simplified tab verification - much faster
async function quickTabVerify(tabId) {
  if (!tabId) return false;

  try {
    // Just check if the tab exists, no need to wait for loading
    const tab = await chrome.tabs.get(tabId);
    return !!tab; // Returns true if tab exists
  } catch (error) {
    console.error("Tab verification failed:", error);
    return false;
  }
}

// Function to check if delay should be applied
function shouldApplyDelay(currentGroupIndex, groupNumberForDelay) {
  return (currentGroupIndex + 1) % groupNumberForDelay === 0;
}

// Standalone mode: no external uninstall URL
// chrome.runtime.setUninstallURL("");

// background.js

// --- ADD THIS AT THE TOP or in a suitable config section ---

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";
// ---

// in background.js
// ACTION: Replace the entire `handleAiRequest` function.

async function handleAiRequest(contentOrPrompt, options, temperature, tabId) {
  // The `tabId` is now a required parameter.
  if (!tabId) {
    console.error(
      "AI Request Error: No tabId was provided to send the result to.",
    );
    return;
  }

  try {
    const licenseStatus = await checkLicenseStatus();
    if (!licenseStatus.isAuthorized) {
      // Send a failure message directly to the specific tab.
      chrome.tabs.sendMessage(tabId, {
        action: "aiResult",
        success: false,
        error: licenseStatus.message,
        errorType: "license",
      });
      return;
    }

    const response = await callDeepSeekApi(
      contentOrPrompt,
      options,
      temperature,
    );

    // Send the successful result directly to the specific tab.
    chrome.tabs.sendMessage(tabId, {
      action: "aiResult",
      success: true,
      content: response,
    });
  } catch (error) {
    console.error("AI Request Error:", error);
    // Send the failure result directly to the specific tab.
    chrome.tabs.sendMessage(tabId, {
      action: "aiResult",
      success: false,
      error: error.message,
    });
  }
}

// --- UPDATED: High-Performance AI Engine (v3 - Creative 1.5) ---
async function callDeepSeekApi(
  contentOrPrompt,
  options,
  temperature,
  systemMessageOverride = null,
  retryCount = 0,
) {
  // Use 1.5 for maximum creativity as requested, unless it's Spintax (needs logic > chaos)
  const enhanceMode = options?.mode || "conversion";
  const targetTemp = enhanceMode === "spintax" ? 1.1 : 1.5;

  console.log(
    `[AI Engine] Requesting... (Attempt ${retryCount + 1}, Temp: ${targetTemp})`,
  );

  // --- 1. THE "ANTI-ROBOT" HUMANIZER PROTOCOL ---
  const HUMANIZER_PROTOCOL = `
### HUMANIZATION & STYLE PROTOCOL (STRICT):
1.  **LANGUAGE:** Detect the language of the user's input/prompt. Output **ONLY** in that same language. Do not translate unless asked.
2.  **NO AI-ISMS:** You are strictly FORBIDDEN from using these words: "Unleash", "Unlock", "Elevate", "Revolutionize", "Game-changer", "In today's world", "Delve", "Tapestry", "Crucial", "Paramount", "Realm", "Landscape".
3.  **TONE:** Conversational, punchy, and "street-smart". Use contractions (e.g., "it's", "don't"). Use sentence fragments for impact.
4.  **FORMAT:** Use emojis 🚀 to break up text visually. Use <strong> to highlight only the most critical 3-4 words (hooks/offers).
`;

  // --- 2. DATA PRESERVATION & TECH SPECS ---
  const TECHNICAL_SPECS = `
### TECHNICAL & DATA RULES:
1.  **PRESERVE DATA:** You must **NEVER** change or remove: URLs (http/https), Phone Numbers, Email Addresses, or Proper Nouns (Names/Places). Copy them exactly as they appear.
2.  **QUILL COMPATIBILITY:** Output **ONLY** raw HTML body content. Use only: <p>, <br>, <strong>, <em>, <ul>, <li>. Do NOT use <h1>/<h2>.
3.  **NO MARKDOWN:** Do NOT use \`\`\`html code blocks. Return string only.
4.  **NO FILLER:** Do not say "Here is the post". Just give the content.
`;

  let systemMessage = "";
  let userMessage = "";
  const isGeneration = !!options?.tone;

  // --- 3. MODE-SPECIFIC PROMPT ENGINEERING ---

  if (systemMessageOverride) {
    // A/B Testing or Custom logic
    userMessage = contentOrPrompt;
    systemMessage = `${systemMessageOverride}\n${HUMANIZER_PROTOCOL}\n${TECHNICAL_SPECS}`;
  } else if (isGeneration) {
    // --- MODE: GENERATE NEW ---
    const toneInstruction = options.tone || "Friendly and Engaging";

    systemMessage = `You are an Elite Direct Response Copywriter.
Your goal is to write a high-converting Facebook post that generates massive engagement and clicks.

${HUMANIZER_PROTOCOL}
${TECHNICAL_SPECS}

### CAMPAIGN BLUEPRINT:
1.  **The Hook:** Start with a question, a controversial statement, or a "You need to see this" angle.
2.  **The Body:** Write in a "${toneInstruction}" tone. Focus on benefits ("What's in it for them?"), not just features.
3.  **The Close:** End with a clear, singular Call to Action (CTA).
4.  **Spintax:** ${
      options.useSpintax
        ? "REQUIRED. Wrap key phrases in {A|B|C} for variety."
        : "Not required."
    }

### CONTEXT:
- Audience: ${options.targetAudience || "General Interest"}
- Keywords: ${options.keywords || "None"}
- CTA: ${options.callToAction || "Comment below"}
`;
    userMessage = `Topic: "${contentOrPrompt}"`;
  } else {
    // --- MODE: ENHANCEMENT ---

    if (enhanceMode === "spintax") {
      // --- SPINTAX ARCHITECT ---
      systemMessage = `You are a Spintax Logic Engine.
Your goal is to add extreme variability to the text using nested Spintax {option A|option B|option C}.

${TECHNICAL_SPECS}

### INSTRUCTIONS:
1.  **Maintain Logic:** Synonyms must make perfect grammatical sense in the sentence.
2.  **Maximize Density:** Spin greeting, adjectives, verbs, and CTAs. Target 50%+ of the text.
3.  **Language:** Keep the exact language of the input.
4.  **Safety:** Do NOT spin URLs or Phone numbers.
`;
      userMessage = `Apply heavy spintax to this:\n\n${contentOrPrompt}`;
    } else if (enhanceMode === "polish") {
      // --- THE EDITOR ---
      systemMessage = `You are a Senior Editor at a top publication.
Your goal is to make the text flow like water, fixing errors while making it sound more human and authoritative.

${HUMANIZER_PROTOCOL}
${TECHNICAL_SPECS}

### INSTRUCTIONS:
1.  **Clarity:** Break long, rambling sentences into punchy ones.
2.  **Correction:** Fix grammar/spelling without changing the "voice".
3.  **Formatting:** Add paragraph breaks (<p>) to improve readability on mobile screens.
4.  **Preservation:** Ensure all contacts/links are kept 100% intact.
`;
      userMessage = `Polish and humanize this:\n\n${contentOrPrompt}`;
    } else {
      // --- CONVERSION BOOST (Default) ---
      systemMessage = `You are a Marketing Psychologist and CRO Expert.
Your goal is to take the user's draft and transform it into a viral, high-converting asset.

${HUMANIZER_PROTOCOL}
${TECHNICAL_SPECS}

### OPTIMIZATION STRATEGY:
1.  **Identify the Goal:** What is the user selling or asking? Make that 10x clearer.
2.  **Emotional Trigger:** Add an emotional angle (FOMO, Curiosity, Gain).
3.  **Visuals:** Add relevant emojis 🚀 to guide the eye.
4.  **Formatting:** Use <strong> to bold the single most important benefit.
5.  **Preservation:** Do NOT break the links or change the phone numbers.
`;
      userMessage = `Rewrite for maximum conversion:\n\n${contentOrPrompt}`;
    }
  }

  // --- 4. EXECUTE REQUEST ---
  const requestBody = {
    messages: [
      { role: "system", content: systemMessage },
      { role: "user", content: userMessage },
    ],
    model: "deepseek-chat",
    temperature: targetTemp, // 1.5 for creative, 1.1 for spintax
    max_tokens: 2048,
    stream: false,
  };

  try {
    const forceRefresh = retryCount > 0;
    const apiKey = await getSecureApiKey(forceRefresh);

    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (response.status === 401 && retryCount < 1) {
      console.warn("[AI Engine] Key expired. Refreshing...");
      await chrome.storage.local.remove("aiApiKeyData");
      return await callDeepSeekApi(
        contentOrPrompt,
        options,
        temperature,
        systemMessageOverride,
        retryCount + 1,
      );
    }

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`AI Error ${response.status}: ${errorBody}`);
    }

    const data = await response.json();

    if (data.choices && data.choices.length > 0 && data.choices[0].message) {
      let rawContent = data.choices[0].message.content.trim();

      // --- 5. CLEANUP (Sanitize the "Creative" Output) ---

      // Remove Markdown
      rawContent = rawContent
        .replace(/^```html\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```$/i, "");

      // Remove conversational prefixes (Creative models love to chat)
      // We look for patterns like "Here is the Hungarian version:"
      const lines = rawContent.split("\n");
      if (lines.length > 0) {
        const first = lines[0].trim().toLowerCase();
        if (
          (first.startsWith("here") && first.includes(":")) ||
          (first.startsWith("sure") && first.includes(",")) ||
          first.startsWith("certainly")
        ) {
          rawContent = lines.slice(1).join("\n").trim();
        }
      }

      return rawContent;
    } else {
      throw new Error("Empty response from AI.");
    }
  } catch (error) {
    console.error("[AI Engine] Critical Failure:", error);
    throw error;
  }
}
// --- END OF NEW HELPER FUNCTIONS ---

// in background.js
// ACTION: Replace the executeSinglePopupOrAndroidPost function.

async function executeSinglePopupOrAndroidPost(
  post,
  groupLink,
  originalRequest,
  currentGroupIndex,
  totalGroups,
) {
  const { settings } = originalRequest;
  const requestId = `popup_${Date.now()}_${Math.random()
    .toString(36)
    .substring(2, 9)}`;

  let logEntry = {
    linkTitle: groupLink?.[0] || "N/A",
    linkURL: groupLink?.[1] || "N/A",
    postTitle: post.title || "Untitled",
    response: "skipped",
    reason: "Execution timed out (Watchdog)", // Default reason
    timestamp: new Date().toISOString(),
    method: "popup",
  };

  let telemetryData = { ui_snapshots: [], errors: [] };

  if (!groupLink?.[1]) {
    logEntry.reason = "Invalid group link";
    return { log: logEntry, telemetry: telemetryData };
  }

  // --- Night Mode Check (Existing Logic) ---
  if (settings.avoidNightPosting) {
    const nowHour = new Date().getHours();
    if (nowHour >= 22 || nowHour < 7) {
      updatePostingStatus(`Night pause active. Resuming at 7 AM...`);
      const now = new Date();
      let next7AM = new Date(now);
      next7AM.setHours(7, 0, 0, 0);
      if (now.getHours() >= 22 || now.getHours() < 7) {
        if (now >= next7AM) next7AM.setDate(next7AM.getDate() + 1);
      }
      const msUntil7AM = next7AM.getTime() - now.getTime();
      await countdownDelay(msUntil7AM / 1000);
      if ((await getPostingState()).stopRequested) {
        throw new Error("Stop requested");
      }
      updatePostingStatus("Resuming posting...");
    }
  }

  updatePostingStatus(
    `Posting to group ${currentGroupIndex + 1}/${totalGroups}: ${
      groupLink?.[0]
    }`,
  );

  let resource = null;
  let postKey = null;
  let tabClosedListener = null;

  // --- THE WATCHDOG TIMER ---
  // We define a maximum time allow for ONE post (e.g., 4 minutes).
  // If the content script gets stuck, this timer saves the day.
  const HARD_TIMEOUT_MS = 600000; // 10 Minutes

  try {
    // We wrap the logic in a Promise.race
    // Race between: 1. Actual Posting Logic, 2. The Watchdog Timer
    const result = await Promise.race([
      // 1. The Actual Posting Task
      new Promise(async (resolve, reject) => {
        try {
          popupResponseQueue.set(requestId, { resolve, reject });

          // Create the window
          resource = await createTab(groupLink[1], false, true);

          // Listener: If user manually closes the popup window
          tabClosedListener = (closedTabId) => {
            if (closedTabId === resource.id) {
              reject(new Error("Window closed by user"));
            }
          };
          chrome.tabs.onRemoved.addListener(tabClosedListener);

          // Handshake
          await pingTabUntilReady(resource.id);

          if ((await getPostingState()).stopRequested)
            throw new Error("Stop requested");

          // Prepare Data
          await sleep(2);
          postKey = `post-${Date.now()}`;
          const safeSettings = settings || {};
          const postForContentScript = {
            ...post,
            commentOption: safeSettings.commentOption || "enable",
            firstCommentText: safeSettings.firstCommentText || "",
            securityLevel: safeSettings.securityLevel || "2",
            postAnonymously: safeSettings.postAnonymously || false,
          };

          await chrome.storage.local.set({ [postKey]: postForContentScript });

          if ((await getPostingState()).stopRequested)
            throw new Error("Stop requested");

          // Send "GO" signal
          const contentAction = {
            action: "contentPostPost",
            postKey,
            requestId,
          };
          await sendMessagetoContent(resource.id, contentAction);

          // The promise will be resolved/rejected by 'handlePopupResponse' listener
        } catch (setupError) {
          reject(setupError);
        }
      }),

      // 2. The Watchdog Timer
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Watchdog: Hard Timeout Reached")),
          HARD_TIMEOUT_MS,
        ),
      ),
    ]);

    // --- Processing Success Result ---
    if (result.telemetry) {
      if (result.telemetry.ui_snapshots)
        telemetryData.ui_snapshots.push(...result.telemetry.ui_snapshots);
      if (result.telemetry.errors)
        telemetryData.errors.push(...result.telemetry.errors);
    }

    if (result.success) {
      logEntry.response = result.status;
      logEntry.reason = null;
    } else {
      logEntry.response = "failed";
      logEntry.reason = result.error || "Unknown error";
    }
  } catch (e) {
    // --- ERROR HANDLING & RECOVERY ---
    const errMsg = e?.message || String(e);
    const lowerMsg = errMsg.toLowerCase();

    if (errMsg === "Stop requested") {
      throw e; // Let the main loop handle the stop
    }

    if (
      lowerMsg.includes("window closed") ||
      lowerMsg.includes("closed prematurely")
    ) {
      // Treat manual/early close as a skip, not a hard failure
      console.warn(`[Watchdog] Posting window closed: ${errMsg}`);
      logEntry.response = "skipped";
      logEntry.reason = "Window closed";
    } else {
      console.error(`[Watchdog] Error in single post execution: ${errMsg}`);

      // Mark as failed but DO NOT throw.
      // This allows the main loop (in handlePostingRequest) to continue to the next iteration.
      logEntry.response = "failed";
      logEntry.reason = errMsg;

      if (errMsg.includes("Watchdog")) {
        // Special log for debugging
        console.warn("Watchdog killed a stuck tab. Continuing to next group.");
      }
    }

    telemetryData.errors.push({
      source: "executeSinglePopup_catch",
      message: errMsg,
    });
  } finally {
    // --- CLEANUP ---
    if (tabClosedListener)
      chrome.tabs.onRemoved.removeListener(tabClosedListener);
    popupResponseQueue.delete(requestId);

    // Force close the tab if it still exists (Crucial for "Zombie Tabs")
    if (resource) {
      console.log(`[Cleanup] Closing tab/window ${resource.id}`);
      await closeTab(resource).catch(() => {});
    }
    if (postKey) await chrome.storage.local.remove(postKey).catch(() => {});

    chrome.storage.local.set({ latestPostLog: logEntry });
  }

  // Delay Logic (same as before)
  const consideredSuccessful =
    logEntry.response === "successful" ||
    logEntry.response === "pending_approval";
  const shouldWaitFullDelay =
    consideredSuccessful || settings.delayAfterFailure === true;
  const isLast = currentGroupIndex + 1 === totalGroups;

  if (shouldWaitFullDelay && !isLast) {
    if (shouldApplyDelay(currentGroupIndex, settings.groupNumberForDelay)) {
      await countdownDelay(getRandomizedDelay(settings.timeDelay));
    } else {
      await sleep(getRandomDelay(2, 5));
    }
  } else if (!shouldWaitFullDelay && !isLast) {
    // If failed (and not forcing delay), move quickly to the next one
    await sleep(getRandomDelay(3, 8));
  }

  return { log: logEntry, telemetry: telemetryData };
}

// NEW HELPER FUNCTION: Converts markdown-style text from AI to safe HTML
function convertMarkdownToHtml(markdownText) {
  if (!markdownText) return "";

  // 1. Escape any potential HTML to prevent issues. THIS IS THE CORRECTED PART.
  const escapeHtml = (text) => {
    return text
      .replace(/&/g, "&")
      .replace(/</g, "<")
      .replace(/>/g, ">")
      .replace(/"/g, '"')
      .replace(/'/g, "'"); // Correctly handles single quotes
  };

  // 2. Process paragraphs: split by one or more newlines
  const paragraphs = markdownText
    .split(/\n\s*\n*/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  // 3. Process each paragraph for markdown and wrap in <p> tags
  const htmlParagraphs = paragraphs.map((p) => {
    // First, escape any raw HTML the user or AI might have accidentally included
    let processedLine = escapeHtml(p);

    // Now, safely convert markdown to HTML
    // Convert **bold text** to <strong>
    processedLine = processedLine.replace(
      /\*\*(.*?)\*\*/g,
      "<strong>$1</strong>",
    );
    // Convert *italic text* to <em>
    processedLine = processedLine.replace(/\*(.*?)\*/g, "<em>$1</em>");

    return `<p>${processedLine}</p>`;
  });

  return htmlParagraphs.join("");
}

// Helper function to get the fb_dtsg token without opening a tab
async function getFacebookDtsgToken() {
  try {
    const response = await fetch("https://www.facebook.com/settings");
    if (response.status === 304) {
      throw new Error("Not logged in to Facebook.");
    }
    const pageHtml = await response.text();
    const dtsgMatch = pageHtml.match(
      /"DTSGInitialData",\s*\[[^\]]*\],\s*\{[^{}]*"token"\s*:\s*"([^"]+)"[^{}]*\}/,
    );

    if (dtsgMatch && dtsgMatch[1]) {
      return dtsgMatch[1];
    } else {
      throw new Error(
        "Could not find fb_dtsg token. You may need to log in to Facebook.",
      );
    }
  } catch (error) {
    console.error("Error fetching fb_dtsg token:", error);
    throw error;
  }
}

// Main recursive function to fetch all groups via GraphQL API
async function fetchAllGroups(fb_dtsg, cursor = "") {
  const endpoint = "https://www.facebook.com/api/graphql/";
  const headers = { "Content-Type": "application/x-www-form-urlencoded" };
  let variables, doc_id, friendlyName;

  if (!cursor) {
    // Initial call for pinned groups and the first page of other groups
    variables = `variables=%7B%22ordering%22%3A%5B%22viewer_added%22%5D%2C%22scale%22%3A1%7D`;
    doc_id = `7740459739385247`;
    friendlyName = `GroupsCometPinnedGroupsDialogQuery`;
  } else {
    // Paginated call for subsequent groups
    variables = `variables=%7B%22count%22%3A10%2C%22cursor%22%3A%22${encodeURIComponent(
      cursor,
    )}%22%2C%22ordering%22%3A%5B%22viewer_added%22%5D%2C%22scale%22%3A1%7D`;
    doc_id = `7218669964900608`;
    friendlyName = `GroupsCometUnpinnedGroupsPaginationListPaginatedQuery`;
  }

  const body = `fb_dtsg=${fb_dtsg}&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=${friendlyName}&${variables}&server_timestamps=true&doc_id=${doc_id}`;

  const response = await fetch(endpoint, { method: "POST", headers, body });
  const json = await response.json();

  if (json.errors) {
    throw new Error(`Facebook API Error: ${json.errors[0].message}`);
  }

  const groups_tab = json.data?.viewer?.groups_tab;
  if (!groups_tab) {
    throw new Error("Invalid response format from Facebook API.");
  }

  let allGroups = [];

  // Pinned groups (only in the first response)
  if (!cursor && groups_tab.pinned_groups?.edges) {
    const pinned = groups_tab.pinned_groups.edges.map((edge) => ({
      id: edge.node.id,
      name: edge.node.name,
      url: edge.node.url || `https://www.facebook.com/groups/${edge.node.id}/`,
      privacy: edge.node.privacy_info?.title?.text,
    }));
    allGroups.push(...pinned);
  }

  // Regular groups list
  if (groups_tab.tab_groups_list?.edges) {
    const regular = groups_tab.tab_groups_list.edges.map((edge) => ({
      id: edge.node.id,
      name: edge.node.name,
      url: edge.node.url || `https://www.facebook.com/groups/${edge.node.id}/`,
      privacy: edge.node.privacy_info?.title?.text,
    }));
    allGroups.push(...regular);
  }

  // Handle pagination
  const page_info = groups_tab.tab_groups_list?.page_info;
  if (page_info?.has_next_page && page_info?.end_cursor) {
    // Small delay to be polite to the API
    await new Promise((resolve) => setTimeout(resolve, 500));
    const nextGroups = await fetchAllGroups(fb_dtsg, page_info.end_cursor);
    allGroups = allGroups.concat(nextGroups);
  }

  return allGroups;
}

// in background.js - REPLACE the existing newExtractGroupsWithApi function
async function newExtractGroupsWithApi(tabIdForMessaging) {
  try {
    // --- STAGE 1: PRIMARY METHOD (Direct API with Timeout) ---
    chrome.tabs.sendMessage(tabIdForMessaging, {
      action: "groupExtractionProgress",
      status: "Authenticating with Facebook...",
    });

    // Create a promise that rejects after 2 minutes
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error("Primary API method timed out after 2 minutes."));
      }, 120000); // 120,000 milliseconds = 2 minutes
    });

    // Create a promise for the actual API fetching logic
    const apiFetchPromise = (async () => {
      const dtsgToken = await getFacebookDtsgToken();

      chrome.tabs.sendMessage(tabIdForMessaging, {
        action: "groupExtractionProgress",
        status: "Fetching your group list (Primary Method)...",
      });

      const allGroups = await fetchAllGroups(dtsgToken);

      if (allGroups.length === 0) {
        throw new Error(
          "No groups were found. Please ensure you are a member of at least one Facebook group.",
        );
      }
      return allGroups;
    })();

    // Race the API fetch against the timeout
    const allGroups = await Promise.race([apiFetchPromise, timeoutPromise]);

    // --- SUCCESS: API Method Succeeded, Process and Save ---
    chrome.tabs.sendMessage(tabIdForMessaging, {
      action: "groupExtractionProgress",
      status: `Processing ${allGroups.length} groups...`,
    });

    const formattedLinks = allGroups.map((group) => [group.name, group.url]);
    const newGroupCollection = {
      title: `My Groups (${new Date().toLocaleDateString()})`,
      links: formattedLinks,
    };
    const { groups: existingGroups = [] } =
      await chrome.storage.local.get("groups");
    existingGroups.push(newGroupCollection);
    await chrome.storage.local.set({ groups: existingGroups });

    chrome.tabs.sendMessage(tabIdForMessaging, {
      action: "groupExtractionSuccess",
      message: `Successfully extracted and saved ${allGroups.length} groups!`,
    });
  } catch (primaryError) {
    console.error(
      "Primary API extraction failed, initiating scraping fallback...",
      primaryError,
    );
    chrome.tabs.sendMessage(tabIdForMessaging, {
      action: "groupExtractionProgress",
      status: "API method failed. Trying page scraping...",
    });

    // --- STAGE 2: FALLBACK METHOD (Scraping) ---
    try {
      await extractGroupsWithScraping(tabIdForMessaging);
      // The scraping function handles its own success/error messaging.
    } catch (scrapingError) {
      console.error("Scraping fallback also failed:", scrapingError);
      chrome.tabs.sendMessage(tabIdForMessaging, {
        action: "groupExtractionError",
        error: `All methods failed. Last error (Scraping): ${
          scrapingError.message || "Unknown error"
        }`,
      });
    }
  }
}
// in background.js - ADD THIS NEW HELPER FUNCTION

async function extractGroupsWithScraping(tabIdForMessaging) {
  let scrapeTabId = null;

  try {
    // A promise to wait for the scrape to complete
    const scrapePromise = new Promise((resolve, reject) => {
      const messageListener = (message, sender) => {
        if (message.action === "groupScrapeCompleted") {
          chrome.runtime.onMessage.removeListener(messageListener);
          clearTimeout(timeoutId);
          resolve(); // Resolve when the content script signals completion
        }
      };

      // Set a long timeout because scrolling can take a while
      const timeoutId = setTimeout(() => {
        chrome.runtime.onMessage.removeListener(messageListener);
        reject(
          new Error("The group scraping process timed out after 3 minutes."),
        );
      }, 180000); // 3-minute timeout

      chrome.runtime.onMessage.addListener(messageListener);
    });

    // Create the visible tab for scraping
    const groupsUrl = "https://www.facebook.com/groups/joins/";
    const tab = await createTab(groupsUrl, true); // Create an active, visible tab
    scrapeTabId = tab.id;

    // Send the message to the content script to start scraping
    await sendMessagetoContent(scrapeTabId, { action: "startGroupScrape" });
    console.log("SCRAPING FALLBACK: 'startGroupScrape' message sent.");

    // Wait for the scraping to finish
    await scrapePromise;
    console.log("SCRAPING FALLBACK: Scrape completed successfully.");
  } catch (error) {
    console.error("Error during scraping fallback:", error);
    // The finally block will handle tab cleanup
    throw error; // Re-throw the error to be caught by the main orchestrator
  } finally {
    // The content script is designed to close the tab itself upon completion or error.
    // So we don't need to explicitly close it here.
    if (scrapeTabId) {
      console.log(`Scraping tab ${scrapeTabId} is expected to close itself.`);
    }
  }
}

function getDelayBasedOnSecurity(baseSeconds, securityLevel) {
  let minMultiplier, maxMultiplier;

  switch (
    String(securityLevel) // Use String() to be safe
  ) {
    case "1": // Fast
      minMultiplier = 0.7;
      maxMultiplier = 1.0;
      break;
    case "3": // Safe
      minMultiplier = 1.2;
      maxMultiplier = 2.0;
      break;
    case "2": // Balanced (Default)
    default:
      minMultiplier = 0.8;
      maxMultiplier = 1.5;
      break;
  }

  const minSeconds = baseSeconds * minMultiplier;
  const maxSeconds = baseSeconds * maxMultiplier;

  return Math.floor(Math.random() * (maxSeconds - minSeconds + 1)) + minSeconds;
}

// in background.js
// ACTION: Replace this function to correctly return the 'wasStopped' flag.

async function handleRetryRequest(request) {
  console.log("--- Starting handleRetryRequest (v4 - Final) ---");

  const retryLogs = [];
  const { failedLogs, originalSettings } = request;
  let wasStopped = false; // Flag to track if stop was requested

  if (!failedLogs || failedLogs.length === 0) {
    return { logs: [], telemetry: {}, wasStopped: false };
  }

  let localBackgroundTabId = null;
  let fbTokens = {};
  const postingMethod = originalSettings.postingMethod || "directApi";
  let i = 0;

  try {
    if (postingMethod === "directApi") {
      updatePostingStatus("Retrying: Initializing Direct API...");
      fbTokens = await ensureFreshTokens();
      if ((await getPostingState()).stopRequested)
        throw new Error("Stop requested");
      localBackgroundTabId = await createSharedBackgroundTab();
    }
    if ((await getPostingState()).stopRequested)
      throw new Error("Stop requested");

    const { tags } = await chrome.storage.local.get(["tags"]);
    if (!tags || tags.length === 0) {
      throw new Error("Cannot retry: No post templates found in storage.");
    }

    updatePostingStatus(`Retrying ${failedLogs.length} failed post(s)...`);

    for (i = 0; i < failedLogs.length; i++) {
      if ((await getPostingState()).stopRequested) {
        wasStopped = true;
        break;
      }

      const failedLog = failedLogs[i];
      updatePostingStatus(
        `Retrying ${i + 1}/${failedLogs.length}: "${failedLog.postTitle}" to "${
          failedLog.linkTitle
        }"`,
      );

      const postTitleToFind = failedLog.postTitle.replace(
        /\s*\(AI Variation \d+\)$/,
        "",
      );
      const postObject = tags.find((t) => t.title === postTitleToFind);

      if (!postObject) {
        retryLogs.push({
          ...failedLog,
          response: "skipped",
          reason: `Original post template titled "${postTitleToFind}" not found.`,
          method: "system_retry_skip",
        });
        continue;
      }

      const groupLink = [failedLog.linkTitle, failedLog.linkURL];
      const postWithMedia = { ...postObject, mediaUrls: [] };
      if (postObject.images?.length > 0) {
        for (const media of postObject.images) {
          const processed = await preprocessMedia(
            media,
            originalSettings.compressImages,
          );
          if (processed.data) postWithMedia.mediaUrls.push(processed.data);
        }
      }

      try {
        let newLogResult;
        if (postingMethod === "directApi") {
          newLogResult = await executeSingleDirectApiPost(
            postWithMedia,
            groupLink,
            fbTokens,
            localBackgroundTabId,
            originalSettings,
          );
        } else {
          newLogResult = await executeSinglePopupOrAndroidPost(
            postObject,
            groupLink,
            { settings: originalSettings },
            i,
            failedLogs.length,
          );
        }

        retryLogs.push(newLogResult.log);

        if (i < failedLogs.length - 1) {
          if (shouldApplyDelay(i, originalSettings.groupNumberForDelay)) {
            await countdownDelay(
              getRandomizedDelay(originalSettings.timeDelay),
            );
          } else {
            await sleep(getRandomDelay(2, 7));
          }
        }
      } catch (error) {
        if (error.message === "Stop requested") {
          wasStopped = true;
          i++;
          break;
        }
        console.error(`Error during retry operation ${i}:`, error);
        retryLogs.push({
          ...failedLog,
          response: "failed",
          reason: `Retry Execution Error: ${error.message}`,
          method: "system_retry_execution_error",
        });
      }
    }

    if (wasStopped) {
      for (let j = i; j < failedLogs.length; j++) {
        retryLogs.push({
          ...failedLogs[j],
          response: "skipped",
          reason: "Stopped by user",
          method: "system_retry_stop",
        });
      }
    }
  } catch (error) {
    if (error.message === "Stop requested") {
      wasStopped = true;
      for (const log of failedLogs) {
        retryLogs.push({
          ...log,
          response: "skipped",
          reason: "Stopped by user",
          method: "system_retry_stop",
        });
      }
    } else {
      console.error("Critical error in handleRetryRequest:", error);
      retryLogs.push({
        response: "failed",
        reason: `Retry Run Error: ${error.message}`,
        timestamp: new Date().toISOString(),
        method: "system_retry_error",
      });
    }
  } finally {
    if (localBackgroundTabId) {
      updatePostingStatus("Cleaning up retry environment...");
      await cleanupSharedBackgroundTab(localBackgroundTabId);
    }
  }

  return { logs: retryLogs, telemetry: {}, wasStopped };
}

function handlePopupResponse(request) {
  const { requestId, success, error, status, telemetry } = request;

  if (popupResponseQueue.has(requestId)) {
    const promise = popupResponseQueue.get(requestId);

    // ALWAYS resolve. We handle the success/failure check in the caller.
    // This ensures telemetry data from the content script (like UI snapshots of errors)
    // is preserved and passed back to the background script.
    console.log(
      `[Popup Response] Resolving request ${requestId}. Success: ${success}`,
    );

    promise.resolve({
      success: success,
      status: status || (success ? "successful" : "failed"),
      error: error || null,
      telemetry: telemetry || {},
    });

    popupResponseQueue.delete(requestId);
  } else {
    console.warn(
      `Received response for an unknown or timed-out request ID: ${requestId}`,
    );
  }
}
// in background.js
// ACTION: Add this new function.

/**
 * The new "bulletproof" handshake. It repeatedly sends a "ping" message
 * to a tab until it receives a "pong" response, confirming the content script is ready.
 * @param {number} tabId The ID of the tab to ping.
 * @param {number} timeout The maximum time to wait in milliseconds.
 * @returns {Promise<boolean>} A promise that resolves with true on success, or rejects on timeout.
 */
function pingTabUntilReady(tabId, timeout = 20000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const intervalId = setInterval(async () => {
      // Check for overall timeout
      if (Date.now() - startTime > timeout) {
        clearInterval(intervalId);
        reject(
          new Error(
            `Handshake timeout: Tab ${tabId} did not respond to ping within ${
              timeout / 1000
            }s.`,
          ),
        );
        return;
      }

      try {
        // Send the ping message
        const response = await chrome.tabs.sendMessage(tabId, {
          action: "ping",
        });
        if (response && response.status === "ready") {
          // We got the pong! Success.
          console.log(
            `[Handshake] Received pong from tab ${tabId}. Connection is live.`,
          );
          clearInterval(intervalId);
          resolve(true);
        }
        // If response is not what we expect, the interval will just continue.
      } catch (error) {
        // This error is EXPECTED if the content script isn't ready yet.
        // We just ignore it and let the interval try again.
        console.log(
          `[Handshake] Ping to tab ${tabId} failed (content script likely not ready yet). Retrying...`,
        );
      }
    }, 500); // Ping every 500ms
  });
}

// ... [Keep existing top imports/variables] ...

// =================================================================
// ----- I N D E X E D   D B   M E D I A   S T O R E -----
// Stores large videos efficiently to prevent message-passing crashes.
// =================================================================

const DB_NAME = "GPP_MediaStore";
const STORE_NAME = "videos";
const DB_VERSION = 1;

function openMediaDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

async function saveVideoToDB(id, blob, mimeType) {
  const db = await openMediaDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put({
      id,
      blob,
      type: mimeType,
      timestamp: Date.now(),
    });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function getVideoFromDB(id) {
  const db = await openMediaDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function cleanupOldMedia() {
  try {
    const db = await openMediaDB();
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const now = Date.now();
    // 24 Hour retention for temporary transfer buffer
    const RETENTION_PERIOD = 24 * 60 * 60 * 1000;

    const cursorRequest = store.openCursor();

    cursorRequest.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        // Check if timestamp exists and is older than retention period
        if (
          cursor.value.timestamp &&
          now - cursor.value.timestamp > RETENTION_PERIOD
        ) {
          // console.log(`[Cleanup] Removing stale video ID: ${cursor.key}`);
          cursor.delete();
        }
        cursor.continue();
      }
    };

    cursorRequest.onerror = (e) => console.warn("Cleanup cursor error:", e);
  } catch (e) {
    console.warn("Media cleanup failed (non-critical):", e);
  }
}
// Run cleanup on startup
cleanupOldMedia();

// =================================================================
// ----- V I D E O   S T R E A M I N G   S E R V E R -----
// Streams video chunks to content script via long-lived port.
// =================================================================

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "video-stream") {
    port.onMessage.addListener(async (msg) => {
      if (msg.action === "download_video" && msg.id) {
        try {
          const record = await getVideoFromDB(msg.id);
          if (!record) {
            port.postMessage({ error: "Video not found in DB" });
            return;
          }

          const blob = record.blob;
          const CHUNK_SIZE = 1024 * 512; // 512KB chunks
          let offset = 0;

          // 1. Send Metadata
          port.postMessage({
            action: "meta",
            size: blob.size,
            type: record.type,
          });

          // 2. Stream Chunks
          while (offset < blob.size) {
            const chunk = blob.slice(offset, offset + CHUNK_SIZE);
            const arrayBuffer = await chunk.arrayBuffer();

            // Send as array of bytes (compatible with serialization)
            port.postMessage({
              action: "chunk",
              data: Array.from(new Uint8Array(arrayBuffer)),
              offset: offset,
            });

            offset += CHUNK_SIZE;

            // Wait for acknowledgement to prevent memory flooding
            await new Promise((resolve) => {
              const ackListener = (ackMsg) => {
                if (ackMsg.action === "ack") {
                  port.onMessage.removeListener(ackListener);
                  resolve();
                }
              };
              port.onMessage.addListener(ackListener);
            });
          }

          // 3. Finish
          port.postMessage({ action: "done" });
        } catch (error) {
          console.error("Streaming error:", error);
          port.postMessage({ error: error.message });
        }
      }
    });
  }
});
