// global variables
const eventListeners = [];
let edit = null;
let tags = [];
let images = [];
let executed = false;
let activeIndex = null;
let activeIndexGroups = null;
let activeIndexProducts = null;
let groups = [];
let products = [];
let selectedPosts = []; // store selected posts
let selectedGroups = []; // Stores selected groups
let quickSelectedGroups = [];
let quickMedia = [];
let avoidNightTimePosting = false;
let disabledPosting = false;
let validated;
let isPostingInProgress = false;
let quill = null;
let quickPostQuill = null; // <-- ADD THIS NEW VARIABLE
let lastKnownQuillSelection = null; // <-- ADD THIS
let lastKnownQuickQuillSelection = null; // <-- ADD THIS
let freePostsRemaining = 0;
const GIFT_POSTS_AMOUNT = 3;
const BASE_INACTIVITY_DAYS = 3;
let historyPageSize = 20;
let historyCurrentLimit = 20;
let activeDateFilter = null; // Stores "YYYY-MM-DD" when a square is clicked
let currentLogData = { postsCompleted: [], historyEntry: null };
// At the top of popup.js, with other global variables
let currentCalendarDate = new Date();
let selectedCalendarDate = null;
let editingScheduleIndex = null;
const MAX_DAILY_FREE_POSTS = 3;
const MAX_FREE_GROUPS_PER_RUN = 7;

let currentTemplateVariations = {
  A: { html: "", delta: null },
  B: { html: "", delta: null },
  C: { html: "", delta: null },
  D: { html: "", delta: null },
};
let activeVariationTab = "A";
let activeTargeterBlockRef = null;
let aiWizardMedia = [];
let wizardSelectedPosts = new Set();
let wizardSelectedGroups = new Set(); // Stores indices
let wizardAdvancedGroups = []; // Stores raw advanced objects

let canvasDropHandler = null;
let canvasDragOverHandler = null;

let customModalOverlay,
  customModalTitleEl,
  customModalMessageEl,
  customModalConfirmBtn,
  customModalCancelBtn,
  customModalCloseBtnEl;
let currentSort = { by: "default", dir: "asc" }; // Default sort
let activeCategoryFilter = "all"; // Default to show all
// Callbacks for custom modal
let customModalConfirmCallback = null;
let customModalCancelCallback = null;
let editingCampaignId = null;
// ui element references
const selectPost = document.getElementById("selectPost");
// const selectGroup = document.getElementById("selectGroup");
// const selectProduct = document.getElementById("selectProduct");
const postingMethodSwitch = document.getElementById("postingMethodSwitch");
const postingMethodLabel = document.getElementById("postingMethodLabel");

// References for UI elements
const selectGroupWrapper = document.getElementById("selectGroupWrapper");
const selectGroupInput = document.getElementById("selectGroupInput");
let selectGroupOptions = document.getElementById("selectGroupOptions");
const selectedGroupsContainer = document.getElementById(
  "selectedGroupsContainer",
);

const spintaxModal = document.getElementById("spintax-modal-overlay");
const spintaxVariationsList = document.getElementById(
  "spintax-variations-list",
);
const addVariationBtn = document.getElementById("spintax-add-variation-btn");
const applySpintaxBtn = document.getElementById("spintax-modal-apply-btn");
const cancelSpintaxBtn = document.getElementById("spintax-modal-cancel-btn");
const closeSpintaxBtn = document.getElementById("spintax-modal-close");
const spintaxPreviewOutput = document.getElementById("spintax-preview-output");
const spintaxShuffleBtn = document.getElementById("spintax-shuffle-btn");

const mainPage = document.getElementById("main");

const enterTime = document.getElementById("enterTime");
const startPostingBtn = document.getElementById("startPosting");

const tagBTN = document.getElementById("tagBTN");
const productBTN = document.getElementById("productBTN");
const groupBTN = document.getElementById("groupBTN");
const SchedulerBTN = document.getElementById("SchedulerBTN");

const AddTagsPage = document.getElementById("AddTagsPage");
const addProductBTN = document.getElementById("addProductBTN");
const AddTagBTN = document.getElementById("AddTagBTN");
const TagsPage = document.getElementById("TagsPage");
const colorButtons = document.querySelectorAll("#colorSelector .color-button");

const addGroupsPage = document.getElementById("addGroupsPage");
const addGroupsBTN = document.getElementById("addGroupsBTN");
const groupsPage = document.getElementById("groupsPage");

const joinGroupsPage = document.getElementById("joinGroupsPage");
const autoJoinGroupsBTN = document.getElementById("autoJoinGroupsBTN");
const joinGroupsBTN = document.getElementById("joinGroupsBTN");
const cancelJoinGroupsBTN = document.getElementById("cancelJoinGroupsBTN");

const productPage = document.getElementById("productPage");
const AddProductPage = document.getElementById("AddProductPage");

const SchedulerPage = document.getElementById("SchedulerPage");
const pills = document.getElementById("pills");

const saveTag = document.getElementById("saveTag");
const cancelTag = document.getElementById("cancelTag");

const saveGroups = document.getElementById("saveGroups");
const cancelGroups = document.getElementById("cancelGroups");
const searchGroupInput = document.getElementById("searchGroupInput");
const groupInputsContainer = document.getElementById("groupInputsContainer");

const saveProduct = document.getElementById("saveProduct");
const cancelProduct = document.getElementById("cancelProduct");

const tagSelector = document.getElementById("tagSelector");
const selectPostWrapper = document.getElementById("selectPostWrapper");
const selectPostInput = document.getElementById("selectPostInput");
const selectPostOptions = document.getElementById("selectPostOptions");
const selectedPostsContainer = document.getElementById(
  "selectedPostsContainer",
);

const loading = document.querySelector(".LoadingDiv");
const LoadingContent = document.getElementById("LoadingContent");
const stopButton = document.getElementById("stopButton");
const LogsDiv = document.querySelector(".LogsDiv");
const CloseLogButton = document.getElementById("CloseLogButton");
const getProfileGroups = document.getElementById("getProfileGroups");

const forceResetStatusBtn = document.getElementById("forceResetStatusBtn");
const stuckProcessResetDiv = document.getElementById("stuckProcessReset");

const root = document.getElementById("root");
const errorMsg = document.getElementById("errorMsg");

const importGroupsButton = document.getElementById("importGroupsButton");
const exportGroupsButton = document.getElementById("exportGroupsButton");
const importGroupsInput = document.getElementById("importGroupsInput"); // Hidden file input

const aiVariationSection = document.getElementById("aiVariationSection");
const generateAiVariationsCheckbox = document.getElementById(
  "generateAiVariations",
);
const aiVariationOptions = document.getElementById("aiVariationOptions");
const postOrderSection = document.getElementById("postOrderSection");

// In popup.js, near other element references
const securityLevelSlider = document.getElementById("securityLevelSlider");
const securityLevelDescription = document.getElementById(
  "securityLevelDescription",
);
// Near other UI element references
const cancelEditScheduleBtn = document.getElementById("cancelEditScheduleBtn");
// Near other UI element references
const startPostingWrapper = document.getElementById("startPostingWrapper");

// ADD this with other global variables
let postCategories = [];

// ADD the UI element references
const manageCategoriesBtn = document.getElementById("manageCategoriesBtn");
const categoryFilterSelect = document.getElementById("categoryFilterSelect");
const selectCategoryInput = document.getElementById("selectCategoryInput");
const selectCategoryOptions = document.getElementById("selectCategoryOptions");
const selectedCategoriesContainer = document.getElementById(
  "selectedCategoriesContainer",
);
let selectedCategoryIds = []; // Stores IDs of categories assigned to the currently edited post

const categoryManagementModal = document.getElementById(
  "categoryManagementModal",
);
const categoryModalCloseBtn = document.getElementById("categoryModalCloseBtn");
const categoryModalDoneBtn = document.getElementById("categoryModalDoneBtn");
const addNewCategoryBtn = document.getElementById("addNewCategoryBtn");
const categoryListContainer = document.getElementById("categoryListContainer");
let editingCategoryId = null; // Used for managing category CRUD operations

document
  .getElementById("insertImageButton")
  .addEventListener("click", () => insertMedia("post"));

document
  .getElementById("addGroupButton")
  .addEventListener("click", addGroupInput);

document.getElementById("nightPost").addEventListener("change", function () {
  avoidNightTimePosting = this.checked;
});

const warningPopup = (id, title, message) => {
  return `     <div
id="${id}"
class="warning-popup">
<h5 class="text-warning">${title}</h5>
<p>
${message}
</p>
</div>`;
};

// in popup.js
// ACTION: Replace the entire onChanged listener with this final version.

chrome.storage.onChanged.addListener(function (changes, namespace) {
  if (namespace !== "local") return;

  // --- PRIORITY 1: Handle the FINAL 'done' state ---
  if (
    changes.isPostingInProgress &&
    changes.isPostingInProgress.newValue === "done"
  ) {
    console.log(
      "onChanged: Detected 'done' state. Checking completion status and forcing switch to final logs view.",
    );

    const loadingDiv = document.querySelector(".LoadingDiv");
    const mainPageDiv = document.getElementById("main");
    const logsDiv = document.querySelector(".LogsDiv");

    // Force hide other views and show the final logs
    if (loadingDiv) loadingDiv.classList.add("d-none");
    if (mainPageDiv) mainPageDiv.classList.add("d-none");
    if (logsDiv) logsDiv.classList.remove("d-none");

    // Render the final, complete logs from the master 'postsCompleted' list
    chrome.storage.local.get(
      ["postsCompleted", "postingSummary", "postingHistory"],
      function (result) {
        const logsUL = logsDiv ? logsDiv.querySelector(".logsUL") : null;
        const titleElement = logsDiv
          ? logsDiv.querySelector("#LoadingContent")
          : null;

        // *** THE FIX: Check the completionStatus and set the correct title ***
        if (titleElement) {
          if (result.postingSummary?.completionStatus === "stopped") {
            titleElement.textContent = "Posting Stopped by User";
          } else {
            titleElement.textContent = "Posting Completed!";
          }
        }
        // *** END FIX ***

        if (logsUL && result.postsCompleted) {
          // Find the most recent history entry for this run
          const latestHistoryEntry = result.postingHistory
            ? result.postingHistory[0]
            : null;
          MapLogsUL(result.postsCompleted, logsUL, latestHistoryEntry);
        }
      },
    );

    // ** CRITICAL CLEANUP **: Remove the live log data now that the job is finished.
    chrome.storage.local.remove("liveLogEntries");
    return; // Stop further processing in this listener for this event.
  }

  // --- PRIORITY 2: Handle other state changes ONLY IF NOT 'done' ---

  if (changes.isPostingInProgress) {
    const postingState = changes.isPostingInProgress.newValue;
    const loadingDiv = document.querySelector(".LoadingDiv");
    const mainPageDiv = document.getElementById("main");
    const logsDiv = document.querySelector(".LogsDiv");
    const stopBtn = document.getElementById("stopButton");

    if (postingState === "started") {
      // --- A NEW JOB HAS BEGUN ---
      console.log(
        "onChanged: Detected 'started' state. Switching to loading view.",
      );

      // 1. Force the correct UI view
      if (mainPageDiv) mainPageDiv.classList.add("d-none");
      if (logsDiv) logsDiv.classList.add("d-none");
      if (loadingDiv) loadingDiv.classList.remove("d-none");

      // 2. Enable the stop button
      if (stopBtn) {
        stopBtn.disabled = false;
        stopBtn.innerHTML = `<i class="fa fa-stop-circle"></i> Stop Posting`;
      }

      // 3. Force a re-render of the live log.
      const liveLogContainer = document.getElementById("liveLogContainer");
      if (liveLogContainer) {
        liveLogContainer.innerHTML = "";
        console.log("Cleared old live log view to prevent showing stale data.");
      }
      chrome.storage.local.get("liveLogEntries", (result) => {
        if (result.liveLogEntries) {
          console.log(
            "Found new live log data for the started job. Rendering it now.",
          );
          renderLiveLog(result.liveLogEntries);
        }
      });
    }
    // Note: The 'done' case is now handled at the top, so we don't need an `else if` here.
  }

  // Handle Real-Time Live Log Updates (while job is 'started')
  if (changes.latestPostLog && changes.latestPostLog.newValue) {
    const newLog = changes.latestPostLog.newValue;
    chrome.storage.local.get("liveLogEntries", (result) => {
      if (result.liveLogEntries) {
        const updatedEntries = updateLiveLogWithResult(
          newLog,
          result.liveLogEntries,
        );
        if (updatedEntries) {
          chrome.storage.local.set({ liveLogEntries: updatedEntries });
          renderLiveLog(updatedEntries);
        }
      }
    });
  }

  // Handle Status Text Updates (while job is 'started')
  if (changes.postingStatus) {
    const message = changes.postingStatus.newValue || "";
    const loadingContentEl = document.getElementById("LoadingContent");
    if (
      loadingContentEl &&
      document.querySelector(".LoadingDiv:not(.d-none)")
    ) {
      loadingContentEl.textContent = message;
    }
  }

  // Handle Data Refreshes for other pages (when not posting)
  if (
    changes.groups &&
    !document.getElementById("groupsPage").classList.contains("d-none")
  ) {
    groups = changes.groups.newValue || [];
    LoadGroups();
  }
  if (
    changes.postingHistory &&
    !document.getElementById("historyPage").classList.contains("d-none")
  ) {
    loadPostingHistory();
  }

  if (changes.campaigns) {
    console.log("Campaign state changed in background. Refreshing UI.");

    // 1. Refresh Upcoming/Schedule Page if visible
    if (
      !document
        .getElementById("scheduledPostsPage")
        .classList.contains("d-none")
    ) {
      loadScheduledPosts();
    }

    // 2. Refresh Campaign List Dashboard if visible
    if (
      !document.getElementById("CampaignsPage").classList.contains("d-none") &&
      !document.getElementById("campaignListView").classList.contains("d-none")
    ) {
      // We need to be careful not to close open dropdowns.
      // Instead of full re-render, we'll try to update status elements or just re-render and restore state.
      // For simplicity and robustness, we re-render the list but try to preserve open dropdowns.

      // Save currently open details panel index
      const openPanelBtn = document.querySelector(".details-toggle.open");
      let openIndex = null;
      if (openPanelBtn) {
        // Find the closest card wrapper to get the index
        const wrapper = openPanelBtn.closest(".campaign-list-item-wrapper");
        // We can infer index from the edit/delete buttons inside this wrapper
        const btn = wrapper.querySelector(".edit-btn");
        if (btn) openIndex = btn.dataset.index;
      }

      renderCampaignList();

      // Restore open state
      if (openIndex !== null) {
        setTimeout(() => {
          const newWrapper = document.querySelectorAll(
            ".campaign-list-item-wrapper",
          )[openIndex];
          if (newWrapper) {
            const toggle = newWrapper.querySelector(".details-toggle");
            if (toggle) toggle.click(); // Re-open
          }
        }, 50);
      }
    }
  }
});

// Main function that runs when the document is loaded
document.addEventListener("DOMContentLoaded", async function () {
  const mainPage = document.getElementById("main");
  const loadingOverlay = document.getElementById("initial-loading-overlay");

  function runStartupDiagnostics() {
    const issues = [];

    // Core DOM elements required for navigation and rendering
    const requiredIds = [
      "main",
      "initial-loading-overlay",
      "mainNavPostBtn",
      "mainNavTemplatesBtn",
      "postSubNavContainer",
      "postSwitcherTrack",
      "templatesSubNavContainer",
      "templatesSwitcherTrack",
      "quickPostBTN",
      "SchedulerBTN",
      "tagBTN",
      "groupBTN",
    ];

    requiredIds.forEach((id) => {
      if (!document.getElementById(id)) issues.push(`E001:${id}`);
    });

    if (!chrome?.storage?.local) issues.push("E002:storage");
    if (typeof Quill === "undefined") issues.push("E003:quill");
    if (typeof EmojiButton === "undefined") issues.push("E004:emoji");
    if (typeof I18n === "undefined") issues.push("E005:i18n");

    return issues;
  }

  function showStartupError(codes, error) {
    const loadingText = document.querySelector(
      "#initial-loading-overlay .loading-text",
    );

    const codeText = codes && codes.length ? `Error Code(s): ${codes}` : "";
    const baseMsg = "Error loading extension. Please try again.";
    if (loadingText) {
      loadingText.textContent = codeText
        ? `${baseMsg} ${codeText}`
        : baseMsg;
      loadingText.style.color = "#dc2626";
    }

    console.error("Startup failure:", error);
  }

  async function initializeApp() {
    try {
      const diagIssues = runStartupDiagnostics();
      if (diagIssues.length > 0) {
        const codes = diagIssues.join(",");
        await chrome.storage.local.set({ startupErrorCodes: codes });
        throw new Error(`STARTUP_DIAGNOSTICS_FAILED:${codes}`);
      }

      // All your existing setup code goes here, but now it's awaited.
      // This ensures everything completes before we show the main app.
      await checkAndResetDailyLimit();
      // Perform license validation and wait for it to complete.
      await performValidation();

      // Load other necessary data from storage.
      const data = await chrome.storage.local.get([
        "tags",
        "groups",
        "postCategories",
      ]);
      tags = data.tags || [];
      groups = data.groups || [];
      products = data.products || [];
      postCategories = data.postCategories || [];
      await calculateAllFreshnessScores();
      LoadTags();
      LoadGroups();

      // Check for and display the tutorial if needed.
      const { tutorialShown2 } =
        await chrome.storage.local.get("tutorialShown2");
      if (!tutorialShown2) {
        setTimeout(showWelcomeTutorial, 500);
      }

      console.log("App initialization complete.");
    } catch (error) {
      let codeList = "";
      if (error && typeof error.message === "string") {
        const match = error.message.match(/STARTUP_DIAGNOSTICS_FAILED:(.*)$/);
        if (match && match[1]) codeList = match[1];
      }
      showStartupError(codeList, error);
    }
  }

  // --- 2. Run the initialization and then hide the loading screen ---
  await initializeApp();

  // All setup is done. Now, reveal the main UI.
  if (mainPage && loadingOverlay) {
    mainPage.style.transition = "opacity 0.4s ease-in";
    mainPage.classList.remove("d-none"); // Make it take up space
    try {
      initHierarchicalNav();
    } catch (e) {
      console.warn("initHierarchicalNav failed:", e);
    }
    // A tiny delay to ensure the browser registers the visibility change before starting the fade-in.
    setTimeout(() => {
      mainPage.style.opacity = "1";
    }, 10);

    // Fade out and hide the loading overlay.
    loadingOverlay.classList.add("hidden");
  }

  chrome.storage.local.get(
    ["isPostingInProgress", "postsCompleted", "liveLogEntries"], // <-- Add 'liveLogEntries'
    function (result) {
      if (result.isPostingInProgress === "started") {
        // --- A JOB IS ALREADY RUNNING ---
        console.log("Detected 'started' status on popup load.");

        // 1. Hide main and logs, show loading screen.
        if (mainPage) mainPage.classList.add("d-none");
        if (LogsDiv) LogsDiv.classList.add("d-none");
        if (loading) loading.classList.remove("d-none");

        // 2. Render the LIVE LOG with the most recent data. (THE FIX)
        if (result.liveLogEntries) {
          console.log("Found existing live log data. Rendering it now.");
          renderLiveLog(result.liveLogEntries);
        }

        // 3. Show the 'Force Reset' button as a failsafe.
        if (stuckProcessResetDiv) {
          setTimeout(() => {
            stuckProcessResetDiv.style.display = "block";
          }, 500);
        }

        // 4. Ensure stop button is enabled.
        if (stopButton) {
          stopButton.disabled = false;
          stopButton.innerHTML = `<i class="fa fa-stop-circle"></i> Stop Posting`;
        }
      } else if (
        result.isPostingInProgress === "done" &&
        result.postsCompleted
      ) {
        // --- A JOB JUST FINISHED (and popup was closed) ---
        console.log("Detected 'done' status on popup load.");

        // 1. Hide main and loading, show final logs screen.
        if (mainPage) mainPage.classList.add("d-none");
        if (loading) loading.classList.add("d-none");
        if (LogsDiv) LogsDiv.classList.remove("d-none");

        // 2. Render the final summary.
        const logsContainer = document.querySelector(".LogsDiv .logsUL");
        if (logsContainer) {
          MapLogsUL(result.postsCompleted, logsContainer);
        }
      } else {
        // --- NO JOB IS RUNNING (Normal startup) ---
        console.log("Detected normal startup state on popup load.");

        // 1. Hide loading and logs, show main page.
        if (loading) loading.classList.add("d-none");
        if (LogsDiv) LogsDiv.classList.add("d-none");
        if (mainPage) mainPage.classList.remove("d-none");

        // 2. Ensure failsafe/stop buttons are correctly reset.
        if (stuckProcessResetDiv) stuckProcessResetDiv.style.display = "none";
        if (stopButton) stopButton.disabled = true;

        // 3. Run validation to enable/disable the 'Start Posting' button.
        enableStartPostingIfReady();
      }
    },
  );
  await updateTierUI();

  const checklistHeader = document.getElementById("checklistHeader");
  const checklistBody = document.getElementById("checklistBody");

  // 1. Initial State: Always OPEN when popup loads (since popup.js reloads every time)
  if (checklistBody) {
    checklistBody.classList.add("open");
  }

  // Helper to collapse
  const collapseChecklist = () => {
    if (checklistBody) checklistBody.classList.remove("open");
  };

  // 2. Toggle on Header Click
  if (checklistHeader) {
    checklistHeader.addEventListener("click", () => {
      checklistBody.classList.toggle("open");
    });
  }

  // 3. Collapse on ANY Tab Navigation (Main Nav or Sub Nav)
  const allNavButtons = document.querySelectorAll(".nav-link, .switcher-btn");
  allNavButtons.forEach((btn) => {
    btn.addEventListener("click", collapseChecklist);
  });

  document.querySelectorAll(".checklist-action").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const action = btn.dataset.action;

      if (action === "extract") {
        // ... existing extract logic ...
        document.getElementById("groupBTN").click();
        setTimeout(
          () => document.getElementById("getProfileGroups").click(),
          100,
        );
      } else if (action === "template") {
        // ... existing template logic ...
        document.getElementById("tagBTN").click();
        setTimeout(() => document.getElementById("AddTagBTN").click(), 100);
      } else if (action === "post") {
        // ... existing post logic ...
        document.getElementById("mainNavPostBtn").click();
      }
      // --- NEW ACTION ---
      else if (action === "upgrade") {
        openPricingModal(); // Opens the high-converting modal we built earlier
      }
    });
  });

  document
    .getElementById("closeProModalBtn")
    ?.addEventListener("click", closePricingModal);

  // Pricing Card Buttons
  document.querySelectorAll(".btn-price-action").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      return; // No external links in standalone mode
    });
  });
  const headerActivateBtn = document.getElementById("headerActivateBtn");
  if (headerActivateBtn) {
    headerActivateBtn.addEventListener("click", (e) => {
      e.preventDefault();
      // Show the activation page (reusing your existing logic)
      showActivationPage();
    });
  }

  // 2. Modal "Activate License" Link Listener
  const modalActivateBtn = document.getElementById("modalActivateBtn");
  if (modalActivateBtn) {
    modalActivateBtn.addEventListener("click", (e) => {
      e.preventDefault();
      // Close pricing modal first
      closePricingModal();
      // Open activation page
      setTimeout(() => showActivationPage(), 300);
    });
  }

  // Close modal on outside click
  document.getElementById("proUpgradeModal")?.addEventListener("click", (e) => {
    if (e.target.id === "proUpgradeModal") closePricingModal();
  });
  let savedRange = null; // Variable to store the last known selection
  const quillContainer = document.getElementById("editor-container");
  const placeholderText = I18n.t("quillPhTemplate");

  if (quillContainer) {
    quill = new Quill("#editor-container", {
      theme: "snow",
      placeholder: placeholderText,
      modules: {
        toolbar: {
          container: "#toolbar",
          handlers: {
            emoji: function () {
              // 'this' refers to the toolbar module
              const emojiButton = this.container.querySelector(".ql-emoji");
              picker.togglePicker(emojiButton);
            },
          },
        },
      },
    });
    window.quill = quill; // <--- ADD THIS LINE
    // Listen for selection changes and save the current range
    quill.on("selection-change", function (range, oldRange, source) {
      if (range) {
        savedRange = range;
        lastKnownQuillSelection = range;
        //console.log("Selection saved:", savedRange);
      }
    });
    quill.on("text-change", () => {
      syncEditorToState();
      // We only want to update the buttons if the AddTagsPage is actually visible.
      const addTagsPage = document.getElementById("AddTagsPage");
      if (addTagsPage && !addTagsPage.classList.contains("d-none")) {
        updateAddTagsAiButtonStates();
      }
    });
    // Prevent toolbar buttons from stealing focus
    document.querySelectorAll("#toolbar button").forEach((button) => {
      button.addEventListener("mousedown", (e) => {
        e.preventDefault(); // Prevent focus from being stolen
        if (button.classList.contains("ql-emoji")) {
          // Save selection when the emoji button is pressed
          savedRange = quill.getSelection(true);
        }
      });
    });
  } else {
    console.error("Editor container not found!");
  }

  // Initialize Emoji Button
  const picker = new EmojiButton({
    position: "bottom-start", // Position of the picker relative to the button
    theme: "light", // Theme: 'light', 'dark', or 'auto'
    showPreview: false,
    emojisPerPage: 20, // Number of emojis per page
    emojiSize: "36px",
    emojisPerRow: 7,
    rows: 4,
    recentsCount: 5,
    autoHide: false,
  });

  picker.on("emoji", (emoji) => {
    if (quill) {
      quill.focus(); // Ensure the editor is focused
      console.log(savedRange, savedRange.index);
      if (savedRange) {
        quill.setSelection(
          savedRange.index,
          savedRange.length,
          0,
          Quill.sources.SILENT,
        ); // Restore the selection
        quill.insertText(savedRange.index, emoji, "user");
        let calc = savedRange + 1;
        quill.setSelection(calc, 0, Quill.sources.SILENT);
      } else {
        // If no selection saved, insert at the end of the editor
        quill.insertText(quill.getLength(), emoji, "user");
        quill.setSelection(
          quill.getLength() + emoji.length,
          Quill.sources.SILENT,
        );
      }
    }
  });

  // ACTION: Replace the Quick Post Quill & Emoji initialization block in popup.js

  const quickQuillContainer = document.getElementById("quick-editor-container");
  const quickToolbarContainer = document.getElementById("quick-toolbar");

  if (quickQuillContainer && quickToolbarContainer) {
    // 1. Initialize Emoji Picker FIRST so it's ready for the handler
    const quickPostEmojiPicker = new EmojiButton({
      position: "bottom-start",
      theme: "light",
      showPreview: false,
      emojisPerPage: 20,
      emojiSize: "22px",
      emojisPerRow: 6,
      rows: 3,
      recentsCount: 0,
      autoHide: false,
      zIndex: 9999, // Ensure it sits on top
    });

    // 2. Initialize Quill
    quickPostQuill = new Quill("#quick-editor-container", {
      theme: "snow",
      placeholder: I18n.t("quillPhQuick"),
      modules: {
        toolbar: {
          container: "#quick-toolbar",
          handlers: {
            emoji: function () {
              // Explicitly find the button in the specific toolbar
              const btn = document.querySelector("#quick-toolbar .ql-emoji");
              if (btn && quickPostEmojiPicker) {
                quickPostEmojiPicker.togglePicker(btn);
              }
            },
          },
        },
      },
    });
    window.quickPostQuill = quickPostQuill; // <--- ADD THIS LINE

    // 3. Attach Emoji Insert Listener
    quickPostEmojiPicker.on("emoji", (emoji) => {
      if (quickPostQuill) {
        quickPostQuill.focus();
        // Get valid range or default to end
        const range = quickPostQuill.getSelection(true) || {
          index: quickPostQuill.getLength() - 1,
          length: 0,
        };
        quickPostQuill.insertText(range.index, emoji, "user");
        // Move cursor after emoji
        quickPostQuill.setSelection(range.index + emoji.length, 0, "user");
      }
    });

    // 4. Character Counter & State Listeners
    const quickCharCounter = document.getElementById("quickCharCounter");

    quickPostQuill.on("selection-change", function (range) {
      if (range) lastKnownQuickQuillSelection = range;
    });

    quickPostQuill.on("text-change", () => {
      if (quickCharCounter) {
        const count = quickPostQuill.getText().trim().length;
        const key = count === 1 ? "countChars" : "countCharsPlural";
        quickCharCounter.textContent = I18n.t(key, [String(count)]);
      }
      updateQuickPostAiButtonStates();
      updateQuickPostButton();
    });

    // 5. Spintax Helper Button
    const quickPostSpintaxBtn = document.getElementById(
      "quickPostSpintaxHelperBtn",
    );
    if (quickPostSpintaxBtn) {
      addSafeListener(quickPostSpintaxBtn, "click", (e) => {
        e.preventDefault();
        openSpintaxModal(quickPostQuill);
      });
    }
  }

  // Event listener for Activate License button
  const activateLicenseButtons = document.querySelectorAll(
    "#activateLicenseButton",
  );
  activateLicenseButtons.forEach((button) => {
    button.addEventListener("click", () => {
      return; // Licensing disabled
    });
  });

  const startFreeTrialButtons = document.querySelectorAll(
    "#startFreeTrialButton",
  );
  startFreeTrialButtons.forEach((button) => {
    button.addEventListener("click", () => {
      return; // Licensing disabled
    });
  });
  // --- Upgrade Card Logic ---
  const toggleUpgradeBtn = document.getElementById("toggleUpgradeBtn");
  const upgradeDetailsPanel = document.getElementById("upgradeDetailsPanel");

  if (toggleUpgradeBtn && upgradeDetailsPanel) {
    toggleUpgradeBtn.addEventListener("click", () => {
      return; // Licensing disabled
    });
  }

  // --- Plan Link Handlers (CSP Safe) ---
  const planLinks = document.querySelectorAll(".plan-link");
  planLinks.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      return; // Licensing disabled
    });
  });

  const backButton = document.getElementById("closePopup");
  if (backButton) {
    backButton.addEventListener("click", () => {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const tab = tabs[0];
        const key = `injected-${tab.id}`;

        chrome.storage.local.get([key], function (result) {
          if (!result[key]) {
            chrome.scripting.executeScript(
              {
                target: { tabId: tab.id },
                files: ["content.js"],
              },
              () => {
                console.log("Content script injected into", tab.url);
                let obj = {};
                obj[key] = true;
                chrome.storage.local.set(obj, () => {
                  console.log("Flag set for tab:", tab.id);
                  chrome.tabs.sendMessage(tab.id, "OpenAutoPoster");
                });
              },
            );
          } else {
            console.log("Script already injected in tab", tab.id);
            chrome.tabs.sendMessage(tab.id, "OpenAutoPoster");
          }
        });
      });
    });
  }
  // Make sure listener for the reset button is added
  // in popup.js
  // ACTION: Add/Update the logic for the "New Campaign" and "Back" buttons

  const createNewCampaignBtn = document.getElementById("createNewCampaignBtn");
  const backToCampaignListBtn = document.getElementById(
    "backToCampaignListBtn",
  );

  if (createNewCampaignBtn) {
    createNewCampaignBtn.addEventListener("click", () => {
      const listView = document.getElementById("campaignListView");
      const builderView = document.getElementById("campaignBuilderView");

      if (listView) listView.classList.add("d-none");
      if (builderView) builderView.classList.remove("d-none");

      // Reset builder for new campaign
      const titleInput = document.getElementById("campaignTitle");
      const canvas = document.getElementById("campaignCanvas");

      if (titleInput) titleInput.value = "";
      if (canvas) {
        // Restore default canvas state with Start Node
        canvas.innerHTML = `
             
              
              <div class="canvas-empty-state">
                <i class="fa fa-arrow-up text-muted mb-2" style="font-size: 24px;"></i>
                <p>Drag the <strong>Trigger</strong> block here to start</p>
              </div>`;

        // IMPORTANT: Reset the listener flag to ensure initCampaignBuilder re-binds events
        delete canvas.dataset.listenersAttached;
      }

      editingCampaignId = null;
      const saveBtn = document.getElementById("saveCampaignBtn");
      if (saveBtn) saveBtn.innerHTML = "Save";

      // Re-init builder logic
      if (typeof initCampaignBuilder === "function") {
        initCampaignBuilder();
      }
    });
  }

  if (backToCampaignListBtn) {
    backToCampaignListBtn.addEventListener("click", () => {
      const listView = document.getElementById("campaignListView");
      const builderView = document.getElementById("campaignBuilderView");

      if (builderView) builderView.classList.add("d-none");
      if (listView) listView.classList.remove("d-none");

      if (typeof renderCampaignList === "function") {
        renderCampaignList();
      }
    });
  }

  const saveCampaignBtn = document.getElementById("saveCampaignBtn");
  if (saveCampaignBtn) {
    saveCampaignBtn.addEventListener("click", () => {
      // 1. Parse Data
      const campaignData = parseCampaignCanvas();
      if (!campaignData) return;

      chrome.storage.local.get("campaigns", (result) => {
        let currentCampaigns = result.campaigns || [];

        if (editingCampaignId) {
          // --- UPDATE MODE ---
          const index = currentCampaigns.findIndex(
            (c) => c.id === editingCampaignId,
          );

          if (index > -1) {
            // Retrieve the old campaign to preserve properties
            const oldCampaign = currentCampaigns[index];
            const oldStatus = oldCampaign.status; // <--- Defined here safely

            // Preserve ID and creation date
            campaignData.id = editingCampaignId;
            campaignData.createdAt = oldCampaign.createdAt;

            // PRESERVE STATUS Logic
            // If it was completed, we restart it (active).
            // If it was paused/active, we keep that state.
            campaignData.status =
              oldStatus === "completed" ? "active" : oldStatus;

            // Reset current step to 0 to apply new logic from start safely
            campaignData.currentStepIndex = 0;

            // Preserve runtime data if needed, but usually safer to clear on edit
            campaignData.runtimeData = {};

            currentCampaigns[index] = campaignData;

            showCustomModal(
              "Updated",
              "Campaign updated and restarted from Step 1.",
              "alert",
              () => {
                document.getElementById("backToCampaignListBtn").click();
              },
            );
          }
          editingCampaignId = null; // Reset global
        } else {
          // --- CREATE MODE ---
          currentCampaigns.push(campaignData);
          showCustomModal(
            "Created",
            "New campaign created and started.",
            "alert",
            () => {
              document.getElementById("backToCampaignListBtn").click();
            },
          );
        }

        chrome.storage.local.set({ campaigns: currentCampaigns }, () => {
          // 1. Notify Background Script
          chrome.runtime.sendMessage({ action: "runSchedulerCheck" });

          // 2. Refresh Upcoming
          loadScheduledPosts();

          // 3. Refresh List
          renderCampaignList();
        });
      });
    });
  }
  const openWizardBtn = document.getElementById("openAiWizardBtn");
  const closeWizardBtn = document.getElementById("closeAiWizardBtn");
  const cancelWizardBtn = document.getElementById("cancelAiWizardBtn");
  const generateBtn = document.getElementById("generateCampaignBtn");

  if (openWizardBtn) openWizardBtn.addEventListener("click", showAiWizard);
  if (closeWizardBtn) closeWizardBtn.addEventListener("click", hideAiWizard);
  if (cancelWizardBtn) cancelWizardBtn.addEventListener("click", hideAiWizard);
  if (generateBtn) generateBtn.addEventListener("click", handleAiWizardSubmit);
  const wizardDropzone = document.getElementById("aiWizardDropzone");
  const wizardInput = document.getElementById("aiWizardFileInput");

  if (wizardDropzone && wizardInput) {
    wizardDropzone.addEventListener("click", () => wizardInput.click());

    wizardDropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
      wizardDropzone.style.borderColor = "#6366f1";
    });
    wizardDropzone.addEventListener("dragleave", (e) => {
      e.preventDefault();
      wizardDropzone.style.borderColor = "#cbd5e1";
    });

    // Use the shared handler but with context 'aiwizard'
    wizardDropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      handleFileSelection(e.dataTransfer.files, "aiwizard");
    });

    wizardInput.addEventListener("change", (e) => {
      handleFileSelection(e.target.files, "aiwizard");
    });
  }

  // Helper to fill prompt from chips
  window.fillWizardPrompt = function (text) {
    const el = document.getElementById("aiWizardPrompt");
    if (el) el.value = text;
  };
  const wizardChips = document.querySelectorAll(".studio-chip");
  const wizardPrompt = document.getElementById("aiWizardPrompt");

  wizardChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      if (wizardPrompt) {
        // FIX: Get localized prompt from I18n using the data key
        const promptKey = chip.dataset.promptKey;
        if (promptKey) {
          wizardPrompt.value = I18n.t(promptKey);
        } else {
          // Fallback for old/unmapped chips
          wizardPrompt.value = chip.dataset.prompt;
        }
        // Visual feedback
        wizardChips.forEach((c) => c.classList.remove("selected"));
        chip.classList.add("selected");
      }
    });
  });

  // 1. Content Source Toggle
  document
    .querySelectorAll('input[name="aiContentSource"]')
    .forEach((radio) => {
      radio.addEventListener("change", (e) => {
        const isGen = e.target.value === "generate";
        document
          .getElementById("aiSourceGenerate")
          .classList.toggle("d-none", !isGen);
        document
          .getElementById("aiWizardMediaSection")
          .classList.toggle("d-none", !isGen); // Hide media upload if using existing templates
        document
          .getElementById("aiSourceExisting")
          .classList.toggle("d-none", isGen);
      });
    });

  // 2. Initialize Wizard Multi-Selects
  // We can reuse the UI logic but need custom handlers because these are not "Blocks"
  initWizardMultiSelect("wizard-post", tags, wizardSelectedPosts);
  initWizardMultiSelect("wizard-group", groups, wizardSelectedGroups);

  // 3. Advanced Group Button
  const advBtn = document.getElementById("aiWizardAdvancedGroupBtn");
  if (advBtn) {
    advBtn.addEventListener("click", () => openPostTargeter("aiwizard"));
  }
  if (forceResetStatusBtn) {
    forceResetStatusBtn.addEventListener("click", () => {
      showCustomModal(
        "Confirm Reset",
        "This will stop any active posting process, clear all temporary data, and reload the extension to ensure a clean state. Are you sure?",
        "confirm",
        () => {
          // onConfirm
          console.warn("Force resetting ALL posting state!");
          forceResetStatusBtn.disabled = true;
          forceResetStatusBtn.textContent = "Resetting...";

          chrome.runtime.sendMessage(
            { action: "forceClearState" },
            (response) => {
              // This callback runs after the background script has sent its confirmation,
              // right before the background script reloads itself.

              // We don't need to check for errors here, as the primary action is to
              // reload everything anyway.

              // Find the active tab to reload it.
              chrome.tabs.query(
                { active: true, currentWindow: true },
                (tabs) => {
                  if (tabs && tabs[0]) {
                    chrome.tabs.reload(tabs[0].id);
                  }
                },
              );

              // Close the popup window.
              window.close();
            },
          );
        },
        null, // onCancel
        "Yes, Force Reset",
        "Cancel",
      );
    });
  }

  document.querySelectorAll('[data-dismiss="modal"]').forEach((button) => {
    addSafeListener(button, "click", () => {
      // Similar dismissal logic as before
      const modal = button.closest(".modal");
      if (modal) {
        if (typeof $ !== "undefined") {
          $(modal).modal("hide");
        } else {
          modal.classList.remove("show");
          modal.style.display = "none";
          const backdrop = document.querySelector(".modal-backdrop");
          if (backdrop) backdrop.remove();
        }
      }
    });
  });
  initializeCustomModalElements(); // Initialize modal elements

  // --- Language Switcher Logic ---
  const langSelect = document.getElementById("languageSelect");

  if (langSelect) {
    // 1. Set initial value based on storage
    chrome.storage.local.get("custom_lang_code", (result) => {
      if (result.custom_lang_code) {
        langSelect.value = result.custom_lang_code;
      } else {
        langSelect.value = "default";
      }
    });

    // 2. Handle Change
    langSelect.addEventListener("change", async (e) => {
      const lang = e.target.value;
      const btn = document.getElementById("backButton"); // Use back button as loading indicator area
      let originalText = null;
      if (btn) {
        originalText = btn.textContent;
        btn.textContent = "Loading Language...";
        btn.disabled = true;
      } else {
        langSelect.disabled = true;
      }

      try {
        if (lang === "default") {
          // Clear override
          await chrome.storage.local.remove([
            "custom_i18n_dict",
            "custom_lang_code",
          ]);
        } else {
          // Fetch the specific locale file
          const url = chrome.runtime.getURL(`_locales/${lang}/messages.json`);
          const response = await fetch(url);
          if (!response.ok) throw new Error("Language file not found");

          const json = await response.json();

          // Save the dictionary and the code
          await chrome.storage.local.set({
            custom_i18n_dict: json,
            custom_lang_code: lang,
          });
        }

        // Reload to apply
        showCustomModal(
          "Language Changed",
          "Please reload the tab to apply the new language.",
          "alert",
          () => {
            window.location.reload();
          },
        );
      } catch (error) {
        console.error("Language switch failed:", error);
        alert("Failed to load language file. Please reinstall the extension.");
        if (btn) {
          btn.textContent = originalText;
          btn.disabled = false;
        } else {
          langSelect.disabled = false;
        }
      }
    });
  }

  if (manageCategoriesBtn) {
    addSafeListener(manageCategoriesBtn, "click", showCategoryManagementModal);
  }
  if (categoryModalCloseBtn)
    addSafeListener(
      categoryModalCloseBtn,
      "click",
      closeCategoryManagementModal,
    );
  const categoryFilterWrapper = document.getElementById(
    "categoryFilterSelectWrapper",
  );
  const categoryFilterInput = document.getElementById("categoryFilterInput");
  const categoryFilterOptions = document.getElementById(
    "categoryFilterOptions",
  );

  if (categoryFilterInput && categoryFilterOptions && categoryFilterWrapper) {
    // Listener to open/close the dropdown when the input is clicked
    addSafeListener(categoryFilterInput, "click", (event) => {
      event.stopPropagation(); // Prevent the document listener from closing it immediately
      categoryFilterOptions.classList.toggle("d-none");
    });

    // Listener to close the dropdown when clicking anywhere else on the page
    addSafeListener(document, "click", (event) => {
      // Check if the click happened outside the filter's wrapper
      if (!categoryFilterWrapper.contains(event.target)) {
        categoryFilterOptions.classList.add("d-none");
      }
    });
  }
  if (categoryModalDoneBtn)
    addSafeListener(
      categoryModalDoneBtn,
      "click",
      closeCategoryManagementModal,
    );
  if (addNewCategoryBtn)
    addSafeListener(addNewCategoryBtn, "click", handleSaveCategory);
  if (categoryFilterSelect)
    addSafeListener(categoryFilterSelect, "change", LoadTags);

  // ADD Category Assignment Listeners (on AddTagsPage)
  // NEW Category Combobox Listeners
  const comboboxContainer = document.getElementById(
    "category-combobox-container",
  );
  const comboboxInput = document.getElementById("categoryComboboxInput");
  const comboboxWrapper = document.querySelector(".category-combobox-wrapper");

  if (comboboxContainer && comboboxInput && comboboxWrapper) {
    // Open dropdown when the main container is clicked
    addSafeListener(comboboxContainer, "click", () => {
      document
        .getElementById("selectCategoryOptions")
        .classList.remove("d-none");
      comboboxInput.focus();
    });

    // Close dropdown when clicking outside
    addSafeListener(document, "click", (event) => {
      if (comboboxWrapper && !comboboxWrapper.contains(event.target)) {
        document
          .getElementById("selectCategoryOptions")
          .classList.add("d-none");
      }
    });
  }

  if (exportGroupsButton) {
    exportGroupsButton.addEventListener("click", handleExportGroups);
  }
  if (importGroupsButton) {
    importGroupsButton.addEventListener("click", () => {
      if (importGroupsInput) {
        importGroupsInput.click(); // Trigger hidden file input
      }
    });
  }
  if (importGroupsInput) {
    importGroupsInput.addEventListener("change", handleImportGroupFile);
  }
  if (generateAiVariationsCheckbox) {
    generateAiVariationsCheckbox.addEventListener("change", function () {
      if (aiVariationOptions) {
        aiVariationOptions.classList.toggle("d-none", !this.checked);
      }
    });
  }
  initializePostingOrderSwitcher();
  // In popup.js, inside the DOMContentLoaded listener, replace the old slider listener.
  if (advancedGroupSelectionBtn) {
    advancedGroupSelectionBtn.addEventListener("click", () =>
      openPostTargeter("scheduler"),
    );
  }
  if (quickAdvancedGroupSelectionBtn) {
    quickAdvancedGroupSelectionBtn.addEventListener("click", () =>
      openPostTargeter("quickpost"),
    );
  }
  if (postTargeterCloseBtn) {
    postTargeterCloseBtn.addEventListener("click", closePostTargeter);
  }
  if (postTargeterCancelBtn) {
    postTargeterCancelBtn.addEventListener("click", closePostTargeter);
  }
  if (postTargeterConfirmBtn) {
    postTargeterConfirmBtn.addEventListener("click", handleTargeterConfirm);
  }
  if (targeterIndividualSearch) {
    targeterIndividualSearch.addEventListener("input", handleIndividualSearch);
    // Close search results when clicking away
    document.addEventListener("click", (e) => {
      if (
        !document.getElementById("targeterSearchResults").contains(e.target) &&
        e.target !== targeterIndividualSearch
      ) {
        document
          .getElementById("targeterSearchResults")
          .classList.add("d-none");
      }
    });
  }
  document.querySelectorAll('input[name="targetingMode"]').forEach((radio) => {
    radio.addEventListener("change", handleTargetingModeChange);
  });
  document
    .getElementById("targeterRandomCount")
    .addEventListener("input", async (e) => {
      targeterState.randomCount = parseInt(e.target.value, 10);
      if (isNaN(targeterState.randomCount) || targeterState.randomCount < 1) {
        targeterState.randomCount = 1;
      }

      // --- THIS IS THE FIX ---
      // Fetch the group data directly before updating the summary.
      const { groups: currentGroups = [] } =
        await chrome.storage.local.get("groups");
      updateSummaryAndConfig(currentGroups);
      // --- END FIX ---
    });
  // In popup.js, inside the DOMContentLoaded listener, replace the old slider listener.
  document.querySelectorAll(".variation-pill").forEach((tab) => {
    tab.addEventListener("click", handleVariationTabClick);
  });
  if (securityLevelSlider) {
    const sliderThumb = document.querySelector(".slider-thumb-v2");
    const sliderLabels = document.querySelectorAll(".slider-label-v2");

    // Function to update the entire UI based on the slider's value
    const updateSliderUI = (value) => {
      const descriptions = {
        1: `<strong>${I18n.t("lblFast")}:</strong> ${I18n.t("secDescFast")}`,
        2: `<strong>${I18n.t("lblBalanced")}:</strong> ${I18n.t(
          "secDescBalanced",
        )}`,
        3: `<strong>${I18n.t("lblSafe")}:</strong> ${I18n.t("secDescSafe")}`,
      };

      // Update the description text
      if (securityLevelDescription) {
        securityLevelDescription.innerHTML = descriptions[value];
      }

      // Move the visual thumb
      if (sliderThumb) {
        const position = (value - 1) * (100 / 3);
        sliderThumb.style.left = `calc(${position}% + 4px)`;
      }

      // Update which label is active using our unique class
      sliderLabels.forEach((label) => {
        if (label.dataset.value === value) {
          label.classList.add("slider-label-active"); // USE UNIQUE CLASS
        } else {
          label.classList.remove("slider-label-active"); // USE UNIQUE CLASS
        }
      });
    };

    // Listen for changes on the REAL (hidden) input
    securityLevelSlider.addEventListener("input", function () {
      updateSliderUI(this.value);
    });

    // Set the initial state when the popup opens
    updateSliderUI(securityLevelSlider.value);
  }

  // --- NEW Help Modal Functionality ---
  const helpBadge = document.getElementById("helpBadge");
  if (helpBadge) {
    helpBadge.addEventListener("click", () => {
      // FIX: Localized HTML
      const helpMessage = `
      <div style="text-align: center;">
        <p>${I18n.t("helpEmailIntro")}</p>
        <p>${I18n.t("helpPageIntro")}</p>
      </div>
    `;

      showCustomModal(
        I18n.t("helpModalTitle"),
        helpMessage,
        "alert",
        null,
        null,
        I18n.t("helpClose"),
      );
    });
  }

  initializeSchedulerViews(); // Add this line

  // in popup.js, inside DOMContentLoaded
  // initBlackFridayCampaign(); // Disabled in standalone mode
  const templateBtn = document.getElementById("templateSpintaxHelperBtn");
  if (templateBtn) {
    addSafeListener(templateBtn, "click", (e) => {
      e.preventDefault();
      // ** Pass the `quill` instance directly **
      openSpintaxModal(quill);
    });
  }

  // 1. Templates Page Toggle (Existing)
  const toggleQualityScorerBtn = document.getElementById(
    "toggleQualityScorerBtn",
  );
  if (toggleQualityScorerBtn) {
    addSafeListener(toggleQualityScorerBtn, "click", () => {
      toggleScorerVisibility("qualityScorerContainer");
    });
  }

  // 2. Quick Post Page Toggle (NEW)
  const toggleQuickScorerBtn = document.getElementById(
    "toggleQuickQualityScorerBtn",
  );
  if (toggleQuickScorerBtn) {
    addSafeListener(toggleQuickScorerBtn, "click", () => {
      toggleScorerVisibility("quickQualityScorerContainer");
    });
  }

  // ACTION: Replace the entire toggleScorerVisibility function

  // Shared Helper
  function toggleScorerVisibility(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Determine context based on the container ID
    const context =
      containerId === "quickQualityScorerContainer" ? "quick" : "template";

    // Check if calculator exists
    const existingCalc = document.getElementById("postQualityCalculator");

    if (!existingCalc) {
      // Doesn't exist, init fresh
      window.postQualityCalculator.init(containerId, context);
    } else {
      // Exists... check if it's in the WRONG container
      const currentParent = existingCalc.parentElement;
      if (currentParent !== container) {
        window.postQualityCalculator.remove();
        window.postQualityCalculator.init(containerId, context);
      }
    }

    // Visibility Logic (Toggle showing/hiding the container)
    if (container.classList.contains("d-none")) {
      container.classList.remove("d-none");
      setTimeout(() => container.classList.add("show"), 10);
      // Trigger an immediate analysis now that it's visible
      window.postQualityCalculator.analyze();
    } else {
      container.classList.remove("show");
      container.addEventListener(
        "transitionend",
        () => {
          container.classList.add("d-none");
        },
        { once: true },
      );
    }
  }
  // Modal button listeners
  if (addVariationBtn)
    addVariationBtn.addEventListener("click", () => addVariationInput());
  if (applySpintaxBtn) applySpintaxBtn.addEventListener("click", applySpintax);
  if (cancelSpintaxBtn)
    cancelSpintaxBtn.addEventListener("click", closeSpintaxModal);
  if (closeSpintaxBtn)
    closeSpintaxBtn.addEventListener("click", closeSpintaxModal);
  if (spintaxShuffleBtn)
    spintaxShuffleBtn.addEventListener("click", updateSpintaxPreview);

  // in popup.js, inside the DOMContentLoaded listener
  createGlobalTooltip();
  // --- START: REPLACEMENT - Feedback Banner Logic (Based on Process Count) ---
  const feedbackBanner = document.getElementById("feedbackBanner");
  const giveFeedbackBtn = document.getElementById("giveFeedbackBtn");
  const closeFeedbackBtn = document.getElementById("closeFeedbackBtn");

  if (feedbackBanner && giveFeedbackBtn && closeFeedbackBtn) {
    const feedbackKey = "feedbackBannerDismissed";

    const dismissBanner = () => {
      chrome.storage.local.set({ [feedbackKey]: true });
      feedbackBanner.style.display = "none";
    };

    const checkAndShowBanner = async () => {
      try {
        // 1. Get both the dismissal status and the posting history from storage.
        const result = await chrome.storage.local.get([
          feedbackKey,
          "postingHistory",
        ]);

        // 2. Condition: If the banner has already been dismissed, do nothing.
        if (result[feedbackKey]) {
          return;
        }

        // 3. Condition: Check if the number of completed posting PROCESSES is greater than 10.
        const postingHistory = result.postingHistory || [];
        const completedProcessesCount = postingHistory.length;

        // console.log(`User has completed ${completedProcessesCount} posting processes.`);

        if (completedProcessesCount > 10) {
          // If they have completed MORE than 10 runs AND haven't dismissed it, show the banner.
          feedbackBanner.classList.remove("d-none");
        }
      } catch (error) {
        console.error("Error checking feedback banner conditions:", error);
      }
    };

    // Run the check when the popup loads.
    checkAndShowBanner();

    // Add listeners to dismiss the banner on any interaction.
    giveFeedbackBtn.addEventListener("click", dismissBanner);
    closeFeedbackBtn.addEventListener("click", dismissBanner);
  }

  checkSchedulerPause();
  document
    .getElementById("resumeSchedulerNow")
    .addEventListener("click", (e) => {
      e.preventDefault();
      chrome.storage.local.remove("schedulerPausedUntil", () => {
        document
          .getElementById("schedulerPausedBanner")
          .classList.add("d-none");
        // Optionally, trigger an immediate check
        chrome.runtime.sendMessage({ action: "runSchedulerCheck" });
      });
    });
  // --- END: REPLACEMENT - Feedback Banner Logic (Based on Process Count) ---

  // in popup.js, inside DOMContentLoaded

  // --- START: NEW SORT & FILTER POPOVER LISTENERS ---
  const sortFilterContainer = document.getElementById(
    "sort-filter-popover-container",
  );
  const sortFilterBtn = document.getElementById("sortFilterBtn");
  const sortFilterPopover = document.getElementById("sort-filter-popover");

  if (sortFilterBtn && sortFilterPopover && sortFilterContainer) {
    // Toggle popover visibility
    addSafeListener(sortFilterBtn, "click", (event) => {
      event.stopPropagation();
      sortFilterPopover.classList.toggle("d-none");
      // If we are opening it, populate the categories
      if (!sortFilterPopover.classList.contains("d-none")) {
        populatePopoverCategories();
      }
    });

    // Close popover when clicking outside
    addSafeListener(document, "click", (event) => {
      if (!sortFilterContainer.contains(event.target)) {
        sortFilterPopover.classList.add("d-none");
      }
    });

    // Handle clicks inside the popover (sorting and filtering)
    addSafeListener(sortFilterPopover, "click", (event) => {
      const target = event.target.closest("button");
      if (!target) return;

      // Handle Sort Option Clicks
      if (target.classList.contains("sort-option")) {
        currentSort.by = target.dataset.sortBy;
        currentSort.dir = target.dataset.sortDir;
        sortFilterPopover.classList.add("d-none"); // Close popover
        LoadTags(); // Re-render the list
      }

      // Handle Category Filter Clicks
      if (target.classList.contains("category-filter-option")) {
        activeCategoryFilter = target.dataset.categoryId;
        sortFilterPopover.classList.add("d-none"); // Close popover
        LoadTags(); // Re-render the list
      }
    });
  }

  const historySearchInput = document.getElementById("historySearchInput");
  const historyIssuesToggle = document.getElementById("historyIssuesToggle");
  const checkHealthBtn = document.getElementById("checkGroupHealthBtn");

  if (historySearchInput) {
    historySearchInput.addEventListener("input", renderHistoryList);
  }
  if (historyIssuesToggle) {
    historyIssuesToggle.addEventListener("change", renderHistoryList);
  }
  if (checkHealthBtn) {
    checkHealthBtn.addEventListener("click", analyzeGroupHealth);
  }

  const backupBtn = document.getElementById("backupDataBtn");
  const restoreBtn = document.getElementById("restoreDataBtn");
  const restoreInput = document.getElementById("restoreDataInput");

  if (backupBtn) {
    backupBtn.addEventListener("click", handleBackupData);
  }
  if (restoreBtn && restoreInput) {
    restoreBtn.addEventListener("click", () => restoreInput.click());
    restoreInput.addEventListener("change", handleRestoreData);
  }
  document
    .getElementById("quickInsertMediaButton")
    .addEventListener("click", () => {
      quickMediaInput.click();
    });
  // Modify the existing quickMediaInput listener to use the shared handler
  quickMediaInput.addEventListener("change", function (event) {
    handleFileSelection(event.target.files, "quickpost");
  });
});

CloseLogButton.addEventListener("click", async () => {
  if (currentLogData.postsCompleted.length > 0) {
    sendAnonymousTelemetry(
      currentLogData.postsCompleted,
      currentLogData.historyEntry,
    );
  }

  // Make async
  LogsDiv.classList.add("d-none");
  mainPage.classList.remove("d-none");
  selectedGroups = [];
  selectedPosts = [];
  checkSchedulerPause();
  try {
    // Clear posting status from storage
    await chrome.storage.local.remove([
      "isPostingInProgress",
      "postsCompleted",
      "postingStatus",
      "postingSummary", // Also clear summary
    ]);
    console.log("Cleared posting status after summary close.");
    loadScheduledPosts();
    const { internalRatingGiven } = await chrome.storage.local.get(
      "internalRatingGiven",
    );
    if (!internalRatingGiven) {
      console.log("Prompting for rating after summary close.");
      // Call our new master function that handles everything.
      showAndSetupRatingModal();
    } else {
      console.log("Rating already given, not prompting after summary close.");
    }

    // --- END RATING CHECK ---
  } catch (error) {
    console.error("Error during log close cleanup:", error);
  }
});

// in popup.js

getProfileGroups.addEventListener("click", () => {
  // Show the confirmation modal for MANUAL scraping and wait for user action.
  showCustomModal(
    I18n.t("extractConfirmTitle"),
    I18n.t("extractConfirmMsg"),
    "confirm",
    () => {
      // This is the onConfirm CALLBACK. It runs ONLY after the user clicks "OK, Start Scraping".
      console.log(
        "User confirmed manual scrape. Sending 'forceScrapeGroups' message.",
      );

      // Disable the button after confirmation to prevent multiple clicks.
      getProfileGroups.disabled = true;
      getProfileGroups.innerHTML = I18n.t("wizBtnAnalyzing");

      // Send the message to the background script to start the MANUAL scraping process.
      chrome.runtime.sendMessage(
        { action: "forceScrapeGroups" },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error(
              "Error sending forceScrapeGroups message:",
              chrome.runtime.lastError.message,
            );
            // Show an error modal if communication with background fails.
            showCustomModal("Error", I18n.t("wizError")); // Reusing connection error
            // Re-enable the button on error.
            getProfileGroups.disabled = false;
            getProfileGroups.innerHTML = I18n.t("btnExtract");
          } else {
            console.log(
              "Manual scrape request acknowledged by background script.",
              response,
            );
            // The button text will be updated by the progress listener.
          }
        },
      );
    },
    null, // No special action needed on cancel.
    I18n.t("extractBtnStart"),
    I18n.t("btnCancel"),
  );
});

// --- START OF FILE popup.js ---
// (Keep all existing code above this point)

// ----- MODIFIED Stop Button Listener -----
// in popup.js
// ACTION: Replace this event listener

stopButton.addEventListener("click", async () => {
  if (stopButton) {
    stopButton.disabled = true;
    stopButton.innerHTML = I18n.t("msgStopping"); // Localized
  }
  if (LoadingContent) LoadingContent.innerHTML = I18n.t("msgSendingStop"); // Localized

  chrome.runtime.sendMessage(
    { action: "stopPosting", manualPause: true },
    (response) => {
      // *** FIX: Log the actual error message ***
      if (chrome.runtime.lastError) {
        console.error(
          "Error sending stop message:",
          chrome.runtime.lastError.message ||
            JSON.stringify(chrome.runtime.lastError), // Log message or full object
        );
        // Handle error - maybe re-enable button?
        if (stopButton) {
          stopButton.disabled = false; // Re-enable on error
          stopButton.innerHTML = `<i class="fa fa-stop-circle"></i> ${I18n.t(
            "btnStop",
          )}`;
        }
        if (LoadingContent)
          LoadingContent.innerHTML = I18n.t("errStopFail", [
            chrome.runtime.lastError.message || "Unknown",
          ]); //
      } else if (response && response.stopped) {
        console.log("Stop request acknowledged by background.");
        // UI update (showing logs, hiding loading) will be handled by the
        // chrome.storage.onChanged listener when 'isPostingInProgress' becomes 'done'.
      } else {
        console.warn("Unexpected response to stop message:", response);
        // Handle unexpected response - maybe re-enable button?
        if (stopButton) {
          stopButton.disabled = false; // Re-enable on unexpected response too
          stopButton.innerHTML = I18n.t("btnStop"); // Localized
        }
        if (LoadingContent) LoadingContent.innerHTML = I18n.t("errStopUnknown"); // Localized
      }
    },
  );
});

// (Keep all existing code below this point)
// --- END OF FILE popup.js ---

// function updateSelectProductOptions() {
//   selectProduct.innerHTML = "";
//   const defaultProductOption = document.createElement("option");
//   defaultProductOption.value = "";
//   defaultProductOption.textContent = "Select a saved product";
//   selectProduct.appendChild(defaultProductOption);

//   // Loop through products and create an option for each
//   products.forEach((product, index) => {
//     const productOption = document.createElement("option");
//     productOption.value = index;
//     productOption.textContent = product.title || `Product ${index + 1}`; // Use title or a default name
//     selectProduct.appendChild(productOption);
//   });
// }

tagBTN.addEventListener("click", function (event) {
  SchedulerBTN.classList.remove("active");
  tagBTN.classList.add("active");
  //  productBTN.classList.remove("active");
  groupBTN.classList.remove("active");
  quickPostBTN.classList.remove("active");
  scheduledPostsPage.classList.add("d-none");
  scheduledPostsBtn.classList.remove("active");
  quickPostPage.classList.add("d-none");
  TagsPage.classList.remove("d-none");
  SchedulerPage.classList.add("d-none");
  groupsPage.classList.add("d-none");
  productPage.classList.add("d-none");
  historyPage.classList.add("d-none");
  historyListView.classList.remove("d-none");
  historyBTN.classList.remove("active");
  errorMsg.innerHTML = "";
  handleNavigationWhileEditing(); // <<< ADD THIS LINE
});
groupBTN.addEventListener("click", function (event) {
  SchedulerBTN.classList.remove("active");
  tagBTN.classList.remove("active");
  //  productBTN.classList.remove("active");
  groupBTN.classList.add("active");
  quickPostBTN.classList.remove("active");
  scheduledPostsPage.classList.add("d-none");
  scheduledPostsBtn.classList.remove("active");
  quickPostPage.classList.add("d-none");
  groupsPage.classList.remove("d-none");
  SchedulerPage.classList.add("d-none");
  productPage.classList.add("d-none");
  TagsPage.classList.add("d-none");
  historyPage.classList.add("d-none");
  historyListView.classList.remove("d-none");
  historyBTN.classList.remove("active");
  errorMsg.innerHTML = "";
  handleNavigationWhileEditing(); // <<< ADD THIS LINE
});

// productBTN.addEventListener("click", function (event) {
//   tagBTN.classList.remove("active");
//   groupBTN.classList.remove("active");
//   SchedulerBTN.classList.remove("active");
//   productBTN.classList.add("active");
//   quickPostBTN.classList.remove("active");
//   scheduledPostsPage.classList.add("d-none");
//   scheduledPostsBtn.classList.remove("active");
//   quickPostPage.classList.add("d-none");
//   SchedulerPage.classList.add("d-none");
//   TagsPage.classList.add("d-none");
//   groupsPage.classList.add("d-none");
//   historyPage.classList.add("d-none");
//   historyListView.classList.remove("d-none");
//   historyBTN.classList.remove("active");
//   productPage.classList.remove("d-none");

//   errorMsg.innerHTML = "";
// });

// Find and REPLACE the entire SchedulerBTN.addEventListener(...) block
SchedulerBTN.addEventListener("click", async function (event) {
  // --- START: NEW & CORRECTED LOGIC ---
  // If we are currently editing, cancel the edit before switching.
  handleNavigationWhileEditing();
  toggleCommentSettingsVisibility();
  // Explicitly reset the UI to "create new" state.
  startPostingWrapper.classList.remove("d-none");
  schedulePostButton.textContent = "Schedule for Later";
  cancelEditScheduleBtn.classList.add("d-none");
  editingScheduleIndex = null; // Ensure we are not in edit mode
  // --- END: NEW & CORRECTED LOGIC ---

  // --- The rest of the function remains as it was ---
  tagBTN.classList.remove("active");
  groupBTN.classList.remove("active");
  SchedulerBTN.classList.add("active");
  SchedulerPage.classList.remove("d-none");
  quickPostBTN.classList.remove("active");
  scheduledPostsBtn.classList.remove("active");
  quickPostPage.classList.add("d-none");
  TagsPage.classList.add("d-none");
  groupsPage.classList.add("d-none");
  productPage.classList.add("d-none");
  scheduledPostsPage.classList.add("d-none");
  historyPage.classList.add("d-none");
  historyListView.classList.remove("d-none");
  historyBTN.classList.remove("active");

  selectedGroups = [];
  selectedPosts = [];
  clearSelectedTags();
  clearSelectedGroups();

  // This part can remain unchanged
  try {
    const { fb_language_info, fb_profile_info, fb_visit_count } =
      await chrome.storage.local.get([
        "fb_language_info",
        "fb_profile_info",
        "fb_visit_count",
      ]);
    if (fb_language_info && !fb_language_info.isEnglish) {
      errorMsg.innerHTML = warningPopup(
        "notEnglish",
        "Attention!",
        "Please switch your Facebook language to English for the extension to work correctly.",
      );
    } else {
      errorMsg.innerHTML = "";
    }
  } catch (error) {
    console.error("Error accessing saved Facebook info:", error);
  }

  populateSelectPostOptions();
  populateSelectGroupOptions();
  enableStartPostingIfReady();
});
// Event listener for "Auto Join Groups" button
autoJoinGroupsBTN.addEventListener("click", function () {
  // Reset inputs
  document.getElementById("searchParameter").value = "";
  document.getElementById("groupSizeFilter").value = "";
  document.getElementById("saveGroupName").value = "";
  document.getElementById("saveGroupsAfterJoining").checked = false;

  // Show the auto-join groups page
  pills.classList.add("d-none");
  groupsPage.classList.add("d-none");
  document.getElementById("autoJoinGroupsPage").classList.remove("d-none");
});

// Event listener for "Cancel" button on Auto Join Groups Page
cancelAutoJoinGroupsBTN.addEventListener("click", function () {
  // Navigate back to the main groups page
  document.getElementById("autoJoinGroupsPage").classList.add("d-none");
  pills.classList.remove("d-none");
  groupsPage.classList.remove("d-none");
});

// in popup.js
// ACTION: Replace startAutoJoinBTN listener

startAutoJoinBTN.addEventListener("click", async function () {
  // --- FREEMIUM LOCK ---
  const { licenseVerified } = await chrome.storage.local.get("licenseVerified");
  if (!licenseVerified) {
    showCustomModal(
      I18n.t("modalProFeature"),
      I18n.t("lockAutoJoin"), // FIX: Localized
      "alert",
      () => {
        openPricingModal();
      },
      null,
      I18n.t("btnUnlock"), // FIX: Localized
    );
    return;
  }

  const searchParameter = document
    .getElementById("searchParameter")
    .value.trim();
  const groupSizeFilter =
    parseInt(document.getElementById("groupSizeFilter").value, 10) || 1000;
  const joinCounter =
    parseInt(document.getElementById("joinCounter").value, 10) || 10;
  const saveGroupName = document.getElementById("saveGroupName").value.trim();
  const saveGroupsAfterJoining = document.getElementById(
    "saveGroupsAfterJoining",
  ).checked;

  if (!searchParameter) {
    alert("Please enter a search parameter.");
    return;
  }
  if (saveGroupsAfterJoining && !saveGroupName) {
    saveGroupName = `${searchParameter}_${joinCounter}`;
  }

  chrome.runtime.sendMessage({
    action: "autoJoinGroups",
    searchParameter,
    groupSizeFilter,
    saveGroupsAfterJoining,
    saveGroupName,
    joinCounter,
  });

  document.getElementById("autoJoinGroupsPage").classList.add("d-none");
  pills.classList.remove("d-none");
  groupsPage.classList.remove("d-none");
});

addGroupsBTN.addEventListener("click", function (event) {
  document.getElementById("groupTitle").value = "";
  const groupInputsContainer = document.getElementById("groupInputsContainer");
  groupInputsContainer.innerHTML = ""; // Clear all existing group input fields
  document.getElementById("cutUpGroupsBtn").classList.add("d-none"); // Hide when creating new
  edit = null;

  // chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  //   if (
  //     tabs.length > 0 &&
  //     tabs[0].url &&
  //     !tabs[0].url.includes("facebook.com")
  //   ) {
  //     // console.log("not on facebook");
  //     // Clear previous error messages
  //     errorMsg.innerHTML = "";

  //     // Insert new error message
  //     errorMsg.insertAdjacentHTML(
  //       "beforeend",
  //       warningPopup(
  //         "notOnFacebook",
  //         "Attention!",
  //         "You must be on Facebook to auto collect all the Facebook groups' links you are a member in."
  //       )
  //     );
  //     document.getElementById("getProfileGroups").disabled = true;
  //   } else {
  //     // Clear error message if on Facebook
  //     errorMsg.innerHTML = "";

  //     // Enable the button if on Facebook
  //     document.getElementById("getProfileGroups").disabled = false;
  //   }
  // });
  // UI updates
  pills.classList.add("d-none");
  groupsPage.classList.add("d-none");
  addGroupsPage.classList.remove("d-none");
});

addProductBTN.addEventListener("click", function (event) {
  // UI updates
  pills.classList.add("d-none");
  productPage.classList.add("d-none");
  addProductPage.classList.remove("d-none");
  images = [];
  updateSelectedMedia("product");
  edit = null;
  document.getElementById("productTitle").value = "";
  document.getElementById("productPrice").value = "";
  document.getElementById("productCondition").value = "New";
  handleNavigationWhileEditing(); // <<< ADD THIS LINE
  document.getElementById("productDescription").value = "";
  // document.getElementById("productTags").value = ""; // Assuming tags are comma-separated
  // document.getElementById("productLocation").value = "";

  document.getElementById("publicMeetup").checked = false;
  document.getElementById("doorPickup").checked = false;
  document.getElementById("doorDropoff").checked = false;
});

// in popup.js
// ACTION: Update the AddTagBTN listener

AddTagBTN.addEventListener("click", function (event) {
  document.getElementById("postTitle").value = "";

  // Reset Variations logic
  resetVariations();
  if (quill) {
    quill.setContents([]); // Clear editor
  } else {
    console.warn("Quill editor is not initialized!");
  }
  resetVariations();
  images = [];
  updateSelectedMedia();

  edit = null;
  selectedCategoryIds = [];
  populateCategorySelectOptions();
  updateSelectedCategoriesUI();

  selectedColor = "#18191A";
  document.querySelectorAll(".color-button").forEach((button) => {
    if (button.getAttribute("data-color") === selectedColor) {
      button.style.border = "3px solid #000";
    } else {
      button.style.border = "none";
    }
  });

  pills.classList.add("d-none");
  TagsPage.classList.add("d-none");
  AddTagsPage.classList.remove("d-none");
  updateTitleCharCounter();
  updateQuillCharCounter();
  initAddTagsPageEnhancements();
  if (window.postQualityCalculator) {
    setTimeout(() => {
      window.postQualityCalculator.init("qualityScorerContainer", "template");
    }, 100);
  }
});

// in popup.js
// ACTION: Update the saveTag event listener

saveTag.addEventListener("click", function (event) {
  const title = document.getElementById("postTitle").value;

  // 1. Sync final state of current tab
  syncEditorToState();

  // 2. Collect valid variations
  const validVariations = [];
  ["A", "B", "C", "D"].forEach((key) => {
    const html = currentTemplateVariations[key].html;
    if (html && html.trim() !== "" && html !== "<p><br></p>") {
      validVariations.push(html);
    }
  });

  let finalHtmlText = "";
  let finalDelta = null;

  // 3. Construct Final Payload (Smart Wrapping)
  if (validVariations.length === 0) {
    finalHtmlText = "";
    finalDelta = [];
  } else if (validVariations.length === 1) {
    const content = validVariations[0];

    // Check if the content itself contains pipes (Spintax)
    // If Tab A is "{Hi|Hello}", we MUST save as "{{Hi|Hello}}"
    // so the loader treats it as one chunk, not two variations.
    if (
      content.includes("|") &&
      content.includes("{") &&
      content.includes("}")
    ) {
      finalHtmlText = `{${content}}`; // Double wrap
      finalDelta = null; // Can't save Delta for wrapped content
    } else {
      // Simple text, save normally
      finalHtmlText = content;
      // Try to preserve Delta if available
      const key = ["A", "B", "C", "D"].find(
        (k) => currentTemplateVariations[k].html === content,
      );
      finalDelta = currentTemplateVariations[key].delta;
    }
  } else {
    // Multiple variations -> Standard Wrapper { A | B }
    finalHtmlText = `{${validVariations.join("|")}}`;
    finalDelta = null;
  }

  const links = [];
  const linkInputs = document.querySelectorAll("#groupInputsContainer input");
  const color = selectedColor || "#18191A";

  // Highlight the saved color (UI cleanup)
  document.querySelectorAll(".color-button").forEach((button) => {
    if (button.getAttribute("data-color") === selectedColor) {
      button.style.border = "3px solid #000";
    } else {
      button.style.border = "none";
    }
  });

  linkInputs.forEach((input) => {
    links.push(input.value);
  });

  if (edit != null) {
    tags[edit] = {
      title,
      text: finalHtmlText,
      delta: finalDelta,
      images,
      links,
      color,
      categoryIds: selectedCategoryIds,
    };
    edit = null;
  } else {
    tags.push({
      title,
      text: finalHtmlText,
      delta: finalDelta,
      images,
      links,
      color,
      categoryIds: selectedCategoryIds,
    });
  }

  // Reset UI
  document.getElementById("postTitle").value = "";
  resetVariations();
  if (quill) quill.setContents([]);

  pills.classList.remove("d-none");
  TagsPage.classList.remove("d-none");
  AddTagsPage.classList.add("d-none");
  selectedColor = "#18191A";

  chrome.storage.local.set({ tags }, function () {
    // console.log("new tags saved", tags);
  });
  images = [];
  LoadTags();
});

saveGroups.addEventListener("click", function () {
  const groupTitle = document.getElementById("groupTitle").value.trim(); // Corrected the element ID from "grouTitle" to "groupTitle"
  const groupContainers = document.querySelectorAll(
    "#groupInputsContainer .form-group",
  );

  // Gather all the links into a nested array [linkTitle, linkURL]
  const groupLinks = Array.from(groupContainers)
    .map((container, index) => {
      const inputs = container.querySelectorAll("input");
      let linkTitle = inputs[0].value.trim(); // First input is the link title
      const linkURL = inputs[1].value.trim(); // Second input is the link URL

      // Check if link title is empty and set a default title if necessary
      if (!linkTitle) {
        linkTitle = `Link ${index + 1}`;
      }

      // Only return links that have a URL provided
      if (linkURL) {
        return [linkTitle, linkURL]; // Return as a pair of title and link
      } else {
        return null; // Do not return anything if there is no URL
      }
    })
    .filter((link) => link !== null); // Remove any null values from the array

  // Ensure a proper groupTitle is provided
  if (!groupTitle) {
    alert("Please provide a group title");
    return;
  }

  // Save group title and links
  if (edit !== null) {
    // Update existing group
    groups[edit] = { title: groupTitle, links: groupLinks };
    edit = null; // Reset edit index
  } else {
    // Create new group
    groups.push({ title: groupTitle, links: groupLinks });
  }
  // console.log("Groups saved", groups);

  // Save groups to local storage
  chrome.storage.local.set({ groups }, function () {
    // console.log("Groups saved", groups);
    LoadGroups(); // Refresh the groups display
  });

  // Clear input fields and switch back to the main UI
  document.getElementById("groupTitle").value = "";
  groupContainers.forEach((container) => {
    const inputs = container.querySelectorAll("input");
    inputs.forEach((input) => (input.value = ""));
  });

  // Switch back to the main UI view
  pills.classList.remove("d-none");
  groupsPage.classList.remove("d-none");
  addGroupsPage.classList.add("d-none");
  errorMsg.innerHTML = "";
});

saveProduct.addEventListener("click", function () {
  const productTitle = document.getElementById("productTitle").value;
  const productPrice = document.getElementById("productPrice").value;
  const productCondition = document.getElementById("productCondition").value;
  const productDescription =
    document.getElementById("productDescription").value;
  // const productTags = document.getElementById("productTags").value;
  // const productLocation = document.getElementById("productLocation").value;

  const meetupPreferences = {
    publicMeetup: document.getElementById("publicMeetup").checked,
    doorPickup: document.getElementById("doorPickup").checked,
    doorDropoff: document.getElementById("doorDropoff").checked,
  };

  // Construct the product object
  const product = {
    title: productTitle,
    price: productPrice,
    condition: productCondition,
    description: productDescription,
    // tags: productTags,
    // location: productLocation,
    meetupPreferences: meetupPreferences,
    images: images, // Images array from global scope
  };

  // Add or update the product in the products array
  if (edit !== null) {
    products[edit] = product; // Update existing product
    edit = null; // Reset the active index
  } else {
    products.push(product); // Add new product
  }

  // Clear the form fields after saving
  document.getElementById("productTitle").value = "";
  document.getElementById("productPrice").value = "";
  document.getElementById("productCondition").value = "New";
  document.getElementById("productDescription").value = "";
  // document.getElementById("productTags").value = "";
  // document.getElementById("productLocation").value = "";
  document.getElementById("publicMeetup").checked = false;
  document.getElementById("doorPickup").checked = false;
  document.getElementById("doorDropoff").checked = false;
  images = []; // Reset the images array
  updateSelectedMedia(); // Call this function to refresh the images displayed to the user

  // Hide the AddProductPage and show the productPage
  addProductPage.classList.add("d-none");
  pills.classList.remove("d-none");
  productPage.classList.remove("d-none");
});

cancelTag.addEventListener("click", function (event) {
  pills.classList.remove("d-none");
  TagsPage.classList.remove("d-none");
  AddTagsPage.classList.add("d-none");
  selectedColor = "#18191A";
  errorMsg.innerHTML = "";
});
cancelGroups.addEventListener("click", function (event) {
  document.getElementById("cutUpGroupsBtn").classList.add("d-none"); // Hide on cancel
  edit = null;
  images = [];
  updateSelectedMedia();
  pills.classList.remove("d-none");
  groupsPage.classList.remove("d-none");
  addGroupsPage.classList.add("d-none");
  errorMsg.innerHTML = "";
});

cancelProduct.addEventListener("click", function (event) {
  pills.classList.remove("d-none");
  productPage.classList.remove("d-none");
  addProductPage.classList.add("d-none");
  images = [];
  updateSelectedMedia("product");
  errorMsg.innerHTML = "";
});

// in popup.js
// ACTION: Replace the showHiddenPage and hideHiddenPage functions.

async function showHiddenPage() {
  const hiddenPage = document.getElementById("hiddenPage");
  if (!hiddenPage) return;

  // Make the container visible so transitions can run
  hiddenPage.classList.remove("d-none");

  // Use a minimal timeout to allow the browser to apply the 'd-none' removal
  // before we add the 'show' class to trigger the transition.
  setTimeout(() => {
    hiddenPage.classList.add("show");
  }, 10);

  // The rest of the function for populating data remains the same
  // Licensing disabled: always show active status without keys
  const statusInput = document.getElementById("verifiedBool");
  const keyInput = document.getElementById("licenseKey");
  const platformInput = document.getElementById("platformBought");
  if (statusInput) statusInput.value = "Active";
  if (keyInput) keyInput.value = "---";
  if (platformInput) platformInput.value = "---";

  const anonymousIdInput = document.getElementById("anonymousId");
  if (anonymousIdInput) {
    try {
      const userId = await getAnonymousUserId();
      anonymousIdInput.value = userId;
    } catch (error) {
      anonymousIdInput.value = "Error loading ID";
    }
  }

  const telemetryToggle = document.getElementById("allowTelemetryToggle");
  if (telemetryToggle) {
    chrome.storage.local.get({ allowTelemetry: true }, (result) => {
      telemetryToggle.checked = result.allowTelemetry;
    });
    // The listener for the toggle should already be in your DOMContentLoaded
  }
  const networkToggle = document.getElementById("skipNetworkCheckToggle");
  if (networkToggle) {
    chrome.storage.local.get("skipNetworkCheck", (result) => {
      // Default is FALSE (do not skip)
      networkToggle.checked = result.skipNetworkCheck || false;
    });
  }

  const manifest = chrome.runtime.getManifest();
  document.getElementById("versionInfo").textContent = I18n.t("lblVer", [
    manifest.version,
  ]);
}

function hideHiddenPage() {
  const hiddenPage = document.getElementById("hiddenPage");
  if (!hiddenPage) return;

  // Remove the 'show' class to trigger the fade-out and slide-out animations
  hiddenPage.classList.remove("show");

  // Wait for the transition to finish before hiding the element completely with d-none.
  // The timeout should match the transition duration in the CSS (0.3s = 300ms).
  setTimeout(() => {
    hiddenPage.classList.add("d-none");
  }, 300);
}

// Event listener for the back button
const backButton = document.getElementById("backButton");
if (backButton) {
  backButton.addEventListener("click", () => {
    hideHiddenPage();
  });
}
const aboutButton = document.getElementById("aboutButton");
if (aboutButton) {
  aboutButton.addEventListener("click", () => {
    // This function already exists and shows the license modal.
    // We are just calling it from a new place.
    showHiddenPage();
  });
}

const removeValidationKeyBtn = document.getElementById("removeValidationKey");
if (removeValidationKeyBtn) {
  removeValidationKeyBtn.addEventListener("click", () => {
    chrome.storage.local.remove(
      ["licenseVerified", "licenseExpiration", "license_key", "licenseProvider"],
      async () => {
        await checkAndResetDailyLimit();
        showCustomModal(I18n.t("keyRemovedTitle"), I18n.t("keyRemovedMsg"));
        hideHiddenPage();
        performValidation();
      },
    );
  });
}

// Add event listener for search input
searchGroupInput.addEventListener("input", function () {
  const searchValue = searchGroupInput.value.toLowerCase();

  // Get all group containers
  const groupContainers =
    groupInputsContainer.querySelectorAll(".form-group.card");

  groupContainers.forEach((container) => {
    const titleInput = container.querySelector(
      'input[placeholder="LinkTitle"]',
    );
    const linkInput = container.querySelector('input[placeholder="Link"]');

    // Get the title and link text
    const titleText = titleInput ? titleInput.value.toLowerCase() : "";
    const linkText = linkInput ? linkInput.value.toLowerCase() : "";

    // Check if the search value matches the title or link
    if (titleText.includes(searchValue) || linkText.includes(searchValue)) {
      container.style.display = "block"; // Show the container if it matches
    } else {
      container.style.display = "none"; // Hide the container if it doesn't match
    }
  });
});
// let selectedPosts = [];

// Show or hide options when clicking the input
selectPostInput.addEventListener("click", () => {
  if (selectPostOptions.classList.contains("d-none")) {
    selectPostOptions.classList.remove("d-none");
  } else {
    selectPostOptions.classList.add("d-none");
  }
});
// Toggle dropdown visibility on input click
selectGroupInput.addEventListener("click", () => {
  if (selectGroupOptions.classList.contains("d-none")) {
    selectGroupOptions.classList.remove("d-none");
  } else {
    selectGroupOptions.classList.add("d-none");
  }
});
// Close options dropdown when clicking outside
document.addEventListener("click", (event) => {
  if (!selectPostWrapper.contains(event.target)) {
    selectPostOptions.classList.add("d-none");
  }
  if (!selectGroupWrapper.contains(event.target)) {
    selectGroupOptions.classList.add("d-none");
  }
});

// in popup.js
// ACTION: Replace the entire startPostingBtn event listener
startPostingBtn.addEventListener("click", async function () {
  const selectedMethod = document.querySelector(
    'input[name="postingMethod"]:checked',
  ).value;

  // 1. Gather Settings from DOM
  const timeDelayInSeconds =
    (parseFloat(document.getElementById("enterTime").value) || 5) * 60;
  const groupNumberForDelay =
    parseInt(document.getElementById("linkCount").value, 10) || 1;
  const avoidNightTimePosting = document.getElementById("nightPost").checked;
  const compressImages = document.getElementById("compressImage").checked;
  const delayAfterFailure =
    document.getElementById("delayAfterFailure").checked;
  const currentCommentOption = document.querySelector(
    'input[name="commentOption"]:checked',
  ).value;
  const currentFirstCommentText =
    document.getElementById("firstCommentText").value;
  const postOrder =
    document.querySelector('input[name="postOrder"]:checked')?.value ||
    "sequential";
  const generateAiVariations = document.getElementById(
    "generateAiVariations",
  ).checked;
  const aiVariationCount =
    parseInt(document.getElementById("aiVariationCount").value, 10) || 2;
  const securityLevel =
    document.getElementById("securityLevelSlider").value || "2";

  // *** NEW: Post Anonymously Setting ***
  const postAnonymously = document.getElementById(
    "schedPostAnonymously",
  ).checked;

  // 2. Prepare Data
  const postsToSend = selectedPosts.map((entry) => entry.post);
  let collectiveLinks = [];
  selectedGroups.forEach((groupEntry) => {
    if (groupEntry.group && Array.isArray(groupEntry.group.links)) {
      collectiveLinks.push(...groupEntry.group.links);
    }
  });

  // 3. PRE-FLIGHT CHECK: License & Limits
  // *** FIX IS HERE: Destructure the result immediately ***
  const { licenseVerified, freePostsRemaining } =
    await chrome.storage.local.get(["licenseVerified", "freePostsRemaining"]);

  let truncatedCount = 0;
  let finalLinksToPost = collectiveLinks;

  if (!licenseVerified) {
    // A. Check Daily Limit
    const { remaining } = await checkAndResetDailyLimit();
    if (remaining <= 0) {
      showCustomModal(
        I18n.t("modalDailyLimitTitle"),
        I18n.t("modalDailyLimitBody", ["3"]),
        "alert",
        null,
        null,
        I18n.t("btnUpgrade"),
      );
      setTimeout(() => {
        const btn = document.querySelector("#customModalConfirmBtn");
        if (btn)
          btn.onclick = () => {
            openPricingModal();
            hideCustomModal();
          };
      }, 100);
      return; // STOP
    }

    // B. AI Lock
    if (generateAiVariations) {
      showCustomModal(I18n.t("modalProFeature"), I18n.t("modalAiLock"));
      return; // STOP
    }

    // C. Truncate Groups
    if (collectiveLinks.length > MAX_FREE_GROUPS_PER_RUN) {
      finalLinksToPost = collectiveLinks.slice(0, MAX_FREE_GROUPS_PER_RUN);
      truncatedCount = collectiveLinks.length - MAX_FREE_GROUPS_PER_RUN;
    }
    await incrementDailyPostCount(); // <--- This function handles the -1 logic
  }

  const collectiveGroupForBackground = {
    title: "groups collective",
    links: finalLinksToPost,
  };

  const settings = {
    timeDelay: timeDelayInSeconds,
    groupNumberForDelay,
    avoidNightTimePosting,
    compressImages,
    commentOption: currentCommentOption,
    firstCommentText: currentFirstCommentText,
    postOrder,
    generateAiVariations,
    aiVariationCount,
    securityLevel,
    postingMethod: selectedMethod,
    delayAfterFailure: delayAfterFailure,
    postAnonymously: postAnonymously, // Pass the anonymous setting
  };

  // 4. Define Execution Action
  const proceedWithPosting = async () => {
    startPostingBtn.disabled = true;
    loading.classList.remove("d-none");
    LoadingContent.innerHTML = "Preparing to post...";

    // Log Logic
    const preLogEntries = [];
    const postOrderVal = settings.postOrder;
    const numPosts = postsToSend.length;
    const numGroups = finalLinksToPost.length;
    const totalOperations =
      postOrderVal === "sequential" ? numPosts * numGroups : numGroups;

    for (let i = 0; i < totalOperations; i++) {
      const postIndex =
        postOrderVal === "sequential"
          ? Math.floor(i / numGroups)
          : i % numPosts;
      const groupIndex = postOrderVal === "sequential" ? i % numGroups : i;

      preLogEntries.push({
        key: `op_${i}`,
        postTitle: postsToSend[postIndex]?.title || "Untitled Post",
        linkTitle: finalLinksToPost[groupIndex]?.[0] || "Unknown Group",
        linkURL: finalLinksToPost[groupIndex]?.[1],
        status: "pending",
        reason: null,
        postUrl: null,
      });
    }

    chrome.storage.local.set({ liveLogEntries: preLogEntries }, () => {
      renderLiveLog(preLogEntries);
    });

    setTimeout(async () => {
      let actionType =
        selectedMethod === "directApi" ? "postPostsDirectApi" : "postPosts";
      const message = {
        action: actionType,
        selectedPosts: postsToSend,
        group: collectiveGroupForBackground,
        settings: settings,
      };

      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          if (
            !chrome.runtime.lastError.message.includes(
              "closed before a response",
            )
          ) {
            console.error("Error sending message:", chrome.runtime.lastError);
            loading.classList.add("d-none");
            showCustomModal(
              "Error",
              "Could not start posting. Please try again.",
            );
            startPostingBtn.disabled = false;
          }
        }
      });

      if (!licenseVerified) {
        await incrementDailyPostCount();
      }

      // Cleanup
      clearSelectedTags();
      clearSelectedGroups();
      selectedGroups = [];
      selectedPosts = [];
      resetOrderAndAI();
      enableStartPostingIfReady();
      updateSchedulerFeatureVisibility();
    }, 100);
  };

  // 5. Show Summary
  const summaryHtml = generatePostingSummary(
    postsToSend,
    selectedGroups,
    settings,
    truncatedCount,
  );

  showCustomModal(
    I18n.t("modalConfirmPost"),
    summaryHtml,
    "confirm",
    proceedWithPosting,
    null,
    I18n.t("btnPostNow"),
    I18n.t("btnGoBack"),
  );
});

// Load the tags and populate them when chrome.storage.local is ready
chrome.storage.local.get(["tags"], (result) => {
  tags = result.tags || [];
  selectedPosts = []; // Reset selected posts array
  selectedGroups = []; // Reset selected groups array
  populateSelectPostOptions(); // Call populate options when tags are available
});

// Event listener to handle color button clicks
document.querySelectorAll(".color-button").forEach((button) => {
  button.addEventListener("click", (event) => {
    // Remove border from previously selected button
    document.querySelectorAll(".color-button").forEach((btn) => {
      btn.style.border = "none";
    });

    // Set the border for the currently selected button
    event.target.style.border = "3px solid #000"; // Add border to indicate selection

    // Set the selectedColor to the button's color
    selectedColor = event.target.getAttribute("data-color");
  });
});

// in popup.js
// in popup.js

// ACTION: Replace the entire LoadTags function with this version.
function LoadTags() {
  const savetagsloop = document.getElementById("savetagsloop");
  const sortFilterBtn = document.getElementById("sortFilterBtn");

  if (!savetagsloop || !sortFilterBtn) return;

  let processedTags = [...tags];

  if (activeCategoryFilter !== "all") {
    processedTags = processedTags.filter(
      (tag) =>
        tag.categoryIds && tag.categoryIds.includes(activeCategoryFilter),
    );
  }

  // --- START: MODIFICATION 1.B ---
  // The sort logic now does nothing for the 'default' case, preserving the original array order.
  processedTags.sort((a, b) => {
    if (currentSort.by === "name") {
      const titleA = (a.title || "").toLowerCase();
      const titleB = (b.title || "").toLowerCase();
      if (titleA < titleB) return currentSort.dir === "asc" ? -1 : 1;
      if (titleA > titleB) return currentSort.dir === "asc" ? 1 : -1;
    }
    // For 'default' sort, return 0 to maintain original order (order of creation).
    return 0;
  });
  // --- END: MODIFICATION 1.B ---

  const sortLabel = sortFilterBtn.querySelector("span");
  if (sortLabel) {
    let labelText = I18n.t("btnSortFilter");

    // --- START: MODIFICATION 1.C ---
    // Update the button label logic.
    const isDefaultSort = currentSort.by === "default";

    if (activeCategoryFilter !== "all") {
      const category = postCategories.find(
        (c) => c.id === activeCategoryFilter,
      );
      // FIX: Localized
      labelText = I18n.t("lblFiltered", [category ? category.name : "Unknown"]);
    } else if (!isDefaultSort) {
      if (currentSort.by === "name" && currentSort.dir === "asc") {
        labelText = I18n.t("btnNameAZ");
      } else if (currentSort.by === "name" && currentSort.dir === "desc") {
        labelText = I18n.t("btnNameZA");
      }
    }
    sortLabel.textContent = labelText;
  }

  // --- 3. RENDER THE POST TEMPLATE CARDS (using the sorted/filtered data) ---
  savetagsloop.innerHTML = `<div class="tags-wrapper"><div class="tags-grid">${processedTags
    .map((tag) => {
      const originalIndex = tags.findIndex((t) => t === tag); // Find original index for editing/deleting
      const categoryDots = (tag.categoryIds || [])
        .map((catId) => {
          const category = postCategories.find((c) => c.id === catId);
          if (!category) return "";
          return `<div class="category-dot" style="background-color: ${category.color};" title="${category.name}"></div>`;
        })
        .join("");

      return `
                <div class="tag-block">
                  ${
                    categoryDots
                      ? `<div class="category-dots-container">${categoryDots}</div>`
                      : ""
                  }
                  <div class="tag-header-content">
                    <h3 class="tag-title" title="${tag.title}">${tag.title}</h3>
                    <div class="tag-actions">
                      <button type="button" class="tag-btn preview-btn" data-index="${originalIndex}" title="Preview Post"><i class="fa fa-eye"></i></button>
                      <button type="button" class="tag-btn edit btnEdit" data-index="${originalIndex}" title="Edit Post Template"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                      <button type="button" class="tag-btn delete btnRemove" data-index="${originalIndex}" title="Delete Post Template"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
                    </div>
                  </div>
                </div>`;
    })
    .join("")}</div></div>`;

  if (processedTags.length === 0) {
    savetagsloop.innerHTML += `<p class="text-center text-muted mt-3">No templates found matching your criteria.</p>`;
  }

  // --- 6. Re-attach Listeners for DYNAMIC elements ---
  document.querySelectorAll(".preview-btn").forEach((button) => {
    button.addEventListener("click", (event) => {
      const targetButton = event.currentTarget;
      const index = parseInt(targetButton.getAttribute("data-index"), 10);
      if (!isNaN(index)) {
        previewSavedPost(index);
      }
    });
  });

  document.querySelectorAll(".btnRemove").forEach((button) => {
    button.addEventListener("click", (event) => {
      const targetButton = event.currentTarget;
      const index = targetButton.getAttribute("data-index");
      tags.splice(index, 1);
      chrome.storage.local.set({ tags }, () => LoadTags());
    });
  });

  // in popup.js
  // ACTION: Update the .btnEdit listener inside LoadTags()

  document.querySelectorAll(".btnEdit").forEach((button) => {
    button.addEventListener("click", (event) => {
      const targetButton = event.currentTarget;
      let index = parseInt(targetButton.getAttribute("data-index"), 10);
      if (isNaN(index)) return;
      edit = index;

      const loadedTag = tags[index];
      document.getElementById("postTitle").value = loadedTag.title || "";

      // --- Variation Parsing Logic ---
      resetVariations();

      const rawText = loadedTag.text || "";

      // Check if it's a variation wrapper { ... }
      // We assume it's a wrapper if it starts/ends with brackets.
      // The robust parser will handle if it's actually just a single complex spintax.
      const isPotentialWrapper =
        rawText.trim().startsWith("{") && rawText.trim().endsWith("}");

      if (isPotentialWrapper) {
        // Strip the very outer set of brackets
        const innerContent = rawText.trim().slice(1, -1);

        // Use the ROBUST parser to split
        const parts = parseSpintaxString(innerContent);

        const variationKeys = ["A", "B", "C", "D"];

        // If the parser returns just 1 part, it means the outer brackets were
        // just wrapping a single complex block (e.g. {{A|B}} -> {A|B}).
        // This belongs in Tab A.
        // If it returns multiple parts, they go into A, B, C...

        parts.forEach((part, i) => {
          if (i < 4 && part.trim() !== "") {
            currentTemplateVariations[variationKeys[i]].html = part.trim();
          }
        });
      } else {
        // Not a wrapper (plain text), put in A
        currentTemplateVariations.A.html = rawText;
        currentTemplateVariations.A.delta = loadedTag.delta;
      }

      // Update Locks based on what we just loaded
      updateVariationTabsLockState();

      // Load Tab A into View
      if (quill) {
        // Only use Delta if we loaded into A and it exists
        if (
          currentTemplateVariations.A.delta &&
          !currentTemplateVariations.B.html
        ) {
          quill.setContents(currentTemplateVariations.A.delta);
        } else {
          quill.root.innerHTML = currentTemplateVariations.A.html;
        }
        setTimeout(updateAddTagsAiButtonStates, 50);
      }

      images = [...(loadedTag.images || [])];
      updateSelectedMedia();
      selectedColor = loadedTag.color || "#18191A";
      selectedCategoryIds = [...(loadedTag.categoryIds || [])];
      populateCategorySelectOptions();
      updateSelectedCategoriesUI();
      document.querySelectorAll(".color-button").forEach((btn) => {
        btn.style.border =
          btn.getAttribute("data-color") === selectedColor
            ? "3px solid #000"
            : "none";
      });
      pills.classList.add("d-none");
      TagsPage.classList.add("d-none");
      AddTagsPage.classList.remove("d-none");
      updateTitleCharCounter();
      updateQuillCharCounter();
      initAddTagsPageEnhancements();
      if (window.postQualityCalculator) {
        setTimeout(() => {
          window.postQualityCalculator.init(
            "qualityScorerContainer",
            "template",
          );
        }, 300); // Slightly longer delay for edit mode to allow content population
      }
    });
  });

  // The old block for attaching listeners here has been REMOVED.
  // They are now handled once in DOMContentLoaded.
}

// in popup.js
// ACTION: Replace the previewSavedPost function

function previewSavedPost(index) {
  if (index < 0 || index >= tags.length) return;

  const tag = tags[index];
  let rawText = tag.text || "";
  let variations = [];

  // 1. Check if the entire text is wrapped in { } (Standard save format)
  const isWrapped =
    rawText.trim().startsWith("{") &&
    rawText.trim().endsWith("}") &&
    rawText.includes("|");
  if (isWrapped) {
    const innerContent = rawText.trim().slice(1, -1);
    variations = parseSpintaxString(innerContent);
  } else {
    variations = [rawText];
  }

  // Filter out any accidental empty strings
  variations = variations.filter((v) => v && v.trim().length > 0);

  if (variations.length === 0) variations = [""];

  // Prepare initial view (Variation A)
  const initialContent = processHtmlWithSpintax(variations[0]);
  const processedTitle = spinText(tag.title || "Untitled Post");

  showPreviewModal({
    title: processedTitle,
    content: initialContent,
    images: tag.images || [],
    color: tag.color || "#18191A",

    // Pass the raw array so we can re-spin/switch later
    rawVariations: variations,
    currentVariationIndex: 0,
  });
}

function darkenColor(hex, percent) {
  // Ensure the hash is present
  hex = hex.startsWith("#") ? hex.slice(1) : hex;

  // Convert 3-digit hex to 6-digit
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  }

  // Parse the R, G, B values
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);

  // Calculate the darkening amount
  const amount = (100 - percent) / 100;

  // Darken each component
  r = Math.floor(r * amount);
  g = Math.floor(g * amount);
  b = Math.floor(b * amount);

  // Ensure values are within the 0-255 range
  r = Math.max(0, r);
  g = Math.max(0, g);
  b = Math.max(0, b);

  // Convert back to hex and pad with zeros if necessary
  const rHex = r.toString(16).padStart(2, "0");
  const gHex = g.toString(16).padStart(2, "0");
  const bHex = b.toString(16).padStart(2, "0");

  return `#${rHex}${gHex}${bHex}`;
}

function LoadGroups() {
  const savegroupsloop = document.getElementById("savegroupsloop");
  if (!savegroupsloop) return;

  savegroupsloop.innerHTML = `
  <div class="groups-wrapper">
    <div class="groups-grid">
      ${groups
        .map(
          (group, index) => `
        <div class="group-block compact-group-card">
          <div class="group-header">
            <div class="group-info-compact">
              <h3 class="group-title">${
                group.title || `Group ${index + 1}`
              }</h3>
              
            </div>
            
            <div class="group-actions">
            
              <div class="links-count-compact">
                ${group.links.length} links
              </div>
              <!-- Detail Toggle -->
              <button type="button" 
                      class="btn-icon-only details-toggle toggleGroupContentBtn" 
                      data-index="${index}"
                      title="Show Links">
                <i class="fa fa-chevron-down pointer-events-none"></i>
              </button>

              <div style="width:1px; height:20px; background:#e2e8f0; margin: 0 4px;"></div>

              <button type="button" class="group-btn edit btnEditGroup" data-index="${index}" title="Edit">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </button>
              <button type="button" class="group-btn delete btnRemoveGroup" data-index="${index}" title="Delete">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </div>

          <div class="group-content-panel" id="group-content-${index}" style="display: none;">
            <ul class="links-list">
              ${group.links
                .map(
                  ([linkTitle, linkURL]) => `
                <li class="link-item">
                  <a href="${linkURL}" target="_blank" title="${linkURL}">
                    ${linkTitle}
                  </a>
                </li>
              `,
                )
                .join("")}
            </ul>
          </div>
        </div>
      `,
        )
        .join("")}
    </div>
  </div>
`;

  // Attach event listeners
  document.querySelectorAll(".toggleGroupContentBtn").forEach((button) => {
    button.addEventListener("click", (event) => {
      // Use currentTarget to ensure we get the button, not the icon
      const btn = event.currentTarget;
      const index = btn.getAttribute("data-index");
      const contentDiv = document.getElementById(`group-content-${index}`);

      const isHidden = contentDiv.style.display === "none";
      contentDiv.style.display = isHidden ? "block" : "none";
      btn.classList.toggle("open", isHidden);

      // Update icon based on state (optional, if CSS rotation isn't enough)
      const icon = btn.querySelector("i");
      // icon.className = isHidden ? "fa fa-chevron-up pointer-events-none" : "fa fa-chevron-down pointer-events-none";
    });
  });

  document.querySelectorAll(".btnEditGroup").forEach((button) => {
    button.addEventListener("click", (event) => {
      const index = event.currentTarget.getAttribute("data-index");
      editGroup(parseInt(index));
    });
  });

  document.querySelectorAll(".btnRemoveGroup").forEach((button) => {
    button.addEventListener("click", (event) => {
      const index = event.currentTarget.getAttribute("data-index");
      groups.splice(index, 1);
      chrome.storage.local.set({ groups }, () => LoadGroups());
    });
  });
}

function insertMedia(context) {
  const fileInput = document.getElementById("imageInput");
  if (!fileInput) return;

  fileInput.click();
  fileInput.addEventListener(
    "change",
    (event) => {
      handleFileSelection(event.target.files, "template"); // Use a shared handler
    },
    { once: true },
  );
}
const VALID_MEDIA_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/tiff",
  "image/heif",
  "image/webp",
  "video/mp4",
  "video/mp3",
  "video/webm",
];

// in popup.js
// ACTION: Update the handleFileSelection function

function handleFileSelection(fileList, context) {
  if (!fileList || fileList.length === 0) return;

  const validFiles = [];
  const invalidFileNames = [];
  const oversizedFileNames = [];
  // 35MB Limit to prevent "Message length exceeded" crash between Popup -> Background
  const MAX_SIZE_MB = 35;

  const ALLOWED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "video/mp4",
    "video/webm",
    "video/quicktime", // Added quicktime for .mov support
  ];

  for (const file of fileList) {
    // 1. Check File Size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > MAX_SIZE_MB) {
      oversizedFileNames.push(`${file.name} (${fileSizeMB.toFixed(1)}MB)`);
      continue;
    }

    // 2. Check File Type
    if (ALLOWED_TYPES.includes(file.type)) {
      validFiles.push(file);
    } else {
      invalidFileNames.push(file.name);
    }
  }

  // Show Errors
  if (oversizedFileNames.length > 0) {
    showCustomModal(
      I18n.t("fileLargeTitle"),
      I18n.t("fileLargeMsg", [
        oversizedFileNames.join(", "),
        String(MAX_SIZE_MB),
      ]),
    );
  }

  if (invalidFileNames.length > 0) {
    showCustomModal(
      I18n.t("fileTypeTitle"),
      I18n.t("fileTypeMsg", [invalidFileNames.join(", ")]),
    );
  }

  // Process Valid Files
  validFiles.forEach((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const mediaData = e.target.result;
      // Robust type detection
      const mediaType = file.type.startsWith("video/") ? "video" : "image";

      if (context === "template") {
        if (!images.some((item) => item.data === mediaData)) {
          images.push({ data: mediaData, type: mediaType });
          updateSelectedMedia();
        }
      } else if (context === "quickpost") {
        // quickpost
        if (!quickMedia.some((item) => item.data === mediaData)) {
          quickMedia.push({ data: mediaData, type: mediaType });
          updateQuickMediaDisplay();
        }
      } else if (context === "aiwizard") {
        // --- NEW CASE ---
        if (!aiWizardMedia.some((item) => item.data === mediaData)) {
          aiWizardMedia.push({ data: mediaData, type: mediaType });
          updateAiWizardMediaPreview();
        }
      }
    };
    reader.readAsDataURL(file);
  });

  // Clear input
  const fileInput =
    context === "template"
      ? document.getElementById("imageInput")
      : document.getElementById("quickMediaInput");
  if (fileInput) fileInput.value = null;
}

// Function to update the display of selected media
function updateSelectedMedia(context) {
  const selectedMediaContainer = document.getElementById(
    context === "product" ? "selectedProductImages" : "selectedImages",
  );

  if (!selectedMediaContainer) {
    console.error("Media container not found.");
    return;
  }

  // Clear the current display
  selectedMediaContainer.innerHTML = "";

  images.forEach((mediaItem, index) => {
    const mediaContainer = document.createElement("div");
    mediaContainer.classList.add("media-container");

    if (mediaItem.type === "image") {
      // Create an image element
      const image = document.createElement("img");
      image.classList.add("media");
      image.src = mediaItem.data;
      mediaContainer.appendChild(image);
    } else if (mediaItem.type === "video") {
      // Create a video element with controls
      const video = document.createElement("video");
      video.classList.add("media");
      video.src = mediaItem.data;
      video.controls = true;
      mediaContainer.appendChild(video);
    }

    // Add a remove button for each media item
    const removeIcon = document.createElement("span");
    removeIcon.innerHTML = "&#10005;"; // Cross icon
    removeIcon.classList.add("remove-icon");
    removeIcon.addEventListener("click", () => removeMedia(index));
    mediaContainer.appendChild(removeIcon);

    selectedMediaContainer.appendChild(mediaContainer);
  });
}

// Function to remove a media file from the selection
function removeMedia(index) {
  if (index < 0 || index >= images.length) {
    console.warn("Invalid index for media removal.");
    return;
  }

  images.splice(index, 1);
  updateSelectedMedia();
}

function editGroup(index) {
  // Get the group data from the groups array
  const groupToEdit = groups[index];

  // Set the index to a global variable for use in the save function
  edit = index;

  // Populate the UI fields with the group's data
  document.getElementById("groupTitle").value = groupToEdit.title;

  // Clear existing inputs in the group inputs container
  const groupInputsContainer = document.getElementById("groupInputsContainer");
  groupInputsContainer.innerHTML = "";

  // Populate the input fields for each link (title and URL)
  groupToEdit.links.forEach(([linkTitle, linkURL]) => {
    // Create a container div to hold both title and link sections
    const newInputContainer = document.createElement("div");
    newInputContainer.classList.add("form-group", "mt-2", "card", "p-3");

    // Create the div for the title input (full length)
    const titleDiv = document.createElement("div");
    titleDiv.classList.add("mb-2");

    // Add title input
    const newInputName = document.createElement("input");
    newInputName.type = "text";
    newInputName.value = linkTitle; // Set the existing link title
    newInputName.classList.add("form-control");
    newInputName.placeholder = "LinkTitle";

    // Add title input to titleDiv
    titleDiv.appendChild(newInputName);

    // Create the div for link and remove button (next to each other)
    const linkAndButtonDiv = document.createElement("div");
    linkAndButtonDiv.classList.add("d-flex", "align-items-center");

    // Add link input
    const newInput = document.createElement("input");
    newInput.type = "text";
    newInput.value = linkURL; // Set the existing link URL
    newInput.classList.add("form-control", "mr-2");
    newInput.placeholder = "Link";

    // Add remove button
    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.classList.add("btn", "btn-outline-danger");
    removeButton.innerHTML = '<i class="fa fa-trash-o"></i>';
    removeButton.addEventListener("click", () => {
      // Remove the entire container with title and link inputs
      newInputContainer.remove();
    });

    // Append link input and remove button to linkAndButtonDiv
    linkAndButtonDiv.appendChild(newInput);
    linkAndButtonDiv.appendChild(removeButton);

    // Append both title and link/button divs to the main container
    newInputContainer.appendChild(titleDiv);
    newInputContainer.appendChild(linkAndButtonDiv);

    // Append the new input container to the main group inputs container
    groupInputsContainer.appendChild(newInputContainer);

    // chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    //   if (
    //     tabs.length > 0 &&
    //     tabs[0].url &&
    //     !tabs[0].url.includes("facebook.com")
    //   ) {
    //     // console.log("not on facebook");
    //     // Clear previous error messages
    //     errorMsg.innerHTML = "";

    //     // Insert new error message
    //     errorMsg.insertAdjacentHTML(
    //       "beforeend",
    //       warningPopup(
    //         "notOnFacebook",
    //         "Attention!",
    //         "You must be on Facebook to auto collect all the Facebook groups' links you are a member in."
    //       )
    //     );
    //     document.getElementById("getProfileGroups").disabled = true;
    //   } else {
    //     // Clear error message if on Facebook
    //     errorMsg.innerHTML = "";

    //     // Enable the button if on Facebook
    //     document.getElementById("getProfileGroups").disabled = false;
    //   }
    // });
  });

  // Switch to the group editing UI
  pills.classList.add("d-none");
  groupsPage.classList.add("d-none");
  addGroupsPage.classList.remove("d-none");

  const cutUpBtn = document.getElementById("cutUpGroupsBtn");
  if (cutUpBtn) {
    cutUpBtn.classList.remove("d-none"); // Show the button
    // Ensure listener is attached
    cutUpBtn.removeEventListener("click", showCutUpModal); // Prevent duplicates
    cutUpBtn.addEventListener("click", showCutUpModal);
  }
}
/**
 * Shows the "Cut It Up" modal and handles the splitting logic.
 */
function showCutUpModal() {
  // 1. Gather current links from the editor UI
  const groupContainers = document.querySelectorAll(
    "#groupInputsContainer .form-group",
  );
  const currentLinks = Array.from(groupContainers)
    .map((container) => {
      const inputs = container.querySelectorAll("input");
      const linkTitle = inputs[0].value.trim() || `Link`;
      const linkURL = inputs[1].value.trim();
      return [linkTitle, linkURL];
    })
    .filter((link) => link[1]); // Only include links with a URL

  const totalLinks = currentLinks.length;

  if (totalLinks < 2) {
    showCustomModal(I18n.t("splitErrMin"), "");
    return;
  }

  // 2. Create the dynamic HTML content for the modal
  const modalContentHTML = `
    <div id="cutUpForm" ...>
      <p style="margin-bottom: 1rem;">${I18n.t("splitInfo", [
        String(totalLinks),
      ])}</p>
      <div class="form-group">
        <label for="splitPiecesInput" style="font-weight: 500;">${I18n.t(
          "splitLblPieces",
        )}</label>
        <input type="number" class="form-control mt-2" id="splitPiecesInput" value="2" min="2" max="${totalLinks}">
      </div>
      <div id="splitResultFeedback" ...></div>
    </div>
  `;

  // 3. Define the confirmation callback
  const onConfirm = () => {
    const piecesInput = document.getElementById("splitPiecesInput");
    const numberOfPieces = parseInt(piecesInput.value, 10);

    if (
      isNaN(numberOfPieces) ||
      numberOfPieces < 2 ||
      numberOfPieces > totalLinks
    ) {
      showCustomModal(
        "Invalid Number",
        `Please enter a number between 2 and ${totalLinks}.`,
      );
      return; // Prevent modal from closing by not calling hideCustomModal
    }

    executeGroupSplit(currentLinks, numberOfPieces);
  };

  // 4. Show the modal
  showCustomModal(
    I18n.t("splitTitle"),
    modalContentHTML,
    "confirm",
    onConfirm,
    null,
    I18n.t("splitBtn"),
    I18n.t("btnCancel"),
  );

  // 5. Add live feedback listener AFTER the modal is shown
  setTimeout(() => {
    const piecesInput = document.getElementById("splitPiecesInput");
    if (piecesInput) {
      piecesInput.addEventListener("input", () =>
        updateSplitFeedback(totalLinks),
      );
      updateSplitFeedback(totalLinks); // Initial calculation
      piecesInput.focus();
    }
  }, 100); // Small delay to ensure modal DOM is ready
}

/**
 * Updates the feedback text in the "Cut It Up" modal based on user input.
 * @param {number} totalLinks - The total number of links in the collection.
 */
function updateSplitFeedback(totalLinks) {
  const piecesInput = document.getElementById("splitPiecesInput");
  const feedbackDiv = document.getElementById("splitResultFeedback");
  if (!piecesInput || !feedbackDiv) return;

  const numberOfPieces = parseInt(piecesInput.value, 10);

  if (
    isNaN(numberOfPieces) ||
    numberOfPieces < 2 ||
    numberOfPieces > totalLinks
  ) {
    feedbackDiv.innerHTML = I18n.t("splitErrValid");
    feedbackDiv.classList.remove("alert-info");
    feedbackDiv.classList.add("alert-danger");
    return;
  }

  feedbackDiv.classList.remove("alert-danger");
  feedbackDiv.classList.add("alert-info");

  const linksPerPiece = Math.ceil(totalLinks / numberOfPieces);
  const remainder = totalLinks % numberOfPieces;

  let feedbackText;
  if (remainder === 0) {
    feedbackText = I18n.t("splitFeedbackExact", [
      String(numberOfPieces),
      String(linksPerPiece),
    ]);
  } else {
    const fullCollections = numberOfPieces - remainder;
    const largerCollections = remainder;
    feedbackText = I18n.t("splitFeedbackMixed", [
      String(numberOfPieces),
      String(largerCollections),
      String(linksPerPiece),
      String(fullCollections),
      String(linksPerPiece - 1),
    ]);
  }
  feedbackDiv.innerHTML = feedbackText;
}

/**
 * Executes the splitting logic and saves the new group collections.
 * @param {Array<[string, string]>} links - The array of link pairs to be split.
 * @param {number} numberOfPieces - The number of collections to create.
 */
function executeGroupSplit(links, numberOfPieces) {
  const originalTitle =
    document.getElementById("groupTitle").value.trim() || groups[edit].title;
  const linksPerPiece = Math.ceil(links.length / numberOfPieces);

  // Remove the original collection being edited
  if (edit !== null) {
    groups.splice(edit, 1);
  }

  for (let i = 0; i < numberOfPieces; i++) {
    const start = i * linksPerPiece;
    const end = start + linksPerPiece;
    const chunk = links.slice(start, end);

    if (chunk.length > 0) {
      groups.push({
        title: `${originalTitle} (Part ${i + 1})`,
        links: chunk,
      });
    }
  }

  // Save to storage and refresh UI
  chrome.storage.local.set({ groups }, function () {
    showCustomModal(
      I18n.t("statusSuccess"),
      I18n.t("splitSuccess", [String(numberOfPieces)]),
    );
    // Reset state and go back to the main groups list
    edit = null;
    pills.classList.remove("d-none");
    groupsPage.classList.remove("d-none");
    addGroupsPage.classList.add("d-none");
    LoadGroups();
  });
}

// editProduct function implementation

// Updated addGroupInput function to handle both link and title
function addGroupInput(group) {
  const groupInputsContainer = document.getElementById("groupInputsContainer");

  // Create a container div to hold both title and link sections
  const newInputContainer = document.createElement("div");
  newInputContainer.classList.add("form-group", "mt-2", "card", "p-3");

  // Create the div for the title input (full length)
  const titleDiv = document.createElement("div");
  titleDiv.classList.add("mb-2"); // Optional margin for spacing

  // Add title input
  const newInputName = document.createElement("input");
  newInputName.type = "text";
  newInputName.value = group.title ? group.title : ""; // Set the title value if available
  newInputName.classList.add("form-control");
  newInputName.placeholder = I18n.t("grpPhTitle"); // FIX: Localized "Title"

  // Add title input to titleDiv
  titleDiv.appendChild(newInputName);

  // Create the div for link and remove button (next to each other)
  const linkAndButtonDiv = document.createElement("div");
  linkAndButtonDiv.classList.add("d-flex", "align-items-center");

  // Add link input
  const newInput = document.createElement("input");
  newInput.type = "text";
  newInput.value = group.link ? group.link : ""; // Set the link value if available
  newInput.classList.add("form-control", "mr-2");
  newInput.placeholder = I18n.t("grpPhLink"); // FIX: Localized "Link"

  // Add remove button
  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.classList.add("btn", "btn-outline-danger");
  removeButton.innerHTML = '<i class="fa fa-trash-o"></i>';
  removeButton.addEventListener("click", () => {
    // Remove the entire container with title and link inputs
    newInputContainer.remove();
  });

  // Append link input and remove button to linkAndButtonDiv
  linkAndButtonDiv.appendChild(newInput);
  linkAndButtonDiv.appendChild(removeButton);

  // Append both title and link/button divs to the main container
  newInputContainer.appendChild(titleDiv);
  newInputContainer.appendChild(linkAndButtonDiv);

  if (groupInputsContainer.firstChild) {
    groupInputsContainer.insertBefore(
      newInputContainer,
      groupInputsContainer.firstChild,
    );
  } else {
    groupInputsContainer.appendChild(newInputContainer); // If no existing inputs, just append it
  }
}

function MapLogsUL(postsCompleted, targetContainer, historyEntry = null) {
  const logsContainer = targetContainer;
  currentLogData = { postsCompleted, historyEntry };
  if (!logsContainer) return;
  logsContainer.innerHTML = "";

  const successfulPosts = postsCompleted.filter(
    (post) =>
      post.response === "successful" || post.response === "pending_approval",
  ).length;
  const failedOrSkippedPosts = postsCompleted.length - successfulPosts;

  let currentFilter = null;

  const container = document.createElement("div");
  container.className = "logs-container";

  // FIX: Localized Stats Headers
  const summarySection = document.createElement("div");
  summarySection.className = "stats-section";
  summarySection.innerHTML = `
    <div class="stat-group">
      <div class="stat-block total selected" data-filter="all">
        <div class="stat-content"><span class="stat-label">${I18n.t(
          "statTotal",
        )}</span><span class="stat-value">${postsCompleted.length}</span></div>
      </div>
      <div class="stat-block success" data-filter="successful">
        <div class="stat-content"><span class="stat-label">${I18n.t(
          "statSuccessful",
        )}</span><span class="stat-value">${successfulPosts}</span></div>
      </div>
      <div class="stat-block failed" data-filter="failed">
        <div class="stat-content"><span class="stat-label">${I18n.t(
          "statFailedSkipped",
        )}</span><span class="stat-value">${failedOrSkippedPosts}</span></div>
      </div>
    </div>
  `;
  container.appendChild(summarySection);

  const tableWrapperContainer = document.createElement("div");
  tableWrapperContainer.className = "table-wrapper-container";
  container.appendChild(tableWrapperContainer);

  let canRetry = false;
  if (failedOrSkippedPosts > 0 && historyEntry) {
    const failedItems = postsCompleted.filter(
      (post) =>
        post.response !== "successful" && post.response !== "pending_approval",
    );
    canRetry = failedItems.some((log) => {
      const cleanTitle = (log.postTitle || "").replace(
        /\s*\(AI Variation \d+\)$/,
        "",
      );
      return tags.some((t) => t.title === cleanTitle);
    });
  }

  // FIX: Localized Retry Prompt
  if (canRetry) {
    const retryPrompt = document.createElement("div");
    retryPrompt.className = "retry-prompt-container";
    retryPrompt.innerHTML = `
      <div class="retry-prompt-header">
        <i class="fa fa-exclamation-circle retry-prompt-icon"></i>
        <h5 class="retry-prompt-title">${I18n.t("retryTitle")}</h5>
      </div>
      <p class="retry-prompt-text">
        ${I18n.t("retryMsg", [String(failedOrSkippedPosts)])}
      </p>
      <button type="button" class="btn-retry" id="retry-btn-${historyEntry.id}">
        <i class="fa fa-refresh"></i>
        <span>${I18n.t("btnRetry")}</span>
      </button>
    `;
    container.appendChild(retryPrompt);
    const retryBtn = container.querySelector(`#retry-btn-${historyEntry.id}`);
    if (retryBtn) {
      retryBtn.addEventListener("click", () =>
        handleRetryClick(historyEntry.id),
      );
    }
  }

  logsContainer.appendChild(container);

  function updateTable(filter = null) {
    const tableWrapper = document.createElement("div");
    tableWrapper.className = "table-wrapper";
    // FIX: Localized Table Headers
    tableWrapper.innerHTML = `
      <table class="modern-table">
        <thead>
          <tr>
            <th>${I18n.t("colTemplate")}</th>
            <th>${I18n.t("colGroup")}</th>
            <th class="status-column">${I18n.t("colStatus")}</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    `;
    const tableBody = tableWrapper.querySelector("tbody");

    let filteredPosts = postsCompleted;
    if (filter === "successful") {
      filteredPosts = postsCompleted.filter(
        (p) => p.response === "successful" || p.response === "pending_approval",
      );
    } else if (filter === "failed") {
      filteredPosts = postsCompleted.filter(
        (p) => p.response !== "successful" && p.response !== "pending_approval",
      );
    }

    if (filteredPosts.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="3" class="text-center text-muted p-4">${I18n.t(
        "noMatch",
      )}</td></tr>`;
    } else {
      const groupedPosts = filteredPosts.reduce((acc, post) => {
        const title = post.postTitle || "Untitled Post";
        if (!acc[title]) acc[title] = [];
        acc[title].push(post);
        return acc;
      }, {});

      Object.entries(groupedPosts).forEach(([postTitle, posts]) => {
        posts.forEach((post, index) => {
          const row = document.createElement("tr");

          const groupName =
            post.linkTitle ||
            (post.linkURL
              ? post.linkURL.split("/groups/")[1]?.split("/")[0]
              : "N/A");

          // FIX: Localized Statuses
          let status, statusClass, statusIcon;
          switch (post.response) {
            case "successful":
              status = I18n.t("statusSuccess");
              statusClass = "success";
              statusIcon = "";
              break;
            case "pending_approval":
              status = I18n.t("statusPending");
              statusClass = "pending";
              statusIcon = "";
              break;
            default:
              status =
                post.response === "skipped"
                  ? I18n.t("statusSkipped")
                  : I18n.t("statusFailed");
              statusClass = "error";
              const sanitizedReason = (post.reason || "").replace(
                /"/g,
                "&quot;",
              );
              statusIcon = `<i class="fa fa-info-circle ml-1 log-info-icon" data-reason="${sanitizedReason}" style="cursor: pointer;"></i>`;
              break;
          }

          const linkHref = post.postUrl || post.linkURL || "#";
          const linkTitle = post.postUrl ? "View Post" : "No URL";

          row.innerHTML = `
            <td class="title-cell">${index === 0 ? postTitle : ""}</td>
            <td><a href="${linkHref}" target="_blank" class="group-link" title="${linkTitle}">${groupName}</a></td>
            <td class="status-column"><span class="status-badge ${statusClass}">${status}</span>${statusIcon}</td>
          `;
          tableBody.appendChild(row);
        });
      });
    }
    return tableWrapper;
  }

  tableWrapperContainer.innerHTML = "";
  tableWrapperContainer.appendChild(updateTable(currentFilter));

  tableWrapperContainer.addEventListener("click", (event) => {
    const infoIcon = event.target.closest(".log-info-icon");
    if (infoIcon) {
      showCustomModal(
        "Details",
        infoIcon.dataset.reason,
        "alert",
        null,
        null,
        "OK",
      );
    }
  });

  const statBlocks = container.querySelectorAll(".stat-block");
  statBlocks.forEach((block) => {
    block.addEventListener("click", () => {
      const filter = block.dataset.filter;
      statBlocks.forEach((b) => b.classList.remove("selected"));
      block.classList.add("selected");
      currentFilter = filter === "all" ? null : filter;
      tableWrapperContainer.innerHTML = "";
      tableWrapperContainer.appendChild(updateTable(currentFilter));
    });
  });
}

function groupPostsByTitle(posts) {
  return posts.reduce((acc, post) => {
    if (!acc[post.postTitle]) {
      acc[post.postTitle] = [];
    }
    acc[post.postTitle].push(post);
    return acc;
  }, {});
}

// in popup.js
// ACTION: Replace performValidation

async function performValidation() {
  try {
    // Licensing is disabled for now. Keep UI fully unlocked.
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

    validated = true;
    updateFeatureLocks(true);
    updateTierHeaderUI(true, 0);
  } catch (error) {
    console.error("Validation error:", error);
  }
}

async function validateLicense(licenseKey, licenseProvider) {
  // No-op while licensing is disabled
  return;
}

// --- BLACK FRIDAY CAMPAIGN LOGIC ---
function initBlackFridayCampaign() {
  return;
}
// Create HTML for the free trial tracker
function createFreeTrialTrackerHTML() {
  return "";
}

function pollValidationResult() {
  return Promise.resolve({ isValid: true });
}
function clearLicenseData() {
  // No-op while licensing is disabled
}
// in popup.js
// ACTION: Replace the entire onLicenseValidated function with this new version.

async function onLicenseValidated(validationResult) {
  validated = true;
  await chrome.storage.local.set({ licenseVerified: true });
  updateFeatureLocks(true);
  updateTierHeaderUI(true, 0);
  hideActivationPage();
}
async function showActivationPage() {
  // Licensing disabled; keep main UI visible
  hideActivationPage();
}

function hideActivationPage() {
  const activationPage = document.getElementById("activationPage");
  const main = document.getElementById("main");

  if (activationPage) activationPage.classList.add("d-none");
  if (main) main.classList.remove("d-none");
}

function handleActivationSubmit(event) {
  event.preventDefault();
  // Licensing disabled; no activation needed.
  hideActivationPage();
}

// in popup.js, add this new function

function formatDate(dateString) {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return new Date(dateString).toLocaleString("en-US", options);
}

// in popup.js

// in popup.js
// ACTION: Replace your entire existing populateSelectPostOptions function with this one.

function populateSelectPostOptions() {
  // It's good practice to ensure `tags` is up-to-date before rendering.
  chrome.storage.local.get(["tags"], (result) => {
    tags = result.tags || [];

    const selectPostOptions = document.getElementById("selectPostOptions");
    if (!selectPostOptions) return; // Safety check

    selectPostOptions.innerHTML = ""; // Clear previous options

    tags.forEach((tag, index) => {
      const optionDiv = document.createElement("div");
      optionDiv.className = "option";
      optionDiv.setAttribute("data-index", index);

      // Your existing logic for displaying category dots is good.
      const categoryDotsHTML = (tag.categoryIds || [])
        .map((catId) => {
          const category = postCategories.find((c) => c.id === catId);
          if (!category) return "";
          return `<div class="category-dot" style="background-color: ${category.color};" title="${category.name}"></div>`;
        })
        .join("");

      optionDiv.innerHTML = `
              <div class="option-content-wrapper">
                <span class="option-title" title="${
                  tag.title || `Post ${index + 1}`
                }">${tag.title || `Post ${index + 1}`}</span>
                <div class="option-category-dots">${categoryDotsHTML}</div>
              </div>
            `;

      selectPostOptions.appendChild(optionDiv);

      // ** THE FIX IS HERE: The event listener logic is now complete **
      optionDiv.addEventListener("click", () => {
        const postIndex = parseInt(optionDiv.getAttribute("data-index"), 10);
        const isAlreadySelected = selectedPosts.some(
          (entry) => entry.index === postIndex,
        );

        if (isAlreadySelected) {
          // --- DESELECTION LOGIC ---
          console.log(`Deselecting post: "${tags[postIndex].title}"`);
          // 1. Remove from the state array
          selectedPosts = selectedPosts.filter(
            (entry) => entry.index !== postIndex,
          );
          // 2. Remove the visual "tag pill"
          removeSelectedTag(postIndex);
          // 3. Reset the background color in the dropdown
          optionDiv.style.backgroundColor = "";
        } else {
          // --- SELECTION LOGIC (your original code) ---
          console.log(`Selecting post: "${tags[postIndex].title}"`);
          // 1. Add to the state array
          selectedPosts.push({ index: postIndex, post: tags[postIndex] });
          // 2. Add the visual "tag pill"
          addSelectedTag(postIndex);
          // 3. Highlight the background in the dropdown
          optionDiv.style.backgroundColor = "#f0f0f0";
        }

        // These should be called after any change (select or deselect).
        enableStartPostingIfReady();
        updateSchedulerFeatureVisibility();
      });

      // After adding the listener, check if this item should be initially styled as "selected".
      // This ensures the UI is correct when the popup opens with pre-selected items (e.g., during editing).
      if (selectedPosts.some((entry) => entry.index === index)) {
        optionDiv.style.backgroundColor = "#f0f0f0";
      }
    });
  });
}

// in popup.js

// in popup.js
// ACTION: Replace your entire addSelectedTag function with this version.
function addTempPostPill(postData) {
  const tagItem = document.createElement("div");
  tagItem.className = "tag-item";
  tagItem.innerHTML = `
      <div class="tag-item-content">
        <span class="tag-item-text"><i class="fa fa-pencil-square-o"></i> ${postData.title}</span>
      </div>
      <span class="remove-tag">&times;</span>
    `;

  tagItem.querySelector(".remove-tag").addEventListener("click", () => {
    // Remove from selectedPosts array
    selectedPosts = selectedPosts.filter((p) => p.post !== postData);
    tagItem.remove();
    enableStartPostingIfReady();
  });

  document.getElementById("selectedPostsContainer").appendChild(tagItem);
}
function addSelectedTag(postIndex) {
  const tagData = tags[postIndex];
  if (!tagData) return;

  // --- START: MODIFICATION ---
  // Create the main tag item element
  const tagItem = document.createElement("div");
  tagItem.className = "tag-item";
  // ** CRITICAL FIX: Add a unique data-attribute to the tag pill **
  tagItem.setAttribute("data-post-index", postIndex);
  // --- END: MODIFICATION ---

  // Your existing logic for category dots and titles is still perfect.
  const categoryDotsHTML = (tagData.categoryIds || [])
    .map((catId) => {
      const category = postCategories.find((c) => c.id === catId);
      if (!category) return "";
      return `<div class="category-dot" style="background-color: ${category.color};" title="${category.name}"></div>`;
    })
    .join("");

  tagItem.innerHTML = `
      <div class="tag-item-content">
        <span class="tag-item-text">${
          tagData.title || `Post ${postIndex + 1}`
        }</span>
        <div class="tag-item-category-dots">${categoryDotsHTML}</div>
      </div>
    `;

  // The remove button logic also remains the same.
  const removeTag = document.createElement("span");
  removeTag.className = "remove-tag";
  removeTag.innerHTML = `<span aria-hidden="true">&times;</span>`;
  removeTag.addEventListener("click", () => {
    // This click handler for the 'x' button is still correct.
    selectedPosts = selectedPosts.filter((entry) => entry.index !== postIndex);
    tagItem.remove();
    enableStartPostingIfReady();
    updateSchedulerFeatureVisibility();
    const optionDiv = selectPostOptions.querySelector(
      `[data-index="${postIndex}"]`,
    );
    if (optionDiv) {
      optionDiv.style.backgroundColor = "";
    }
  });

  tagItem.appendChild(removeTag);
  selectedPostsContainer.appendChild(tagItem);
}

// in popup.js
// ACTION: Replace your entire removeSelectedTag function with this version.

function removeSelectedTag(postIndex) {
  if (!selectedPostsContainer) return;

  // ** CRITICAL FIX: Use a direct attribute selector to find the exact element. **
  // This is fast, reliable, and unambiguous.
  const tagItemToRemove = selectedPostsContainer.querySelector(
    `.tag-item[data-post-index="${postIndex}"]`,
  );

  if (tagItemToRemove) {
    tagItemToRemove.remove();
    console.log(`Successfully removed tag-item for post index: ${postIndex}`);
  } else {
    // This log helps debug if something is still out of sync.
    console.warn(
      `Could not find a tag-item to remove for post index: ${postIndex}`,
    );
  }
}
// Function to populate post options after loading tags
function populateSelectGroupOptions() {
  // Re-fetch reference in case DOM changed
  selectGroupOptions = document.getElementById("selectGroupOptions");
  if (!selectGroupOptions) return;

  selectGroupOptions.innerHTML = "";
  // Cloning to remove old event listeners is a good safety practice
  const newOptions = selectGroupOptions.cloneNode(true);
  selectGroupOptions.replaceWith(newOptions);
  selectGroupOptions = newOptions;

  groups.forEach((group, index) => {
    const optionDiv = document.createElement("div");
    optionDiv.className = "option";
    optionDiv.setAttribute("data-index", index);

    const { badgeHTML, tooltipContent } = createFreshnessBarHTML(index, groups);

    optionDiv.innerHTML = `
            <div class="collection-details">
                <span class="option-title">${
                  group.title || `Group ${index + 1}`
                }</span>
            </div>
            <div class="collection-info-badge">${badgeHTML}</div>
        `;

    const infoBadge = optionDiv.querySelector(".collection-info-badge");
    if (infoBadge && tooltipContent) {
      infoBadge.addEventListener("mouseenter", () =>
        showFreshnessTooltip(infoBadge, tooltipContent),
      );
      infoBadge.addEventListener("mouseleave", hideFreshnessTooltip);
    }

    selectGroupOptions.appendChild(optionDiv);
  });

  // Event Delegation for Selection
  selectGroupOptions.addEventListener("click", (event) => {
    const optionDiv = event.target.closest(".option");
    if (!optionDiv) return;

    const groupIndex = parseInt(optionDiv.getAttribute("data-index"), 10);

    if (selectedGroups.some((g) => g.index === groupIndex)) {
      // Deselect
      selectedGroups = selectedGroups.filter((g) => g.index !== groupIndex);
      removeSelectedGroup(groupIndex);
      optionDiv.style.backgroundColor = "";
    } else {
      // Select
      selectedGroups.push({ index: groupIndex, group: groups[groupIndex] });
      addSelectedGroup(groupIndex);
      optionDiv.style.backgroundColor = "#f0f0f0";
    }

    // *** FIX: Call BOTH update functions ***
    enableStartPostingIfReady();
    updateSchedulerFeatureVisibility();
  });

  // Restore visual state for already selected items
  selectedGroups.forEach((g) => {
    const optionDiv = selectGroupOptions.querySelector(
      `[data-index="${g.index}"]`,
    );
    if (optionDiv) optionDiv.style.backgroundColor = "#f0f0f0";
  });
}

// Add selected group badge to container
function addSelectedGroup(groupIndex) {
  const groupItem = document.createElement("div");
  groupItem.className = "tag-item";
  groupItem.innerText = groups[groupIndex].title || `Group ${groupIndex + 1}`;

  const removeTag = document.createElement("span");
  removeTag.className = "remove-tag";
  removeTag.innerHTML = "&times;";
  removeTag.addEventListener("click", () => {
    selectedGroups = selectedGroups.filter((g) => g.index !== groupIndex);
    groupItem.remove();
    enableStartPostingIfReady();
    // Update the option to be deselected in the dropdown list
    const optionDiv = selectGroupOptions.querySelector(
      `[data-index="${groupIndex}"]`,
    );
    if (optionDiv) {
      optionDiv.style.backgroundColor = ""; // Reset background color
    }
  });
  // console.log(selectedGroups);
  groupItem.appendChild(removeTag);
  selectedGroupsContainer.appendChild(groupItem);
}

// Remove selected group badge from container
function removeSelectedGroup(groupIndex) {
  const groupTitle = groups[groupIndex].title || `Group ${groupIndex + 1}`;
  const groupItems = selectedGroupsContainer.querySelectorAll(".tag-item");

  for (const groupItem of groupItems) {
    if (groupItem.textContent.trim().includes(groupTitle)) {
      groupItem.remove();
      break;
    }
  }
  updateSchedulerFeatureVisibility();
}

function clearSelectedTags() {
  const selectedTagsContainer = document.getElementById(
    "selectedPostsContainer",
  );
  if (selectedTagsContainer) {
    selectedTagsContainer.innerHTML = ""; // Clear all selected tags
  }

  const selectPostOptions = document.getElementById("selectPostOptions");
  if (selectPostOptions) {
    // Reset the dropdown options' styles
    const options = selectPostOptions.querySelectorAll(".option");
    options.forEach((option) => {
      option.style.backgroundColor = ""; // Reset background color
    });
  }
}
function clearSelectedGroups() {
  const selectedGroupsContainer = document.getElementById(
    "selectedGroupsContainer",
  );
  if (selectedGroupsContainer) {
    selectedGroupsContainer.innerHTML = ""; // Clear all selected groups
  }

  const selectGroupOptions = document.getElementById("selectGroupOptions");
  if (selectGroupOptions) {
    // Reset the dropdown options' styles
    const options = selectGroupOptions.querySelectorAll(".option");
    options.forEach((option) => {
      option.style.backgroundColor = ""; // Reset background color
    });
  }
}

// in popup.js
// ACTION: Replace the enableStartPostingIfReady function.

function enableStartPostingIfReady() {
  const startPostingBtn = document.getElementById("startPosting");
  const quickPostBtn = document.getElementById("quickPostButton");
  const scheduleBtn = document.getElementById("schedulePostButton"); // Block scheduling too if limit hit?

  chrome.storage.local.get(
    ["licenseVerified", "freePostsRemaining"],
    (result) => {
      const isPro = !!result.licenseVerified;
      const remaining =
        result.freePostsRemaining !== undefined ? result.freePostsRemaining : 3;

      // Can they post?
      const canPost = isPro || remaining > 0;

      // Do they have valid content selected?
      const isQuickPost = !document
        .getElementById("quickPostPage")
        .classList.contains("d-none");
      let hasValidSelection = false;

      if (isQuickPost) {
        const hasText =
          quickPostQuill && quickPostQuill.getText().trim().length > 0;
        const hasMedia = Array.isArray(quickMedia) && quickMedia.length > 0;
        const hasGroups = quickSelectedGroups.length > 0;
        hasValidSelection = (hasText || hasMedia) && hasGroups;
      } else {
        // Advanced Mode
        hasValidSelection =
          selectedPosts.length > 0 && selectedGroups.length > 0;
      }

      const shouldEnable = canPost && hasValidSelection;

      // Update Buttons
      if (startPostingBtn) {
        startPostingBtn.disabled = !shouldEnable;
        if (!canPost)
          startPostingBtn.title =
            "Daily limit reached (0/3). Upgrade to post more.";
        else startPostingBtn.title = "";
      }

      if (quickPostBtn) {
        quickPostBtn.disabled = !shouldEnable;
        if (!canPost)
          quickPostBtn.title =
            "Daily limit reached (0/3). Upgrade to post more.";
        else quickPostBtn.title = "";
      }

      // Note: We might allow 'Scheduling' even if limit is 0, so it runs tomorrow.
      // But for simplicity, let's keep it consistent.
      if (scheduleBtn) {
        // Pro feature anyway, but good to be safe
        scheduleBtn.disabled = !shouldEnable;
      }
    },
  );
}
// Chrome storage change listener to handle activation page visibility
chrome.storage.onChanged.addListener(function (changes, area) {
  if (area == "local" && changes.licenseVerified) {
    // Check if the license verification status has changed
    if (changes.licenseVerified.newValue === true) {
      // License has been verified
      console.log("License verified");
      onLicenseValidated({ isValid: true });
      hideActivationPage();
    } else {
      // License verification failed or license data was removed
      console.log("License not verified or removed");
      showActivationPage(); // Show the activation page again
      showCustomModal(I18n.t("licIssueTitle"), I18n.t("licIssueMsg"));
    }
  }
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms * 1000));
}

// Quick Post related variables
let quickPostGroups = [];

// Quick Post UI Elements
const quickPostBTN = document.getElementById("quickPostBTN");
const quickPostPage = document.getElementById("quickPostPage");
const quickPostContent = document.getElementById("quickPostContent");
const quickPostButton = document.getElementById("quickPostButton");
// const quickPostStatus = document.getElementById("quickPostStatus");
const quickMediaInput = document.getElementById("quickMediaInput");
const quickSelectGroupWrapper = document.getElementById(
  "quickSelectGroupWrapper",
);
const quickSelectGroupInput = document.getElementById("quickSelectGroupInput");
const quickSelectGroupOptions = document.getElementById(
  "quickSelectGroupOptions",
);
const quickSelectedGroupsContainer = document.getElementById(
  "quickSelectedGroupsContainer",
);
const quickSelectedMedia = document.getElementById("quickSelectedMedia");

// ACTION: Replace the quickPostBTN listener in popup.js

// ACTION: Replace the quickPostBTN listener in popup.js

quickPostBTN.addEventListener("click", function (event) {
  // 1. UI Toggles
  tagBTN.classList.remove("active");
  groupBTN.classList.remove("active");
  SchedulerBTN.classList.remove("active");
  quickPostBTN.classList.add("active");
  scheduledPostsBtn.classList.remove("active");

  TagsPage.classList.add("d-none");
  SchedulerPage.classList.add("d-none");
  groupsPage.classList.add("d-none");
  productPage.classList.add("d-none");
  scheduledPostsPage.classList.add("d-none");
  historyPage.classList.add("d-none");
  historyListView.classList.remove("d-none");
  historyBTN.classList.remove("active");

  quickPostPage.classList.remove("d-none");

  // 2. Logic
  loadQuickPostGroups();
  handleNavigationWhileEditing();
  errorMsg.innerHTML = "";

  // 3. Calculator Auto-Start (FIXED)
  if (window.postQualityCalculator) {
    // Reset any previous state first
    window.postQualityCalculator.remove();

    // Initialize immediately
    window.postQualityCalculator.init("quickQualityScorerContainer", "quick");

    // Force a re-analysis after 500ms to catch content if it loaded slowly
    setTimeout(() => {
      window.postQualityCalculator.analyze();
    }, 500);
  }
});

function loadQuickPostGroups() {
  chrome.storage.local.get(["groups"], (result) => {
    quickPostGroups = result.groups || [];
    // Reset selections
    quickSelectedGroups = [];
    quickMedia = [];

    // Clear UI
    if (quickPostQuill) {
      quickPostQuill.root.innerHTML = ""; // This is the correct way to clear a Quill editor.
    }
    quickSelectedMedia.innerHTML = "";
    quickSelectedGroupsContainer.innerHTML = "";
    // quickPostStatus.innerHTML = "";

    populateQuickGroupOptions();
    updateQuickPostButton();
  });
}

function populateQuickGroupOptions() {
  quickSelectGroupOptions.innerHTML = "";
  quickPostGroups.forEach((group, index) => {
    const optionDiv = document.createElement("div");
    optionDiv.className = "option";
    optionDiv.setAttribute("data-index", index);

    // --- START MODIFICATION ---
    // Calculate the number of links in the group collection
    const linkCount = group.links ? group.links.length : 0;
    const key = linkCount === 1 ? "countLinkSingular" : "countLinks";
    const badgeText = I18n.t(key, [String(linkCount)]);
    // Use innerHTML to create two separate spans for title and the link count badge
    optionDiv.innerHTML = `
        <span class="option-title">${group.title || `Group ${index + 1}`}</span>
        <span class="option-badge">${badgeText}</span>
    `;
    // --- END MODIFICATION ---

    quickSelectGroupOptions.appendChild(optionDiv);

    optionDiv.addEventListener("click", () => {
      const groupIndex = parseInt(optionDiv.getAttribute("data-index"), 10);

      if (!quickSelectedGroups.some((g) => g.index === groupIndex)) {
        quickSelectedGroups.push({
          index: groupIndex,
          group: quickPostGroups[groupIndex],
        });
        addQuickSelectedGroup(groupIndex);
        optionDiv.style.backgroundColor = "#f0f0f0";
      } else {
        quickSelectedGroups = quickSelectedGroups.filter(
          (g) => g.index !== groupIndex,
        );
        removeQuickSelectedGroup(groupIndex);
        optionDiv.style.backgroundColor = "";
      }

      updateQuickPostButton();
    });
  });
}

function addQuickSelectedGroup(groupIndex) {
  const groupItem = document.createElement("div");
  groupItem.className = "tag-item";
  groupItem.innerText =
    quickPostGroups[groupIndex].title || `Group ${groupIndex + 1}`;

  const removeTag = document.createElement("span");
  removeTag.className = "remove-tag";
  removeTag.innerHTML = "×";
  removeTag.addEventListener("click", () => {
    quickSelectedGroups = quickSelectedGroups.filter(
      (g) => g.index !== groupIndex,
    );
    groupItem.remove();
    updateQuickPostButton();

    const optionDiv = quickSelectGroupOptions.querySelector(
      `[data-index="${groupIndex}"]`,
    );
    if (optionDiv) {
      optionDiv.style.backgroundColor = "";
    }
  });

  groupItem.appendChild(removeTag);
  quickSelectedGroupsContainer.appendChild(groupItem);
}

function removeQuickSelectedGroup(groupIndex) {
  const groupTitle =
    quickPostGroups[groupIndex].title || `Group ${groupIndex + 1}`;
  const groupItems = quickSelectedGroupsContainer.querySelectorAll(".tag-item");

  for (const groupItem of groupItems) {
    if (groupItem.textContent.trim().includes(groupTitle)) {
      groupItem.remove();
      break;
    }
  }
}

function updateQuickPostButton() {
  const quickPostBtn = document.getElementById("quickPostButton");
  const quickScheduleBtn = document.getElementById("quickScheduleButton");
  const aiVariationsContainer = document.getElementById(
    "quickAiVariationsContainer",
  );

  if (!quickPostBtn) return;

  const hasText = quickPostQuill && quickPostQuill.getText().trim().length > 0;
  const hasMedia = Array.isArray(quickMedia) && quickMedia.length > 0;
  const hasContent = hasText || hasMedia;
  const hasGroups = quickSelectedGroups.length > 0;

  // --- LOGIC: Hide AI Variations if not enough targets ---
  if (aiVariationsContainer) {
    let totalLinks = 0;
    // Count actual individual group links, not just collections
    quickSelectedGroups.forEach((g) => {
      if (g.group && g.group.links) totalLinks += g.group.links.length;
    });

    // We need more than 1 target for variations to make sense (e.g. Var A -> Group 1, Var B -> Group 2)
    if (totalLinks > 1) {
      aiVariationsContainer.classList.remove("d-none");
    } else {
      aiVariationsContainer.classList.add("d-none");

      // Reset state so it doesn't stay checked invisibly
      const checkbox = document.getElementById("quickGenerateAiVariations");
      if (checkbox && checkbox.checked) {
        checkbox.checked = false;
        // Also hide the inner options count
        document
          .getElementById("quickAiVariationOptions")
          ?.classList.add("d-none");
      }
    }
  }
  // -----------------------------------------------------

  chrome.storage.local.get(
    ["licenseVerified", "freePostsRemaining"],
    (result) => {
      const licenseVerified = result.licenseVerified || false;
      const freeCount =
        result.freePostsRemaining !== undefined ? result.freePostsRemaining : 3;
      const canPost = licenseVerified || freeCount > 0;

      const shouldEnable = hasContent && hasGroups && canPost;

      quickPostBtn.disabled = !shouldEnable;

      if (quickScheduleBtn) {
        quickScheduleBtn.disabled = !(hasContent && hasGroups);
      }
    },
  );
}
// Quick Post dropdown toggle
quickSelectGroupInput.addEventListener("click", () => {
  if (quickSelectGroupOptions.classList.contains("d-none")) {
    quickSelectGroupOptions.classList.remove("d-none");
  } else {
    quickSelectGroupOptions.classList.add("d-none");
  }
});

// Close dropdown when clicking outside
document.addEventListener("click", (event) => {
  if (!quickSelectGroupWrapper.contains(event.target)) {
    quickSelectGroupOptions.classList.add("d-none");
  }
});

// Helper function to check if a file is a valid media type
function isValidMediaFile(file) {
  const isImage = file.type.startsWith("image/");
  const isValidVideo = ["video/mp4", "video/webm", "audio/mp3"].includes(
    file.type,
  );
  return isImage || isValidVideo;
}

// Helper function to get file type description for user-friendly messages
function getFileTypeDescription(file) {
  if (file.type.startsWith("image/")) {
    return "image";
  } else if (["video/mp4", "video/webm"].includes(file.type)) {
    return "video";
  } else if (file.type === "audio/mp3") {
    return "audio";
  } else {
    return "unknown";
  }
}
quickPostButton.addEventListener("click", async function () {
  // --- 1. Gather Data ---
  const postText = quickPostQuill ? quickPostQuill.root.innerHTML : "";
  const hasText =
    postText && postText.trim() !== "" && postText.trim() !== "<p><br></p>";
  const hasMedia = Array.isArray(quickMedia) && quickMedia.length > 0;
  const generateAiVariations = document.getElementById(
    "quickGenerateAiVariations",
  ).checked;
  const aiVariationCount =
    parseInt(document.getElementById("quickAiVariationCount").value, 10) || 2;

  if (!hasText && !hasMedia) {
    showCustomModal(I18n.t("modalInputRequired"), I18n.t("modalNoContent"));
    return;
  }

  // --- 2. License Check ---
  const { licenseVerified } = await chrome.storage.local.get("licenseVerified");

  let totalLinksCount = 0;
  quickSelectedGroups.forEach((g) => {
    if (g.group?.links) totalLinksCount += g.group.links.length;
  });

  if (!licenseVerified) {
    const { remaining } = await checkAndResetDailyLimit();
    if (remaining <= 0) {
      showCustomModal(
        I18n.t("modalDailyLimitTitle"),
        I18n.t("modalDailyLimitBody", ["3"]),
        "alert",
        null,
        null,
        I18n.t("btnUpgrade"),
      );
      setTimeout(() => {
        const btn = document.querySelector("#customModalConfirmBtn");
        if (btn)
          btn.onclick = () => {
            openPricingModal();
            hideCustomModal();
          };
      }, 100);
      return;
    }
    if (totalLinksCount > 7) {
      showCustomModal(
        I18n.t("modalLimitTitle"),
        I18n.t("modalLimitBody", [String(totalLinksCount), "7", "7"]),
        "alert",
      );
      return;
    }
    await incrementDailyPostCount();
  }

  // --- 3. Prepare Post Object ---
  const post = {
    title: "Quick Post",
    text: hasText ? postText : "",
    images: Array.isArray(quickMedia) ? [...quickMedia] : [],
    color: "#18191A",
  };

  // --- 4. NEW: Read Settings from UI ---
  const timeDelayMinutes =
    parseFloat(document.getElementById("quickEnterTime").value) || 2;
  const linkCount =
    parseInt(document.getElementById("quickLinkCount").value, 10) || 1;
  const securityLevel =
    document.getElementById("quickSecuritySlider").value || "2";

  const settings = {
    timeDelay: (timeDelayInSeconds = timeDelayMinutes * 60),
    groupNumberForDelay: linkCount,
    avoidNightTimePosting: document.getElementById("quickNightPost").checked,
    delayAfterFailure: document.getElementById("quickDelayFail").checked,
    compressImages: true,
    securityLevel: securityLevel,
    // *** FIX: Force 'alternate' if AI is ON, otherwise 'sequential' ***
    postOrder: generateAiVariations ? "alternate" : "sequential",
    generateAiVariations: generateAiVariations,
    aiVariationCount: aiVariationCount,
    commentOption: "enable",
    firstCommentText: "",
    postAnonymously: document.getElementById("quickPostAnonymously").checked,
    postingMethod: "popup",
  };

  const collectiveLinks = [];
  quickSelectedGroups.forEach((groupEntry) => {
    if (groupEntry.group?.links) {
      collectiveLinks.push(...groupEntry.group.links);
    }
  });

  // --- 5. Execution Action ---
  const proceedWithQuickPost = async () => {
    quickPostButton.disabled = true;

    // Switch UI to Loading
    const mainPageDiv = document.getElementById("main");
    const loadingDiv = document.querySelector(".LoadingDiv");
    const loadingContentEl = document.getElementById("LoadingContent");
    const stopBtn = document.getElementById("stopButton");

    if (mainPageDiv) mainPageDiv.classList.add("d-none");
    if (loadingDiv) loadingDiv.classList.remove("d-none");
    if (loadingContentEl) loadingContentEl.innerHTML = I18n.t("loadingMsg");
    if (stopBtn) {
      stopBtn.disabled = false;
      stopBtn.innerHTML = `<i class="fa fa-stop-circle"></i> ${I18n.t(
        "btnStop",
      )}`;
    }

    // Initialize Live Log
    // If alternate, we only log 1 line per group.
    const logLength =
      settings.postOrder === "alternate"
        ? collectiveLinks.length
        : collectiveLinks.length *
          (generateAiVariations ? aiVariationCount + 1 : 1);

    const preLogEntries = [];
    for (let i = 0; i < logLength; i++) {
      // Correctly estimate logs based on order
      let postDisplayTitle = "Quick Post";
      let linkIndex = i;

      if (settings.postOrder === "sequential") {
        // This logic is complex to predict perfectly before AI runs,
        // but simple 1-to-1 mapping for alternate is easy.
        // For now, just pushing the group list is sufficient for the pre-log.
        linkIndex = i % collectiveLinks.length;
      }

      preLogEntries.push({
        key: `op_${i}`,
        postTitle: "Quick Post",
        linkTitle: collectiveLinks[linkIndex]?.[0] || "Unknown Group",
        linkURL: collectiveLinks[linkIndex]?.[1],
        status: "pending",
        reason: null,
        postUrl: null,
      });
    }

    chrome.storage.local.set({ liveLogEntries: preLogEntries }, () => {
      renderLiveLog(preLogEntries);
    });

    // Send Message
    setTimeout(async () => {
      const message = {
        action: "postPosts",
        selectedPosts: [post],
        group: { title: "Quick Post Groups", links: collectiveLinks },
        settings: settings,
      };

      chrome.runtime.sendMessage(message);

      if (!licenseVerified) {
        await incrementDailyPostCount();
      }

      // Cleanup
      if (quickPostQuill) quickPostQuill.setContents([]);
      quickSelectedGroups = [];
      quickMedia = [];
      quickSelectedGroupsContainer.innerHTML = "";
      updateQuickMediaDisplay();
      updateQuickPostButton();
    }, 100);
  };

  // --- 6. Summary ---
  const formattedGroups = quickSelectedGroups.map((item) => ({
    group: item.group,
  }));
  const summaryHtml = generatePostingSummary([post], formattedGroups, settings);

  showCustomModal(
    I18n.t("modalConfirmPost"),
    summaryHtml,
    "confirm",
    proceedWithQuickPost,
    null,
    I18n.t("btnPostNow"),
    I18n.t("btnGoBack"),
  );
});
function updateQuickMediaDisplay() {
  quickSelectedMedia.innerHTML = "";

  quickMedia.forEach((mediaItem, index) => {
    const mediaContainer = document.createElement("div");
    mediaContainer.className = "position-relative mr-2";

    if (mediaItem.type === "image") {
      mediaContainer.innerHTML = `
        <img src="${mediaItem.data}" alt="Preview" class="media">
        <button type="button" class="btn btn-sm btn-danger position-absolute" 
                style="top: -8px; right: -8px; border-radius: 50%; padding: 0.2rem 0.5rem;">×</button>
      `;
    } else {
      mediaContainer.innerHTML = `
        <video class="media" src="${mediaItem.data}" controls></video>
        <button type="button" class="btn btn-sm btn-danger position-absolute" 
                style="top: -8px; right: -8px; border-radius: 50%; padding: 0.2rem 0.5rem;">×</button>
      `;
    }

    // Add event listener to remove button
    mediaContainer.querySelector("button").addEventListener("click", () => {
      quickMedia.splice(index, 1);
      updateQuickMediaDisplay();
      updateQuickPostButton();
    });

    quickSelectedMedia.appendChild(mediaContainer);
  });

  // Update media count if the counter element exists
  const mediaCounter = document.getElementById("quickMediaCount");
  if (mediaCounter) {
    mediaCounter.textContent = `${quickMedia.length} item${
      quickMedia.length !== 1 ? "s" : ""
    }`;
  }
}

// Add these variables near other global variables at the top of the file
let commentOption = "none"; // Can be "none", "disable", or "comment"
let firstCommentText = "";

// Add these event listeners in your DOMContentLoaded function
document
  .getElementById("disableComments")
  .addEventListener("change", function () {
    if (this.checked) {
      document.getElementById("firstComment").checked = false;
      document
        .getElementById("firstCommentTextContainer")
        .classList.add("d-none");
      commentOption = "disable";
    } else if (!document.getElementById("firstComment").checked) {
      commentOption = "none";
    }
  });

document
  .getElementById("enableComments")
  .addEventListener("change", function () {
    if (this.checked) {
      document.getElementById("firstComment").checked = false;
      document
        .getElementById("firstCommentTextContainer")
        .classList.add("d-none");
      commentOption = "disable";
    } else if (!document.getElementById("firstComment").checked) {
      commentOption = "none";
    }
  });

document.getElementById("firstComment").addEventListener("change", function () {
  if (this.checked) {
    document.getElementById("disableComments").checked = false;
    document
      .getElementById("firstCommentTextContainer")
      .classList.remove("d-none");
    commentOption = "comment";
    firstCommentText = document.getElementById("firstCommentText").value;
  } else {
    document
      .getElementById("firstCommentTextContainer")
      .classList.add("d-none");
    if (!document.getElementById("disableComments").checked) {
      commentOption = "none";
    }
  }
});

document
  .getElementById("firstCommentText")
  .addEventListener("input", function () {
    firstCommentText = this.value;
  });

// Scheduling variables
let scheduledPosts = [];

// DOM Elements for scheduling
const scheduleModal = document.getElementById("scheduleModal");
const schedulePostButton = document.getElementById("schedulePostButton");
const saveScheduleButton = document.getElementById("saveScheduleButton");
const scheduledPostsBtn = document.getElementById("scheduledPostsBtn");
const scheduledPostsPage = document.getElementById("scheduledPostsPage");
const upcomingPostsList = document.getElementById("upcomingPostsList");
const completedPostsList = document.getElementById("completedPostsList");
const frequencyRadios = document.getElementsByName("scheduleFrequency");

// Schedule options containers
const onceScheduleOptions = document.getElementById("onceScheduleOptions");
const weeklyScheduleOptions = document.getElementById("weeklyScheduleOptions");
const monthlyScheduleOptions = document.getElementById(
  "monthlyScheduleOptions",
);

// Initialize datepicker with min date of today
document.addEventListener("DOMContentLoaded", function () {
  // Event listener for the "X" close button
  const closeButton = document.querySelector("#scheduleModal .close");
  if (closeButton) {
    closeButton.addEventListener("click", closeScheduleModal);
  }

  // Event listener for the Cancel button
  const cancelButton = document.querySelector("#scheduleModal .btn-secondary");
  if (cancelButton) {
    cancelButton.addEventListener("click", closeScheduleModal);
  }
  // Set date input min value to today
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("scheduleDate").min = today;
  document.getElementById("scheduleDate").value = today;

  // Set default time to current time + 1 hour
  const now = new Date();
  now.setHours(now.getHours() + 1);
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  document.getElementById("scheduleTime").value = `${hours}:${minutes}`;
  document.getElementById("weeklyTime").value = `${hours}:${minutes}`;
  document.getElementById("monthlyTime").value = `${hours}:${minutes}`;

  // Setup event listeners for day selection in weekly view
  document.querySelectorAll('input[name="weekday"]').forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      // Toggle the active class on the parent label
      if (this.checked) {
        this.parentElement.classList.add("active");
        this.parentElement.style.backgroundColor = "#343a40";
        this.parentElement.style.color = "white";
      } else {
        this.parentElement.classList.remove("active");
        this.parentElement.style.backgroundColor = "";
        this.parentElement.style.color = "";
      }
    });

    // Also add click handler to the label itself for better UX
    checkbox.parentElement.addEventListener("click", function () {
      // We don't need to add any code here as Bootstrap's data-toggle="buttons"
      // will handle the checkbox state toggling, and our change event above
      // will handle the visual styling
    });
    updateNextScheduledPostDisplay();
    scheduledPostsBtn.addEventListener("click", function () {
      // Existing code for showing scheduled posts page...

      // Make sure we have a container for the countdown
      if (!document.getElementById("next-post-countdown")) {
        const countdownElement = document.createElement("div");
        countdownElement.id = "next-post-countdown";
        countdownElement.className = "d-none mb-3";

        // Add it to the top of the scheduled posts page
        const scheduledPostsPage =
          document.getElementById("scheduledPostsPage");
        scheduledPostsPage.insertBefore(
          countdownElement,
          scheduledPostsPage.firstChild,
        );
      }

      // Show the countdown immediately
      displayScheduledPosts();
    });
  });

  // popup.js - Inside DOMContentLoaded

  // --- START: GENERATE MONTHLY DAYS (1-31) ---
  const monthContainer = document.getElementById("monthDayContainer");
  if (monthContainer) {
    monthContainer.innerHTML = ""; // Clear just in case

    for (let i = 1; i <= 31; i++) {
      // Create Label
      const label = document.createElement("label");
      label.className = "btn-visual-secondary m-1";
      label.style.width = "40px";
      label.style.justifyContent = "center";

      // Create Input
      const input = document.createElement("input");
      input.type = "checkbox";
      input.name = "monthday";
      input.value = i;

      // Append Input and Text to Label
      label.appendChild(input);
      label.appendChild(document.createTextNode(i));

      // Attach Visual Toggle Listener (Same logic as Weekly)
      input.addEventListener("change", function () {
        if (this.checked) {
          this.parentElement.classList.add("active");
          this.parentElement.style.backgroundColor = "#343a40";
          this.parentElement.style.color = "white";
        } else {
          this.parentElement.classList.remove("active");
          this.parentElement.style.backgroundColor = "";
          this.parentElement.style.color = "";
        }
      });

      monthContainer.appendChild(label);
    }
  }
  // --- END: GENERATE MONTHLY DAYS ---

  // (The rest of your DOMContentLoaded code continues here, e.g. frequency radios...)

  // Additional initialization to ensure correct display on page load
  const initialFrequency = document.querySelector(
    'input[name="scheduleFrequency"]:checked',
  ).value;
  updateScheduleOptionsVisibility(initialFrequency);

  // Add event listeners to frequency radios to update display when changed
  document
    .querySelectorAll('input[name="scheduleFrequency"]')
    .forEach((radio) => {
      radio.addEventListener("change", function () {
        updateScheduleOptionsVisibility(this.value);
      });
    });

  // Load scheduled posts from storage
  loadScheduledPosts();

  initializeFrequencyButtons();

  // Add event listeners for frequency radio buttons
  document
    .querySelectorAll('input[name="scheduleFrequency"]')
    .forEach((radio) => {
      radio.addEventListener("change", function () {
        // Update visible options
        updateScheduleOptionsVisibility(this.value);

        // Reset all frequency button styles first
        resetFrequencyButtonStyles();

        // Set active style on the selected button
        this.parentElement.classList.add("active");
        this.parentElement.style.backgroundColor = "#343a40";
        this.parentElement.style.color = "white";
      });
    });
});

// in popup.js

// Event listener for Schedule Post button
schedulePostButton.addEventListener("click", function () {
  // First validate if post, groups are selected
  if (!validatePostSelections()) {
    showCustomModal(
      "Selection Required",
      "Please select at least one post template and one group collection before scheduling.",
    );
    return;
  }

  if (editingScheduleIndex !== null) {
    // EDIT MODE: Populate the modal with existing data
    const postToEdit = scheduledPosts[editingScheduleIndex];
    populateScheduleModalForEditing(postToEdit);
  } else {
    // CREATE MODE: Reset the form for a new schedule
    resetScheduleForm();
  }

  // Use jQuery to show modal if available (common logic for both modes)
  if (typeof $ !== "undefined") {
    $("#scheduleModal").modal("show");
  } else {
    // Fallback for when jQuery is not available
    scheduleModal.style.display = "block";
    scheduleModal.classList.add("show");
  }
});

// Event listeners for frequency radio buttons
frequencyRadios.forEach((radio) => {
  radio.addEventListener("change", function () {
    // Update visible options
    updateScheduleOptionsVisibility(this.value);

    // Update active state on buttons
    document.querySelectorAll(".btn-group-toggle label.btn").forEach((btn) => {
      btn.classList.remove("active");
    });

    // Add active class to the selected frequency button
    this.parentElement.classList.add("active");
  });
});

// Function to update schedule options visibility based on selected frequency
function updateScheduleOptionsVisibility(frequency) {
  // Get all time values to preserve them
  const scheduleTime = document.getElementById("scheduleTime").value;
  const dailyTime = document.getElementById("dailyTime")?.value || scheduleTime;
  const weeklyTime = document.getElementById("weeklyTime").value;
  const monthlyTime = document.getElementById("monthlyTime").value;

  // Determine which time to use when switching
  let timeToUse =
    scheduleTime ||
    dailyTime ||
    weeklyTime ||
    monthlyTime ||
    getCurrentTimeString();

  // Hide all options containers first
  const onceOptions = document.getElementById("onceScheduleOptions");
  const dailyOptions = document.getElementById("dailyScheduleOptions");
  const weeklyOptions = document.getElementById("weeklyScheduleOptions");
  const monthlyOptions = document.getElementById("monthlyScheduleOptions");

  onceOptions.classList.add("d-none");
  dailyOptions.classList.add("d-none");
  weeklyOptions.classList.add("d-none");
  monthlyOptions.classList.add("d-none");

  // Show the appropriate container based on selected frequency
  switch (frequency) {
    case "once":
      onceOptions.classList.remove("d-none");
      document.getElementById("scheduleTime").value = timeToUse;
      break;

    case "daily":
      dailyOptions.classList.remove("d-none");
      document.getElementById("dailyTime").value = timeToUse;
      break;

    case "weekly":
      weeklyOptions.classList.remove("d-none");
      document.getElementById("weeklyTime").value = timeToUse;
      break;

    case "monthly":
      monthlyOptions.classList.remove("d-none");
      document.getElementById("monthlyTime").value = timeToUse;
      break;
  }
}

// Helper function to get current time string in HH:MM format
function getCurrentTimeString() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

// Reset schedule form to default values
function resetScheduleForm() {
  // Reset frequency to 'once'
  document.querySelector(
    'input[name="scheduleFrequency"][value="once"]',
  ).checked = true;

  // Reset all frequency button styles
  resetFrequencyButtonStyles();

  // Activate the 'once' button with proper styling
  const onceButton = document.querySelector(
    'input[name="scheduleFrequency"][value="once"]',
  ).parentElement;
  onceButton.classList.add("active");
  onceButton.style.backgroundColor = "#343a40";
  onceButton.style.color = "white";

  // Clear any selected weekdays
  document.querySelectorAll('input[name="weekday"]').forEach((checkbox) => {
    checkbox.checked = false;
    checkbox.parentElement.classList.remove("active");
    checkbox.parentElement.style.backgroundColor = "";
    checkbox.parentElement.style.color = "";
  });

  // Clear any selected month days
  document.querySelectorAll('input[name="monthday"]').forEach((checkbox) => {
    checkbox.checked = false;
    checkbox.parentElement.classList.remove("active");
    checkbox.parentElement.style.backgroundColor = "";
    checkbox.parentElement.style.color = "";
  });
  const saveScheduleButton = document.getElementById("saveScheduleButton");
  if (saveScheduleButton) {
    saveScheduleButton.textContent = I18n.t("schedSave");
  }
  // Show only the 'once' options
  updateScheduleOptionsVisibility("once");

  // Reset editing index
  editingScheduleIndex = null;
}

// Function to validate post and group selections
function validatePostSelections() {
  const hasPostsSelected = selectedPosts.length > 0;
  // const hasProductSelected = selectProduct.value !== "";
  const hasGroupsSelected = selectedGroups.length > 0;

  return hasPostsSelected && hasGroupsSelected;
}

// Add this new event listener inside the DOMContentLoaded block
cancelEditScheduleBtn.addEventListener("click", () => {
  resetSchedulerToDefaultState();
});

// in popup.js
// ACTION: Replace the quickScheduleButton event listener
const toggleQuickSettingsBtn = document.getElementById(
  "toggleQuickSettingsBtn",
);
const quickSettingsPanel = document.getElementById("quickPostSettings");

if (toggleQuickSettingsBtn && quickSettingsPanel) {
  toggleQuickSettingsBtn.addEventListener("click", () => {
    const isHidden = quickSettingsPanel.classList.contains("collapse");
    if (isHidden) {
      quickSettingsPanel.classList.remove("collapse");
      toggleQuickSettingsBtn
        .querySelector(".fa-chevron-down")
        .classList.replace("fa-chevron-down", "fa-chevron-up");
    } else {
      quickSettingsPanel.classList.add("collapse");
      toggleQuickSettingsBtn
        .querySelector(".fa-chevron-up")
        .classList.replace("fa-chevron-up", "fa-chevron-down");
    }
  });
}

const quickScheduleButton = document.getElementById("quickScheduleButton");

quickScheduleButton.addEventListener("click", async () => {
  // 1. Pro Check
  const { licenseVerified } = await chrome.storage.local.get("licenseVerified");
  if (!licenseVerified) {
    showCustomModal(
      I18n.t("modalProFeature"),
      I18n.t("lockSchedule"),
      "alert",
      () => openPricingModal(),
      null,
      I18n.t("btnUnlock"),
    );
    return;
  }

  // 2. Set Global Flag
  window.isQuickPostSchedulingMode = true;

  // 3. Handle Mode (Edit vs New)
  if (editingScheduleIndex !== null) {
    // EDIT MODE: Populate modal with existing schedule data
    const postToEdit = scheduledPosts[editingScheduleIndex];
    populateScheduleModalForEditing(postToEdit);
  } else {
    // NEW MODE: Reset form to defaults
    resetScheduleForm();
  }

  // 4. Open Modal
  if (typeof $ !== "undefined") {
    $("#scheduleModal").modal("show");
  } else {
    const modal = document.getElementById("scheduleModal");
    modal.style.display = "block";
    modal.classList.add("show");
  }
});

saveScheduleButton.addEventListener("click", async function () {
  // --- 1. FREEMIUM LOCK ---
  // Allow them to fill out the form, but block saving if not Pro.
  const { licenseVerified } = await chrome.storage.local.get("licenseVerified");

  // Exception: Allow Trigger Block configuration inside Campaign Builder
  if (window.activeCampaignTriggerBlock) {
    handleTriggerBlockSave();
    return;
  }

  if (!licenseVerified) {
    showCustomModal(
      I18n.t("modalProFeature"),
      I18n.t("lockScheduleSave"),
      "alert",
      () => {
        openPricingModal();
      },
      null,
      I18n.t("btnUnlock"),
    );
    return;
  }

  // --- 2. COLLECT DATA ---
  const scheduleData = collectScheduleData();
  if (!scheduleData) return; // Validation failed inside collectScheduleData

  // --- 3. DEFINE SAVE ACTION ---
  const proceedWithScheduling = () => {
    // FIXED LOGIC: If we have an index, we UPDATE, regardless of mode.
    if (editingScheduleIndex !== null) {
      // --- Update Existing ---
      // Preserve ID and CreatedAt from the original to avoid duplicates
      if (scheduledPosts[editingScheduleIndex]) {
        scheduleData.id = scheduledPosts[editingScheduleIndex].id;
        scheduleData.createdAt = scheduledPosts[editingScheduleIndex].createdAt;
      }

      // Update the array
      scheduledPosts[editingScheduleIndex] = scheduleData;
      console.log(`Updated existing schedule at index ${editingScheduleIndex}`);
    } else {
      // --- Create New ---
      scheduledPosts.push(scheduleData);
      console.log("Created new schedule entry");
    }

    // Save to Storage
    saveScheduledPosts();

    // Close Modal
    if (typeof $ !== "undefined") {
      $("#scheduleModal").modal("hide");
    } else {
      const modal = document.getElementById("scheduleModal");
      if (modal) {
        modal.style.display = "none";
        modal.classList.remove("show");
      }
    }

    // --- 4. CLEANUP & RESET UI ---
    if (window.isQuickPostSchedulingMode) {
      // A. QUICK POST CLEANUP
      // Clear the editor and selections so the user knows it was "sent" to the scheduler
      if (quickPostQuill) quickPostQuill.setContents([]);
      quickMedia = [];
      quickSelectedGroups = [];
      const container = document.getElementById("quickSelectedGroupsContainer");
      if (container) container.innerHTML = "";

      updateQuickMediaDisplay();
      updateQuickPostButton();

      // Notify User
      const msg =
        editingScheduleIndex !== null
          ? "Quick Post schedule updated successfully."
          : "Your Quick Post has been added to the schedule.";

      showCustomModal(I18n.t("statusSuccess"), msg, "success");

      // If we were editing, we must reset the view back to the list now
      if (editingScheduleIndex !== null) {
        resetSchedulerToDefaultState();
      } else {
        // Just turn off the flag if it was a new creation
        window.isQuickPostSchedulingMode = false;
      }
    } else {
      // B. ADVANCED SCHEDULER CLEANUP
      if (editingScheduleIndex !== null) {
        resetSchedulerToDefaultState();
      } else {
        displayScheduledPosts(); // Refresh the list view
      }
    }
  };

  // --- 5. SHOW CONFIRMATION SUMMARY ---
  const groupCollectionsForSummary = scheduleData.groups.map((groupObject) => ({
    group: groupObject,
  }));

  const summaryHtml = generatePostingSummary(
    scheduleData.posts,
    groupCollectionsForSummary,
    scheduleData.settings,
    0, // No truncation warning for scheduler (Pro only)
  );

  const title =
    editingScheduleIndex !== null
      ? "Confirm Schedule Update"
      : "Confirm New Schedule";

  const btnText =
    editingScheduleIndex !== null ? "Update Schedule" : "Save Schedule";

  showCustomModal(
    title,
    summaryHtml,
    "confirm",
    proceedWithScheduling,
    null,
    btnText,
    "Go Back & Edit",
  );
});

function collectScheduleData() {
  const frequency = document.querySelector(
    'input[name="scheduleFrequency"]:checked',
  ).value;

  let postsData = [];
  let groupsData = [];
  let settings = {};

  // --- BRANCH LOGIC ---
  if (window.isQuickPostSchedulingMode) {
    // A. QUICK POST MODE
    const postText = quickPostQuill ? quickPostQuill.root.innerHTML : "";

    postsData = [
      {
        title: "Quick Post",
        text: postText,
        images: Array.isArray(quickMedia) ? [...quickMedia] : [],
        color: "#18191A",
        categoryIds: [],
      },
    ];

    groupsData = quickSelectedGroups.map((item) => ({ ...item.group }));

    const timeDelayMinutes =
      parseFloat(document.getElementById("quickEnterTime").value) || 2;
    const linkCount =
      parseInt(document.getElementById("quickLinkCount").value, 10) || 1;
    const securityLevel =
      document.getElementById("quickSecuritySlider").value || "2";

    const genAi = document.getElementById("quickGenerateAiVariations").checked;
    const aiCount =
      parseInt(document.getElementById("quickAiVariationCount").value, 10) || 2;

    settings = {
      linkCount: linkCount,
      timeDelay: timeDelayMinutes * 60,
      avoidNightPosting: document.getElementById("quickNightPost").checked,
      postAnonymously: document.getElementById("quickPostAnonymously").checked,
      delayAfterFailure: document.getElementById("quickDelayFail").checked,
      compressImages: true,
      commentOption: "enable",
      firstCommentText: "",
      postingMethod: "popup",
      postOrder: "sequential",
      securityLevel: securityLevel,
      generateAiVariations: genAi,
      aiVariationCount: aiCount,
    };
  } else {
    // B. ADVANCED SCHEDULER MODE
    postsData = selectedPosts.map((entry) => ({ ...entry.post }));
    groupsData = selectedGroups.map((entry) => ({ ...entry.group }));

    settings = {
      linkCount: parseInt(document.getElementById("linkCount").value, 10) || 1,
      timeDelay:
        (parseFloat(document.getElementById("enterTime").value) || 5) * 60,
      avoidNightPosting: document.getElementById("nightPost").checked,
      postAnonymously: document.getElementById("schedPostAnonymously").checked,
      delayAfterFailure: document.getElementById("delayAfterFailure").checked,
      compressImages: document.getElementById("compressImage").checked,
      commentOption: document.querySelector(
        'input[name="commentOption"]:checked',
      ).value,
      firstCommentText: document.getElementById("firstCommentText").value,
      postingMethod:
        document.querySelector('input[name="postingMethod"]:checked')?.value ||
        "popup",
      postOrder:
        document.querySelector('input[name="postOrder"]:checked')?.value ||
        "sequential",
      generateAiVariations: document.getElementById("generateAiVariations")
        .checked,
      aiVariationCount:
        parseInt(document.getElementById("aiVariationCount").value, 10) || 2,
      securityLevel:
        document.getElementById("securityLevelSlider").value || "2",
    };

    if (editingScheduleIndex !== null && !window.isQuickPostSchedulingMode) {
      // Merge logic for Advanced Edit if needed
      const originalPost = scheduledPosts[editingScheduleIndex];
      if (postsData.length === 0 && originalPost.posts)
        postsData = originalPost.posts;
      if (groupsData.length === 0 && originalPost.groups)
        groupsData = originalPost.groups;
    }
  }

  // --- VALIDATION ---
  if (postsData.length === 0) {
    showCustomModal("Input Required", "Please create content to schedule.");
    return null;
  }
  if (groupsData.length === 0) {
    showCustomModal("Input Required", "Please select at least one group.");
    return null;
  }

  // --- CONSTRUCT OBJECT ---
  // FIXED: Use existing ID if editing, otherwise generate new.
  const currentId =
    editingScheduleIndex !== null && scheduledPosts[editingScheduleIndex]
      ? scheduledPosts[editingScheduleIndex].id
      : `sched_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const scheduleInfo = {
    id: currentId,
    frequency: frequency,
    // createdAt is handled in the save function if updating
    createdAt: new Date().toISOString(),
    posts: postsData,
    groups: groupsData,
    status: "scheduled",
    lastRunTime: null,
    lastError: null,
    settings: settings,
  };

  // --- TIME CALCULATION ---
  const now = new Date();
  let nextRun;

  switch (frequency) {
    case "once":
      const scheduleDateStr = document.getElementById("scheduleDate").value;
      const scheduleTimeStr = document.getElementById("scheduleTime").value;
      if (!scheduleDateStr || !scheduleTimeStr) {
        showCustomModal("Input Required", "Please select date and time.");
        return null;
      }
      const [year, month, day] = scheduleDateStr.split("-").map(Number);
      const [hour, minute] = scheduleTimeStr.split(":").map(Number);
      const onceDateTime = new Date(year, month - 1, day, hour, minute);

      if (onceDateTime <= now && editingScheduleIndex === null) {
        showCustomModal(I18n.t("modalInputRequired"), I18n.t("schedErrPast"));
        return null;
      }
      scheduleInfo.scheduleDateTime = onceDateTime.toISOString();
      nextRun = scheduleInfo.scheduleDateTime;
      break;
    case "daily":
      const dailyTime = document.getElementById("dailyTime").value;
      if (!dailyTime) return null;
      scheduleInfo.scheduleTime = dailyTime;
      nextRun = getNextDailyRunTime(dailyTime);
      break;
    case "weekly":
      const weeklyTime = document.getElementById("weeklyTime").value;
      const selectedWeekdays = Array.from(
        document.querySelectorAll('input[name="weekday"]:checked'),
      ).map((cb) => parseInt(cb.value));
      if (selectedWeekdays.length === 0) return null;
      scheduleInfo.weekdays = selectedWeekdays;
      scheduleInfo.scheduleTime = weeklyTime;
      nextRun = getNextWeekdayRunTime(selectedWeekdays, weeklyTime);
      break;
    case "monthly":
      const monthlyTime = document.getElementById("monthlyTime").value;
      const selectedMonthDays = Array.from(
        document.querySelectorAll('input[name="monthday"]:checked'),
      ).map((cb) => parseInt(cb.value));
      if (selectedMonthDays.length === 0) return null;
      scheduleInfo.monthDays = selectedMonthDays;
      scheduleInfo.scheduleTime = monthlyTime;
      nextRun = getNextMonthDayRunTime(selectedMonthDays, monthlyTime);
      break;
  }

  if (!nextRun) return null;
  scheduleInfo.nextRunTime = nextRun;

  return scheduleInfo;
}

function updateSchedulerFeatureVisibility() {
  const aiSection = document.getElementById("aiVariationSection");
  const orderSection = document.getElementById("postOrderSection");

  if (!aiSection || !orderSection) return;

  const hasMultiplePosts = selectedPosts.length > 1;
  const hasSinglePost = selectedPosts.length === 1;

  // --- 1. AI Variations Visibility ---
  if (hasSinglePost) {
    aiSection.classList.remove("d-none");
  } else {
    aiSection.classList.add("d-none");
    const aiCheck = document.getElementById("generateAiVariations");
    const aiOpts = document.getElementById("aiVariationOptions");
    if (aiCheck) aiCheck.checked = false;
    if (aiOpts) aiOpts.classList.add("d-none");
  }

  // --- 2. Posting Order Visibility ---

  // Calculate total target links
  let totalTargetLinks = 0;

  selectedGroups.forEach((g) => {
    if (g.group) {
      // Handle Dynamic Random Groups (No 'links' array, use config count)
      if (g.group.type === "dynamic_random" && g.group.config) {
        totalTargetLinks += parseInt(g.group.config.randomCount) || 0;
      }
      // Handle Standard/Static Groups (Use 'links' array length)
      else if (Array.isArray(g.group.links)) {
        totalTargetLinks += g.group.links.length;
      }
    }
  });

  const shouldBeVisible = hasMultiplePosts && totalTargetLinks > 1;

  if (shouldBeVisible) {
    const wasHidden = orderSection.classList.contains("d-none");
    orderSection.classList.remove("d-none");

    // Initialize pill slider if it just appeared
    if (wasHidden) {
      setTimeout(() => {
        const container = document.getElementById("postingOrderPills");
        const radio = document.querySelector('input[name="postOrder"]:checked');
        const val = radio ? radio.value : "sequential";

        const pill = container?.querySelector(
          `.stat-pill[data-value="${val}"]`,
        );
        if (pill) {
          container
            .querySelectorAll(".stat-pill")
            .forEach((p) => p.classList.remove("selected"));
          pill.classList.add("selected");
          moveOrderHighlight(pill);
        }
      }, 10);
    }
  } else {
    orderSection.classList.add("d-none");
    // Reset to Sequential default
    const seqRadio = document.getElementById("orderSequential");
    if (seqRadio) seqRadio.checked = true;
  }
}

// These are needed when *saving* the schedule in the popup
function getNextDailyRunTime(timeString) {
  const [hours, minutes] = timeString.split(":").map(Number);
  const now = new Date();
  const nextRun = new Date();
  nextRun.setHours(hours, minutes, 0, 0);
  if (nextRun <= now) {
    nextRun.setDate(nextRun.getDate() + 1);
  }
  return nextRun.toISOString();
}

function getNextWeekdayRunTime(weekdays, timeString) {
  const [hours, minutes] = timeString.split(":").map(Number);
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday
  const sortedWeekdays = [...weekdays].sort((a, b) => a - b);
  let daysUntilNext = Infinity;

  for (const day of sortedWeekdays) {
    let diff = day - currentDay;
    if (diff > 0) {
      daysUntilNext = Math.min(daysUntilNext, diff);
    } else if (diff === 0) {
      // Same day
      const potentialNextRun = new Date(now);
      potentialNextRun.setHours(hours, minutes, 0, 0);
      if (potentialNextRun > now) {
        daysUntilNext = Math.min(daysUntilNext, 0); // Today, later
      } else {
        daysUntilNext = Math.min(daysUntilNext, 7); // Next week
      }
    } else {
      // Day is earlier in the week
      daysUntilNext = Math.min(daysUntilNext, diff + 7);
    }
  }

  if (daysUntilNext === Infinity || daysUntilNext < 0) daysUntilNext = 7; // Fallback or handle error case

  const nextRun = new Date(now);
  if (
    daysUntilNext === 0 &&
    new Date().setHours(hours, minutes, 0, 0) <= now.getTime()
  ) {
    // If it's today but time passed, find next actual occurrence day
    const nextDayOfWeek =
      sortedWeekdays.find((day) => day > currentDay) ?? sortedWeekdays[0];
    let nextDiff = nextDayOfWeek - currentDay;
    daysUntilNext = nextDiff <= 0 ? nextDiff + 7 : nextDiff;
  }

  nextRun.setDate(now.getDate() + daysUntilNext);
  nextRun.setHours(hours, minutes, 0, 0);
  return nextRun.toISOString();
}

function getNextMonthDayRunTime(monthDays, timeString) {
  const [hours, minutes] = timeString.split(":").map(Number);
  const now = new Date();
  const currentDay = now.getDate();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const sortedDays = [...monthDays].sort((a, b) => a - b);

  let nextRunYear = currentYear;
  let nextRunMonth = currentMonth;
  let nextRunDay = null;

  // Find the first day in the list >= current day
  nextRunDay = sortedDays.find((day) => day >= currentDay);

  if (nextRunDay !== undefined) {
    // Found a day, check if time has passed today
    const potentialNextRun = new Date(
      currentYear,
      currentMonth,
      nextRunDay,
      hours,
      minutes,
      0,
      0,
    );
    if (potentialNextRun <= now) {
      // Time has passed, find the *next* day in the list
      const nextIndex = sortedDays.findIndex((day) => day > currentDay);
      if (nextIndex !== -1) {
        nextRunDay = sortedDays[nextIndex];
      } else {
        // No more days this month, go to next month's first day
        nextRunDay = sortedDays[0];
        nextRunMonth += 1;
        if (nextRunMonth > 11) {
          nextRunMonth = 0;
          nextRunYear += 1;
        }
      }
    } // else: Day is today or later, time hasn't passed - use nextRunDay
  } else {
    // No day >= current day this month, go to next month's first day
    nextRunDay = sortedDays[0];
    nextRunMonth += 1;
    if (nextRunMonth > 11) {
      nextRunMonth = 0;
      nextRunYear += 1;
    }
  }

  // Calculate final date, ensuring day is valid for the month
  let tempDate = new Date(nextRunYear, nextRunMonth, 1);
  let daysInMonth = new Date(
    tempDate.getFullYear(),
    tempDate.getMonth() + 1,
    0,
  ).getDate();
  nextRunDay = Math.min(nextRunDay, daysInMonth);

  const nextRun = new Date(
    nextRunYear,
    nextRunMonth,
    nextRunDay,
    hours,
    minutes,
    0,
    0,
  );

  return nextRun.toISOString();
}

function saveScheduledPosts() {
  // This function now just saves data and returns a promise.
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ scheduledPosts }, function () {
      if (chrome.runtime.lastError) {
        console.error(
          "Error saving scheduled posts:",
          chrome.runtime.lastError,
        );
        reject(chrome.runtime.lastError);
      } else {
        console.log("Scheduled posts saved to storage.");
        resolve();
      }
    });
  });
}

function loadScheduledPosts() {
  chrome.storage.local.get(["scheduledPosts", "campaigns"], function (result) {
    // 1. Get Standard Scheduled Posts
    let standardPosts = (result.scheduledPosts || []).filter(
      (p) => !p.isCampaign,
    );

    if (standardPosts.length !== (result.scheduledPosts || []).length) {
      chrome.storage.local.set({ scheduledPosts: standardPosts });
    }

    const campaignPosts = [];
    const campaigns = result.campaigns || [];

    campaigns.forEach((camp) => {
      if (camp.status === "active" || camp.status === "paused") {
        let effectiveNextTime = null;
        let statusLabel = "scheduled";
        let displayTitle = camp.title;

        // --- 1. Determine Display Time & Status ---
        if (camp.status === "paused") {
          effectiveNextTime = camp.nextRunTime || new Date().toISOString();
          statusLabel = "paused";
          displayTitle += " (Paused)";
        } else {
          const currentStep = camp.steps[camp.currentStepIndex || 0];

          if (
            currentStep &&
            currentStep.type === "wait" &&
            camp.waitTargetTime
          ) {
            effectiveNextTime = new Date(camp.waitTargetTime).toISOString();
            statusLabel = "waiting";
            displayTitle += ` (Waiting)`;
          } else if (camp.nextRunTime) {
            effectiveNextTime = new Date(camp.nextRunTime).toISOString();
            statusLabel = "scheduled";
          } else {
            effectiveNextTime = new Date().toISOString();
            statusLabel = "processing";
            displayTitle += " (Processing)";
          }
        }

        // --- 2. Extract Recurrence Settings for Calendar ---
        // We look at the Trigger block (usually Step 0 or stored in camp.trigger)
        const trigger = camp.trigger || {};
        const triggerFreq =
          trigger.type === "scheduled" ? trigger.frequency : "once";

        // If the *current* step is a wait/loop, we still want to show the CAMPAIGN's main recurrence pattern on the calendar
        // so the user knows when it *starts* again.

        if (effectiveNextTime) {
          campaignPosts.push({
            id: camp.id,
            posts: [{ title: displayTitle }],

            // *** CRITICAL FIX: Pass Trigger Settings to Virtual Post ***
            frequency: triggerFreq, // e.g. "weekly", "daily"
            weekdays: trigger.weekdays || [], // [1, 3]
            monthDays: trigger.monthDays || [], // [1, 15]

            status: statusLabel,
            nextRunTime: effectiveNextTime,
            groups: [],
            isCampaign: true,
            campaignState: statusLabel,
          });
        }
      }
    });

    scheduledPosts = [...standardPosts, ...campaignPosts];

    const activeView =
      document.querySelector('input[name="schedulerView"]:checked')?.value ||
      "list";
    if (activeView === "list") displayScheduledPosts();
    else if (activeView === "calendar")
      renderCalendar(
        currentCalendarDate.getFullYear(),
        currentCalendarDate.getMonth(),
      );
    else if (activeView === "timeline") renderTimelineView();
  });
}

// Find and REPLACE the entire scheduledPostsBtn.addEventListener(...) block
scheduledPostsBtn.addEventListener("click", function () {
  // Hide other pages
  tagBTN.classList.remove("active");
  groupBTN.classList.remove("active");
  SchedulerBTN.classList.remove("active");
  quickPostBTN.classList.remove("active");
  scheduledPostsBtn.classList.add("active");
  historyBTN.classList.remove("active");

  TagsPage.classList.add("d-none");
  SchedulerPage.classList.add("d-none");
  groupsPage.classList.add("d-none");
  productPage.classList.add("d-none");
  quickPostPage.classList.add("d-none");
  historyPage.classList.add("d-none");

  // Show scheduled posts page
  scheduledPostsPage.classList.remove("d-none");
  handleNavigationWhileEditing(); // <<< ADD THIS LINE
  // Check which view is active and render accordingly
  const isCalendarView = document.getElementById("viewCalendar").checked;
  if (isCalendarView) {
    renderCalendar(
      currentCalendarDate.getFullYear(),
      currentCalendarDate.getMonth(),
    );
  } else {
    displayScheduledPosts();
  }
});

async function displayScheduledPosts() {
  const upcomingPostsList = document.getElementById("upcomingPostsList");
  const noPostsMessage = document.querySelector(".no-scheduled-posts");
  const template = document.getElementById("scheduledPostTemplate");
  const recurringNotifContainer = document.getElementById(
    "missed-recurring-notification-container",
  );
  const onceMissedContainer = document.getElementById(
    "missed-once-posts-container",
  );

  if (
    !upcomingPostsList ||
    !noPostsMessage ||
    !template ||
    !recurringNotifContainer ||
    !onceMissedContainer
  ) {
    return;
  }

  const data = await chrome.storage.local.get(["missedRecurringNotifications"]);
  const missedRecurringNotifications = data.missedRecurringNotifications || [];

  upcomingPostsList.innerHTML = "";
  recurringNotifContainer.innerHTML = "";
  onceMissedContainer.innerHTML = "";

  const missedOncePosts = scheduledPosts.filter(
    (p) => p.status === "missed" && p.frequency === "once",
  );
  const regularScheduledPosts = scheduledPosts.filter(
    (p) =>
      p.status === "scheduled" ||
      p.status === "processing" ||
      p.status === "waiting",
  );

  // --- Render Missed Recurring Notifications (Localized) ---
  if (missedRecurringNotifications.length > 0) {
    recurringNotifContainer.classList.remove("d-none");
    const header = document.createElement("div");
    header.className = "info-header";
    header.innerHTML = `<i class="fa fa-bell"></i><h4>${I18n.t(
      "notifHeader",
    )}</h4>`;
    recurringNotifContainer.appendChild(header);

    missedRecurringNotifications.forEach((notif) => {
      const item = document.createElement("div");
      item.className = "info-item";
      // FIX: Localized
      const msg = I18n.t("notifMissedRecur", [
        notif.title,
        new Date(notif.missedTime).toLocaleString(),
      ]);
      item.innerHTML = `
        <div class="info-item-details">${msg}</div>
        <button class="btn-visual-secondary dismiss-notification-btn" data-notif-id="${notif.id}" title="Dismiss">&times;</button>
      `;
      recurringNotifContainer.appendChild(item);
    });
  } else {
    recurringNotifContainer.classList.add("d-none");
  }

  // --- Render Missed One-Time Posts (Localized) ---
  if (missedOncePosts.length > 0) {
    onceMissedContainer.classList.remove("d-none");
    // FIX: Localized Headers & Desc
    onceMissedContainer.innerHTML = `
      <div class="missed-posts-container">
        <div class="missed-posts-header">
          <i class="fa fa-exclamation-triangle"></i>
          <h4>${I18n.t("missedActionHeader")}</h4>
        </div>
        <p class="missed-posts-info">${I18n.t("missedActionDesc")}</p>
        <div id="missed-once-list"></div>
      </div>`;
    const listContainer =
      onceMissedContainer.querySelector("#missed-once-list");
    missedOncePosts.forEach((post) => {
      const originalIndex = scheduledPosts.findIndex((p) => p.id === post.id);
      const item = document.createElement("div");
      item.className = "missed-post-item";

      const dueMsg = I18n.t("missedWasDue", [
        new Date(post.nextRunTime).toLocaleString(),
      ]);

      item.innerHTML = `
        <div class="missed-post-details">
          <span class="missed-post-title">${
            post.posts[0]?.title || "Untitled Post"
          }</span>
          <span class="missed-post-time" style="color: #c0392b;">${dueMsg}</span>
        </div>
        <div class="missed-post-actions">
          <button class="btn btn-sm btn-primary btn-post-now" data-index="${originalIndex}">${I18n.t(
            "btnPostNow",
          )}</button>
          <button class="btn btn-sm btn-outline-secondary btn-reschedule-once" data-index="${originalIndex}">${I18n.t(
            "btnReschedule",
          )}</button>
          <button class="btn btn-sm btn-outline-danger btn-delete" data-index="${originalIndex}">${I18n.t(
            "btnDelete",
          )}</button>
        </div>
      `;
      listContainer.appendChild(item);
    });
  } else {
    onceMissedContainer.classList.add("d-none");
  }

  // --- Render Upcoming Scheduled Posts ---
  const sortedScheduled = regularScheduledPosts.sort(
    (a, b) => new Date(a.nextRunTime) - new Date(b.nextRunTime),
  );

  sortedScheduled.forEach((post) => {
    const originalIndex = scheduledPosts.findIndex((p) => p.id === post.id);
    const postElement = createPostElement(post, originalIndex, template);
    upcomingPostsList.appendChild(postElement);
  });

  noPostsMessage.style.display =
    regularScheduledPosts.length === 0 &&
    missedOncePosts.length === 0 &&
    missedRecurringNotifications.length === 0
      ? "block"
      : "none";

  attachMissedPostListeners();
  updateNextScheduledPostDisplay();
}

/**
 * Attaches event listeners for the "missed posts" and "notification" sections using event delegation.
 * This is called by displayScheduledPosts after the UI is rendered.
 */
async function attachMissedPostListeners() {
  // --- 1. Get Stable Parent Containers ---
  const recurringNotifContainer = document.getElementById(
    "missed-recurring-notification-container",
  );
  const onceMissedContainer = document.getElementById(
    "missed-once-posts-container",
  );

  // --- 2. Clean Up Old Listeners (Safety First) ---
  // To prevent multiple listeners from being attached, we store the handler on the element itself
  // and remove it before adding a new one.
  if (recurringNotifContainer && recurringNotifContainer.clickHandler) {
    recurringNotifContainer.removeEventListener(
      "click",
      recurringNotifContainer.clickHandler,
    );
  }
  if (onceMissedContainer && onceMissedContainer.clickHandler) {
    onceMissedContainer.removeEventListener(
      "click",
      onceMissedContainer.clickHandler,
    );
  }

  // --- 3. Attach Listener for Recurring Notifications ---
  if (recurringNotifContainer) {
    const recurringHandler = async (e) => {
      // Find the button that was clicked, if any
      const button = e.target.closest(".dismiss-notification-btn");
      if (!button) return;

      const notifId = button.dataset.notifId;
      const data = await chrome.storage.local.get(
        "missedRecurringNotifications",
      );
      let notifications = data.missedRecurringNotifications || [];
      notifications = notifications.filter((n) => n.id !== notifId);
      await chrome.storage.local.set({
        missedRecurringNotifications: notifications,
      });
      displayScheduledPosts(); // Re-render the UI
    };
    recurringNotifContainer.addEventListener("click", recurringHandler);
    recurringNotifContainer.clickHandler = recurringHandler; // Store reference for cleanup
  }

  // --- 4. Attach Listener for One-Time Missed Posts (THE FIX) ---
  if (onceMissedContainer) {
    const onceHandler = async (e) => {
      // Find the button that was clicked, if any
      const button = e.target.closest("button");
      if (!button) return;

      const index = parseInt(button.dataset.index, 10);
      if (isNaN(index)) return;

      // Fetch the latest version of scheduledPosts to avoid acting on stale data
      const { scheduledPosts: currentPosts } =
        await chrome.storage.local.get("scheduledPosts");
      if (!currentPosts || !currentPosts[index]) return;

      const post = currentPosts[index];

      if (button.classList.contains("btn-post-now")) {
        post.status = "scheduled";
        post.nextRunTime = new Date(Date.now() + 60 * 1000).toISOString();
        await chrome.storage.local.set({ scheduledPosts: currentPosts });
        chrome.runtime.sendMessage({ action: "runSchedulerCheck" });
        showCustomModal(
          I18n.t("modalActionQueued"),
          I18n.t("modalQueuedImmediate"),
        );
        displayScheduledPosts(); // Re-render
      } else if (button.classList.contains("btn-reschedule-once")) {
        // Re-uses the existing edit flow, which is efficient
        editScheduledPost(index);
      } else if (button.classList.contains("btn-delete")) {
        // Calls the existing delete function, which handles confirmation
        deleteScheduledPost(index);
      }
    };
    onceMissedContainer.addEventListener("click", onceHandler);
    onceMissedContainer.clickHandler = onceHandler; // Store reference for cleanup
  }
}

function createPostElement(post, originalIndex, template) {
  const postElement = document.importNode(template.content, true);

  const card = postElement.querySelector(".scheduled-post-item");
  const titleEl = postElement.querySelector(".post-title");
  const badgeEl = postElement.querySelector(".frequency-badge");
  const nextDateEl = postElement.querySelector(".next-schedule-date");
  const groupsCountEl = postElement.querySelector(".groups-count");
  const detailsEl = postElement.querySelector(".schedule-details");

  let postTitle = "Untitled Post";
  if (post.posts && post.posts.length > 0) {
    postTitle = post.posts[0].title;
  } else if (post.product) {
    postTitle = post.product.title || "Untitled Product";
  }

  // --- TIME FORMATTING (Localized) ---
  const dateObj = new Date(post.nextRunTime);
  const timeStr = dateObj.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const dateStr = dateObj.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
  const isToday = new Date().toDateString() === dateObj.toDateString();

  const dayLabel = isToday ? I18n.t("lblTodayDate") : dateStr;
  const timeDisplayHtml = `<span class="time-highlight">${timeStr}</span> <span class="date-muted">${dayLabel}</span>`;
  nextDateEl.innerHTML = timeDisplayHtml;

  // --- 1. CAMPAIGN SPECIFIC DESIGN ---
  if (post.isCampaign) {
    card.className = "scheduled-post-item campaign-item-clean";

    let iconHTML = `<i class="fa fa-rocket" style="color:#6366f1;"></i>`;
    if (post.campaignState === "waiting")
      iconHTML = `<i class="fa fa-hourglass-start" style="color:#f59e0b;"></i>`;
    if (post.campaignState === "processing")
      iconHTML = `<i class="fa fa-refresh fa-spin" style="color:#10b981;"></i>`;
    if (post.campaignState === "paused")
      iconHTML = `<i class="fa fa-pause-circle" style="color:#64748b;"></i>`;

    // Handle localized fallback for campaign steps
    const displayTitle =
      postTitle === "Campaign Step" ? I18n.t("campStep") : postTitle;
    titleEl.innerHTML = `${iconHTML} <span class="camp-upcoming-title">${displayTitle}</span>`;

    // FIX: Localized Badges
    badgeEl.className = "status-pill";
    if (post.campaignState === "waiting") {
      badgeEl.textContent = I18n.t("badgeWaiting");
      badgeEl.classList.add("pill-waiting");
    } else if (post.campaignState === "processing") {
      badgeEl.textContent = I18n.t("badgeProcessing"); // Reusing standard or add 'Running'
      badgeEl.classList.add("pill-running");
    } else if (post.campaignState === "paused") {
      badgeEl.textContent = I18n.t("badgePaused");
      badgeEl.classList.add("pill-paused");
    } else {
      badgeEl.textContent = I18n.t("badgeScheduled");
      badgeEl.classList.add("pill-scheduled");
    }

    detailsEl.innerHTML = I18n.t("campAuto");
    detailsEl.className = "text-muted small ml-2";
    groupsCountEl.style.display = "none";

    const actions = postElement.querySelector(".group-actions");
    if (actions) actions.style.display = "none";
  } else {
    // --- 2. STANDARD POST DESIGN ---
    card.className = "scheduled-post-item standard-item-clean";
    titleEl.textContent = postTitle;

    // FIX: Localized Frequency Badge
    const freqKey = `freq${
      post.frequency.charAt(0).toUpperCase() + post.frequency.slice(1)
    }`; // freqOnce, freqDaily...
    badgeEl.textContent = I18n.t(freqKey);
    badgeEl.className = "status-pill pill-standard";

    const totalLinks = post.groups
      ? post.groups.reduce((sum, g) => sum + (g.links ? g.links.length : 0), 0)
      : 0;
    // FIX: Localized Group Count
    const groupKey = totalLinks === 1 ? "sumGroups" : "countLinks"; // Reusing "countLinks" ($COUNT$ links)
    // Actually better to reuse countLinks from earlier: "$COUNT$ links"
    groupsCountEl.textContent = I18n.t("countLinks", [String(totalLinks)]);

    detailsEl.style.display = "none";

    const runNowBtn = postElement.querySelector(".btnRunNow");
    const editBtn = postElement.querySelector(".edit-schedule-btn");
    const deleteBtn = postElement.querySelector(".delete-schedule-btn");

    runNowBtn.dataset.postIndex = originalIndex;
    editBtn.dataset.postIndex = originalIndex;
    deleteBtn.dataset.postIndex = originalIndex;

    runNowBtn.addEventListener("click", function () {
      handleRunNowClick(parseInt(this.dataset.postIndex));
    });
    editBtn.addEventListener("click", function () {
      editScheduledPost(parseInt(this.dataset.postIndex));
    });
    deleteBtn.addEventListener("click", function () {
      deleteScheduledPost(parseInt(this.dataset.postIndex));
    });
  }

  return postElement;
}

// in popup.js
// ACTION: Replace handleRunNowClick function

async function handleRunNowClick(index) {
  const { scheduledPosts: currentPosts, licenseVerified } =
    await chrome.storage.local.get(["scheduledPosts", "licenseVerified"]);

  if (!currentPosts || !currentPosts[index]) {
    showCustomModal("Error", "Could not find the scheduled post.");
    return;
  }

  // --- LICENSE GATE ---
  // Scheduled posts are a Pro feature. Even manual "Run Now" of a scheduled item should be gated
  // if the user's license has expired, to prevent exploiting the scheduler.
  if (!licenseVerified) {
    showCustomModal(
      I18n.t("modalLicReq"),
      I18n.t("modalLicReqBody"),
      "alert",
      () => showActivationPage(),
      null,
      I18n.t("btnActivate"),
    );
    return;
  }
  // --------------------

  const postTitle = currentPosts[index].posts?.[0]?.title || "this post";

  showCustomModal(
    I18n.t("modalRunNowTitle"),
    I18n.t("modalRunNowBody", [postTitle]),
    "confirm",
    async () => {
      // onConfirm
      try {
        const now = new Date();
        const fiveSecondsAgo = new Date(now.getTime() - 5000);

        currentPosts[index].nextRunTime = fiveSecondsAgo.toISOString();
        currentPosts[index].status = "scheduled";

        await chrome.storage.local.set({ scheduledPosts: currentPosts });

        // Trigger the background check immediately
        chrome.runtime.sendMessage({ action: "runSchedulerCheck" });

        showCustomModal(I18n.t("statusSuccess"), I18n.t("modalSuccessQueue"));

        // Refresh UI
        displayScheduledPosts();
      } catch (error) {
        console.error("Error triggering Run Now:", error);
        showCustomModal("Error", "Failed to queue the post.");
      }
    },
    null, // onCancel
    I18n.t("btnPostNow"),
    I18n.t("btnCancel"),
  );
}

function formatStatusAndDate(post) {
  const now = new Date();
  const nextRun = post.nextRunTime ? new Date(post.nextRunTime) : null;
  const lastRun = post.lastRunTime ? new Date(post.lastRunTime) : null;

  if (post.status === "completed") {
    return `Completed ${
      lastRun ? "on " + formatDateTime(lastRun.toISOString()) : ""
    }`;
  } else if (post.status === "failed") {
    return `Failed ${
      lastRun ? "on " + formatDateTime(lastRun.toISOString()) : ""
    } ${post.lastError ? `(${post.lastError.substring(0, 30)}...)` : ""}`;
  } else if (post.status === "scheduled" && nextRun) {
    if (nextRun <= now) {
      return `Due now (Next: ${formatDateTime(nextRun.toISOString())})`;
    } else {
      return `Next: ${formatDateTime(nextRun.toISOString())}`;
    }
  } else {
    return "Status Unknown";
  }
}

// Get color for frequency badge
function getFrequencyColor(frequency) {
  switch (frequency) {
    case "once":
      return "secondary";
    case "daily":
      return "success";
    case "weekly":
      return "primary";
    case "monthly":
      return "warning";
    default:
      return "info";
  }
}

// Format date and time for display
function formatDateTime(dateTimeString) {
  const date = new Date(dateTimeString);
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return date.toLocaleString(undefined, options);
}

// Get detailed text description of schedule
function getScheduleDetailsText(post) {
  switch (post.frequency) {
    case "once":
      return "One-time post";

    case "daily":
      const time = formatTimeOnly(post.scheduleTime);
      return `Every day at ${time}`;

    case "weekly":
      const weekdays = post.weekdays
        .map((day) => {
          const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
          return days[day];
        })
        .join(", ");
      return `Every ${weekdays} at ${formatTimeOnly(post.scheduleTime)}`;

    case "monthly":
      const dayCount = post.monthDays.length;
      let daysText;

      if (dayCount <= 3) {
        // List all days
        daysText = post.monthDays.join(", ");
      } else {
        // Just show the count
        daysText = `${dayCount} days`;
      }

      return `${daysText} of each month at ${formatTimeOnly(
        post.scheduleTime,
      )}`;

    default:
      return "";
  }
}

// Format time only (no date)
function formatTimeOnly(timeString) {
  if (!timeString) return "";

  const [hours, minutes] = timeString.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;

  return `${hour12}:${minutes} ${ampm}`;
}

// Calculate progress percentage for recurring posts
function calculateProgress(post) {
  if (post.status === "completed" || post.frequency === "once") {
    return 100;
  }

  const lastRun = post.lastRunTime ? new Date(post.lastRunTime) : null;
  const nextRun = new Date(post.nextRunTime);
  const now = new Date();

  if (!lastRun) {
    // First run, no progress yet
    return 0;
  }

  // Calculate progress based on time elapsed since last run
  const totalInterval = nextRun.getTime() - lastRun.getTime();
  const elapsed = now.getTime() - lastRun.getTime();

  let progress = (elapsed / totalInterval) * 100;
  progress = Math.min(Math.max(progress, 0), 100); // Keep between 0-100

  return Math.round(progress);
}

function editScheduledPost(index) {
  const post = scheduledPosts[index];
  if (!post) {
    console.error("Could not find scheduled post to edit at index:", index);
    return;
  }

  console.log("Editing scheduled post:", post);
  editingScheduleIndex = index;

  // --- 1. DETERMINE TYPE (Quick vs Advanced) ---
  const isQuickPost =
    post.posts.length === 1 && post.posts[0].title === "Quick Post";

  // --- 2. UPDATE NAVIGATION VISUALS ---
  const mainPostBtn = document.getElementById("mainNavPostBtn");
  const subNavContainer = document.getElementById("postSubNavContainer");
  const allMainLinks = document.querySelectorAll(".main-nav-unified .nav-link");
  const track = document.getElementById("postSwitcherTrack");
  const schedulerBtn = document.getElementById("SchedulerBTN");
  const quickBtn = document.getElementById("quickPostBTN");

  // Reset top nav
  allMainLinks.forEach((btn) => btn.classList.remove("active"));
  if (mainPostBtn) mainPostBtn.classList.add("active");
  if (subNavContainer) subNavContainer.classList.remove("d-none");

  // Hide all pages first
  const pages = [
    "scheduledPostsPage",
    "quickPostPage",
    "TagsPage",
    "groupsPage",
    "productPage",
    "historyPage",
    "SchedulerPage",
  ];
  pages.forEach((id) => document.getElementById(id)?.classList.add("d-none"));

  // --- 3. BRANCHING LOGIC ---

  if (isQuickPost) {
    // === QUICK POST MODE ===
    window.isQuickPostSchedulingMode = true; // Set flag for save logic

    // Update Sub-Nav Visuals
    if (schedulerBtn) schedulerBtn.classList.remove("active");
    if (quickBtn) quickBtn.classList.add("active");
    if (track) track.removeAttribute("data-active"); // Slide to left

    // Show Page
    document.getElementById("quickPostPage").classList.remove("d-none");

    // Populate Data
    populateQuickPostForEditing(post);

    // Update Buttons
    const quickScheduleBtn = document.getElementById("quickScheduleButton");
    const quickPostBtn = document.getElementById("quickPostButton");

    if (quickScheduleBtn) {
      quickScheduleBtn.textContent =
        I18n.t("btnUpdateSched") || "Update Schedule";
      quickScheduleBtn.classList.remove("btn-visual-secondary");
      quickScheduleBtn.classList.add("btn-primary"); // Make it the primary action
      quickScheduleBtn.disabled = false;
    }

    // Hide "Post Now" button to prevent confusion
    if (quickPostBtn) quickPostBtn.classList.add("d-none");
  } else {
    // === ADVANCED SCHEDULER MODE ===
    window.isQuickPostSchedulingMode = false;

    // Update Sub-Nav Visuals
    if (quickBtn) quickBtn.classList.remove("active");
    if (schedulerBtn) schedulerBtn.classList.add("active");
    if (track) track.setAttribute("data-active", "scheduler"); // Slide to right

    // Show Page
    document.getElementById("SchedulerPage").classList.remove("d-none");

    // Populate Data
    populateSchedulerForEditing(post);

    // Update Buttons
    const startPostingWrapper = document.getElementById("startPostingWrapper");
    const startPostingBtn = document.getElementById("startPosting");
    const schedulePostButton = document.getElementById("schedulePostButton");
    const cancelEditBtn = document.getElementById("cancelEditScheduleBtn");

    // 1. Ensure wrapper is visible
    if (startPostingWrapper) startPostingWrapper.classList.remove("d-none");

    // 2. Hide "Post Now" button
    if (startPostingBtn) startPostingBtn.classList.add("d-none");

    // 3. Transform "Schedule" button to "Update"
    if (schedulePostButton) {
      schedulePostButton.textContent =
        I18n.t("btnUpdateSched") || "Update Schedule";
      schedulePostButton.classList.remove("btn-secondary");
      schedulePostButton.classList.add("btn-primary"); // Make it the primary action
      schedulePostButton.disabled = false;
    }

    // 4. Show "Cancel Edit" button
    if (cancelEditBtn) cancelEditBtn.classList.remove("d-none");
  }
}

function populateQuickPostForEditing(post) {
  // 1. Restore Content (Quill)
  const postData = post.posts[0];
  if (quickPostQuill) {
    // Reset first
    quickPostQuill.setContents([]);
    // Insert HTML safely
    quickPostQuill.root.innerHTML = postData.text || "";
  }

  // 2. Restore Media
  quickMedia = postData.images || [];
  updateQuickMediaDisplay();

  // 3. Restore Groups
  // We need to map the saved group data back to the UI selection structure
  quickSelectedGroups = [];
  const quickGroupsContainer = document.getElementById(
    "quickSelectedGroupsContainer",
  );
  if (quickGroupsContainer) quickGroupsContainer.innerHTML = "";

  if (post.groups && Array.isArray(post.groups)) {
    post.groups.forEach((groupData) => {
      // Try to find the original index in the global 'groups' array by title
      const originalIndex = groups.findIndex(
        (g) => g.title === groupData.title,
      );

      // We push to the selection array.
      // If originalIndex is -1 (group deleted from main list), we keep it as a detached object.
      quickSelectedGroups.push({
        index: originalIndex,
        group: groupData,
      });

      // Visually add the pill
      addQuickSelectedGroupVisual(groupData, originalIndex);
    });
  }

  // 4. Restore Settings
  const s = post.settings || {};
  document.getElementById("quickLinkCount").value = s.linkCount || 1;
  document.getElementById("quickEnterTime").value = (s.timeDelay || 120) / 60; // Sec to Min
  document.getElementById("quickNightPost").checked =
    s.avoidNightPosting || false;
  document.getElementById("quickDelayFail").checked =
    s.delayAfterFailure || false;
  document.getElementById("quickPostAnonymously").checked =
    s.postAnonymously || false;

  const secSlider = document.getElementById("quickSecuritySlider");
  if (secSlider) {
    secSlider.value = s.securityLevel || "2";
    // Trigger input event to update label text
    secSlider.dispatchEvent(new Event("input"));
  }

  // AI Settings
  const aiCheck = document.getElementById("quickGenerateAiVariations");
  if (aiCheck) {
    aiCheck.checked = s.generateAiVariations || false;
    // Trigger change to show/hide options
    aiCheck.dispatchEvent(new Event("change"));
  }
  document.getElementById("quickAiVariationCount").value =
    s.aiVariationCount || 2;

  // 5. Re-validate buttons
  updateQuickPostButton();
}

// Helper to add visual pills without logic duplication
function addQuickSelectedGroupVisual(groupData, index) {
  const container = document.getElementById("quickSelectedGroupsContainer");
  const groupItem = document.createElement("div");
  groupItem.className = "tag-item";
  groupItem.innerText = groupData.title;

  const removeTag = document.createElement("span");
  removeTag.className = "remove-tag";
  removeTag.innerHTML = "×";

  removeTag.addEventListener("click", () => {
    // Remove from array
    quickSelectedGroups = quickSelectedGroups.filter(
      (g) => g.group.title !== groupData.title,
    );
    groupItem.remove();
    updateQuickPostButton();

    // Unhighlight in dropdown if it exists
    if (index !== -1) {
      const optionDiv = document
        .getElementById("quickSelectGroupOptions")
        ?.querySelector(`[data-index="${index}"]`);
      if (optionDiv) optionDiv.style.backgroundColor = "";
    }
  });

  groupItem.appendChild(removeTag);
  container.appendChild(groupItem);
}

function deleteScheduledPost(index) {
  // MODIFICATION: Use custom modal for confirmation
  showCustomModal(
    I18n.t("modalConfirmDel"),
    I18n.t("modalConfirmDelBody"),
    "confirm",
    () => {
      // onConfirm
      if (editingScheduleIndex === index) {
        editingScheduleIndex = null;
      }
      if (typeof $ !== "undefined") {
        $("#scheduleModal").modal("hide");
      } else {
        const scheduleModal = document.getElementById("scheduleModal");
        if (scheduleModal) {
          scheduleModal.style.display = "none";
          scheduleModal.classList.remove("show");
        }
      }

      // --- NEW CLEANUP LOGIC ---
      // We need to fetch notifications to clean them up, but 'scheduledPosts' is global.
      // We'll modify the global array first, then save everything.

      const postToDelete = scheduledPosts[index];
      scheduledPosts.splice(index, 1);

      chrome.storage.local.get("missedRecurringNotifications", (result) => {
        let notifications = result.missedRecurringNotifications || [];

        if (postToDelete) {
          // Remove notifications associated with this post ID
          notifications = notifications.filter(
            (n) => n.postId !== postToDelete.id,
          );
        }

        // Save updated posts AND updated notifications
        chrome.storage.local.set(
          {
            scheduledPosts: scheduledPosts,
            missedRecurringNotifications: notifications,
          },
          function () {
            if (chrome.runtime.lastError) {
              console.error("Error saving updates:", chrome.runtime.lastError);
            } else {
              console.log("Scheduled post and notifications deleted.");
              displayScheduledPosts();
              updateNextScheduledPostDisplay();
              showCustomModal(I18n.t("modalDeleted"), I18n.t("modalDeleted"));
            }
          },
        );
      });
    },
    null, // onCancel
    "Delete",
    "Cancel",
  );
}
// Function to close the schedule modal
function closeScheduleModal() {
  // Use jQuery if available
  if (typeof $ !== "undefined") {
    $("#scheduleModal").modal("hide");
  } else {
    // Fallback for when jQuery is not available
    scheduleModal.style.display = "none";
    scheduleModal.classList.remove("show");

    // Remove modal backdrop if it exists
    const backdrop = document.querySelector(".modal-backdrop");
    if (backdrop) {
      backdrop.parentNode.removeChild(backdrop);
    }

    // Remove modal-open class from body
    document.body.classList.remove("modal-open");
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
  }

  // Reset form
  resetScheduleForm();
} // Scheduling variables

function updateNextScheduledPostDisplay() {
  const scheduledPostsBtn = document.getElementById("scheduledPostsBtn");
  const countdownContainer = document.getElementById("next-post-countdown");
  const allPosts = typeof scheduledPosts !== "undefined" ? scheduledPosts : [];
  const now = new Date();

  const upcomingPosts = allPosts
    .filter((post) => {
      if (
        post.status === "paused" ||
        post.status === "completed" ||
        post.status === "failed"
      )
        return false;
      if (!post.nextRunTime) return false;
      const d = new Date(post.nextRunTime);
      if (isNaN(d.getTime())) return false;
      return true;
    })
    .sort(
      (a, b) =>
        new Date(a.nextRunTime).getTime() - new Date(b.nextRunTime).getTime(),
    );

  // Update tab button text (Localized in previous step, ensuring consistency here)
  const tabText = I18n.t("navUpcoming");
  if (upcomingPosts.length > 0) {
    if (scheduledPostsBtn) {
      scheduledPostsBtn.textContent = tabText;
      scheduledPostsBtn.classList.add("has-upcoming");
    }
  } else {
    if (scheduledPostsBtn) {
      scheduledPostsBtn.textContent = tabText;
      scheduledPostsBtn.classList.remove("has-upcoming");
    }
  }

  if (countdownContainer) {
    if (upcomingPosts.length > 0) {
      const nextPost = upcomingPosts[0];
      const nextRunTime = new Date(nextPost.nextRunTime);
      const timeUntil = nextRunTime - now;

      let countdownText = "";
      let alertClass = "status-info";

      if (timeUntil <= 0) {
        countdownText = I18n.t("dueNow");
        alertClass = "status-warning";
      } else {
        const minutes = Math.floor(timeUntil / (1000 * 60));
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        // FIX: Localized Countdown
        if (days > 0) {
          countdownText = I18n.t("timeInDays", [String(days)]);
        } else if (hours > 0) {
          countdownText = I18n.t("timeInHours", [
            String(hours),
            String(minutes % 60),
          ]);
          if (hours < 2) alertClass = "status-warning";
        } else if (minutes > 0) {
          countdownText = I18n.t("timeInMins", [String(minutes)]);
          alertClass = "status-warning";
        } else {
          countdownText = I18n.t("timeSoon");
          alertClass = "status-danger";
        }
      }

      let postTitle = "Untitled Post";
      if (nextPost.isCampaign) {
        postTitle = nextPost.posts?.[0]?.title || I18n.t("campStep");
      } else {
        postTitle =
          nextPost.posts?.[0]?.title ||
          nextPost.product?.title ||
          "Untitled Post";
      }

      const formattedTime = nextRunTime.toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      // FIX: Localized "Next Action" Label
      countdownContainer.innerHTML = `
        <div class="next-post-widget ${alertClass}">
            <div class="next-post-info">
                <span class="next-post-label"><i class="fa fa-clock-o"></i> ${I18n.t(
                  "nextAction",
                )}</span>
                <span class="next-post-title" title="${postTitle}">${postTitle}</span>
            </div>
            <div class="next-post-timer-badge">
                <span class="countdown-timer">${countdownText}</span>
                <span class="next-post-time">${formattedTime}</span>
            </div>
        </div>
      `;
      countdownContainer.classList.remove("d-none");
    } else {
      countdownContainer.classList.add("d-none");
      countdownContainer.innerHTML = "";
    }
  }
}

function resetFrequencyButtonStyles() {
  document.querySelectorAll(".frequency-btn-group label.btn").forEach((btn) => {
    btn.classList.remove("active");
    btn.style.backgroundColor = "";
    btn.style.color = "";
  });
}

// Initialize frequency buttons to match the rest of the UI
function initializeFrequencyButtons() {
  // First, make sure the default selection is set
  const initialFrequency = document.querySelector(
    'input[name="scheduleFrequency"]:checked',
  );
  if (initialFrequency) {
    // Reset all button styles
    resetFrequencyButtonStyles();

    // Set active style on the initially selected button
    initialFrequency.parentElement.classList.add("active");
    initialFrequency.parentElement.style.backgroundColor = "#343a40";
    initialFrequency.parentElement.style.color = "white";

    // Make sure the appropriate options are visible
    updateScheduleOptionsVisibility(initialFrequency.value);
  }
}

// Initialize preview functionality after DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  // Add preview buttons to relevant sections
  addPreviewButtons();
  chrome.storage.local.get(["postingHistory"], function (result) {
    postingHistory = result.postingHistory || [];
  });

  const quickInsertMediaButton = document.getElementById(
    "quickInsertMediaButton",
  );

  if (quickInsertMediaButton) {
    // Add mouseover event listener
    quickInsertMediaButton.addEventListener("mouseover", function () {
      this.style.borderColor = "#4f46e5";
      this.style.color = "#4f46e5";
    });

    // Add mouseout event listener
    quickInsertMediaButton.addEventListener("mouseout", function () {
      this.style.borderColor = "#d1d5db";
      this.style.color = "#6b7280";
    });
  }

  const insertImageButton2 = document.getElementById("insertImageButton");

  if (insertImageButton2) {
    // Add mouseover event listener
    insertImageButton2.addEventListener("mouseover", function () {
      this.style.borderColor = "#4f46e5";
      this.style.color = "#4f46e5";
    });

    // Add mouseout event listener
    insertImageButton2.addEventListener("mouseout", function () {
      this.style.borderColor = "#d1d5db";
      this.style.color = "#6b7280";
    });
  }
});

// Function to add preview buttons to relevant sections
function addPreviewButtons() {
  // For regular post templates
  const saveTagButton = document.getElementById("saveTag");
  if (saveTagButton) {
    const previewButton = document.createElement("button");
    previewButton.type = "button";
    previewButton.id = "previewPostButton";
    previewButton.className = "btn-visual-secondary";
    previewButton.innerHTML = '<i class="fa fa-eye"></i>';
    saveTagButton.parentNode.insertBefore(previewButton, saveTagButton);

    previewButton.addEventListener("click", previewRegularPost);
  }

  const quickPreviewBtnFooter = document.getElementById(
    "quickPreviewButtonFooter",
  );
  if (quickPreviewBtnFooter) {
    // Remove old listener to be safe (if function called multiple times)
    quickPreviewBtnFooter.removeEventListener("click", previewQuickPost);
    quickPreviewBtnFooter.addEventListener("click", previewQuickPost);
  }

  // For scheduled posts
  const startPostingBtn = document.getElementById("cancelEditScheduleBtn");
  if (startPostingBtn) {
    const schedulePreviewButton = document.createElement("button");
    schedulePreviewButton.type = "button";
    schedulePreviewButton.id = "schedulePreviewButton";
    schedulePreviewButton.className = "btn-visual-secondary mb-2";
    schedulePreviewButton.innerHTML = '<i class="fa fa-eye"></i>';
    schedulePreviewButton.style.width = "-webkit-fill-available";
    schedulePreviewButton.disabled = true;
    // Insert before the Start Posting button
    startPostingBtn.parentNode.insertBefore(
      schedulePreviewButton,
      startPostingBtn,
    );

    schedulePreviewButton.addEventListener("click", previewScheduledPost);
  }
}

function spinText(text) {
  if (!text) return text;
  const regex = /\{([^{}]+)\}/;
  while (regex.test(text)) {
    text = text.replace(regex, (match, group) => {
      const options = group.split("|");
      // CHECK THIS: Is Math.random() working?
      const selectedOption =
        options[Math.floor(Math.random() * options.length)].trim();
      return spinText(selectedOption);
    });
  }
  return text;
}

function processHtmlWithSpintax(htmlContent) {
  if (!htmlContent) return "";
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = htmlContent;
  const textNodes = getTextNodes(tempDiv);
  textNodes.forEach((node) => {
    if (
      node.nodeType === Node.TEXT_NODE &&
      node.textContent.includes("{") &&
      node.textContent.includes("}")
    ) {
      node.textContent = spinText(node.textContent);
    }
  });
  return tempDiv.innerHTML;
}

// Helper function to get all text nodes in an element
function getTextNodes(node) {
  let textNodes = [];

  if (node.nodeType === Node.TEXT_NODE) {
    textNodes.push(node);
  } else {
    const children = node.childNodes;
    for (let i = 0; i < children.length; i++) {
      textNodes = textNodes.concat(getTextNodes(children[i]));
    }
  }

  return textNodes;
}

// in popup.js
// ACTION: Replace previewRegularPost

function previewRegularPost() {
  try {
    // 1. Get RAW content from editor
    const rawPostContent = quill ? quill.root.innerHTML : "";

    const rawPostTitle =
      document.getElementById("postTitle").value || "Untitled Post";
    const processedTitle = spinText(rawPostTitle);
    const selectedColor = window.selectedColor || "#18191A";

    // 2. Prepare Variations (Handle A/B/C logic from memory)
    // We need to check if we have multiple tabs active in memory
    const validVariations = [];
    ["A", "B", "C", "D"].forEach((key) => {
      const html = currentTemplateVariations[key].html;
      if (html && html.trim() !== "" && html !== "<p><br></p>") {
        validVariations.push(html);
      }
    });

    // If current editor has content but hasn't been synced to 'validVariations' (e.g. Tab A), use it.
    // Actually, simple logic: If we have stored variations, use them.
    // If not (e.g. just typing in A), use the current editor content as the single variation.

    let variationsToUse =
      validVariations.length > 0 ? validVariations : [rawPostContent];

    // Edge case: If user is editing Tab B, but A is stored in memory, we want to preview ALL of them?
    // OR just the current one?
    // Better UX: Preview ALL variations so they can switch between them.
    // Ensure we sync current editor state first.
    syncEditorToState(); // Ensure current typing is saved to state

    const allVars = [];
    ["A", "B", "C", "D"].forEach((key) => {
      const html = currentTemplateVariations[key].html;
      if (html && html.trim() !== "" && html !== "<p><br></p>") {
        allVars.push(html);
      }
    });

    if (allVars.length === 0) allVars.push(rawPostContent);

    // 3. Show Modal
    showPreviewModal({
      title: processedTitle,

      // Pass RAW first variation for initial render (Modal handles processing)
      content: allVars[0],

      images: images || [],
      color: selectedColor,

      // Pass RAW array for re-spinning/switching
      rawVariations: allVars,
      currentVariationIndex: 0,
    });
  } catch (error) {
    console.error("Error generating post preview:", error);
    showCustomModal(
      "Preview Error",
      "There was an error generating the preview.",
    );
  }
}

// in popup.js
// ACTION: Replace previewQuickPost

function previewQuickPost() {
  try {
    if (!quickPostQuill)
      throw new Error("Quick Post editor is not initialized.");

    // 1. Get RAW HTML (with {A|B} intact)
    const rawPostContent = quickPostQuill.root.innerHTML;

    // 2. Parse it to see if it's a wrapper {A|B|C} or just content with spintax
    // For Quick Post, we usually treat it as a single variation that *contains* spintax
    // unless the user explicitly used the wrapper format.

    let variations = [rawPostContent];

    // Optional: If you want Quick Post to support A/B/C wrapper detection:
    const isWrapped =
      rawPostContent.trim().startsWith("{") &&
      rawPostContent.trim().endsWith("}") &&
      rawPostContent.includes("|");
    if (isWrapped) {
      const inner = rawPostContent.trim().slice(1, -1);
      variations = parseSpintaxString(inner);
    }

    const title = "Quick Post";

    // 3. Pass RAW variations to the modal
    showPreviewModal({
      title: title,
      content: variations[0], // Initial view
      images: quickMedia || [],
      color: "#18191A",

      rawVariations: variations, // THIS IS KEY: Must contain the {spintax} strings
      currentVariationIndex: 0,
    });
  } catch (error) {
    console.error("Error generating quick post preview:", error);
    showCustomModal(
      "Preview Error",
      "There was an error generating the preview.",
    );
  }
}

// in popup.js
// ACTION: Replace the previewScheduledPost function

function previewScheduledPost() {
  try {
    // Check if we have selected posts
    if (selectedPosts.length === 0) {
      showCustomModal(
        "Selection Required",
        "Please select at least one post template to preview.",
      );
      return;
    }

    let currentIndex = 0;

    function previewNextPost() {
      if (currentIndex < selectedPosts.length) {
        const postData = selectedPosts[currentIndex].post;
        const rawText = postData.text || "";

        // --- NEW LOGIC: Parse Variations ---
        let variations = [];
        // Check for the {A|B|C} wrapper format
        const isWrapped =
          rawText.trim().startsWith("{") &&
          rawText.trim().endsWith("}") &&
          rawText.includes("|");

        if (isWrapped) {
          // Strip outer brackets and use robust parser
          const innerContent = rawText.trim().slice(1, -1);
          variations = parseSpintaxString(innerContent);
        } else {
          variations = [rawText];
        }

        // Filter empty
        variations = variations.filter((v) => v && v.trim().length > 0);
        if (variations.length === 0) variations = [""];

        // Generate initial content from the first variation
        const initialContent = processHtmlWithSpintax(variations[0]);
        const processedTitle = spinText(postData.title || "Untitled Post");

        showPreviewModal({
          title: processedTitle,
          content: initialContent,
          images: postData.images || [],
          color: postData.color || "#18191A",

          // Pass the parsed variations to enable the "Next Var" button
          rawVariations: variations,
          currentVariationIndex: 0,

          // Navigation for multiple *different* posts (Scheduler specific)
          multipleMode: selectedPosts.length > 1,
          currentIndex: currentIndex + 1,
          totalPosts: selectedPosts.length,
          onNext: function () {
            currentIndex++;
            previewNextPost();
          },
          onPrevious: function () {
            if (currentIndex > 0) {
              currentIndex--;
              previewNextPost();
            }
          },
        });
      }
    }

    previewNextPost();
  } catch (error) {
    console.error("Error generating scheduled post preview:", error);
    showCustomModal(
      "Preview Error",
      "There was an error generating the preview. Please try again.",
    );
  }
}

// Helper function to convert plain text to HTML with paragraphs
function convertPlainTextToHTML(text) {
  if (!text) return "";

  // Split by newlines and create paragraphs
  const paragraphs = text.split(/\n\s*\n/);
  return paragraphs.map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`).join("");
}

// --- START: New HTML Cleanup Helper ---
function cleanQuillHtmlForPreview(html) {
  if (!html) return "";

  // 1. Replace empty paragraphs, which often cause extra space, with a single <br>.
  // This helps handle cases where a user just hits Enter multiple times.
  let cleanedHtml = html.replace(/<p><br><\/p>/g, "<br>");

  // 2. Normalize multiple <br> tags. This is the key step.
  // It finds two or more <br> tags (with optional whitespace between them)
  // and replaces the entire block with just two <br> tags.
  cleanedHtml = cleanedHtml.replace(/(<br\s*\/?>\s*){2,}/g, "<br><br>");

  // 3. Wrap content that isn't already in a block-level tag (<p>, <h1>, etc.)
  // This ensures consistent spacing for text that might be at the top level.
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = cleanedHtml;
  const newChildren = [];
  tempDiv.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== "") {
      const p = document.createElement("p");
      p.textContent = node.textContent;
      newChildren.push(p.outerHTML);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      newChildren.push(node.outerHTML);
    }
  });

  return newChildren.join("");
}
// in popup.js
// in popup.js
// ACTION: Replace the showPreviewModal function

function showPreviewModal(options) {
  createPreviewModal();

  const previewModal = document.getElementById("postPreviewModal");
  const previewHeader = document.getElementById("previewHeader");
  const previewContent = document.getElementById("previewContent");
  const previewFooter = previewModal.querySelector(".post-preview-footer"); // Target footer directly

  // --- STATE TRACKING ---
  let currentVarIndex = options.currentVariationIndex || 0;
  const rawVars = options.rawVariations || [options.content];
  const hasMultipleVariations = rawVars.length > 1;

  // --- RENDER HEADER (Simple Title Only) ---
  previewHeader.innerHTML = `
    <h4 style="margin:0; flex-grow:1;">${options.title}</h4>
    <button type="button" id="closePreviewModal" class="close-preview-modal">×</button>
  `;
  document
    .getElementById("closePreviewModal")
    .addEventListener("click", closePreviewModal);

  // --- RENDER CONTENT HELPER ---
  const renderCurrentState = () => {
    const rawHtml = rawVars[currentVarIndex];
    const finalHtml = processHtmlWithSpintax(rawHtml);
    const cleanedContent = cleanQuillHtmlForPreview(finalHtml);
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = finalHtml;
    const charCount = (tempDiv.textContent || "").trim().length;
    const hasValidImages = options.images && options.images.length > 0;
    const applyBackground =
      options.color &&
      options.color.toLowerCase() !== "#18191a" &&
      charCount > 0 &&
      charCount <= 130 &&
      !hasValidImages;

    let previewHTML = `
      <div class="fb-post-preview">
        <div class="fb-post-header">
          <div class="fb-post-user">
            <div class="fb-post-avatar"></div>
            <div class="fb-post-user-info">
              <div class="fb-post-username">Your Name</div>
              <div class="fb-post-time">Just now · <i class="fa fa-globe"></i></div>
            </div>
          </div>
          <div class="fb-post-actions"><i class="fa fa-ellipsis-h"></i></div>
        </div>`;

    if (applyBackground) {
      const isLightColor = options.color.toLowerCase() === "#f6c7c6";
      const textColor = isLightColor
        ? darkenColor(options.color, 40)
        : "#FFFFFF";
      previewHTML += `
        <div class="fb-post-content-wrapper">
          <div class="fb-post-colored-content" style="background-color: ${options.color};">
            <div class="colored-text-wrapper" style="color: ${textColor};">${cleanedContent}</div>
          </div>
        </div>`;
    } else {
      previewHTML += `<div class="fb-post-content">${cleanedContent}</div>`;
    }

    if (!applyBackground && hasValidImages) {
      if (options.images.length === 1) {
        const media = options.images[0];
        previewHTML += `<div class="fb-post-media">${
          media.type === "video"
            ? `<video src="${media.data}" controls class="fb-post-video"></video>`
            : `<img src="${media.data}" class="fb-post-image">`
        }</div>`;
      } else {
        previewHTML += `<div class="fb-post-media-grid fb-post-media-grid-${Math.min(
          options.images.length,
          4,
        )}">
            ${options.images
              .slice(0, 4)
              .map(
                (m) =>
                  `<div class="fb-post-media-item"><img src="${m.data}"></div>`,
              )
              .join("")}
          </div>`;
      }
    }

    previewHTML += `
        <div class="fb-post-footer">
          <div class="fb-post-reactions">
            <div class="fb-post-reaction-item"><i class="fa fa-thumbs-up"></i> Like</div>
            <div class="fb-post-reaction-item"><i class="fa fa-comment"></i> Comment</div>
            <div class="fb-post-reaction-item"><i class="fa fa-share"></i> Share</div>
          </div>
        </div>
      </div>`;

    previewContent.innerHTML = previewHTML;
  };

  // --- RENDER FOOTER CONTROLS ---
  // We completely rebuild the footer HTML to include our controls above the Close button

  let footerControlsHtml = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; background:#f1f5f9; padding:8px 12px; border-radius:8px;">
      
      ${
        hasMultipleVariations
          ? `
      <div style="display:flex; align-items:center; gap:8px;">
        <span class="badge badge-light" id="varBadge" style="font-size:11px; border:1px solid #e2e8f0; background:white;">${I18n.t(
          "prevVar",
        )} ${currentVarIndex + 1}/${rawVars.length}</span>
        <button id="shuffleVarBtn" class="btn-visual-secondary" style="padding: 4px 10px; font-size: 11px;">
          <i class="fa fa-random"></i> ${I18n.t("prevNextVar")}
        </button>
      </div>
      `
          : `<span style="font-size:11px; color:#64748b;">${I18n.t(
              "sumContent",
            )}</span>`
      }

      <button id="shuffleSpinBtn" class="btn-visual-secondary" style="padding: 4px 10px; font-size: 11px;">
        <i class="fa fa-refresh"></i> ${I18n.t("prevReSpin")}
      </button>
    </div>

    <div class="preview-disclaimer">
      <i class="fa fa-info-circle"></i> ${I18n.t("prevDisclaimer")}
    </div>
    <button type="button" id="closePreviewButton" class="btn-visual-secondary" style="width:100%;">${I18n.t(
      "prevClose",
    )}</button>
  `;

  previewFooter.innerHTML = footerControlsHtml;

  // Re-attach Footer Listeners
  document
    .getElementById("closePreviewButton")
    .addEventListener("click", closePreviewModal);

  const shuffleVarBtn = document.getElementById("shuffleVarBtn");
  if (shuffleVarBtn) {
    shuffleVarBtn.addEventListener("click", () => {
      currentVarIndex = (currentVarIndex + 1) % rawVars.length;
      const badge = document.getElementById("varBadge");
      if (badge)
        badge.textContent = `Var ${currentVarIndex + 1}/${rawVars.length}`;
      renderCurrentState();
    });
  }

  const shuffleSpinBtn = document.getElementById("shuffleSpinBtn");
  if (shuffleSpinBtn) {
    shuffleSpinBtn.addEventListener("click", () => {
      renderCurrentState();
    });
  }

  // Initial Render & Show
  renderCurrentState();
  previewModal.classList.add("show");
}

// Helper function to create the preview modal if it doesn't exist
function createPreviewModal() {
  // Check if the modal already exists
  if (document.getElementById("postPreviewModal")) {
    return;
  }

  // Create the modal structure
  const modalHTML = `
    <div id="postPreviewModal" class="post-preview-modal">
      <div class="post-preview-overlay"></div>
      <div class="post-preview-container">
        <div id="previewHeader" class="post-preview-header">
          <h4>Post Preview</h4>
          <button type="button" id="closePreviewModal" class="close-preview-modal">×</button>
        </div>
        <div id="previewContent" class="post-preview-content"></div>
        <div id="previewNavigation" class="post-preview-navigation d-none"></div>
        <div class="post-preview-footer">
          <div class="preview-disclaimer">
            <i class="fa fa-info-circle"></i> This is a preview of how your post may appear on Facebook. Actual appearance may vary.
          </div>
          <button type="button" id="closePreviewButton" class="btn-visual-secondary">Close Preview</button>
        </div>
      </div>
    </div>
  `;

  // Append the modal to the body
  const modalContainer = document.createElement("div");
  modalContainer.innerHTML = modalHTML;
  document.body.appendChild(modalContainer.firstElementChild);

  // Add event listeners
  document
    .getElementById("closePreviewModal")
    .addEventListener("click", closePreviewModal);
  document
    .getElementById("closePreviewButton")
    .addEventListener("click", closePreviewModal);
  document
    .querySelector(".post-preview-overlay")
    .addEventListener("click", closePreviewModal);
}

// Function to close the preview modal
function closePreviewModal() {
  const previewModal = document.getElementById("postPreviewModal");
  if (previewModal) {
    previewModal.classList.remove("show");
  }
}

function showGroupImportModal() {
  // Create modal structure if it doesn't exist
  if (!document.getElementById("groupImportModal")) {
    const modalHTML = ` <div id="groupImportModal" class="modal fade" tabindex="-1" role="dialog" style="background-color: rgba(0, 0, 0, 0.4); padding: 20px">
        <div class="modal-dialog modal-dialog-centered" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">${I18n.t("impTitle")}</h5>
              <button type="button" class="close" id="closeGroupImportModal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <select class="form-control mt-2" id="groupCollectionSelect" size="5" style="height: 120px;">
               
                </select>
              </div>
              
              <div class="form-group mt-3">
                <label for="groupItemSearch">${I18n.t("impPhSearch")}</label>
                <div class="input-group">
                  <input type="text" class="form-control" id="groupItemSearch" placeholder="${I18n.t(
                    "impPhSearch",
                  )}">
                  <div class="input-group-append">
                    <button class="btn-visual-secondary ml-2" type="button" id="clearLinkSearch">
                      <i class="fa fa-times"></i>
                    </button>
                  </div>
                </div>
              </div>
              
              <div class="form-group mt-3">
                <label>${I18n.t("impLblAvail")}</label>
                <div class="card" style="max-height: 300px; overflow-y: auto;">
                  <ul class="list-group list-group-flush" id="availableLinksContainer">
                    <li class="list-group-item text-center text-muted">${I18n.t(
                      "impSelFirst",
                    )}</li>
                  </ul>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn-visual-secondary" id="cancelGroupImport">${I18n.t(
                "btnCancel",
              )}</button>
              <button type="button" class="btn btn-primary" id="importSelectedLinks">${I18n.t(
                "impBtnImport",
              )}</button>
            </div>
          </div>
        </div>
      </div> `;

    const modalContainer = document.createElement("div");
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer.firstElementChild);

    // Add event listeners for the modal
    document
      .getElementById("closeGroupImportModal")
      .addEventListener("click", closeGroupImportModal);
    document
      .getElementById("cancelGroupImport")
      .addEventListener("click", closeGroupImportModal);
    document
      .getElementById("importSelectedLinks")
      .addEventListener("click", importSelectedLinks);
    document
      .getElementById("groupCollectionSelect")
      .addEventListener("change", loadGroupCollectionLinks);

    document
      .getElementById("groupItemSearch")
      .addEventListener("input", filterGroupLinks);

    document
      .getElementById("clearLinkSearch")
      .addEventListener("click", clearLinkSearch);
  }

  // Show the modal
  const importModal = document.getElementById("groupImportModal");

  // Load available group collections
  loadGroupCollections();

  // Show modal with jQuery if available
  if (typeof $ !== "undefined") {
    $("#groupImportModal").modal("show");
  } else {
    // Fallback for when jQuery is not available
    importModal.style.display = "block";
    importModal.classList.add("show");
  }
}

// Function to close the import modal
function closeGroupImportModal() {
  const importModal = document.getElementById("groupImportModal");

  // Close with jQuery if available
  if (typeof $ !== "undefined") {
    $("#groupImportModal").modal("hide");
  } else {
    // Fallback for when jQuery is not available
    importModal.style.display = "none";
    importModal.classList.remove("show");
  }

  // Clear selections
  document.getElementById("groupCollectionSelect").selectedIndex = 0;
  document.getElementById("groupItemSearch").value = "";
  document.getElementById("availableLinksContainer").innerHTML =
    '<li class="list-group-item text-center text-muted">Select a group collection first</li>';
}

// Function to load group collections into the select dropdown
function loadGroupCollections() {
  chrome.storage.local.get(["groups"], (result) => {
    const groupSelect = document.getElementById("groupCollectionSelect");

    // Clear previous options (except the placeholder)
    groupSelect.innerHTML =
      '<option value="" disabled selected>Select a group collection</option>';

    // Add options for each group collection
    const groups = result.groups || [];

    if (groups.length === 0) {
      const option = document.createElement("option");
      option.value = "";
      option.disabled = true;
      option.textContent = "No group collections available";
      groupSelect.appendChild(option);
    } else {
      groups.forEach((group, index) => {
        // Skip the current group being edited if we're in edit mode
        if (edit !== null && index === edit) return;

        const option = document.createElement("option");
        option.value = index;
        option.textContent = group.title || `Group ${index + 1}`;
        option.dataset.linkCount = group.links ? group.links.length : 0;
        groupSelect.appendChild(option);
      });
    }
  });
}

// Function to load links from selected group collection
function loadGroupCollectionLinks() {
  const selectedIndex = document.getElementById("groupCollectionSelect").value;
  const linksContainer = document.getElementById("availableLinksContainer");

  if (!selectedIndex) {
    linksContainer.innerHTML =
      '<li class="list-group-item text-center text-muted">Select a group collection first</li>';
    return;
  }

  chrome.storage.local.get(["groups"], (result) => {
    const groups = result.groups || [];
    const selectedGroup = groups[selectedIndex];

    if (
      !selectedGroup ||
      !selectedGroup.links ||
      selectedGroup.links.length === 0
    ) {
      linksContainer.innerHTML = `<li class="list-group-item text-center text-muted">${I18n.t(
        "impNoLinks",
      )}</li>`;

      return;
    }

    // Clear previous links
    linksContainer.innerHTML = "";

    // Add checkbox for each link
    selectedGroup.links.forEach((linkItem, linkIndex) => {
      const linkTitle = linkItem[0] || "";
      const linkURL = linkItem[1] || "";

      const listItem = document.createElement("li");
      listItem.className =
        "list-group-item group-link-item list-group-item-styled";

      listItem.innerHTML = `
        <div class="form-check">
          <input type="checkbox" class="form-check-input link-checkbox" id="link-${linkIndex}" data-index="${linkIndex}">
          <label class="form-check-label" for="link-${linkIndex}">
            <strong>${linkTitle}</strong><br>
            <small class="text-muted">${linkURL}</small>
          </label>
        </div>
      `;

      linksContainer.appendChild(listItem);
    });

    // Add select all checkbox
    const selectAllItem = document.createElement("li");
    selectAllItem.className = "list-group-item bg-light";
    selectAllItem.innerHTML = `
      <div class="form-check">
        <input type="checkbox" class="form-check-input" id="selectAllLinks">
        <label class="form-check-label" for="selectAllLinks">
          <strong>${I18n.t("impSelAll")}</strong>
        </label>
      </div>
    `;

    // Insert at the beginning
    linksContainer.insertBefore(selectAllItem, linksContainer.firstChild);

    // Add event listener for select all
    const selectAllCheckbox = document.getElementById("selectAllLinks");
    if (selectAllCheckbox) {
      selectAllCheckbox.addEventListener("change", handleSelectAllLinks);
    }
  });
}

// Add this new function to popup.js

function handleSelectAllLinks() {
  const selectAllCheckbox = document.getElementById("selectAllLinks");
  const linksContainer = document.getElementById("availableLinksContainer");
  if (!selectAllCheckbox || !linksContainer) return;

  const isChecked = selectAllCheckbox.checked;

  // Get all link checkboxes within the container
  const allCheckboxes = linksContainer.querySelectorAll(".link-checkbox");

  allCheckboxes.forEach((checkbox) => {
    // Find the parent list item (li) to check if it's visible
    const parentListItem = checkbox.closest(".group-link-item");

    // If the parent list item is currently visible (i.e., not hidden by the filter)
    // then set its checkbox state to match the "Select All" checkbox.
    if (parentListItem && parentListItem.style.display !== "none") {
      checkbox.checked = isChecked;
    }
  });
}

// Function to import selected links
function importSelectedLinks() {
  const selectedIndex = document.getElementById("groupCollectionSelect").value;
  const selectedCheckboxes = document.querySelectorAll(
    ".link-checkbox:checked",
  );

  if (!selectedIndex || selectedCheckboxes.length === 0) {
    alert("Please select a group collection and at least one link to import.");
    return;
  }

  chrome.storage.local.get(["groups"], (result) => {
    const groups = result.groups || [];
    const selectedGroup = groups[selectedIndex];

    if (!selectedGroup || !selectedGroup.links) {
      return;
    }

    // Get selected link indices
    const selectedIndices = Array.from(selectedCheckboxes).map((checkbox) =>
      parseInt(checkbox.dataset.index, 10),
    );

    // Get the selected links
    const linksToImport = selectedIndices.map(
      (index) => selectedGroup.links[index],
    );

    // Add new links to the form
    linksToImport.forEach((link) => {
      addGroupInputWithValues(link[0], link[1]);
    });

    // Close the modal
    closeGroupImportModal();
  });
}

// Function to add group input with pre-filled values
function addGroupInputWithValues(title, link) {
  const groupInputsContainer = document.getElementById("groupInputsContainer");

  // Create a container div to hold both title and link sections
  const newInputContainer = document.createElement("div");
  newInputContainer.classList.add("form-group", "mt-2", "card", "p-3");

  // Create the div for the title input (full length)
  const titleDiv = document.createElement("div");
  titleDiv.classList.add("mb-2");

  // Add title input
  const newInputName = document.createElement("input");
  newInputName.type = "text";
  newInputName.value = title || ""; // Set the title value
  newInputName.classList.add("form-control");
  newInputName.placeholder = "LinkTitle";

  // Add title input to titleDiv
  titleDiv.appendChild(newInputName);

  // Create the div for link and remove button (next to each other)
  const linkAndButtonDiv = document.createElement("div");
  linkAndButtonDiv.classList.add("d-flex", "align-items-center");

  // Add link input
  const newInput = document.createElement("input");
  newInput.type = "text";
  newInput.value = link || ""; // Set the link value
  newInput.classList.add("form-control", "mr-2");
  newInput.placeholder = "Link";

  // Add remove button
  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.classList.add("btn", "btn-outline-danger");
  removeButton.innerHTML = '<i class="fa fa-trash-o"></i>';
  removeButton.addEventListener("click", () => {
    // Remove the entire container with title and link inputs
    newInputContainer.remove();
  });

  // Append link input and remove button to linkAndButtonDiv
  linkAndButtonDiv.appendChild(newInput);
  linkAndButtonDiv.appendChild(removeButton);

  // Append both title and link/button divs to the main container
  newInputContainer.appendChild(titleDiv);
  newInputContainer.appendChild(linkAndButtonDiv);

  if (groupInputsContainer.firstChild) {
    groupInputsContainer.insertBefore(
      newInputContainer,
      groupInputsContainer.firstChild,
    );
  } else {
    groupInputsContainer.appendChild(newInputContainer); // If no existing inputs, just append it
  }
}

function filterGroupLinks() {
  const searchTerm = document
    .getElementById("groupItemSearch")
    .value.toLowerCase();
  const linkItems = document.querySelectorAll(".group-link-item");

  const selectAllCheckbox = document.getElementById("selectAllLinks");
  const selectAllLabel = document.querySelector('label[for="selectAllLinks"]');

  if (selectAllCheckbox) {
    // Uncheck the "Select All" checkbox whenever the filter changes,
    // as the selection context has been modified.
    selectAllCheckbox.checked = false;
  }

  // --- MODIFICATION START ---
  // Update the label text based on whether a search term exists.
  if (selectAllLabel) {
    if (searchTerm) {
      // If there is a search term, change the label.
      selectAllLabel.innerHTML = `<strong>${I18n.t("impSelAllFilt")}</strong>`;
    } else {
      selectAllLabel.innerHTML = `<strong>${I18n.t("impSelAll")}</strong>`;
    }
  }
  // --- MODIFICATION END ---

  linkItems.forEach((item) => {
    const text = item.textContent.toLowerCase();
    if (text.includes(searchTerm)) {
      item.style.display = "";
    } else {
      item.style.display = "none";
    }
  });
}
// Function to clear link search
function clearLinkSearch() {
  document.getElementById("groupItemSearch").value = "";
  filterGroupLinks();
}

function addGroupImportButton() {
  if (!document.getElementById("importFromGroupsBtn")) {
    const saveGroupsButton = document.getElementById("addGroupButton");
    if (saveGroupsButton) {
      const buttonContainer = saveGroupsButton.parentElement;
      const importButton = document.createElement("button");
      importButton.type = "button";
      importButton.id = "importFromGroupsBtn";
      importButton.className = "btn-visual-secondary mr-2";
      // FIX: Localized
      importButton.innerHTML = `<i class="fa fa-download"></i> ${I18n.t(
        "btnImportColl",
      )}`;
      buttonContainer.insertBefore(importButton, saveGroupsButton);
      importButton.addEventListener("click", showGroupImportModal);
    }
  }
}

// Function to init the import feature when opening the add/edit group page
function initGroupImportFeature() {
  // Add the import button to the page
  addGroupImportButton();

  // Ensure search functionality is available for the existing group inputs
  enhanceGroupInputSearch();
}

// Enhance the existing search functionality
function enhanceGroupInputSearch() {
  const searchGroupInput = document.getElementById("searchGroupInput");
  if (searchGroupInput) {
    // Clear any existing event listeners to avoid duplicates
    const newSearchInput = searchGroupInput.cloneNode(true);
    searchGroupInput.parentNode.replaceChild(newSearchInput, searchGroupInput);

    // Add enhanced event listener
    newSearchInput.addEventListener("input", function () {
      const searchValue = this.value.toLowerCase();

      // Get all group containers
      const groupContainers = document.querySelectorAll(
        "#groupInputsContainer .form-group.card",
      );

      let foundAny = false;

      groupContainers.forEach((container) => {
        const titleInput = container.querySelector(
          'input[placeholder="LinkTitle"]',
        );
        const linkInput = container.querySelector('input[placeholder="Link"]');

        // Get the title and link text
        const titleText = titleInput ? titleInput.value.toLowerCase() : "";
        const linkText = linkInput ? linkInput.value.toLowerCase() : "";

        // Check if the search value matches the title or link
        if (titleText.includes(searchValue) || linkText.includes(searchValue)) {
          container.style.display = "block"; // Show the container if it matches
          foundAny = true;
        } else {
          container.style.display = "none"; // Hide the container if it doesn't match
        }
      });

      // Show a message if no matches found
      let noResultsMsg = document.getElementById("noGroupSearchResults");

      if (!foundAny && searchValue) {
        if (!noResultsMsg) {
          noResultsMsg = document.createElement("div");
          noResultsMsg.id = "noGroupSearchResults";
          noResultsMsg.className = "alert alert-info mt-2";
          noResultsMsg.innerHTML =
            'No matching links found. <a href="#" id="clearGroupSearchBtn">Clear search</a>';

          const searchContainer = newSearchInput.parentNode;
          searchContainer.parentNode.insertBefore(
            noResultsMsg,
            searchContainer.nextSibling,
          );

          // Add event listener to clear button
          document
            .getElementById("clearGroupSearchBtn")
            .addEventListener("click", function (e) {
              e.preventDefault();
              newSearchInput.value = "";
              newSearchInput.dispatchEvent(new Event("input"));
            });
        }
      } else if (noResultsMsg) {
        noResultsMsg.remove();
      }
    });
  }
}

// Modify existing functions to integrate the new feature

// Override the existing addGroupsBTN event listener
// Fix for the addGroupsBTN event listener
addGroupsBTN.addEventListener("click", function () {
  // Initialize our import feature after a brief delay to ensure the DOM is updated
  setTimeout(initGroupImportFeature, 100);
});

// Override the editGroup function to add our import button
const originalEditGroup = window.editGroup;
window.editGroup = function (index) {
  // Call the original function first
  originalEditGroup(index);

  // Initialize our import feature
  setTimeout(initGroupImportFeature, 100);
};
// Initialize immediately if we're already on the add/edit groups page
if (!document.getElementById("addGroupsPage").classList.contains("d-none")) {
  initGroupImportFeature();
}

// Add these variables to the existing global variables section
let postingHistory = [];

// Add these references to the UI element references section
const historyBTN = document.getElementById("historyBTN");
const historyPage = document.getElementById("historyPage");
const historyListView = document.getElementById("historyListView");
const historyDetailView = document.getElementById("historyDetailView");
const historyListContainer = document.getElementById("historyListContainer");
const historyDetailContainer = document.getElementById(
  "historyDetailContainer",
);
const backToHistoryBtn = document.getElementById("backToHistoryBtn");

const historyDetailTitle = document.getElementById("historyDetailTitle");
const historyDateBadge = document.getElementById("historyDateBadge");

// Add this event listener for the history button
historyBTN.addEventListener("click", function () {
  // Hide other pages
  tagBTN.classList.remove("active");
  groupBTN.classList.remove("active");
  //  productBTN.classList.remove("active");
  SchedulerBTN.classList.remove("active");
  quickPostBTN.classList.remove("active");
  scheduledPostsBtn.classList.remove("active");
  historyBTN.classList.add("active");

  TagsPage.classList.add("d-none");
  SchedulerPage.classList.add("d-none");
  groupsPage.classList.add("d-none");
  productPage.classList.add("d-none");
  quickPostPage.classList.add("d-none");
  scheduledPostsPage.classList.add("d-none");

  // Show history page
  historyPage.classList.remove("d-none");

  // Make sure we're showing the list view, not detail view
  historyListView.classList.remove("d-none");
  historyDetailView.classList.add("d-none");

  // Load posting history
  loadPostingHistory();
  handleNavigationWhileEditing(); // <<< ADD THIS LINE
});

// Add event listener for the back button in detail view
backToHistoryBtn.addEventListener("click", function () {
  historyDetailView.classList.add("d-none");
  historyListView.classList.remove("d-none");
});

// Function to save posting history
function savePostingHistory(completedPosts, postsInfo) {
  // Get current date and time
  const timestamp = new Date().toISOString();

  // Create a history entry
  const historyEntry = {
    id: Date.now(),
    timestamp: timestamp,
    postsCompleted: completedPosts,
    summary: {
      successful: completedPosts.filter(
        (post) => post.response === "successful",
      ).length,
      failed: completedPosts.filter((post) => post.response === "failed")
        .length,
      completedAt: timestamp,
    },
    postsInfo: postsInfo || {}, // Store additional info about the posts
  };

  // Load existing history, add new entry, and save
  chrome.storage.local.get(["postingHistory"], function (result) {
    const history = result.postingHistory || [];

    // Add new entry at the beginning
    history.unshift(historyEntry);

    // Keep only the last 50 entries to avoid storage issues
    const trimmedHistory = history.slice(0, 250);

    // Save back to storage
    chrome.storage.local.set({ postingHistory: trimmedHistory }, function () {
      console.log("Posting history saved");
    });
  });
}
let currentHistoryFilter = "all";

function loadPostingHistory() {
  chrome.storage.local.get(["postingHistory"], function (result) {
    postingHistory = result.postingHistory || [];

    // Reset limits on reload
    historyCurrentLimit = historyPageSize;
    activeDateFilter = null;

    // 1. Render Graph
    renderActivityGraph(postingHistory);

    // 2. Render List
    renderHistoryList();
  });
}

function renderActivityGraph(history) {
  const container = document.getElementById("activityGraph");
  const totalLabel = document.getElementById("totalPosts30Days");
  if (!container) return;

  container.innerHTML = "";

  // 1. Generate Map
  const daysMap = new Map();
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateKey = d.toLocaleDateString("en-CA");
    daysMap.set(dateKey, 0);
  }

  // 2. Fill Data
  let total30 = 0;
  history.forEach((entry) => {
    const dateKey = new Date(entry.timestamp).toLocaleDateString("en-CA");
    if (daysMap.has(dateKey) && entry.postsCompleted) {
      const count = entry.postsCompleted.length;
      daysMap.set(dateKey, daysMap.get(dateKey) + count);
      total30 += count;
    }
  });

  // FIX: Localized Total
  if (totalLabel)
    totalLabel.textContent = I18n.t("graphPostsCount", [String(total30)]);

  // 3. Render Grid
  daysMap.forEach((count, dateKey) => {
    const square = document.createElement("div");
    let level = 0;
    if (count > 20) level = 3;
    else if (count > 5) level = 2;
    else if (count > 0) level = 1;

    square.className = `day-square level-${level}`;
    const niceDate = new Date(dateKey).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
    // FIX: Localized Tooltip
    square.title = `${niceDate}: ${I18n.t("graphPostsCount", [String(count)])}`;

    square.onclick = () => {
      if (activeDateFilter === dateKey) {
        activeDateFilter = null;
        square.classList.remove("selected");
      } else {
        activeDateFilter = dateKey;
        document
          .querySelectorAll(".day-square")
          .forEach((sq) => sq.classList.remove("selected"));
        square.classList.add("selected");
      }
      historyCurrentLimit = historyPageSize;
      renderHistoryList();
    };
    container.appendChild(square);
  });

  // 4. Inject Legend (Localized)
  let legend = document.getElementById("graphLegend");
  // Always rebuild legend to ensure language update
  if (legend) legend.remove();

  legend = document.createElement("div");
  legend.id = "graphLegend";
  legend.className = "graph-legend";
  legend.innerHTML = `
      <span>${I18n.t("graphLess")}</span>
      <div class="legend-square l-0"></div>
      <div class="legend-square l-1"></div>
      <div class="legend-square l-2"></div>
      <div class="legend-square l-3"></div>
      <span>${I18n.t("graphMore")}</span>
    `;
  container.parentNode.appendChild(legend);
}

function renderHistoryList() {
  const listContainer = document.getElementById("historyListContainer");
  const searchInput = document.getElementById("historySearchInput");
  const issuesToggle = document.getElementById("historyIssuesToggle");

  if (!listContainer) return;
  listContainer.innerHTML = "";

  // --- 0. Active Filter Banner (Render First) ---
  if (activeDateFilter) {
    // Parse date parts manually to avoid timezone shifts
    const [y, m, d] = activeDateFilter.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d); // Construct local date
    const niceDate = dateObj.toLocaleDateString(undefined, {
      weekday: "long",
      day: "numeric",
      month: "long",
    });

    const banner = document.createElement("div");
    banner.className = "active-date-filter";
    banner.innerHTML = `
      <span>${I18n.t("histFilterDate", [niceDate])}</span>
      <button type="button" class="clear-filter-btn" title="Clear Filter">×</button>
    `;

    // Attach listener immediately to the new element
    banner.querySelector("button").addEventListener("click", (e) => {
      e.stopPropagation(); // Stop bubble just in case
      activeDateFilter = null;
      // Visual reset
      document
        .querySelectorAll(".day-square")
        .forEach((sq) => sq.classList.remove("selected"));
      // Reset pagination
      historyCurrentLimit = historyPageSize;
      // Re-render
      renderHistoryList();
    });

    listContainer.appendChild(banner);
  }

  // --- 1. FILTERING LOGIC ---
  const searchTerm = searchInput ? searchInput.value.toLowerCase() : "";
  const showIssuesOnly = issuesToggle ? issuesToggle.checked : false;

  const filteredHistory = postingHistory.filter((entry) => {
    // Date Filter
    if (activeDateFilter) {
      // Compare local date strings
      const entryDate = new Date(entry.timestamp).toLocaleDateString("en-CA");
      if (entryDate !== activeDateFilter) return false;
    }

    // Text Search
    const title = (entry.postsInfo?.postTitle || "Untitled").toLowerCase();
    const matchesSearch = title.includes(searchTerm);

    // Issues Only
    let matchesIssues = true;
    if (showIssuesOnly) {
      const hasFailures = entry.summary?.failed > 0;
      const wasStopped = entry.postsCompleted?.some(
        (p) => p.response === "skipped",
      );
      matchesIssues = hasFailures || wasStopped;
    }

    return matchesSearch && matchesIssues;
  });

  // --- 2. EMPTY STATE HANDLING ---
  if (filteredHistory.length === 0) {
    const emptyMsg = document.createElement("div");
    emptyMsg.className = "text-center py-4 text-muted small";

    // Use LOCALIZED strings for empty states
    if (postingHistory.length === 0) {
      emptyMsg.textContent = I18n.t("noHistory"); // "No history found."
    } else {
      emptyMsg.textContent = I18n.t("noMatch"); // "No logs match your filters."
    }

    listContainer.appendChild(emptyMsg);
    return;
  }

  // --- 3. PAGINATION SLICING ---
  const visibleHistory = filteredHistory.slice(0, historyCurrentLimit);
  const hasMore = filteredHistory.length > historyCurrentLimit;

  // --- 4. RENDER ITEMS ---
  const fragment = document.createDocumentFragment();

  visibleHistory.forEach((entry) => {
    const date = new Date(entry.timestamp);
    const formattedDateTime = date
      .toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      .replace(",", "");

    let rawType = entry.postsInfo?.type || "manual";

    // LOCALIZED Run Type Badges
    let runTypeDisplay = I18n.t("typeManual"); // "Manual"
    let badgeClass = "run-type-manual";

    if (rawType.includes("scheduled")) {
      runTypeDisplay = I18n.t("typeScheduled"); // "Scheduled"
      badgeClass = "run-type-scheduled";
    } else if (rawType.includes("retry")) {
      runTypeDisplay = I18n.t("typeRetry"); // "Retry"
      badgeClass = "run-type-retry";
    }

    let postIdentifier = entry.postsInfo?.postTitle || "Post Run";
    if (postIdentifier.length > 30)
      postIdentifier = postIdentifier.substring(0, 27) + "...";

    const completedPosts = entry.postsCompleted || [];
    const successful = entry.summary?.successful || 0;
    const failed = entry.summary?.failed || 0;
    const total = successful + failed;
    const successRate = total > 0 ? Math.round((successful / total) * 100) : 0;

    let statusClass = "history-v8-status-skipped";
    let statusIcon = "fa-minus-circle";
    let rateColor = "#6b7280";

    if (total > 0) {
      if (failed === 0) {
        statusClass = "history-v8-status-success";
        statusIcon = "fa-check-circle";
        rateColor = "#15803d";
      } else if (successful > 0) {
        statusClass = "history-v8-status-partial";
        statusIcon = "fa-exclamation-circle";
        rateColor = "#d97706";
      } else {
        statusClass = "history-v8-status-failed";
        statusIcon = "fa-times-circle";
        rateColor = "#dc2626";
      }
    }

    const itemDiv = document.createElement("div");
    itemDiv.className = `history-item-v8 ${statusClass}`;
    itemDiv.setAttribute("data-history-id", entry.id);

    itemDiv.innerHTML = `
        <div class="history-v8-status-indicator"><i class="fa ${statusIcon}"></i></div>
        <div class="history-v8-content">
            <div class="history-v8-title-line">
                <span class="history-v8-run-type ${badgeClass}">${runTypeDisplay}</span>
                <span class="history-v8-post-identifier">${postIdentifier}</span>
            </div>
            <div class="history-v8-meta"><i class="fa fa-calendar-alt"></i> ${formattedDateTime}</div>
        </div>
        <div class="history-v8-stats">
             ${
               successful > 0
                 ? `<span class="stat-pill-sm success"><i class="fa fa-check"></i> ${successful}</span>`
                 : ""
             }
             ${
               failed > 0
                 ? `<span class="stat-pill-sm failure"><i class="fa fa-times"></i> ${failed}</span>`
                 : ""
             }
        </div>
        <div class="history-v8-rate" style="color: ${rateColor};">${successRate}%</div>
        <div class="history-v8-action-indicator"><i class="fa fa-chevron-right"></i></div>
    `;
    itemDiv.addEventListener("click", function () {
      showHistoryDetailsById(this.getAttribute("data-history-id"));
    });
    fragment.appendChild(itemDiv);
  });

  listContainer.appendChild(fragment);

  // --- 5. LOAD MORE BUTTON ---
  if (hasMore) {
    const loadMoreContainer = document.createElement("div");
    loadMoreContainer.className = "load-more-container";

    const loadBtn = document.createElement("button");
    loadBtn.className = "btn-load-more";

    // LOCALIZED Load More Button
    loadBtn.textContent = `${I18n.t("btnLoadMore")} (${
      filteredHistory.length - historyCurrentLimit
    } remaining)`;

    loadBtn.onclick = () => {
      historyCurrentLimit += historyPageSize;
      renderHistoryList();
    };

    loadMoreContainer.appendChild(loadBtn);
    listContainer.appendChild(loadMoreContainer);
  }
}
function analyzeGroupHealth() {
  const deadGroups = new Map();
  const currentGroupUrls = new Set();

  if (groups && Array.isArray(groups)) {
    groups.forEach((collection) => {
      if (collection.links) {
        collection.links.forEach((link) => currentGroupUrls.add(link[1]));
      }
    });
  }

  postingHistory.forEach((run) => {
    (run.postsCompleted || []).forEach((log) => {
      if (!log.linkURL) return;
      if (!currentGroupUrls.has(log.linkURL)) return;

      if (!deadGroups.has(log.linkURL)) {
        deadGroups.set(log.linkURL, {
          title: log.linkTitle,
          fails: 0,
          attempts: 0,
        });
      }

      const entry = deadGroups.get(log.linkURL);
      entry.attempts++;

      if (log.response === "failed") {
        const r = (log.reason || "").toLowerCase();
        if (
          r.includes("content isn't available") ||
          r.includes("broken link") ||
          r.includes("removed") ||
          r.includes("permission") ||
          r.includes("page content missing")
        ) {
          entry.fails++;
        }
      }
    });
  });

  const candidates = Array.from(deadGroups.entries())
    .filter(([url, data]) => data.attempts >= 3 && data.fails === data.attempts)
    .map(([url, data]) => ({ url, ...data }));

  if (candidates.length === 0) {
    // FIX: Localized
    showCustomModal(
      I18n.t("healthSuccessTitle"),
      I18n.t("healthSuccessMsg"),
      "success",
    );
    return;
  }

  let listHtml = `<div class="dead-group-list-container">`;
  candidates.forEach((g) => {
    listHtml += `
      <div class="dead-group-item">
        <div class="dead-group-info">
           <div class="dead-group-name">${g.title}</div>
           <div class="dead-group-stats">
              ${g.fails} failures (100%) &bull; 
           </div>
        </div>
        <div class="dead-group-icon" title="Will be removed">
           <a href="${
             g.url
           }" target="_blank" class="btn-visual-secondary">${I18n.t(
             "healthVerifyLink",
           )} <i class="fa fa-external-link"></i></a>
        </div>
      </div>`;
  });
  listHtml += `</div>`;

  // FIX: Localized
  showCustomModal(
    I18n.t("healthFoundTitle", [String(candidates.length)]),
    `<p class="mb-2">${I18n.t("healthFoundMsg")}</p>${listHtml}`,
    "confirm",
    () => removeDeadGroups(candidates.map((c) => c.url)),
    null,
    I18n.t("healthRemoveBtn"),
    I18n.t("btnCancel"),
  );
}

function removeDeadGroups(urlsToRemove) {
  const urlSet = new Set(urlsToRemove);
  let removedCount = 0;

  groups.forEach((collection) => {
    if (collection.links) {
      const initialLen = collection.links.length;
      collection.links = collection.links.filter(
        (link) => !urlSet.has(link[1]),
      );
      removedCount += initialLen - collection.links.length;
    }
  });

  chrome.storage.local.set({ groups }, () => {
    LoadGroups();
    // FIX: Localized
    showCustomModal(
      I18n.t("healthCleanupTitle"),
      I18n.t("healthCleanupMsg", [String(removedCount)]),
    );
  });
}
// Keep helper functions (getUniquePostTitles, getSuccessRateColor)
function getUniquePostTitles(completedPosts) {
  if (!completedPosts || !Array.isArray(completedPosts)) return [];
  const uniqueTitles = new Set();
  completedPosts.forEach((post) => {
    if (post.postTitle) {
      uniqueTitles.add(post.postTitle);
    }
  });
  return Array.from(uniqueTitles);
}

function getSuccessRateColor(rate) {
  if (rate >= 90) return "#198754"; // Darker Success Green
  if (rate >= 60) return "#0dcaf0"; // Info Cyan
  if (rate >= 30) return "#ffc107"; // Warning Yellow
  if (rate > 0) return "#fd7e14"; // Orange for low success
  return "#dc3545"; // Danger Red
}
function showHistoryDetailsById(historyId) {
  const historyEntry = postingHistory.find(
    (entry) => String(entry.id) === String(historyId),
  );

  if (!historyEntry) {
    console.error("History entry not found for ID:", historyId);
    showCustomModal("Error", "Could not find history details for this entry.");
    return;
  }

  // --- Update Detail View Header (No changes here) ---
  const date = new Date(historyEntry.timestamp);
  const formattedDate = date.toLocaleDateString(undefined, {
    /* ... options ... */
  });
  const sourceText =
    historyEntry.postsInfo?.type === "scheduled"
      ? `Scheduled Run`
      : "Manual Run";
  let displayTitle = historyEntry.postsInfo?.postTitle || "Post Details";
  if (historyEntry.postsCompleted && historyEntry.postsCompleted.length > 0) {
    displayTitle = historyEntry.postsCompleted[0].postTitle || "Untitled Run";
  }
  if (historyDetailTitle)
    historyDetailTitle.textContent = `${sourceText} - ${displayTitle}`;
  if (historyDateBadge) historyDateBadge.textContent = formattedDate;

  // --- REMOVED Retry Button Logic from here. It's now in MapLogsUL ---
  const actionsContainer = document.getElementById("historyDetailActions");
  if (actionsContainer) {
    actionsContainer.innerHTML = ""; // Clear the container.
  }

  // --- Switch UI Views ---
  if (historyListView) historyListView.classList.add("d-none");
  if (historyDetailView) historyDetailView.classList.remove("d-none");

  // --- Render the Detailed Log Table & Potential Retry Prompt ---
  if (historyDetailContainer) {
    historyDetailContainer.innerHTML = "";
    MapLogsUL(
      historyEntry.postsCompleted,
      historyDetailContainer,
      historyEntry,
    );
  } else {
    console.error("History detail container UI element not found.");
  }
}

// Function to show history details
function showHistoryDetails(index) {
  const historyEntry = postingHistory[index];
  if (!historyEntry) return;

  // Update detail view header
  const date = new Date(historyEntry.timestamp);
  const formattedDate = date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  historyDetailTitle.textContent = "Posting Details";
  historyDateBadge.textContent = formattedDate;

  // Show the detail view
  historyListView.classList.add("d-none");
  historyDetailView.classList.remove("d-none");

  // Use the existing MapLogsUL function to display the details
  historyDetailContainer.innerHTML = ""; // Clear previous content

  // Create a temporary container for MapLogsUL
  const tempContainer = document.createElement("div");
  tempContainer.className = "logsUL";
  historyDetailContainer.appendChild(tempContainer);

  // Use MapLogsUL to render the details
  const originalLogsContainer = document.querySelector(".logsUL");
  const originalParent = originalLogsContainer
    ? originalLogsContainer.parentNode
    : null;

  if (originalLogsContainer) {
    // Temporarily replace the logs container
    originalParent.replaceChild(tempContainer, originalLogsContainer);
    MapLogsUL(historyEntry.postsCompleted);

    // Move the content back
    const content = tempContainer.innerHTML;
    originalParent.replaceChild(originalLogsContainer, tempContainer);

    // Set the content to our history detail container
    historyDetailContainer.innerHTML = content;
  } else {
    // Fallback if original logs container not found
    historyDetailContainer.innerHTML = `
      <div class="alert alert-warning">
        Could not load details. Please try again.
      </div>
    `;
  }
}

// Helper function to get unique post titles from a completed posts array
function getUniquePostTitles(completedPosts) {
  if (!completedPosts || !Array.isArray(completedPosts)) return [];

  const uniqueTitles = new Set();
  completedPosts.forEach((post) => {
    if (post.postTitle) {
      uniqueTitles.add(post.postTitle);
    }
  });

  return Array.from(uniqueTitles);
}

// Helper function to get color based on success rate
function getSuccessRateColor(rate) {
  if (rate >= 75) return "#28a745"; // success green
  if (rate >= 50) return "#17a2b8"; // info blue
  if (rate >= 30) return "#ffc107"; // warning yellow
  return "#dc3545"; // danger red
}

// Instead of modifying finalizePosting (which is in background.js),
// we'll detect when a posting is completed via the chrome.storage.onChanged listener
// Modify the existing chrome.storage.onChanged listener to also save history

// Also modify CloseLogButton event listener to navigate to history after closing
const originalCloseLogHandler = CloseLogButton.onclick;
CloseLogButton.onclick = function () {
  if (originalCloseLogHandler) {
    originalCloseLogHandler.call(this);
  }

  // Optional: Navigate to history tab after closing
  setTimeout(() => {
    // Uncomment this line if you want to automatically go to history after posting
    // historyBTN.click();
  }, 300);
};

// ACTION: Replace the Post Quality Calculator IIFE at the end of popup.js

// -------------------------------------------------------
// Ultimate Post Quality Calculator (v8.1 - Auto-Retry Fix)
// -------------------------------------------------------
(function () {
  const THEME = {
    bad: "#ef4444",
    warn: "#f59e0b",
    good: "#3b82f6",
    perfect: "#10b981",
    textDark: "#1e293b",
    textLight: "#64748b",
  };

  const PATTERNS = {
    url: /(https?:\/\/[^\s]+)|(www\.[^\s]+)/,
    email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
    phone: /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/,
    spintax: /\{([^{}]+)\|([^{}]+)\}/,
    emoji:
      /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u,
    formatting: /<(strong|b|em|i|ul|ol|h[1-6])>/i,
  };

  let state = {
    containerId: null,
    context: "template",
    timer: null,
    observers: { dom: null, media: null },
  };

  // --- DATA ---

  function getData() {
    // 1. Try Global Variable (Fastest)
    let q = state.context === "quick" ? window.quickPostQuill : window.quill;

    if (q) {
      // console.log("PQS: Found Quill instance via window.");
      return { rawText: q.getText().trim(), html: q.root.innerHTML };
    }

    // 2. DOM Fallback
    const sel =
      state.context === "quick"
        ? "#quick-editor-container .ql-editor"
        : "#editor-container .ql-editor";
    const el = document.querySelector(sel);
    if (el) {
      // console.log("PQS: Found Editor via DOM.");
      return { rawText: el.innerText.trim(), html: el.innerHTML };
    }

    // console.log("PQS: No editor found yet.");
    return { rawText: "", html: "" };
  }

  function getMediaCount() {
    if (state.context === "quick") {
      if (typeof quickMedia !== "undefined") return quickMedia.length;
    } else if (typeof images !== "undefined") {
      return images.length;
    }
    // Fallback
    const id =
      state.context === "quick" ? "quickSelectedMedia" : "selectedImages";
    const el = document.getElementById(id);
    return el ? el.querySelectorAll("img, video, .media-container").length : 0;
  }

  // --- ANALYSIS ---

  function analyze() {
    const { rawText, html } = getData();
    const mediaCount = getMediaCount();

    // Spintax Norm
    const normalizedText = rawText.replace(/\{([^{}|]+)\|[^}]+\}/g, "$1");
    const words =
      normalizedText.length > 0 ? normalizedText.split(/\s+/).length : 0;
    const paragraphs = normalizedText.split(/\n\s*\n/);

    const stats = {
      score: 0,
      words: words,
      media: mediaCount,
      hasSpintax: PATTERNS.spintax.test(rawText),
      hasEmoji: PATTERNS.emoji.test(rawText),
      isFormatted: PATTERNS.formatting.test(html),
      hasHook:
        paragraphs[0] && paragraphs[0].split(/\s+/).length < 15 && words > 5,
      isReadable: !paragraphs.some((p) => p.split(/\s+/).length > 45),
      hasLink: PATTERNS.url.test(rawText),
      hasContact: PATTERNS.email.test(rawText) || PATTERNS.phone.test(rawText),
    };

    // Scoring
    if (words >= 15) stats.score += 30;
    else if (words >= 5) stats.score += 15;

    if (mediaCount >= 1) stats.score += 20;
    if (mediaCount >= 3) stats.score += 10;

    if (stats.hasSpintax) stats.score += 20;
    else stats.score += 5;

    if (stats.isFormatted) stats.score += 5;
    if (stats.hasEmoji) stats.score += 5;
    if (stats.hasHook) stats.score += 5;
    if (stats.isReadable) stats.score += 5;

    if (stats.hasLink) stats.score -= 10;
    if (stats.hasContact) stats.score -= 15;

    stats.score = Math.max(0, Math.min(100, stats.score));

    updateUI(stats);
  }

  // --- UI ---

  const t = (k, d) => (typeof I18n !== "undefined" ? I18n.t(k) : d);

  function createUI(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return false;

    // Check if we already injected styles
    if (!document.getElementById("pqsV8Styles")) {
      const style = document.createElement("style");
      style.id = "pqsV8Styles";
      style.textContent = `
          .pqs-container { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 15px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
          .pqs-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
          .pqs-header h4 { margin: 0; font-size: 15px; font-weight: 700; color: ${THEME.textDark}; }
          .pqs-header span { font-size: 11px; color: ${THEME.textLight}; display: block; margin-top: 2px; }
          .pqs-gauge { width: 52px; height: 52px; border-radius: 50%; background: conic-gradient(var(--c) var(--p), #f1f5f9 0); display: flex; align-items: center; justify-content: center; position: relative; transition: --p 0.5s ease; }
          .pqs-gauge::after { content: attr(data-score); position: absolute; background: #fff; width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 15px; color: ${THEME.textDark}; }
          .pqs-metrics { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 16px; }
          .pqs-metric { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 5px; text-align: center; }
          .pqs-metric i { font-size: 16px; color: ${THEME.textLight}; margin-bottom: 4px; display:block; }
          .pqs-metric-val { font-size: 18px; font-weight: 800; color: ${THEME.textDark}; line-height: 1.2; display:block; }
          .pqs-metric-label { font-size: 10px; text-transform: uppercase; color: ${THEME.textLight}; font-weight: 600; }
          .pqs-tips { display: flex; flex-direction: column; gap: 8px; }
          .pqs-tip { display: flex; align-items: flex-start; gap: 10px; padding: 10px 12px; border-radius: 8px; font-size: 12px; line-height: 1.4; color: ${THEME.textDark}; border-left: 3px solid transparent; background: #fff; }
          .pqs-tip.good { background: #f0fdf4; border-color: ${THEME.perfect}; }
          .pqs-tip.warn { background: #fffbeb; border-color: ${THEME.warn}; }
          .pqs-tip.bad { background: #fef2f2; border-color: ${THEME.bad}; }
          .pqs-tip i { margin-top: 2px; flex-shrink: 0; }
        `;
      document.head.appendChild(style);
    }

    container.innerHTML = `
      <div class="pqs-container" id="pqsRoot">
        <div class="pqs-top">
          <div class="pqs-header">
            <h4>${t("qualTitle", "Post Quality")}</h4>
            <span id="pqsStatusText">...</span>
          </div>
          <div class="pqs-gauge" id="pqsGauge" style="--p: 0%; --c: #e2e8f0;" data-score="0"></div>
        </div>
        <div class="pqs-metrics">
          <div class="pqs-metric">
            <i class="fa fa-align-left"></i>
            <span class="pqs-metric-val" id="valWords">0</span>
            <span class="pqs-metric-label">Words</span>
          </div>
          <div class="pqs-metric">
            <i class="fa fa-image"></i>
            <span class="pqs-metric-val" id="valMedia">0</span>
            <span class="pqs-metric-label">Media</span>
          </div>
          <div class="pqs-metric">
            <i class="fa fa-random"></i>
            <span class="pqs-metric-val" id="valSpin" style="font-size:14px;">No</span>
            <span class="pqs-metric-label">${t("lblSpintax", "Spintax")}</span>
          </div>
        </div>
        <div class="pqs-tips" id="pqsTipsList"></div>
      </div>
    `;
    return true;
  }

  function updateUI(stats) {
    const root = document.getElementById("pqsRoot");
    if (!root) return;

    const score = stats.score;
    let color = THEME.bad;
    let label = "Needs Work";
    if (score >= 90) {
      color = THEME.perfect;
      label = "Excellent";
    } else if (score >= 70) {
      color = THEME.good;
      label = "Good Job";
    } else if (score >= 40) {
      color = THEME.warn;
      label = "Acceptable";
    }

    const gauge = document.getElementById("pqsGauge");
    gauge.style.setProperty("--p", `${score}%`);
    gauge.style.setProperty("--c", color);
    gauge.setAttribute("data-score", score);

    const statusText = document.getElementById("pqsStatusText");
    statusText.textContent = label;
    statusText.style.color = color;

    document.getElementById("valWords").textContent = stats.words;
    document.getElementById("valMedia").textContent = stats.media;

    const spinEl = document.getElementById("valSpin");
    spinEl.textContent = stats.hasSpintax ? "Yes" : "No";
    spinEl.style.color = stats.hasSpintax ? THEME.perfect : THEME.warn;

    const list = document.getElementById("pqsTipsList");
    list.innerHTML = "";

    const addTip = (icon, msg, type) => {
      const div = document.createElement("div");
      div.className = `pqs-tip ${type}`;
      div.innerHTML = `<i class="fa fa-${icon}"></i> <span>${msg}</span>`;
      list.appendChild(div);
    };

    if (stats.hasLink)
      addTip("link", "Links reduce reach. Comment them instead.", "bad");
    if (stats.hasContact)
      addTip(
        "exclamation-triangle",
        "Contact info triggers spam filters.",
        "bad",
      );
    if (!stats.hasSpintax && score < 100)
      addTip("random", "Add Spintax {A|B} for safety.", "warn");
    if (stats.words < 5)
      addTip("pencil", "Too short. Write at least 15 words.", "warn");
    if (stats.media === 0)
      addTip("image", "Posts with media get 2x reach.", "warn");
    if (!stats.isFormatted && stats.words > 30)
      addTip("bold", "Use Bold/Lists for readability.", "warn");

    if (list.children.length === 0) {
      if (score === 100)
        addTip("check-circle", "Perfect! Fully optimized.", "good");
      else addTip("thumbs-up", "Looking good! Keep going.", "good");
    }

    // Update External Badges (The small numbers on buttons)
    const badgeId =
      state.context === "quick"
        ? "quickQualityScoreBadge"
        : "qualityScoreBadge";
    const badge = document.getElementById(badgeId);
    if (badge) {
      badge.textContent = score;
      badge.style.backgroundColor = color;
      badge.style.color = "#fff";
    }
  }

  // --- BINDING ---

  function attachListeners() {
    let attached = false;
    const q = state.context === "quick" ? window.quickPostQuill : window.quill;

    if (q) {
      q.off("text-change", handleInput);
      q.on("text-change", handleInput);
      attached = true;
    } else {
      if (state.observers.dom) state.observers.dom.disconnect();
      const sel =
        state.context === "quick"
          ? "#quick-editor-container"
          : "#editor-container";
      const el = document.querySelector(sel);
      if (el) {
        state.observers.dom = new MutationObserver(() => {
          if (!attached) attachListeners();
          handleInput();
        });
        state.observers.dom.observe(el, {
          childList: true,
          subtree: true,
          characterData: true,
        });
      }
    }

    if (state.observers.media) state.observers.media.disconnect();
    const mediaId =
      state.context === "quick" ? "quickSelectedMedia" : "selectedImages";
    const mediaEl = document.getElementById(mediaId);
    if (mediaEl) {
      state.observers.media = new MutationObserver(handleInput);
      state.observers.media.observe(mediaEl, {
        childList: true,
        subtree: true,
      });
    }
  }

  function handleInput() {
    clearTimeout(state.timer);
    state.timer = setTimeout(analyze, 600);
  }

  // --- API ---

  window.postQualityCalculator = {
    init: function (containerId, context) {
      state.containerId = containerId;
      state.context = context;

      if (createUI(containerId)) {
        attachListeners();
        // ** Force multiple retries to catch late loading **
        analyze();
        setTimeout(analyze, 300);
        setTimeout(analyze, 1000);
        setTimeout(attachListeners, 1000);
      }
    },
    analyze: function () {
      analyze();
    },
    remove: function () {
      const r = document.getElementById("pqsRoot");
      if (r) r.remove();
      if (state.observers.media) state.observers.media.disconnect();
      if (state.observers.dom) state.observers.dom.disconnect();
    },
  };

  console.log("PQS V8.1 Loaded");
})();
// Initialize Quick Post enhancements
function initQuickPostEnhancements() {
  // Set up character counter
  const quickPostContent = document.getElementById("quickPostContent");
  const charCounter = document.getElementById("charCounter");
  const quickImportPostButton = document.getElementById(
    "quickImportPostButton",
  );
  const quickImportSearchInput = document.getElementById(
    "quickImportSearchInput",
  );

  if (quickImportPostButton) {
    quickImportPostButton.addEventListener("click", showQuickImportPostModal);
  }
  if (quickImportSearchInput) {
    quickImportSearchInput.addEventListener(
      "input",
      filterSavedPostTemplatesForImport,
    );
  }
  const quickAiVarCheckbox = document.getElementById(
    "quickGenerateAiVariations",
  );
  const quickAiVarOptions = document.getElementById("quickAiVariationOptions");

  if (quickAiVarCheckbox && quickAiVarOptions) {
    quickAiVarCheckbox.addEventListener("change", function () {
      if (this.checked) {
        quickAiVarOptions.classList.remove("d-none");
      } else {
        quickAiVarOptions.classList.add("d-none");
      }

      // Update Summary if button is clicked (optional, mostly handled by Post Now click)
    });
  }
  if (quickPostContent && charCounter) {
    quickPostContent.addEventListener("input", function () {
      const count = this.value.length;
      charCounter.textContent = `${count} character${count !== 1 ? "s" : ""}`;

      // Optional: Add visual indicator for optimal length
      if (count > 0 && count <= 80) {
        charCounter.style.color = "#10b981"; // Green for short, engaging posts
      } else if (count > 80 && count <= 200) {
        charCounter.style.color = "#6b7280"; // Normal color for medium posts
      } else if (count > 200) {
        charCounter.style.color = "#f59e0b"; // Amber for longer posts
      }
    });
  }

  function updateMediaCount() {
    const mediaCounter = document.getElementById("quickMediaCount");
    if (mediaCounter && quickMedia) {
      mediaCounter.textContent = `${quickMedia.length} item${
        quickMedia.length !== 1 ? "s" : ""
      }`;
    }
  }

  function updateGroupCount() {
    const groupCounter = document.getElementById("quickGroupCount");
    if (groupCounter && quickSelectedGroups) {
      const count = quickSelectedGroups.length;
      groupCounter.textContent = I18n.t("countSelected", [String(count)]);
    }
  }

  // Override the existing updateQuickMediaDisplay function to also update count
  const originalUpdateQuickMediaDisplay = window.updateQuickMediaDisplay;
  window.updateQuickMediaDisplay = function () {
    if (originalUpdateQuickMediaDisplay) {
      originalUpdateQuickMediaDisplay();
    }
    updateMediaCount();
  };

  // Spintax helper toggle
  const showSpintaxHelp = document.getElementById("showSpintaxHelp");
  const spintaxHelp = document.getElementById("spintaxHelp");

  if (showSpintaxHelp && spintaxHelp) {
    showSpintaxHelp.addEventListener("click", function () {
      if (spintaxHelp.classList.contains("d-none")) {
        spintaxHelp.classList.remove("d-none");
        showSpintaxHelp.innerHTML =
          '<i class="fa fa-times-circle"></i> Hide Help';
      } else {
        spintaxHelp.classList.add("d-none");
        showSpintaxHelp.innerHTML =
          '<i class="fa fa-info-circle"></i> Spintax Help';
      }
    });
  }

  // Save as template functionality
  const saveAsTemplate = document.getElementById("saveAsTemplate");
  const quickPostButton = document.getElementById("quickPostButton");

  if (saveAsTemplate && quickPostButton) {
    saveAsTemplate.addEventListener("change", function () {
      if (this.checked) {
        quickPostButton.textContent = "Post & Save as Template";
      } else {
        quickPostButton.innerHTML =
          '<span>Post Now</span><i class="fa fa-paper-plane ml-1"></i>';
      }
    });
  }

  // Make quick post media area a drop zone
  const quickMediaDropzone = document.getElementById("quickMediaDropzone");
  if (quickMediaDropzone) {
    quickMediaDropzone.addEventListener("dragover", function (e) {
      e.preventDefault();
      this.style.borderColor = "#4f46e5";
      this.style.backgroundColor = "#eef2ff";
    });

    quickMediaDropzone.addEventListener("dragleave", function (e) {
      e.preventDefault();
      this.style.borderColor = "#d1d5db";
      this.style.backgroundColor = "#f9fafb";
    });

    quickMediaDropzone.addEventListener("drop", function (e) {
      e.preventDefault();
      this.style.borderColor = "#d1d5db";
      this.style.backgroundColor = "#f9fafb";

      if (e.dataTransfer.files.length > 0) {
        // Filter by our supported types before processing
        const files = e.dataTransfer.files;
        const validFiles = Array.from(files).filter((file) => {
          const isImage = file.type.startsWith("image/");
          const isValidVideo = [
            "video/mp4",
            "video/webm",
            "audio/mp3",
          ].includes(file.type);
          return isImage || isValidVideo;
        });

        if (validFiles.length > 0) {
          handleDroppedMedia(validFiles);
        } else {
          alert(
            "No valid files found. Only images and videos (mp4, webm) or audio (mp3) files are allowed.",
          );
        }

        // Warn if some files were skipped
        if (validFiles.length < files.length) {
          console.warn(
            `Skipped ${files.length - validFiles.length} invalid files`,
          );
          if (validFiles.length > 0) {
            alert(
              `Some files were skipped. Only images and videos (mp4, webm) or audio (mp3) files are allowed.`,
            );
          }
        }
      }
    });
  }

  // Initial updates
  updateMediaCount();
  updateGroupCount();

  // Set up observers for groups selection changes
  const quickSelectedGroupsContainer = document.getElementById(
    "quickSelectedGroupsContainer",
  );
  if (quickSelectedGroupsContainer) {
    const observer = new MutationObserver(function () {
      updateGroupCount();
    });

    observer.observe(quickSelectedGroupsContainer, { childList: true });
  }

  // --- START FIX: Auto-Start Post Quality Calculator ---
  if (window.postQualityCalculator) {
    // We explicitly initialize it for the 'quick' context
    window.postQualityCalculator.init("quickQualityScorerContainer", "quick");

    // We force an analysis after a short delay to allow Quill to fully hydrate
    setTimeout(() => {
      window.postQualityCalculator.analyze();
    }, 500);
  }
  // --- END FIX ---
}

function handleDroppedMedia(files) {
  if (!files || files.length === 0) {
    console.warn("No files to process");
    return;
  }

  console.log(`Processing ${files.length} dropped files`);

  // Process each dropped file
  Array.from(files).forEach((file) => {
    // Validate file type - only process images and specific video formats
    const isImage = file.type.startsWith("image/");
    const isValidVideo = ["video/mp4", "video/webm", "audio/mp3"].includes(
      file.type,
    );

    if (isImage || isValidVideo) {
      const reader = new FileReader();

      reader.onload = function (e) {
        if (!e.target || !e.target.result) {
          console.error("Failed to read file:", file.name);
          return;
        }

        const mediaObject = {
          data: e.target.result,
          type: isImage ? "image" : "video",
        };

        // Add to quickMedia array with duplicate check
        if (Array.isArray(quickMedia)) {
          // Check for duplicates (optional)
          const isDuplicate = quickMedia.some(
            (item) => item.data === mediaObject.data,
          );

          if (!isDuplicate) {
            // Add to the quickMedia array
            quickMedia.push(mediaObject);

            // Update the media display
            if (typeof updateQuickMediaDisplay === "function") {
              updateQuickMediaDisplay();
            } else {
              console.warn("updateQuickMediaDisplay function not found");
            }

            console.log(`Added ${mediaObject.type} to quick media collection`);
          } else {
            console.warn("Duplicate media skipped");
          }
        } else {
          console.error("quickMedia is not an array:", quickMedia);
        }
      };

      reader.onerror = function (error) {
        console.error("Error reading file:", file.name, error);
      };

      // Read the file as a data URL for display
      reader.readAsDataURL(file);
    } else {
      console.warn(
        `Skipping file ${file.name} - not a supported format (type: ${file.type})`,
      );
      showCustomModal(
        "Invalid Files",
        "No valid files were selected. Only images, MP4/WebM videos, or MP3 audio files are allowed.",
      );
    }
  });
}

// Add this to your document ready or initialization code
document.addEventListener("DOMContentLoaded", function () {
  // Initialize quick post enhancements
  initQuickPostEnhancements();
});

// Initialize Add Tags Page enhancements
// in popup.js
// Replace the entire initAddTagsPageEnhancements function

function initAddTagsPageEnhancements() {
  const postTitle = document.getElementById("postTitle");
  if (postTitle) {
    postTitle.addEventListener("input", updateTitleCharCounter);
  }

  // --- START: CORRECTED QUILL LISTENER LOGIC ---
  if (quill) {
    // This is the correct way to handle the listener. It checks if the page is visible
    // *inside* the event handler itself, so we don't need to add/remove listeners constantly.
    const debouncedCharCounterUpdate = throttle(updateQuillCharCounter, 500); // Debounce for performance
    quill.on("text-change", debouncedCharCounterUpdate);
  }
  // --- END: CORRECTED QUILL LISTENER LOGIC ---

  function updateMediaCounter() {
    const mediaCounter = document.getElementById("mediaCounter");
    if (mediaCounter && images) {
      const count = images.length;
      const key = count === 1 ? "countItems" : "countItemsPlural";
      mediaCounter.textContent = I18n.t(key, [String(count)]);
    }
  }

  const originalUpdateSelectedMedia = window.updateSelectedMedia;
  window.updateSelectedMedia = function (...args) {
    // Pass arguments through
    if (originalUpdateSelectedMedia) {
      originalUpdateSelectedMedia(...args);
    }
    updateMediaCounter();
  };

  const mediaDropzone = document.getElementById("mediaDropzone");
  const imageInput = document.getElementById("imageInput");

  if (mediaDropzone && imageInput) {
    mediaDropzone.addEventListener("dragover", function (e) {
      e.preventDefault();
      this.style.backgroundColor = "#eef2ff";
      this.style.borderColor = "#4f46e5";
    });

    mediaDropzone.addEventListener("dragleave", function (e) {
      e.preventDefault();
      this.style.backgroundColor = "#f9fafb";
      this.style.borderColor = "#d1d5db";
    });

    mediaDropzone.addEventListener("drop", function (e) {
      e.preventDefault();
      this.style.backgroundColor = "#f9fafb";
      this.style.borderColor = "#d1d5db";

      if (e.dataTransfer.files.length > 0) {
        validateAndProcessDroppedFiles(e.dataTransfer.files, imageInput);
      }
    });
  }
}
function updateTitleCharCounter() {
  const postTitle = document.getElementById("postTitle");
  const titleCharCounter = document.getElementById("titleCharCounter");
  if (!postTitle || !titleCharCounter) return;

  const count = postTitle.value.length;
  titleCharCounter.textContent = `${count}/50`;

  if (count > 40) {
    titleCharCounter.style.color = "#f59e0b"; // Amber for approaching limit
  } else {
    titleCharCounter.style.color = "#6b7280"; // Normal color
  }
}

function updateQuillCharCounter() {
  const postContentCharCounter = document.getElementById(
    "postContentCharCounter",
  );
  const addTagsPage = document.getElementById("AddTagsPage");

  if (
    !quill ||
    !postContentCharCounter ||
    (addTagsPage && addTagsPage.classList.contains("d-none"))
  ) {
    return;
  }

  const text = quill.getText().trim();
  const count = text.length;

  // Choose key based on pluralization
  const key = count === 1 ? "countChars" : "countCharsPlural";
  const countText = I18n.t(key, [String(count)]);

  if (count > 0 && count <= 130) {
    postContentCharCounter.innerHTML = `${countText} <span style="color: #10b981; font-weight: 500;">(background eligible)</span>`;
    postContentCharCounter.style.color = "#6b7280";
  } else {
    postContentCharCounter.textContent = countText;
    if (count > 500) {
      postContentCharCounter.style.color = "#f59e0b";
    } else {
      postContentCharCounter.style.color = "#6b7280";
    }
  }
}

// --- END: New Character Counter Logic ---
// This function should be called from the MediaDropzone drop event handler
function validateAndProcessDroppedFiles(files, imageInput) {
  // Create a new DataTransfer object to hold valid files
  const dataTransfer = new DataTransfer();
  let invalidFilesFound = false;

  // Filter files to only include valid types
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const isImage = file.type.startsWith("image/");
    const isValidVideo = ["video/mp4", "video/webm", "audio/mp3"].includes(
      file.type,
    );

    if (isImage || isValidVideo) {
      dataTransfer.items.add(file);
    } else {
      invalidFilesFound = true;
    }
  }

  // If we have any valid files, set them to the input and trigger change
  if (dataTransfer.files.length > 0) {
    imageInput.files = dataTransfer.files;
    imageInput.dispatchEvent(new Event("change"));
  }

  // Show warning if any invalid files were found
  if (invalidFilesFound) {
    alert(
      "Some files were skipped. Only images and videos (mp4, webm) or audio (mp3) files are allowed.",
    );
  } else if (dataTransfer.files.length === 0) {
    alert(
      "No valid files found. Only images and videos (mp4, webm) or audio (mp3) files are allowed.",
    );
  }
}
// Add this to your document ready or initialization code
document.addEventListener("DOMContentLoaded", function () {
  // Initialize Add Tags Page enhancements
  initAddTagsPageEnhancements();

  // Override existing color button click handlers to update preview
  document.querySelectorAll(".color-button").forEach((button) => {
    const originalClickHandler = button.onclick;
    button.onclick = function (event) {
      if (originalClickHandler) {
        originalClickHandler.call(this, event);
      }
      // Update preview after color selection
      // setTimeout(previewRegularPost, 100);
    };
  });
});

// Function to toggle comment settings visibility based on posting method
function toggleCommentSettingsVisibility() {
  // Get the selected posting method
  const selectedMethod = document.querySelector(
    'input[name="postingMethod"]:checked',
  ).value;

  // Get the comment settings section
  const commentSettingsSection = document.querySelector(
    ".form-section:has(.comment-options)",
  );

  // Show comment settings only if popup method is selected
  if (selectedMethod === "popup") {
    commentSettingsSection.style.display = "block";
  } else {
    commentSettingsSection.style.display = "none";
  }
}

// Add event listeners to all posting method radio buttons
document.querySelectorAll('input[name="postingMethod"]').forEach((radio) => {
  radio.addEventListener("change", toggleCommentSettingsVisibility);
});

// Call the function on page load to set initial state
document.addEventListener("DOMContentLoaded", function () {
  loadQuickPostGroups();
  // Run after a slight delay to ensure all DOM elements are loaded
  setTimeout(toggleCommentSettingsVisibility, 100);
});

// Also run when the scheduler tab is clicked
document.getElementById("SchedulerBTN").addEventListener("click", function () {
  // Run after a slight delay to ensure all DOM elements are loaded
  setTimeout(toggleCommentSettingsVisibility, 300);
});

// popup.js

// --- Add near other UI element references ---
const aiEnhanceButton = document.getElementById("aiEnhanceButton");
const aiGenerateButton = document.getElementById("aiGenerateButton");
const aiLoadingIndicator = document.getElementById("aiLoadingIndicator");
const aiErrorIndicator = document.getElementById("aiErrorIndicator");
const aiGenerateModal = document.getElementById("aiGenerateModal"); // Modal element
const aiPromptInput = document.getElementById("aiPrompt");
const aiToneSelect = document.getElementById("aiTone");
const submitAiGenerateButton = document.getElementById("submitAiGenerate");
const aiTargetAudienceInput = document.getElementById("aiTargetAudience");
const aiKeywordsInput = document.getElementById("aiKeywords");
const aiCTAInput = document.getElementById("aiCTA");
const aiIncludeEmojisCheckbox = document.getElementById("aiIncludeEmojis");
const aiUseSpintaxCheckbox = document.getElementById("aiUseSpintax");
const aiIncludeHashtagsCheckbox = document.getElementById("aiIncludeHashtags");

// ---
// ---

document.addEventListener("DOMContentLoaded", function () {
  // ... (your existing DOMContentLoaded setup, including 'quill' initialization)

  // --- AI Button Listeners for AddTagsPage (Template Editor) ---
  const templateAiEnhanceButton = document.getElementById("aiEnhanceButton");
  const templateAiGenerateButton = document.getElementById("aiGenerateButton");

  if (templateAiEnhanceButton) {
    templateAiEnhanceButton.addEventListener("click", handleAiEnhance);
  }
  if (templateAiGenerateButton) {
    templateAiGenerateButton.addEventListener("click", handleAiGenerate);
  }

  // --- AI Button Listeners for QuickPostPage ---
  const quickPostAiEnhanceButton = document.getElementById(
    "quickAiEnhanceButton",
  );
  const quickPostAiGenerateButton = document.getElementById(
    "quickAiGenerateButton",
  );

  if (quickPostAiEnhanceButton) {
    quickPostAiEnhanceButton.addEventListener("click", handleAiEnhance);
  }
  if (quickPostAiGenerateButton) {
    quickPostAiGenerateButton.addEventListener("click", handleAiGenerate);
  }

  // --- Shared AI Generation Modal Submit Button ---
  if (sharedSubmitAiGenerateButton) {
    sharedSubmitAiGenerateButton.addEventListener(
      "click",
      submitAiGenerationRequest,
    );
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "aiResult") {
      console.log("Received aiResult from background script:", message);
      handleAiResponse(message);
    }
  });

  // Initialize button states when AddTagsPage becomes active
  const addTagPageNavButton = document.getElementById("AddTagBTN"); // Assuming this is the button to show AddTagsPage
  if (addTagPageNavButton) {
    addTagPageNavButton.addEventListener("click", function () {
      // Delay to ensure page is visible and Quill might be ready
      setTimeout(updateAddTagsAiButtonStates, 200);
    });
  }
  // Also initialize if AddTagsPage is visible on load (e.g., when editing)
  const addTagsPageElement = document.getElementById("AddTagsPage");
  if (addTagsPageElement && !addTagsPageElement.classList.contains("d-none")) {
    setTimeout(updateAddTagsAiButtonStates, 200); // Delay for Quill
  }

  // Initialize button states for QuickPostPage when it becomes active
  const quickPostNavButton = document.getElementById("quickPostBTN");
  if (quickPostNavButton) {
    quickPostNavButton.addEventListener("click", function () {
      setTimeout(updateQuickPostAiButtonStates, 100);
    });
  }
  // Also initialize if QuickPostPage is visible on load
  const quickPostPageElement = document.getElementById("quickPostPage");
  if (
    quickPostPageElement &&
    !quickPostPageElement.classList.contains("d-none")
  ) {
    updateQuickPostAiButtonStates();
  }

  // Quill editor content change listener for AddTagsPage
  if (quill) {
    quill.on("text-change", function () {
      if (
        !document.getElementById("AddTagsPage").classList.contains("d-none")
      ) {
        updateAddTagsAiButtonStates();
      }
    });
  }

  // Textarea content change listener for QuickPostPage
  const quickContentTextarea = document.getElementById("quickPostContent");
  if (quickContentTextarea) {
    quickContentTextarea.addEventListener("input", function () {
      if (
        !document.getElementById("quickPostPage").classList.contains("d-none")
      ) {
        updateQuickPostAiButtonStates();
      }
    });
  }

  // Dismiss listeners for the shared modal
  document
    .querySelectorAll('#aiGenerateModalShared [data-dismiss="modal"]')
    .forEach((button) => {
      button.addEventListener("click", () => {
        if (sharedAiGenerateModal) {
          sharedAiGenerateModal.style.display = "none";
          sharedAiGenerateModal.classList.remove("show");
          const backdrop = document.querySelector(".modal-backdrop.fade.show");
          if (backdrop) backdrop.remove();
        }
      });
    });

  // ... (rest of your DOMContentLoaded code)
});
// ---

// --- ADD THESE NEW FUNCTIONS ---

function setAiLoading(isLoading) {
  const context = getActiveAiContext();
  if (!context) return;

  const { enhanceButton, generateButton, loadingIndicator, errorTextSpan } =
    context;
  const aiCardBody = loadingIndicator?.closest(".ai-card-minimal__body"); // Find the parent body

  if (isLoading) {
    if (enhanceButton) enhanceButton.disabled = true;
    if (generateButton) generateButton.disabled = true;
    if (aiCardBody) aiCardBody.style.opacity = "0.7";
    if (loadingIndicator) loadingIndicator.classList.remove("d-none");
    if (context.errorIndicator) context.errorIndicator.classList.add("d-none");
  } else {
    if (aiCardBody) aiCardBody.style.opacity = "1";
    if (loadingIndicator) loadingIndicator.classList.add("d-none");
    // Re-evaluate button states after loading finishes
    if (context.page === "AddTagsPage") {
      updateAddTagsAiButtonStates();
    } else if (context.page === "QuickPostPage") {
      updateQuickPostAiButtonStates();
    }
  }
}

function showAiError(message) {
  const context = getActiveAiContext();
  if (!context || !context.errorIndicator || !context.errorTextSpan) return;

  context.errorTextSpan.textContent = message; // Set text on the specific span
  context.errorIndicator.classList.remove("d-none");
  setAiLoading(false); // Ensure loading indicator is off for the current context
}

// in popup.js

// 1. ACTION: Replace handleAiEnhance
function handleAiEnhance() {
  const context = getActiveAiContext();
  if (!context) return;

  let contentToEnhance = "";
  if (context.isQuill && context.contentArea) {
    contentToEnhance = context.contentArea.root.innerHTML;
  } else if (!context.isQuill && context.contentArea) {
    contentToEnhance = context.contentArea.value;
  }

  if (!contentToEnhance.trim() || contentToEnhance.trim() === "<p><br></p>") {
    showAiError(I18n.t("modalInputRequired"));
    return;
  }

  // Instead of sending immediately, open the menu
  openAiEnhanceMenu(contentToEnhance);
}

// in popup.js
// ACTION: Replace openAiEnhanceMenu function

async function openAiEnhanceMenu(content) {
  const { licenseVerified } = await chrome.storage.local.get("licenseVerified");
  if (!licenseVerified) {
    showCustomModal(
      I18n.t("modalProFeature"),
      I18n.t("lockAiEnhance"), // FIX: Localized
      "alert",
      () => {
        openPricingModal();
      },
      null,
      I18n.t("btnUnlock"), // FIX: Localized
    );
    return;
  }

  const menuHtml = `
    <div class="ai-options-grid">
      <!-- Option 1: Conversion Boost -->
      <div class="ai-option-card" data-mode="conversion">
        <div class="ai-card-icon conversion"><i class="fa fa-rocket"></i></div>
        <div class="ai-card-content">
          <span class="ai-card-title">${I18n.t("enhBoostTitle")}</span>
          <span class="ai-card-desc">${I18n.t("enhBoostDesc")}</span>
        </div>
      </div>

      <!-- Option 2: Spintax Architect -->
      <div class="ai-option-card" data-mode="spintax">
        <div class="ai-card-icon spintax"><i class="fa fa-random"></i></div>
        <div class="ai-card-content">
          <span class="ai-card-title">${I18n.t("enhSpinTitle")}</span>
          <span class="ai-card-desc">${I18n.t("enhSpinDesc")}</span>
        </div>
      </div>

      <!-- Option 3: Grammar & Polish -->
      <div class="ai-option-card" data-mode="polish">
        <div class="ai-card-icon polish"><i class="fa fa-check-circle"></i></div>
        <div class="ai-card-content">
          <span class="ai-card-title">${I18n.t("enhPolishTitle")}</span>
          <span class="ai-card-desc">${I18n.t("enhPolishDesc")}</span>
        </div>
      </div>
    </div>
  `;

  showCustomModal(
    I18n.t("enhTitle"),
    menuHtml,
    "alert",
    null,
    null,
    I18n.t("btnCancel"),
  );
  // 3. Styling Fixes & Event Listeners
  setTimeout(() => {
    // A. Fix Button Style
    const confirmBtn = document.getElementById("customModalConfirmBtn");
    if (confirmBtn) {
      // Completely overwrite the class list
      // confirmBtn.className = "btn-visual-secondary";
      // Optional: Ensure it looks like a button if btn-visual-secondary doesn't include base button styles
      // confirmBtn.classList.add("btn");
    }

    // B. Attach Card Listeners
    const modalBody = document.getElementById("customModalMessage");
    if (!modalBody) return;

    const cards = modalBody.querySelectorAll(".ai-option-card");
    cards.forEach((card) => {
      card.addEventListener("click", () => {
        const mode = card.dataset.mode;
        triggerAiEnhancement(content, mode);
        hideCustomModal();
      });
    });
  }, 50);
}

function closeAiEnhanceMenu() {
  const modal = document.getElementById("aiEnhanceMenuModal");
  if (modal) {
    modal.classList.remove("show");
    setTimeout(() => modal.classList.add("d-none"), 250);
  }
}

function triggerAiEnhancement(content, mode) {
  setAiLoading(true);

  chrome.runtime.sendMessage({
    action: "aiEnhancePost",
    content: content,
    // FIX: Pass 'mode' inside an 'options' object, which is what background expects
    options: {
      mode: mode,
    },
  });
}

function handleAiGenerate() {
  // Reset shared modal fields
  if (sharedAiPromptInput) sharedAiPromptInput.value = "";
  if (sharedAiToneSelect) sharedAiToneSelect.value = "friendly and engaging";
  if (sharedAiTargetAudienceInput) sharedAiTargetAudienceInput.value = "";
  if (sharedAiKeywordsInput) sharedAiKeywordsInput.value = "";
  if (sharedAiCTAInput) sharedAiCTAInput.value = "";
  if (sharedAiIncludeEmojisCheckbox)
    sharedAiIncludeEmojisCheckbox.checked = true;
  if (sharedAiUseSpintaxCheckbox) sharedAiUseSpintaxCheckbox.checked = false;
  if (sharedAiIncludeHashtagsCheckbox)
    sharedAiIncludeHashtagsCheckbox.checked = false;

  // Show the shared modal
  if (sharedAiGenerateModal) {
    sharedAiGenerateModal.style.display = "block";
    sharedAiGenerateModal.classList.add("show");
    // Create and append backdrop manually
    let backdrop = document.querySelector(".modal-backdrop.fade.show");
    if (!backdrop) {
      // Create backdrop only if it doesn't exist
      backdrop = document.createElement("div");
      backdrop.className = "modal-backdrop fade show";
      document.body.appendChild(backdrop);
    }
  } else {
    console.error("Shared AI Generate Modal not found");
  }
}
// --- Modify submitAiGenerationRequest ---
async function submitAiGenerationRequest() {
  const prompt = sharedAiPromptInput.value.trim();
  const tone = sharedAiToneSelect.value;
  const targetAudience = sharedAiTargetAudienceInput.value.trim();
  const keywords = sharedAiKeywordsInput.value.trim();
  const callToAction = sharedAiCTAInput.value.trim();
  const includeEmojis = sharedAiIncludeEmojisCheckbox.checked;
  const useSpintax = sharedAiUseSpintaxCheckbox.checked;
  const includeHashtags = sharedAiIncludeHashtagsCheckbox.checked;
  const { licenseVerified } = await chrome.storage.local.get("licenseVerified");
  if (!licenseVerified) {
    // Close the generation modal so the pricing modal is visible
    if (sharedAiGenerateModal) {
      sharedAiGenerateModal.classList.remove("show");
      setTimeout(() => (sharedAiGenerateModal.style.display = "none"), 150);
      document.querySelector(".modal-backdrop")?.remove();
    }

    showCustomModal(
      I18n.t("modalProFeature"),
      I18n.t("lockAiGen"), // FIX: Localized
      "alert",
      () => {
        openPricingModal();
      },
      null,
      I18n.t("btnUnlock"), // FIX: Localized
    );
    return;
  }
  if (!prompt) {
    showCustomModal(
      "Input Required",
      "Please enter the main goal or topic for the AI-generated post.",
    );
    sharedAiPromptInput.focus();
    return;
  }

  // Hide shared modal
  if (sharedAiGenerateModal) {
    sharedAiGenerateModal.style.display = "none";
    sharedAiGenerateModal.classList.remove("show");
    const backdrop = document.querySelector(".modal-backdrop.fade.show");
    if (backdrop) backdrop.remove();
  }

  const context = getActiveAiContext(); // Determine which page's AI indicators to use
  if (context && context.errorIndicator) {
    context.errorIndicator.classList.add("d-none"); // Hide previous errors for the active context
  }
  setAiLoading(true); // This will use the active context's loading indicators

  const options = {
    tone: tone,
    targetAudience: targetAudience || null,
    keywords: keywords || null,
    callToAction: callToAction || null,
    includeEmojis: includeEmojis,
    useSpintax: useSpintax,
    includeHashtags: includeHashtags,
  };

  chrome.runtime.sendMessage(
    { action: "aiGeneratePost", prompt: prompt, options: options },
    (response) => {
      if (chrome.runtime.lastError) {
        const errorMessage =
          chrome.runtime.lastError.message ||
          JSON.stringify(chrome.runtime.lastError);
        console.error("Error sending generate message:", errorMessage);

        if (
          chrome.runtime.lastError.message && // Ensure message is not null/undefined
          chrome.runtime.lastError.message.includes(
            "The message port closed before a response was received.",
          )
        ) {
          console.log(
            "Specific error: Port closed. Setting AI loading to true.",
          );
          setAiLoading(true); // This will use the active context's loading indicators
        } else {
          // Handle other errors or if the message doesn't match
          showAiError("Could not communicate with AI service.");
          // setAiLoading(false) is called by showAiError
        }

        // setAiLoading(false) is called by showAiError
      }
      // Result handled by message listener
    },
  );
}

function handleAiResponse(message) {
  setAiLoading(false); // This will correctly use the active context

  const context = getActiveAiContext();
  if (!context || !context.contentArea) {
    showAiError("Editor or content area not available to display result.");
    return;
  }

  if (message.success && message.content) {
    if (context.isQuill) {
      // Quill editor for AddTagsPage
      try {
        context.contentArea.deleteText(
          0,
          context.contentArea.getLength(),
          Quill.sources.SILENT,
        );
        context.contentArea.clipboard.dangerouslyPasteHTML(
          0,
          message.content,
          Quill.sources.USER,
        );
        context.contentArea.setSelection(
          context.contentArea.getLength(),
          0,
          Quill.sources.SILENT,
        );
        context.contentArea.emitter.emit(
          "text-change",
          context.contentArea.getContents(),
          context.contentArea.getContents(-1),
          Quill.sources.USER,
        );
      } catch (e) {
        console.error("Error setting Quill content with HTML:", e);
        showAiError("Failed to update editor content.");
        // Fallback for Quill if HTML paste fails
        try {
          const plainText = convertAiHtmlToTextareaFormat(message.content);
          context.contentArea.setText(plainText);
          context.contentArea.setSelection(
            context.contentArea.getLength(),
            Quill.sources.SILENT,
          );
          context.contentArea.emitter.emit(
            "text-change",
            context.contentArea.getContents(),
            context.contentArea.getContents(-1),
            Quill.sources.USER,
          );
        } catch (textErr) {
          console.error("Quill Fallback to setText also failed:", textErr);
        }
      }
    } else {
      // Textarea for QuickPostPage
      const plainTextForTextarea = convertAiHtmlToTextareaFormat(
        message.content,
      );
      context.contentArea.value = plainTextForTextarea;
      context.contentArea.dispatchEvent(new Event("input")); // For char counter
      updateQuickPostButton(); // Update main quick post button state
      updateQuickPostAiButtonStates(); // Update AI buttons for quick post page
    }
  } else {
    console.error("AI processing failed:", message.error);
    showAiError(message.error || "Unknown AI error occurred.");
  }
}

// --- END OF NEW FUNCTIONS ---

// Add this to better manage event listeners

function addSafeListener(element, event, handler) {
  if (!element) return;

  element.addEventListener(event, handler);
  eventListeners.push({ element, event, handler });
}

function removeAllListeners() {
  eventListeners.forEach(({ element, event, handler }) => {
    if (element) {
      element.removeEventListener(event, handler);
    }
  });
  eventListeners.length = 0;
}

// Add a listener for extension context invalidation
chrome.runtime.onSuspend.addListener(() => {
  removeAllListeners();
});

function closeElegantRatingModal() {
  const modal = document.getElementById("elegantRatingModal");
  if (!modal) return; // Exit if modal doesn't exist

  const ratingSection = document.getElementById("ratingContentSection");
  const reviewSection = document.getElementById("publicReviewRequestSection");
  const feedbackSection = document.getElementById("feedbackRequestSection");

  if (modal.classList.contains("show")) {
    console.log("[CloseModal] Closing modal...");
    modal.classList.remove("show");

    const handler = () => {
      if (!modal.classList.contains("d-none")) {
        // Check before adding d-none again
        modal.classList.add("d-none");
        console.log("[CloseModal] Modal hidden and d-none added.");

        // Reset UI elements only if they exist
        ratingSection?.classList.remove("d-none");
        reviewSection?.classList.add("d-none");
        feedbackSection?.classList.add("d-none");

        const starsContainer = ratingSection?.querySelector(
          "#elegantStarRatingContainer",
        );
        const stars = starsContainer?.querySelectorAll(".elegant-star");
        stars?.forEach((s) => {
          s.innerHTML = "☆";
          s.classList.remove("filled");
          s.style.color = "";
        });

        const hiddenInput = ratingSection?.querySelector(
          "#elegantHiddenRatingValue",
        );
        if (hiddenInput) hiddenInput.value = "0";

        const submitBtn = ratingSection?.querySelector(
          "#elegantSubmitRatingBtn",
        );
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = "Submit Rating";
        }
        ratingSection
          ?.querySelector("#elegantRatingError")
          ?.classList.add("d-none");
      }
      modal.removeEventListener("transitionend", handler); // Clean up listener *after* execution
    };

    // Use transitionend for smooth closing
    modal.removeEventListener("transitionend", handler); // Remove previous listener first
    modal.addEventListener("transitionend", handler, { once: true });

    // Fallback timeout
    setTimeout(() => {
      if (
        modal &&
        !modal.classList.contains("d-none") &&
        modal.classList.contains("show")
      ) {
        // Check if still shown after timeout (transitionend might not have fired)
        console.warn("[CloseModal] transitionend fallback triggered.");
        handler(); // Force execution
      }
    }, 350); // Should be slightly longer than CSS transition duration (e.g., 300ms)
  } else {
    console.log("[CloseModal] Modal not shown or already closing.");
    // Ensure d-none is present if somehow stuck without 'show'
    if (!modal.classList.contains("d-none")) {
      modal.classList.add("d-none");
    }
  }
}

const feedbackRequestSection = document.getElementById(
  "feedbackRequestSection",
);
const goToFeedbackFormBtn = document.getElementById("goToFeedbackFormBtn");
const noThanksFeedbackBtn = document.getElementById("noThanksFeedbackBtn");
const feedbackRewardText = document.getElementById("feedbackRewardText"); // Span for reward text (1-3 stars)
const publicReviewRewardText = document.getElementById(
  "publicReviewRewardText",
); // Span for reward text (4-5 stars)
// REPLACE the existing setupElegantRatingListeners function in popup.js

async function checkAndShowIncentiveRating() {
  try {
    const {
      internalRatingGiven,
      ratingSnoozeUntil, // New Key: Timestamp to snooze until
      successfulRunsCount, // New Key: Track success over time
      postingSummary, // Check the just-finished run
    } = await chrome.storage.local.get([
      "internalRatingGiven",
      "ratingSnoozeUntil",
      "successfulRunsCount",
      "postingSummary",
    ]);

    // 1. Exit if already rated
    if (internalRatingGiven) return;

    // 2. Exit if snoozed
    if (ratingSnoozeUntil && Date.now() < ratingSnoozeUntil) return;

    // 3. Only show if the CURRENT run was successful
    // We don't want to ask for a review if they just failed a post.
    if (postingSummary && postingSummary.failed > 0) return;

    // 4. Update Success Counter
    const currentSuccessCount = (successfulRunsCount || 0) + 1;
    await chrome.storage.local.set({
      successfulRunsCount: currentSuccessCount,
    });

    // 5. Trigger Logic
    // Show on the 3rd successful run, or the 10th, etc.
    // This ensures they have actually received value before we ask.
    if (
      currentSuccessCount === 3 ||
      currentSuccessCount === 10 ||
      currentSuccessCount === 25
    ) {
      console.log(
        `User has ${currentSuccessCount} successful runs. Showing rating modal.`,
      );
      showAndSetupRatingModal();
    }
  } catch (error) {
    console.error("Error in checkAndShowIncentiveRating:", error);
  }
}
// REPLACE the entire showAndSetupRatingModal function in popup.js

function showAndSetupRatingModal() {
  const modal = document.getElementById("elegantRatingModal");
  if (!modal) return;

  // Cleanup old listeners
  const cleanModal = modal.cloneNode(true);
  modal.parentNode.replaceChild(cleanModal, modal);

  const newModal = document.getElementById("elegantRatingModal");
  const ratingSection = newModal.querySelector("#ratingContentSection");
  const reviewSection = newModal.querySelector("#publicReviewRequestSection");
  const feedbackSection = newModal.querySelector("#feedbackRequestSection");
  const stars = newModal.querySelectorAll(".elegant-star");
  const hiddenInput = newModal.querySelector("#elegantHiddenRatingValue");
  const submitBtn = newModal.querySelector("#elegantSubmitRatingBtn");
  const errorDiv = newModal.querySelector("#elegantRatingError");
  const maybeLaterBtn = newModal.querySelector("#elegantMaybeLaterBtn");
  const closeBtn = newModal.querySelector("#closeElegantModalBtn");

  const goToFeedbackFormBtn = newModal.querySelector("#goToFeedbackFormBtn");
  const goToStoreAndGetPostsBtn = newModal.querySelector(
    "#goToStoreAndGetPostsBtn",
  );
  const noThanksFeedbackBtn = newModal.querySelector("#noThanksFeedbackBtn");
  const maybeLaterPublicBtn = newModal.querySelector("#maybeLaterPublicBtn");

  // --- LOCALIZATION UPDATE ---
  // Main Rating
  newModal.querySelector(".elegant-modal-title").textContent =
    I18n.t("rateTitle");
  newModal.querySelector(".elegant-modal-text").textContent =
    I18n.t("rateText");
  maybeLaterBtn.textContent = I18n.t("rateBtnLater");
  submitBtn.textContent = I18n.t("rateBtnSubmit");
  errorDiv.textContent = I18n.t("rateErr");

  // Feedback (Bad Rating)
  feedbackSection.querySelector(".elegant-modal-title").textContent =
    I18n.t("rateBadTitle");
  const fbTextP = feedbackSection.querySelector(".elegant-modal-text");
  fbTextP.innerHTML = `${I18n.t(
    "rateBadText",
  )} <span id="feedbackRewardText" class="d-none" style="display: block; margin-top: 8px; font-weight: 500; color: var(--tut-success-color);">${I18n.t(
    "fbReward",
  )}</span>`;
  goToFeedbackFormBtn.textContent = I18n.t("fbBtn");
  noThanksFeedbackBtn.textContent = I18n.t("btnNoThanks");

  // Review (Good Rating)
  reviewSection.querySelector(".elegant-modal-title").textContent =
    I18n.t("rateGoodTitle");
  const revTextP = reviewSection.querySelector(".elegant-modal-text");
  revTextP.innerHTML = `${I18n.t(
    "revText",
  )} <span id="publicReviewRewardText" class="d-none" style="display: block; margin-top: 8px; font-weight: 500; color: var(--tut-success-color);">${I18n.t(
    "fbReward",
  )}</span>`;
  goToStoreAndGetPostsBtn.textContent = I18n.t("revBtn");
  maybeLaterPublicBtn.textContent = I18n.t("btnNoThanks");

  // --- RESET UI ---
  ratingSection.classList.remove("d-none");
  reviewSection.classList.add("d-none");
  feedbackSection.classList.add("d-none");
  hiddenInput.value = "0";
  submitBtn.disabled = true;
  errorDiv.classList.add("d-none");
  stars.forEach((s) => {
    s.innerHTML = "☆";
    s.classList.remove("filled");
  });

  // --- LISTENERS ---
  stars.forEach((star) => {
    star.addEventListener("click", () => {
      const value = parseInt(star.dataset.value, 10);
      hiddenInput.value = value;
      stars.forEach((s) => {
        s.innerHTML = parseInt(s.dataset.value) <= value ? "★" : "☆";
        s.classList.toggle("filled", parseInt(s.dataset.value) <= value);
      });
      submitBtn.disabled = false;
      errorDiv.classList.add("d-none");
    });
  });

  submitBtn.addEventListener("click", async () => {
    const rating = parseInt(hiddenInput.value);
    if (rating === 0) {
      errorDiv.classList.remove("d-none");
      return;
    }
    submitBtn.disabled = true;
    submitBtn.textContent = I18n.t("wizBtnAnalyzing");
    await chrome.storage.local.set({ internalRatingGiven: true });

    const { licenseVerified } =
      await chrome.storage.local.get("licenseVerified");
    const isTrialUser = !licenseVerified;

    ratingSection.classList.add("d-none");
    if (rating <= 3) {
      feedbackSection.classList.remove("d-none");
      const rewardSpan = feedbackSection.querySelector("#feedbackRewardText");
      if (rewardSpan) rewardSpan.classList.toggle("d-none", !isTrialUser);
    } else {
      reviewSection.classList.remove("d-none");
      const rewardSpan = reviewSection.querySelector("#publicReviewRewardText");
      if (rewardSpan) rewardSpan.classList.toggle("d-none", !isTrialUser);
    }
  });

  maybeLaterBtn.addEventListener("click", async () => {
    const snoozeTime = Date.now() + 7 * 24 * 60 * 60 * 1000;
    await chrome.storage.local.set({ ratingSnoozeUntil: snoozeTime });
    closeElegantRatingModal();
  });

  closeBtn.addEventListener("click", closeElegantRatingModal);
  noThanksFeedbackBtn.addEventListener("click", closeElegantRatingModal);
  maybeLaterPublicBtn.addEventListener("click", closeElegantRatingModal);

  goToFeedbackFormBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    // Standalone mode: no external feedback links
    closeElegantRatingModal();
    showCustomModal(
      "Feedback disabled",
      "Feedback is disabled in this standalone build.",
      "alert",
    );
  });

  goToStoreAndGetPostsBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const { licenseVerified, freePostsRemaining: current } =
      await chrome.storage.local.get(["licenseVerified", "freePostsRemaining"]);
    if (!licenseVerified) {
      await chrome.storage.local.set({
        freePostsRemaining: (current || 0) + 3,
      });
      updateTierUI();
    }
    // No external links in standalone mode
    closeElegantRatingModal();
  });

  newModal.classList.remove("d-none");
  setTimeout(() => newModal.classList.add("show"), 10);
}
// --- Tutorial Variables ---
let currentTutorialStep = 1;
const totalTutorialSteps = 6;
// *** UPDATE SELECTORS ***
const tutorialModal = document.getElementById("tut-modal-overlay"); // Use overlay ID
const tutorialSteps = tutorialModal?.querySelectorAll(".tut-step"); // Use step class
const tutorialNextBtns = tutorialModal?.querySelectorAll(".tut-btn-next"); // Use button class
const tutorialPrevBtns = tutorialModal?.querySelectorAll(".tut-btn-prev"); // Use button class
const tutorialFinishBtn = tutorialModal?.querySelector(".tut-btn-finish"); // Use button class
const tutorialCloseBtn = tutorialModal?.querySelector("#tut-modal-close"); // Use close button ID

// ... (keep existing functions like LoadTags, LoadGroups, etc.) ...

// --- Tutorial Functions ---

function showWelcomeTutorial() {
  // *** UPDATE References and Classes ***
  if (!tutorialModal || !tutorialSteps) {
    console.warn("Welcome tutorial modal elements not found.");
    return;
  }
  console.log("Showing welcome tutorial");
  currentTutorialStep = 1;
  showTutorialStep(currentTutorialStep); // Show first step
  tutorialModal.classList.remove("d-none"); // Make overlay visible
  setTimeout(() => tutorialModal.classList.add("show"), 10); // Trigger transition

  // Add listeners only once
  if (!tutorialModal.dataset.listenersAdded) {
    tutorialNextBtns?.forEach((btn) =>
      addSafeListener(btn, "click", nextTutorialStep),
    );
    tutorialPrevBtns?.forEach((btn) =>
      addSafeListener(btn, "click", prevTutorialStep),
    );
    if (tutorialFinishBtn)
      addSafeListener(tutorialFinishBtn, "click", finishTutorial);
    if (tutorialCloseBtn)
      addSafeListener(tutorialCloseBtn, "click", finishTutorial); // Finish if closed manually
    tutorialModal.dataset.listenersAdded = "true";
  }
}

function showTutorialStep(stepIndex) {
  if (!tutorialSteps) return;

  // 1. Hide all steps first
  tutorialSteps.forEach((step) => {
    step.classList.remove("tut-step-visible");
  });

  // 2. Find and show the current step
  const activeStep = Array.from(tutorialSteps).find(
    (step) => parseInt(step.dataset.step) === stepIndex,
  );

  if (activeStep) {
    activeStep.classList.add("tut-step-visible");
  }

  // 3. Handle Visual Highlighting of UI Elements
  removeHighlights(); // Remove old highlights

  // // Map steps to element IDs to highlight
  // const highlights = {
  //   2: "mainNavTemplatesBtn", // Templates Tab
  //   3: "mainNavPostBtn", // Compose Tab
  //   4: "campaignsBTN", // Campaigns Tab
  //   5: "historyBTN", // History Tab
  // };

  // if (highlights[stepIndex]) {
  //   const el = document.getElementById(highlights[stepIndex]);
  //   if (el) {
  //     el.classList.add("tut-highlight");
  //     // Optional: Auto-click the tab to show the user that page
  //     // el.click();
  //   }
  // }
}

function removeHighlights() {
  // *** Use custom highlight class ***
  document.querySelectorAll(".tut-highlight").forEach((el) => {
    el.classList.remove("tut-highlight");
  });
}

function nextTutorialStep() {
  if (currentTutorialStep < totalTutorialSteps) {
    currentTutorialStep++;
    showTutorialStep(currentTutorialStep);
  }
}

function prevTutorialStep() {
  if (currentTutorialStep > 1) {
    currentTutorialStep--;
    showTutorialStep(currentTutorialStep);
  }
}

function finishTutorial() {
  if (!tutorialModal) return;
  console.log("Finishing tutorial");
  removeHighlights();
  tutorialModal.classList.remove("show"); // Hide overlay
  // d-none is added after transition ends via CSS
  setTimeout(() => tutorialModal.classList.add("d-none"), 300);

  // Mark tutorial as shown
  chrome.storage.local.set({ tutorialShown2: true }, () => {
    console.log("Tutorial marked as shown.");
  });
}

// ... existing UI elements ...
const quickImportPostButton = document.getElementById("quickImportPostButton");
const quickImportPostModal = document.getElementById("quickImportPostModal"); // The modal itself
const savedPostTemplateList = document.getElementById("savedPostTemplateList");
const quickImportSearchInput = document.getElementById(
  "quickImportSearchInput",
);
// ...

function showQuickImportPostModal() {
  // Re-fetch elements to ensure we have valid references
  const modal = document.getElementById("quickImportPostModal");
  const listContainer = document.getElementById("savedPostTemplateList");
  const searchInput = document.getElementById("quickImportSearchInput");

  if (!modal || !listContainer) {
    console.error(
      "Quick Import Error: Modal or List container not found in DOM.",
    );
    // Fallback: Try to alert the user so they know something is wrong
    alert("Error: Could not open import window. Please reload the extension.");
    return;
  }

  // Clear search
  if (searchInput) searchInput.value = "";

  // Populate data
  populateSavedPostTemplatesForImport();

  // Show Modal (Robust Method)
  // 1. Accessibility fix
  modal.removeAttribute("aria-hidden");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("role", "dialog");

  // 2. Display logic
  if (typeof $ !== "undefined" && $(modal).length > 0) {
    $(modal).modal("show");
  } else {
    // Manual fallback
    modal.style.display = "block";
    setTimeout(() => modal.classList.add("show"), 10);

    // Ensure backdrop exists
    let backdrop = document.querySelector(".modal-backdrop.fade.show");
    if (!backdrop) {
      backdrop = document.createElement("div");
      backdrop.className = "modal-backdrop fade show";
      document.body.appendChild(backdrop);
    }

    // Close on backdrop click
    modal.onclick = (e) => {
      if (e.target === modal) closeQuickImportPostModal();
    };
  }
}

function closeQuickImportPostModal() {
  if (!quickImportPostModal) return;

  // --- ARIA FIX ---
  // Restore aria-hidden when closing so screen readers skip it.
  quickImportPostModal.setAttribute("aria-hidden", "true");
  quickImportPostModal.removeAttribute("aria-modal");

  if (typeof $ !== "undefined" && $(quickImportPostModal).length > 0) {
    $(quickImportPostModal).modal("hide");
  } else {
    // Manual toggle fallback
    quickImportPostModal.classList.remove("show");

    // Wait for CSS transition to finish before setting display:none
    setTimeout(() => {
      quickImportPostModal.style.display = "none";
      const backdrop = document.querySelector(".modal-backdrop");
      if (backdrop) backdrop.remove();
    }, 150);
  }
}

function populateSavedPostTemplatesForImport() {
  const listContainer = document.getElementById("savedPostTemplateList");
  if (!listContainer) return;

  // Show loading state
  listContainer.innerHTML =
    '<div class="text-center p-3"><i class="fa fa-spinner fa-spin"></i> Loading...</div>';

  chrome.storage.local.get(["tags"], (result) => {
    const savedTags = result.tags || [];
    listContainer.innerHTML = ""; // Clear loading

    if (savedTags.length === 0) {
      listContainer.innerHTML = `<p class="text-center text-muted p-3">${I18n.t(
        "lblNoSavedTemp",
      )}</p>`;
      return;
    }

    // Iterate safely
    savedTags.forEach((tag, index) => {
      try {
        const listItem = document.createElement("div");
        listItem.className = "list-group-item quick-import-template-item mb-2";
        // Store search text in dataset for fast filtering
        listItem.dataset.searchText = (tag.title || "").toLowerCase();

        const rawText = tag.text || "";
        let variations = [];

        // 1. Parse Variations (Defensive)
        if (rawText) {
          const isWrapped =
            rawText.trim().startsWith("{") &&
            rawText.trim().endsWith("}") &&
            rawText.includes("|");
          if (isWrapped) {
            const innerContent = rawText.trim().slice(1, -1);
            // Use parseSpintaxString if available, otherwise simple split
            if (typeof parseSpintaxString === "function") {
              variations = parseSpintaxString(innerContent);
            } else {
              variations = innerContent.split("|");
            }
          } else {
            variations = [rawText];
          }
        }

        // Filter empty
        variations = variations.filter((v) => v && v.trim().length > 0);
        if (variations.length === 0) variations = ["(Empty Template)"];

        // 2. Build HTML
        let html = `
          <div class="import-item-container">
            <div style="overflow:hidden;">
                <div style="font-weight:600; color:#1f2937; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                    ${tag.title || `Template ${index + 1}`}
                </div>
                <div style="font-size:11px; color:#6b7280;">
                    ${variations.length} variation${
                      variations.length !== 1 ? "s" : ""
                    } • ${tag.images ? tag.images.length : 0} media
                </div>
            </div>
        `;

        // Add Variation Chips
        if (variations.length > 1) {
          html += `<div class="variation-chips" style="margin-top:4px;">`;
          variations.forEach((v, i) => {
            const letter = String.fromCharCode(65 + i);
            // Prevent too many chips
            if (i < 4) {
              html += `<span class="variation-chip" data-var-idx="${i}">Var ${letter}</span>`;
            }
          });
          if (variations.length > 4)
            html += `<span style="font-size:10px; color:#999;">+${
              variations.length - 4
            }</span>`;
          html += `</div>`;
        }

        html += `</div>`; // Close container
        listItem.innerHTML = html;

        // 3. Event Listeners

        // A. Chip Click (Specific Variation)
        listItem.querySelectorAll(".variation-chip").forEach((chip) => {
          chip.addEventListener("click", (e) => {
            e.stopPropagation();
            const varIdx = parseInt(chip.dataset.varIdx, 10);
            importContentToQuickPost(tag, variations[varIdx]);
            closeQuickImportPostModal();
          });
        });

        // B. Row Click (Default/First Variation)
        listItem.addEventListener("click", (e) => {
          importContentToQuickPost(tag, variations[0]);
          closeQuickImportPostModal();
        });

        listContainer.appendChild(listItem);
      } catch (err) {
        console.error("Error rendering template item:", err, tag);
        // Continue loop even if one item fails
      }
    });
  });
}

// Ensure the filter function works with the new dataset approach
function filterSavedPostTemplatesForImport() {
  const input = document.getElementById("quickImportSearchInput");
  const listContainer = document.getElementById("savedPostTemplateList");

  if (!input || !listContainer) return;

  const searchTerm = input.value.toLowerCase();
  const items = listContainer.querySelectorAll(".quick-import-template-item");

  items.forEach((item) => {
    // Use the dataset we added for faster lookups, fallback to textContent
    const text = item.dataset.searchText || item.textContent.toLowerCase();
    item.style.display = text.includes(searchTerm) ? "" : "none";
  });
}

// in popup.js
// ACTION: Replace the importContentToQuickPost function

function importContentToQuickPost(template, specificContentOverride = null) {
  if (!template || !quickPostQuill) {
    console.error(
      "Cannot import: Template data or Quick Post editor is not available.",
    );
    return;
  }

  // 1. Determine Text Content
  // If an override is provided (from a variation chip), use it.
  // Otherwise use the template's full text.
  let rawHtmlContent =
    specificContentOverride !== null
      ? specificContentOverride
      : template.text || "";

  // 2. Set Editor Content
  try {
    // Reset first to avoid appending
    quickPostQuill.setContents([]);
    quickPostQuill.root.innerHTML = rawHtmlContent;
  } catch (e) {
    console.error(
      "Error pasting HTML into Quick Post editor. Falling back to plain text.",
      e,
    );
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = rawHtmlContent;
    quickPostQuill.setText(tempDiv.textContent || "");
  }

  // 3. Import Media (Always import media from the parent template)
  quickMedia = [];
  if (template.images && Array.isArray(template.images)) {
    quickMedia = template.images.map((mediaItem) => ({ ...mediaItem }));
  }
  updateQuickMediaDisplay();

  // 4. Update UI State
  quickPostQuill.emitter.emit(
    "text-change",
    quickPostQuill.getContents(),
    quickPostQuill.getContents(-1),
    "user",
  );

  const length = quickPostQuill.getLength();
  quickPostQuill.setSelection(length, 0, "silent");
  quickPostQuill.focus();
}

// At the top with other UI element references
const quickAiEnhanceButton = document.getElementById("quickAiEnhanceButton");
const quickAiGenerateButton = document.getElementById("quickAiGenerateButton");
const quickAiLoadingIndicator = document.getElementById(
  "quickAiLoadingIndicator",
);
const quickAiErrorIndicator = document.getElementById("quickAiErrorIndicator");
const quickAiErrorText = document.getElementById("quickAiErrorText"); // Specific error text span

// Shared AI Generation Modal and its elements
const sharedAiGenerateModal = document.getElementById("aiGenerateModalShared");
const sharedAiPromptInput = document.getElementById("aiPromptShared");
const sharedAiToneSelect = document.getElementById("aiToneShared");
const sharedSubmitAiGenerateButton = document.getElementById(
  "submitAiGenerateShared",
);
const sharedAiTargetAudienceInput = document.getElementById(
  "aiTargetAudienceShared",
);
const sharedAiKeywordsInput = document.getElementById("aiKeywordsShared");
const sharedAiCTAInput = document.getElementById("aiCTAShared");
const sharedAiIncludeEmojisCheckbox = document.getElementById(
  "aiIncludeEmojisShared",
);
const sharedAiUseSpintaxCheckbox =
  document.getElementById("aiUseSpintaxShared");
const sharedAiIncludeHashtagsCheckbox = document.getElementById(
  "aiIncludeHashtagsShared",
);

// Existing Quick Post elements
const quickPostContentTextarea = document.getElementById("quickPostContent"); // Ensure this is already defined

// in popup.js
// ACTION: Replace the `getActiveAiContext` function

function getActiveAiContext() {
  const addTagsPageElement = document.getElementById("AddTagsPage");
  const quickPostPageElement = document.getElementById("quickPostPage");

  if (addTagsPageElement && !addTagsPageElement.classList.contains("d-none")) {
    return {
      page: "AddTagsPage",
      enhanceButton: document.getElementById("aiEnhanceButton"),
      generateButton: document.getElementById("aiGenerateButton"),
      loadingIndicator: document.getElementById("aiLoadingIndicator"),
      errorIndicator: document.getElementById("aiErrorIndicator"),
      errorTextSpan: document
        .getElementById("aiErrorIndicator")
        ?.querySelector(".ai-error-text"),
      contentArea: quill, // Main Quill instance
      isQuill: true,
    };
  } else if (
    quickPostPageElement &&
    !quickPostPageElement.classList.contains("d-none")
  ) {
    return {
      page: "QuickPostPage",
      enhanceButton: document.getElementById("quickAiEnhanceButton"),
      generateButton: document.getElementById("quickAiGenerateButton"),
      loadingIndicator: document.getElementById("quickAiLoadingIndicator"),
      errorIndicator: document.getElementById("quickAiErrorIndicator"),
      errorTextSpan: document.getElementById("quickAiErrorText"),
      contentArea: quickPostQuill, // ** THIS IS THE FIX **
      isQuill: true, // ** THIS IS THE FIX **
    };
  }
  return null;
}

// Function to update AI button states on AddTagsPage (Template Editor)
function updateAddTagsAiButtonStates() {
  const enhanceButton = document.getElementById("aiEnhanceButton");
  const generateButton = document.getElementById("aiGenerateButton");
  const loadingIndicator = document.getElementById("aiLoadingIndicator");

  if (!enhanceButton || !generateButton || !loadingIndicator) return;

  const isLoading = !loadingIndicator.classList.contains("d-none");

  if (!isLoading) {
    // Only manage if not loading
    if (quill && quill.getText().trim().length > 0) {
      enhanceButton.disabled = false;
    } else {
      enhanceButton.disabled = true;
    }
    generateButton.disabled = false;
  }
  // If loading, setAiLoading(true) would have already disabled them.
}

// in popup.js
// ACTION: Replace the entire `updateQuickPostAiButtonStates` function with this definitive version.

function updateQuickPostAiButtonStates() {
  // Get all relevant UI elements for this page
  const enhanceButton = document.getElementById("quickAiEnhanceButton");
  const generateButton = document.getElementById("quickAiGenerateButton");
  const loadingIndicator = document.getElementById("quickAiLoadingIndicator");
  const quickPostBtn = document.getElementById("quickPostButton"); // The main "Post Now" button

  // Safety check to prevent errors if elements aren't found
  if (!enhanceButton || !generateButton || !loadingIndicator || !quickPostBtn) {
    return;
  }

  const isLoading = !loadingIndicator.classList.contains("d-none");

  // --- THIS IS THE DEFINITIVE FIX ---
  // We check for content directly from the `quickPostQuill` instance.
  const hasContent =
    quickPostQuill && quickPostQuill.getText().trim().length > 0;
  // --- END FIX ---

  const hasGroups = quickSelectedGroups.length > 0;

  // Logic for AI buttons
  if (!isLoading) {
    // The "Enhance" button should only be enabled if there is content.
    enhanceButton.disabled = !hasContent;
    // The "Generate" button should always be enabled (unless loading).
    generateButton.disabled = false;
  } else {
    // If loading, both buttons should be disabled.
    enhanceButton.disabled = true;
    generateButton.disabled = true;
  }

  // This also correctly updates the state of the main "Post Now" button.
  if (!validated && freePostsRemaining <= 0) {
    quickPostBtn.disabled = true;
  } else {
    // The "Post Now" button requires both content AND selected groups.
    quickPostBtn.disabled = !(hasContent && hasGroups);
  }
}

function convertAiHtmlToTextareaFormat(htmlContent) {
  if (!htmlContent) return "";

  // Create a temporary DOM element to parse the HTML
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = htmlContent;
  let plainTextContent = "";

  // Function to recursively extract text, preserving spintax and emojis,
  // and handling line breaks from <p> and <br>
  function extractTextFromNode(node, isFirstParagraphOfBlock) {
    let text = "";
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const tagName = node.tagName.toLowerCase();

      if (tagName === "p") {
        // Add one newline before <p> unless it's the very first element or follows another <p>
        // (this relies on the overall structure being processed linearly)
        if (
          !isFirstParagraphOfBlock &&
          plainTextContent.length > 0 &&
          !plainTextContent.endsWith("\n\n")
        ) {
          text += "\n"; // Ensure at least one newline before a new paragraph starts
        }
        for (let i = 0; i < node.childNodes.length; i++) {
          text += extractTextFromNode(node.childNodes[i], i === 0); // Pass true if it's the first child of this <p>
        }
        text += "\n\n"; // Add two newlines after each paragraph for spacing
      } else if (tagName === "br") {
        text += "\n";
      } else if (tagName === "ul" || tagName === "ol") {
        if (plainTextContent.length > 0 && !plainTextContent.endsWith("\n\n")) {
          text += "\n";
        }
        for (let i = 0; i < node.childNodes.length; i++) {
          const child = node.childNodes[i];
          if (
            child.nodeType === Node.ELEMENT_NODE &&
            child.tagName.toLowerCase() === "li"
          ) {
            text +=
              tagName === "ul"
                ? "• "
                : `${Array.from(node.children).indexOf(child) + 1}. `; // Bullet or number
            text += extractTextFromNode(child, true).trim(); // Extract text from <li>
            text += "\n"; // Newline after each list item
          }
        }
        text += "\n"; // Extra newline after the list
      }
      // For other inline elements like <strong>, <em>, spintax-containing spans, etc.,
      // just process their children. The textContent will naturally include their content.
      // Spintax like {A|B} should already be in text nodes.
      else {
        for (let i = 0; i < node.childNodes.length; i++) {
          text += extractTextFromNode(
            node.childNodes[i],
            isFirstParagraphOfBlock && i === 0,
          );
        }
      }
    }
    return text;
  }

  // Start extraction
  for (let i = 0; i < tempDiv.childNodes.length; i++) {
    plainTextContent += extractTextFromNode(tempDiv.childNodes[i], i === 0);
  }

  // Clean up excessive newlines:
  // 1. Replace 3 or more newlines with exactly two (for paragraph spacing)
  plainTextContent = plainTextContent.replace(/\n{3,}/g, "\n\n");
  // 2. Trim leading/trailing whitespace and newlines
  plainTextContent = plainTextContent.trim();

  return plainTextContent;
}

// ----- NEW Export Groups Function -----

// ----- MODIFIED Export Groups Function -----
function handleExportGroups() {
  chrome.storage.local.get(["groups"], (result) => {
    const currentGroups = result.groups || [];
    if (currentGroups.length === 0) {
      // MODIFICATION: Use custom modal
      showCustomModal("Export Groups", "No group collections to export.");
      return;
    }

    try {
      const jsonString = JSON.stringify(currentGroups, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "group_collections_export.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      console.log("Group collections exported successfully.");
      // Optional: Success message with custom modal
      // showCustomModal("Export Successful", "Group collections have been exported.");
    } catch (error) {
      console.error("Error exporting group collections:", error);
      // MODIFICATION: Use custom modal
      showCustomModal(
        "Export Error",
        "Failed to export group collections. See console for details.",
      );
    }
  });
}
// ----- NEW Import Groups Functionality -----

// Helper function to validate the structure of imported group collections
function isValidGroupCollectionsStructure(data) {
  if (!Array.isArray(data)) {
    console.error("Validation failed: Imported data is not an array.");
    return false;
  }

  for (const collection of data) {
    if (
      typeof collection !== "object" ||
      collection === null ||
      typeof collection.title !== "string" || // Title must be a string
      !Array.isArray(collection.links) // Links must be an array
    ) {
      console.error(
        "Validation failed: Invalid collection object structure.",
        collection,
      );
      return false;
    }

    for (const linkPair of collection.links) {
      if (
        !Array.isArray(linkPair) ||
        linkPair.length !== 2 || // Each link must be a pair
        typeof linkPair[0] !== "string" || // Link title (first element) must be a string
        typeof linkPair[1] !== "string" // Link URL (second element) must be a string
      ) {
        console.error(
          "Validation failed: Invalid link pair structure within a collection.",
          linkPair,
          "in collection titled:",
          collection.title,
        );
        return false;
      }
      // Optional: Add URL validation for linkPair[1] if needed
      // try { new URL(linkPair[1]); } catch (e) { console.warn("Invalid URL:", linkPair[1]); /* return false; */ }
    }
  }
  return true; // All checks passed
}

// --- START OF FILE popup.js ---
// (Keep all existing code above this point)

// ... (isValidGroupCollectionsStructure function remains the same) ...

async function handleImportGroupFile(event) {
  const file = event.target.files[0];
  if (!file) {
    return;
  }

  if (file.type !== "application/json") {
    // MODIFICATION: Use custom modal
    showCustomModal("Import Error", "Please select a valid JSON file (.json).");
    event.target.value = null;
    return;
  }

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const importedDataRaw = JSON.parse(e.target.result);

      if (!isValidGroupCollectionsStructure(importedDataRaw)) {
        // MODIFICATION: Use custom modal
        showCustomModal(
          "Import Error",
          "Invalid file format. The file does not contain valid group collections. Please ensure it's an array of objects, each with a 'title' (string) and 'links' (array of [title, url] string pairs).",
        );
        return;
      }

      const importedDataWithPrefix = importedDataRaw.map((collection) => ({
        ...collection,
        title: `imported - ${collection.title}`,
      }));

      // MODIFICATION: Use custom modal for confirmation
      showCustomModal(
        "Confirm Import",
        `${importedDataWithPrefix.length} group collection(s) will be imported and added to your existing collections. Their names will be prefixed with "imported -". Continue?`,
        "confirm",
        () => {
          // onConfirm callback
          chrome.storage.local.get(["groups"], (result) => {
            if (chrome.runtime.lastError) {
              console.error(
                "Error fetching existing groups:",
                chrome.runtime.lastError,
              );
              showCustomModal(
                "Import Error",
                "Could not fetch existing groups to import into. Please try again.",
              );
              return;
            }

            const existingGroups = result.groups || [];
            const combinedGroups = [
              ...existingGroups,
              ...importedDataWithPrefix,
            ];
            groups = combinedGroups;

            chrome.storage.local.set({ groups: combinedGroups }, () => {
              if (chrome.runtime.lastError) {
                console.error(
                  "Error saving imported groups:",
                  chrome.runtime.lastError,
                );
                showCustomModal(
                  "Import Error",
                  "Error saving imported groups: " +
                    chrome.runtime.lastError.message,
                );
              } else {
                console.log(
                  "Group collections imported and added successfully.",
                );
                showCustomModal(
                  "Import Successful",
                  `${importedDataWithPrefix.length} group collection(s) imported successfully!`,
                );
                LoadGroups();
                populateSelectGroupOptions();
              }
            });
          });
        },
        () => {
          // onCancel callback (optional, good for logging or specific actions)
          console.log("User cancelled group import.");
        },
        "Import", // Confirm button text
        "Cancel", // Cancel button text
      );
    } catch (error) {
      console.error("Error importing group collections:", error);
      // MODIFICATION: Use custom modal
      showCustomModal(
        "Import Error",
        "Failed to import group collections. The file might be corrupted or not in the correct JSON format. <br><br>Error: " +
          error.message,
      );
    } finally {
      event.target.value = null;
    }
  };

  reader.onerror = (error) => {
    console.error("Error reading file:", error);
    // MODIFICATION: Use custom modal
    showCustomModal("File Read Error", "Failed to read the selected file.");
    event.target.value = null;
  };

  reader.readAsText(file);
}

// (Keep all existing code below this point)
// --- END OF FILE popup.js ---

// ----- Initialize Custom Modal Elements (call this in DOMContentLoaded) -----
function initializeCustomModalElements() {
  customModalOverlay = document.getElementById("customModal");
  customModalTitleEl = document.getElementById("customModalTitle");
  customModalMessageEl = document.getElementById("customModalMessage");
  customModalConfirmBtn = document.getElementById("customModalConfirmBtn");
  customModalCancelBtn = document.getElementById("customModalCancelBtn");
  customModalCloseBtnEl = document.getElementById("customModalCloseBtn");

  if (customModalConfirmBtn) {
    customModalConfirmBtn.addEventListener("click", () => {
      if (typeof customModalConfirmCallback === "function") {
        customModalConfirmCallback();
      }
      hideCustomModal();
    });
  }

  if (customModalCancelBtn) {
    customModalCancelBtn.addEventListener("click", () => {
      if (typeof customModalCancelCallback === "function") {
        customModalCancelCallback();
      }
      hideCustomModal();
    });
  }

  if (customModalCloseBtnEl) {
    customModalCloseBtnEl.addEventListener("click", () => {
      if (typeof customModalCancelCallback === "function") {
        // Treat X close like a cancel if a cancel callback exists
        customModalCancelCallback();
      }
      hideCustomModal();
    });
  }

  // Optional: Close modal if overlay is clicked
  if (customModalOverlay) {
    customModalOverlay.addEventListener("click", (event) => {
      if (event.target === customModalOverlay) {
        if (typeof customModalCancelCallback === "function") {
          customModalCancelCallback();
        }
        hideCustomModal();
      }
    });
  }
}

// in popup.js

function showCustomModal(
  title,
  message,
  type = "alert",
  onConfirm = null,
  onCancel = null,
  confirmText = "OK",
  cancelText = "Cancel",
) {
  // Check if elements are initialized
  if (!customModalOverlay || !customModalTitleEl || !customModalMessageEl) {
    console.warn("Custom modal elements missing. Attempting lazy init...");
    initializeCustomModalElements();
  }

  // Double check after lazy init
  if (!customModalOverlay || !customModalConfirmBtn) {
    console.error(
      "Custom modal elements still not found. Falling back to native alert.",
    );
    if (type === "confirm") {
      if (confirm(message.replace(/<[^>]*>/g, ""))) {
        // Strip HTML for alert
        if (onConfirm) onConfirm();
      } else {
        if (onCancel) onCancel();
      }
    } else {
      alert(message.replace(/<[^>]*>/g, ""));
      if (onConfirm) onConfirm();
    }
    return;
  }

  // Safe to proceed
  customModalTitleEl.textContent = title;
  customModalMessageEl.innerHTML = message;

  customModalConfirmCallback = onConfirm;
  customModalCancelCallback = onCancel;

  customModalConfirmBtn.textContent = confirmText;

  // Reset button classes to default just in case
  customModalConfirmBtn.className = "btn btn-primary";
  if (customModalCancelBtn)
    customModalCancelBtn.className = "btn-visual-secondary";

  if (type === "confirm") {
    if (customModalCancelBtn) {
      customModalCancelBtn.textContent = cancelText;
      customModalCancelBtn.classList.remove("d-none");
    }
  } else {
    // 'alert' type
    if (customModalCancelBtn) customModalCancelBtn.classList.add("d-none");
  }

  customModalOverlay.classList.remove("d-none");
  setTimeout(() => customModalOverlay.classList.add("show"), 10);
}

// ----- NEW Hide Custom Modal Function -----
function hideCustomModal() {
  if (!customModalOverlay) return;

  customModalOverlay.classList.remove("show");
  setTimeout(() => {
    customModalOverlay.classList.add("d-none");
    // Reset callbacks
    customModalConfirmCallback = null;
    customModalCancelCallback = null;
  }, 250); // Match CSS transition duration
}

// ***** ADD THIS NEW LISTENER to popup.js *****
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const getProfileGroupsBtn = document.getElementById("getProfileGroups");
  if (!getProfileGroupsBtn) return;

  switch (message.action) {
    case "groupExtractionProgress":
      // Update the button text to show progress
      getProfileGroupsBtn.innerHTML = message.status;
      break;

    case "groupExtractionSuccess":
      // Re-enable the button and show a success message
      getProfileGroupsBtn.disabled = false;
      getProfileGroupsBtn.innerHTML = "Extract groups";
      showCustomModal("Success", message.message);
      // Reload the groups list in the UI to show the new collection
      LoadGroups();
      break;

    case "groupExtractionError":
      // Re-enable the button and show an error message
      getProfileGroupsBtn.disabled = false;
      getProfileGroupsBtn.innerHTML = "Extract groups";
      showCustomModal("Extraction Failed", message.error);
      break;
  }
});

// Add this new function to popup.js
function resetOrderAndAI() {
  // Reset the form elements within those sections to their defaults
  const generateAiVariationsCheckbox = document.getElementById(
    "generateAiVariations",
  );
  const aiVariationOptions = document.getElementById("aiVariationOptions");
  const aiVariationCountInput = document.getElementById("aiVariationCount");
  const orderSequentialRadio = document.getElementById("orderSequential");

  if (generateAiVariationsCheckbox) {
    generateAiVariationsCheckbox.checked = false;
  }
  if (aiVariationOptions) {
    aiVariationOptions.classList.add("d-none"); // Ensure the options are hidden
  }
  if (aiVariationCountInput) {
    aiVariationCountInput.value = "2"; // Reset to default value
  }
  if (orderSequentialRadio) {
    orderSequentialRadio.checked = true; // Reset to default 'sequential'
  }
}

// in popup.js
// ACTION: Replace the moveOrderHighlight function.

function moveOrderHighlight(targetPill) {
  const container = document.getElementById("postingOrderPills");
  const highlight = container?.querySelector(".stat-pill-highlight");
  if (!container || !highlight || !targetPill) return;

  // FIX: Use offset properties instead of getBoundingClientRect.
  // offsetLeft/Width are relative to the parent container's internal coordinates,
  // which makes them immune to the 80% body zoom scaling issues.

  const width = targetPill.offsetWidth;
  const leftPosition = targetPill.offsetLeft;

  // We set the width explicitly to match the button
  highlight.style.width = `${width}px`;

  // We move it to the button's exact internal starting position
  highlight.style.transform = `translateX(${leftPosition}px)`;
}

function initializePostingOrderSwitcher() {
  const container = document.getElementById("postingOrderPills");
  if (!container) return;

  const pills = container.querySelectorAll(".stat-pill");
  if (pills.length === 0) return;

  pills.forEach((pill) => {
    // Check if listener is already attached to prevent duplicates
    if (pill.dataset.listenerAttached) return;

    pill.addEventListener("click", () => {
      const value = pill.dataset.value;

      pills.forEach((p) => p.classList.remove("selected"));
      pill.classList.add("selected");

      moveOrderHighlight(pill);

      const radioToSelect = document.getElementById(
        value === "sequential" ? "orderSequential" : "orderAlternate",
      );
      if (radioToSelect) {
        radioToSelect.checked = true;
      }
    });
    pill.dataset.listenerAttached = "true"; // Mark as listener attached
  });
}

// in popup.js
// ACTION: Replace the entire handleRetryClick function with this corrected version.

function handleRetryClick(historyId) {
  // Find the button to disable it immediately for good UX
  const retryBtn = document.getElementById(`retry-btn-${historyId}`);
  if (retryBtn) {
    retryBtn.disabled = true;
    retryBtn.classList.add("retrying");
    const btnText = retryBtn.querySelector("span");
    if (btnText) {
      btnText.textContent = I18n.t("btnPreparing");
    }
  }

  // Find the history entry
  const historyEntry = postingHistory.find(
    (entry) => String(entry.id) === String(historyId),
  );
  if (!historyEntry) {
    showCustomModal("Error", "Could not find the original post run to retry.");
    if (retryBtn) {
      // Re-enable button on error
      retryBtn.disabled = false;
      retryBtn.classList.remove("retrying");
      const btnText = retryBtn.querySelector("span");
      if (btnText) btnText.textContent = "Retry Failed Posts";
    }
    return;
  }

  const failedLogs = historyEntry.postsCompleted.filter(
    (log) =>
      log.response !== "successful" && log.response !== "pending_approval",
  );
  const originalSettings = historyEntry.postsInfo.settings || {};

  console.log(`Sending retry request for ${failedLogs.length} failed posts.`);

  // *** THE FIX: Fire and Forget. Do not await the full process. ***
  // Immediately switch the UI to the loading state.
  historyPage.classList.add("d-none");
  LogsDiv.classList.add("d-none");
  loading.classList.remove("d-none");

  // Send the message to the background. The callback only handles immediate communication errors.
  chrome.runtime.sendMessage(
    {
      action: "retryFailedPosts",
      failedLogs,
      originalSettings,
    },
    (response) => {
      // This callback now runs very quickly, just to acknowledge the message was sent.
      if (chrome.runtime.lastError) {
        console.error(
          "Error sending retry message:",
          chrome.runtime.lastError.message,
        );
        showCustomModal(
          "Error",
          `Could not start the retry process: ${chrome.runtime.lastError.message}`,
        );

        // If sending the message fails, revert the UI
        loading.classList.add("d-none");
        historyPage.classList.remove("d-none"); // Or whichever page was active
        if (retryBtn) {
          retryBtn.disabled = false;
          retryBtn.classList.remove("retrying");
        }
      } else {
        // The background has acknowledged the request. The onChanged listener will now handle all future UI updates.
        console.log(
          "Retry request acknowledged by background script. UI is now in loading state.",
          response,
        );
      }
    },
  );
}

// Find and REPLACE the entire initializeSchedulerViews function
function initializeSchedulerViews() {
  const schedulerViewToggle = document.getElementById("schedulerViewToggle");
  const listView = document.getElementById("schedulerListView");
  const calendarView = document.getElementById("schedulerCalendarView");
  const timelineView = document.getElementById("schedulerTimelineView");
  const prevMonthBtn = document.getElementById("calendarPrevMonth");
  const nextMonthBtn = document.getElementById("calendarNextMonth");
  const todayBtn = document.getElementById("calendarToday");
  const showAllBtn = document.getElementById("calendarShowAll");

  if (!schedulerViewToggle || !listView || !calendarView || !timelineView)
    return;

  // View toggle logic
  schedulerViewToggle.addEventListener("change", (e) => {
    listView.classList.add("d-none");
    calendarView.classList.add("d-none");
    timelineView.classList.add("d-none");

    const view = e.target.value;
    if (view === "list") {
      listView.classList.remove("d-none");
      displayScheduledPosts();
    } else if (view === "calendar") {
      calendarView.classList.remove("d-none");
      renderCalendar(
        currentCalendarDate.getFullYear(),
        currentCalendarDate.getMonth(),
      );
    } else if (view === "timeline") {
      timelineView.classList.remove("d-none");
      renderTimelineView();
    }
  });

  // Calendar Navigation
  prevMonthBtn.addEventListener("click", () => {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
    renderCalendar(
      currentCalendarDate.getFullYear(),
      currentCalendarDate.getMonth(),
    );
  });
  nextMonthBtn.addEventListener("click", () => {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
    renderCalendar(
      currentCalendarDate.getFullYear(),
      currentCalendarDate.getMonth(),
    );
  });

  // Button Listeners
  const resetAndRefresh = () => {
    updateSchedulerFilter(null); // Set filter to null and force re-render
    // Re-render the calendar itself if it's visible, to remove selection
    if (!calendarView.classList.contains("d-none")) {
      renderCalendar(
        currentCalendarDate.getFullYear(),
        currentCalendarDate.getMonth(),
      );
    }
  };

  todayBtn.addEventListener("click", () => {
    currentCalendarDate = new Date(); // Reset calendar month view to today
    resetAndRefresh();
    renderCalendar(
      currentCalendarDate.getFullYear(),
      currentCalendarDate.getMonth(),
    ); // Explicitly re-render calendar
  });

  showAllBtn.addEventListener("click", () => {
    resetAndRefresh();
  });
}

// Add this NEW function to popup.js
function updateSchedulerFilter(newDate) {
  // 1. Update the global state
  selectedCalendarDate = newDate;

  const filterStatusContainer = document.getElementById(
    "filter-status-container",
  );

  // 2. Update the UI based on the new state
  if (selectedCalendarDate) {
    // We have a date filter active
    const selectedDateDisplay = document.getElementById("calendarSelectedDate");
    selectedDateDisplay.textContent = `Showing schedule for: ${selectedCalendarDate.toLocaleDateString()}`;
    filterStatusContainer.classList.remove("d-none");
  } else {
    // No filter is active
    filterStatusContainer.classList.add("d-none");
    document
      .querySelectorAll(".calendar-day.is-selected")
      .forEach((el) => el.classList.remove("is-selected"));
  }

  // 3. Force the currently active view to re-render itself with the new state
  const activeView = document.querySelector(
    'input[name="schedulerView"]:checked',
  ).value;
  if (activeView === "list") {
    displayScheduledPosts();
  } else if (activeView === "timeline") {
    renderTimelineView();
  }
}
// Main function to render the calendar grid for a given month and year
function renderCalendar(year, month) {
  const grid = document.getElementById("calendarGrid");
  const monthYearEl = document.getElementById("calendarMonthYear");
  if (!grid || !monthYearEl) return;

  grid.innerHTML = ""; // Clear previous grid
  monthYearEl.textContent = new Date(year, month).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  for (let i = 0; i < 42; i++) {
    const dayDate = new Date(startDate);
    dayDate.setDate(startDate.getDate() + i);

    const dayEl = document.createElement("div");
    dayEl.className = "calendar-day";

    const dayNumber = document.createElement("span");
    dayNumber.className = "day-number";
    dayNumber.textContent = dayDate.getDate();
    dayEl.appendChild(dayNumber);

    if (dayDate.getMonth() !== month) {
      dayEl.classList.add("is-other-month");
    }

    if (dayDate.getTime() === today.getTime()) {
      dayEl.classList.add("is-today");
    }

    // Check for scheduled posts on this day
    const postsForDay = getPostsForDay(dayDate);
    if (postsForDay.length > 0) {
      dayEl.classList.add("has-posts");
      const indicators = document.createElement("div");
      indicators.className = "post-indicators";

      // Create a unique set of frequencies for the day to avoid duplicate dots
      const frequencies = [...new Set(postsForDay.map((p) => p.frequency))];
      frequencies.slice(0, 4).forEach((freq) => {
        // Show max 4 dots
        const dot = document.createElement("div");
        dot.className = `dot-indicator dot-${freq}`;
        dot.title = `${freq.charAt(0).toUpperCase() + freq.slice(1)} Post`;
        indicators.appendChild(dot);
      });
      dayEl.appendChild(indicators);
    }

    dayEl.addEventListener("click", () => handleDayClick(dayDate, dayEl));
    grid.appendChild(dayEl);
  }
}

// Find and REPLACE the entire handleDayClick function
function handleDayClick(date, element) {
  // 1. Visually update the calendar immediately
  document
    .querySelectorAll(".calendar-day.is-selected")
    .forEach((el) => el.classList.remove("is-selected"));
  element.classList.add("is-selected");

  // 2. Call the central function to update the state and all views
  updateSchedulerFilter(date);

  // 3. For the best UX, switch to the list view to show the details.
  const listViewRadio = document.getElementById("viewList");
  if (!listViewRadio.checked) {
    listViewRadio.click();
  }
}
// In popup.js
function getPostsForDay(date) {
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  const targetTime = targetDate.getTime();

  const dayOfWeek = targetDate.getDay();
  const dayOfMonth = targetDate.getDate();

  return scheduledPosts.filter((post) => {
    // 1. Paused check
    if (post.isCampaign && post.status === "paused") return false;

    // 2. Specific Next Run Check (Priority)
    // Does this specific post/campaign have a run scheduled for *exactly* this date?
    if (post.nextRunTime) {
      const nextRun = new Date(post.nextRunTime);
      nextRun.setHours(0, 0, 0, 0);
      if (nextRun.getTime() === targetTime) return true;
    }

    // 3. Recurrence Projection (For Calendar Grid)
    // This allows Weekly/Daily campaigns to show dots on future dates
    // even if the specific 'nextRunTime' hasn't been calculated that far out yet.
    switch (post.frequency) {
      case "daily":
        return true;

      case "weekly":
        // Checks if today is one of the selected weekdays (e.g., Mon, Wed)
        return post.weekdays && post.weekdays.includes(dayOfWeek);

      case "monthly":
        const daysInMonth = new Date(
          targetDate.getFullYear(),
          targetDate.getMonth() + 1,
          0,
        ).getDate();
        if (post.monthDays && post.monthDays.includes(dayOfMonth)) return true;
        if (
          dayOfMonth === daysInMonth &&
          post.monthDays.some((d) => d > daysInMonth)
        )
          return true;
        return false;

      default:
        // For 'once' or 'campaign' (without specific trigger data),
        // we rely solely on the nextRunTime check above.
        return false;
    }
  });
}

// Add this NEW function to popup.js
function populateSchedulerForEditing(post) {
  // Clear any previous selections
  selectedPosts = [];
  selectedGroups = [];
  clearSelectedTags();
  clearSelectedGroups();

  // --- 1. Populate Selected Posts ---
  if (post.posts && Array.isArray(post.posts)) {
    post.posts.forEach((postData) => {
      const tagIndex = tags.findIndex((tag) => tag.title === postData.title);
      if (tagIndex !== -1) {
        selectedPosts.push({ index: tagIndex, post: tags[tagIndex] });
        addSelectedTag(tagIndex);
      }
    });
  }

  // --- 2. Populate Selected Groups ---
  if (post.groups && Array.isArray(post.groups)) {
    post.groups.forEach((groupData) => {
      // Try to find it in the main list first
      const groupIndex = groups.findIndex(
        (group) => group.title === groupData.title,
      );

      if (groupIndex !== -1) {
        // It's a standard saved collection
        selectedGroups.push({ index: groupIndex, group: groups[groupIndex] });
        addSelectedGroup(groupIndex);
      } else {
        // It's NOT in the list. This implies it's an "Advanced Selection" or a deleted group.
        // We treat it as an Advanced Selection if it has links.
        if (groupData.links && groupData.links.length > 0) {
          console.log("Restoring Advanced Selection:", groupData.title);

          // We reuse the logic from handleTargeterConfirm's UI update
          updateMainPageWithAdvancedSelection(groupData);
        }
      }
    });
  }

  // --- 3. Populate Settings ---
  const settings = post.settings || {};
  document.getElementById("linkCount").value = settings.linkCount || 1;
  document.getElementById("enterTime").value = (settings.timeDelay || 300) / 60; // Convert seconds to minutes
  document.getElementById("nightPost").checked =
    settings.avoidNightPosting || false;
  document.getElementById("delayAfterFailure").checked =
    settings.delayAfterFailure || false;
  document.getElementById("compressImage").checked =
    settings.compressImages !== false; // Default true
  document.getElementById("schedPostAnonymously").checked =
    settings.postAnonymously || false;

  // Security Level
  const securitySlider = document.getElementById("securityLevelSlider");
  if (securitySlider) {
    securitySlider.value = settings.securityLevel || "2";
    // Manually trigger the UI update for the slider
    const updateSliderUIEvent = new Event("input", { bubbles: true });
    securitySlider.dispatchEvent(updateSliderUIEvent);
  }

  // Comment Options
  const commentOption = settings.commentOption || "enable";
  const commentRadio = document.querySelector(
    `input[name="commentOption"][value="${commentOption}"]`,
  );
  if (commentRadio) commentRadio.checked = true;

  const firstCommentContainer = document.getElementById(
    "firstCommentTextContainer",
  );
  if (commentOption === "comment") {
    firstCommentContainer.classList.remove("d-none");
    document.getElementById("firstCommentText").value =
      settings.firstCommentText || "";
  } else {
    firstCommentContainer.classList.add("d-none");
  }

  // Posting Method & Order
  const postingMethod = settings.postingMethod || "directApi";
  const methodRadio = document.querySelector(
    `input[name="postingMethod"][value="${postingMethod}"]`,
  );
  if (methodRadio) methodRadio.checked = true;

  const postOrder = settings.postOrder || "sequential";
  const orderRadio = document.querySelector(
    `input[name="postOrder"][value="${postOrder}"]`,
  );
  if (orderRadio) {
    orderRadio.checked = true;
    // Manually trigger UI update for segmented control
    const orderPill = document.querySelector(
      `#postingOrderPills .stat-pill[data-value="${postOrder}"]`,
    );
    if (orderPill) {
      orderPill.click();
    }
  }

  // AI Variations
  const generateAiCheckbox = document.getElementById("generateAiVariations");
  generateAiCheckbox.checked = settings.generateAiVariations || false;
  document
    .getElementById("aiVariationOptions")
    .classList.toggle("d-none", !generateAiCheckbox.checked);
  document.getElementById("aiVariationCount").value =
    settings.aiVariationCount || 2;

  // --- 4. Final UI State Update ---
  enableStartPostingIfReady();
  updateSchedulerFeatureVisibility();
}

function resetSchedulerToDefaultState() {
  // 1. CLEAR STATE IMMEDIATELY
  const wasEditing = editingScheduleIndex !== null;
  editingScheduleIndex = null;
  window.isQuickPostSchedulingMode = false;

  if (!wasEditing) return; // Exit if not actually editing

  console.log("Resetting scheduler from edit mode.");

  // 2. Clear Advanced Selections
  selectedPosts = [];
  selectedGroups = [];
  clearSelectedTags();
  clearSelectedGroups();

  // 3. Clear Quick Post Selections & UI
  if (quickPostQuill) quickPostQuill.setContents([]);
  quickMedia = [];
  quickSelectedGroups = [];
  const quickContainer = document.getElementById(
    "quickSelectedGroupsContainer",
  );
  if (quickContainer) quickContainer.innerHTML = "";

  // --- RESTORE QUICK POST BUTTONS ---
  const quickScheduleBtn = document.getElementById("quickScheduleButton");
  const quickPostBtn = document.getElementById("quickPostButton");

  if (quickScheduleBtn) {
    quickScheduleBtn.textContent = I18n.t("btnScheduleLater"); // Revert text
    quickScheduleBtn.classList.remove("btn-primary");
    quickScheduleBtn.classList.add("btn-visual-secondary"); // Revert style
  }

  // Show "Post Now" again
  if (quickPostBtn) quickPostBtn.classList.remove("d-none");

  updateQuickMediaDisplay();
  updateQuickPostButton(); // Re-validates disable state

  // --- RESTORE ADVANCED SCHEDULER BUTTONS ---
  const startPostingWrapper = document.getElementById("startPostingWrapper");
  const startPosting = document.getElementById("startPosting");
  const schedulePostButton = document.getElementById("schedulePostButton");
  const cancelEditScheduleBtn = document.getElementById(
    "cancelEditScheduleBtn",
  );

  // Ensure wrapper is visible
  if (startPostingWrapper) startPostingWrapper.classList.remove("d-none");

  // Show "Post Now" again
  if (startPosting) {
    startPosting.textContent = I18n.t("btnPostNow");
    startPosting.classList.remove("d-none");
  }

  // Revert Schedule button style and text
  if (schedulePostButton) {
    schedulePostButton.textContent = I18n.t("btnSchedule"); // "Schedule for Later"
    schedulePostButton.classList.remove("btn-primary");
    schedulePostButton.classList.add("btn-secondary");
  }

  // Hide Cancel button
  if (cancelEditScheduleBtn) cancelEditScheduleBtn.classList.add("d-none");

  enableStartPostingIfReady();

  // 5. NAVIGATE BACK TO LIST VIEW
  const mainPostBtn = document.getElementById("mainNavPostBtn");
  const subNavContainer = document.getElementById("postSubNavContainer");
  const upcomingBtn = document.getElementById("scheduledPostsBtn");
  const allMainLinks = document.querySelectorAll(".main-nav-unified .nav-link");

  const schedulerPage = document.getElementById("SchedulerPage");
  const quickPage = document.getElementById("quickPostPage");
  const listPage = document.getElementById("scheduledPostsPage");

  // Hide edit pages
  if (schedulerPage) schedulerPage.classList.add("d-none");
  if (quickPage) quickPage.classList.add("d-none");

  // Show list page
  if (listPage) listPage.classList.remove("d-none");

  // Reset Nav Highlight
  if (subNavContainer) subNavContainer.classList.add("d-none");
  allMainLinks.forEach((btn) => btn.classList.remove("active"));
  if (upcomingBtn) upcomingBtn.classList.add("active");

  // 6. Refresh List to show changes
  displayScheduledPosts();
}
// Add this NEW function to popup.js
function handleNavigationWhileEditing() {
  if (editingScheduleIndex !== null) {
    console.log("Navigating away while editing. Cancelling edit.");
    resetSchedulerToDefaultState();
  }
}

// Add these NEW functions to popup.js

function getOccurrencesForNext24Hours(post) {
  const occurrences = [];
  const now = new Date();
  const endOfWindow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  if (post.status !== "scheduled") return occurrences;

  let nextRun = new Date(post.nextRunTime);

  // If the next run is in the past, calculate the *actual* next run time from today
  if (nextRun < now) {
    const calculatedNext = calculateNextRunTime(post); // This function calculates the next run from 'now'
    if (calculatedNext) {
      nextRun = new Date(calculatedNext);
    } else {
      return occurrences; // Could not calculate a future run time
    }
  }

  // Loop to find all occurrences within the 24-hour window
  while (nextRun < endOfWindow) {
    occurrences.push(new Date(nextRun)); // Add a copy of the date

    // Calculate the next occurrence based on frequency
    if (post.frequency === "once") {
      break; // 'once' posts only occur once
    }

    const tempPostForCalc = { ...post, nextRunTime: nextRun.toISOString() };
    const nextCalculated = calculateNextRunTime(tempPostForCalc);

    if (nextCalculated) {
      const nextCalculatedDate = new Date(nextCalculated);
      // Break if the next calculation is the same or earlier, to prevent infinite loops
      if (nextCalculatedDate <= nextRun) break;
      nextRun = nextCalculatedDate;
    } else {
      break; // Stop if we can't calculate a future date
    }
  }

  return occurrences;
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
function renderTimelineView() {
  const eventsContainer = document.getElementById("timeline-events");
  const hoursContainer = document.querySelector(".timeline-hours");
  const timelineTitle = document.getElementById("timelineTitle");

  if (!eventsContainer || !hoursContainer || !timelineTitle) return;

  const dateToRender = selectedCalendarDate
    ? new Date(selectedCalendarDate)
    : new Date();
  const now = new Date();
  const isToday = dateToRender.toDateString() === now.toDateString();

  timelineTitle.textContent = `Schedule for ${dateToRender.toLocaleDateString(
    "en-US",
    { weekday: "long", month: "long", day: "numeric" },
  )}`;

  eventsContainer.innerHTML = "";
  hoursContainer.innerHTML = "";

  // Render Hour Labels
  for (let i = 0; i < 24; i++) {
    const hourLabel = document.createElement("div");
    hourLabel.className = "timeline-hour-label";
    const dateForLabel = new Date();
    dateForLabel.setHours(i, 0, 0, 0);
    hourLabel.textContent = dateForLabel
      .toLocaleTimeString("en-US", { hour: "numeric", hour12: true })
      .replace(" ", "");
    hoursContainer.appendChild(hourLabel);
  }

  const MINUTES_IN_DAY = 24 * 60;
  let allOccurrences = [];
  const postsForDay = getPostsForDay(dateToRender);

  postsForDay.forEach((post) => {
    // Determine Time from nextRunTime
    // Note: nextRunTime is an ISO string in our data model now
    if (post.nextRunTime) {
      const occurrenceDate = new Date(post.nextRunTime);

      // Ensure we only show times that actually fall on this visual day
      // (Handle edge cases where nextRunTime might be tomorrow but logic selected it)
      if (occurrenceDate.toDateString() === dateToRender.toDateString()) {
        allOccurrences.push({ post, date: occurrenceDate });
      }
    }
  });

  // Calculate layouts
  const laidOutEvents = calculateEventLayouts(allOccurrences);

  // Helper for Title
  const getDisplayTitleForPost = (post) => {
    if (post.isCampaign) {
      return post.posts?.[0]?.title || "Automated Step";
    }

    // Standard Logic
    let title = "Untitled Post";
    if (post.posts && post.posts.length > 0) {
      if (post.posts.length === 1) {
        title = post.posts[0].title || "Untitled Post";
      } else {
        title = `${post.posts.length} Posts`;
      }
    }
    return title;
  };

  laidOutEvents.forEach((event) => {
    const topPosition = (event.start / MINUTES_IN_DAY) * 100;
    const heightPercentage = (event.duration / MINUTES_IN_DAY) * 100;

    const eventItem = document.createElement("div");
    eventItem.className = "timeline-event-item";

    // Campaign Styling Override
    if (event.post.isCampaign) {
      eventItem.style.borderLeftColor = "#8b5cf6"; // Purple
      eventItem.style.backgroundColor = "#fcfaff";
    }

    eventItem.style.top = `${topPosition}%`;
    eventItem.style.height = `${Math.max(heightPercentage, 3.5)}%`; // Min height for visibility
    eventItem.style.left = `${event.layout.left}%`;
    eventItem.style.width = `calc(${event.layout.width}% - 4px)`;
    eventItem.style.zIndex = event.layout.zIndex;

    const displayTitle = getDisplayTitleForPost(event.post);

    // Handle Group Count Safely
    let totalLinks = 0;
    if (event.post.groups) {
      totalLinks = event.post.groups.reduce(
        (sum, g) => sum + (g.links ? g.links.length : 0),
        0,
      );
    } else {
      // Campaign might not have groups array populated here to save memory
      // We show a generic label
      totalLinks = "-";
    }

    eventItem.innerHTML = `
            <p class="event-item-title" title="${displayTitle}">${displayTitle}</p>
            ${
              !event.post.isCampaign
                ? `<span class="event-item-details">${totalLinks}</span>`
                : ""
            }
        `;

    eventsContainer.appendChild(eventItem);
  });

  // Render "Now" indicator
  if (isToday) {
    const nowIndicator = document.createElement("div");
    nowIndicator.id = "timeline-now-indicator";
    nowIndicator.className = "timeline-now-indicator";
    nowIndicator.innerHTML = '<div class="now-indicator-dot"></div>';

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const nowPosition = (currentMinutes / MINUTES_IN_DAY) * 100;
    nowIndicator.style.top = `${nowPosition}%`;

    eventsContainer.appendChild(nowIndicator);

    // Auto-scroll to now
    setTimeout(() => {
      nowIndicator.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 100);
  }
}

function calculateTotalTaskDuration(post) {
  // --- Campaign Handling ---
  if (post.isCampaign) {
    // Default to 15 mins for visual representation of a campaign step
    // or check if we can estimate based on step type
    return 20;
  }

  // --- Standard Post Handling ---
  if (!post || !post.posts || !post.groups) return 15;

  const settings = post.settings || {};
  const timeDelayInSeconds = settings.timeDelay || 300;
  const groupsBeforeDelay = Math.max(1, settings.groupNumberForDelay || 1);

  const totalPostsInRun = post.posts.length;
  const totalGroups = post.groups.reduce(
    (sum, g) => sum + (g.links ? g.links.length : 0),
    0,
  );

  if (totalGroups === 0 || totalPostsInRun === 0) return 15;

  const postOrder = settings.postOrder || "sequential";
  const totalOperations =
    postOrder === "sequential" ? totalPostsInRun * totalGroups : totalGroups;

  const activePostingMinutes = totalOperations * 1;

  const numberOfDelays =
    totalOperations > 1
      ? Math.floor((totalOperations - 1) / groupsBeforeDelay)
      : 0;
  const totalDelayMinutes = (numberOfDelays * timeDelayInSeconds) / 60;

  const totalThinkingMinutes = (totalOperations * 5) / 60;

  const totalDurationInMinutes =
    activePostingMinutes + totalDelayMinutes + totalThinkingMinutes;

  return Math.max(15, totalDurationInMinutes);
}
// Add this NEW function to popup.js
// Find and REPLACE the entire calculateEventLayouts function
function calculateEventLayouts(events) {
  if (events.length === 0) return [];

  // 1. Augment events with start and end times using our new advanced calculator
  const augmentedEvents = events
    .map((event) => {
      // *** THIS IS THE KEY CHANGE ***
      const durationInMinutes = calculateTotalTaskDuration(event.post);

      return {
        ...event,
        start: event.date.getHours() * 60 + event.date.getMinutes(),
        end:
          event.date.getHours() * 60 +
          event.date.getMinutes() +
          durationInMinutes,
        duration: durationInMinutes,
      };
    })
    .sort((a, b) => a.start - b.start); // Sort by start time

  // 2. Group overlapping events (This logic remains the same)
  const collisionGroups = [];
  let lastEventEnd = -1;

  augmentedEvents.forEach((event) => {
    if (event.start > lastEventEnd) {
      collisionGroups.push([event]);
      lastEventEnd = event.end;
    } else {
      const currentGroup = collisionGroups[collisionGroups.length - 1];
      currentGroup.push(event);
      lastEventEnd = Math.max(lastEventEnd, event.end);
    }
  });

  // 3. Calculate layout properties for each group (This logic remains the same)
  collisionGroups.forEach((group) => {
    // A more advanced column placement could be implemented here, but for now, we stack them.
    const numColumns = group.length;
    group.forEach((event, index) => {
      event.layout = {
        width: 100 / numColumns,
        left: index * (100 / numColumns),
        zIndex: index + 1,
      };
    });
  });

  return augmentedEvents;
}

// in popup.js

/**
 * NEW FUNCTION
 * Populates the schedule timing modal (#scheduleModal) with data from an existing scheduled post.
 * @param {object} post - The scheduled post object to be edited.
 */
function populateScheduleModalForEditing(post) {
  if (!post) return;

  // 1. Set Frequency Radio Button
  const frequencyRadio = document.querySelector(
    `input[name="scheduleFrequency"][value="${post.frequency}"]`,
  );
  if (frequencyRadio) {
    frequencyRadio.checked = true;
    // Manually trigger the 'change' event to update UI and styles
    frequencyRadio.dispatchEvent(new Event("change", { bubbles: true }));
  }

  // 2. Populate Date/Time/Day selections based on frequency
  switch (post.frequency) {
    case "once":
      if (post.scheduleDateTime) {
        const date = new Date(post.scheduleDateTime);
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
        const hh = String(date.getHours()).padStart(2, "0");
        const min = String(date.getMinutes()).padStart(2, "0");

        document.getElementById("scheduleDate").value = `${yyyy}-${mm}-${dd}`;
        document.getElementById("scheduleTime").value = `${hh}:${min}`;
      }
      break;

    case "daily":
      if (post.scheduleTime) {
        document.getElementById("dailyTime").value = post.scheduleTime;
      }
      break;

    case "weekly":
      if (post.scheduleTime) {
        document.getElementById("weeklyTime").value = post.scheduleTime;
      }
      // Check the corresponding weekday checkboxes
      document.querySelectorAll('input[name="weekday"]').forEach((checkbox) => {
        const dayValue = parseInt(checkbox.value, 10);
        const isChecked = post.weekdays.includes(dayValue);
        checkbox.checked = isChecked;
        // Update the visual style of the parent label
        const label = checkbox.parentElement;
        if (isChecked) {
          label.classList.add("active");
        } else {
          label.classList.remove("active");
        }
      });
      break;

    case "monthly":
      if (post.scheduleTime) {
        document.getElementById("monthlyTime").value = post.scheduleTime;
      }
      // Check the corresponding month day checkboxes
      document
        .querySelectorAll('input[name="monthday"]')
        .forEach((checkbox) => {
          const dayValue = parseInt(checkbox.value, 10);
          const isChecked = post.monthDays.includes(dayValue);
          checkbox.checked = isChecked;
          // Update the visual style of the parent label
          const label = checkbox.parentElement;
          if (isChecked) {
            label.classList.add("active");
          } else {
            label.classList.remove("active");
          }
        });
      break;
  }

  // 3. Ensure the correct option panel is visible
  updateScheduleOptionsVisibility(post.frequency);
}

// in popup.js
// ACTION: Replace the openSpintaxModal function.

function openSpintaxModal(targetEditor) {
  // <-- ACCEPTS the editor instance
  if (!targetEditor) {
    console.error("openSpintaxModal was called without a target editor.");
    return;
  }

  // Store the editor on the modal element itself. This is our new, reliable state holder.
  spintaxModal.dataset.editorType =
    targetEditor === quill ? "quill" : "quickpost_quill";

  spintaxVariationsList.innerHTML = "";

  // Get the selection directly from the provided editor instance.
  const selection = targetEditor.getSelection(true) || {
    index: targetEditor.getLength(),
    length: 0,
  };
  const selectedText = targetEditor.getText(selection.index, selection.length);

  // ... (Your existing logic to populate the modal based on selectedText is fine) ...
  const spintaxMatch = selectedText.trim().match(/^\{([\s\S]*)\}$/);
  if (spintaxMatch) {
    const variations = spintaxMatch[1].split("|");
    variations.forEach((v) => addVariationInput(v.trim()));
  } else {
    addVariationInput(selectedText);
    addVariationInput();
  }

  spintaxModal.classList.remove("d-none");
  updateSpintaxPreview();
}
function closeSpintaxModal() {
  spintaxModal.classList.add("d-none");
  updateSpintaxPreview(); // Show initial preview
  activeSpintaxEditorType = null;
  activeInsertionRange = null;
}

// --- Variation Input Management ---
function addVariationInput(value = "") {
  const item = document.createElement("div");
  item.className = "spintax-variation-item";
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Enter a variation...";
  input.value = value;
  input.addEventListener("input", updateSpintaxPreview); // Add live update listener
  const deleteBtn = document.createElement("button");
  deleteBtn.className = "spintax-delete-variation-btn";
  deleteBtn.innerHTML = "×";
  deleteBtn.onclick = () => {
    if (spintaxVariationsList.childElementCount > 1) {
      item.remove();
      updateSpintaxPreview(); // Update preview after deleting an item
    } else {
      showCustomModal("Cannot Delete", "You must have at least one variation.");
    }
  };
  item.appendChild(input);
  item.appendChild(deleteBtn);
  spintaxVariationsList.appendChild(item);
  if (!value) input.focus();
}

// --- NEW FUNCTION: Update Live Preview ---
function updateSpintaxPreview() {
  if (!spintaxPreviewOutput || !spintaxShuffleBtn) return;

  const inputs = spintaxVariationsList.querySelectorAll("input");
  const variations = Array.from(inputs)
    .map((input) => input.value.trim())
    .filter((value) => value.length > 0);

  if (variations.length === 0) {
    spintaxPreviewOutput.textContent = "";
    spintaxShuffleBtn.disabled = true;
    return;
  }

  // Enable or disable shuffle button based on number of variations
  spintaxShuffleBtn.disabled = variations.length <= 1;

  // Select a random variation to display
  const randomIndex = Math.floor(Math.random() * variations.length);
  const randomVariation = variations[randomIndex];

  spintaxPreviewOutput.textContent = randomVariation;
  // Trigger a subtle animation to indicate a change
  spintaxPreviewOutput.style.animation = "none";
  void spintaxPreviewOutput.offsetWidth; // Reflow trick
  spintaxPreviewOutput.style.animation = "preview-fade-in 0.3s ease";
}

// in popup.js
// ACTION: Replace the entire applySpintax function.

function applySpintax() {
  // This part is correct: get the variations from the modal.
  const inputs = spintaxVariationsList.querySelectorAll("input");
  const variations = Array.from(inputs)
    .map((input) => input.value.trim())
    .filter((value) => value.length > 0);

  if (variations.length === 0) {
    showCustomModal("Attention", I18n.t("spinErr"));
    return;
  }

  const spintaxString = `{${variations.join("|")}}`;
  const editorType = spintaxModal.dataset.editorType;
  let targetEditor = null;

  if (editorType === "quill") {
    targetEditor = quill;
  } else if (editorType === "quickpost_quill") {
    targetEditor = quickPostQuill;
  }

  if (targetEditor) {
    // 2. Since focus is now on the modal, we CANNOT rely on getSelection().
    // We must re-focus the editor to restore its last known state.
    targetEditor.focus();

    // 3. Let the browser process the focus, then get the selection.
    setTimeout(() => {
      const range = targetEditor.getSelection(true); // Get the fresh, now-valid selection
      if (!range) {
        console.error(
          "Could not get selection from editor even after focusing.",
        );
        // As a fallback, insert at the end.
        const length = targetEditor.getLength();
        targetEditor.insertText(length, spintaxString, "user");
        return;
      }

      // 4. Perform the text replacement with the guaranteed range.
      targetEditor.deleteText(range.index, range.length, "user");
      targetEditor.insertText(range.index, spintaxString, "user");
      targetEditor.setSelection(range.index + spintaxString.length);
    }, 50); // A small delay is often needed for focus to register.
  } else {
    // This error should now be impossible.
    console.error(
      "ApplySpintax Error: Could not determine target editor from modal data.",
    );
  }
  // --- END: THE DEFINITIVE FIX ---

  closeSpintaxModal();
}

// --- Category Management Core Logic ---

const CATEGORY_COLORS = [
  "#4299E1",
  "#48BB78",
  "#F56565",
  "#ED8936",
  "#9F7AEA",
  "#ECC94B",
  "#38B2AC",
  "#EC4899",
  "#A0AEC0",
  "#6366F1",
];

function getCategoryById(id) {
  return postCategories.find((c) => c.id === id);
}

function showCategoryManagementModal() {
  console.log("Opening Category Management Modal");
  if (categoryManagementModal) {
    categoryManagementModal.classList.remove("d-none");
    // Use a small timeout to allow the display property to apply before starting the transition
    setTimeout(() => {
      categoryManagementModal.classList.add("show");
    }, 10);
  }
  renderCategoriesInModal();
}

function closeCategoryManagementModal() {
  const modal = document.getElementById("categoryManagementModal");
  if (modal) {
    modal.classList.remove("show");
    // Wait for the fade-out transition to finish before hiding it completely
    setTimeout(() => {
      modal.classList.add("d-none");
    }, 250); // This duration should match your CSS transition time
  }

  // Re-enable focus on the filter select input if needed
  if (!TagsPage.classList.contains("d-none")) {
    LoadTags(); // Refresh tags list to reflect any changes
  }
}

// in popup.js

function renderCategoriesInModal() {
  console.log("rendering");
  const container = document.getElementById("categoryListContainer");
  const nameInput = document.getElementById("newCategoryName");
  const addBtn = document.getElementById("addNewCategoryBtn");

  // Reset form state
  nameInput.value = "";
  addBtn.textContent = I18n.t("btnAdd");
  editingCategoryId = null;

  container.innerHTML = "";

  if (postCategories.length === 0) {
    container.innerHTML =
      '<p class="text-center text-muted small">No categories created yet.</p>';
  } else {
    postCategories.forEach((cat) => {
      const item = document.createElement("div");
      item.className = "category-item";
      // --- START: MODIFICATION ---
      // Apply the same classes and structure as the post template buttons
      item.innerHTML = `
        <div class="category-item-details">
          <div class="category-color-dot" style="background-color: ${cat.color};"></div>
          <span class="category-item-name">${cat.name}</span>
        </div>
        <div class="tag-actions">
          <button class="tag-btn edit" data-id="${cat.id}" title="Edit"><i class="fa fa-pencil"></i></button>
          <button class="tag-btn delete" data-id="${cat.id}" title="Delete"><i class="fa fa-trash-o"></i></button>
        </div>
      `;
      // --- END: MODIFICATION ---
      container.appendChild(item);
    });
  }

  if (postCategories.length >= CATEGORY_COLORS.length) {
    nameInput.disabled = true;
    nameInput.placeholder = I18n.t("catLimit");
    addBtn.disabled = true;
  } else {
    nameInput.disabled = false;
    nameInput.placeholder = I18n.t("catPhName");
    addBtn.disabled = false;
  }

  // --- START: MODIFICATION ---
  // Update the selectors to match the new class names (.edit and .delete)
  // Scoped to '.category-item' to avoid conflicting with other edit/delete buttons in the app.
  document
    .querySelectorAll(".category-item .edit")
    .forEach((btn) => btn.addEventListener("click", startEditCategory));
  document
    .querySelectorAll(".category-item .delete")
    .forEach((btn) => btn.addEventListener("click", deleteCategory));
  // --- END: MODIFICATION ---
}

// in popup.js

// in popup.js

function handleSaveCategory() {
  // This initial check remains the same and is crucial. It's our primary guard.
  if (!editingCategoryId && postCategories.length >= CATEGORY_COLORS.length) {
    showCustomModal("Limit Reached", I18n.t("catErrLimit"));
    return;
  }

  const nameInput = document.getElementById("newCategoryName");
  const name = nameInput.value.trim();

  if (!name) {
    showCustomModal("Validation Error", I18n.t("catErrEmpty"));
    return;
  }

  if (editingCategoryId) {
    // Logic for updating an existing category remains unchanged.
    const category = postCategories.find((c) => c.id === editingCategoryId);
    if (category) {
      category.name = name;
    }
  } else {
    // --- START: MODIFICATION FOR UNIQUE COLOR ASSIGNMENT ---

    // 1. Create a Set of all colors that are currently in use for fast lookup.
    const usedColors = new Set(postCategories.map((cat) => cat.color));

    // 2. Find the first color in our master list (`CATEGORY_COLORS`) that is NOT in the `usedColors` Set.
    let nextColor = CATEGORY_COLORS.find((color) => !usedColors.has(color));

    // 3. Add a fallback. This should theoretically never be hit because of the length check at the top,
    //    but it makes the code safer against future changes.
    if (!nextColor) {
      console.warn("All unique colors are used. Cycling colors as a fallback.");
      nextColor =
        CATEGORY_COLORS[postCategories.length % CATEGORY_COLORS.length];
    }

    // --- END: MODIFICATION ---

    const newCategory = {
      id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: name,
      color: nextColor, // Assign the guaranteed unique color.
    };
    postCategories.push(newCategory);
  }

  // The rest of the function remains the same.
  saveCategoriesAndRerender();
  nameInput.value = "";
  nameInput.focus();
  editingCategoryId = null;
  document.getElementById("addNewCategoryBtn").textContent = "Add";
}

// in popup.js
// ACTION: Add this new helper function

function populatePopoverCategories() {
  const categoryList = document.getElementById("popover-category-list");
  const sortOptions = document.querySelectorAll(".sort-option");
  const categoryOptions = document.querySelectorAll(".category-filter-option");
  if (!categoryList || !sortOptions) return;

  // --- Update active state of Sort buttons ---
  sortOptions.forEach((opt) => {
    // The check now includes 'default'
    const isActive =
      opt.dataset.sortBy === currentSort.by &&
      (currentSort.by === "default" || opt.dataset.sortDir === currentSort.dir);
    opt.classList.toggle("active", isActive);
  });

  // --- Populate and update active state of Category buttons ---
  categoryList.innerHTML = ""; // Clear old list

  // "All Categories" option
  const allOpt = document.createElement("button");
  allOpt.className = "sort-option category-filter-option";
  allOpt.dataset.categoryId = "all";
  allOpt.innerHTML = `<i class="fa fa-th-large"></i> All Categories`;
  allOpt.classList.toggle("active", activeCategoryFilter === "all");
  categoryList.appendChild(allOpt);

  // Add each user-created category
  postCategories.forEach((cat) => {
    const catOpt = document.createElement("button");
    catOpt.className = "sort-option category-filter-option";
    catOpt.dataset.categoryId = cat.id;
    catOpt.innerHTML = `
            <span class="category-option-dot" style="background-color: ${cat.color};"></span>
            ${cat.name}
        `;
    catOpt.classList.toggle("active", activeCategoryFilter === cat.id);
    categoryList.appendChild(catOpt);
  });
}

function startEditCategory(e) {
  const id = e.currentTarget.dataset.id;
  const category = postCategories.find((c) => c.id === id);
  if (category) {
    editingCategoryId = id;
    document.getElementById("newCategoryName").value = category.name;
    document.getElementById("addNewCategoryBtn").textContent = "Save";
    document.getElementById("newCategoryName").focus();
  }
}

function deleteCategory(e) {
  const id = e.currentTarget.dataset.id;
  const category = postCategories.find((c) => c.id === id);
  const categoryName = category ? category.name : "this category";

  showCustomModal(
    I18n.t("modalConfirmDel"), // Reusing title
    I18n.t("catConfirmDel", [categoryName]),
    "confirm",
    () => {
      // Remove from the master list
      postCategories = postCategories.filter((c) => c.id !== id);

      // Remove from all tags
      tags.forEach((tag) => {
        if (tag.categoryIds) {
          tag.categoryIds = tag.categoryIds.filter((catId) => catId !== id);
        }
      });

      // Save both updated data structures
      chrome.storage.local.set({ tags }, () => {
        saveCategoriesAndRerender();
      });
    },
  );
}

function saveCategoriesAndRerender() {
  chrome.storage.local.set({ postCategories }, () => {
    renderCategoriesInModal();
    // Re-populate options list if on the edit page
    if (!AddTagsPage.classList.contains("d-none")) {
      populateCategorySelectOptions();
      updateSelectedCategoriesUI();
    }
  });
}

// in popup.js

function populateCategorySelectOptions() {
  const optionsContainer = document.getElementById("selectCategoryOptions");
  if (!optionsContainer) return;

  optionsContainer.innerHTML = "";

  if (postCategories.length === 0) {
    optionsContainer.innerHTML = `<div style="padding: 10px; font-style: italic; color: #6b7280;">No categories found. Click 'Categories' on the main page to create some.</div>`;
    return;
  }

  postCategories.forEach((cat) => {
    const optionDiv = document.createElement("div");
    optionDiv.className = "option d-flex justify-content-start";
    optionDiv.dataset.id = cat.id;
    // --- START MODIFICATION ---
    // Use innerHTML to add the colored dot
    optionDiv.innerHTML = `
      <span class="category-option-dot" style="background-color: ${cat.color};"></span>
      <span class="option-title">${cat.name}</span>
    `;
    // --- END MODIFICATION ---

    optionDiv.addEventListener("click", () => toggleCategorySelection(cat.id));
    optionsContainer.appendChild(optionDiv);
  });

  updateSelectedCategoriesUI();
}

function toggleCategorySelection(categoryId) {
  const index = selectedCategoryIds.indexOf(categoryId);
  if (index > -1) {
    selectedCategoryIds.splice(index, 1);
  } else {
    selectedCategoryIds.push(categoryId);
  }
  updateSelectedCategoriesUI();
}

// in popup.js

function updateSelectedCategoriesUI() {
  const container = document.getElementById("selectedCategoriesContainer");
  const optionsContainer = document.getElementById("selectCategoryOptions");
  if (!container || !optionsContainer) return;

  container.innerHTML = "";

  selectedCategoryIds.forEach((id) => {
    const category = postCategories.find((c) => c.id === id);
    if (category) {
      const tagItem = document.createElement("div");

      tagItem.className = "tag-item category-pill-style";

      tagItem.style.setProperty("--category-color", category.color);
      tagItem.style.setProperty("--category-bg-color", `${category.color}26`);

      // --- START MODIFICATION ---
      // Force dark text color for better readability on light backgrounds
      tagItem.style.setProperty("--category-text-color", "#1f2937");
      // --- END MODIFICATION ---

      tagItem.innerHTML = `
        <span class="category-option-dot"></span>
        <span>${category.name}</span>
      `;

      const removeTag = document.createElement("span");
      removeTag.className = "remove-tag";
      removeTag.innerHTML = `&times;`;
      removeTag.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleCategorySelection(id);
      });
      tagItem.appendChild(removeTag);
      container.appendChild(tagItem);
    }
  });

  optionsContainer.querySelectorAll(".option").forEach((opt) => {
    if (selectedCategoryIds.includes(opt.dataset.id)) {
      opt.classList.add("selected");
    } else {
      opt.classList.remove("selected");
    }
  });
}

function throttle(func, limit) {
  let inThrottle = false;
  let lastArgs = null;
  let timeoutId = null;

  return function (...args) {
    const context = this;

    if (!inThrottle) {
      // If not on cooldown, execute immediately
      func.apply(context, args);
      inThrottle = true;

      // Set the cooldown timer
      setTimeout(() => {
        inThrottle = false;
        // After cooldown, if there was a call waiting, execute it
        if (lastArgs) {
          func.apply(context, lastArgs);
          lastArgs = null; // Clear the waiting call
          // Restart the cooldown for this trailing call
          inThrottle = true;
          setTimeout(() => (inThrottle = false), limit);
        }
      }, limit);
    } else {
      // If on cooldown, just save the latest arguments
      lastArgs = args;
    }
  };
}

const throttledUpdateLoadingText = throttle((newText) => {
  const loadingContent = document.getElementById("LoadingContent");
  if (loadingContent) {
    loadingContent.textContent = newText;
    console.log("UI updated with throttled message:", newText);
  }
}, 3000); // 500ms is a good, smooth interval.

// in popup.js
// ACTION: Replace the sendAnonymousTelemetry function

async function sendAnonymousTelemetry(postsCompleted, historyEntry) {
  return; // Standalone mode: disable telemetry
  try {
    // 1. Check Consent
    const { allowTelemetry } = await chrome.storage.local.get({
      allowTelemetry: true,
    });
    if (!allowTelemetry) {
      return;
    }

    if (!historyEntry) {
      return;
    }

    // 2. Calculate Stats
    const successfulPosts = postsCompleted.filter(
      (log) =>
        log.response === "successful" || log.response === "pending_approval",
    ).length;

    const failedPosts = postsCompleted.filter(
      (log) => log.response === "failed",
    ).length;

    // Calculate Total Skipped
    const totalSkippedPosts = postsCompleted.filter(
      (log) => log.response === "skipped",
    ).length;

    // --- NEW: Distinguish User vs System Skips ---
    const skippedByUser = postsCompleted.filter(
      (log) => log.response === "skipped" && log.reason === "Stopped by user",
    ).length;

    const skippedBySystem = totalSkippedPosts - skippedByUser;
    // ---------------------------------------------

    const failureReasons = postsCompleted
      .filter((log) => log.response === "failed" && log.reason)
      .reduce((acc, log) => {
        let reasonKey = "other_failure";
        const r = log.reason.toLowerCase();

        if (r.includes("identical")) reasonKey = "identical_content";
        else if (r.includes("blocked") || r.includes("restricted"))
          reasonKey = "action_blocked";
        else if (r.includes("rate limit") || r.includes("slow down"))
          reasonKey = "rate_limited";
        else if (r.includes("timeout")) reasonKey = "timeout";
        else if (r.includes("selector")) reasonKey = "selector_error";

        acc[reasonKey] = (acc[reasonKey] || 0) + 1;
        return acc;
      }, {});

    const manifest = chrome.runtime.getManifest();
    const postsInfo = historyEntry.postsInfo || {};
    const runSettings = postsInfo.settings || {};
    const runTelemetry = postsInfo.telemetry || {};

    // 3. Construct Payload
    const payload = {
      userId: await getAnonymousUserId(),
      runId: historyEntry.id,
      runType: postsInfo.type || "manual",

      totalPostsAttempted: postsCompleted.length,
      successfulPosts,
      failedPosts,

      // Send specific skip counts
      skippedPosts: totalSkippedPosts, // Total for backward compatibility
      skippedByUser: skippedByUser, // NEW field
      skippedBySystem: skippedBySystem, // NEW field

      successRate:
        postsCompleted.length > 0 ? successfulPosts / postsCompleted.length : 0,

      extensionVersion: manifest.version,
      browser: "Chrome",
      failureReasons,
      timestamp: new Date().toISOString(),

      settings: runSettings,
      telemetry: runTelemetry,

      usedSpintax: runSettings.useSpintax || false,
      usedAiEnhance: runSettings.generateAiVariations || false,
      mediaCount: postsInfo.originalSelectedPosts?.[0]?.images?.length || 0,

      errorMessages: (runTelemetry.errors || [])
        .map((e) => `${e.source}: ${e.message}`)
        .slice(0, 50),
    };

    console.log("Sending detailed telemetry payload:", payload);

    const response = await fetch("", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      // Ignore errors silently to not disturb user
    }
  } catch (error) {
    console.error("Failed to send telemetry:", error);
  }
}
async function getAnonymousUserId() {
  let { anonymousUserId } = await chrome.storage.local.get("anonymousUserId");
  if (!anonymousUserId) {
    // Generate a new UUID (simple version)
    anonymousUserId =
      "user_" + Date.now() + Math.random().toString(36).substring(2, 15);
    await chrome.storage.local.set({ anonymousUserId });
  }
  return anonymousUserId;
}

// in popup.js
// ACTION: Replace the generatePostingSummary function

function generatePostingSummary(
  posts,
  groupCollections,
  settings,
  truncatedCount = 0,
) {
  // --- 1. CONTEXT & METRICS ---
  const isQuickPost = posts.length === 1 && posts[0].title === "Quick Post";
  const contextLabel = isQuickPost
    ? I18n.t("tabQuick")
    : I18n.t("headerScheduled");

  let effectiveTemplateCount = posts.length;
  if (settings.generateAiVariations && posts.length === 1) {
    effectiveTemplateCount = 1 + (parseInt(settings.aiVariationCount) || 0);
  }

  // Calculate TOTAL selected groups (Support Dynamic & Static)
  const totalSelectedGroups = groupCollections.reduce((sum, collection) => {
    if (collection.group) {
      if (
        collection.group.type === "dynamic_random" &&
        collection.group.config
      ) {
        return sum + (parseInt(collection.group.config.randomCount) || 0);
      }
      if (collection.group.links && Array.isArray(collection.group.links)) {
        return sum + collection.group.links.length;
      }
    }
    return sum;
  }, 0);

  const actualGroupsToPost = totalSelectedGroups - truncatedCount;

  let finalPostOrder = settings.generateAiVariations
    ? "alternate"
    : settings.postOrder || "sequential";

  // Time Calc
  const baseTimePerOpSeconds = 45;

  // Total Operations Logic
  const totalOperations =
    finalPostOrder === "alternate"
      ? actualGroupsToPost
      : effectiveTemplateCount * actualGroupsToPost;

  const delaySeconds = parseInt(settings.timeDelay) || 300;
  const frequency = Math.max(1, parseInt(settings.groupNumberForDelay) || 1);
  const numberOfBreaks =
    totalOperations > 1 ? Math.floor((totalOperations - 1) / frequency) : 0;
  const totalEstSeconds =
    totalOperations * baseTimePerOpSeconds + numberOfBreaks * delaySeconds;

  let timeText;
  if (totalEstSeconds < 120) timeText = "~1 min";
  else if (totalEstSeconds < 3600)
    timeText = `~${Math.round(totalEstSeconds / 60)} min`;
  else {
    const h = Math.floor(totalEstSeconds / 3600);
    const m = Math.round((totalEstSeconds % 3600) / 60);
    timeText = `~${h}h ${m}m`;
  }

  // --- WARNINGS ---
  const warnings = [];

  // --- TRUNCATION WARNING ---
  if (truncatedCount > 0) {
    const msgBody = I18n.t("modalLimitBody", [
      String(totalSelectedGroups),
      String(MAX_FREE_GROUPS_PER_RUN),
      String(actualGroupsToPost),
    ]);

    const upgradeLink = `<br><a href="#" onclick="document.getElementById('customModal').click(); document.getElementById('headerUpgradeBtn').click(); return false;" style="font-weight:700; color:#b91c1c; text-decoration:underline;">${I18n.t(
      "descPro",
    )}</a>`;

    warnings.push({
      level: "critical",
      title: I18n.t("modalLimitTitle"),
      message: msgBody + upgradeLink,
    });
  }

  // --- SUCCESS STATE (Context-Aware) ---
  if (warnings.length === 0) {
    let successMsg = "";

    // Logic: Differentiate message based on strategy
    if (finalPostOrder === "alternate") {
      // Alternate: 1 post per group, cycling templates
      // "Sending 1 post to each of 10 groups (cycling 3 templates)."
      successMsg = I18n.t("readyMsgAlternate", [
        String(actualGroupsToPost),
        String(effectiveTemplateCount),
      ]);
    } else {
      // Sequential: All templates to all groups
      // "Sending 3 template(s) to each of 10 group(s)."
      successMsg = I18n.t("readyMsgSequential", [
        String(effectiveTemplateCount),
        String(actualGroupsToPost),
      ]);
    }

    warnings.push({
      level: "info",
      title: I18n.t("readyTitle"),
      message: successMsg,
    });
  }

  // --- RENDER UI ---
  let warningsHtml = `<div class="summary-warnings-container" style="display:flex; flex-direction:column; gap:8px; margin-top:16px;">`;

  const severityMap = { critical: 4, high: 3, medium: 2, info: 1, success: 0 };
  warnings.sort((a, b) => severityMap[b.level] - severityMap[a.level]);

  warnings.forEach((w) => {
    let styles = "background:#eff6ff; border:1px solid #dbeafe; color:#1e40af;";
    let icon = "fa-info-circle";

    if (w.level === "critical") {
      styles = "background:#fff1f2; border:1px solid #fecdd3; color:#be123c;";
      icon = "fa-lock";
    }

    warningsHtml += `
      <div style="${styles} padding:12px; border-radius:8px; display:flex; gap:12px; align-items:start;">
        <i class="fa ${icon}" style="font-size:16px; margin-top:3px; flex-shrink:0;"></i>
        <div>
          <div style="font-weight:700; font-size:13px; margin-bottom:3px;">${w.title}</div>
          <div style="font-size:12px; line-height:1.4;">${w.message}</div>
        </div>
      </div>
    `;
  });
  warningsHtml += `</div>`;

  return `
    <div class="posting-summary-container">
      <div class="summary-section">
        <div class="summary-title" style="display:flex; justify-content:space-between; align-items:center;">
            <span>${I18n.t("sumOverview")}</span>
            <span style="font-size:10px; background:#f1f5f9; padding:2px 6px; border-radius:4px; color:#64748b; text-transform:uppercase;">${contextLabel}</span>
        </div>
        <div class="summary-grid">
          <div class="summary-item">
            <span class="summary-label">${I18n.t("sumVolume")}</span>
            <span class="summary-value">
                ${I18n.t("sumGroups", [String(actualGroupsToPost)])} 
                ${
                  truncatedCount > 0
                    ? `<span style='font-size:11px; color:#ef4444; font-weight:400;'>${I18n.t(
                        "sumTruncated",
                        [String(totalSelectedGroups)],
                      )}</span>`
                    : ""
                }
            </span>
          </div>
          <div class="summary-item">
            <span class="summary-label">${I18n.t("sumContent")}</span>
            <span class="summary-value">${I18n.t("sumVariations", [
              String(effectiveTemplateCount),
            ])}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">${I18n.t("sumDuration")}</span>
            <span class="summary-value">${timeText}</span>
          </div>
        </div>
      </div>
      ${warningsHtml}
    </div>
  `;
}
// END REPLACEMENT for generatePostingSummary function
function checkSchedulerPause() {
  chrome.storage.local.get("schedulerPausedUntil", (result) => {
    const banner = document.getElementById("schedulerPausedBanner");
    if (
      result.schedulerPausedUntil &&
      new Date(result.schedulerPausedUntil) > new Date()
    ) {
      banner.classList.remove("d-none");
      document.getElementById("resumeTime").textContent = `at ${new Date(
        result.schedulerPausedUntil,
      ).toLocaleTimeString()}`;
    } else {
      banner.classList.add("d-none");
    }
  });
}

function renderLiveLog(logEntries) {
  const container = document.getElementById("liveLogContainer");
  if (!container) return;

  // Create table structure
  // Note: Table headers are hardcoded here because they are dynamically generated HTML.
  // We use I18n.t() for the header text.
  let tableHtml = `
        <table class="live-log-table">
            <thead>
                <tr>
                    <th class="post-title-col">${I18n.t("lblPostContent")}</th> 
                    <th class="group-title-col">${I18n.t("blockPost").replace(
                      "Post",
                      "Group",
                    )}</th> <!-- Reusing 'Group' from context if available, or just hardcode 'Group' in JSON if preferred. Let's assume 'Group' key exists or use fallback -->
                    <th class="status-col">${I18n.t("lblStatus")}</th>
                </tr>
            </thead>
            <tbody>
    `;

  // Create a row for each entry
  for (const entry of logEntries) {
    let statusHtml = "";
    switch (entry.status) {
      case "pending":
        statusHtml = `<span class="live-log-status status-pending"><div class="spinner"></div><span>${I18n.t(
          "statusPending",
        )}</span></span>`;
        break;
      case "successful":
        statusHtml = `<span class="live-log-status status-success"><i class="fa fa-check"></i><span>${I18n.t(
          "statusSuccess",
        )}</span></span>`;
        break;
      case "pending_approval":
        // Pending approval is conceptually "Pending" for the user, or you can add a specific key
        statusHtml = `<span class="live-log-status status-pending_approval"><i class="fa fa-clock-o"></i><span>${I18n.t(
          "statusPending",
        )}</span></span>`;
        break;
      case "failed":
        // We keep entry.reason as is because it comes from the background/content script logic
        // and might contain technical details that are hard to localize dynamically without a map.
        statusHtml = `<span class="live-log-status status-failed"><i class="fa fa-times" title="${
          entry.reason || "Failed"
        }"></i><span>${I18n.t("statusFailed")}</span></span>`;
        break;
      case "skipped":
        statusHtml = `<span class="live-log-status status-skipped"><span>${I18n.t(
          "statusSkipped",
        )}</span></span>`;
        break;
      default:
        statusHtml = `<span>${entry.status}</span>`;
    }

    // Add a link to the group if the post was successful
    const groupLink = entry.postUrl
      ? `<a href="${entry.postUrl}" target="_blank" title="${I18n.t(
          "btnView",
        )}">${entry.linkTitle}</a>`
      : entry.linkTitle;

    tableHtml += `
            <tr data-log-key="${entry.key}">
                <td class="post-title-col" title="${entry.postTitle}">${entry.postTitle}</td>
                <td class="group-title-col">${groupLink}</td>
                <td class="status-col">${statusHtml}</td>
            </tr>
        `;
  }

  tableHtml += `</tbody></table>`;
  container.innerHTML = tableHtml;

  // Auto-scroll to the bottom
  container.scrollTop = container.scrollHeight;
}

// in popup.js
// ACTION: Replace the entire updateLiveLogWithResult function.

function updateLiveLogWithResult(lastLog, currentEntries) {
  // *** THIS IS THE FIX: The matching logic is now much more specific. ***
  // It finds the first 'pending' entry that matches the post title AND the unique group URL.
  const entryIndex = currentEntries.findIndex(
    (entry) =>
      entry.status === "pending" &&
      entry.postTitle === lastLog.postTitle &&
      entry.linkURL === lastLog.linkURL, // This makes the match unique!
  );

  if (entryIndex > -1) {
    // Update the entry with the result from the background
    currentEntries[entryIndex].status = lastLog.response;
    currentEntries[entryIndex].reason = lastLog.reason;
    currentEntries[entryIndex].postUrl = lastLog.postUrl;
    console.log(
      `Real-time update: Set row for "${lastLog.linkTitle}" to ${lastLog.response}`,
    );
    return currentEntries;
  } else {
    // This can happen if the UI is slightly out of sync, it's not a critical error.
    console.warn(
      "Could not find a matching pending entry for real-time update:",
      lastLog,
    );
  }

  return null; // Return null if no matching pending entry was found
}
// in popup.js
// ACTION: Add this entire code block to the end of the file.

// --- START: POST TARGETER FEATURE (ADVANCED GROUP SELECTION) ---

// Global state for the targeting modal
let activeTargeterContext = "scheduler"; // 'scheduler' or 'quickpost'
let allAvailableGroupsFlat = []; // A flattened cache of all groups for searching
let targeterState = {
  selectedCollectionIndices: new Set(),
  selectedIndividualGroups: new Map(), // Stores { uniqueLink => { title, url, collectionTitle } }
  mode: "all", // 'all' or 'random'
  randomCount: 10,
};

// --- UI Element References ---
const postTargeterModal = document.getElementById("postTargeterModal");
const advancedGroupSelectionBtn = document.getElementById(
  "advancedGroupSelectionBtn",
);
const quickAdvancedGroupSelectionBtn = document.getElementById(
  "quickAdvancedGroupSelectionBtn",
);
const postTargeterCloseBtn = document.getElementById("postTargeterCloseBtn");
const postTargeterCancelBtn = document.getElementById("postTargeterCancelBtn");
const postTargeterConfirmBtn = document.getElementById(
  "postTargeterConfirmBtn",
);
const targeterIndividualSearch = document.getElementById(
  "targeterIndividualSearch",
);

// --- Event Listeners ---

async function openPostTargeter(context, blockRef = null) {
  const modal = document.getElementById("postTargeterModal");

  // --- ADDED DEBUG CHECK ---
  if (!modal) {
    console.error("CRITICAL ERROR: #postTargeterModal not found in HTML.");
    alert(
      "Error: The 'Advanced Selector' modal is missing from the interface. Please check popup.html.",
    );
    return;
  }
  // -------------------------

  activeTargeterContext = context;
  activeTargeterBlockRef = blockRef;
  console.log(`Opening Post Targeter. Context: ${context}`);

  // Fetch fresh data
  const { groups: currentGroups = [] } =
    await chrome.storage.local.get("groups");

  resetPostTargeterState();
  buildAllGroupsCache(currentGroups);
  populateTargeterCollections(currentGroups);
  updateSelectedIndividualsUI();
  updateSummaryAndConfig(currentGroups);

  modal.classList.remove("d-none");
  setTimeout(() => modal.classList.add("show"), 10);
}

function closePostTargeter() {
  postTargeterModal.classList.remove("show");
  setTimeout(() => postTargeterModal.classList.add("d-none"), 250);
}

// in popup.js
// ACTION: Replace the resetPostTargeterState function

function resetPostTargeterState() {
  targeterState = {
    selectedCollectionIndices: new Set(),
    selectedIndividualGroups: new Map(),
    mode: "all",
    randomCount: 10,
  };
  // Reset UI inside the modal
  document.getElementById("targeterIndividualSearch").value = "";
  document.getElementById("targeterSearchResults").classList.add("d-none");
  document.getElementById("targetModeAll").checked = true;
  document.getElementById("targeterRandomOptions").classList.add("d-none");
  document.getElementById("targeterRandomCount").value = 10;

  // Reset the Freshness Priority Toggle
  const freshToggle = document.getElementById("prioritizeFreshToggle");
  if (freshToggle) freshToggle.checked = false;
}
function buildAllGroupsCache(currentGroups) {
  allAvailableGroupsFlat = [];
  (currentGroups || []).forEach((collection, collectionIndex) => {
    (collection.links || []).forEach(([title, url]) => {
      allAvailableGroupsFlat.push({
        title,
        url,
        collectionTitle: collection.title,
        collectionIndex,
      });
    });
  });
}

function populateTargeterCollections(currentGroups) {
  let listGroup = document
    .getElementById("targeterCollectionList")
    ?.querySelector(".list-group");
  if (!listGroup) return;
  listGroup.innerHTML = "";

  // Use event delegation here as well
  listGroup.replaceWith(listGroup.cloneNode(true));
  listGroup = document
    .getElementById("targeterCollectionList")
    .querySelector(".list-group");

  if (!currentGroups || currentGroups.length === 0) {
    listGroup.innerHTML =
      listGroup.innerHTML = `<p class="text-center text-muted p-3">${I18n.t(
        "targeterNoColls",
      )}</p>`;
    return;
  }

  currentGroups.forEach((group, index) => {
    const listItem = document.createElement("div");
    listItem.className = "list-group-item";
    listItem.setAttribute("data-index", index);

    // --- THIS IS THE FIX ---
    const { badgeHTML, tooltipContent } = createFreshnessBarHTML(
      index,
      currentGroups,
    );

    listItem.innerHTML = `
            <div class="collection-details">
                <div class="form-check">
                    <input class="form-check-input collection-checkbox" type="checkbox" value="${index}" id="collection-check-${index}">
                    <label class="form-check-label" for="collection-check-${index}">${group.title}</label>
                </div>
            </div>
            <div class="collection-info-badge">${badgeHTML}</div>
        `;

    const infoBadge = listItem.querySelector(".collection-info-badge");
    if (infoBadge && tooltipContent) {
      infoBadge.addEventListener("mouseenter", () =>
        showFreshnessTooltip(infoBadge, tooltipContent),
      );
      infoBadge.addEventListener("mouseleave", hideFreshnessTooltip);
    }
    // --- END FIX ---

    listGroup.appendChild(listItem);
  });

  listGroup.addEventListener("click", (event) => {
    const listItem = event.target.closest(".list-group-item");
    if (!listItem) return;

    const checkbox = listItem.querySelector(".collection-checkbox");
    if (event.target !== checkbox) {
      checkbox.checked = !checkbox.checked;
    }

    const index = parseInt(checkbox.value, 10);
    if (checkbox.checked) {
      targeterState.selectedCollectionIndices.add(index);
    } else {
      targeterState.selectedCollectionIndices.delete(index);
    }
    updateSummaryAndConfig(currentGroups);
  });
}
function handleIndividualSearch(event) {
  const searchTerm = event.target.value.toLowerCase();
  const resultsContainer = document.getElementById("targeterSearchResults");
  resultsContainer.innerHTML = "";

  if (searchTerm.length < 2) {
    resultsContainer.classList.add("d-none");
    return;
  }

  const filtered = allAvailableGroupsFlat.filter((g) =>
    g.title.toLowerCase().includes(searchTerm),
  );

  if (filtered.length > 0) {
    resultsContainer.classList.remove("d-none");
    filtered.slice(0, 50).forEach((group) => {
      // Limit to 50 results for performance
      const optionDiv = document.createElement("div");
      optionDiv.className = "option";
      optionDiv.innerHTML = `
                <span class="option-title">${group.title}</span>
                <span class="option-collection-name">${group.collectionTitle}</span>
            `;
      optionDiv.addEventListener("click", () => addIndividualGroup(group));
      resultsContainer.appendChild(optionDiv);
    });
  } else {
    resultsContainer.classList.add("d-none");
  }
}

// in popup.js
// ACTION: Replace the `addIndividualGroup`, `removeIndividualGroup`, and `handleTargetingModeChange` functions.

function addIndividualGroup(group) {
  targeterState.selectedIndividualGroups.set(group.url, group);
  document.getElementById("targeterIndividualSearch").value = "";
  document.getElementById("targeterSearchResults").classList.add("d-none");
  updateSelectedIndividualsUI();
  updateSummaryAndConfig(); // No longer needs to be async or pass data
}

function removeIndividualGroup(groupUrl) {
  targeterState.selectedIndividualGroups.delete(groupUrl);
  updateSelectedIndividualsUI();
  updateSummaryAndConfig(); // No longer needs to be async or pass data
}

function handleTargetingModeChange() {
  const mode = document.querySelector(
    'input[name="targetingMode"]:checked',
  ).value;
  targeterState.mode = mode;
  document
    .getElementById("targeterRandomOptions")
    .classList.toggle("d-none", mode !== "random");
  updateSummaryAndConfig(); // No longer needs to be async or pass data
}

function updateSelectedIndividualsUI() {
  const container = document.getElementById("targeterSelectedIndividuals");
  container.innerHTML = "";
  targeterState.selectedIndividualGroups.forEach((group) => {
    const tagItem = document.createElement("div");
    tagItem.className = "tag-item";
    tagItem.textContent = group.title;
    const removeTag = document.createElement("span");
    removeTag.className = "remove-tag";
    removeTag.innerHTML = "&times;";
    removeTag.addEventListener("click", () => removeIndividualGroup(group.url));
    tagItem.appendChild(removeTag);
    container.appendChild(tagItem);
  });
}
// in popup.js
// ACTION: Replace the entire `updateSummaryAndConfig` function.

async function updateSummaryAndConfig() {
  const summaryTextEl = document.getElementById("targeterSummaryText");
  const modeContainer = document.getElementById("targeterModeContainer");
  const confirmButton = document.getElementById("postTargeterConfirmBtn");
  const randomCountInput = document.getElementById("targeterRandomCount");

  const { groups: currentGroups = [] } =
    await chrome.storage.local.get("groups");

  // --- START: MODIFICATION FOR DUPLICATE COUNTING ---

  // 1. Count the raw total number of links first.
  let rawTotalLinks = 0;
  const allLinks = new Set();

  targeterState.selectedCollectionIndices.forEach((index) => {
    const links = currentGroups[index]?.links || [];
    rawTotalLinks += links.length;
    links.forEach((linkPair) => allLinks.add(linkPair[1]));
  });

  // We only add to rawTotalLinks if the individual group isn't already part of a selected collection.
  targeterState.selectedIndividualGroups.forEach((group) => {
    // Check if this group's URL is already accounted for in the Set
    if (!allLinks.has(group.url)) {
      rawTotalLinks++;
    }
    allLinks.add(group.url); // Add to the set regardless to get the final unique count
  });

  const totalUniqueGroups = allLinks.size;
  const duplicatesFound = rawTotalLinks - totalUniqueGroups;

  // --- END: MODIFICATION FOR DUPLICATE COUNTING ---

  if (totalUniqueGroups > 0) {
    modeContainer.classList.remove("d-none");
    confirmButton.disabled = false;
  } else {
    summaryTextEl.textContent = I18n.t("targeterSummaryInit");
    modeContainer.classList.add("d-none");
    confirmButton.disabled = true;
    return;
  }

  randomCountInput.max = totalUniqueGroups;
  let currentRandomCount = parseInt(randomCountInput.value, 10);
  if (isNaN(currentRandomCount) || currentRandomCount < 1) {
    currentRandomCount = 1;
  }
  if (currentRandomCount > totalUniqueGroups) {
    currentRandomCount = totalUniqueGroups;
    randomCountInput.value = totalUniqueGroups;
  }
  targeterState.randomCount = currentRandomCount;

  // --- START: MODIFICATION FOR SUMMARY TEXT ---

  // 5. Build the new, more informative summary text.
  let summaryMain = I18n.t("targeterSummaryMain", [String(totalUniqueGroups)]);

  // Conditionally add the deduplication message.
  if (duplicatesFound > 0) {
    summaryMain += ` <span style="color: #6b7280; font-style: italic;">${I18n.t(
      "targeterDedup",
      [String(duplicatesFound)],
    )}</span>`;
  }

  let summaryMode = "";
  if (targeterState.mode === "random") {
    summaryMode = I18n.t("targeterLblRandom", [
      String(targeterState.randomCount),
    ]);
  } else {
    summaryMode = I18n.t("targeterLblAll", [String(totalUniqueGroups)]);
  }
  summaryTextEl.innerHTML = `${summaryMain}<br>${summaryMode}`;

  // --- END: MODIFICATION FOR SUMMARY TEXT ---
}

// in popup.js
// ACTION: Replace handleTargeterConfirm

async function handleTargeterConfirm() {
  const { groups: currentGroups = [] } =
    await chrome.storage.local.get("groups");
  let resultGroup = null;

  // 1. Determine Result Object based on Mode
  if (targeterState.mode === "random") {
    // --- DYNAMIC MODE (The fix) ---
    // We create a rule object, NOT a resolved list of links.
    const collectionIndices = Array.from(
      targeterState.selectedCollectionIndices,
    );
    const manualLinks = Array.from(
      targeterState.selectedIndividualGroups.values(),
    ).map((g) => [g.title, g.url]);

    const summaryTitle = `Random: ${targeterState.randomCount} from selection`;

    resultGroup = {
      type: "dynamic_random", // Critical flag
      title: summaryTitle,
      config: {
        randomCount: targeterState.randomCount,
        collectionIndices: collectionIndices,
        manualLinks: manualLinks,
        prioritizeFresh:
          document.getElementById("prioritizeFreshToggle")?.checked || false,
      },
    };
  } else {
    // --- STATIC MODE (Existing logic) ---
    // Resolve links now
    const finalLinksMap = new Map();
    targeterState.selectedCollectionIndices.forEach((index) => {
      (currentGroups[index]?.links || []).forEach(([title, url]) => {
        if (!finalLinksMap.has(url)) finalLinksMap.set(url, [title, url]);
      });
    });
    targeterState.selectedIndividualGroups.forEach((group) => {
      if (!finalLinksMap.has(group.url))
        finalLinksMap.set(group.url, [group.title, group.url]);
    });

    const finalLinksArray = Array.from(finalLinksMap.values());
    resultGroup = {
      type: "static",
      title: `Advanced: ${finalLinksArray.length} Groups`,
      links: finalLinksArray,
    };
  }

  // 2. Handle Context
  if (activeTargeterContext === "campaign" && activeTargeterBlockRef) {
    addAdvancedGroupToBlock(activeTargeterBlockRef, resultGroup);
  } else if (activeTargeterContext === "aiwizard") {
    // Add to global wizard list
    wizardAdvancedGroups.push(resultGroup);

    // Render Pill in Wizard UI
    const pillsContainer = document.querySelector(
      '.block-selected-pills[data-type="wizard-group"]',
    );
    const pill = document.createElement("div");
    pill.className = "block-pill";
    // Add a special class/icon if it's dynamic
    const icon =
      resultGroup.type === "dynamic_random"
        ? '<i class="fa fa-random"></i>'
        : '<i class="fa fa-list"></i>';

    pill.innerHTML = `<span class="text-primary">${icon} ${resultGroup.title}</span><span class="remove">&times;</span>`;

    // We use the object reference for removal
    const objRef = resultGroup;
    pill.querySelector(".remove").onclick = () => {
      const idx = wizardAdvancedGroups.indexOf(objRef);
      if (idx > -1) wizardAdvancedGroups.splice(idx, 1);
      pill.remove();
    };
    pillsContainer.appendChild(pill);
  } else {
    // Scheduler / Quick Post
    // If dynamic, resolve immediately to static for these single-run modes
    if (resultGroup.type === "dynamic_random") {
      const resolved = resolveDynamicGroupLocally(resultGroup, currentGroups);
      updateMainPageWithAdvancedSelection(resolved);
    } else {
      updateMainPageWithAdvancedSelection(resultGroup);
    }
  }

  closePostTargeter();
}

// Helper to resolve dynamic groups immediately (for non-campaign context)
function resolveDynamicGroupLocally(dynamicData, allGroups) {
  const config = dynamicData.config;
  let pool = [...config.manualLinks];

  config.collectionIndices.forEach((idx) => {
    if (allGroups[idx]) pool.push(...(allGroups[idx].links || []));
  });

  // Deduplicate
  const unique = new Map(pool.map((l) => [l[1], l])); // Map by URL
  let finalPool = Array.from(unique.values());

  // Shuffle
  for (let i = finalPool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [finalPool[i], finalPool[j]] = [finalPool[j], finalPool[i]];
  }

  // Slice
  const selected = finalPool.slice(0, config.randomCount);

  return {
    title: dynamicData.title,
    links: selected,
  };
}

// in popup.js
// ACTION: Update addAdvancedGroupToBlock

function addAdvancedGroupToBlock(block, groupData) {
  // 1. Find the pill container (Now searching block-wide)
  const pillsContainer = block.querySelector(
    '.block-selected-pills[data-type="group"]',
  );
  if (!pillsContainer) return;

  // 2. Create pill
  const pill = document.createElement("div");
  pill.className = "block-pill";
  pill.dataset.isAdvanced = "true";
  pill.dataset.groupData = JSON.stringify(groupData);

  pill.innerHTML = `
    <span class="text-primary font-weight-bold"><i class="fa fa-magic"></i> ${groupData.title}</span>
    <span class="block-pill-remove">&times;</span>
  `;

  pill.querySelector(".block-pill-remove").addEventListener("click", (e) => {
    e.stopPropagation();
    pill.remove();
    updatePostBlockSummary(block); // Update summary on remove
  });

  pillsContainer.appendChild(pill);

  // 3. Update summary on add
  updatePostBlockSummary(block);
}

// in popup.js
// ACTION: Replace the updateMainPageWithAdvancedSelection function

function updateMainPageWithAdvancedSelection(advancedGroup) {
  const isScheduler = activeTargeterContext === "scheduler";
  const mainPageSelectedGroups = isScheduler
    ? selectedGroups
    : quickSelectedGroups;
  const container = isScheduler
    ? selectedGroupsContainer
    : quickSelectedGroupsContainer;

  // 1. Add our new advanced selection as a single item to the state.
  const advancedIndex = Date.now(); // A unique ID for this pill
  mainPageSelectedGroups.push({ index: advancedIndex, group: advancedGroup });

  // 2. Render ONLY the new summary pill to the UI.
  const summaryPill = document.createElement("div");
  summaryPill.className = "tag-item advanced-selection-summary";
  summaryPill.textContent = advancedGroup.title;

  const removeTag = document.createElement("span");
  removeTag.className = "remove-tag";
  removeTag.innerHTML = "&times;";
  removeTag.addEventListener("click", () => {
    // Find and remove this specific advanced selection from the state array.
    const itemIndex = mainPageSelectedGroups.findIndex(
      (entry) => entry.index === advancedIndex,
    );
    if (itemIndex > -1) {
      mainPageSelectedGroups.splice(itemIndex, 1);
    }
    // Remove the pill from the UI.
    summaryPill.remove();

    // Re-validate the main page buttons.
    if (isScheduler) {
      enableStartPostingIfReady();
      updateSchedulerFeatureVisibility(); // <--- ADDED: Refresh UI features on remove
    } else {
      updateQuickPostButton();
    }
  });
  summaryPill.appendChild(removeTag);
  container.appendChild(summaryPill);

  // 3. Re-validate the main page buttons and UI features.
  if (isScheduler) {
    enableStartPostingIfReady();
    updateSchedulerFeatureVisibility(); // <--- ADDED: Refresh UI features on add
  } else {
    updateQuickPostButton();
  }
}

async function handleBackupData() {
  console.log("Starting data backup...");
  try {
    const dataToBackup = await chrome.storage.local.get(["tags", "groups"]);

    // Create a deep copy and strip out media data from tags
    const backupObject = {
      tags: (dataToBackup.tags || []).map((tag) => {
        const { images, ...restOfTag } = tag; // Destructure to exclude 'images'
        return restOfTag; // Return the tag object without the 'images' property
      }),
      groups: dataToBackup.groups || [],
      backupVersion: 1, // Versioning for future compatibility
      exportDate: new Date().toISOString(),
    };

    if (backupObject.tags.length === 0 && backupObject.groups.length === 0) {
      showCustomModal("Backup", "There is no data to back up.");
      return;
    }

    const jsonString = JSON.stringify(backupObject, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    const date = new Date();
    const dateString = `${date.getFullYear()}-${String(
      date.getMonth() + 1,
    ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    a.href = url;
    a.download = `autoposter_backup_${dateString}.json`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log("Data backup successful.");
    showCustomModal(I18n.t("backupTitle"), I18n.t("backupMsg"));
  } catch (error) {
    console.error("Error during data backup:", error);
    showCustomModal(
      I18n.t("backupErrTitle"),
      I18n.t("backupErrMsg", [error.message]),
    );
  }
}

function handleRestoreData(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (file.type !== "application/json") {
    showCustomModal(I18n.t("restoreErrTitle"), I18n.t("restoreErrJson"));
    event.target.value = null; // Reset file input
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const restoredData = JSON.parse(e.target.result);

      // Validate the structure of the backup file
      const isValid =
        restoredData &&
        typeof restoredData === "object" &&
        Array.isArray(restoredData.tags) &&
        Array.isArray(restoredData.groups);

      if (!isValid) {
        throw new Error(
          "The selected file is not a valid backup file.",
        );
      }

      showCustomModal(
        I18n.t("restoreTitle"),
        I18n.t("restoreMsg", [
          String(restoredData.tags.length),
          String(restoredData.groups.length),
        ]),
        "confirm",
        async () => {
          // onConfirm
          try {
            const currentData = await chrome.storage.local.get([
              "tags",
              "groups",
            ]);

            // Merge Data (Append new, non-duplicate items)
            const currentTags = currentData.tags || [];
            const currentGroups = currentData.groups || [];

            // Use titles to check for duplicates
            const currentTagTitles = new Set(currentTags.map((t) => t.title));
            const newTags = restoredData.tags.filter(
              (t) => !currentTagTitles.has(t.title),
            );

            const currentGroupTitles = new Set(
              currentGroups.map((g) => g.title),
            );
            const newGroups = restoredData.groups.filter(
              (g) => !currentGroupTitles.has(g.title),
            );

            const finalTags = [...currentTags, ...newTags];
            const finalGroups = [...currentGroups, ...newGroups];

            await chrome.storage.local.set({
              tags: finalTags,
              groups: finalGroups,
            });

            // Update global variables and UI
            tags = finalTags;
            groups = finalGroups;
            LoadTags();
            LoadGroups();

            showCustomModal(
              I18n.t("restoreSuccessTitle"),
              I18n.t("restoreSuccessMsg", [
                String(newTags.length),
                String(newGroups.length),
              ]),
            );
          } catch (saveError) {
            console.error("Error saving restored data:", saveError);
            showCustomModal(
              I18n.t("restoreErrTitle"),
              I18n.t("restoreErrMsg", [error.message]),
            );
          }
        },
        null, // onCancel
        I18n.t("valYes"), // "Yes" / "Igen" (reusing existing key or create restoreBtnYes)
        I18n.t("btnCancel"),
      );
    } catch (error) {
      console.error("Error parsing restore file:", error);
      showCustomModal(
        I18n.t("restoreErrTitle"),
        I18n.t("restoreErrMsg", [error.message]),
      );
    } finally {
      event.target.value = null; // Reset file input
    }
  };
  reader.readAsText(file);
}
// in popup.js
// ACTION: Add this entire block of new code to the end of the file.

// --- START: GROUP FRESHNESS SCORER FEATURE ---

let groupFreshnessCache = new Map(); // Cache: { groupUrl: lastPostTimestamp }
let collectionScoresCache = {}; // Cache: { collectionIndex: { hot, warm, fresh, new } }

// in popup.js
// ACTION: Replace the entire calculateAllFreshnessScores function

async function calculateAllFreshnessScores() {
  console.log("Calculating group freshness scores...");
  const { postingHistory = [], groups: currentGroups = [] } =
    await chrome.storage.local.get(["postingHistory", "groups"]);

  // 1. Build a map of the most recent post time for every unique group URL in history.
  groupFreshnessCache.clear();

  // Define valid statuses that indicate a post was sent to the group
  const validStatuses = ["successful", "pending_approval", "processing_video"];

  for (const historyEntry of postingHistory) {
    for (const post of historyEntry.postsCompleted || []) {
      // Check if the response is in our valid list
      if (validStatuses.includes(post.response) && post.linkURL) {
        const postTimestamp = new Date(historyEntry.timestamp).getTime();

        // Normalize URL (remove trailing slashes) to ensure matches
        const normalizedUrl = post.linkURL.replace(/\/$/, "");

        if (
          !groupFreshnessCache.has(normalizedUrl) ||
          postTimestamp > groupFreshnessCache.get(normalizedUrl)
        ) {
          groupFreshnessCache.set(normalizedUrl, postTimestamp);
        }
      }
    }
  }

  // 2. Now, calculate the aggregate score for each collection.
  collectionScoresCache = {};
  const now = Date.now();
  const twoDaysAgo = now - 2 * 24 * 60 * 60 * 1000;
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

  currentGroups.forEach((collection, index) => {
    const scores = { hot: 0, warm: 0, fresh: 0, total: 0 };
    const links = collection.links || [];

    if (links.length === 0) {
      collectionScoresCache[index] = scores;
      return;
    }

    scores.total = links.length;
    links.forEach(([, url]) => {
      const normalizedUrl = (url || "").replace(/\/$/, "");
      const lastPostTime = groupFreshnessCache.get(normalizedUrl);

      if (!lastPostTime) {
        scores.fresh++; // Never posted to
      } else if (lastPostTime > twoDaysAgo) {
        scores.hot++; // Posted < 2 days ago
      } else if (lastPostTime > sevenDaysAgo) {
        scores.warm++; // Posted 2-7 days ago
      } else {
        scores.fresh++; // Posted > 7 days ago
      }
    });
    collectionScoresCache[index] = scores;
  });

  console.log("Freshness scores calculated and cached:", collectionScoresCache);
}

function createFreshnessBarHTML(collectionIndex, currentGroups) {
  const scores = collectionScoresCache[collectionIndex];
  if (!scores) {
    const collection = currentGroups[collectionIndex];
    const linkCount = collection?.links?.length || 0;
    return {
      badgeHTML: `<div class="info-badge-counter">${I18n.t("countLinks", [
        String(linkCount),
      ])}</div>`,
      tooltipContent: "",
    };
  }

  const hotPercent = scores.total > 0 ? (scores.hot / scores.total) * 100 : 0;
  const warmPercent = scores.total > 0 ? (scores.warm / scores.total) * 100 : 0;
  const freshPercent =
    scores.total > 0 ? (scores.fresh / scores.total) * 100 : 0;

  const badgeHTML = `
        <div class="info-badge-counter">${I18n.t("countLinks", [
          String(scores.total),
        ])}</div>
        <div class="freshness-bar">
            <div class="freshness-bar-segment hot" style="width: ${hotPercent}%"></div>
            <div class="freshness-bar-segment warm" style="width: ${warmPercent}%"></div>
            <div class="freshness-bar-segment fresh" style="width: ${freshPercent}%"></div>
        </div>
    `;

  // FIX: Localized Tooltip
  const tooltipContent = `
        <div class="tooltip-header">${I18n.t("freshTitle")}</div>
        <div class="tooltip-row"><div class="tooltip-color-dot" style="background-color: #ef4444;"></div><span>${I18n.t(
          "freshHot",
          [String(scores.hot)],
        )}</span></div>
        <div class="tooltip-row"><div class="tooltip-color-dot" style="background-color: #f59e0b;"></div><span>${I18n.t(
          "freshWarm",
          [String(scores.warm)],
        )}</span></div>
        <div class="tooltip-row"><div class="tooltip-color-dot" style="background-color: #22c55e;"></div><span>${I18n.t(
          "freshCool",
          [String(scores.fresh)],
        )}</span></div>
    `;

  return { badgeHTML, tooltipContent };
}

// Create a single tooltip element that will be reused for all freshness bars.
let freshnessTooltip = null;
function createGlobalTooltip() {
  if (document.getElementById("freshness-tooltip-global")) return;
  freshnessTooltip = document.createElement("div");
  freshnessTooltip.id = "freshness-tooltip-global";
  freshnessTooltip.className = "freshness-tooltip";
  freshnessTooltip.innerHTML =
    '<div class="tooltip-arrow"></div><div class="tooltip-content"></div>';
  document.body.appendChild(freshnessTooltip);
}

function showFreshnessTooltip(targetElement, content) {
  const tooltipEl = getOrCreateGlobalTooltip();

  tooltipEl.querySelector(".tooltip-content").innerHTML = content;
  tooltipEl.style.visibility = "visible";
  tooltipEl.style.opacity = "1";
  tooltipEl.style.top = "-9999px";

  const targetRect = targetElement.getBoundingClientRect();
  const tooltipRect = tooltipEl.getBoundingClientRect();

  // --- ZOOM CORRECTION ---
  const ZOOM_FACTOR = 0.8;

  // Scale rects back to "CSS pixels" relative to the zoomed context
  const tTop = targetRect.top / ZOOM_FACTOR;
  const tBottom = targetRect.bottom / ZOOM_FACTOR;
  const tLeft = targetRect.left / ZOOM_FACTOR;
  const tWidth = targetRect.width / ZOOM_FACTOR;

  const ttHeight = tooltipRect.height / ZOOM_FACTOR;
  const ttWidth = tooltipRect.width / ZOOM_FACTOR;
  const clientWidth = document.documentElement.clientWidth / ZOOM_FACTOR;

  let top, left;

  // Position Logic using Corrected Values
  top = tTop - ttHeight - 7;
  tooltipEl.classList.add("show-above");
  tooltipEl.classList.remove("show-below");

  if (top < 5) {
    top = tBottom + 7;
    tooltipEl.classList.remove("show-above");
    tooltipEl.classList.add("show-below");
  }

  left = tLeft + tWidth / 2 - ttWidth / 2;

  if (left < 5) left = 5;
  if (left + ttWidth > clientWidth - 5) {
    left = clientWidth - ttWidth - 5;
  }

  tooltipEl.style.left = `${left}px`;
  tooltipEl.style.top = `${top}px`;
}

// Function to hide the tooltip
function hideFreshnessTooltip() {
  const tooltipEl = getOrCreateGlobalTooltip(); // Ensures we have a reference to the element
  tooltipEl.style.visibility = "hidden";
  tooltipEl.style.opacity = "0";
}

// --- END: Global Tooltip Management ---
function getOrCreateGlobalTooltip() {
  let tooltipEl = document.getElementById("freshness-tooltip-global");
  if (!tooltipEl) {
    console.log("Creating global tooltip element for the first time.");
    tooltipEl = document.createElement("div");
    tooltipEl.id = "freshness-tooltip-global";
    tooltipEl.className = "freshness-tooltip";
    tooltipEl.innerHTML =
      '<div class="tooltip-arrow"></div><div class="tooltip-content"></div>';
    document.body.appendChild(tooltipEl);
  }
  return tooltipEl;
}

// Sync the editor content to the state object immediately
function syncEditorToState() {
  if (!quill) return;
  const html = quill.root.innerHTML;
  const isEmpty = html === "<p><br></p>" || html.trim() === "";

  currentTemplateVariations[activeVariationTab] = {
    html: isEmpty ? "" : html,
    delta: quill.getContents(),
  };

  // Update UI lock states whenever text changes
  updateVariationTabsLockState();
}

function moveVariationHighlight(targetElement) {
  const container = document.getElementById("variationPillsContainer");
  const highlight = container?.querySelector(".variation-pill-highlight");

  if (container && highlight && targetElement) {
    const pills = Array.from(container.querySelectorAll(".variation-pill"));
    const index = pills.indexOf(targetElement);
    const pillWidth = targetElement.offsetWidth;

    // Assuming standard 4px gap and padding
    const translateX = index * (pillWidth + 4);

    highlight.style.width = `${pillWidth}px`;
    highlight.style.transform = `translateX(${translateX}px)`;
  }
}

function updateVariationTabsLockState() {
  const tabs = ["A", "B", "C", "D"];

  tabs.forEach((tabKey, index) => {
    const btn = document.querySelector(
      `.variation-pill[data-variation="${tabKey}"]`,
    );
    if (!btn) return;

    if (index === 0) {
      // A is always enabled
      btn.disabled = false;
    } else {
      // Check if the PREVIOUS tab has content
      const prevKey = tabs[index - 1];
      const prevContent = currentTemplateVariations[prevKey].html;
      const hasContent =
        prevContent &&
        prevContent.trim() !== "" &&
        prevContent !== "<p><br></p>";

      btn.disabled = !hasContent;
    }
  });
}

function handleVariationTabClick(e) {
  const targetButton = e.currentTarget;
  const targetTab = targetButton.dataset.variation;

  if (targetTab === activeVariationTab) return;

  // 1. Force sync before switching
  syncEditorToState();

  // 2. Update UI classes (Use custom class, NOT .active)
  document
    .querySelectorAll(".variation-pill")
    .forEach((t) => t.classList.remove("variation-selected"));
  targetButton.classList.add("variation-selected");
  moveVariationHighlight(targetButton);

  // 3. Switch active variable
  activeVariationTab = targetTab;

  // 4. Load content
  const newContent = currentTemplateVariations[targetTab];
  if (
    newContent.delta &&
    newContent.delta.ops &&
    newContent.delta.ops.length > 0
  ) {
    quill.setContents(newContent.delta);
  } else if (newContent.html) {
    quill.root.innerHTML = newContent.html;
  } else {
    quill.setContents([]);
  }

  updateQuillCharCounter();
}

function resetVariations() {
  // Wipe state
  currentTemplateVariations = {
    A: { html: "", delta: null },
    B: { html: "", delta: null },
    C: { html: "", delta: null },
    D: { html: "", delta: null },
  };
  activeVariationTab = "A";

  // Reset UI tabs
  const pills = document.querySelectorAll(".variation-pill");
  pills.forEach((t) => t.classList.remove("variation-selected"));

  const tabA = document.querySelector('.variation-pill[data-variation="A"]');
  if (tabA) {
    tabA.classList.add("variation-selected");
    tabA.disabled = false;
    setTimeout(() => moveVariationHighlight(tabA), 10);
  }

  // Disable B, C, D initially
  updateVariationTabsLockState();
}
function parseSpintaxString(str) {
  const parts = [];
  let depth = 0;
  let currentPart = "";

  for (let i = 0; i < str.length; i++) {
    const char = str[i];

    if (char === "{") {
      depth++;
      currentPart += char;
    } else if (char === "}") {
      depth = Math.max(0, depth - 1); // Prevent negative depth
      currentPart += char;
    } else if (char === "|" && depth === 0) {
      // Found a separator at the top level
      parts.push(currentPart);
      currentPart = "";
    } else {
      currentPart += char;
    }
  }

  // Push the last accumulated part
  if (currentPart) {
    parts.push(currentPart);
  }

  return parts;
}
// in popup.js
// ACTION: Replace the entire initHierarchicalNav function.

function initHierarchicalNav() {
  // --- PARENT 1: COMPOSE ---
  const mainPostBtn = document.getElementById("mainNavPostBtn");
  const postSubNavContainer = document.getElementById("postSubNavContainer");
  const postTrack = document.getElementById("postSwitcherTrack");
  const quickPostBtn = document.getElementById("quickPostBTN");
  const schedulerBtn = document.getElementById("SchedulerBTN");

  // --- PARENT 2: TEMPLATES ---
  const mainTemplatesBtn = document.getElementById("mainNavTemplatesBtn");
  const templatesSubNavContainer = document.getElementById(
    "templatesSubNavContainer",
  );
  const templatesTrack = document.getElementById("templatesSwitcherTrack");
  const tagBtn = document.getElementById("tagBTN");
  const groupBtn = document.getElementById("groupBTN");

  // --- TOP NAV SIBLINGS (Simple Pages) ---
  const scheduledBtn = document.getElementById("scheduledPostsBtn");
  const historyBtn = document.getElementById("historyBTN");
  const campaignsBtn = document.getElementById("campaignsBTN");

  // Hard guard: if critical nav elements are missing, skip setup
  if (
    !mainPostBtn ||
    !postSubNavContainer ||
    !postTrack ||
    !quickPostBtn ||
    !schedulerBtn ||
    !mainTemplatesBtn ||
    !templatesSubNavContainer ||
    !templatesTrack ||
    !tagBtn ||
    !groupBtn
  ) {
    console.warn("initHierarchicalNav: missing core nav elements.");
    return;
  }

  // Define all content page IDs for easy toggling
  const allPageIds = [
    "SchedulerPage",
    "quickPostPage", // Compose Pages
    "TagsPage",
    "groupsPage",
    "productPage", // Template Pages
    "scheduledPostsPage",
    "historyPage",
    "CampaignsPage", // Sibling Pages
  ];

  // --- HELPER: Visual State Management ---

  const hideAllPages = () => {
    allPageIds.forEach((id) =>
      document.getElementById(id)?.classList.add("d-none"),
    );
  };

  const updateSwitcherVisuals = (track, btn1, btn2, activeDataValue) => {
    if (btn2.classList.contains("active")) {
      track.setAttribute("data-active", activeDataValue);
      btn2.classList.add("active");
      btn1.classList.remove("active");
    } else {
      track.removeAttribute("data-active"); // Default position
      btn1.classList.add("active");
      btn2.classList.remove("active");
    }
  };

  const resetAllParents = () => {
    mainPostBtn.classList.remove("active");
    mainTemplatesBtn.classList.remove("active");

    // Remove active state from simple siblings
    [scheduledBtn, historyBtn, campaignsBtn].forEach((b) =>
      b?.classList.remove("active"),
    );

    // Hide sub-nav containers
    postSubNavContainer.classList.add("d-none");
    templatesSubNavContainer.classList.add("d-none");
  };

  // --- NEW: Checklist Visibility Logic ---
  const handleChecklistVisibility = (targetTab) => {
    const checklistBody = document.getElementById("checklistBody");
    const checklistContainer = document.getElementById("onboardingChecklist");

    if (!checklistBody || !checklistContainer) return;

    // Only show/expand on Compose tab if NOT completed or user wants it
    if (targetTab === "compose") {
      // If we are in Free Tier, we show it. Logic handled by updateTierUI visibility.
      if (!checklistContainer.classList.contains("d-none")) {
        checklistBody.classList.add("open");
        // checklistBody.style.maxHeight = "500px"; // Handled by CSS class .open
      }
    } else {
      // Auto-collapse on other tabs to save space
      checklistBody.classList.remove("open");
      // checklistBody.style.maxHeight = "0";
    }
  };

  const activateComposeParent = () => {
    resetAllParents();
    mainPostBtn.classList.add("active");
    postSubNavContainer.classList.remove("d-none");
    updateSwitcherVisuals(postTrack, quickPostBtn, schedulerBtn, "scheduler");

    // Ensure the correct sub-page is visible
    hideAllPages();
    if (schedulerBtn.classList.contains("active")) {
      document.getElementById("SchedulerPage")?.classList.remove("d-none");
    } else {
      document.getElementById("quickPostPage")?.classList.remove("d-none");
    }

    handleChecklistVisibility("compose");
  };

  const activateTemplatesParent = () => {
    resetAllParents();
    mainTemplatesBtn.classList.add("active");
    templatesSubNavContainer.classList.remove("d-none");
    updateSwitcherVisuals(templatesTrack, tagBtn, groupBtn, "group");

    // Ensure the correct sub-page is visible
    hideAllPages();
    if (groupBtn.classList.contains("active")) {
      document.getElementById("groupsPage")?.classList.remove("d-none");
    } else {
      document.getElementById("TagsPage")?.classList.remove("d-none");
    }

    handleChecklistVisibility("other");
  };

  // --- EVENT LISTENERS ---

  // 1. "Compose" Parent Click
  if (mainPostBtn) {
    mainPostBtn.addEventListener("click", (e) => {
      e.preventDefault();
      activateComposeParent();
    });
  }

  // 2. "Templates" Parent Click
  if (mainTemplatesBtn) {
    mainTemplatesBtn.addEventListener("click", (e) => {
      e.preventDefault();
      activateTemplatesParent();
    });
  }

  // 3. "Campaigns" Click
  if (campaignsBtn) {
    campaignsBtn.addEventListener("click", (e) => {
      e.preventDefault();
      resetAllParents();
      campaignsBtn.classList.add("active");
      hideAllPages();
      handleChecklistVisibility("other");

      const campaignsPage = document.getElementById("CampaignsPage");
      const listView = document.getElementById("campaignListView");
      const builderView = document.getElementById("campaignBuilderView");

      if (campaignsPage) {
        campaignsPage.classList.remove("d-none");
        if (listView) listView.classList.remove("d-none");
        if (builderView) builderView.classList.add("d-none");
        renderCampaignList();
      }
    });
  }

  // 4. "Upcoming" Click
  if (scheduledBtn) {
    scheduledBtn.addEventListener("click", (e) => {
      resetAllParents();
      scheduledBtn.classList.add("active");
      hideAllPages();
      handleChecklistVisibility("other");
      document.getElementById("scheduledPostsPage").classList.remove("d-none");
    });
  }

  // 5. "History" Click
  if (historyBtn) {
    historyBtn.addEventListener("click", (e) => {
      resetAllParents();
      historyBtn.classList.add("active");
      hideAllPages();
      handleChecklistVisibility("other");
      document.getElementById("historyPage").classList.remove("d-none");
    });
  }

  // 6. Compose Switcher Logic (Sub-buttons)
  if (quickPostBtn) {
    quickPostBtn.addEventListener("click", () => {
      activateComposeParent();
      quickPostBtn.classList.add("active");
      schedulerBtn.classList.remove("active");
      updateSwitcherVisuals(postTrack, quickPostBtn, schedulerBtn, "scheduler");
      hideAllPages();
      document.getElementById("quickPostPage")?.classList.remove("d-none");
    });
  }
  if (schedulerBtn) {
    schedulerBtn.addEventListener("click", () => {
      activateComposeParent();
      schedulerBtn.classList.add("active");
      quickPostBtn.classList.remove("active");
      updateSwitcherVisuals(postTrack, quickPostBtn, schedulerBtn, "scheduler");
      hideAllPages();
      document.getElementById("SchedulerPage")?.classList.remove("d-none");
    });
  }

  // 7. Templates Switcher Logic (Sub-buttons)
  if (tagBtn) {
    tagBtn.addEventListener("click", () => {
      activateTemplatesParent();
      tagBtn.classList.add("active");
      groupBtn.classList.remove("active");
      updateSwitcherVisuals(templatesTrack, tagBtn, groupBtn, "group");
      hideAllPages();
      document.getElementById("TagsPage")?.classList.remove("d-none");
    });
  }
  if (groupBtn) {
    groupBtn.addEventListener("click", () => {
      activateTemplatesParent();
      groupBtn.classList.add("active");
      tagBtn.classList.remove("active");
      updateSwitcherVisuals(templatesTrack, tagBtn, groupBtn, "group");
      hideAllPages();
      document.getElementById("groupsPage")?.classList.remove("d-none");
    });
  }

  // 8. Initial Load Check
  if (campaignsBtn.classList.contains("active")) {
    // Campaign is active
  } else if (
    quickPostBtn.classList.contains("active") ||
    schedulerBtn.classList.contains("active")
  ) {
    activateComposeParent();
  } else if (
    tagBtn.classList.contains("active") ||
    groupBtn.classList.contains("active")
  ) {
    activateTemplatesParent();
  }
}
// --- START OF FILE popup.js (Add to existing code) ---
// --- START OF FILE popup.js (Replace Campaign Logic) ---

// Global variable to track which block requested a schedule
let activeCampaignTriggerBlock = null;

function initCampaignBuilder() {
  const toolbarItems = document.querySelectorAll(".toolbar-item");
  const canvas = document.getElementById("campaignCanvas");

  if (!canvas) return;
  document.body.addEventListener("click", function (e) {
    if (e.target.classList.contains("toggle-label")) {
      const input = e.target.previousElementSibling;
      if (input && input.type === "checkbox") {
        // No action needed if 'for' attribute is set correctly,
        // but this is a fallback if your CSS relies on specific JS handling
      }
    }
  });
  // --- 1. TOOLBAR ITEMS (Source) ---
  // Clone and replace to strip old listeners, ensuring a clean slate.
  toolbarItems.forEach((item) => {
    if (item.classList.contains("disabled")) return;

    const newItem = item.cloneNode(true);
    item.parentNode.replaceChild(newItem, item);

    newItem.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("source", "toolbar");
      e.dataTransfer.setData("type", newItem.dataset.type);
      e.dataTransfer.effectAllowed = "copy";
    });
  });

  // --- 2. CANVAS HANDLERS (Drop Zone) ---

  // A. Define Handlers (if not already defined)
  // We use the global variables to ensure reference consistency across calls
  if (!canvasDropHandler) {
    canvasDropHandler = (e) => handleCanvasDrop(e, canvas);
  }
  if (!canvasDragOverHandler) {
    canvasDragOverHandler = (e) => handleCanvasDragOver(e, canvas);
  }

  // B. CLEANUP: Always remove existing listeners first
  canvas.removeEventListener("dragover", canvasDragOverHandler);
  canvas.removeEventListener("drop", canvasDropHandler);

  // C. ATTACH: Add fresh listeners
  canvas.addEventListener("dragover", canvasDragOverHandler);
  canvas.addEventListener("drop", canvasDropHandler);

  // D. MARKER: (Optional, visual debug only)
  canvas.dataset.initTimestamp = Date.now();
  // --- 3. TRIGGER BLOCK MANAGEMENT ---
  // Disable the Trigger tool if a trigger already exists on canvas
  const updateTriggerToolState = () => {
    const hasTrigger = canvas.querySelector(
      '.builder-block[data-type="trigger"]',
    );
    const triggerTool = document.querySelector(
      '.toolbar-item[data-type="trigger"]',
    );

    if (triggerTool) {
      if (hasTrigger) {
        triggerTool.classList.add("disabled");
        triggerTool.style.opacity = "0.5";
        triggerTool.style.cursor = "not-allowed";
        triggerTool.setAttribute("draggable", "false");
        triggerTool.title = "Only one Start Trigger allowed";
      } else {
        triggerTool.classList.remove("disabled");
        triggerTool.style.opacity = "1";
        triggerTool.style.cursor = "grab";
        triggerTool.setAttribute("draggable", "true");
        triggerTool.title = "";
      }
    }
  };

  // Run once immediately
  updateTriggerToolState();

  // Observer to watch for block additions/removals
  if (!canvas.dataset.observerAttached) {
    const observer = new MutationObserver(() => {
      updateTriggerToolState();
      updateCampaignSteps(); // Also keep steps updated
    });
    observer.observe(canvas, { childList: true });
    canvas.dataset.observerAttached = "true";
  }
}

// --- Helper Functions for Drag & Drop ---

function handleCanvasDragOver(e, canvas) {
  e.preventDefault();
  e.stopPropagation();

  const afterElement = getDragAfterElement(canvas, e.clientY);
  const draggingEl = document.querySelector(".dragging");

  // Only sort if we are moving an EXISTING block inside the canvas
  if (draggingEl && draggingEl.classList.contains("builder-block")) {
    if (afterElement == null) {
      canvas.appendChild(draggingEl);
    } else {
      canvas.insertBefore(draggingEl, afterElement);
    }
  }
}

function handleCanvasDrop(e, canvas) {
  e.preventDefault();
  e.stopPropagation();

  const source = e.dataTransfer.getData("source");
  const type = e.dataTransfer.getData("type");

  // Case A: Dropping a NEW block from Toolbar
  if (source === "toolbar" && type) {
    // 1. Collapse existing blocks to keep UI clean
    canvas.querySelectorAll(".builder-block").forEach((b) => {
      b.classList.add("collapsed");
    });

    // 2. Create the new block DOM
    const newBlock = createBlockElement(type);

    // 3. Attach internal events (This calls initBlockMultiSelect internally)
    setupBuilderBlockEvents(newBlock);

    // 4. Insert into DOM at correct position
    const afterElement = getDragAfterElement(canvas, e.clientY);
    if (afterElement == null) {
      canvas.appendChild(newBlock);
    } else {
      canvas.insertBefore(newBlock, afterElement);
    }

    // 5. Update Step Numbers
    updateCampaignSteps();
  }

  // Case B: Re-sorting existing blocks (Visuals handled by dragOver, we just update numbers)
  if (source === "canvas") {
    updateCampaignSteps();
  }
}

// 3. Helper: Calculate Drop Position
function getDragAfterElement(container, y) {
  const draggableElements = [
    ...container.querySelectorAll(".builder-block:not(.dragging)"),
  ];

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY },
  ).element;
}

function createBlockElement(type) {
  const div = document.createElement("div");
  div.className = "builder-block";
  div.setAttribute("data-type", type);
  div.setAttribute("draggable", "true");

  let iconClass = "bg-indigo";
  let title = "Generic Block";
  let contentHtml = "";
  let defaultSummary = "";

  const blockId = Date.now() + Math.random().toString(36).substr(2, 5);

  switch (type) {
    case "trigger":
      iconClass = "bg-slate";
      title = I18n.t("blockTrigger");
      defaultSummary = I18n.t("campStepManual");
      contentHtml = `
        <div class="trigger-row" style="justify-content: space-between;">
          <button class="btn-visual-secondary configure-trigger-btn">
            <i class="fa fa-calendar"></i> ${I18n.t("btnSchedule")}
          </button>
          <span class="trigger-result-badge not-set">
            <i class="fa fa-clock-o"></i> ${I18n.t("lblNotConfigured")}
          </span>
        </div>
        <input type="hidden" class="trigger-data-freq">
        <input type="hidden" class="trigger-data-summary">
      `;
      break;

    case "post":
      iconClass = "bg-indigo";
      title = I18n.t("blockPost");
      defaultSummary = I18n.t("builderPostSummary", ["0", "0"]);

      contentHtml = `
        <div class="block-multiselect-container" data-type="post">
          <label class="adv-label">${I18n.t("tabPostTemps")}</label>
          <input type="text" class="block-multiselect-input" placeholder="${I18n.t(
            "phSelectTemplates",
          )}" readonly>
          <div class="block-multiselect-dropdown"></div>
        </div>
        <div class="block-selected-pills" data-type="post"></div>

        <div class="inherit-toggle-container inherit-row mb-3 mt-3" style="display:none;">
           <div style="display:flex; align-items:center; gap:8px;">
             <span style="font-size:12px; color:#0369a1;">${I18n.t(
               "lblTargetSame",
             )}</span>
             <select class="inherit-select inherit-step-select"></select>
           </div>
           <div class="toggle-switch">
              <input type="checkbox" class="toggle-input inherit-groups-toggle" checked>
              <label class="toggle-label"></label>
           </div>
        </div>

        <div class="group-selection-wrapper mt-3">
          <div class="group-select-row">
            <div class="block-multiselect-container" data-type="group">
              <label class="adv-label">${I18n.t("tabGroupColls")}</label>
              <input type="text" class="block-multiselect-input" placeholder="${I18n.t(
                "phSelectGroups",
              )}" readonly>
              <div class="block-multiselect-dropdown"></div>
            </div>
            <button class="btn btn-visual-secondary advanced-target-btn" title="${I18n.t(
              "btnAdvSelector",
            )}">
              ${I18n.t("btnAdvSelector")}
            </button>
          </div>
          <div class="block-selected-pills" data-type="group"></div>
        </div>

        <div class="mini-ai-section section-ai mb-3 mt-3" style="display:none;">
            <div class="d-flex align-items-center justify-content-between">
               <label class="adv-label mb-0"><i class="fa fa-magic"></i> ${I18n.t(
                 "headerAiVar",
               )}</label>
               <div class="toggle-switch">
                  <input type="checkbox" class="toggle-input ai-toggle">
                  <label class="toggle-label"></label>
               </div>
            </div>
            <div class="ai-options d-none mt-2">
               <div class="d-flex align-items-center gap-2">
                 <span style="font-size:11px;">${I18n.t("lblGen")}</span>
                 <input type="number" class="form-control block-input" value="2" style="width:50px;">
                 <span style="font-size:11px;">${I18n.t("lblVarsLower")}</span>
               </div>
            </div>
        </div>

        <div class="form-group mb-2 section-order" style="display:none;">
          <label class="adv-label">${I18n.t("headerOrder")}</label>
          <div class="compact-segmented">
            <label class="compact-segment-label">
              <input type="radio" class="compact-segment-radio" name="order_${blockId}" value="sequential" checked>
              ${I18n.t("lblSequential")}
            </label>
            <label class="compact-segment-label">
              <input type="radio" class="compact-segment-radio" name="order_${blockId}" value="alternate">
              ${I18n.t("lblAlternate")}
            </label>
          </div>
        </div>
        
        <button class="advanced-toggle-btn">
          <span>${I18n.t("btnConfig")}</span>
          <i class="fa fa-chevron-down"></i>
        </button>
        
        <div class="settings-panel">
          <div class="form-group mb-3">
            <label class="adv-label">${I18n.t("headerStrategy")}</label>
            <div class="compact-methods">
              <label class="compact-method-label">
                <input type="radio" class="compact-method-radio method-radio" name="meth_${blockId}" value="directApi" >
                <i class="fa fa-bolt"></i> ${I18n.t("modeSpeed")}
              </label>
              <label class="compact-method-label">
                <input type="radio" class="compact-method-radio method-radio" name="meth_${blockId}" value="popup" checked>
                <i class="fa fa-window-maximize"></i> ${I18n.t("modeClassic")}
              </label>
            </div>
          </div>

          <div class="section-comments mb-3" style="display:none;">
             <label class="adv-label">${I18n.t("headerComments")}</label>
             <div class="compact-segmented mb-2">
                <label class="compact-segment-label">
                   <input type="radio" class="compact-segment-radio comment-type-radio" name="comm_${blockId}" value="enable" checked> ${I18n.t(
                     "lblEnableComm",
                   ).replace(" Comments", "")}
                </label>
                <label class="compact-segment-label">
                   <input type="radio" class="compact-segment-radio comment-type-radio" name="comm_${blockId}" value="disable"> ${I18n.t(
                     "lblDisableComm",
                   ).replace(" Comments", "")}
                </label>
                <label class="compact-segment-label">
                   <input type="radio" class="compact-segment-radio comment-type-radio" name="comm_${blockId}" value="comment"> ${
                     I18n.t("lblFirstComm") || "First"
                   }
                </label>
             </div>
             <textarea class="form-control block-input comment-text d-none" placeholder="${I18n.t(
               "phFirstComm",
             )}" rows="2"></textarea>
          </div>

           <div class="form-group mb-3 mini-security-slider-wrapper">
             <label class="adv-label">${I18n.t("lblSecLevel")}</label>
             <input type="range" class="mini-security-slider security-level-input" min="1" max="3" value="2" step="1">
             <div class="mini-slider-labels">
                <span>${I18n.t("lblFast")}</span>
                <span>${I18n.t("lblBalanced")}</span>
                <span>${I18n.t("lblSafe")}</span>
             </div>
          </div>

          <div class="form-group mb-3">
             <label class="adv-label">${I18n.t("lblFlowCtrl")}</label>
             <div class="d-flex align-items-center gap-2 mb-2">
                <span style="font-size:11px; color:#666; width: 60px;">${I18n.t(
                  "lblAfterEvery",
                )}</span>
                <input type="number" class="form-control block-input interval-input" value="1" style="width:50px;">
                <span style="font-size:11px; color:#666;">${I18n.t(
                  "unitPosts",
                )}</span>
             </div>
             <div class="d-flex align-items-center gap-2">
                <span style="font-size:11px; color:#666; width: 60px;">${I18n.t(
                  "lblWaitLabel",
                )}</span>
                <input type="number" class="form-control block-input wait-time-input" value="2" min="1" step="1" style="width:50px;">
                <span style="font-size:11px; color:#666;">${I18n.t(
                  "unitMin",
                )}</span>
             </div>
          </div>

          <div class="settings-option">
             <div class="toggle-switch">
                <input type="checkbox" class="toggle-input setting-pause-fail">
                <label class="toggle-label"></label>
             </div>
             <div class="option-details"><span class="option-name">${I18n.t(
               "lblSafeDelay",
             )}</span></div>
          </div>

          <div class="settings-option">
             <div class="toggle-switch">
                <input type="checkbox" class="toggle-input setting-night-mode">
                <label class="toggle-label"></label>
             </div>
             <div class="option-details"><span class="option-name">${I18n.t(
               "lblNightMode",
             )}</span></div>
          </div>

          <div class="settings-option">
             <div class="toggle-switch">
                <input type="checkbox" class="toggle-input setting-compress" checked>
                <label class="toggle-label"></label>
             </div>
             <div class="option-details"><span class="option-name">${I18n.t(
               "lblCompress",
             )}</span></div>
          </div>
        </div>
      `;
      break;

    case "wait":
      iconClass = "bg-amber";
      title = I18n.t("blockWait");
      defaultSummary = "0 min";
      contentHtml = `
        <div class="one-line-row">
          <span class="one-line-label" style="margin-right:auto;">${I18n.t(
            "lblWaitLabel",
          )}</span>
          
          <div class="wait-input-group">
            <input type="number" class="form-control block-input wait-input wait-d" value="0" min="0">
            <span class="wait-label">${I18n.t("lblDays")}</span>
          </div>
          
          <div class="wait-input-group">
            <input type="number" class="form-control block-input wait-input wait-h" value="0" min="0">
            <span class="wait-label">${I18n.t("lblHrs")}</span>
          </div>

          <div class="wait-input-group">
            <input type="number" class="form-control block-input wait-input wait-m" value="0" min="0">
            <span class="wait-label">${I18n.t("lblMins")}</span>
          </div>
        </div>
      `;
      break;

    case "loop":
      iconClass = "bg-purple";
      title = I18n.t("blockLoop");
      defaultSummary = I18n.t("campDescLoopForever");
      contentHtml = `
        <div class="one-line-row">
          <span class="one-line-label">${I18n.t("lblRepeat")}</span>
          <select class="form-control block-select loop-type-select" style="width: 90px;">
            <option value="forever">${I18n.t("lblForever")}</option>
            <option value="count">${I18n.t("lblFixedTimes")}</option>
          </select>
          
          <div class="loop-count-container d-none flex-grow-0" style="display:flex; align-items:center; gap:5px;">
             <span class="one-line-label" style="font-size:11px;">${I18n.t(
               "lblCount",
             )}</span>
             <input type="number" class="form-control block-input loop-count" value="3" style="width: 45px;">
          </div>

          <span class="one-line-label ml-auto" style="font-size:11px;">${I18n.t(
            "lblGoToStep",
          )}</span>
          <input type="number" class="form-control block-input loop-step" placeholder="1" style="width: 45px;" value="1">
        </div>
      `;
      break;

    case "stop":
      iconClass = "bg-rose";
      title = I18n.t("blockStop");
      defaultSummary = I18n.t("campDescStop");
      contentHtml = `
          <div class="block-form-row">
             <span class="small">${I18n.t("lblEndCamp")}</span>
          </div>
        `;
      break;
  }

  div.innerHTML = `
    <div class="block-header">
      <span class="step-badge">1</span>
      <div class="block-icon-inline ${iconClass}">
        ${getIconForType(type)}
      </div>
      <div class="block-title-wrapper">
          <span class="block-title">${title}</span>
          <span class="block-summary-preview">${defaultSummary}</span>
      </div>
      <div class="block-controls">
          <div class="block-collapse-btn" title="Toggle Details">
              <i class="fa fa-chevron-down"></i>
          </div>
          <div class="block-remove" title="${I18n.t("btnCancel")}">
              <i class="fa fa-times"></i>
          </div>
      </div>
    </div>
    <div class="block-content-body">
      ${contentHtml}
    </div>
  `;

  return div;
}
// in popup.js
// ACTION: Replace setupBuilderBlockEvents

function setupBuilderBlockEvents(block) {
  const type = block.getAttribute("data-type");

  // --- A. Core UI Logic (Unchanged) ---
  block.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("source", "canvas");
    block.classList.add("dragging");
    setTimeout(() => (block.style.opacity = "0.5"), 0);
  });

  block.addEventListener("dragend", () => {
    block.classList.remove("dragging");
    block.style.opacity = "1";
    updateCampaignSteps();
  });

  block.querySelector(".block-remove")?.addEventListener("click", (e) => {
    e.stopPropagation();
    block.remove();
    updateCampaignSteps();
  });

  const collapseBtn = block.querySelector(".block-collapse-btn");
  if (collapseBtn) {
    collapseBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      block.classList.toggle("collapsed");
    });
  }

  const updateSummary = (text) => {
    const summaryEl = block.querySelector(".block-summary-preview");
    if (summaryEl) summaryEl.textContent = text || "Configured";
  };

  // --- B. Block Specific Logic ---

  if (type === "trigger") {
    block
      .querySelector(".configure-trigger-btn")
      ?.addEventListener("click", () => {
        window.activeCampaignTriggerBlock = block;
        resetScheduleForm();
        if (typeof $ !== "undefined") $("#scheduleModal").modal("show");
        else {
          document.getElementById("scheduleModal").style.display = "block";
          document.getElementById("scheduleModal").classList.add("show");
        }
      });
  }

  if (type === "post") {
    initBlockMultiSelect(block, "post", (count) => {
      updatePostBlockDynamicUI(block, count);
    });
    initBlockMultiSelect(block, "group");

    const advToggle = block.querySelector(".advanced-toggle-btn");
    const settingsPanel = block.querySelector(".settings-panel");
    if (advToggle && settingsPanel) {
      advToggle.addEventListener("click", () => {
        settingsPanel.classList.toggle("show");
        const icon = advToggle.querySelector("i");
        icon.className = settingsPanel.classList.contains("show")
          ? "fa fa-chevron-up"
          : "fa fa-chevron-down";
      });
    }

    initRadioVisuals(block.querySelectorAll('input[name^="order_"]'));
    initRadioVisuals(block.querySelectorAll('input[name^="meth_"]'));
    initRadioVisuals(block.querySelectorAll('input[name^="comm_"]'));

    block.querySelectorAll(".method-radio").forEach((radio) => {
      radio.addEventListener("change", () => {
        const commentsSection = block.querySelector(".section-comments");
        if (commentsSection) {
          commentsSection.style.display =
            radio.value === "popup" && radio.checked ? "block" : "none";
        }
      });
    });

    block.querySelectorAll(".comment-type-radio").forEach((radio) => {
      radio.addEventListener("change", () => {
        const txt = block.querySelector(".comment-text");
        if (txt) {
          txt.classList.toggle(
            "d-none",
            !(radio.value === "comment" && radio.checked),
          );
        }
      });
    });

    // Inheritance Sync Logic
    const inheritToggle = block.querySelector(".inherit-groups-toggle");
    const groupWrapper = block.querySelector(".group-selection-wrapper");
    const inheritSelect = block.querySelector(".inherit-step-select");

    const syncInheritance = () => {
      if (inheritToggle && inheritToggle.checked) {
        groupWrapper.style.display = "none";
        if (
          inheritSelect &&
          !inheritSelect.value &&
          inheritSelect.options.length > 0
        ) {
          inheritSelect.selectedIndex = inheritSelect.options.length - 1;
        }
        if (inheritSelect && inheritSelect.value) {
          block.dataset.inheritFrom = inheritSelect.value;
        }
      } else {
        groupWrapper.style.display = "block";
        delete block.dataset.inheritFrom;
      }
      updatePostBlockSummary(block);
    };

    if (inheritToggle) {
      inheritToggle.addEventListener("change", syncInheritance);
      setTimeout(syncInheritance, 100);
    }

    if (inheritSelect) {
      inheritSelect.addEventListener("change", () => {
        block.dataset.inheritFrom = inheritSelect.value;
        updatePostBlockSummary(block);
      });
    }

    const aiToggle = block.querySelector(".ai-toggle");
    if (aiToggle) {
      block.querySelectorAll(".toggle-label").forEach((l) =>
        l.addEventListener("click", (e) => {
          const input = e.target.previousElementSibling;
          if (input) input.click();
        }),
      );
      aiToggle.addEventListener("change", () => {
        block
          .querySelector(".ai-options")
          .classList.toggle("d-none", !aiToggle.checked);
      });
    }

    block
      .querySelector(".advanced-target-btn")
      ?.addEventListener("click", () => openPostTargeter("campaign", block));
  }

  if (type === "wait") {
    const dInput = block.querySelector(".wait-d");
    const hInput = block.querySelector(".wait-h");
    const mInput = block.querySelector(".wait-m");

    const updateWaitSummary = () => {
      const d = parseInt(dInput.value) || 0;
      const h = parseInt(hInput.value) || 0;
      const m = parseInt(mInput.value) || 0;

      let parts = [];
      if (d > 0) parts.push(`${d}d`);
      if (h > 0) parts.push(`${h}h`);
      if (m > 0) parts.push(`${m}m`);

      // FIX: Localized
      if (parts.length > 0) {
        updateSummary(I18n.t("builderWaitSummary", [parts.join(" ")]));
      } else {
        updateSummary(I18n.t("builderNoWait"));
      }
    };

    dInput.addEventListener("input", updateWaitSummary);
    hInput.addEventListener("input", updateWaitSummary);
    mInput.addEventListener("input", updateWaitSummary);
  }

  if (type === "loop") {
    const loopType = block.querySelector(".loop-type-select");
    const countInput = block.querySelector(".loop-count");
    const stepInput = block.querySelector(".loop-step");
    const countContainer = block.querySelector(".loop-count-container");

    const updateLoopSummary = () => {
      const typeVal = loopType.value;
      const stepVal = stepInput.value || 1;

      // FIX: Localized
      if (typeVal === "forever")
        updateSummary(I18n.t("builderLoopForever", [String(stepVal)]));
      else
        updateSummary(
          I18n.t("builderLoopCount", [
            String(countInput.value),
            String(stepVal),
          ]),
        );
    };

    loopType.addEventListener("change", (e) => {
      if (e.target.value === "count") {
        countContainer.classList.remove("d-none");
        countContainer.style.display = "flex";
      } else {
        countContainer.classList.add("d-none");
      }
      updateLoopSummary();
    });
    countInput.addEventListener("input", updateLoopSummary);
    stepInput.addEventListener("input", updateLoopSummary);
  }
}

function initBlockMultiSelect(block, type, changeCallback) {
  // 1. Locate Elements
  const container = block.querySelector(
    `.block-multiselect-container[data-type="${type}"]`,
  );
  const pillsContainer = block.querySelector(
    `.block-selected-pills[data-type="${type}"]`,
  );

  if (!container || !pillsContainer) {
    console.warn(`MultiSelect init failed: Missing container for type ${type}`);
    return;
  }

  const input = container.querySelector(".block-multiselect-input");
  const dropdown = container.querySelector(".block-multiselect-dropdown");

  if (!input || !dropdown) return;

  // 2. Refresh Data Source
  // FIX: Access the global variables directly, NOT via window.
  let dataItems = [];
  if (type === "post") {
    dataItems = typeof tags !== "undefined" ? tags : [];
  } else if (type === "group") {
    dataItems = typeof groups !== "undefined" ? groups : [];
  }

  // Debug log to confirm data is found
  // console.log(`Init MultiSelect ${type}. Found items:`, dataItems.length);

  // 3. Populate Dropdown HTML
  dropdown.innerHTML = "";
  if (!dataItems || dataItems.length === 0) {
    dropdown.innerHTML =
      '<div style="padding:10px; color:#999; font-style:italic;">No items found. Create some first!</div>';
  } else {
    dataItems.forEach((item, index) => {
      const opt = document.createElement("div");
      opt.className = "block-multiselect-option";

      let label =
        item.title ||
        (type === "post" ? `Post ${index + 1}` : `Group ${index + 1}`);

      // Add badge for groups
      let badge = "";
      if (type === "group") {
        const count = item.links ? item.links.length : 0;
        badge = `<span class="badge badge-light border ml-2">${count} links</span>`;
      }

      opt.innerHTML = `<span>${label}</span>${badge}`;
      opt.dataset.index = index;

      // Click Listener for Option
      opt.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation(); // Stop bubbling
        toggleSelection(index, label);
      });

      dropdown.appendChild(opt);
    });
  }

  // 4. Input Click -> Toggle Dropdown
  input.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Close other open dropdowns in the same block to prevent overlapping
    block.querySelectorAll(".block-multiselect-dropdown").forEach((d) => {
      if (d !== dropdown) d.classList.remove("show");
    });

    dropdown.classList.toggle("show");
  });

  // 5. Document Click -> Close Dropdown
  document.addEventListener("click", (e) => {
    if (!container.contains(e.target)) {
      dropdown.classList.remove("show");
    }
  });

  // 6. Selection Logic
  const selectedIndices = new Set();

  function toggleSelection(index, label) {
    const options = dropdown.querySelectorAll(".block-multiselect-option");

    if (selectedIndices.has(index)) {
      // Deselect
      selectedIndices.delete(index);
      const opt = Array.from(options).find(
        (o) => parseInt(o.dataset.index) === index,
      );
      if (opt) opt.classList.remove("selected");
      removePill(index);
    } else {
      // Select
      selectedIndices.add(index);
      const opt = Array.from(options).find(
        (o) => parseInt(o.dataset.index) === index,
      );
      if (opt) opt.classList.add("selected");
      addPill(index, label);
    }

    updateUI();
  }

  function addPill(index, label) {
    // Check duplicates
    if (pillsContainer.querySelector(`.block-pill[data-index="${index}"]`))
      return;

    const pill = document.createElement("div");
    pill.className = "block-pill";
    pill.dataset.index = index;
    pill.innerHTML = `<span>${label}</span><span class="block-pill-remove">&times;</span>`;

    pill.querySelector(".block-pill-remove").addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleSelection(index, label);
    });

    pillsContainer.appendChild(pill);
  }

  function removePill(index) {
    const pill = pillsContainer.querySelector(
      `.block-pill[data-index="${index}"]`,
    );
    if (pill) pill.remove();
  }

  function updateUI() {
    // FIX: Use I18n
    input.value =
      selectedIndices.size > 0
        ? I18n.t("countSelected", [String(selectedIndices.size)])
        : "";

    if (changeCallback) {
      changeCallback(selectedIndices.size);
    }
    updatePostBlockSummary(block);
  }
}

function handleTriggerBlockSave() {
  const block = window.activeCampaignTriggerBlock;
  if (!block) return false;

  const frequency = document.querySelector(
    'input[name="scheduleFrequency"]:checked',
  ).value;
  let summary = "";

  // Create a config object to store specific timing details
  const triggerConfig = {
    frequency: frequency,
    scheduleDate: "",
    scheduleTime: "",
    weekdays: [],
    monthDays: [],
  };

  // Format summary text & Capture Data
  if (frequency === "once") {
    const date = document.getElementById("scheduleDate").value;
    const time = document.getElementById("scheduleTime").value;
    summary = `${date} @ ${time}`;

    triggerConfig.scheduleDate = date;
    triggerConfig.scheduleTime = time;
    // Construct simplified ISO string for 'once' calculation
    triggerConfig.scheduleDateTime = `${date}T${time}:00`;
  } else if (frequency === "daily") {
    const time = document.getElementById("dailyTime").value;
    summary = `Daily @ ${time}`;
    triggerConfig.scheduleTime = time;
  } else if (frequency === "weekly") {
    const time = document.getElementById("weeklyTime").value;
    const days = Array.from(
      document.querySelectorAll('input[name="weekday"]:checked'),
    ).map((cb) => parseInt(cb.value));
    summary = `Weekly (${days.length} days) @ ${time}`;

    triggerConfig.scheduleTime = time;
    triggerConfig.weekdays = days;
  } else if (frequency === "monthly") {
    const time = document.getElementById("monthlyTime").value;
    const days = Array.from(
      document.querySelectorAll('input[name="monthday"]:checked'),
    ).map((cb) => parseInt(cb.value));
    summary = `Monthly @ ${time}`;

    triggerConfig.scheduleTime = time;
    triggerConfig.monthDays = days;
  } else {
    summary = `${frequency} (Recurring)`;
  }

  // Update UI on the block
  const resultBadge = block.querySelector(".trigger-result-badge");
  const hiddenFreq = block.querySelector(".trigger-data-freq");
  const hiddenSummary = block.querySelector(".trigger-data-summary");

  if (resultBadge) {
    resultBadge.innerHTML = `<i class="fa fa-check-circle"></i> ${summary}`;
    const summaryText = block.querySelector(".block-summary-preview");
    if (summaryText) summaryText.textContent = summary;
    resultBadge.classList.remove("not-set");
    resultBadge.style.backgroundColor = "#eff6ff";
    resultBadge.style.color = "#3b82f6";
    resultBadge.style.borderColor = "#dbeafe";
  }

  if (hiddenFreq) hiddenFreq.value = frequency;
  if (hiddenSummary) hiddenSummary.value = summary;

  // *** CRITICAL FIX: Save the full config to the block for the parser ***
  block.dataset.triggerSettings = JSON.stringify(triggerConfig);

  // Close Modal
  if (typeof $ !== "undefined") {
    $("#scheduleModal").modal("hide");
  } else {
    document.getElementById("scheduleModal").classList.remove("show");
    document.getElementById("scheduleModal").style.display = "none";
  }

  window.activeCampaignTriggerBlock = null;
  return true;
}

// Helper: Icons
function getIconForType(type) {
  const icons = {
    trigger: '<i class="fa fa-clock-o"></i>',
    post: '<i class="fa fa-paper-plane"></i>',
    wait: '<i class="fa fa-hourglass-half"></i>',
    loop: '<i class="fa fa-refresh"></i>',
    comment: '<i class="fa fa-comment"></i>',
    stop: '<i class="fa fa-stop-circle"></i>',
  };
  return icons[type] || "";
}

function updatePostBlockDynamicUI(block, postCount) {
  const aiSection = block.querySelector(".section-ai");
  const orderSection = block.querySelector(".section-order");

  if (postCount === 1) {
    // Show AI, Hide Order
    aiSection.style.display = "block";
    orderSection.style.display = "none";
  } else if (postCount > 1) {
    // Hide AI, Show Order
    aiSection.style.display = "none";
    orderSection.style.display = "block";
  } else {
    // 0 selected: Hide both
    aiSection.style.display = "none";
    orderSection.style.display = "none";
  }
}

function updatePostBlockSummary(block) {
  if (block.getAttribute("data-type") !== "post") return;

  const postPills = block.querySelectorAll(
    '.block-selected-pills[data-type="post"] .block-pill',
  );
  const groupPills = block.querySelectorAll(
    '.block-selected-pills[data-type="group"] .block-pill',
  );

  const postCount = postPills.length;
  let groupCount = groupPills.length;

  const inheritSelect = block.querySelector(".inherit-step-select");
  const inheritToggle = block.querySelector(".inherit-groups-toggle");
  let isInheriting = false;
  let inheritStepText = "";

  if (inheritToggle && inheritToggle.checked && inheritSelect) {
    isInheriting = true;
    inheritStepText = inheritSelect.value;
  }

  const summaryEl = block.querySelector(".block-summary-preview");
  if (summaryEl) {
    if (isInheriting) {
      // FIX: Localized
      const suffix = I18n.t("builderPostInherit", [inheritStepText]);
      summaryEl.textContent =
        I18n.t("builderPostSummaryInherit", [String(postCount)]) + suffix;
    } else {
      // FIX: Localized
      summaryEl.textContent = I18n.t("builderPostSummary", [
        String(postCount),
        String(groupCount),
      ]);
    }
  }
}
function updateCampaignSteps() {
  const steps = document.querySelectorAll("#campaignCanvas .builder-block");
  const emptyState = document.querySelector(".canvas-empty-state");

  if (emptyState)
    emptyState.style.display = steps.length === 0 ? "block" : "none";

  let availablePostSources = [];

  steps.forEach((step, index) => {
    const stepNumber = index + 1;
    const badge = step.querySelector(".step-badge");
    if (badge) badge.textContent = stepNumber;

    if (step.getAttribute("data-type") === "post") {
      const inheritContainer = step.querySelector(".inherit-toggle-container");
      const groupWrapper = step.querySelector(".group-selection-wrapper");
      const inheritToggle = step.querySelector(".inherit-groups-toggle");
      const inheritSelect = step.querySelector(".inherit-step-select");
      const currentSelection = step.dataset.inheritFrom || "";

      if (availablePostSources.length > 0) {
        if (inheritContainer) inheritContainer.style.display = "flex";

        if (inheritSelect) {
          const currentVal = inheritSelect.value;
          inheritSelect.innerHTML = "";

          availablePostSources.forEach((source) => {
            const option = document.createElement("option");
            option.value = source.stepNumber;
            // FIX: Localized "Step X"
            option.textContent = I18n.t("builderStepOption", [
              String(source.stepNumber),
            ]);
            inheritSelect.appendChild(option);
          });

          // ... (Restore logic remains the same) ...
          if (
            currentSelection &&
            availablePostSources.some((s) => s.stepNumber == currentSelection)
          ) {
            inheritSelect.value = currentSelection;
          } else if (
            currentVal &&
            availablePostSources.some((s) => s.stepNumber == currentVal)
          ) {
            inheritSelect.value = currentVal;
          } else if (availablePostSources.length > 0) {
            inheritSelect.value =
              availablePostSources[availablePostSources.length - 1].stepNumber;
          }
          step.dataset.inheritFrom = inheritSelect.value;
        }

        if (groupWrapper && inheritToggle) {
          groupWrapper.style.display = inheritToggle.checked ? "none" : "block";
          if (inheritToggle.checked) {
            step.dataset.inheritFrom = inheritSelect.value;
          } else {
            delete step.dataset.inheritFrom;
          }
        }
      } else {
        if (inheritContainer) inheritContainer.style.display = "none";
        if (groupWrapper) groupWrapper.style.display = "block";
        if (inheritToggle) inheritToggle.checked = false;
        delete step.dataset.inheritFrom;
      }
      availablePostSources.push({ stepNumber: stepNumber });
    }
  });
}

// Helper to manage visual state of radio groups inside blocks
function initRadioVisuals(nodeList) {
  if (!nodeList || nodeList.length === 0) return;

  const updateVisuals = () => {
    nodeList.forEach((radio) => {
      // Find the parent label wrapper
      const wrapper = radio.closest("label");
      if (wrapper) {
        if (radio.checked) {
          wrapper.classList.add("selected");
        } else {
          wrapper.classList.remove("selected");
        }
      }
    });
  };

  // Attach listeners
  nodeList.forEach((radio) => {
    radio.addEventListener("change", updateVisuals);
  });

  // Run once immediately to set default state
  updateVisuals();
}

// in popup.js
// ACTION: Add to the end of the file

// --- Campaign Dashboard Logic ---

// UI References
const campaignsListView = document.getElementById("campaignListView");
const campaignsBuilderView = document.getElementById("campaignBuilderView");
const createNewCampaignBtn = document.getElementById("createNewCampaignBtn");
const backToCampaignListBtn = document.getElementById("backToCampaignListBtn");
const campaignsListContainer = document.getElementById(
  "campaignsListContainer",
);

// Find where you attached this listener (usually near the bottom of popup.js)
if (createNewCampaignBtn) {
  createNewCampaignBtn.addEventListener("click", () => {
    const listView = document.getElementById("campaignListView");
    const builderView = document.getElementById("campaignBuilderView");

    if (listView) listView.classList.add("d-none");
    if (builderView) builderView.classList.remove("d-none");

    // Reset Global Edit ID
    editingCampaignId = null;

    // Reset Title
    const titleInput = document.getElementById("campaignTitle");
    if (titleInput) titleInput.value = "";

    // Reset Canvas HTML (Removes all blocks)
    // We DO NOT remove dataset.listenersAttached
    const canvas = document.getElementById("campaignCanvas");
    if (canvas) {
      canvas.innerHTML = `
           
            
            <div class="canvas-empty-state">
              <i class="fa fa-arrow-up text-muted mb-2" style="font-size: 24px;"></i>
              <p>Drag the <strong>Trigger</strong> block here to start</p>
            </div>`;
    }

    const saveBtn = document.getElementById("saveCampaignBtn");
    if (saveBtn) saveBtn.textContent = I18n.t("updateCollection"); // Add this key to JSON

    // Call init to ensure toolbar listeners are fresh
    if (typeof initCampaignBuilder === "function") {
      initCampaignBuilder();
    }
  });
}

if (backToCampaignListBtn) {
  backToCampaignListBtn.addEventListener("click", () => {
    // Ideally, ask for confirmation if unsaved changes
    campaignsBuilderView.classList.add("d-none");
    campaignsListView.classList.remove("d-none");
    renderCampaignList(); // Refresh list
  });
}

function generateCampaignTimelineHTML(campaign) {
  if (!campaign.steps || campaign.steps.length === 0)
    return '<div class="text-muted small">No steps configured.</div>';

  let html = '<div class="camp-timeline">';
  let projectionTime = new Date();
  if (campaign.status === "active" && campaign.nextRunTime) {
    projectionTime = new Date(campaign.nextRunTime);
  } else if (campaign.status === "active" && campaign.waitTargetTime) {
    projectionTime = new Date(campaign.waitTargetTime);
  }

  const currentIndex = campaign.currentStepIndex || 0;

  campaign.steps.forEach((step, index) => {
    let statusClass = "future";
    if (index < currentIndex) statusClass = "completed";
    if (index === currentIndex) statusClass = "current";
    let bgClass = "bg-secondary";
    let iconHTML = getIconForType(step.type);

    switch (step.type) {
      case "trigger":
        bgClass = "bg-slate";
        break;
      case "post":
        bgClass = "bg-indigo";
        break;
      case "wait":
        bgClass = "bg-amber";
        break;
      case "loop":
        bgClass = "bg-purple";
        break;
      case "stop":
        bgClass = "bg-rose";
        break;
    }

    let title = "Unknown Step";
    let desc = "";
    let timeLabel = "";

    if (step.type === "trigger") {
      title = I18n.t("campBlockTrigger");
      desc = step.data.summary || I18n.t("campStepManual");

      if (index === currentIndex && campaign.nextRunTime) {
        timeLabel = new Date(campaign.nextRunTime).toLocaleString([], {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      } else if (index < currentIndex) {
        timeLabel = I18n.t("campStepDone");
      } else {
        timeLabel = I18n.t("campStepScheduled");
      }
    } else if (step.type === "post") {
      title = I18n.t("campBlockBatch");
      const postCount = step.data.postIndices
        ? step.data.postIndices.length
        : 0;
      let groupCount = 0;

      // Inheritance check
      if (step.data.inheritFromStep !== undefined) {
        const parentStep = campaign.steps[step.data.inheritFromStep];
        if (parentStep && parentStep.data.groupDataList)
          groupCount = parentStep.data.groupDataList.length;
      } else {
        groupCount = step.data.groupDataList
          ? step.data.groupDataList.length
          : 0;
      }

      // FIX: Localized Post Description
      desc = I18n.t("campDescPost", [String(postCount), String(groupCount)]);
      const totalOps = Math.max(1, postCount) * Math.max(1, groupCount);

      if (index === currentIndex && campaign.status === "active") {
        timeLabel = I18n.t("campStepProcessing");
      } else if (index > currentIndex) {
        if (projectionTime && campaign.status === "active") {
          timeLabel =
            "~ " +
            projectionTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });
          const durationMs = totalOps * 1.5 * 60 * 1000;
          projectionTime = new Date(projectionTime.getTime() + durationMs);
        } else {
          timeLabel = I18n.t("campStepPending");
        }
      } else {
        timeLabel = I18n.t("campStepSent");
      }
    } else if (step.type === "wait") {
      title = I18n.t("campBlockDelay");
      const mins = step.data.totalMinutes;
      const d = Math.floor(mins / 1440);
      const h = Math.floor((mins % 1440) / 60);
      const m = mins % 60;
      let durationStr = "";
      if (d > 0) durationStr += `${d}d `;
      if (h > 0) durationStr += `${h}h `;
      if (m > 0) durationStr += `${m}m`;

      desc = I18n.t("campDescWait", [durationStr]);

      if (index === currentIndex) {
        if (campaign.waitTargetTime) {
          timeLabel = I18n.t("campTimeUntil", [
            new Date(campaign.waitTargetTime).toLocaleString([], {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
          ]);
          projectionTime = new Date(campaign.waitTargetTime);
        } else {
          timeLabel = I18n.t("campTimeStarting");
        }
      } else if (index > currentIndex) {
        if (projectionTime && campaign.status === "active") {
          projectionTime = new Date(
            projectionTime.getTime() + mins * 60 * 1000,
          );
          timeLabel = "+ " + durationStr;
        } else {
          timeLabel = durationStr;
        }
      } else {
        timeLabel = I18n.t("campStepDone");
      }
    } else if (step.type === "loop") {
      title = I18n.t("campBlockLoop");
      desc =
        step.data.type === "forever"
          ? I18n.t("campDescLoopForever")
          : I18n.t("campDescLoopCount", [String(step.data.maxLoops)]);
      timeLabel = "Logic";
    } else if (step.type === "stop") {
      title = I18n.t("campBlockStop");
      desc = I18n.t("campDescStop");
      timeLabel = "End";
    }

    html += `
      <div class="camp-timeline-step ${statusClass}">
        <div class="step-marker">
            <div class="timeline-icon-box ${bgClass}">${iconHTML}</div>
        </div>
        <div class="step-content">
           <div class="step-header">
              <span class="step-name">${title}</span>
              <span class="step-time">${timeLabel}</span>
           </div>
           <div class="step-desc">${desc}</div>
        </div>
      </div>
    `;
  });

  html += "</div>";
  return html;
}

function renderCampaignList() {
  const container = document.getElementById("campaignsListContainer");
  if (!container) return;

  chrome.storage.local.get(
    ["campaigns", "licenseVerified", "freePostsRemaining"],
    (result) => {
      const campaigns = result.campaigns || [];
      const isLicenseActive =
        result.licenseVerified || result.freePostsRemaining > 0;

      container.innerHTML = "";

      // Empty State (Static HTML updated via popup.html already, this is dynamic injection fallback)
      if (campaigns.length === 0) {
        // Reuse the HTML structure from popup.html but inject here if list empties after deletion
        container.innerHTML = `
        <div class="campaign-empty-state-v2">
          <div class="empty-icon-wrapper"><i class="fa fa-rocket"></i></div>
          <h2 class="empty-title">${I18n.t("emptyCampaigns")}</h2>
          <p class="empty-desc">${I18n.t("descEmptyCamp")}</p>
          <button id="heroCreateBtn" class="btn-visual-secondary btn-hero-create"><i class="fa fa-plus"></i> ${I18n.t(
            "btnCreateNew",
          )}</button>
        </div>`;
        setTimeout(() => {
          document
            .getElementById("heroCreateBtn")
            ?.addEventListener("click", () =>
              document.getElementById("createNewCampaignBtn").click(),
            );
        }, 0);
        return;
      }

      campaigns.forEach((camp, index) => {
        const rawStatus = camp.status;
        const statusClass = `status-${rawStatus}`;

        // FIX: Localized Status Label
        let statusLabel = rawStatus.toUpperCase();
        if (rawStatus === "active") statusLabel = I18n.t("campStatusActive");
        if (rawStatus === "paused") statusLabel = I18n.t("campStatusPaused");
        if (rawStatus === "completed")
          statusLabel = I18n.t("campStatusCompleted");

        const stepCount = camp.steps ? camp.steps.length : 0;
        const currentStepIdx = (camp.currentStepIndex || 0) + 1;
        // FIX: Localized Progress
        const progressText =
          camp.status === "completed"
            ? I18n.t("campStepDone")
            : `${currentStepIdx}/${stepCount}`;

        let timeText = "";
        let timeIcon = "fa-clock-o";

        if (camp.status === "active") {
          if (camp.nextRunTime) {
            const date = new Date(camp.nextRunTime);
            if (date <= new Date()) timeText = I18n.t("campStatusProcessing");
            else
              timeText = date.toLocaleString([], {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });
          } else if (camp.waitTargetTime) {
            const date = new Date(camp.waitTargetTime);
            timeText = date.toLocaleString([], {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });
            timeIcon = "fa-hourglass-end";
          } else {
            timeText = I18n.t("campStatusRunning");
          }
        } else if (camp.status === "paused") {
          timeText = I18n.t("campStatusPaused");
          timeIcon = "fa-pause";
        } else if (camp.status === "completed") {
          timeText = I18n.t("campStatusEnded");
          timeIcon = "fa-check";
        }

        const timelineHTML = generateCampaignTimelineHTML(camp);

        let actionIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
        let actionTitle = I18n.t("campActionResume");
        let actionDisabledClass = "";

        if (camp.status === "active") {
          actionIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`;
          actionTitle = I18n.t("campActionPause");
        } else if (!isLicenseActive) {
          actionIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`;
          actionTitle = I18n.t("campActionUpgrade");
          actionDisabledClass = "disabled-lock";
        }

        const item = document.createElement("div");
        item.className = "campaign-list-item-wrapper";

        item.innerHTML = `
        <div class="campaign-card-item">
            <div class="camp-info">
              <h3 class="camp-title" title="${camp.title}">${camp.title}</h3>
              <div class="camp-meta">
                <span class="camp-status-badge ${statusClass}">
                   <span class="camp-status-dot"></span> ${statusLabel}
                </span>
                <span class="camp-status-badge badge-blue">
                   <i class="fa fa-list-ol"></i> ${progressText}
                </span>
                ${
                  timeText
                    ? `<span class="camp-status-badge badge-gray"><i class="fa ${timeIcon}"></i> ${timeText}</span>`
                    : ""
                }
              </div>
            </div>
            <div class="camp-actions">
               <button type="button" class="btn-icon-only details-toggle" title="Timeline"><i class="fa fa-chevron-down"></i></button>
               <div style="width:1px; height:20px; background:#e2e8f0; margin: 0 4px;"></div>
               <button type="button" class="group-btn run-now toggle-status-btn ${actionDisabledClass}" data-index="${index}" title="${actionTitle}">${actionIcon}</button>
               <button type="button" class="group-btn edit edit-btn" data-index="${index}" title="Edit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
               <button type="button" class="group-btn delete delete-btn" data-index="${index}" title="Delete"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
            </div>
        </div>
        <div class="campaign-details-panel">${timelineHTML}</div>`;

        container.appendChild(item);

        // ... (Listeners - Same as before) ...
        const toggleBtn = item.querySelector(".details-toggle");
        const panel = item.querySelector(".campaign-details-panel");
        const card = item.querySelector(".campaign-card-item");
        toggleBtn.addEventListener("click", () => {
          const isHidden =
            panel.style.display === "none" || panel.style.display === "";
          if (isHidden) {
            panel.style.display = "block";
            panel.classList.add("show");
            toggleBtn.classList.add("open");
            card.style.borderRadius = "12px 12px 0 0";
            card.style.borderBottomColor = "transparent";
          } else {
            panel.style.display = "none";
            panel.classList.remove("show");
            toggleBtn.classList.remove("open");
            card.style.borderRadius = "12px";
            card.style.borderBottomColor = "#e2e8f0";
          }
        });

        const statusBtn = item.querySelector(".toggle-status-btn");
        statusBtn.addEventListener("click", () => {
          if (!isLicenseActive && camp.status !== "active") {
            showCustomModal(
              I18n.t("modalLicReq"),
              I18n.t("modalLicReqBody"),
              "alert",
              () => showActivationPage(),
            );
            return;
          }
          toggleCampaignStatus(index);
        });
        item
          .querySelector(".edit-btn")
          .addEventListener("click", () => editCampaign(index));
        item
          .querySelector(".delete-btn")
          .addEventListener("click", () => deleteCampaign(index));
      });
    },
  );
}

// in popup.js
// ACTION: Replace parseCampaignCanvas

function parseCampaignCanvas() {
  const titleInput = document.getElementById("campaignTitle");
  const title = titleInput ? titleInput.value.trim() : "Untitled Strategy";

  const blocks = document.querySelectorAll("#campaignCanvas .builder-block");
  if (blocks.length === 0) {
    showCustomModal(
      "Empty Canvas",
      "Please add at least one block to your campaign.",
    );
    return null;
  }

  const steps = [];
  let validationError = null;

  blocks.forEach((block, index) => {
    if (validationError) return;

    const type = block.getAttribute("data-type");
    const step = {
      id: index,
      type: type,
      data: {},
    };

    // --- 1. POST BLOCK PARSER ---
    if (type === "post") {
      // Get selected post templates
      const postPills = block.querySelectorAll(
        '.block-selected-pills[data-type="post"] .block-pill',
      );
      const postIndices = Array.from(postPills).map((p) =>
        parseInt(p.dataset.index, 10),
      );

      // Get selected groups (indices) OR raw data
      const groupPills = block.querySelectorAll(
        '.block-selected-pills[data-type="group"] .block-pill',
      );
      const groupDataList = [];

      groupPills.forEach((p) => {
        if (p.dataset.isAdvanced === "true") {
          try {
            const parsedData = JSON.parse(p.dataset.groupData);
            if (parsedData.type === "dynamic_random") {
              groupDataList.push({
                type: "dynamic_random",
                config: parsedData.config,
                title: parsedData.title,
              });
            } else {
              groupDataList.push({
                type: "raw",
                data: parsedData,
              });
            }
          } catch (e) {
            console.error("Error parsing advanced group data", e);
          }
        } else {
          groupDataList.push({
            type: "index",
            value: parseInt(p.dataset.index, 10),
          });
        }
      });

      // Settings Parsing
      const intervalInput = block.querySelector(".interval-input");
      const waitInput = block.querySelector(".wait-time-input");
      const intervalValue = intervalInput ? parseInt(intervalInput.value) : 1;
      const waitValueMinutes = waitInput ? parseFloat(waitInput.value) : 5;
      const waitValueSeconds = Math.round(waitValueMinutes * 60);

      const settings = {
        postingMethod:
          block.querySelector(`input[name^="meth_"]:checked`)?.value || "popup",
        postOrder:
          block.querySelector(`input[name^="order_"]:checked`)?.value ||
          "sequential",
        commentOption:
          block.querySelector(`input[name^="comm_"]:checked`)?.value ||
          "enable",
        firstCommentText: block.querySelector(".comment-text")?.value || "",
        securityLevel:
          block.querySelector(".security-level-input")?.value || "2",
        linkCount: isNaN(intervalValue) ? 1 : intervalValue,
        timeDelay: isNaN(waitValueSeconds) ? 300 : waitValueSeconds,
        delayAfterFailure:
          block.querySelector(".setting-pause-fail")?.checked || false,
        avoidNightPosting:
          block.querySelector(".setting-night-mode")?.checked || false,
        compressImages:
          block.querySelector(".setting-compress")?.checked || true,
        generateAiVariations:
          block.querySelector(".ai-toggle")?.checked || false,
        aiVariationCount:
          parseInt(
            block.querySelector(".ai-options input[type='number']")?.value,
          ) || 2,
      };

      if (postIndices.length === 0) {
        validationError = `Step ${
          index + 1
        } (Post): No post templates selected.`;
        return;
      }

      // --- INHERITANCE VALIDATION (FIXED) ---
      const inheritToggle = block.querySelector(".inherit-groups-toggle");
      const inheritSelect = block.querySelector(".inherit-step-select");
      let inheritFromStep = undefined;

      if (inheritToggle && inheritToggle.checked) {
        const selectedStepNum = parseInt(inheritSelect?.value, 10);
        if (!isNaN(selectedStepNum)) {
          inheritFromStep = selectedStepNum - 1; // Convert to 0-based index
        }
      }

      // Must have EITHER (valid groups) OR (valid inheritance)
      const hasGroups = groupDataList.length > 0;
      const hasInheritance = inheritFromStep !== undefined;

      if (!hasGroups && !hasInheritance) {
        validationError = `Step ${
          index + 1
        } (Post): No target groups selected. (Toggle 'Target same as...' or add groups)`;
        return;
      }

      step.data = {
        postIndices,
        groupDataList,
        settings,
        inheritFromStep: inheritFromStep,
      };
    }

    // --- 2. WAIT BLOCK PARSER ---
    else if (type === "wait") {
      const d = parseInt(block.querySelector(".wait-d")?.value) || 0;
      const h = parseInt(block.querySelector(".wait-h")?.value) || 0;
      const m = parseInt(block.querySelector(".wait-m")?.value) || 0;

      const totalMinutes = d * 24 * 60 + h * 60 + m;

      if (totalMinutes <= 0) {
        validationError = `Step ${
          index + 1
        } (Wait): Duration must be greater than 0.`;
        return;
      }
      step.data = { totalMinutes };
    }

    // --- 3. LOOP BLOCK PARSER ---
    else if (type === "loop") {
      const loopTypeSelect = block.querySelector(".loop-type-select");
      const stepInput = block.querySelector(".loop-step");

      if (!loopTypeSelect || !stepInput) {
        validationError = `Step ${index + 1} (Loop): Invalid block structure.`;
        return;
      }

      const loopType = loopTypeSelect.value;
      const targetStepUI = parseInt(stepInput.value) || 1;

      if (targetStepUI > index + 1) {
        validationError = `Step ${
          index + 1
        } (Loop): Can only loop back to previous steps (1-${index + 1}).`;
        return;
      }

      const countInput = block.querySelector(".loop-count");
      step.data = {
        type: loopType,
        targetStepIndex: targetStepUI - 1,
        maxLoops: loopType === "count" ? parseInt(countInput?.value) || 1 : -1,
      };
    }

    // --- 4. STOP BLOCK ---
    else if (type === "stop") {
      // No data needed
    }

    // --- 5. TRIGGER BLOCK ---
    else if (type === "trigger") {
      const summaryText =
        block.querySelector(".block-summary-preview")?.textContent || "";
      const freqVal =
        block.querySelector(".trigger-data-freq")?.value || "immediate";

      let triggerDetails = {};
      try {
        if (block.dataset.triggerSettings) {
          triggerDetails = JSON.parse(block.dataset.triggerSettings);
        }
      } catch (e) {
        console.error("Error parsing trigger settings", e);
      }

      step.data = {
        meta: "trigger",
        type: freqVal === "immediate" ? "immediate" : "scheduled",
        frequency: freqVal,
        summary: summaryText,
        ...triggerDetails,
      };
    }

    steps.push(step);
  });

  if (validationError) {
    showCustomModal("Validation Error", validationError);
    return null;
  }

  // Trigger Logic
  let triggerData = { type: "immediate" };
  let calculatedNextRun = null;

  const firstBlock = blocks[0];
  if (firstBlock && firstBlock.getAttribute("data-type") === "trigger") {
    const freqInput = firstBlock.querySelector(".trigger-data-freq");
    if (freqInput && freqInput.value && freqInput.value !== "immediate") {
      try {
        const rawSettings = firstBlock.dataset.triggerSettings;
        if (rawSettings) {
          const settings = JSON.parse(rawSettings);
          const mockPostForCalc = {
            frequency: settings.frequency,
            scheduleDateTime: settings.scheduleDateTime,
            scheduleTime: settings.scheduleTime,
            weekdays: settings.weekdays,
            monthDays: settings.monthDays,
          };
          calculatedNextRun = calculateNextRunTime(mockPostForCalc);
          triggerData = {
            type: "scheduled",
            frequency: settings.frequency,
            nextRunTime: calculatedNextRun,
          };
        }
      } catch (e) {
        console.error("Failed to calculate initial campaign run time", e);
      }
    }
  }

  return {
    id: `camp_${Date.now()}`,
    title: title || "Untitled Strategy",
    createdAt: new Date().toISOString(),
    status: "active",
    currentStepIndex: 0,
    loopCounters: {},
    steps: steps,
    trigger: triggerData,
    nextRunTime: calculatedNextRun,
  };
}

function toggleCampaignStatus(index) {
  chrome.storage.local.get(["campaigns", "licenseVerified"], (result) => {
    const campaigns = result.campaigns || [];
    const isPro = result.licenseVerified === true;

    if (!campaigns[index]) return;

    // --- LICENSE GATE ---
    // If trying to ACTIVATE (Resume) and not Pro, block it.
    if (campaigns[index].status !== "active" && !isPro) {
      showCustomModal(
        I18n.t("btnUpgradeReq"), // "Upgrade Required"
        I18n.t("lockCampResume"), // FIX: Localized
        "alert",
        () => showActivationPage(),
        null,
        I18n.t("btnUpgrade"),
      );
      return;
    }
    // --------------------

    // Toggle logic
    if (campaigns[index].status === "active") {
      campaigns[index].status = "paused";
    } else {
      campaigns[index].status = "active";
      // If completed, ask to restart? For now, simple toggle.
      if (campaigns[index].currentStepIndex >= campaigns[index].steps.length) {
        campaigns[index].currentStepIndex = 0; // Restart if finished
        campaigns[index].status = "active";
        showCustomModal(I18n.t("campActionRestart"), I18n.t("campRestartMsg"));
      }
    }

    chrome.storage.local.set({ campaigns }, () => {
      renderCampaignList(); // Update Dashboard UI
      loadScheduledPosts(); // Update Upcoming Schedule immediately

      // Trigger background check immediately so resumes happen fast
      chrome.runtime.sendMessage({ action: "runSchedulerCheck" });
    });
  });
}

function deleteCampaign(index) {
  showCustomModal(
    I18n.t("campDeleteTitle"),
    I18n.t("campDeleteMsg"),
    "confirm",
    () => {
      chrome.storage.local.get(
        ["campaigns", "missedRecurringNotifications"],
        (result) => {
          const campaigns = result.campaigns || [];
          const notifications = result.missedRecurringNotifications || [];

          // 1. Identify the campaign ID before deletion
          const campaignToDelete = campaigns[index];
          if (!campaignToDelete) return; // Safety check

          // 2. Remove the campaign
          campaigns.splice(index, 1);

          // 3. Remove associated notifications (Clean up ghosts)
          // Campaign notifications typically use the campaign ID or post ID associated with it.
          // Our notification logic uses `postId` which matches `campaign.id`.
          const updatedNotifications = notifications.filter(
            (n) => n.postId !== campaignToDelete.id,
          );

          // 4. Save both updates
          chrome.storage.local.set(
            {
              campaigns: campaigns,
              missedRecurringNotifications: updatedNotifications,
            },
            () => {
              renderCampaignList(); // Update Campaign Dashboard
              loadScheduledPosts(); // Update Upcoming Schedule & Notifications area
            },
          );
        },
      );
    },
  );
}

function editCampaign(index) {
  chrome.storage.local.get("campaigns", (result) => {
    const campaigns = result.campaigns || [];
    const campaign = campaigns[index];
    if (!campaign) return;

    // 1. Set Global Edit ID
    editingCampaignId = campaign.id;

    // 2. Switch Views
    document.getElementById("campaignListView").classList.add("d-none");
    document.getElementById("campaignBuilderView").classList.remove("d-none");

    // 3. Load Title
    document.getElementById("campaignTitle").value = campaign.title;

    // 4. Clear Canvas & Restore Start Node
    // We clear innerHTML, but we DO NOT remove the container's event listeners.
    const canvas = document.getElementById("campaignCanvas");
    canvas.innerHTML = `
         
        `;

    // 5. Reconstruct Blocks
    chrome.storage.local.get(["tags", "groups"], (data) => {
      const allTags = data.tags || [];
      const allGroups = data.groups || [];

      campaign.steps.forEach((stepData) => {
        const block = createBlockElement(stepData.type);

        // Collapse by default for cleaner UI
        block.classList.add("collapsed");

        // Attach internal events (dragstart, remove click, etc.) to the NEW block
        setupBuilderBlockEvents(block);

        canvas.appendChild(block);

        // --- POPULATE DATA ---
        // This function now correctly updates the summary headers
        restoreBlockData(block, stepData, allTags, allGroups);

        if (stepData.type === "trigger") {
          const data = stepData.data || {};

          // 1. Restore Badge UI
          const badge = block.querySelector(".trigger-result-badge");
          const summaryEl = block.querySelector(".block-summary-preview");

          if (badge && data.summary) {
            badge.innerHTML = `<i class="fa fa-check-circle"></i> ${data.summary}`;
            badge.classList.remove("not-set");
            badge.style.backgroundColor = "#eff6ff";
            badge.style.color = "#3b82f6";
            badge.style.borderColor = "#dbeafe";
          }

          if (summaryEl && data.summary) {
            summaryEl.textContent = data.summary;
          }

          // 2. Restore Hidden Inputs (Critical for re-saving)
          const freqInput = block.querySelector(".trigger-data-freq");
          const summaryInput = block.querySelector(".trigger-data-summary");

          if (freqInput) freqInput.value = data.frequency || "immediate";
          if (summaryInput) summaryInput.value = data.summary || "";

          // 3. Restore Full Config Dataset (Critical for parser)
          // We need to reconstruct the config object from the saved data if possible,
          // or hopefully it was saved in stepData.data spread.
          // In `parseCampaignCanvas`, we spread `...triggerDetails` into `step.data`.
          // So `stepData.data` IS the config object.
          if (data) {
            block.dataset.triggerSettings = JSON.stringify(data);
          }
        }
      });

      updateCampaignSteps();

      // 6. Update Save Button Text
      document.getElementById("saveCampaignBtn").innerHTML = "Update";

      // 7. Re-apply inheritance
      restoreInheritanceSelections(campaign.steps);

      // 8. Re-initialize Builder
      // This will refresh toolbar items but SKIP re-attaching canvas listeners due to the check.
      initCampaignBuilder();
    });
  });
}

function restoreBlockData(block, stepData, allTags, allGroups) {
  const data = stepData.data;
  if (!data) return; // Safety check

  if (stepData.type === "post") {
    // A. Restore Post Pills
    if (data.postIndices) {
      const postContainer = block.querySelector(
        '.block-selected-pills[data-type="post"]',
      );
      const postInput = block.querySelector(
        '.block-multiselect-container[data-type="post"] .block-multiselect-input',
      );

      data.postIndices.forEach((idx) => {
        if (allTags[idx]) {
          const pill = document.createElement("div");
          pill.className = "block-pill";
          pill.dataset.index = idx;
          pill.innerHTML = `<span>${allTags[idx].title}</span><span class="block-pill-remove">&times;</span>`;
          pill
            .querySelector(".block-pill-remove")
            .addEventListener("click", (e) => {
              e.stopPropagation();
              pill.remove();
              if (postInput && postContainer) {
                postInput.value =
                  postContainer.children.length === 0
                    ? ""
                    : `${postContainer.children.length} selected`;
              }
              updatePostBlockSummary(block);
            });
          postContainer.appendChild(pill);
        }
      });
      if (postInput) postInput.value = `${data.postIndices.length} selected`;
    }

    // B. Restore Group Pills
    if (data.groupDataList) {
      const groupContainer = block.querySelector(
        '.block-selected-pills[data-type="group"]',
      );
      const groupInput = block.querySelector(
        '.block-multiselect-container[data-type="group"] .block-multiselect-input',
      );

      data.groupDataList.forEach((gItem) => {
        if (gItem.type === "index" && allGroups[gItem.value]) {
          const grp = allGroups[gItem.value];
          const pill = document.createElement("div");
          pill.className = "block-pill";
          pill.dataset.index = gItem.value;
          pill.innerHTML = `<span>${grp.title}</span><span class="block-pill-remove">&times;</span>`;
          pill
            .querySelector(".block-pill-remove")
            .addEventListener("click", (e) => {
              e.stopPropagation();
              pill.remove();
              updatePostBlockSummary(block);
            });
          groupContainer.appendChild(pill);
        } else if (gItem.type === "raw") {
          addAdvancedGroupToBlock(block, gItem.data);
        } else if (gItem.type === "dynamic_random") {
          const dynamicObj = {
            type: "dynamic_random",
            title: gItem.title,
            config: gItem.config,
          };
          addAdvancedGroupToBlock(block, dynamicObj);
        }
      });
      if (groupInput)
        groupInput.value = `${data.groupDataList.length} selected`;
    }

    // C. Restore Settings
    if (data.settings) {
      const s = data.settings; // <--- 's' IS DEFINED HERE

      // Radios (Method)
      const methRadio = block.querySelector(
        `.method-radio[value="${s.postingMethod}"]`,
      );
      if (methRadio) {
        methRadio.checked = true;
        methRadio.dispatchEvent(new Event("change"));
      }
      const secSlider = block.querySelector(".security-level-input");
      if (secSlider) {
        secSlider.value = s.securityLevel || "2";
      }
      // Radios (Order)
      const orderRadio = block.querySelector(`input[value="${s.postOrder}"]`);
      if (orderRadio && orderRadio.name.startsWith("order_")) {
        orderRadio.checked = true;
        orderRadio.dispatchEvent(new Event("change"));
      }

      // Radios (Comments)
      const commRadio = block.querySelector(
        `.comment-type-radio[value="${s.commentOption}"]`,
      );
      if (commRadio) {
        commRadio.checked = true;
        commRadio.dispatchEvent(new Event("change"));
      }

      // Inputs
      if (s.firstCommentText) {
        const commentInput = block.querySelector(".comment-text");
        if (commentInput) commentInput.value = s.firstCommentText;
      }

      // Interval input
      const intervalInput = block.querySelector(".interval-input");
      if (intervalInput) intervalInput.value = s.linkCount || 1;

      // Wait Time Input (This uses 's' correctly now)
      const waitInput = block.querySelector(".wait-time-input");
      if (waitInput) {
        const mins = (s.timeDelay || 300) / 60;
        waitInput.value = mins;
      }

      // Toggles
      const pauseFailToggle = block.querySelector(".setting-pause-fail");
      if (pauseFailToggle)
        pauseFailToggle.checked = s.delayAfterFailure || false;

      const nightModeToggle = block.querySelector(".setting-night-mode");
      if (nightModeToggle)
        nightModeToggle.checked = s.avoidNightPosting || false;

      const compressToggle = block.querySelector(".setting-compress");
      if (compressToggle) compressToggle.checked = s.compressImages !== false;

      // AI Settings
      const aiToggle = block.querySelector(".ai-toggle");
      if (aiToggle) {
        aiToggle.checked = s.generateAiVariations || false;
        aiToggle.dispatchEvent(new Event("change")); // Trigger visibility
      }
      const aiCount = block.querySelector(".ai-options input[type='number']");
      if (aiCount) aiCount.value = s.aiVariationCount || 2;
    }

    // D. Inheritance Toggle
    if (data.inheritFromStep !== undefined) {
      const toggle = block.querySelector(".inherit-groups-toggle");
      if (toggle) {
        toggle.checked = true;
        toggle.dispatchEvent(new Event("change"));
      }
    } else {
      const toggle = block.querySelector(".inherit-groups-toggle");
      if (toggle && data.groupDataList && data.groupDataList.length > 0) {
        toggle.checked = false;
        toggle.dispatchEvent(new Event("change"));
      }
    }

    // Force summary update
    updatePostBlockSummary(block);
  }

  if (stepData.type === "wait") {
    const totalMins = data.totalMinutes;
    const d = Math.floor(totalMins / (24 * 60));
    const h = Math.floor((totalMins % (24 * 60)) / 60);
    const m = totalMins % 60;

    const dInput = block.querySelector(".wait-d");
    const hInput = block.querySelector(".wait-h");
    const mInput = block.querySelector(".wait-m");

    if (dInput) dInput.value = d;
    if (hInput) hInput.value = h;
    if (mInput) {
      mInput.value = m;
      mInput.dispatchEvent(new Event("input")); // Update summary
    }
  }

  if (stepData.type === "loop") {
    const typeSelect = block.querySelector(".loop-type-select");
    if (typeSelect) {
      typeSelect.value = data.type;
      typeSelect.dispatchEvent(new Event("change"));
    }

    const stepInput = block.querySelector(".loop-step");
    if (stepInput) {
      stepInput.value = data.targetStepIndex + 1;
      stepInput.dispatchEvent(new Event("input"));
    }

    if (data.maxLoops > 0) {
      const countInput = block.querySelector(".loop-count");
      if (countInput) countInput.value = data.maxLoops;
    }
  }
}

function restoreInheritanceSelections(savedSteps) {
  const liveBlocks = document.querySelectorAll(
    "#campaignCanvas .builder-block",
  );

  liveBlocks.forEach((block, index) => {
    const savedData = savedSteps[index];
    if (
      savedData &&
      savedData.type === "post" &&
      savedData.data.inheritFromStep !== undefined
    ) {
      const select = block.querySelector(".inherit-step-select");
      // Convert saved 0-based index back to UI 1-based Step
      const uiStepValue = savedData.data.inheritFromStep + 1;
      if (select) {
        select.value = uiStepValue;
        block.dataset.inheritFrom = uiStepValue; // Sync dataset
      }
    }
  });
}

async function checkDailyLimit() {
  const data = await chrome.storage.local.get([
    "dailyPostCount",
    "lastDailyReset",
  ]);
  const today = new Date().toDateString(); // e.g., "Mon Dec 22 2025"

  let count = data.dailyPostCount || 0;

  // If date changed, reset count to 0
  if (data.lastDailyReset !== today) {
    console.log("New day detected. Resetting daily count to 0.");
    count = 0;
    await chrome.storage.local.set({
      dailyPostCount: 0,
      lastDailyReset: today,
      freePostsRemaining: 3, // Resync storage
    });
  }

  const remaining = Math.max(0, MAX_DAILY_FREE_POSTS - count);
  return { count, remaining };
}

async function incrementDailyPostCount() {
  // Get fresh data via the helper to ensure we handle day-rollovers correctly
  const { count } = await checkAndResetDailyLimit();

  const newCount = count + 1;
  const newRemaining = Math.max(0, MAX_DAILY_FREE_POSTS - newCount);

  // FIX: Use the new Date format here too
  const today = new Date().toISOString().split("T")[0];

  await chrome.storage.local.set({
    dailyPostCount: newCount,
    freePostsRemaining: newRemaining,
    lastDailyReset: today, // Ensure date is synced
  });

  updateTierUI();
}

// 3. Update Header UI
async function updateTierUI() {
  const { licenseVerified } = await chrome.storage.local.get("licenseVerified");
  const freeBadge = document.getElementById("freeTierBadge");
  const proBadge = document.getElementById("proTierBadge");
  const dailyCountSpan = document.getElementById("dailyPostsLeft");

  // Also handle AI buttons lock state here
  updateFeatureLocks(licenseVerified);

  if (licenseVerified) {
    if (freeBadge) freeBadge.style.display = "none";
    if (proBadge) proBadge.style.display = "flex";
    // Hide onboarding if Pro (optional, or keep it as a guide)
    // document.getElementById('onboardingChecklist').classList.add('d-none');
  } else {
    // Free Tier
    const { remaining } = await checkDailyLimit();
    if (freeBadge) {
      freeBadge.style.display = "flex";
      if (dailyCountSpan) dailyCountSpan.textContent = remaining;

      // Visual indicator if 0 left
      if (remaining === 0) {
        freeBadge.style.borderColor = "#fca5a5";
        freeBadge.style.background = "#fef2f2";
        dailyCountSpan.style.color = "#dc2626";
      }
    }
    if (proBadge) proBadge.style.display = "none";

    // Update Onboarding
    updateChecklistProgress();
  }
}

// in popup.js
// ACTION: Replace updateFeatureLocks

function updateFeatureLocks(isPro) {
  const aiButtons = [
    "aiEnhanceButton",
    "aiGenerateButton",
    "quickAiEnhanceButton",
    "quickAiGenerateButton",
    "openAiWizardBtn", // Wizard button
    "startAutoJoinBTN",
  ];

  const campaignCanvasWrapper = document.querySelector(
    ".campaign-canvas-wrapper",
  );
  const campaignCanvas = document.getElementById("campaignCanvas");
  const saveCampaignBtn = document.getElementById("saveCampaignBtn");

  // Licensing disabled: always unlock all UI
  aiButtons.forEach((id) => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.classList.remove("feature-locked");
      btn.disabled = false;
    }
  });

  if (campaignCanvasWrapper) {
    const existingLock = campaignCanvasWrapper.querySelector(
      ".campaign-lock-overlay",
    );
    if (existingLock) existingLock.remove();
    if (campaignCanvas) campaignCanvas.style.pointerEvents = "auto";
  }
  if (saveCampaignBtn) saveCampaignBtn.disabled = false;
}

// in popup.js
// ACTION: Replace the entire handleAiWizardSubmit function with this updated version.

async function handleAiWizardSubmit() {
  // --- 1. FREEMIUM LOCK ---
  const { licenseVerified } = await chrome.storage.local.get("licenseVerified");
  if (!licenseVerified) {
    hideAiWizard();
    showCustomModal(
      I18n.t("modalProFeature"),
      I18n.t("lockCampArch"), // FIX: Localized
      "alert",
      () => {
        openPricingModal();
      },
      null,
      I18n.t("btnUnlock"), // FIX: Localized
    );
    return;
  }

  // --- 2. VALIDATION ---
  const promptInput = document.getElementById("aiWizardPrompt");
  const prompt = promptInput.value.trim();

  if (!prompt) {
    showCustomModal(I18n.t("wizInputReq"), I18n.t("wizEnterGoal"));
    promptInput.focus();
    return;
  }

  // --- 3. UI STATE UPDATE (Show Loading) ---
  const stepInput = document.getElementById("wizardStepInput");
  const stepLoading = document.getElementById("wizardStepLoading");
  const genBtn = document.getElementById("generateCampaignBtn");
  const loadingText = document.getElementById("wizardLoadingText");
  const closeBtn = document.getElementById("closeAiWizardBtn");

  if (stepInput) stepInput.style.display = "none";
  if (stepLoading) {
    stepLoading.classList.remove("d-none");
    stepLoading.style.display = "block";
  }

  if (genBtn) {
    genBtn.disabled = true;
    genBtn.innerHTML = `<i class="fa fa-spinner fa-spin"></i> ${I18n.t(
      "wizBtnAnalyzing",
    )}`;
  }
  if (closeBtn) closeBtn.style.pointerEvents = "none";

  // --- 4. GATHER DATA ---
  const modeRadio = document.querySelector(
    'input[name="aiContentSource"]:checked',
  );
  const mode = modeRadio ? modeRadio.value : "generate";

  // Settings
  const autoLoop = document.getElementById("aiWizardLoop").checked;
  const startImmediate = document.getElementById("aiWizardImmediate").checked;
  const smartGroupMatch = document.getElementById("aiWizardSmartGroup").checked;

  // A. Resolve Selected Templates (for 'existing' mode)
  let contextTemplates = [];

  if (mode === "existing") {
    const selectedTemplateIndices = Array.from(wizardSelectedPosts);
    contextTemplates = selectedTemplateIndices.map((idx) => {
      const t = tags[idx];
      return {
        originalIndex: idx,
        title: t.title || `Template ${idx}`,
        // Send first 300 chars of text so AI knows context, but save tokens
        text: t.text ? t.text.replace(/<[^>]*>/g, " ").substring(0, 300) : "",
      };
    });

    if (contextTemplates.length === 0) {
      showCustomModal(I18n.t("wizInputReq"), I18n.t("wizNoTemplate"));
      resetWizardUI();
      return;
    }
  }

  // B. Resolve Groups Context (FLATTENING COLLECTIONS)
  // We map every single link to a unique ID: "CollectionIndex_LinkIndex"
  let availableGroupsContext = [];

  if (
    smartGroupMatch &&
    typeof groups !== "undefined" &&
    Array.isArray(groups)
  ) {
    // 1. Flatten all collections
    groups.forEach((collection, cIndex) => {
      if (collection.links && Array.isArray(collection.links)) {
        collection.links.forEach((link, lIndex) => {
          // link is usually [Title, URL]
          const groupName = link[0];

          if (groupName && groupName.trim() !== "") {
            availableGroupsContext.push({
              id: `${cIndex}_${lIndex}`, // Composite ID to map back later
              name: groupName,
            });
          }
        });
      }
    });

    // 2. Handle Token Limits (Large Lists)
    // Sending 3000 groups ~ 30k-40k tokens.
    // We limit to 1000 to keep it fast and within standard limits while still being very effective.
    if (availableGroupsContext.length > 1000) {
      console.warn(
        `[AI Wizard] Truncating group list from ${availableGroupsContext.length} to 1000 for token safety.`,
      );
      // Optional: We could prioritize groups here, but random or first-found is okay for now.
      availableGroupsContext = availableGroupsContext.slice(0, 1000);
    }

    console.log(
      `[AI Wizard] Sending ${availableGroupsContext.length} individual groups for analysis.`,
    );
  }

  // --- 5. SEND TO BACKGROUND ---
  if (loadingText)
    loadingText.textContent = I18n.t("wizAnalyzing", [
      String(availableGroupsContext.length),
    ]);

  const message = {
    action: "aiGenerateCampaignStrategy",
    goal: prompt,
    mode: mode,
    existingTemplates: contextTemplates,
    availableGroups: availableGroupsContext, // Now contains flat list of {id, name}
    settings: {
      smartMatch: smartGroupMatch,
    },
  };

  chrome.runtime.sendMessage(message, (response) => {
    // Handle Runtime Errors
    if (chrome.runtime.lastError) {
      console.error("AI Wizard Error:", chrome.runtime.lastError);
      showCustomModal("Error", I18n.t("wizError"));
      resetWizardUI();
      return;
    }

    // Capture manual selections to apply if AI smart match returns nothing
    const groupData = {
      indices: Array.from(wizardSelectedGroups),
      advanced: wizardAdvancedGroups || [],
      smart: smartGroupMatch,
    };

    handleWizardResponse(response, groupData, autoLoop, startImmediate);
  });
}

function handleWizardResponse(response, groupData, autoLoop, startNow) {
  // 1. Basic Error Handling
  if (!response || !response.success) {
    console.error("AI Wizard Failed:", response?.error);
    showCustomModal(
      I18n.t("wizFailedTitle"),
      response?.error || I18n.t("wizFailedMsg"),
      "alert",
    );
    resetWizardUI();
    return;
  }

  // 2. Validate Strategy Structure
  const strategy = response.strategy;
  if (
    !strategy ||
    !Array.isArray(strategy.steps) ||
    strategy.steps.length === 0
  ) {
    showCustomModal(I18n.t("wizEmptyTitle"), I18n.t("wizEmptyMsg"), "alert");
    resetWizardUI();
    return;
  }

  // 3. Success Path - Build the Campaign
  try {
    buildCampaignFromAiStrategy(strategy, groupData, autoLoop, startNow);

    // Hide Wizard & Cleanup
    hideAiWizard();
    aiWizardMedia = []; // Clear media buffer
    updateAiWizardMediaPreview();
  } catch (error) {
    console.error("Campaign Build Error:", error);
    showCustomModal(
      I18n.t("wizBuildError"),
      I18n.t("wizBuildMsg", [error.message]),
      "alert",
    );
    resetWizardUI();
  }
}
// in popup.js
// in popup.js
// ACTION: Replace the resetWizardUI and showAiWizard functions.

function resetWizardUI() {
  const stepInput = document.getElementById("wizardStepInput");
  const stepLoading = document.getElementById("wizardStepLoading");
  const genBtn = document.getElementById("generateCampaignBtn");
  const closeBtn = document.getElementById("closeAiWizardBtn");
  const loadingText = document.getElementById("wizardLoadingText");

  // 1. Reset Visibility (Force both class and inline style)
  if (stepInput) {
    stepInput.classList.remove("d-none");
    stepInput.style.display = "block";
  }

  if (stepLoading) {
    stepLoading.classList.add("d-none");
    stepLoading.style.display = "none";
  }

  // 2. Reset Button State
  if (genBtn) {
    genBtn.disabled = false;
    genBtn.innerHTML = '<i class="fa fa-magic"></i> Generate Campaign';
  }

  // 3. Reset Text
  if (loadingText) {
    loadingText.textContent = "Analyzing intent & generating copy...";
  }

  // 4. Re-enable Close Button
  if (closeBtn) {
    closeBtn.style.pointerEvents = "auto";
    closeBtn.style.opacity = "1";
  }
}

function showAiWizard() {
  const modal = document.getElementById("aiCampaignWizardModal");
  if (!modal) return;

  // --- CRITICAL FIX: FORCE FULL UI RESET ---
  resetWizardUI();

  // 1. Clear Inputs
  const promptInput = document.getElementById("aiWizardPrompt");
  if (promptInput) promptInput.value = "";

  const fileInput = document.getElementById("aiWizardFileInput");
  if (fileInput) fileInput.value = null;

  // 2. Clear Media State
  if (typeof aiWizardMedia !== "undefined") {
    aiWizardMedia = [];
    updateAiWizardMediaPreview();
  }

  // 3. Reset Group Selectors
  if (typeof wizardSelectedGroups !== "undefined") wizardSelectedGroups.clear();
  if (typeof wizardAdvancedGroups !== "undefined") wizardAdvancedGroups = [];

  // Clear pills from UI
  document
    .querySelectorAll('.block-selected-pills[data-type^="wizard"]')
    .forEach((el) => (el.innerHTML = ""));
  document
    .querySelectorAll(".block-multiselect-input")
    .forEach((el) => (el.value = ""));

  // 4. Show Modal
  modal.classList.remove("d-none");
  setTimeout(() => modal.classList.add("show"), 10);
}

// ACTION: Add this listener update to ensure Cancel/Close also resets the state.
// (Find the existing hideAiWizard function reference or add this block)

function hideAiWizard() {
  const modal = document.getElementById("aiCampaignWizardModal");
  if (modal) {
    modal.classList.remove("show");
    setTimeout(() => {
      modal.classList.add("d-none");
      // Reset UI after animation finishes so it's clean for next time
      resetWizardUI();
    }, 300);
  }
}

// Helper to map AI's relative indices [0, 1] to global [5, 12]
function mapAiIndicesToGlobal(strategy, selectedIndices) {
  // Deep clone to avoid mutating original if needed
  const newStrategy = JSON.parse(JSON.stringify(strategy));

  if (!newStrategy.steps) return newStrategy;

  newStrategy.steps.forEach((step) => {
    if (step.type === "post" && step.templateIndex !== undefined) {
      // AI says "Use item 0". We look up item 0 in our selected list.
      if (step.templateIndex < selectedIndices.length) {
        step.templateIndex = selectedIndices[step.templateIndex];
      } else {
        // Fallback if AI hallucinates an index
        step.templateIndex = selectedIndices[0];
      }
    }
  });
  return newStrategy;
}

// --- Helper for Wizard Multi-Selects ---
function initWizardMultiSelect(type, dataSource, selectionSet) {
  const container = document.querySelector(
    `.block-multiselect-container[data-type="${type}"]`,
  );
  const pillsContainer = document.querySelector(
    `.block-selected-pills[data-type="${type}"]`,
  );
  const input = container?.querySelector("input");
  const dropdown = container?.querySelector(".block-multiselect-dropdown");

  if (!container || !input || !dropdown) return;

  // Render Dropdown
  dropdown.innerHTML = "";
  dataSource.forEach((item, index) => {
    const opt = document.createElement("div");
    opt.className = "block-multiselect-option";
    opt.innerHTML = `<span>${item.title}</span>`;
    opt.addEventListener("click", (e) => {
      e.stopPropagation();
      if (selectionSet.has(index)) {
        selectionSet.delete(index);
        opt.classList.remove("selected");
        pillsContainer.querySelector(`[data-index="${index}"]`)?.remove();
      } else {
        selectionSet.add(index);
        opt.classList.add("selected");

        // Add Pill
        const pill = document.createElement("div");
        pill.className = "block-pill";
        pill.dataset.index = index;
        pill.innerHTML = `<span>${item.title}</span><span class="remove">&times;</span>`;
        pill.querySelector(".remove").onclick = (ev) => {
          ev.stopPropagation();
          selectionSet.delete(index);
          pill.remove();
          opt.classList.remove("selected");
          input.value =
            selectionSet.size > 0 ? `${selectionSet.size} selected` : "";
        };
        pillsContainer.appendChild(pill);
      }
      input.value =
        selectionSet.size > 0 ? `${selectionSet.size} selected` : "";
    });
    dropdown.appendChild(opt);
  });

  // Toggle
  input.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("show");
  });

  // Close on outside click
  document.addEventListener("click", (e) => {
    if (!container.contains(e.target)) dropdown.classList.remove("show");
  });
}

// in popup.js

function updateAiWizardMediaPreview() {
  const container = document.getElementById("aiWizardMediaPreview");
  if (!container) return;
  container.innerHTML = "";

  aiWizardMedia.forEach((m, idx) => {
    const wrapper = document.createElement("div");
    wrapper.className = "studio-media-wrapper";

    const el =
      m.type === "video"
        ? document.createElement("video")
        : document.createElement("img");
    el.src = m.data;
    el.className = "studio-preview-item";

    const removeBtn = document.createElement("div");
    removeBtn.className = "studio-media-remove";
    removeBtn.innerHTML = "<i class='fa fa-times'></i>";
    removeBtn.onclick = () => {
      aiWizardMedia.splice(idx, 1);
      updateAiWizardMediaPreview();
    };

    wrapper.appendChild(el);
    wrapper.appendChild(removeBtn);
    container.appendChild(wrapper);
  });
}

async function buildCampaignFromAiStrategy(
  strategy,
  groupData,
  autoLoop,
  startNow,
) {
  console.log("Building campaign from AI strategy:", strategy);

  // 1. Reset Canvas to a clean state
  document.getElementById("createNewCampaignBtn").click();

  // 2. Set Title
  const titleInput = document.getElementById("campaignTitle");
  if (titleInput) {
    titleInput.value = strategy.title || "AI Generated Strategy";
  }

  const canvas = document.getElementById("campaignCanvas");

  // 3. Configure Start Trigger
  if (startNow) {
    const triggerBlock = canvas.querySelector(
      '.builder-block[data-type="trigger"]',
    );
    if (triggerBlock) {
      const badge = triggerBlock.querySelector(".trigger-result-badge");
      const freqInput = triggerBlock.querySelector(".trigger-data-freq");

      if (badge) {
        badge.innerHTML = `<i class="fa fa-bolt"></i> Starts Immediately`;
        badge.classList.remove("not-set");
        badge.style.backgroundColor = "#eff6ff";
        badge.style.color = "#3b82f6";
      }
      if (freqInput) freqInput.value = "immediate";

      // Save config to block for parser
      triggerBlock.dataset.triggerSettings = JSON.stringify({
        frequency: "once",
        scheduleDateTime: new Date().toISOString(),
      });
    }
  }

  // 4. Resolve Groups (Defensive Logic)
  let aiDeterminedGroupData = null;

  // Only attempt to resolve IDs if the AI actually returned them
  if (
    strategy.targetGroupIds &&
    Array.isArray(strategy.targetGroupIds) &&
    strategy.targetGroupIds.length > 0
  ) {
    const matchedLinks = [];

    // SAFE LOOP: Check existence of everything before accessing
    strategy.targetGroupIds.forEach((id) => {
      if (!id || typeof id !== "string") return;

      const parts = id.split("_");
      if (parts.length !== 2) return; // Invalid ID format

      const cIdx = parseInt(parts[0], 10);
      const lIdx = parseInt(parts[1], 10);

      // Verify Collection exists
      if (typeof groups !== "undefined" && groups[cIdx]) {
        // Verify Link exists
        if (groups[cIdx].links && groups[cIdx].links[lIdx]) {
          matchedLinks.push(groups[cIdx].links[lIdx]);
        }
      }
    });

    if (matchedLinks.length > 0) {
      console.log(
        `[AI Wizard] Successfully matched ${matchedLinks.length} groups from AI suggestions.`,
      );
      aiDeterminedGroupData = {
        type: "raw",
        data: {
          type: "static",
          title: `AI Selected (${matchedLinks.length} Groups)`,
          links: matchedLinks,
        },
      };
    } else {
      console.warn(
        "[AI Wizard] AI returned IDs, but none matched current groups. Falling back to manual.",
      );
    }
  }

  // 5. Iterate Strategy Steps
  let postStepCounter = 0;

  // We need the current global tags to potentially add new ones
  const { tags: currentTags = [] } = await chrome.storage.local.get("tags");
  let tagsModified = false;

  for (const step of strategy.steps) {
    if (step.type === "post") {
      let tagIndex = -1;
      let tagTitle = "Post";

      // A. Handle Content Generation
      if (step.content) {
        // Distribute uploaded media across generated posts
        let stepMedia = [];
        if (typeof aiWizardMedia !== "undefined" && aiWizardMedia.length > 0) {
          stepMedia = [aiWizardMedia[postStepCounter % aiWizardMedia.length]];
        }

        const newTag = {
          title: step.title || `AI Post ${postStepCounter + 1}`,
          text: step.content, // HTML Content from AI
          categoryIds: [],
          images: stepMedia,
          color: "#18191A",
        };

        // Add to local state and mark for save
        currentTags.push(newTag);
        tagIndex = currentTags.length - 1;
        tagTitle = newTag.title;
        tagsModified = true;
        postStepCounter++;
      }
      // B. Handle Existing Template Usage
      else if (step.templateIndex !== undefined) {
        // AI returns relative index (0, 1, 2) based on the list we sent it.
        // We need to map that back to the REAL index in `tags`.
        // Note: `handleAiWizardSubmit` constructed `contextTemplates` with `originalIndex`.
        // However, the AI just says "index: 0".
        // We assume the AI uses the index of the array we provided.
        // *Improvement:* If we stored the mapping in `handleAiWizardSubmit`, we could look it up.
        // For now, we trust the `wizardSelectedPosts` set order if accessible, or just use what we have.

        // Simpler approach: If using "Existing", the user selected specific templates.
        // We can just round-robin through the selected templates if AI logic gets fuzzy.

        const selectedIndicesArray = Array.from(wizardSelectedPosts);
        if (selectedIndicesArray.length > 0) {
          // Use modulo to safely wrap around if AI suggests an out-of-bounds index
          const safeIndex =
            (step.templateIndex || 0) % selectedIndicesArray.length;
          tagIndex = selectedIndicesArray[safeIndex];
          if (currentTags[tagIndex]) {
            tagTitle = currentTags[tagIndex].title;
          }
        }
      }

      if (tagIndex === -1) continue; // Skip invalid steps

      // --- Create UI Block ---
      const block = createBlockElement("post");
      setupBuilderBlockEvents(block);

      // Add Post Pill
      const postContainer = block.querySelector(
        '.block-selected-pills[data-type="post"]',
      );
      const pill = document.createElement("div");
      pill.className = "block-pill";
      pill.dataset.index = tagIndex;
      pill.innerHTML = `<span>${tagTitle}</span><span class="block-pill-remove">&times;</span>`;
      pill
        .querySelector(".block-pill-remove")
        .addEventListener("click", (e) => {
          e.stopPropagation();
          pill.remove();
          updatePostBlockSummary(block);
        });
      postContainer.appendChild(pill);

      // Add Group Pills (Priority: AI > Manual)
      if (aiDeterminedGroupData) {
        addAdvancedGroupToBlock(block, aiDeterminedGroupData.data);
      } else {
        // Fallback to what the user selected in the Wizard UI
        const grpContainer = block.querySelector(
          '.block-selected-pills[data-type="group"]',
        );

        // Manual Indices
        (groupData.indices || []).forEach((idx) => {
          if (groups[idx]) {
            const gPill = document.createElement("div");
            gPill.className = "block-pill";
            gPill.dataset.index = idx;
            gPill.innerHTML = `<span>${groups[idx].title}</span><span class="block-pill-remove">&times;</span>`;
            gPill
              .querySelector(".block-pill-remove")
              .addEventListener("click", (e) => {
                e.stopPropagation();
                gPill.remove();
                updatePostBlockSummary(block);
              });
            grpContainer.appendChild(gPill);
          }
        });

        // Manual Advanced
        (groupData.advanced || []).forEach((adv) => {
          addAdvancedGroupToBlock(block, adv);
        });
      }

      // Enable AI Variations if requested
      if (step.aiVariations) {
        const aiToggle = block.querySelector(".ai-toggle");
        if (aiToggle) {
          aiToggle.checked = true;
          block.querySelector(".ai-options").classList.remove("d-none");
        }
      }

      canvas.appendChild(block);
      updatePostBlockSummary(block);
    } else if (step.type === "wait") {
      const block = createBlockElement("wait");
      setupBuilderBlockEvents(block);

      // Safely handle potentially missing data
      const days = parseInt(step.days) || 0;
      const hours = parseInt(step.hours) || 0;

      const dInput = block.querySelector(".wait-d");
      const hInput = block.querySelector(".wait-h");

      if (dInput) {
        dInput.value = days;
        dInput.dispatchEvent(new Event("input"));
      }
      if (hInput) {
        hInput.value = hours;
        hInput.dispatchEvent(new Event("input"));
      }

      canvas.appendChild(block);
    }
  }

  // 6. Save New Tags (if any generated)
  if (tagsModified) {
    await chrome.storage.local.set({ tags: currentTags });
    // Update global variable for UI sync
    tags = currentTags;
    // If we are on a list view, we might want to refresh, but we are entering builder mode here.
  }

  // 7. Add Final Loop/Stop
  if (autoLoop) {
    const loopBlock = createBlockElement("loop");
    setupBuilderBlockEvents(loopBlock);
    const loopType = loopBlock.querySelector(".loop-type-select");
    if (loopType) {
      loopType.value = "forever";
      loopType.dispatchEvent(new Event("change"));
    }
    canvas.appendChild(loopBlock);
  } else {
    const stopBlock = createBlockElement("stop");
    setupBuilderBlockEvents(stopBlock);
    canvas.appendChild(stopBlock);
  }

  // 8. Finalize UI
  updateCampaignSteps();

  showCustomModal(
    I18n.t("wizSuccessTitle"),
    I18n.t("wizSuccessMsg", [String(strategy.steps.length)]),
    "success",
  );
}
async function updateChecklistProgress() {
  const checklist = document.getElementById("onboardingChecklist");
  if (!checklist) return;
  checklist.classList.remove("d-none");

  const { tags, groups, postingHistory, licenseVerified } =
    await chrome.storage.local.get([
      "tags",
      "groups",
      "postingHistory",
      "licenseVerified",
    ]);
  const safeTags = tags || [];
  const safeGroups = groups || [];

  // 1. Check Import Groups
  const hasScrapedGroups = safeGroups.some((g) => {
    const title = (g.title || "").toLowerCase();
    return title.includes("scraped groups") || title.includes("my groups");
  });

  // 2. Check Create Template
  const hasUserTemplate =
    safeTags.length > 1 ||
    (safeTags.length === 1 && !safeTags[0].title.includes("Welcome"));

  // 3. Check Add Variations
  const hasVariations = safeTags.some((t) => {
    const text = t.text || "";
    if (t.title.includes("Welcome")) return false;
    return text.includes("{") && text.includes("|") && text.includes("}");
  });

  // 4. Check Send Post
  const hasPosted = postingHistory && postingHistory.length > 0;

  const steps = [
    { id: "step-extract", done: hasScrapedGroups },
    { id: "step-template", done: hasUserTemplate },
    { id: "step-variations", done: hasVariations },
    { id: "step-post", done: hasPosted },
  ];

  let completedCount = 0;

  steps.forEach((step) => {
    const el = document.getElementById(step.id);
    if (el) {
      if (step.done) {
        el.classList.add("completed");
        const checkCircle = el.querySelector(".check-circle");
        if (checkCircle) checkCircle.innerHTML = '<i class="fa fa-check"></i>';
        completedCount++;
      } else {
        el.classList.remove("completed");
        const checkCircle = el.querySelector(".check-circle");
        if (checkCircle) checkCircle.innerHTML = "";
      }
    }
  });

  // Update Progress Ring
  const percent = steps.length
    ? Math.round((completedCount / steps.length) * 100)
    : 0;
  const ring = document.getElementById("checklistRing");
  const text = document.getElementById("checklistPercent");

  if (ring) ring.style.setProperty("--percent", `${percent}%`);
  if (text) text.textContent = `${percent}%`;

  // Auto-collapse if 100%
  if (percent === 100) {
    const header = document.getElementById("checklistHeader");
    if (header && !header.dataset.autoCollapsed) {
      document.getElementById("checklistBody").classList.remove("open");
      header.dataset.autoCollapsed = "true";

      // Optional: Visual celebration logic could go here
    }
  }
}

async function checkAndResetDailyLimit() {
  const data = await chrome.storage.local.get([
    "freePostsRemaining",
    "lastDailyReset",
    "dailyPostCount",
  ]);

  // FIX: Use ISO format (YYYY-MM-DD) which is the same in every language/timezone
  const today = new Date().toISOString().split("T")[0];

  // If it's a new day, OR if the stored date format is old/different (migration fix)
  if (data.lastDailyReset !== today) {
    console.log(`New day detected (${today}). Resetting free posts.`);
    await chrome.storage.local.set({
      freePostsRemaining: 3,
      dailyPostCount: 0,
      lastDailyReset: today,
    });
    return { count: 0, remaining: 3 };
  }

  // Return current remaining, default to 3 if undefined
  return {
    count: data.dailyPostCount || 0,
    remaining:
      data.freePostsRemaining !== undefined ? data.freePostsRemaining : 3,
  };
}

// in popup.js

// in popup.js
// ACTION: Replace the updateTierHeaderUI function.

function updateTierHeaderUI(isPro, postsRemaining) {
  const freeBadge = document.getElementById("freeTierBadge");
  const proBadge = document.getElementById("proTierBadge");
  const upgradeBtn = document.getElementById("headerUpgradeBtn");
  const activateBtn = document.getElementById("headerActivateBtn");

  // Licensing disabled: hide all tier UI and keep features unlocked
  updateFeatureLocks(true);

  if (freeBadge) freeBadge.style.display = "none";
  if (proBadge) proBadge.style.display = "none";
  if (upgradeBtn) upgradeBtn.style.display = "none";
  if (activateBtn) activateBtn.style.display = "none";

  enableStartPostingIfReady();
}

function openPricingModal() {
  return;
}

function closePricingModal() {
  return;
}
