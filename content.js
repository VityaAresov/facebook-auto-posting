if (window.autoPosterInjected) {
  // The first script already ran and set this flag to true.
  // This second script execution STOPS right here. It never tries to
  // re-declare `isIframeSrcAdded`, thus avoiding the error entirely.
  // The original script, with its original `onMessage` listener, is still
  // alive and waiting for messages.
} else {
  window.autoPosterInjected = true;

  // Create an iframe and add it to the document
  let isIframeSrcAdded = false;
  let isIframeInitialized = false; // New flag to track if iframe has been fully initialized
  var iframe = document.createElement("iframe");
  iframe.classList.add("AutoPoster");
  var defaultWidth = "480px";
  var defaultHeight = "665px";
  var scaleFactor = 1; // Keep scale factor as 1 for easier calculations

  // Styling the iframe
  var iframeStyle = iframe.style;
  iframeStyle.maxHeight = "99vh";
  iframeStyle.background = "none";
  iframeStyle.height = defaultHeight;
  iframeStyle.width = defaultWidth;
  iframeStyle.position = "fixed";
  iframeStyle.top = "5%";
  iframeStyle.right = `-${normalize(
    parseFloat(iframeStyle.width) * scaleFactor,
  )}px`;
  iframeStyle.zIndex = "9000000000000000000";
  iframeStyle.boxShadow =
    "rgba(14, 30, 37, 0.12) 0px 2px 4px 0px, rgba(14, 30, 37, 0.32) 0px 2px 16px 0px";
  iframeStyle.border = "none";
  iframeStyle.borderRadius = "14px";
  iframeStyle.transform = `scale(${scaleFactor})`;
  iframeStyle.transformOrigin = "top right";

  // Only append iframe and create resizers when first toggled, not on page load
  function initializeIframe() {
    if (isIframeInitialized) return;

    // Adjust iframe dimensions based on saved settings
    chrome.storage.local.get(
      ["iframeWidth", "iframeHeight"],
      function (result) {
        iframeStyle.width = result.iframeWidth || defaultWidth;
        iframeStyle.height = result.iframeHeight || defaultHeight;
        iframeStyle.right = `-${normalize(
          parseFloat(iframeStyle.width) * scaleFactor,
        )}px`;

        // Append iframe to document only at this point
        document.body.appendChild(iframe);

        // Now create and add resizers
        createResizers();

        isIframeInitialized = true;
        updateResizerPositions();
      },
    );
  }

  // Create horizontal and vertical resizers
  function createResizers() {
    var hResizer = document.createElement("div"); // Resizes iframe horizontally
    var vResizer = document.createElement("div"); // Resizes iframe vertically

    // Common resizer styling
    hResizer.style.position = "fixed";
    hResizer.style.background = "rgb(255 255 255 / 0%)";
    hResizer.style.cursor = "ew-resize";
    hResizer.style.zIndex = "9000000000000000001";
    hResizer.style.display = "none";

    vResizer.style.position = "fixed";
    vResizer.style.background = "gb(255 255 255 / 0%)";
    vResizer.style.cursor = "ns-resize";
    vResizer.style.zIndex = "9000000000000000001";
    vResizer.style.display = "none";

    document.body.appendChild(hResizer);
    document.body.appendChild(vResizer);

    // Overlay for capturing mouse events over iframe
    var mouseCapture = document.createElement("div");
    mouseCapture.style.position = "fixed";
    mouseCapture.style.top = "0";
    mouseCapture.style.left = "0";
    mouseCapture.style.width = "100%";
    mouseCapture.style.height = "100%";
    mouseCapture.style.zIndex = "9000000000000000000";
    mouseCapture.style.display = "none";

    document.body.appendChild(mouseCapture);

    let startX, startY, startWidth, startHeight;

    // Mouse event functions
    function startResize(e, isHorizontal) {
      e.preventDefault();
      startX = e.clientX;
      startY = e.clientY;
      startWidth = parseFloat(window.getComputedStyle(iframe).width);
      startHeight = parseFloat(window.getComputedStyle(iframe).height);
      mouseCapture.style.display = "block";

      window.addEventListener(
        "mousemove",
        isHorizontal ? resizeWidth : resizeHeight,
      );
      window.addEventListener("mouseup", stopResize, { once: true });
    }

    function resizeWidth(e) {
      var currentX = e.clientX;
      var diffX = currentX - startX;
      var newWidth = Math.min(
        window.innerWidth,
        Math.max(300, startWidth - diffX),
      );
      iframeStyle.width = `${newWidth}px`;
      updateResizerPositions();
    }

    function resizeHeight(e) {
      var currentY = e.clientY;
      var diffY = startY - currentY;
      var newHeight = Math.min(
        window.innerHeight * 0.9,
        Math.max(200, startHeight - diffY),
      );
      iframeStyle.height = `${newHeight}px`;
      updateResizerPositions();
    }

    function stopResize() {
      window.removeEventListener("mousemove", resizeWidth);
      window.removeEventListener("mousemove", resizeHeight);
      mouseCapture.style.display = "none";

      chrome.storage.local.set({
        iframeWidth: iframeStyle.width,
        iframeHeight: iframeStyle.height,
      });
    }

    hResizer.addEventListener("mousedown", function (e) {
      startResize(e, true);
    });
    vResizer.addEventListener("mousedown", function (e) {
      startResize(e, false);
    });
  }

  // Function to update resizer positions
  function updateResizerPositions() {
    if (!isIframeInitialized) return;

    let iframeW = parseFloat(iframeStyle.width) * scaleFactor;
    let iframeH = parseFloat(iframeStyle.height) * scaleFactor;
    let iframeRight = parseFloat(iframeStyle.right);

    // Get computed top in pixels
    let computedTop = parseFloat(window.getComputedStyle(iframe).top);

    // Calculate the left position of the iframe
    let iframeLeft = window.innerWidth - (iframeW + iframeRight);

    // Get resizers
    const hResizer = document.querySelector('div[style*="cursor: ew-resize"]');
    const vResizer = document.querySelector('div[style*="cursor: ns-resize"]');

    if (!hResizer || !vResizer) return;

    // Update vertical resizer (bottom of the iframe)
    vResizer.style.width = iframeW + "px"; // Matches iframe width
    vResizer.style.height = "7px";
    vResizer.style.left = iframeLeft + "px";
    vResizer.style.top = computedTop + iframeH - 7 + "px";

    // Update horizontal resizer (left side of the iframe)
    hResizer.style.height = iframeH + "px"; // Matches iframe height
    hResizer.style.width = "7px";
    hResizer.style.left = iframeLeft - 7 + "px";
    hResizer.style.top = computedTop + "px";
  }

  // Function to normalize floating-point values
  function normalize(value, decimals = 2) {
    return parseFloat(parseFloat(value).toFixed(decimals));
  }

  // Toggle function for iframe visibility
  function toggle(sendMessage, data) {
    // Initialize iframe elements if not already done
    if (!isIframeInitialized) {
      initializeIframe();

      // Need to wait a moment for iframe to be properly initialized
      setTimeout(() => {
        showIframe(sendMessage, data);
      }, 50);
      return;
    }

    // If already initialized, toggle visibility immediately
    if (
      iframeStyle.right ===
      `-${normalize(parseFloat(iframeStyle.width) * scaleFactor)}px`
    ) {
      showIframe(sendMessage, data);
    } else {
      hideIframe();
    }
  }

  // Function to show the iframe
  function showIframe(sendMessage, data) {
    iframeStyle.transition = "right 0.5s ease-in-out, top 0.5s ease-in-out";
    iframeStyle.right = "13px";
    const hResizer = document.querySelector('div[style*="cursor: ew-resize"]');
    const vResizer = document.querySelector('div[style*="cursor: ns-resize"]');
    if (hResizer) hResizer.style.display = "block";
    if (vResizer) vResizer.style.display = "block";
    updateResizerPositions();
    if (sendMessage) {
      setTimeout(() => {
        chrome.runtime.sendMessage(data);
      }, 100);
    }
  }

  // Function to hide the iframe
  function hideIframe() {
    iframeStyle.right = `-${normalize(
      parseFloat(iframeStyle.width) * scaleFactor,
    )}px`;
    const hResizer = document.querySelector('div[style*="cursor: ew-resize"]');
    const vResizer = document.querySelector('div[style*="cursor: ns-resize"]');
    if (hResizer) hResizer.style.display = "none";
    if (vResizer) vResizer.style.display = "none";
    updateResizerPositions();
  }

  // Handle opening messages
  chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    // Note: Removed 'async' from this specific function signature to handle sync responses correctly
    // for the toggle, while keeping the async return 'true' at the end for other actions.

    if (msg === "OpenAutoPoster") {
      console.log("Toggle iframe visibility");

      // Always ensure iframe has src before toggling
      if (!isIframeSrcAdded) {
        isIframeSrcAdded = true;
        iframe.src = chrome.runtime.getURL("popup.html");
      }

      // If iframe hidden and we need to show it, give a moment for src to load
      if (
        !isIframeInitialized ||
        iframeStyle.right ===
          `-${normalize(parseFloat(iframeStyle.width) * scaleFactor)}px`
      ) {
        toggle();
      } else {
        // Already showing, so just hide it
        toggle();
      }

      // *** THE FIX: Acknowledge the message immediately ***
      sendResponse({ success: true, status: "toggled" });
      return false; // No async work needed for this specific message
    }

    if (msg.action === "ping") {
      // If we receive a ping, it means the background script is checking if we're alive.
      sendResponse({ status: "ready" });
      return false;
    }
  });

  // Don't initialize on page load - we'll wait for the toggle call
  console.log("AutoPoster content script loaded - waiting for user action");

  let imagesButton;
  let shouldContinueScrolling = false;
  // content.js

  chrome.runtime.onMessage.addListener(
    async function (message, sender, sendResponse) {
      if (message?.action === "contentPostPost") {
        const { postKey, requestId } = message;
        const runPostingLogic = async () => {
          const telemetry = { ui_snapshots: [], errors: [] };
          let keepAlivePort = null;
          await I18n.init();
          try {
            keepAlivePort = chrome.runtime.connect({
              name: "posting-keep-alive",
            });
          } catch (e) {}

          try {
            await sleep(1);
            showOverlay();
            writeInfo(I18n.t("overlayPreText"));

            // 1. Dead Page Check
            const pageStatus = checkPageStatus();
            if (pageStatus.status === "broken")
              throw new Error(pageStatus.reason);

            // 2. Load Data
            const result = await new Promise((r) =>
              chrome.storage.local.get(postKey, r),
            );
            const post = result[postKey];
            if (!post) throw new Error("Post data not found.");

            writeInfo(I18n.t("overlayPostData"));
            const securityLevel = post.securityLevel || "2";
            const spuntext = spinText(post.text);
            const firstCommentTextSpunText = spinText(post.firstCommentText);

            await dismissCommonOverlays();
            const tabSwitched = await switchToDiscussionTabIfNeeded();
            if (tabSwitched) {
              await sleep(2.5);
            }
            await performScrollNudge(securityLevel);

            const normalizeUiText = (s) =>
              String(s || "")
                .toLowerCase()
                .replace(/\s+/g, " ")
                .trim();

            const getVisibleElementText = (el) => {
              if (!el) return "";
              try {
                if (!isElementVisible(el)) return "";
              } catch (e) {
                // If visibility helper isn't ready for some reason, fall back to best-effort text extraction.
              }
              return normalizeUiText(
                el.getAttribute("aria-label") ||
                  el.innerText ||
                  el.textContent ||
                  "",
              );
            };

            const detectJoinGroupRequired = () => {
              // If user isn't a member, FB usually shows a visible "Join group" button and posting can't proceed.
              try {
                if (!String(location.href || "").includes("/groups/")) return null;
                const joinPatterns = [
                  "join group",
                  "request to join",
                  "request membership",
                  "вступить",
                  "запрос на вступление",
                  "подать заявку",
                ];
                const candidates = Array.from(
                  document.querySelectorAll(
                    'button, a[role="button"], div[role="button"]',
                  ),
                );
                const joinBtn = candidates.find((b) => {
                  const txt = getVisibleElementText(b);
                  if (!txt) return false;
                  return joinPatterns.some((p) => txt.includes(p));
                });
                if (joinBtn) {
                  return "Cannot post: Join group required (you are not a member).";
                }
              } catch (e) {}
              return null;
            };

            // --- 3. OPEN MODAL ---
            let modalIsOpen = false;
            let openAttempts = 0;

            while (!modalIsOpen && openAttempts < 3) {
              openAttempts++;
              console.log(`[Posting] Opening Modal - Attempt ${openAttempts}`);

              let modalButton = await findWithSmartCache(
                "learned_open_modal_btn",
                findRobustPostModalButton,
                "The button to create a new post.",
              );

              if (modalButton) {
                await simulateDeepClick(modalButton);
                writeInfo(I18n.t("overlayOpenModal"));

                 let checkCount = 0;
                 // Give FB time to hydrate the modal. Also require a real editor inside the dialog,
                 // not just any random dialog (cookie prompts, upsells, etc.).
                 while (checkCount < 12) {
                   await sleep(1);
                   const dialog = document.querySelector('div[role="dialog"]');
                   const editorInDialog = document.querySelector(
                     'div[role="dialog"] [contenteditable="true"]',
                   );
                   if (dialog && editorInDialog) {
                     modalIsOpen = true;
                     break;
                   }
                   checkCount++;
                 }
               }
             }

            if (!modalIsOpen) {
              telemetry.ui_snapshots.push(
                await captureUiSnapshot("modal_open_fail"),
              );
              const joinReason = detectJoinGroupRequired();
              throw new Error(
                joinReason || "Failed to open 'Create Post' dialog.",
              );
            }

            await humanizedDelay(securityLevel, "pre_text");

            if (post.postAnonymously) {
              writeInfo("Switching to Anonymous mode...");
              await toggleAnonymousPost();
              await sleep(1);
            }
            if (post.images?.length) {
              writeInfo(I18n.t("overlayInsertImg"));
              for (const mediaItem of post.images) {
                await insertMediaToPost(mediaItem, "post");
                await humanizedDelay(securityLevel, "between_media");
              }
            }

            // 4. Insert Text
            writeInfo(I18n.t("overlayInsertText"));
            try {
              await insertTextIntoInput(spuntext);
            } catch (textErr) {
              console.warn(
                "Standard text insert failed. Using Smart Finder...",
              );
              const editorEl = await findWithSmartCache(
                "learned_editor_box",
                findMainPostComposer,
                "The main large text input area.",
              );
              if (editorEl) {
                editorEl.focus();
                document.execCommand("insertText", false, spuntext);
              } else {
                throw textErr;
              }
            }
            await sleep(1);

            if (
              spuntext.length <= 130 &&
              (!post.images || post.images.length === 0) &&
              post.color &&
              post.color !== "#18191A"
            ) {
              writeInfo(I18n.t("overlaySetColor"));
              await setBackground(post.color);
            }

            await humanizedDelay(securityLevel, "pre_submit");

            const mediaItems = Array.isArray(post.images) ? post.images : [];
            const hasAttachedMedia = mediaItems.length > 0;
            const hasAttachedVideo = mediaItems.some((m) => {
              const t = (m && m.type ? String(m.type) : "").toLowerCase();
              if (t === "video" || t === "stored_video") return true;
              const mime = (m && m.mimeType ? String(m.mimeType) : "").toLowerCase();
              return mime.startsWith("video/");
            });

            // --- 5. SUBMIT BUTTON RETRY LOOP ---
            writeInfo(I18n.t("overlayFinalize"));

            let postButton = null;
            let submitAttempts = 0;
            // Media (especially video) can take a long time before Facebook enables the Post button.
            // IMPORTANT: Never click a disabled Post button; it often results in a "no-op" then a verify timeout.
            const SUBMIT_ENABLE_TIMEOUT_MS = hasAttachedMedia
              ? 8 * 60 * 1000
              : 25 * 1000;
            const submitStartTime = Date.now();
            const submitDeadline = submitStartTime + SUBMIT_ENABLE_TIMEOUT_MS;
            let didClickPost = false;
            let hasShownUploadingHint = false;

            while (Date.now() < submitDeadline) {
              submitAttempts++;
              console.log(
                `[Posting] Finding Submit Button - Attempt ${submitAttempts}`,
              );

              // Use the V3 finder
              postButton = await findUniversalSubmitButton();

              if (postButton) {
                const isDisabled =
                  postButton.getAttribute("aria-disabled") === "true";

                if (isDisabled) {
                  // If we have media, FB commonly keeps the button disabled while it hydrates/preps the upload.
                  // Show the uploading overlay and wait.
                  if (hasAttachedMedia) {
                    if (
                      !hasShownUploadingHint &&
                      Date.now() - submitStartTime > 5000
                    ) {
                      writeInfo(I18n.t("overlayUploading"));
                      hasShownUploadingHint = true;
                    }
                    await sleep(2);
                  } else {
                    console.log(
                      "Submit button found but DISABLED. Nudging composer...",
                    );
                    // If disabled, try nudging the text box to wake it up
                    await nudgePostComposer();
                    await sleep(1.5);
                  }
                  continue;
                } else {
                  console.log("Submit button found and ENABLED. Clicking...");
                  await simulateDeepClick(postButton);
                  didClickPost = true;
                  await sleep(2);
                  break;
                }
              } else {
                console.log("Submit button NOT found yet. Waiting...");
                await sleep(1);
              }
            }

            if (!didClickPost) {
              // Capture snapshot before dying (often shows the real reason: disabled button, upload not ready, etc.)
              telemetry.ui_snapshots.push(
                await captureUiSnapshot("submit_button_timeout_or_disabled"),
              );
              throw new Error(
                hasAttachedMedia
                  ? "Timed out waiting for the 'Post' button to become clickable. Media may still be uploading or Facebook kept the composer locked."
                  : "Timed out waiting for the 'Post' button to become clickable.",
              );
            }

            await handleOptionalNotNowButton();

            // Verification Loop
            writeInfo(I18n.t("overlayVerify"));
            const startTime = Date.now();
            const UPLOAD_MONITORING_TIMEOUT_MS = 8 * 60 * 1000;
            // For media posts, Facebook can keep the composer open for minutes (video processing/upload).
            const GENERAL_VERIFICATION_TIMEOUT_MS = hasAttachedMedia
              ? UPLOAD_MONITORING_TIMEOUT_MS + 60 * 1000
              : 50 * 1000;
            let hasActivatedTab = false;
            let hasAttemptedResubmit = false;

            const findPostComposerDialog = () => {
              // Fast path (legacy, English UI)
              const strict = document.querySelector(
                'div[role="dialog"][aria-label="Create post"]',
              );
              if (strict) return strict;

              // Fallback: last visible dialog containing a "real" composer textbox.
              const dialogs = Array.from(
                document.querySelectorAll('div[role="dialog"]'),
              ).filter((d) => isElementVisible(d));
              for (let i = dialogs.length - 1; i >= 0; i--) {
                const d = dialogs[i];
                if (
                  d.querySelector(
                    'div[contenteditable="true"][data-lexical-editor="true"], div[contenteditable="true"][role="textbox"]',
                  )
                ) {
                  return d;
                }
              }
              return null;
            };

            const findUploadIndicator = (dialogEl) => {
              if (!dialogEl) return null;

              // Known FB labels (English) + common fallbacks (progressbar/aria-busy)
              const direct = dialogEl.querySelector(
                '[aria-label="Loading..."], [aria-label="Posting..."], [aria-label="Uploading..."]',
              );
              if (direct) return direct;

              const progress = dialogEl.querySelector('[role="progressbar"]');
              if (progress) return progress;

              const busy = dialogEl.querySelector('[aria-busy="true"]');
              if (busy) return busy;

              // Last resort: scan aria-label keywords within the dialog.
              const labeled = Array.from(
                dialogEl.querySelectorAll("[aria-label]"),
              ).find((el) => {
                const label = (
                  el.getAttribute("aria-label") || ""
                ).toLowerCase();
                return (
                  label.includes("upload") ||
                  label.includes("loading") ||
                  label.includes("posting") ||
                  label.includes("processing")
                );
              });
              return labeled || null;
            };

            const pendingPatterns = [
              "pending approval",
              "pending review",
              "pending admin approval",
              "awaiting approval",
              "awaiting admin approval",
              "will be reviewed",
              "admins will review",
              "sent for approval",
              "sent to admins",
              "submitted for review",
              "will appear after approval",
              "will appear once approved",
              "after it is approved",
              "after it's approved",
              "ожидает проверки",
              "ожидает одобрения",
              "ожидает одобрения администратора",
              "ожидает одобрения администраторов",
              "на проверке",
              "на рассмотрении",
              "отправлен на проверку",
              "отправлен на рассмотрение",
              "пост отправлен на рассмотрение",
              "публикация отправлена на рассмотрение",
              "будет проверен",
              "будет опубликован после одобрения",
              "будет опубликована после одобрения",
              "будет опубликован после проверки",
              "будет опубликована после проверки",
            ];
            const successPatterns = [
              "your post is now",
              "your post is now live",
              "your post is now published",
              "post is now",
              "successfully posted",
              "post shared",
              "your post was shared",
              "your post has been posted",
              "published",
              "posted",
              "shared in",
              "posted in",
              "опубликован",
              "опубликовано",
              "успешно опубликован",
              "успешно опубликовано",
              "размещен",
              "размещено",
              "ваш пост опубликован",
              "ваша публикация опубликована",
            ];
            const blockedPatterns = [
              "join group",
              "request to join",
              "you must join",
              "must join",
              "only members can post",
              "you can't post",
              "you cannot post",
              "can't post to this group",
              "can't post in this group",
              "cannot post to this group",
              "don't have permission to post",
              "do not have permission to post",
              "not allowed to post",
              "posting is turned off",
              "posting has been turned off",
              "only admins can post",
              "only administrators can post",
              "only moderators can post",
              "temporarily blocked from posting",
              "temporarily restricted",
              "account restricted",
              "вступите",
              "вступить",
              "запрос на вступление",
              "только участники могут публиковать",
              "только администраторы могут публиковать",
              "публикации отключены",
              "публикации в этой группе отключены",
              "вы не можете публиковать",
              "нельзя публиковать",
              "у вас нет разрешения",
              "у вас нет прав",
              "вам запрещено публиковать",
              "вы временно не можете публиковать",
              "ваш аккаунт ограничен",
              "вы заблокированы",
            ];
            const errorPatterns = [
              "couldn't be posted",
              "could not be posted",
              "failed to post",
              "something went wrong",
              "please try again",
              "try again later",
              "an error occurred",
              "error",
              "не удалось опубликовать",
              "не удалось разместить",
              "ошибка",
              "попробуйте еще раз",
              "попробуйте позже",
            ];

            const normalizeOutcomeText = (s) =>
              String(s || "")
                .toLowerCase()
                .replace(/\s+/g, " ")
                .trim();

            const textSnippet = (s, maxLen = 160) => {
              const t = normalizeOutcomeText(s);
              if (!t) return "";
              return t.length > maxLen ? `${t.substring(0, maxLen)}...` : t;
            };

            const clickDoneLikeButtonIfPresent = (dialogEl) => {
              if (!dialogEl) return;
              const doneTexts = [
                "done",
                "ok",
                "okay",
                "got it",
                "close",
                "готово",
                "ок",
                "понятно",
                "закрыть",
              ];
              const buttons = Array.from(
                dialogEl.querySelectorAll("button, [role=\"button\"]"),
              );
              const doneBtn = buttons.find((b) => {
                const label = normalizeOutcomeText(
                  b.getAttribute("aria-label") || b.innerText || "",
                );
                return doneTexts.includes(label);
              });
              if (doneBtn) doneBtn.click();
            };

            const scanForOutcome = (dialogEl = null) => {
              // A very common root cause for "modal open fail" or "verify timeout" is not being a group member.
              const joinReason = detectJoinGroupRequired();
              if (joinReason) return { kind: "blocked", message: joinReason };

              const candidates = [];
              if (dialogEl) candidates.push(dialogEl);

              const addVisibleMatches = (selector) => {
                try {
                  const els = Array.from(document.querySelectorAll(selector));
                  for (const el of els) {
                    if (el && isElementVisible(el)) candidates.push(el);
                  }
                } catch (e) {}
              };

              addVisibleMatches('div[role="dialog"]');
              addVisibleMatches('[role="alert"]');
              addVisibleMatches('[role="status"]');
              addVisibleMatches('[aria-live="polite"]');
              addVisibleMatches('[aria-live="assertive"]');

              const seen = new Set();
              for (const el of candidates) {
                if (!el || seen.has(el)) continue;
                seen.add(el);

                const txt = normalizeOutcomeText(el.innerText || el.textContent || "");
                if (!txt) continue;

                if (blockedPatterns.some((p) => txt.includes(p))) {
                  return {
                    kind: "blocked",
                    message: `Posting restricted/blocked: "${textSnippet(txt)}"`,
                  };
                }
                if (pendingPatterns.some((p) => txt.includes(p))) {
                  return { kind: "done", status: "pending_approval", dialog: el };
                }
                if (successPatterns.some((p) => txt.includes(p))) {
                  return { kind: "done", status: "successful", dialog: el };
                }
                if (errorPatterns.some((p) => txt.includes(p))) {
                  return {
                    kind: "error",
                    message: `Post failed: "${textSnippet(txt)}"`,
                  };
                }
              }

              return null;
            };

            while (Date.now() - startTime < GENERAL_VERIFICATION_TIMEOUT_MS) {
              sendHeartbeat(requestId);

              // 1. Anti-Stuck
              if (!hasActivatedTab && Date.now() - startTime > 15000) {
                console.log("Requesting focus to prevent throttling.");
                chrome.runtime.sendMessage({ action: "focusTab" });
                hasActivatedTab = true;
              }

              const postComposerDialog = findPostComposerDialog();

              // 1. Detect Success/Pending/Blocked/Error messages (composer dialog, toasts, alerts, etc.)
              const outcome = scanForOutcome(postComposerDialog);
              if (outcome) {
                if (outcome.kind === "done") {
                  // If the message is inside a dialog, try to dismiss it.
                  if (postComposerDialog) clickDoneLikeButtonIfPresent(postComposerDialog);
                  chrome.runtime.sendMessage({
                    action: "popupPostComplete",
                    requestId: requestId,
                    success: true,
                    status: outcome.status || "successful",
                    telemetry,
                  });
                  return;
                }
                // blocked/error
                telemetry.ui_snapshots.push(
                  await captureUiSnapshot(
                    outcome.kind === "blocked"
                      ? "verify_detected_blocked"
                      : "verify_detected_error",
                  ),
                );
                throw new Error(outcome.message || "Posting failed.");
              }

              // 2. Upload Check (only if the composer dialog is still open and media was attached)
              const uploadIndicator = findUploadIndicator(postComposerDialog);
              if (postComposerDialog && hasAttachedMedia && uploadIndicator) {
                console.log("Detected active media upload.");
                writeInfo(I18n.t("overlayUploading"));
                const uploadStartTime = Date.now();
                hasActivatedTab = false;

                while (Date.now() - uploadStartTime < UPLOAD_MONITORING_TIMEOUT_MS) {
                  sendHeartbeat(requestId);

                  const dialogStillOpen = findPostComposerDialog();
                  if (!dialogStillOpen) {
                    // Dialog closed while upload was in progress - assume success
                    await sleep(2);
                    const finalOutcome = scanForOutcome(null);
                    const finalStatus =
                      finalOutcome?.kind === "done"
                        ? finalOutcome.status
                        : "successful";
                    chrome.runtime.sendMessage({
                      action: "popupPostComplete",
                      requestId: requestId,
                      success: true,
                      status: finalStatus,
                      telemetry,
                    });
                    return;
                  }

                  const midOutcome = scanForOutcome(dialogStillOpen);
                  if (midOutcome) {
                    if (midOutcome.kind === "done") {
                      clickDoneLikeButtonIfPresent(dialogStillOpen);
                      chrome.runtime.sendMessage({
                        action: "popupPostComplete",
                        requestId: requestId,
                        success: true,
                        status: midOutcome.status || "successful",
                        telemetry,
                      });
                      return;
                    }
                    telemetry.ui_snapshots.push(
                      await captureUiSnapshot(
                        midOutcome.kind === "blocked"
                          ? "upload_detected_blocked"
                          : "upload_detected_error",
                      ),
                    );
                    throw new Error(midOutcome.message || "Posting failed.");
                  }

                  const stillUploading = findUploadIndicator(dialogStillOpen);
                  if (!stillUploading) {
                    // Upload done (or at least no longer showing progress indicators)
                    await sleep(4);
                    // If a pending/success toast appeared, use it; otherwise assume success.
                    const finalOutcome = scanForOutcome(dialogStillOpen);
                    if (finalOutcome?.kind === "done") {
                      clickDoneLikeButtonIfPresent(dialogStillOpen);
                      chrome.runtime.sendMessage({
                        action: "popupPostComplete",
                        requestId: requestId,
                        success: true,
                        status: finalOutcome.status || "successful",
                        telemetry,
                      });
                      return;
                    }
                    chrome.runtime.sendMessage({
                      action: "popupPostComplete",
                      requestId: requestId,
                      success: true,
                      status: "successful",
                      telemetry,
                    });
                    return;
                  }
                  await sleep(2);
                }
                telemetry.ui_snapshots.push(
                  await captureUiSnapshot("upload_timeout"),
                );
                throw new Error("Media upload timed out.");
              }

              // 2.5 Resubmit fallback: sometimes FB ignores the first click (esp. with heavy media).
              if (
                postComposerDialog &&
                !hasAttemptedResubmit &&
                Date.now() - startTime > 10000
              ) {
                try {
                  const possibleSubmit = await findUniversalSubmitButton();
                  const isDisabled = possibleSubmit?.getAttribute("aria-disabled") === "true";
                  if (possibleSubmit && !isDisabled) {
                    console.log(
                      "Verification: composer still open with enabled submit button. Retrying click once...",
                    );
                    writeInfo(I18n.t("overlayUnresponsive"));
                    await simulateDeepClick(possibleSubmit);
                    await sleep(2);
                    await handleOptionalNotNowButton();
                  }
                } catch (e) {
                  // ignore resubmit failures; verification will continue
                } finally {
                  hasAttemptedResubmit = true;
                }
              }

              // 3. Success Check (Disappearance)
              // If the post composer dialog is gone, we assume success.
              const postComposerDialogCheck = findPostComposerDialog();

              if (!postComposerDialogCheck) {
                // Double check after a second to ensure it wasn't a flicker
                await sleep(1);
                if (!findPostComposerDialog()) {
                  console.log("Success: Composer dialog disappeared.");

                  if (post.commentOption === "disable") await disableComments();
                  else if (post.commentOption === "comment")
                    await addFirstComment(firstCommentTextSpunText);

                  chrome.runtime.sendMessage({
                    action: "popupPostComplete",
                    requestId: requestId,
                    success: true,
                    status: "successful",
                    telemetry,
                  });
                  return;
                }
              }

              // Avoid a tight busy-loop. Also throttles heartbeat spam.
              await sleep(1);
            }
            telemetry.ui_snapshots.push(await captureUiSnapshot("verify_timeout"));
            throw new Error(
              hasAttachedVideo
                ? "Timeout: Could not confirm post status. Video uploads can take several minutes; Facebook may have kept the composer open."
                : "Timeout: Could not confirm post status.",
            );
          } catch (error) {
            console.error(`[Request ID: ${requestId}] Error:`, error);
            chrome.runtime.sendMessage({
              action: "popupPostComplete",
              requestId: requestId,
              success: false,
              error: error.message,
              telemetry: telemetry,
            });
          } finally {
            if (keepAlivePort) keepAlivePort.disconnect();
          }
        };
        runPostingLogic();
        return true;
      }
      // else if (message?.action === "contentPostPostAndroid") {
      //   const { postKey } = message;
      //   console.log(`Retrieving post data with key: ${postKey}`);

      //   // Retrieve post data from chrome.storage.local
      //   chrome.storage.local.get(postKey, async (result) => {
      //     const post = result[postKey];
      //     if (!post) {
      //       console.error(`Post data not found for key: ${postKey}`);
      //       chrome.storage.local.set({ operationDone: "failed" });
      //       return;
      //     }

      //     console.log(`Post data retrieved:`, post);
      //     const spuntext = spinText(post.text || "");

      //     try {
      //       // If you want images or background color, do that before or after `automatePost()`.
      //       // But let's keep it simple: we just call your tested approach.

      //       await automatePost(spuntext, post.images);

      //       // If you want to handle background color or images, you'd do it here or inside automatePost.
      //       // e.g. if (post.images?.length) { ... }
      //       // e.g. if (post.color) { ... }
      //       // For now, the snippet is minimal.
      //       await sleep(10);
      //       window.close();
      //     } catch (error) {
      //       console.error("An error occurred during posting:", error);
      //       chrome.storage.local.set({ operationDone: "failed" });
      //     }
      //   });
      // }
      // else if (message?.action === "contentPostProduct") {
      //   console.log("Attempting to post product...");

      //   try {
      //     const { product } = message;
      //     console.log(`Product data received:`, product);

      //     // Step 1: Wait for and click the "Sell Something" or "Eladó tárgy" button
      //     console.log("Looking for the product modal button...");
      //     const productModalButton = await waitForElement(
      //       'div[aria-label="Sell Something"], div[aria-label="Eladó tárgy"]',
      //       10000 // 10 seconds timeout
      //     );

      //     if (!productModalButton) {
      //       console.error("Product modal button not found.");
      //       chrome.storage.local.set({ operationDone: "failed" });
      //       return;
      //     }

      //     productModalButton.click();
      //     console.log("Product modal button clicked.");
      //     await sleep(10);

      //     // Step 2: Look for "Item for Sale" button with the matching text
      //     console.log("Looking for 'Item for Sale' button...");
      //     const itemForSaleButtons = document.querySelectorAll(
      //       'div[role="button"].x1i10hfl.x1qjc9v5.xjbqb8w.xjqpnuy.xa49m3k.xqeqjp1.x2hbi6w'
      //     );

      //     let itemForSaleButton = null;
      //     for (const button of itemForSaleButtons) {
      //       if (
      //         button.textContent &&
      //         button.textContent.trim().includes("Item for sale")
      //       ) {
      //         itemForSaleButton = button;
      //         break;
      //       }
      //     }

      //     if (itemForSaleButton) {
      //       console.log("'Item for Sale' button found. Clicking...");
      //       itemForSaleButton.click();
      //       await sleep(2);
      //     } else {
      //       console.error("'Item for Sale' button not found. Cannot proceed.");
      //       await sleep(100);
      //       chrome.storage.local.set({ operationDone: "failed" });
      //       return;
      //     }

      //     // Continue with uploading product details, images, and other steps
      //     console.log("Proceeding with product details...");
      //     const { images } = product;
      //     if (images && images.length > 0) {
      //       console.log(`Found ${images.length} images to insert.`);
      //       for (let i = 0; i < images.length; i++) {
      //         console.log(`Inserting image ${i + 1}/${images.length}`);
      //         await insertMediaToPost(images[i], "product");
      //         await sleep(2); // Small pause between uploads
      //       }
      //       console.log("All images inserted successfully.");
      //       await sleep(5); // Wait for images to be processed
      //     } else {
      //       console.log("No images to upload.");
      //     }
      //     await sleep(100);
      //     await setProductDetails(
      //       product.title,
      //       product.price,
      //       product.condition,
      //       product.description,
      //       product.tags,
      //       product.location,
      //       product.meetupPreferences.doorDropoff,
      //       product.meetupPreferences.doorPickup,
      //       product.meetupPreferences.publicMeetup
      //     );
      //     await sleep(100);
      //     console.log("Checking post outcome...");
      //     const postSuccess = await checkPostOutcomeWithTimeout();
      //     if (postSuccess) {
      //       console.log("Product posted successfully!");
      //       chrome.storage.local.set({ operationDone: "successful" });
      //     } else {
      //       await sleep(100);
      //       console.error("Product posting failed.");
      //       chrome.storage.local.set({ operationDone: "failed" });
      //     }
      //   } catch (error) {
      //     await sleep(100);
      //     console.error("An error occurred while posting the product:", error);
      //     chrome.storage.local.set({ operationDone: "failed" });
      //   }
      // }
      else if (message?.action === "startJoiningGroups") {
        const {
          groupSizeFilter,
          saveGroupsAfterJoining,
          saveGroupName,
          joinCounter,
        } = message;

        // 1. Initialize Localization
        await I18n.init();

        // 2. Define State Variables FIRST (Fixes ReferenceError)
        let sessionJoinCounter = 0;
        const joinedGroups = [];
        const processedGroupHrefs = new Set();

        // 3. Define Helper Functions
        function getTieredHumanizedDelay(groupsJoinedSoFar) {
          // Long break every 7 joins
          if (groupsJoinedSoFar > 0 && groupsJoinedSoFar % 7 === 0) {
            console.log(`SESSION BREAK: Taking a long pause.`);
            return Math.random() * 30000 + 40000; // 30-70s
          }
          // First burst (faster)
          if (groupsJoinedSoFar < 7) {
            return Math.random() * 10000 + 1000; // 1-11s
          }
          // Standard delay
          return Math.random() * 20000 + 9000; // 9-29s
        }
        /**
         * Universal Number Parser
         * Handles: 1.2K, 12 E, 1,9 mill., 896.734, 1,9 Mio.
         */
        function parseUniversalCount(str) {
          if (!str) return 0;

          // 1. Normalize: lowercase, remove non-breaking spaces
          let text = str
            .toLowerCase()
            .replace(/\u00A0/g, " ")
            .trim();

          // 2. Regex to capture:
          // Group 1: The number (digits, dots, commas)
          // Group 2: The suffix (letters, optional dot)
          // Example: "1,9 mill." -> captures "1,9" and "mill."
          const match = text.match(/([\d,.]+)\s*([a-z\.]+)?/);

          if (!match) return 0;

          let numStr = match[1];
          // Remove the trailing dot from suffix if present (e.g. "mill." -> "mill")
          let suffix = (match[2] || "").replace(".", "").trim();
          let multiplier = 1;

          // 3. Determine Multiplier based on Language Suffixes
          const thousands = ["k", "e", "mil", "t", "tsd", "ez"]; // EN, HU, ES/PT, DE
          const millions = ["m", "mill", "mio", "mln"]; // EN, ES, DE, IT/PL
          const billions = ["b", "bn", "mrd"]; // EN, DE

          if (thousands.includes(suffix)) {
            multiplier = 1000;
          } else if (millions.includes(suffix)) {
            multiplier = 1000000;
          } else if (billions.includes(suffix)) {
            multiplier = 1000000000;
          }

          // 4. Handle Decimal vs Thousand Separators
          if (multiplier > 1) {
            // CASE A: Abbreviated Number (e.g. "1,5 K" or "1.5 K")
            // In this context, both "," and "." usually mean a decimal point.
            // We normalize everything to a dot for JS.
            numStr = numStr.replace(",", ".");
          } else {
            // CASE B: Raw Integer (e.g. "896.734" or "896,734")
            // If there is no suffix, dots/commas are purely visual separators.
            // We strip EVERYTHING except digits.
            numStr = numStr.replace(/[^0-9]/g, "");
          }

          return Math.round(parseFloat(numStr) * multiplier);
        }
        async function mimicOverscroll() {
          const scrollAmount = Math.random() * 400 + 200;
          window.scrollBy({ top: scrollAmount, behavior: "smooth" });
          await sleep(Math.random() * 1.5 + 1);
          window.scrollBy({ top: -(scrollAmount / 2), behavior: "smooth" });
        }

        function simulateHumanClick(element) {
          if (!element) return;
          element.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
          setTimeout(
            () => {
              element.click();
            },
            Math.random() * 400 + 100,
          );
        }

        async function processPageForJoining() {
          writeInfo(I18n.t("overlayScan"));

          const groupElements = document.querySelectorAll(
            'div[role="article"], div[role="listitem"]',
          );
          let foundNewGroupToProcess = false;

          for (let groupElement of groupElements) {
            if (sessionJoinCounter >= joinCounter) return "session_complete";

            // 1. Get Group URL (Any link to the group works for the ID)
            const anyGroupLink = groupElement.querySelector(
              'a[href*="/groups/"]',
            );
            if (!anyGroupLink) continue;

            let groupHref = anyGroupLink.href;
            const match = groupHref.match(/^(https:\/\/.*\/groups\/[^/]+\/?)/);
            if (match) groupHref = match[1];

            if (processedGroupHrefs.has(groupHref)) continue;

            // 2. INTELLIGENT NAME EXTRACTION (Fix for "Unknown Group")
            let groupName = "Unknown Group";

            // Strategy A: Find the text link (Best quality)
            // We look for a link that has text content and DOES NOT contain an image
            const textLink = Array.from(
              groupElement.querySelectorAll('a[href*="/groups/"]'),
            ).find(
              (a) =>
                a.textContent.trim().length > 0 &&
                !a.querySelector("img") &&
                !a.querySelector("svg"),
            );

            if (textLink) {
              groupName = textLink.textContent.trim();
            }
            // Strategy B: Aria Label from Image Link (Fallback)
            else if (anyGroupLink.hasAttribute("aria-label")) {
              let label = anyGroupLink.getAttribute("aria-label");
              // Cleanup common prefixes/suffixes (English/Hungarian)
              label = label
                .replace(/^Profile photo of\s+/i, "") // EN
                .replace(/\sprofilképe$/i, ""); // HU
              groupName = label.trim();
            }

            // 3. Universal Button Finder
            const buttons = Array.from(
              groupElement.querySelectorAll('[role="button"]'),
            );
            const joinButton = buttons.find((btn) => {
              const text = btn.textContent.trim();
              if (!text) return false;
              if (text === "✕" || text === "X") return false;
              if (btn.getAttribute("aria-pressed") === "true") return false;
              return true;
            });

            if (!joinButton) {
              processedGroupHrefs.add(groupHref);
              continue;
            }

            foundNewGroupToProcess = true;

            // 4. Universal Size Check
            const spans = Array.from(groupElement.querySelectorAll("span"));
            const groupSizeSpan = spans.find((s) => {
              const t = s.textContent;
              return (
                /\d/.test(t) &&
                /([\d,.]+)\s*([kKmMbBtTeE])?[\s\u00A0]/.test(t) &&
                t.length < 50
              );
            });

            const groupSize =
              typeof parseUniversalCount === "function"
                ? parseUniversalCount(groupSizeSpan?.textContent)
                : 0;

            if (groupSize >= groupSizeFilter) {
              await mimicOverscroll();

              const delay = getTieredHumanizedDelay(sessionJoinCounter);
              const delayInSeconds = Math.round(delay / 1000);

              let delayMessage;
              if (delayInSeconds >= 40) {
                delayMessage = I18n.t("overlayLongPause", [
                  String(delayInSeconds),
                ]);
              } else {
                delayMessage = I18n.t("overlayPause", [
                  groupName,
                  String(delayInSeconds),
                ]);
              }
              writeInfo(delayMessage);
              await sleep(delay / 1000);

              // Re-find button after delay
              const freshButtons = Array.from(
                groupElement.querySelectorAll('[role="button"]'),
              );
              const freshJoinButton = freshButtons.find((btn) => {
                if (btn.getAttribute("aria-pressed") === "true") return false;
                return btn.textContent.trim().length > 0;
              });

              if (freshJoinButton) {
                simulateHumanClick(freshJoinButton);
                sessionJoinCounter++;
                console.log(
                  `Joined group: ${groupName} (${groupSize}). Count: ${sessionJoinCounter}`,
                );
                joinedGroups.push([groupName, groupHref]);

                const msg = I18n.t("overlayJoined", [
                  String(sessionJoinCounter),
                  String(joinCounter),
                  groupName,
                ]);
                writeInfo(msg);

                await sleep(3);
              }
            }

            processedGroupHrefs.add(groupHref);
          }
          return foundNewGroupToProcess ? "continue" : "no_new_groups";
        }

        // 5. Start Execution Flow
        showOverlay();
        writeInfo(I18n.t("overlayInit"));

        let scrollAttempts = 0;
        const maxScrollAttempts = 30;
        let consecutiveFailures = 0;

        while (
          scrollAttempts < maxScrollAttempts &&
          sessionJoinCounter < joinCounter
        ) {
          const status = await processPageForJoining();
          if (status === "session_complete") break;

          if (status === "no_new_groups") {
            consecutiveFailures++;
            writeInfo(I18n.t("overlayNoNew", [String(consecutiveFailures)]));
            if (consecutiveFailures >= 5) {
              writeInfo(I18n.t("overlayEnd"));
              await sleep(3);
              break;
            }
          } else {
            consecutiveFailures = 0;
          }

          window.scrollTo({
            top: document.body.scrollHeight,
            behavior: "smooth",
          });
          await sleep(4);
          scrollAttempts++;
        }

        // 6. Finalization
        if (
          saveGroupsAfterJoining &&
          saveGroupName &&
          joinedGroups.length > 0
        ) {
          writeInfo(I18n.t("overlaySaving"));
          const result = await new Promise((resolve) =>
            chrome.storage.local.get({ groups: [] }, resolve),
          );
          const savedGroups = result.groups || [];
          savedGroups.push({ title: saveGroupName, links: joinedGroups });
          await new Promise((resolve) =>
            chrome.storage.local.set({ groups: savedGroups }, resolve),
          );
          writeInfo(
            I18n.t("overlaySaved", [
              String(joinedGroups.length),
              saveGroupName,
            ]),
          );
        }

        const autoCloseMsg = I18n.t("overlayAutoClose");
        let finalMessage;
        if (sessionJoinCounter >= joinCounter) {
          finalMessage = I18n.t("overlaySessionComplete", [
            String(sessionJoinCounter),
          ]);
        } else {
          finalMessage = I18n.t("overlayFinished", [
            String(sessionJoinCounter),
          ]);
        }

        writeInfo(`${finalMessage} ${autoCloseMsg}`);
        await sleep(10);
        chrome.runtime.sendMessage({ action: "closeSelf" });
        window.close();

        return true;
      } else if (message?.action === "startGroupScrape") {
        console.log("Starting group scrape operation...");

        // Remove any existing LinksArray in storage
        chrome.storage.local.remove("LinksArray", () => {
          console.log("Existing LinksArray deleted");
        });
        showOverlay();
        let shouldContinueScrolling = true;

        // Function to simulate scrolling to the bottom until no more new content is loaded
        async function simulateScrollToBottom() {
          console.log("simulateScrollToBottom function called...");
          writeInfo(I18n.t("overlayScrolling"));
          let delayBetweenIterations = 1; // Initial delay between scroll attempts (milliseconds)
          const maxRetries = 10; // Maximum number of retries when no new content is detected
          const maxIdleCount = 5; // Maximum times to stay idle before doubling the delay

          let previousHeight = 0;
          let retries = 0;
          let idleCount = 0;

          while (shouldContinueScrolling) {
            console.log("Scrolling to the bottom of the page...");
            window.scrollTo({
              top: document.body.scrollHeight,
              behavior: "smooth", // Smooth scroll to simulate user behavior
            });

            // Wait for new content to load
            console.log(
              `Waiting for ${delayBetweenIterations} milliseconds for new content to load...`,
            );
            writeInfo(I18n.t("overlayWaitLoad"));
            await sleep(delayBetweenIterations);

            // Check if new content has loaded by comparing the scroll height
            const currentHeight = document.body.scrollHeight;
            console.log(
              `Current Height: ${currentHeight}, Previous Height: ${previousHeight}`,
            );

            if (currentHeight > previousHeight) {
              previousHeight = currentHeight;
              retries = 0; // Reset retries since new content was loaded
              idleCount = 0; // Reset idle count as content is loading
              delayBetweenIterations = 1; // Reset delay to initial value
              console.log("New content detected, scrolling again...");
              writeInfo(I18n.t("overlayNewContent"));
            } else {
              retries++;
              idleCount++;
              console.log(`No new content detected, retry count: ${retries}`);

              // Increase delay if idle count exceeds maxIdleCount
              if (idleCount >= maxIdleCount) {
                delayBetweenIterations = Math.min(
                  delayBetweenIterations * 2,
                  10,
                ); // Double delay, but limit it to 10 seconds
                idleCount = 0; // Reset idle count
                console.log(
                  `Content is loading slowly, increasing delay to ${delayBetweenIterations} ms.`,
                );
                writeInfo(
                  I18n.t("overlaySlowLoad", [String(delayBetweenIterations)]),
                );
              }

              // Stop scrolling if we've retried too many times without new content
              if (retries >= maxRetries) {
                console.log("Maximum retries reached, stopping scrolling.");
                shouldContinueScrolling = false;
              }
            }
          }

          console.log("Scrolling completed.");
          writeInfo(I18n.t("overlayProcessing"));
          // Fetch group links after scrolling
          console.log("Calling fetchGroupContainers to gather the data...");
          await fetchGroupContainers();
        }

        async function fetchGroupContainers() {
          console.log("SCRAPER: Starting Universal Hybrid Extraction...");

          const LinksArray = [];
          const processedUrls = new Set();

          // 1. Get all List Items (Cards)
          // role="listitem" is the universal constant provided by Facebook React
          const groupItems = document.querySelectorAll('div[role="listitem"]');

          console.log(
            `SCRAPER: Found ${groupItems.length} potential group cards.`,
          );

          if (groupItems.length === 0) {
            writeInfo(I18n.t("overlayScrapeNoItems"));
            await sleep(10);
            chrome.runtime.sendMessage({ action: "groupScrapeCompleted" });
            return;
          }

          groupItems.forEach((item, index) => {
            try {
              let bestName = "";
              let bestUrl = "";

              // --- STRATEGY A: Universal Structure (Primary) ---
              const allLinks = item.querySelectorAll('a[href*="/groups/"]');

              for (const link of allLinks) {
                // 1. Cleanup URL
                let rawUrl = link.href;
                const cleanMatch = rawUrl.match(
                  /^(https:\/\/.*\/groups\/[^/]+\/?)/,
                );
                const cleanUrl = cleanMatch ? cleanMatch[1] : rawUrl;

                // 2. Skip Image Wrappers (Cover photos / Profile pics)
                if (link.querySelector("img") || link.querySelector("svg")) {
                  continue;
                }

                // 3. Skip Action Buttons (View Group / Join)
                // Structural check: buttons often have role="button" or nested divs for styling
                if (link.getAttribute("role") === "button") {
                  continue;
                }

                // 4. Extract Text
                let text = (link.innerText || link.textContent).trim();
                // Clean up metadata (e.g. "Last visited...")
                text = text.split("\n")[0].trim();

                // 5. Score it
                // The title is typically the longest meaningful text link
                if (text.length > bestName.length) {
                  bestName = text;
                  bestUrl = cleanUrl;
                }
              }

              // --- STRATEGY B: English Failsafe (1000% Safety) ---
              // If Strategy A failed to find a name, but we are in English, try the specific aria-label.
              if (!bestName) {
                const englishAnchor = item.querySelector(
                  'a[aria-label="View group"]',
                );
                if (englishAnchor) {
                  // If we found the button, we know the URL.
                  // We can try to grab the title from the *other* link in this card.
                  bestUrl = englishAnchor.href;
                  // Try finding any other link that isn't this one
                  const titleLink = Array.from(allLinks).find(
                    (l) => l !== englishAnchor && !l.querySelector("img"),
                  );
                  if (titleLink) {
                    bestName = titleLink.innerText.split("\n")[0].trim();
                  }
                }
              }

              // --- FINAL VALIDATION ---
              if (bestName && bestUrl && !processedUrls.has(bestUrl)) {
                console.log(`SCRAPER: Extracted -> "${bestName}"`);
                LinksArray.push([bestName, bestUrl]);
                processedUrls.add(bestUrl);
              }
            } catch (e) {
              console.warn(`SCRAPER: Error processing item #${index}`, e);
            }
          });

          console.log(`SCRAPER: Total groups extracted: ${LinksArray.length}`);

          if (LinksArray.length === 0) {
            writeInfo(I18n.t("overlayScrapeEmpty"));
            await sleep(10);
            chrome.runtime.sendMessage({ action: "groupScrapeCompleted" });
            return;
          }

          // Save
          chrome.storage.local.get({ groups: [] }, (result) => {
            const savedGroups = result.groups || [];
            const dateStr = new Date().toLocaleDateString();
            const newCollectionTitle = `Scraped Groups (${dateStr})`;

            savedGroups.push({
              title: newCollectionTitle,
              links: LinksArray,
            });

            chrome.storage.local.set({ groups: savedGroups }, async () => {
              const msg = I18n.t("overlayScrapeSuccess", [
                String(LinksArray.length),
                newCollectionTitle,
              ]);
              writeInfo(msg);
              await sleep(10);
              chrome.runtime.sendMessage({ action: "groupScrapeCompleted" });
              await sleep(2);
              window.close();
            });
          });
        }

        // Call the function to simulate scrolling to the bottom
        console.log("Initiating scroll simulation...");
        await simulateScrollToBottom();
      }
      if (message?.action === "showOverlay") {
        // showOverlay();
      }
      if (message?.action === "removeOverlay") {
        removeOverlay();
      }

      return true; // Ensure that sendResponse is asynchronous
    },
  );

  function htmlToPlainText(html) {
    if (typeof html !== "string") return "";
    const tempDiv = document.createElement("div");
    // A simplified conversion for the fallback
    tempDiv.innerHTML = html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n");
    return tempDiv.textContent || tempDiv.innerText || "";
  }

  function smartFind(hint = "post") {
    // 1. Gather all potential interactive candidates
    const candidates = Array.from(
      document.querySelectorAll(
        "div[contenteditable='true'][role='textbox'], textarea, input[type='text'], div[role='button']",
      ),
    ).filter((el) => {
      // Filter out invisible or obviously wrong elements (like search bars, comments)
      if (!el.offsetParent) return false; // Invisible
      const label = (el.getAttribute("aria-label") || "").toLowerCase();
      if (label.includes("search") || label.includes("comment")) return false;
      return true;
    });

    let bestCandidate = null;
    let bestScore = 0;

    for (const el of candidates) {
      const score = computeElementScore(el, hint);
      if (score > bestScore) {
        bestScore = score;
        bestCandidate = el;
      }
    }

    // Threshold: only return if we are reasonably confident (score > 0.5)
    if (bestScore > 0.5) {
      console.log(
        `[SmartFind] Found candidate with score ${bestScore.toFixed(2)}`,
        bestCandidate,
      );
      return bestCandidate;
    }

    return null;
  }

  /**
   * Calculates a likelihood score (0-3) for an element matching the hint.
   */
  function computeElementScore(el, hint) {
    const text = (el.innerText || "").toLowerCase();
    const ariaLabel = (el.getAttribute("aria-label") || "").toLowerCase();
    const placeholder = (el.getAttribute("placeholder") || "").toLowerCase();
    // NEW: Check aria-placeholder (Critical for current FB version)
    const ariaPlaceholder = (
      el.getAttribute("aria-placeholder") || ""
    ).toLowerCase();

    let score = 0;

    // Keyword Matching
    const keywords = [
      hint,
      "what's on your mind",
      "write something",
      "create a public post",
      "írj",
      "bejegyzés", // Localized fallbacks
    ];

    const matchesKeyword = (str) => keywords.some((k) => str.includes(k));

    if (matchesKeyword(text)) score += 1.5; // High weight for visible text
    if (matchesKeyword(ariaLabel)) score += 1.0;
    if (matchesKeyword(placeholder)) score += 1.0;

    // NEW: High weight for aria-placeholder match
    if (matchesKeyword(ariaPlaceholder)) score += 2.0;

    // Structural Bonuses
    if (el.getAttribute("role") === "textbox") score += 0.5;
    if (el.getAttribute("contenteditable") === "true") score += 0.5;

    // Size Heuristic: Main composers are usually larger than comments
    const rect = el.getBoundingClientRect();
    if (rect.height > 40 && rect.width > 200) score += 0.2;

    return score;
  }

  // in content.js
  // ACTION: Replace the findMainPostComposer function with this version.

  async function findMainPostComposer() {
    console.log("Starting Bottom-Up Search for Composer...");

    // Extended retry loop (6 seconds) to allow full modal hydration
    for (let i = 0; i < 30; i++) {
      // 1. Get ALL contenteditable elements currently in the DOM
      const allEditables = Array.from(
        document.querySelectorAll('[contenteditable="true"]'),
      );

      // 2. Filter: Find the "Golden" Editor
      const validEditor = allEditables.find((el) => {
        // A. Must be visible (offsetParent is unreliable for position:fixed)
        const style = window.getComputedStyle(el);
        if (
          style.display === "none" ||
          style.visibility === "hidden" ||
          style.opacity === "0"
        )
          return false;
        const rect = el.getBoundingClientRect();
        if (rect.width < 10 || rect.height < 10) return false;

        // B. Must be inside a Dialog (Crucial Check)
        // We check if it has an ancestor with role="dialog"
        const parentDialog = el.closest('div[role="dialog"]');
        if (!parentDialog) return false;

        // C. Must NOT be a Search or Comment field
        // We check labels on the element itself and its close parents
        const label = (el.getAttribute("aria-label") || "").toLowerCase();
        if (label.includes("search") || label.includes("comment")) return false;

        // D. Technical Attributes (Facebook specific)
        // The main editor usually has role="textbox" and specifically NOT role="combobox" (search)
        const role = (el.getAttribute("role") || "").toLowerCase();
        const isLexical = el.getAttribute("data-lexical-editor") === "true";

        if (isLexical) return true; // High confidence
        if (role === "textbox") return true; // Medium confidence

        // Fallback: large editable area inside dialog
        if (rect.width > 200 && rect.height > 40) return true;

        return false;
      });

      if (validEditor) {
        console.log("Found valid composer inside dialog:", validEditor);
        return validEditor;
      }

      // Wait 200ms before retrying
      await sleep(0.2);
    }

    console.warn(
      "Bottom-Up search failed. No valid editor found inside a dialog.",
    );
    return null;
  }
  // in content.js
  // ACTION: Replace the insertTextIntoInput function.

  async function insertTextIntoInput(html) {
    const inputElement = await findMainPostComposer();

    if (!inputElement) {
      throw new Error(
        "Could not find a valid 'contenteditable' inside a 'role=dialog'.",
      );
    }

    console.log("Composer found. Executing robust insertion...");

    // 1. Focus & Click
    inputElement.scrollIntoView({ behavior: "auto", block: "center" });
    await sleep(0.3);
    inputElement.focus();
    inputElement.click();
    await sleep(0.3);

    // 2. Prepare content
    const plainText = htmlToPlainText(html);
    const safeHtml = html.replace(/<a[^>]*>(.*?)<\/a>/gi, "$1");

    // 3. Clear Placeholder (Select All + Delete)
    document.execCommand("selectAll", false, null);
    document.execCommand("delete", false, null);
    await sleep(0.2);

    // 4. Primary: Clipboard Paste
    let pasteSuccess = false;
    try {
      const dt = new DataTransfer();
      dt.setData("text/html", safeHtml);
      dt.setData("text/plain", plainText);
      const evt = new ClipboardEvent("paste", {
        clipboardData: dt,
        bubbles: true,
        cancelable: true,
        composed: true,
        view: window,
      });
      inputElement.dispatchEvent(evt);
      pasteSuccess = true;
      console.log("Clipboard paste event dispatched.");
    } catch (e) {
      console.warn("Clipboard paste error:", e);
    }

    await sleep(0.5);

    // 5. Fallback: execCommand
    const currentText = inputElement.innerText || "";
    if (currentText.trim().length === 0 && plainText.length > 0) {
      console.warn("Paste failed (empty). Using execCommand fallback.");
      inputElement.focus();
      // Try HTML first, then Text
      if (!document.execCommand("insertHTML", false, safeHtml)) {
        document.execCommand("insertText", false, plainText);
      }
    }

    // 6. THE "NUDGE" - Critical for React/Lexical Editors
    // This simulates typing a space to force the "Post" button to wake up
    await sleep(0.2);

    // A. Dispatch Input Events
    const inputEvent = new Event("input", { bubbles: true, composed: true });
    inputElement.dispatchEvent(inputEvent);

    // B. Dispatch a physical KeyPress (Space)
    const keyObj = {
      key: " ",
      code: "Space",
      keyCode: 32,
      which: 32,
      bubbles: true,
      cancelable: true,
      view: window,
    };
    inputElement.dispatchEvent(new KeyboardEvent("keydown", keyObj));
    inputElement.dispatchEvent(new KeyboardEvent("keypress", keyObj));

    // Insert a real space if the event didn't do it automatically
    // document.execCommand("insertText", false, " ");

    inputElement.dispatchEvent(new KeyboardEvent("keyup", keyObj));

    // C. Wait a tiny bit, then trigger input again
    await sleep(0.1);
    inputElement.dispatchEvent(inputEvent);

    console.log("Text insertion and Nudge sequence completed.");
  }

  // in content.js
  // ACTION: Replace the clickPostButtonWithRetry function.

  function clickPostButtonWithRetry(selector, attempts = 15, delay = 1000) {
    return new Promise((resolve, reject) => {
      let tried = 0;

      const timer = setInterval(async () => {
        console.log(`[Retry Clicker] Attempt ${tried + 1}/${attempts}...`);

        const btn = await findUniversalSubmitButton();

        if (btn) {
          const btnText = btn.innerText.trim();
          const isDisabled =
            btn.getAttribute("aria-disabled") === "true" || btn.disabled;

          console.log(
            `[Retry Clicker] Found Candidate: "${btnText}" (Disabled: ${isDisabled})`,
          );

          // Safety Check: If button text is empty or "X", DO NOT CLICK
          if (btnText.length === 0 || btnText === "X" || btnText === "×") {
            console.warn("Skipping unsafe button (no text/close icon).");
            return;
          }

          if (!isDisabled || tried > attempts - 3) {
            clearInterval(timer);
            if (isDisabled) console.warn("Force-clicking disabled button.");
            else console.log("Button enabled. Clicking.");

            try {
              btn.focus();
              btn.click();
            } catch (e) {
              btn.click();
            }
            resolve(true);
            return;
          } else {
            // Nudge
            const editor = await findMainPostComposer();
            if (editor)
              editor.dispatchEvent(
                new Event("input", { bubbles: true, composed: true }),
              );
          }
        } else {
          console.warn("[Retry Clicker] No candidate buttons found.");
        }

        if (++tried >= attempts) {
          clearInterval(timer);
          reject(new Error("Retry clicker failed."));
        }
      }, delay);
    });
  }

  async function toggleAnonymousPost() {
    console.log("Attempting to toggle Anonymous Post mode (Global Search)...");

    // 1. Find Toggle
    // Use the universal role="switch" selector
    // We search the whole document because the dialog reference might change
    const toggleInput = document.querySelector(
      'div[role="dialog"] input[role="switch"]',
    );

    if (!toggleInput) {
      // Try waiting for it, maybe dialog just opened
      await waitForElement('div[role="dialog"] input[role="switch"]', 3000);
    }

    const validToggle = document.querySelector(
      'div[role="dialog"] input[role="switch"]',
    );
    if (!validToggle) throw new Error("Anonymous toggle not found.");

    // 2. Check Status
    if (
      validToggle.getAttribute("aria-checked") === "true" ||
      validToggle.checked
    ) {
      console.log("Anonymous mode is already active.");
      return;
    }

    // 3. Click Toggle
    console.log("Clicking toggle...");
    validToggle.click();
    await sleep(2.5); // Wait for modal

    // 4. Handle Confirmation / Info Modal (Global Search)

    // STRATEGY A: Explicit Text Match (Fastest)
    const keywords = [
      "Got it",
      "Értem",
      "OK",
      "De acuerdo",
      "Verstanden",
      "Capito",
      "Entendi",
      "Begrepen",
      "Ok",
      "I want to post anonymously",
      "Névtelenül szeretném közzétenni",
    ];

    let clicked = false;

    for (const text of keywords) {
      if (clicked) break;
      // Find ANY element containing the text
      const xpath = `//div[@role='dialog']//div[@role='button']//*[contains(text(), '${text}')]`;
      const result = document.evaluate(
        xpath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null,
      );
      const textNode = result.singleNodeValue;

      if (textNode) {
        const btn = textNode.closest('[role="button"]');
        if (btn && btn.offsetParent) {
          console.log(`Found confirmation button by text: "${text}"`);
          btn.click();
          clicked = true;
          await sleep(2.0);
        }
      }
    }

    // STRATEGY B: Structural Fallback (If text match fails)
    if (!clicked) {
      // Check if we are still blocked (Toggle is gone)
      const isToggleVisible = document.querySelector(
        'div[role="dialog"] input[role="switch"]',
      );

      if (!isToggleVisible) {
        console.log("Toggle disappeared. Searching for structural button...");

        // Get ALL buttons in ALL dialogs
        const allDialogs = Array.from(
          document.querySelectorAll('div[role="dialog"]'),
        );
        // The active one is usually the last one in DOM
        const topDialog = allDialogs[allDialogs.length - 1];

        if (topDialog) {
          const buttons = Array.from(
            topDialog.querySelectorAll('div[role="button"]'),
          );

          // Filter
          const candidates = buttons.filter((btn) => {
            const label = (btn.getAttribute("aria-label") || "").toLowerCase();
            if (label.includes("back") || label.includes("vissza"))
              return false;
            if (label.includes("close") || label.includes("bezárás"))
              return false;
            // Must be visible
            if (!btn.offsetParent) return false;
            return true;
          });

          const lastBtn = candidates[candidates.length - 1];
          if (lastBtn) {
            console.log("Clicking structural button:", lastBtn);
            lastBtn.click();
            await sleep(2.0);
          }
        }
      }
    }

    // 5. Verification
    const finalToggle = document.querySelector(
      'div[role="dialog"] input[role="switch"]',
    );
    const finalState =
      finalToggle &&
      (finalToggle.getAttribute("aria-checked") === "true" ||
        finalToggle.checked);

    if (!finalState) {
      // Debug info
      console.error("Toggle Check Failed.");
      throw new Error("Failed to activate anonymous mode.");
    }

    console.log("Anonymous mode activated successfully.");
  }
  /**
   * UPDATED FUNCTION
   * "Nudges" the post composer to force Facebook's UI to update its state.
   * Now uses the reusable `findMainPostComposer` helper function.
   */
  async function nudgePostComposer() {
    console.log("Nudging post composer to enable Post button...");
    try {
      const editor = await findMainPostComposer(); // <-- THE FIX

      if (editor) {
        editor.focus();
        await sleep(0.1);
        document.execCommand("insertText", false, " ");
        await sleep(0.1);
        document.execCommand("delete");
        editor.dispatchEvent(
          new Event("input", { bubbles: true, composed: true }),
        );
        await sleep(0.1);
        console.log("Nudge complete. Post button should be enabled now.");
        return true;
      }
      console.warn("Could not find editor to nudge.");
      return false;
    } catch (error) {
      console.error("Error during nudgePostComposer:", error);
      // If findMainPostComposer throws, we catch it here.
      return false;
    }
  }
  // in content.js
  // ACTION: Add this new helper function.
  function getCurrentUserName() {
    // Strategy 1: "Comment as [Name]" placeholder
    const commentAs = document.querySelector('div[aria-label^="Comment as"]');
    if (commentAs) {
      const label = commentAs.getAttribute("aria-label");
      return label.replace("Comment as ", "").trim();
    }

    // Strategy 2: Profile Link in the composer area
    // The HTML you provided shows a link to the profile with aria-label="Helena Garcia's timeline"
    const profileLink = document.querySelector('a[aria-label*="timeline"]');
    if (profileLink) {
      const label = profileLink.getAttribute("aria-label");
      return label.replace("'s timeline", "").trim();
    }

    return null;
  }

  function normalizeText(str) {
    if (!str) return "";
    const temp = document.createElement("div");
    temp.innerHTML = str;
    let text = temp.textContent || temp.innerText || "";

    // Remove Emojis: Matches common emoji unicode ranges to prevent mismatch
    // between Input string (with emoji) and Facebook DOM (where emoji is an <img> tag)
    const emojiRegex =
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g;
    text = text.replace(emojiRegex, "");

    // Replace all whitespace (newlines, tabs, nbsp) with a single space
    return text.replace(/\s+/g, " ").trim().toLowerCase();
  }

  function sendHeartbeat(requestId) {
    chrome.runtime.sendMessage({ action: "heartbeat", requestId });
  }

  // in content.js
  // ACTION: Replace performScrollNudge with this enhanced version.

  async function performScrollNudge(securityLevel = "2") {
    console.log(`Performing humanized scroll nudge. Level: ${securityLevel}`);

    const isSafeMode = String(securityLevel) === "3";

    // --- Level 1: Basic Random Scroll Decision ---
    // In Safe Mode, we ALWAYS scroll. In other modes, 80% chance.
    if (!isSafeMode && Math.random() > 0.8) {
      console.log("Humanized Nudge: Decided not to scroll this time.");
      await sleep(0.5);
      return;
    }

    // --- Level 2: Determine Scroll Depth ---
    let minScrollPercent = 0.2;
    let maxScrollPercent = 0.7;

    if (isSafeMode) {
      // Safe Mode: Deeper scroll to simulate reading feed
      minScrollPercent = 0.5;
      maxScrollPercent = 0.9;
    }

    const randomScrollPercent =
      Math.random() * (maxScrollPercent - minScrollPercent) + minScrollPercent;
    const scrollAmount = Math.floor(window.innerHeight * randomScrollPercent);

    console.log(
      `Humanized Nudge: Scrolling down by ${Math.round(
        randomScrollPercent * 100,
      )}%`,
    );

    // Scroll DOWN
    window.scrollBy({ top: scrollAmount, behavior: "smooth" });

    // --- Level 3: Reading Pause ---
    let pauseDuration = Math.random() * 1.5 + 0.5;
    if (isSafeMode) {
      pauseDuration = Math.random() * 3.0 + 2.0; // Wait 2-5 seconds
      // Optional: Add a small micro-scroll during the wait to mimic reading adjustment
      setTimeout(() => window.scrollBy({ top: 50, behavior: "smooth" }), 1000);
    }
    await sleep(pauseDuration);

    // --- Level 4: Scroll Back Up ---
    // In Safe Mode, maybe scroll up just a bit, then pause again before going all the way up
    if (isSafeMode) {
      const partialUp = -(scrollAmount * 0.3); // Scroll up 30%
      window.scrollBy({ top: partialUp, behavior: "smooth" });
      await sleep(1.5);
    }

    // Final return to top area (or original position logic)
    const remainingUp = isSafeMode ? -(scrollAmount * 0.7) : -scrollAmount;
    window.scrollBy({ top: remainingUp, behavior: "smooth" });

    await sleep(isSafeMode ? 1.5 : 0.5);
    console.log("Humanized scroll nudge complete.");
  }
  // in content.js
  // ACTION: Replace the entire existing `captureUiSnapshot` function with this one.

  // --- 1. Dead Page Detector ---
  function checkPageStatus() {
    const text = document.body.textContent || "";

    // Signature of the "Content Unavailable" page provided
    if (
      text.includes("This content isn't available") ||
      text.includes("content isn't available at the moment")
    ) {
      return { status: "broken", reason: "Content Unavailable / Broken Link" };
    }

    if (text.includes("This group is paused")) {
      return { status: "broken", reason: "Group Paused by Admins" };
    }

    if (text.includes("You temporarily can't join and post")) {
      return { status: "broken", reason: "Account Restricted" };
    }

    return { status: "ok" };
  }
  // in content.js
  // in content.js
  // ACTION: Replace the findWithSmartCache function.

  async function findWithSmartCache(cacheKey, primaryFinder, description) {
    // ... (Tier 1 & Tier 2 Standard Checks) ...
    if (primaryFinder) {
      try {
        let el = null;
        if (typeof primaryFinder === "function") el = await primaryFinder();
        else if (typeof primaryFinder === "string")
          el = document.querySelector(primaryFinder);
        if (el && el.offsetParent) return el;
      } catch (e) {}
    }

    try {
      const cacheData = await new Promise((r) =>
        chrome.storage.local.get(cacheKey, r),
      );
      if (cacheData[cacheKey]) {
        const el = document.querySelector(cacheData[cacheKey]);
        if (el && el.offsetParent) return el;
        chrome.storage.local.remove(cacheKey);
      }
    } catch (e) {}

    // --- TIER 3: AI VISUAL ANALYSIS ---
    console.log(`[SmartFind] Tier 3: Asking AI to find: "${description}"`);

    // 1. Determine Scope
    const isOpeningModal =
      description.toLowerCase().includes("create a new post") ||
      description.toLowerCase().includes("write something");

    let scopeElement = null;
    let useRawHtml = false;

    if (isOpeningModal) {
      scopeElement = document.querySelector('[role="main"]') || document.body;
      useRawHtml = false;
    } else {
      // Dialog Scope
      const dialogs = Array.from(
        document.querySelectorAll('div[role="dialog"]'),
      ).filter(
        (d) =>
          d.offsetParent !== null &&
          window.getComputedStyle(d).display !== "none",
      );

      if (dialogs.length > 0) {
        scopeElement = dialogs[dialogs.length - 1];
        useRawHtml = true;
      } else {
        return null;
      }
    }

    // 2. Prepare Snapshot
    let snapshotData = "";

    if (useRawHtml) {
      // --- HTML SANITIZATION (The Fix) ---
      let clone = scopeElement.cloneNode(true);
      // Remove heavy elements
      clone
        .querySelectorAll("svg, path, img, video, style, script, noscript")
        .forEach((el) => el.remove());

      let cleanHtml = clone.outerHTML;
      // Remove huge attributes (base64, long react keys)
      cleanHtml = cleanHtml.replace(
        /\s(style|d|src|data-[a-z0-9-]+)="[^"]*"/gi,
        "",
      );
      cleanHtml = cleanHtml.replace(/<!--[\s\S]*?-->/g, ""); // Comments

      // Hard truncate to ensure message passes
      if (cleanHtml.length > 15000)
        cleanHtml = cleanHtml.substring(0, 15000) + "...";
      snapshotData = cleanHtml;
    } else {
      // List Mode
      const candidates = Array.from(
        scopeElement.querySelectorAll(
          'div[role="button"], div[role="textbox"], span[role="button"]',
        ),
      ).filter(
        (el) =>
          el.offsetParent !== null && el.getBoundingClientRect().height > 5,
      );

      snapshotData = candidates
        .slice(0, 60)
        .map((el, i) => {
          const text = (el.innerText || "")
            .replace(/\s+/g, " ")
            .substring(0, 50);
          const label = el.getAttribute("aria-label") || "";
          const role = el.getAttribute("role") || el.tagName.toLowerCase();
          return `[${i}] <${role} label="${label}">${text}</${role}>`;
        })
        .join("\n");
    }

    // 3. AI Request
    try {
      const response = await chrome.runtime.sendMessage({
        action: "aiSelectorFallback",
        targetDescription: description,
        domSnapshot: snapshotData,
        isRawHtml: useRawHtml,
      });

      if (response && response.success) {
        let bestEl = null;

        if (useRawHtml && response.selector) {
          bestEl = scopeElement.querySelector(response.selector);
        } else if (!useRawHtml && response.index > -1) {
          // Re-query list for index strategy
          const candidates = Array.from(
            scopeElement.querySelectorAll(
              'div[role="button"], div[role="textbox"], span[role="button"]',
            ),
          ).filter(
            (el) =>
              el.offsetParent !== null && el.getBoundingClientRect().height > 5,
          );
          bestEl = candidates[response.index];
        }

        if (bestEl) {
          console.log(`[SmartFind] Tier 3 Success.`);
          const newSelector = generateRobustSelector(bestEl);
          if (newSelector)
            chrome.storage.local.set({ [cacheKey]: newSelector });
          return bestEl;
        }
      }
    } catch (err) {
      console.error("[SmartFind] AI request failed:", err);
    }

    return null;
  }
  // in content.js
  // ACTION: Replace the scrapeCandidates function.

  function scrapeCandidates(root) {
    if (!root) return [];

    // 1. Broad Selection
    const rawList = Array.from(
      root.querySelectorAll(
        'div[role="button"], button, a[role="button"], input[type="submit"], div[contenteditable="true"]',
      ),
    );

    // 2. Filter visible elements
    const visibleList = rawList.filter((el) => {
      // A. Must have layout
      if (!el.offsetParent) return false;

      // B. Size check (Relaxed to 1x1 to catch everything that is technically rendered)
      const rect = el.getBoundingClientRect();
      if (rect.width <= 1 || rect.height <= 1) return false;

      // C. Ignore obvious noise (tooltips, hidden overlays)
      const style = window.getComputedStyle(el);
      if (style.visibility === "hidden" || style.opacity === "0") return false;

      return true;
    });

    console.log(
      `[Scraper] Found ${rawList.length} raw candidates, ${visibleList.length} visible.`,
    );
    return visibleList;
  }

  // in content.js
  // ACTION: Replace the findUniversalSubmitButton function.
  async function findUniversalSubmitButton() {
    console.log(
      "Searching for Universal Submit Button (V3 - Dialog Anchored)...",
    );

    const getActiveDialog = async () => {
      // Prefer the dialog that contains the main composer
      try {
        const composer = await findMainPostComposer();
        const dialog = composer
          ? composer.closest('div[role="dialog"]')
          : null;
        if (dialog) return dialog;
      } catch (e) {
        // ignore
      }

      const dialogs = Array.from(document.querySelectorAll('div[role="dialog"]'));
      const visibleDialogs = dialogs.filter((d) => {
        return (
          d.offsetParent !== null && window.getComputedStyle(d).display !== "none"
        );
      });
      if (visibleDialogs.length === 0) return null;
      return visibleDialogs[visibleDialogs.length - 1];
    };

    const activeDialog = await getActiveDialog();
    if (!activeDialog) {
      console.log("No visible dialogs found for submit search.");
      return null;
    }

    // 1. Priority selectors (localized)
    const prioritySelectors = [
      '[data-testid="react-composer-post-button"]',
      '[data-testid="composer-submit-button"]',
      '[data-testid="post_button"]',
      'div[aria-label="Post"][role="button"]',
      'button[aria-label="Post"]',
      'div[aria-label="Publish"][role="button"]',
      'button[aria-label="Publish"]',
      'div[aria-label="Share"][role="button"]',
      'button[aria-label="Share"]',
      'div[aria-label="Опубликовать"][role="button"]',
      'button[aria-label="Опубликовать"]',
      'div[aria-label="Поделиться"][role="button"]',
      'button[aria-label="Поделиться"]',
      'div[aria-label="Publicar"][role="button"]',
      'button[aria-label="Publicar"]',
      'div[aria-label="Publier"][role="button"]',
      'button[aria-label="Publier"]',
      'div[aria-label="Veröffentlichen"][role="button"]',
      'button[aria-label="Veröffentlichen"]',
      'div[aria-label="Küldés"][role="button"]',
      'div[aria-label="Közzététel"][role="button"]',
      'div[aria-label="发布"][role="button"]',
      'div[aria-label="Send"][role="button"]',
    ];

    for (const sel of prioritySelectors) {
      const candidates = Array.from(activeDialog.querySelectorAll(sel));
      const validBtn = candidates.find((btn) => {
        return (
          btn.offsetParent !== null &&
          btn.getAttribute("aria-disabled") !== "true"
        );
      });
      if (validBtn) {
        console.log(`Found via Priority Selector: ${sel}`);
        return validBtn;
      }
    }

    // 2. Fallback: Scoring System within active dialog
    const candidates = Array.from(
      activeDialog.querySelectorAll('div[role="button"], button'),
    );
    let bestCandidate = null;
    let highestScore = -1;
    const keywords = [
      "post",
      "publish",
      "share",
      "tweet",
      "send",
      "publicar",
      "publier",
      "veröffentlichen",
      "опубликовать",
      "поделиться",
      "küldés",
      "közzététel",
      "发布",
    ];
    for (const btn of candidates) {
      if (!btn.offsetParent) continue;
      const rect = btn.getBoundingClientRect();
      if (rect.width < 10 || rect.height < 10) continue;

      let score = 0;
      const text = (btn.innerText || "").toLowerCase().trim();
      const label = (btn.getAttribute("aria-label") || "").toLowerCase().trim();

      // Negative filters
      if (label.includes("close") || label.includes("cancel") || label === "x")
        continue;
      if (text === "cancel" || text === "x") continue;
      if (label.includes("schedule")) continue;
      if (label.includes("privacy")) continue;

      if (keywords.includes(label)) score += 100;
      if (keywords.includes(text)) score += 100;

      if (keywords.some((k) => label.includes(k))) score += 20;
      if (keywords.some((k) => text.includes(k))) score += 20;

      const style = window.getComputedStyle(btn);
      const bgColor = style.backgroundColor;
      if (bgColor.startsWith("rgb")) {
        const rgb = bgColor.match(/\d+/g);
        if (rgb && rgb.length === 3) {
          const [r, g, b] = rgb.map(Number);
          if (b > r + 20 && b > g + 20) {
            score += 50;
          }
        }
      }

      if (score > highestScore) {
        highestScore = score;
        bestCandidate = btn;
      }
    }

    if (bestCandidate && highestScore >= 20) {
      return bestCandidate;
    }
    return null;
  }
  function generateRobustSelector(el) {
    // Priority 1: Aria Label (Very stable on FB)
    const label = el.getAttribute("aria-label");
    if (label) return `[aria-label="${label}"]`;

    // Priority 2: ID (if looks static)
    if (el.id && !el.id.match(/\d/)) return `#${el.id}`;

    // Priority 3: Role + Text (Pseudo-selector logic we can use with querySelector if text is unique?)
    // Actually, standard CSS doesn't support :contains.
    // Let's fallback to a specific attribute combo if possible.
    if (el.getAttribute("role")) {
      // This is a weak selector, but better than nothing if specific class logic isn't used
      return `[role="${el.getAttribute("role")}"]`;
    }

    return null;
  }

  async function captureUiSnapshot(stepName) {
    console.log(`[Telemetry] Capturing UI snapshot for step: ${stepName}`);
    try {
      // 1. Reliably find the innermost text composer element first.
      const composer = await findMainPostComposer();

      // 2. From that reliable anchor, find its closest ancestor which is the main dialog container.
      const postDialog = composer
        ? composer.closest('div[role="dialog"]')
        : null;

      if (postDialog) {
        return {
          step: stepName,
          timestamp: Date.now(),
          html_snapshot: postDialog.outerHTML,
          result: "captured",
        };
      } else {
        // This case might happen if the composer is found but it's not in a dialog (unlikely).
        return {
          step: stepName,
          timestamp: Date.now(),
          html_snapshot: null,
          result: "dialog_container_not_found",
        };
      }
    } catch (error) {
      // This catch will trigger if findMainPostComposer times out.
      console.error(`[Telemetry] Error capturing UI snapshot:`, error);
      return {
        step: stepName,
        timestamp: Date.now(),
        html_snapshot: `Error: ${error.message}`,
        result: "error_composer_not_found",
      };
    }
  }
  // ======================================================================
  // END: DEFINITIVE STYLE-PRESERVING LOGIC
  // ======================================================================

  async function getFileInput(context, mediaItem = null) {
    const preferVideo =
      !!mediaItem &&
      (String(mediaItem.type || "").toLowerCase() === "video" ||
        String(mediaItem.type || "").toLowerCase() === "stored_video" ||
        String(mediaItem.mimeType || "").toLowerCase().startsWith("video/"));

    const getLastVisibleDialog = () => {
      const dialogs = Array.from(
        document.querySelectorAll('div[role="dialog"]'),
      ).filter(
        (d) =>
          d.offsetParent !== null &&
          window.getComputedStyle(d).display !== "none",
      );
      return dialogs.length ? dialogs[dialogs.length - 1] : null;
    };

    let root = document;
    try {
      const composer = await findMainPostComposer();
      const activeDialog = composer ? composer.closest('div[role="dialog"]') : null;
      root = activeDialog || getLastVisibleDialog() || document;
    } catch (e) {
      root = getLastVisibleDialog() || document;
    }

    const scoreInput = (input) => {
      if (!input) return -9999;
      const accept = String(input.getAttribute("accept") || "").toLowerCase();
      let score = 0;

      if (input.disabled) score -= 1000;
      if (input.multiple) score += 10;

      if (context === "product") {
        if (accept.includes("image")) score += 100;
        if (accept.includes("video")) score -= 50;
      } else {
        // post context
        if (preferVideo && accept.includes("video")) score += 120;
        if (!preferVideo && accept.includes("image")) score += 80;
        if (accept.includes("video")) score += 20;
        if (accept.includes("image")) score += 20;
        // Some FB inputs omit accept; don't discard them entirely.
        if (!accept) score += 5;
      }

      // Prefer inputs inside dialogs/forms (FB usually mounts file inputs there)
      if (input.closest('div[role="dialog"]')) score += 15;

      return score;
    };

    const pickBest = (container) => {
      const inputs = Array.from(container.querySelectorAll('input[type="file"]'));
      if (inputs.length === 0) return null;
      let best = null;
      let bestScore = -9999;
      for (const inp of inputs) {
        const s = scoreInput(inp);
        if (s > bestScore) {
          bestScore = s;
          best = inp;
        }
      }
      return best;
    };

    // 1) Prefer searching inside the active dialog
    const bestInRoot = pickBest(root);
    if (bestInRoot) return bestInRoot;

    // 2) Fallback: search globally
    return pickBest(document);
  }

  // Helper function to convert dataURI to Blob
  function dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(",")[1]);
    const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];

    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ab], { type: mimeString });
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms * 1000));
  }
  function getRandom(min, max) {
    return Math.random() * (max - min) + min;
  }

  async function humanizedDelay(securityLevel, step) {
    let min, max;

    const settings = {
      1: {
        // Fast
        pre_text: [0.5, 1.5],
        between_media: [0.8, 2.0],
        pre_submit: [0.5, 1.5],
      },
      2: {
        // Balanced
        pre_text: [1.0, 3.0],
        between_media: [1.5, 4.0],
        pre_submit: [1.2, 3.5],
      },
      3: {
        // Safe
        pre_text: [2.5, 5.0],
        between_media: [3.0, 7.0],
        pre_submit: [3.0, 6.0],
      },
    };

    const levelSettings = settings[String(securityLevel)] || settings["2"];
    [min, max] = levelSettings[step] || [1.0, 2.0];

    const delayInSeconds = getRandom(min, max);
    console.log(
      `Humanized delay (${step}, level ${securityLevel}): waiting ${delayInSeconds.toFixed(
        2,
      )}s`,
    );

    // LOCALIZE MESSAGE
    const msg = I18n.t("overlayHumanPause", [String(securityLevel)]);
    writeInfo(msg);

    await sleep(delayInSeconds);
  }

  function showOverlay() {
    // Check if the overlay already exists
    let overlayDiv = document.getElementById("postingOverlay");
    if (!overlayDiv) {
      // Create the overlay div
      overlayDiv = document.createElement("div");
      overlayDiv.id = "postingOverlay";

      // --- LOCALIZATION: Using I18n.t like popup.js ---
      const title = I18n.t("overlayTitle");
      const desc = I18n.t("overlayDesc");
      const initText = I18n.t("overlayInit");
      const closeText = I18n.t("overlayCloseBtn");

      const loadingIconUrl = chrome.runtime.getURL("assets/icons/loading.gif");

      overlayDiv.innerHTML = `
    <style>
      /* ... (Keep your CSS styles exactly as they are) ... */
      @keyframes saasOverlayFadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes saasOverlaySlideInUp { from { transform: translateY(20px); } to { transform: translateY(0); } }
      .saas-overlay-backdrop { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(17, 24, 39, 0.6); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 2147483647; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; animation: saasOverlayFadeIn 0.3s ease-out; }
      .saas-overlay-card { background-color: white; border-radius: 16px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1), 0 5px 10px rgba(0, 0, 0, 0.04); width: 100%; max-width: 400px; text-align: center; padding: 32px; animation: saasOverlaySlideInUp 0.4s ease-out; margin: 16px; }
      .saas-overlay-visual { margin-bottom: 24px; }
      .saas-overlay-visual img { height: 120px; width: auto; object-fit: contain; }
      .saas-overlay-content h4 { font-size: 18px; font-weight: 600; color: #111827; margin: 0 0 8px 0; }
      .saas-overlay-content > p { font-size: 14px; color: #6b7280; line-height: 1.6; margin: 0; }
      .saas-info-box { margin-top: 16px; padding: 12px 16px; background-color: #f0f5ff; border: 1px solid #d6e4ff; border-radius: 8px; display: flex; align-items: center; gap: 10px; text-align: left; }
      .saas-info-box i { font-size: 16px; color: #2f54eb; flex-shrink: 0; }
      .saas-info-box p { font-size: 13px; font-weight: 500; color: #1d39c4; margin: 0; }
      .saas-overlay-footer { margin-top: 24px; }
      #closeOverlayBtn { background-color: #f3f4f6; color: #4b5563; border: 1px solid #e5e7eb; border-radius: 8px; padding: 9px 16px; font-size: 14px; font-weight: 500; cursor: pointer; transition: background-color 0.2s ease, box-shadow 0.2s ease; }
      #closeOverlayBtn:hover { background-color: #e5e7eb; border-color: #d1d5db; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
    </style>

    <div class="saas-overlay-backdrop">
      <div class="saas-overlay-card">
        <div class="saas-overlay-visual">
          <img src="${loadingIconUrl}" alt="Processing..." />
        </div>
        
        <div class="saas-overlay-content">
          <h4>${title}</h4>
          <p>${desc}</p>
          
          <div class="saas-info-box">
            <i class="fa fa-info-circle"></i> 
            <p id="gpOverlayInfo">${initText}</p>
          </div>
        </div>

        <div class="saas-overlay-footer">
          <button id="closeOverlayBtn">${closeText}</button>
        </div>
      </div>
    </div>
  `;
      document.body.appendChild(overlayDiv);
    }
    const closeButton = document.getElementById("closeOverlayBtn");
    closeButton.addEventListener("click", function () {
      removeOverlay();
    });
  }

  function removeOverlay() {
    const overlayDiv = document.getElementById("postingOverlay");
    if (overlayDiv) {
      overlayDiv.remove();
    }
  }

  // async function clickItemForSaleButton() {
  //   console.log("Looking for 'Item for Sale' button...");

  //   // Define a selector that uniquely identifies the button
  //   const itemForSaleButtonSelector =
  //     'div[role="button"].x1i10hfl.x1qjc9v5.xjbqb8w.xjqpnuy.xa49m3k.xqeqjp1.x2hbi6w';

  //   // Wait for the "Item for Sale" button to appear
  //   const itemForSaleButton = await waitForElement(
  //     itemForSaleButtonSelector,
  //     10000
  //   );

  //   if (itemForSaleButton) {
  //     console.log("'Item for Sale' button found. Clicking...");
  //     itemForSaleButton.click();
  //   } else {
  //     console.error("'Item for Sale' button not found. Cannot proceed.");
  //   }
  // }

  // async function setProductDetails(
  //   title,
  //   price,
  //   condition,
  //   description,
  //   tags,
  //   location,
  //   doorDropoff,
  //   doorPickup,
  //   publicMeetup
  // ) {
  //   console.log("Setting product details", title, price, condition);

  //   // Set the title
  //   const titleInputSelector =
  //     ".x1i10hfl.xggy1nq.x1s07b3s.x1kdt53j.x1a2a7pz.xjbqb8w.x1ejq31n.xd10rxx.x1sy0etr.x17r0tee.x9f619.xzsf02u.x1uxerd5.x1fcty0u.x132q4wb.x1a8lsjc.x1pi30zi.x1swvt13.x9desvi.xh8yej3"; // Adjust if necessary
  //   const titleInput = document.querySelectorAll(titleInputSelector)[0];
  //   if (titleInput) {
  //     titleInput.value = title; // Set the title
  //     titleInput.dispatchEvent(new Event("input", { bubbles: true })); // Trigger input event
  //     titleInput.dispatchEvent(new Event("change", { bubbles: true }));
  //   } else {
  //     console.error("Title input not found");
  //   }

  //   // Set the price
  //   const priceInputSelector =
  //     ".x1i10hfl.xggy1nq.x1s07b3s.x1kdt53j.x1a2a7pz.xjbqb8w.x1ejq31n.xd10rxx.x1sy0etr.x17r0tee.x9f619.xzsf02u.x1uxerd5.x1fcty0u.x132q4wb.x1a8lsjc.x1pi30zi.x1swvt13.x9desvi.xh8yej3";
  //   const priceInput = document.querySelectorAll(priceInputSelector)[1];
  //   if (priceInput) {
  //     price = price * 1;
  //     console.log("priceInput", priceInput, price);
  //     priceInput.value = price; // Set the price
  //     priceInput.dispatchEvent(new Event("input", { bubbles: true })); // Trigger input event
  //   } else {
  //     console.error("Price input not found");
  //   }

  //   // Set the condition
  //   const conditionDropdown = document.querySelector(
  //     ".xjhjgkd.x1epquy7.xsnmfus.x1562eck.xcymrrh.x1268tai.x1mxuytg.x14hpm34.xqvykr2.x13fuv20.xu3j5b3.x1q0q8m5.x26u7qi.xq2ru2l.x17qb25w.xjmv2fv.x1b4qsv2.x78zum5.xdt5ytf.x6ikm8r.x10wlt62.x1n2onr6.x1ja2u2z.x1bb484j.x1ypdohk.x1a2a7pz"
  //   );
  //   if (conditionDropdown) {
  //     conditionDropdown.click();
  //     await sleep(1); // Wait for the popup to appear

  //     // Select the condition from the popup
  //     await selectConditionFromPopup(condition);
  //   } else {
  //     console.error("Condition dropdown not found");
  //   }
  //   const buttons = Array.from(document.querySelectorAll('div[role="button"]')); // Get all div elements with role="button"
  //   const morePorductDetailsButton = buttons.find(
  //     (button) =>
  //       button.textContent.includes("További részletek") ||
  //       button.textContent.includes("More Details")
  //   );
  //   if (morePorductDetailsButton) {
  //     morePorductDetailsButton.click();
  //   }
  //   await sleep(2);
  //   if (description) {
  //     console.log(description);
  //     const descriptionInputSelector = document.querySelector(
  //       ".x1i10hfl.xggy1nq.x1s07b3s.xjbqb8w.x1ejq31n.xd10rxx.x1sy0etr.x17r0tee.x9f619.xzsf02u.x78zum5.x1jchvi3.x1fcty0u.x132q4wb.xyorhqc.xaqh0s9.x1a2a7pz.x6ikm8r.x10wlt62.x1pi30zi.x1swvt13.xtt52l0.xh8yej3"
  //     );
  //     if (descriptionInputSelector) {
  //       console.log(`attemting to inert description - execCommand`);
  //       descriptionInputSelector.focus();
  //       await sleep(1);
  //       // descriptionInputSelector.value = description;

  //       document.execCommand("insertText", false, description);

  //       priceInput.dispatchEvent(new Event("input", { bubbles: true }));
  //       priceInput.dispatchEvent(new Event("change", { bubbles: true }));
  //       console.log(`description inserted`);
  //       await sleep(2);
  //     }
  //   }
  //   console.log(`tags`, tags);
  //   if (tags) {
  //     const productTagSelector = document.querySelector(
  //       ".x1i10hfl.xggy1nq.x1s07b3s.xjbqb8w.x76ihet.xwmqs3e.x112ta8.xxxdfa6.x9f619.xzsf02u.x78zum5.x1jchvi3.x1fcty0u.x132q4wb.x1a2a7pz.x6ikm8r.x10wlt62.xwib8y2.xtt52l0.xh8yej3"
  //     );
  //     if (productTagSelector) {
  //       const tagsArr = tags.split(",");

  //       console.log(`attemting to inert tags`);
  //       productTagSelector.focus();
  //       console.log(`tagsArr`, tagsArr);
  //       await sleep(1);
  //       for (let i = 0; i < tagsArr.length; i++) {
  //         document.execCommand("insertText", false, tagsArr[i]);
  //         await sleep(0.5);
  //         document.execCommand("insertText", false, ",");
  //         priceInput.dispatchEvent(new Event("input", { bubbles: true }));
  //         priceInput.dispatchEvent(new Event("change", { bubbles: true }));
  //         await sleep(0.5);
  //       }
  //       // productTagSelector.innerHTML += tags;

  //       await sleep(2);
  //     }
  //   }
  //   console.log(`optional section comes noooow`);
  //   if (location) {
  //     const locationInputSelector = document.querySelector(
  //       'input[aria-label="Location"].x1i10hfl.xggy1nq.x1s07b3s.x1kdt53j.x1a2a7pz.xjbqb8w.x76ihet.xwmqs3e.x112ta8.xxxdfa6.x9f619.xzsf02u.x1uxerd5.x1fcty0u.x132q4wb.x1a8lsjc.x1pi30zi.x1swvt13.x9desvi.xh8yej3.x15h3p50.x10emqs4'
  //     );
  //     if (locationInputSelector) {
  //       locationInputSelector.focus();
  //       await sleep(2);
  //       locationInputSelector.value = location;
  //       // document.execCommand("insertText", false, location);
  //       priceInput.dispatchEvent(new Event("input", { bubbles: true }));
  //       priceInput.dispatchEvent(new Event("change", { bubbles: true }));
  //       await sleep(2);
  //       const firstOption = document.querySelector(
  //         "x1i10hfl x1qjc9v5 xjbqb8w xjqpnuy xa49m3k xqeqjp1 x2hbi6w x13fuv20 xu3j5b3 x1q0q8m5 x26u7qi x972fbf xcfux6l x1qhh985 xm0m39n x9f619 x1ypdohk xdl72j9 x2lah0s xe8uvvx xdj266r x11i5rnm xat24cr x1mh8g0r x2lwn1j xeuugli xexx8yu x4uap5 x18d9i69 xkhd6sd x1n2onr6 x16tdsg8 x1hl2dhg xggy1nq x1ja2u2z x1t137rt x1o1ewxj x3x9cwd x1e5q0jg x13rtm0m x1q0g3np x87ps6o x1lku1pv x78zum5 x1a2a7pz xh8yej3"
  //       );
  //       if (firstOption) {
  //         firstOption.click();
  //       }
  //     }
  //   }

  //   if (doorDropoff || doorPickup || publicMeetup) {
  //     console.log(doorDropoff, doorPickup, publicMeetup);
  //     if (doorDropoff) {
  //       const selectorAll = document.querySelectorAll(
  //         ".x1i10hfl.x1qjc9v5.xjbqb8w.xjqpnuy.xa49m3k.xqeqjp1.x2hbi6w.x13fuv20.xu3j5b3.x1q0q8m5.x26u7qi.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.x1ypdohk.xdl72j9.x2lah0s.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.x2lwn1j.xeuugli.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x1n2onr6.x16tdsg8.x1hl2dhg.xggy1nq.x1ja2u2z.x1t137rt.x1q0g3np.x87ps6o.x1lku1pv.x1a2a7pz.x1lq5wgf.xgqcy7u.x30kzoy.x9jhf4c.x1lliihq"
  //       );
  //       const selector = selectorAll[selectorAll.length - 3];
  //       if (selector) {
  //         selector.click();
  //         priceInput.dispatchEvent(new Event("change", { bubbles: true }));
  //       }
  //     }
  //     if (doorPickup) {
  //       const selectorAll = document.querySelectorAll(
  //         ".x1i10hfl.x1qjc9v5.xjbqb8w.xjqpnuy.xa49m3k.xqeqjp1.x2hbi6w.x13fuv20.xu3j5b3.x1q0q8m5.x26u7qi.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.x1ypdohk.xdl72j9.x2lah0s.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.x2lwn1j.xeuugli.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x1n2onr6.x16tdsg8.x1hl2dhg.xggy1nq.x1ja2u2z.x1t137rt.x1q0g3np.x87ps6o.x1lku1pv.x1a2a7pz.x1lq5wgf.xgqcy7u.x30kzoy.x9jhf4c.x1lliihq"
  //       );
  //       const selector = selectorAll[selectorAll.length - 2];
  //       if (selector) {
  //         selector.click();
  //         priceInput.dispatchEvent(new Event("change", { bubbles: true }));
  //       }
  //     }
  //     if (publicMeetup) {
  //       const selectorAll = document.querySelectorAll(
  //         ".x1i10hfl.x1qjc9v5.xjbqb8w.xjqpnuy.xa49m3k.xqeqjp1.x2hbi6w.x13fuv20.xu3j5b3.x1q0q8m5.x26u7qi.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.x1ypdohk.xdl72j9.x2lah0s.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.x2lwn1j.xeuugli.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x1n2onr6.x16tdsg8.x1hl2dhg.xggy1nq.x1ja2u2z.x1t137rt.x1q0g3np.x87ps6o.x1lku1pv.x1a2a7pz.x1lq5wgf.xgqcy7u.x30kzoy.x9jhf4c.x1lliihq"
  //       );
  //       const selector = selectorAll[selectorAll.length - 1];
  //       if (selector) {
  //         selector.click();
  //         priceInput.dispatchEvent(new Event("change", { bubbles: true }));
  //       }
  //     }
  //   }
  //   await sleep(100);
  //   console.log(`next button`);
  //   const nextButton =
  //     document.querySelector('div[aria-label="Next"]') ||
  //     document.querySelector('div[aria-label="Tovább"]');
  //   if (nextButton) {
  //     nextButton.click();
  //     await sleep(1);
  //   }
  //   console.log(`post product`);
  //   const postButton =
  //     document.querySelector('div[aria-label="Post"]') ||
  //     document.querySelector('div[aria-label="Küldés"]');
  //   if (postButton) {
  //     postButton.click();
  //     await sleep(5);
  //   }
  //   console.log(`product posted`);
  // }

  // async function selectConditionFromPopup(condition) {
  //   // Wait for the popup to fully render
  //   await sleep(1);

  //   if (condition === "New") {
  //     const selection = document.querySelectorAll(
  //       ".x1i10hfl.xjbqb8w.x1ejq31n.xd10rxx.x1sy0etr.x17r0tee.x972fbf.xcfux6l.x1qhh985.xm0m39n.xe8uvvx.x1hl2dhg.xggy1nq.x1o1ewxj.x3x9cwd.x1e5q0jg.x13rtm0m.x87ps6o.x1lku1pv.x1a2a7pz.x6s0dn4.xjyslct.x9f619.x1ypdohk.x78zum5.x1q0g3np.x2lah0s.xnqzcj9.x1gh759c.xdj266r.xat24cr.x1344otq.x1de53dj.xz9dl7a.xsag5q8.x1n2onr6.x16tdsg8.x1ja2u2z"
  //     )[0];

  //     if (selection) {
  //       selection.click();
  //     } else {
  //       console.error("Condition selection not found");
  //     }
  //   } else if (condition === "Used - Like New") {
  //     const selection = document.querySelectorAll(
  //       ".x1i10hfl.xjbqb8w.x1ejq31n.xd10rxx.x1sy0etr.x17r0tee.x972fbf.xcfux6l.x1qhh985.xm0m39n.xe8uvvx.x1hl2dhg.xggy1nq.x1o1ewxj.x3x9cwd.x1e5q0jg.x13rtm0m.x87ps6o.x1lku1pv.x1a2a7pz.x6s0dn4.xjyslct.x9f619.x1ypdohk.x78zum5.x1q0g3np.x2lah0s.xnqzcj9.x1gh759c.xdj266r.xat24cr.x1344otq.x1de53dj.xz9dl7a.xsag5q8.x1n2onr6.x16tdsg8.x1ja2u2z"
  //     )[1];

  //     if (selection) {
  //       selection.click();
  //     } else {
  //       console.error("Condition selection not found");
  //     }
  //   } else if (condition === "Used - Good") {
  //     const selection = document.querySelectorAll(
  //       ".x1i10hfl.xjbqb8w.x1ejq31n.xd10rxx.x1sy0etr.x17r0tee.x972fbf.xcfux6l.x1qhh985.xm0m39n.xe8uvvx.x1hl2dhg.xggy1nq.x1o1ewxj.x3x9cwd.x1e5q0jg.x13rtm0m.x87ps6o.x1lku1pv.x1a2a7pz.x6s0dn4.xjyslct.x9f619.x1ypdohk.x78zum5.x1q0g3np.x2lah0s.xnqzcj9.x1gh759c.xdj266r.xat24cr.x1344otq.x1de53dj.xz9dl7a.xsag5q8.x1n2onr6.x16tdsg8.x1ja2u2z"
  //     )[2];

  //     if (selection) {
  //       selection.click();
  //     } else {
  //       console.error("Condition selection not found");
  //     }
  //   } else if (condition === "Used - Fair") {
  //     const selection = document.querySelectorAll(
  //       ".x1i10hfl.xjbqb8w.x1ejq31n.xd10rxx.x1sy0etr.x17r0tee.x972fbf.xcfux6l.x1qhh985.xm0m39n.xe8uvvx.x1hl2dhg.xggy1nq.x1o1ewxj.x3x9cwd.x1e5q0jg.x13rtm0m.x87ps6o.x1lku1pv.x1a2a7pz.x6s0dn4.xjyslct.x9f619.x1ypdohk.x78zum5.x1q0g3np.x2lah0s.xnqzcj9.x1gh759c.xdj266r.xat24cr.x1344otq.x1de53dj.xz9dl7a.xsag5q8.x1n2onr6.x16tdsg8.x1ja2u2z"
  //     )[3];

  //     if (selection) {
  //       selection.click();
  //     } else {
  //       console.error("Condition selection not found");
  //     }
  //   }
  // }

  // Function to check the post outcome within a 10-second window
  async function checkPostOutcomeWithTimeout() {
    const timeout = 30; // 10 seconds
    const interval = 1; // Check every second
    let elapsedTime = 0;

    // Selector for the success message (modify as needed)
    const successMessageSelector = ".xw7yly9.xktsk01.x1yztbdb.x1d52u69";

    while (elapsedTime < timeout) {
      const successMessage = document.querySelector(successMessageSelector);

      if (successMessage) {
        console.log("Success: Listing is in review");
        chrome.storage.local.set({ operationDone: "successful" });
        return; // Exit the function as success is confirmed
      }

      await sleep(interval);
      elapsedTime += interval;
    }

    // If the loop completes without finding the success message
    console.log(
      "Timeout reached or failure: Listing did not post successfully",
    );
    chrome.storage.local.set({ operationDone: "failed" });
    return;
  }

  // 1. HELPER: Simulates a real human click sequence
  async function simulateDeepClick(element) {
    if (!element) return;

    // Scroll into view with margin
    element.scrollIntoView({ block: "center", behavior: "smooth" });
    await sleep(0.5);

    const opts = { bubbles: true, cancelable: true, view: window };
    element.dispatchEvent(new MouseEvent("mouseover", opts));
    element.dispatchEvent(new MouseEvent("mousedown", opts));
    element.dispatchEvent(new MouseEvent("mouseup", opts));
    element.click();
  }

  // in content.js
  // ACTION: Replace the findRobustPostModalButton function.

  async function findRobustPostModalButton() {
    console.log("Starting robust search for post modal button (Universal)...");

    // --- STRATEGY 1: Profile Picture Neighbor (The "Gray Pill") ---
    // Works in ALL languages. Looks for the input-like div next to the user's avatar.
    try {
      // 1. Find profile images that look like avatars (rounded, small)
      const imgs = Array.from(document.querySelectorAll("img")).filter(
        (img) => {
          const w = img.clientWidth;
          return w > 20 && w < 60 && img.style.borderRadius === "50%";
        },
      );

      for (const img of imgs) {
        // 2. Look at the container row
        const row = img.closest('div[style*="display: flex"], .x6s0dn4'); // Common flex containers
        if (!row) continue;

        // 3. Find the sibling "button" (The gray pill)
        const siblingBtn = row.querySelector(
          'div[role="button"], div[style*="border-radius"]',
        );

        // Validation:
        // - Must NOT contain the image itself
        // - Must be to the right of the image (structurally, usually next sibling or close)
        // - Text usually empty or placeholder-like
        if (siblingBtn && !siblingBtn.contains(img)) {
          const text = siblingBtn.innerText.trim();
          const rect = siblingBtn.getBoundingClientRect();

          // It should be wider than it is tall (a bar)
          if (rect.width > rect.height * 2) {
            console.log("Found modal opener via Profile Neighbor strategy.");
            return siblingBtn;
          }
        }
      }
    } catch (e) {
      console.warn("Profile neighbor check failed", e);
    }

    // --- STRATEGY 2: Common Aria Labels (Multilingual) ---
    const commonLabels = [
      "create post",
      "write something",
      "what's on your mind", // English
      "créer une publication",
      "à quoi pensez-vous", // French
      "crear publicación", // Spanish
      "beitrag erstellen", // German
      "bejegyzés létrehozása",
      "írj valamit", // Hungarian
      "创建帖子",
      "发布", // Chinese
      "إلغاء",
      "بم تفكر", // Arabic
    ];

    for (const label of commonLabels) {
      // Use partial match for robustness
      const el = document.querySelector(`div[aria-label*="${label}" i]`);
      if (el && el.offsetParent) return el;
    }

    // --- STRATEGY 3: Fallback English Text ---
    // Last resort for English users
    const textQueries = [
      "Write something",
      "What's on your mind",
      "Create a public post",
    ];
    for (const query of textQueries) {
      const xpath = `//div[@role="button"]//*[contains(text(), "${query}")]`;
      const result = document.evaluate(
        xpath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null,
      );
      if (result.singleNodeValue) {
        return (
          result.singleNodeValue.closest('[role="button"]') ||
          result.singleNodeValue
        );
      }
    }

    return null;
  }

  function getActionButton() {
    let selector = 'div[aria-label="Post"]';
    let button = document.querySelector(selector);

    // If not found, try the "Küldés" aria-label
    if (!button) {
      selector = 'div[aria-label="Küldés"]';
      button = document.querySelector(selector);
    }

    return button;
  }

  async function waitForElement(
    selector,
    timeout = 10000,
    useAll = false,
    silentFail = false,
  ) {
    const startTime = Date.now();
    const pollInterval = 100; // Poll every 100ms instead of 500ms

    // Try immediately first before entering the loop
    if (useAll) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0)
        return elements[elements.length - 1] || elements[0];
    } else {
      const element = document.querySelector(selector);
      if (element) return element;
    }

    while (Date.now() - startTime < timeout) {
      await new Promise((resolve) => setTimeout(resolve, pollInterval));

      if (useAll) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0)
          return elements[elements.length - 1] || elements[0];
      } else {
        const element = document.querySelector(selector);
        if (element) return element;
      }
    }

    if (silentFail) {
      return null; // Just return null instead of throwing an error
    }

    throw new Error(`Timeout waiting for element: ${selector}`);
  }

  async function waitForClickableElement(selector, timeout = 15000) {
    // Increased timeout to 15s
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      // Find all possible candidates that match the selector
      const elements = document.querySelectorAll(selector);

      // Find the first candidate that is actually enabled and visible in the layout
      const clickableElement = Array.from(elements).find((el) => {
        // An element is clickable if it's visible (offsetParent check) AND not disabled (aria-disabled check).
        return (
          el.offsetParent !== null &&
          el.getAttribute("aria-disabled") !== "true"
        );
      });

      if (clickableElement) {
        console.log(`Found clickable element for selector: ${selector}`);
        return clickableElement;
      }

      // Wait a bit before trying again
      await new Promise((resolve) => setTimeout(resolve, 250));
    }

    // If the loop finishes, the element was not found or never became clickable
    throw new Error(
      `Timeout waiting for a CLICKABLE element: ${selector}. It might exist but remained disabled.`,
    );
  }

  // in content.js
  // ACTION: Replace the captureInteractiveSnapshot function.

  function captureInteractiveSnapshot() {
    // 1. Determine Strict Scope
    let scope = document.body;
    let scopeName = "Global";

    const allDialogs = Array.from(
      document.querySelectorAll('div[role="dialog"]'),
    );
    const visibleDialogs = allDialogs.filter(
      (d) =>
        d.offsetParent !== null &&
        window.getComputedStyle(d).display !== "none",
    );

    if (visibleDialogs.length > 0) {
      // Restrict scope to the top-most modal
      scope = visibleDialogs[visibleDialogs.length - 1];
      scopeName = "ActiveDialog";
      console.log(
        `[Snapshot] Restricting AI vision to active dialog (${visibleDialogs.length} detected).`,
      );
    }

    // 2. Select likely candidates within SCOPE ONLY
    const candidates = Array.from(
      scope.querySelectorAll(
        'div[role="button"], button, a[role="button"], span[role="button"], input[type="submit"], div[contenteditable="true"], textarea, input[type="text"]',
      ),
    ).filter((el) => {
      if (!el.offsetParent) return false;
      // Filter out tiny elements
      const rect = el.getBoundingClientRect();
      return rect.width >= 5 && rect.height >= 5;
    });

    // Create a lightweight text representation
    const snapshotText = candidates
      .map((el, i) => {
        const text = (el.innerText || el.value || "")
          .replace(/\s+/g, " ")
          .trim()
          .substring(0, 60);
        const label = el.getAttribute("aria-label") || "";
        const placeholder = el.getAttribute("aria-placeholder") || "";
        const role = el.getAttribute("role") || el.tagName.toLowerCase();

        if (!text && !label && !placeholder) return null;

        return `[${i}] <${role} label="${label}" ph="${placeholder}">${text}</${role}>`;
      })
      .filter(Boolean)
      .join("\n");

    return { snapshotText, candidates };
  }

  /**
   * Generates a unique selector for an element to cache it.
   * Prioritizes ID, then Aria Label, then Classes.
   */
  function generateUniqueSelector(el) {
    if (el.id) return `#${el.id}`;

    const ariaLabel = el.getAttribute("aria-label");
    if (ariaLabel) return `[aria-label="${ariaLabel}"]`;

    // Fallback to role + text content (heuristic)
    if (el.getAttribute("role")) {
      return `[role="${el.getAttribute("role")}"]`;
    }

    return null; // Can't reliably cache
  }
  async function waitForElementWithAiFallback(
    selector,
    description,
    timeout = 5000,
  ) {
    // 1. Try Cached Selector First
    const { cachedPostButtonSelector } = await new Promise((resolve) =>
      chrome.storage.local.get("cachedPostButtonSelector", resolve),
    );

    if (cachedPostButtonSelector) {
      console.log(
        `[SmartWait] Trying cached selector: ${cachedPostButtonSelector}`,
      );
      const cachedEl = document.querySelector(cachedPostButtonSelector);
      if (
        cachedEl &&
        cachedEl.offsetParent &&
        cachedEl.getAttribute("aria-disabled") !== "true"
      ) {
        console.log("Cache Hit! Found element via saved selector.");
        return cachedEl;
      } else {
        console.log("Cache Miss. Element not found or invalid.");
        // Clear stale cache
        chrome.storage.local.remove("cachedPostButtonSelector");
      }
    }

    // 2. Try Standard Selector (Hardcoded)
    try {
      console.log(`[SmartWait] Trying standard selector for: ${description}`);
      return await waitForClickableElement(selector, timeout);
    } catch (standardError) {
      console.warn(
        `[SmartWait] Standard selector failed. Initiating AI Fallback...`,
      );
      writeInfo(
        `Standard method failed. Asking AI to find the "${description}" button...`,
      );

      // 3. Capture Snapshot
      const { snapshotText, candidates } = captureInteractiveSnapshot();

      if (!snapshotText) {
        throw new Error(
          "AI Fallback failed: No interactive elements found on page.",
        );
      }

      // 4. Ask AI
      const response = await chrome.runtime.sendMessage({
        action: "aiSelectorFallback",
        targetDescription: description,
        domSnapshot: snapshotText,
      });

      if (response && response.success && response.index !== -1) {
        const bestCandidate = candidates[response.index];
        if (bestCandidate) {
          console.log(
            `[SmartWait] AI identified candidate index ${response.index}.`,
            bestCandidate,
          );

          // 5. CACHE THE RESULT
          // We generate a selector that we can reuse next time
          const uniqueSel = generateUniqueSelector(bestCandidate);
          if (uniqueSel) {
            console.log(`Caching successful selector: ${uniqueSel}`);
            chrome.storage.local.set({ cachedPostButtonSelector: uniqueSel });
          }

          bestCandidate.style.border = "3px solid #10b981"; // Visual feedback
          return bestCandidate;
        }
      }

      throw new Error(`AI could not locate "${description}" on this page.`);
    }
  }

  async function handleOptionalNotNowButton() {
    try {
      console.log("Checking for optional 'Not now' button...");
      // Look for the button with a short timeout. We don't want to wait long for it.
      // We use the more resilient aria-label selector.
      const notNowButton = await waitForClickableElement(
        'div[role="button"][aria-label="Not now"]',
        4000, // A 4-second timeout is plenty.
      );

      console.log("Found and clicked the 'Not now' button.");
      notNowButton.click();
      await sleep(1); // Wait a moment for the dialog to disappear.
    } catch (error) {
      // This is the expected outcome if the button doesn't appear.
      console.log("Optional 'Not now' button was not found. Continuing...");
    }
  }

  // Helper function to set the background color for a post
  async function setBackground(postColor) {
    if (!postColor) {
      console.log("No postColor provided. Exiting setBackground.");
      return;
    }
    try {
      // Step 1: Click the "Show Background Options" button if present
      const showBackgroundButtonSelector =
        'div[aria-label="Show Background Options"][role="button"]';
      const showBackgroundButton = await waitForElement(
        showBackgroundButtonSelector,
        10000,
      );

      if (showBackgroundButton) {
        console.log("Clicking on Show Background Options button...");
        // Dispatch a focus event to simulate user clicking on the input
        const mouseDownEvent = new MouseEvent("mousedown", { bubbles: true });
        showBackgroundButton.dispatchEvent(mouseDownEvent);
        const focusEvent = new FocusEvent("focus", { bubbles: true });
        showBackgroundButton.dispatchEvent(focusEvent);
        const mouseUpEvent = new MouseEvent("mouseup", { bubbles: true });
        showBackgroundButton.dispatchEvent(mouseUpEvent);
        showBackgroundButton.click();
        await sleep(2);

        // Step 2: Click the "Background Options" button
        const backgroundOptionsButtonSelector =
          'div[aria-label="Background Options"][role="button"]';
        const backgroundOptionsButton = await waitForElement(
          backgroundOptionsButtonSelector,
          10000,
        );

        await sleep(0.5);
        if (backgroundOptionsButton) {
          console.log("Clicking on Background Options button...");
          // Dispatch a focus event to simulate user clicking on the input
          // const mouseDownEvent = new MouseEvent("mousedown", { bubbles: true });
          // backgroundOptionsButton.dispatchEvent(mouseDownEvent);
          // const focusEvent = new FocusEvent("focus", { bubbles: true });
          // backgroundOptionsButton.dispatchEvent(focusEvent);
          // const mouseUpEvent = new MouseEvent("mouseup", { bubbles: true });
          // backgroundOptionsButton.dispatchEvent(mouseUpEvent);
          // await sleep(0.5);
          backgroundOptionsButton.click();
          await sleep(1);
          // Select the target div using the original class names
          const targetDivSelector =
            "div.xb57i2i.x1q594ok.x5lxg6s.x78zum5.xdt5ytf.x6ikm8r.x1ja2u2z.x1pq812k.x1rohswg.xfk6m8.x1yqm8si.xjx87ck.xx8ngbg.xwo3gff.x1n2onr6.x1oyok0e.x1odjw0f.x1e4zzel.x1v3eypb.x1qrby5j";
          const targetDiv = await waitForElement(targetDivSelector, 10000);

          if (targetDiv) {
            // Remove the specific class
            targetDiv.classList.remove("x1v3eypb");
            console.log("Class 'x1v3eypb' removed successfully.");
          } else {
            console.log("Target div not found.");
          }

          // Step 3: Select the desired background color button
          // Define a mapping between color codes and selector attributes with position
          const colorMap = {
            "#e2013b": {
              selector:
                'div[aria-label="Red illustration, background image"][role="button"]',
              position: 2, // First occurrence (index 0)
            },
            "#ff6323": {
              selector:
                'div[aria-label="Orange illustration, background image"][role="button"]',
              position: 0, // Last occurrence (index 3)
            },
            "#c600ff": {
              selector:
                'div[aria-label="Solid purple, background"][role="button"]',
              position: 0, // Assume first occurrence for this color
            },
            "#26927f": {
              selector:
                'div[aria-label="Green illustration, background image"][role="button"]',
              position: 0, // Assume first occurrence for this color
            },
            "#f6c7c6": {
              selector:
                'div[aria-label="Pink illustration, background image"][role="button"]',
              position: 4, // Last occurrence (index 4)
            },
            "#2088af": {
              selector:
                'div[aria-label="Steel blue illustration, background image"][role="button"]',
              position: 0, // Assume first occurrence for this color
            },
          };

          const colorConfig = colorMap[postColor];
          if (colorConfig) {
            let attempts = 0;
            const maxAttempts = 3;

            while (attempts < maxAttempts) {
              const backgroundButtons = document.querySelectorAll(
                colorConfig.selector,
              );

              if (backgroundButtons.length >= colorConfig.position) {
                const backgroundButton =
                  backgroundButtons[colorConfig.position];
                if (backgroundButton) {
                  console.log(
                    `Clicking on background button for color: ${postColor}`,
                  );

                  // Step 1: Dispatch mousedown event to simulate the initial button press
                  const mouseDownEvent = new MouseEvent("mousedown", {
                    bubbles: true,
                  });
                  backgroundButton.dispatchEvent(mouseDownEvent);

                  // Step 2: Optionally, bring the button into focus (useful for user simulation)
                  const focusEvent = new FocusEvent("focus", { bubbles: true });
                  backgroundButton.dispatchEvent(focusEvent);

                  // Step 3: Dispatch mouseup event to simulate releasing the button
                  const mouseUpEvent = new MouseEvent("mouseup", {
                    bubbles: true,
                  });
                  backgroundButton.dispatchEvent(mouseUpEvent);
                  await sleep(0.5);

                  // Step 4: Finally, use click to simulate the click action
                  requestAnimationFrame(() => {
                    backgroundButton.click();
                  });
                  await sleep(1);

                  console.log(`Background color set to: ${postColor}`);
                  break; // Exit loop if successful
                } else {
                  console.log(
                    `Background button for color: ${postColor} not found.`,
                  );
                }
              } else {
                console.log(
                  `No background button found at position: ${colorConfig.position} for color: ${postColor}`,
                );
              }

              // Increment attempt count
              attempts++;

              if (attempts < maxAttempts) {
                console.log(
                  `Retrying to set background color for: ${postColor} (Attempt ${
                    attempts + 1
                  }/${maxAttempts})`,
                );
                await sleep(5); // Wait 5 seconds before retrying
              } else {
                console.log(
                  `Failed to set background color for: ${postColor} after ${maxAttempts} attempts.`,
                );
              }
            }
          } else {
            console.log(`No selector found for color: ${postColor}`);
          }
        } else {
          console.log("Background Options button not found, retrying...");
          await sleep(2);
        }
      } else {
        console.log("Show Background Options button not found, retrying...");
        await sleep(2);
      }
    } catch (error) {
      console.error(`Error in setBackground: ${error.message}`);
    }
  }
  function spinText(text) {
    // Regular expression to match the innermost `{}` pattern
    const regex = /\{([^{}]+)\}/;

    // Continue processing until no more `{}` are found in the string
    while (regex.test(text)) {
      text = text.replace(regex, (match, group) => {
        // Split the content inside `{}` into individual options using `|`
        const options = group.split("|");

        // Randomly choose one of the options
        const selectedOption =
          options[Math.floor(Math.random() * options.length)].trim();

        // Recursively process the selected option in case it contains more `{}` patterns
        return spinText(selectedOption);
      });
    }

    return text;
  }

  function writeInfo(text) {
    let place = document.getElementById("gpOverlayInfo");
    if (place) {
      place.innerHTML = text;
    }
  }

  async function dismissCommonOverlays() {
    console.log("Checking for common blocking overlays...");

    // 1. "Leave Site?" browser dialog - We can't control this, but it's good to be aware of.
    // We can try to prevent it by setting the beforeunload handler to null.
    window.onbeforeunload = null;

    // 2. Common "Not Now" or "Close" buttons in popups
    // This looks for buttons with these labels that are inside a dialog.
    const dismissButtonSelectors = [
      'div[aria-label="Not now"][role="button"]',
      'div[aria-label="Close"][role="button"]',
      'div[aria-label="OK"][role="button"]',
    ];

    for (const selector of dismissButtonSelectors) {
      try {
        const buttons = document.querySelectorAll(selector);
        for (const button of buttons) {
          // Check if the button is visible and inside a dialog
          if (
            button.offsetParent !== null &&
            button.closest('[role="dialog"]')
          ) {
            console.log(
              `Found and clicked a potential blocking button: ${selector}`,
            );
            button.click();
            await sleep(1.5); // Wait for the dialog to disappear
          }
        }
      } catch (e) {
        /* Ignore errors */
      }
    }
  }
  async function automatePost(spuntext, images = []) {
    try {
      // Helper function to convert and optimize images
      async function optimizeImage(imageData) {
        // Create an image element
        const img = new Image();

        // Create a loading promise
        const loadPromise = new Promise((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error("Failed to load image"));
        });

        // Load the image
        img.src = imageData.data;
        await loadPromise;

        // Create canvas for image processing
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Calculate new dimensions (maintaining aspect ratio)
        let width = img.width;
        let height = img.height;
        const MAX_SIZE = 2048; // Maximum dimension

        if (width > height && width > MAX_SIZE) {
          height = (height * MAX_SIZE) / width;
          width = MAX_SIZE;
        } else if (height > MAX_SIZE) {
          width = (width * MAX_SIZE) / height;
          height = MAX_SIZE;
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw and compress image
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to JPEG with quality setting
        const jpegData = canvas.toDataURL("image/jpeg", 0.8); // 0.8 quality setting for good balance

        return jpegData;
      }

      const characterMaps = {
        bold: {
          A: "𝗔",
          B: "𝗕",
          C: "𝗖",
          D: "𝗗",
          E: "𝗘",
          F: "𝗙",
          G: "𝗚",
          H: "𝗛",
          I: "𝗜",
          J: "𝗝",
          K: "𝗞",
          L: "𝗟",
          M: "𝗠",
          N: "𝗡",
          O: "𝗢",
          P: "𝗣",
          Q: "𝗤",
          R: "𝗥",
          S: "𝗦",
          T: "𝗧",
          U: "𝗨",
          V: "𝗩",
          W: "𝗪",
          X: "𝗫",
          Y: "𝗬",
          Z: "𝗭",
          a: "𝗮",
          b: "𝗯",
          c: "𝗰",
          d: "𝗱",
          e: "𝗲",
          f: "𝗳",
          g: "𝗴",
          h: "𝗵",
          i: "𝗶",
          j: "𝗷",
          k: "𝗸",
          l: "𝗹",
          m: "𝗺",
          n: "𝗻",
          o: "𝗼",
          p: "𝗽",
          q: "𝗾",
          r: "𝗿",
          s: "𝘀",
          t: "𝘁",
          u: "𝘂",
          v: "𝘃",
          w: "𝘄",
          x: "𝘅",
          y: "𝘆",
          z: "𝘇",
        },
        italic: {
          A: "𝘈",
          B: "𝘉",
          C: "𝘊",
          D: "𝘋",
          E: "𝘌",
          F: "𝘍",
          G: "𝘎",
          H: "𝘏",
          I: "𝘐",
          J: "𝘑",
          K: "𝘒",
          L: "𝘓",
          M: "𝘔",
          N: "𝘕",
          O: "𝘖",
          P: "𝘗",
          Q: "𝘘",
          R: "𝘙",
          S: "𝘚",
          T: "𝘛",
          U: "𝘜",
          V: "𝘝",
          W: "𝘞",
          X: "𝘟",
          Y: "𝘠",
          Z: "𝘡",
          a: "𝘢",
          b: "𝘣",
          c: "𝘤",
          d: "𝘥",
          e: "𝘦",
          f: "𝘧",
          g: "𝘨",
          h: "𝘩",
          i: "𝘪",
          j: "𝘫",
          k: "𝘬",
          l: "𝘭",
          m: "𝘮",
          n: "𝘯",
          o: "𝘰",
          p: "𝘱",
          q: "𝘲",
          r: "𝘳",
          s: "𝘴",
          t: "𝘵",
          u: "𝘶",
          v: "𝘷",
          w: "𝘸",
          x: "𝘹",
          y: "𝘺",
          z: "𝘻",
        },
        boldItalic: {
          // Mathematical Bold Italic
          A: "𝑨",
          B: "𝑩",
          C: "𝑪",
          D: "𝑫",
          E: "𝑬",
          F: "𝑭",
          G: "𝑮",
          H: "𝑯",
          I: "𝑰",
          J: "𝑱",
          K: "𝑲",
          L: "𝑳",
          M: "𝑴",
          N: "𝑵",
          O: "𝑶",
          P: "𝑷",
          Q: "𝑸",
          R: "𝑹",
          S: "𝑺",
          T: "𝑻",
          U: "𝑼",
          V: "𝑽",
          W: "𝑾",
          X: "𝑿",
          Y: "𝒀",
          Z: "𝒁",
          a: "𝒂",
          b: "𝒃",
          c: "𝒄",
          d: "𝒅",
          e: "𝒆",
          f: "𝒇",
          g: "𝒈",
          h: "𝒉",
          i: "𝒊",
          j: "𝒋",
          k: "𝒌",
          l: "𝒍",
          m: "𝒎",
          n: "𝒏",
          o: "𝒐",
          p: "𝒑",
          q: "𝒒",
          r: "𝒓",
          s: "𝒔",
          t: "𝒕",
          u: "𝒖",
          v: "𝒗",
          w: "𝒘",
          x: "𝒙",
          y: "𝒚",
          z: "𝒛",
        },
        monospace: {
          // Mathematical Monospace
          A: "𝙰",
          B: "𝙱",
          C: "𝙲",
          D: "𝙳",
          E: "𝙴",
          F: "𝙵",
          G: "𝙶",
          H: "𝙷",
          I: "𝙸",
          J: "𝙹",
          K: "𝙺",
          L: "𝙻",
          M: "𝙼",
          N: "𝙽",
          O: "𝙾",
          P: "𝙿",
          Q: "𝚀",
          R: "𝚁",
          S: "𝚂",
          T: "𝚃",
          U: "𝚄",
          V: "𝚅",
          W: "𝚆",
          X: "𝚇",
          Y: "𝚈",
          Z: "𝚉",
          a: "𝚊",
          b: "𝚋",
          c: "𝚌",
          d: "𝚍",
          e: "𝚎",
          f: "𝚏",
          g: "𝚐",
          h: "𝚑",
          i: "𝚒",
          j: "𝚓",
          k: "𝚔",
          l: "𝚕",
          m: "𝚖",
          n: "𝚗",
          o: "𝚘",
          p: "𝚙",
          q: "𝚚",
          r: "𝚛",
          s: "𝚜",
          t: "𝚝",
          u: "𝚞",
          v: "𝚟",
          w: "𝚠",
          x: "𝚡",
          y: "𝚢",
          z: "𝚣",
        },
      };

      function formatText(text) {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = text;

        function processNode(node) {
          if (node.nodeType === Node.TEXT_NODE) {
            return node.textContent;
          }

          if (node.nodeType === Node.ELEMENT_NODE) {
            let content = Array.from(node.childNodes).map(processNode).join("");

            // Handle bold and italic combinations
            if (
              node.tagName.toLowerCase() === "strong" ||
              node.tagName.toLowerCase() === "b"
            ) {
              if (node.querySelector("em, i")) {
                // Bold and italic
                return content
                  .split("")
                  .map((char) => characterMaps.boldItalic[char] || char)
                  .join("");
              } else {
                // Just bold
                return content
                  .split("")
                  .map((char) => characterMaps.bold[char] || char)
                  .join("");
              }
            } else if (
              node.tagName.toLowerCase() === "em" ||
              node.tagName.toLowerCase() === "i"
            ) {
              if (
                node.parentElement &&
                (node.parentElement.tagName.toLowerCase() === "strong" ||
                  node.parentElement.tagName.toLowerCase() === "b")
              ) {
                // Already handled by bold processing
                return content;
              } else {
                // Just italic
                return content
                  .split("")
                  .map((char) => characterMaps.italic[char] || char)
                  .join("");
              }
            } else if (node.tagName.toLowerCase() === "h1") {
              // Monospace for h1
              return content
                .split("")
                .map((char) => characterMaps.monospace[char] || char)
                .join("");
            } else if (node.tagName.toLowerCase() === "p") {
              return content + "\n";
            } else if (node.tagName.toLowerCase() === "br") {
              return "\n";
            }

            return content;
          }

          return "";
        }

        return processNode(tempDiv);
      }

      // Dismiss notifications if present
      const notNowSelector = 'div[role="button"][aria-label="Not now"]';
      const notNowBtn = document.querySelector(notNowSelector);
      if (notNowBtn) {
        simulateClick(notNowBtn);
        await sleep(1);
      }

      // Click the "Write something..." area
      const writeSomethingSelector =
        'div[data-tti-phase="-1"][data-type="container"][data-mcomponent="MContainer"].m[style*="margin-top:-39px"] div[data-mcomponent="ServerTextArea"] > div.native-text';
      const writeSomethingDiv = await waitForElement(
        writeSomethingSelector,
        10000,
      );
      simulateClick(writeSomethingDiv);
      await sleep(1);
      // Insert formatted text content if provided
      if (spuntext) {
        const textAreaSelector = 'div[data-action-id="5"]';
        const textAreaDiv = await waitForElement(textAreaSelector, 10000);
        textAreaDiv.click();

        const formattedText = formatText(spuntext);
        console.log(formattedText);
        document.execCommand("insertText", false, formattedText);
        await sleep(1);
      }
      // Handle image upload if images are provided
      if (images && images.length > 0) {
        const photosButtonSelector = 'div[role="button"][aria-label="Photos"]';
        const photosButton = await waitForElement(photosButtonSelector, 10000);
        simulateClick(photosButton);
        await sleep(2);

        const fileInputs = document.querySelectorAll('input[type="file"]');
        const fileInput = fileInputs[0];

        if (!fileInput) {
          throw new Error(
            "File input element not found after clicking Photos button",
          );
        }

        // Process all images
        const optimizedImages = await Promise.all(
          images.map(async (img, index) => {
            const optimizedData = await optimizeImage(img);
            const base64Data = optimizedData.replace(
              /^data:image\/jpeg;base64,/,
              "",
            );
            const byteString = atob(base64Data);
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
              ia[i] = byteString.charCodeAt(i);
            }
            const blob = new Blob([ab], { type: "image/jpeg" });
            return new File([blob], `image${index + 1}.jpg`, {
              type: "image/jpeg",
            });
          }),
        );

        const dataTransfer = new DataTransfer();
        optimizedImages.forEach((file) => dataTransfer.items.add(file));
        fileInput.files = dataTransfer.files;

        const events = [
          new Event("change", { bubbles: true }),
          new Event("focus", { bubbles: true }),
          new MouseEvent("click", { bubbles: true }),
          new Event("blur", { bubbles: true }),
        ];

        for (const event of events) {
          fileInput.dispatchEvent(event);
          await sleep(1);
        }

        await sleep(4);
      } else {
        await sleep(1);
        const allButtons = document.querySelector(
          'div[role="button"][aria-label="Tag people"]',
        );
        // simulateClick(allButtons[4]);
        allButtons.click();
        console.log("allbuttons clicked");
        const cncelBTN = await waitForElement(
          'div[role="button"][aria-label="Back"][data-action-id="99"]',
          10000,
          false,
          true,
        );
        // const cancelAddPeople = document.querySelector(
        //   'div[role="button"][aria-label="Back"][data-action-id="99"]'
        // );
        if (cncelBTN) {
          cncelBTN.click();
          console.log("cancel button clicked");
        }
      }

      // Click the POST button
      const postButtonSelector =
        'div[role="button"][tabindex="0"][data-focusable="true"][data-tti-phase="-1"][data-actual-height="44"][data-mcomponent="MContainer"][data-type="container"].m > div[data-mcomponent="ServerTextArea"][data-type="text"].m';
      const postButtons = document.querySelectorAll(postButtonSelector);
      const postBTN = postButtons[1];
      console.log(postBTN, "postbutton found");

      if (postBTN) {
        postBTN.click();
        await sleep(3);
        console.log("post clicked");

        try {
          // Wait for the cover photo element to appear, indicating we're back on the group page
          const coverPhoto = await waitForElement(
            'div[aria-label="Group cover photo"][data-focusable="true"] img[data-type="image"]',
            10000,
          );

          if (coverPhoto) {
            console.log("Post successful - returned to group page");
            await sleep(2); // Small delay to ensure everything is settled
            chrome.storage.local.set({ operationDone: "successful" });
          } else {
            console.error("Cover photo not found after posting");
            await sleep(10);
            chrome.storage.local.set({ operationDone: "failed" });
          }
        } catch (err) {
          await sleep(10);
          console.error("Failed to verify post completion:", err);
          chrome.storage.local.set({ operationDone: "failed" });
          throw err;
        }
      } else {
        throw new Error("No POST button found");
      }
    } catch (err) {
      console.error("Automation failed in automatePost():", err);
      throw err;
    }
  }

  function simulateClick(element) {
    const events = [
      new MouseEvent("mouseover", { bubbles: true }),
      new MouseEvent("mousedown", { bubbles: true }),
      new MouseEvent("click", { bubbles: true }),
      new MouseEvent("mouseup", { bubbles: true }),
    ];

    events.forEach((event) => element.dispatchEvent(event));
  }

  async function disableComments() {
    try {
      console.log("Attempting to disable comments...");

      // Give Facebook a moment to finish posting
      await sleep(2);

      // Find the three-dots menu button (Actions for this post)
      const menuButtonSelector =
        'div[aria-expanded="false"][aria-haspopup="menu"][aria-label="Actions for this post"]';
      const menuButton = await waitForElement(menuButtonSelector, 10000);

      if (!menuButton) {
        console.error("Actions menu button not found");
        return false;
      }

      console.log("Found actions menu button, clicking...");
      menuButton.click();

      // Wait for the menu to appear and for the option to become available
      await sleep(1);

      // Try multiple possible selectors for the "Turn off commenting" option
      const selectors = [
        // Selector from the provided HTML
        'div[role="menuitem"] span[dir="auto"]:contains("Turn off commenting")',

        // Alternative selectors based on common Facebook patterns
        'div[role="menuitem"]:contains("Turn off commenting")',
        'div[role="menuitem"] span:contains("Turn off commenting")',
        'div[role="menuitem"]:contains("commenting")',
        'div[role="menuitem"][tabindex="0"] span:contains("commenting")',
      ];

      // Try each selector
      let commentOption = null;

      for (const selector of selectors) {
        try {
          // For the :contains pseudo-selector, we need to implement it ourselves
          if (selector.includes(":contains")) {
            const baseSelectorParts = selector.split(":contains");
            const baseSelector = baseSelectorParts[0];
            const textToFind = baseSelectorParts[1]
              .replace(/["'()]/g, "")
              .trim();

            const elements = document.querySelectorAll(baseSelector);
            commentOption = Array.from(elements).find((el) =>
              el.textContent.toLowerCase().includes(textToFind.toLowerCase()),
            );

            if (commentOption) {
              break;
            }
          } else {
            commentOption = document.querySelector(selector);
            if (commentOption) {
              break;
            }
          }
        } catch (err) {
          // Continue to the next selector if there's an error
          console.log(`Error with selector ${selector}:`, err);
        }
      }

      // If we still don't have the option, try a more direct approach with menu items
      if (!commentOption) {
        console.log(
          "Using fallback approach to find Turn off commenting option...",
        );
        const menuItems = document.querySelectorAll('div[role="menuitem"]');
        commentOption = Array.from(menuItems).find(
          (item) =>
            item.textContent.toLowerCase().includes("turn off commenting") ||
            item.textContent.toLowerCase().includes("commenting"),
        );
      }

      if (!commentOption) {
        console.error("Turn off commenting option not found in menu");

        // Attempt to close the menu to avoid leaving it open
        const closeButton = document.querySelector(
          'div[aria-label="Close"][role="button"]',
        );
        if (closeButton) {
          closeButton.click();
        }

        return false;
      }

      console.log("Found 'Turn off commenting' option, clicking...");
      commentOption.click();

      // Wait for the confirmation dialog (if any) and confirm
      await sleep(1);

      // Some versions of Facebook show a confirmation dialog
      const confirmButton =
        document.querySelector('div[role="button"]:contains("Confirm")') ||
        document.querySelector('div[role="button"]:contains("Turn Off")');

      if (confirmButton) {
        console.log("Found confirmation dialog, confirming...");
        confirmButton.click();
      }

      console.log("Comments successfully disabled");
      return true;
    } catch (error) {
      console.error("Error while disabling comments:", error);
      return false;
    }
  }

  async function addFirstComment(commentText) {
    try {
      console.log("Attempting to add first comment:", commentText);

      // Give the post a moment to fully render after posting
      await sleep(2);

      // Step 1: Find and click the "Leave a comment" button
      console.log("Looking for 'Leave a comment' button...");

      // Try to find by exact aria-label first
      let commentButton = document.querySelector(
        'div[aria-label="Leave a comment"]',
      );

      // If not found, try other variations
      if (!commentButton) {
        commentButton = document.querySelector(
          'div[aria-label*="comment"][role="button"]',
        );
      }

      // If still not found, look for any element containing "Comment" text
      if (!commentButton) {
        const buttons = Array.from(
          document.querySelectorAll('[role="button"]'),
        );
        commentButton = buttons.find(
          (btn) =>
            btn.textContent.toLowerCase().includes("comment") &&
            !btn.textContent.toLowerCase().includes("turn off"),
        );
      }

      if (!commentButton) {
        console.error("Comment button not found");
        return false;
      }

      console.log("Found 'Leave a comment' button, clicking...");
      commentButton.click();
      await sleep(1.5);

      // Step 2: Now find the comment input field that should be visible
      console.log("Looking for comment input field...");

      // Look for contenteditable divs
      let commentInput = document.querySelector(
        '.notranslate[contenteditable="true"][role="textbox"]',
      );

      // If not found by that selector, try other options
      if (!commentInput) {
        commentInput = document.querySelector(
          'div[contenteditable="true"][aria-label*="comment" i]',
        );
      }

      // Last resort - any contenteditable in the visible area
      if (!commentInput) {
        const contentEditables = document.querySelectorAll(
          '[contenteditable="true"]',
        );
        // Find the most visible one
        for (const editable of contentEditables) {
          if (isElementVisible(editable)) {
            commentInput = editable;
            break;
          }
        }
      }

      if (!commentInput) {
        console.error(
          "Comment input field not found after clicking comment button",
        );
        return false;
      }

      console.log("Found comment input field, focusing...");

      // Focus and click the comment input to ensure it's active
      commentInput.focus();
      commentInput.click();
      await sleep(1);

      // Step 3: Insert the comment text
      console.log("Inserting comment text:", commentText);

      // Insert text using methods that work well with Facebook
      document.execCommand("insertText", false, commentText);

      // If text wasn't inserted, try alternate methods
      if (!commentInput.textContent.includes(commentText)) {
        commentInput.textContent = commentText;

        // Dispatch input event to simulate typing
        const inputEvent = new Event("input", { bubbles: true });
        commentInput.dispatchEvent(inputEvent);

        // Dispatch change event too
        const changeEvent = new Event("change", { bubbles: true });
        commentInput.dispatchEvent(changeEvent);
      }

      await sleep(1);

      // Step 4: Submit the comment
      console.log("Looking for comment submit button...");

      // Find the submit button (has "Comment" aria-label)
      let submitButton = document.querySelector(
        'div[aria-label="Comment"][role="button"]',
      );

      // If not found, try other common submit button patterns
      if (!submitButton) {
        // Try finding a button with specific icon path
        submitButton = document.querySelector(
          'div[role="button"] i[style*="background-position: 0px -358px"]',
        );
        if (submitButton) {
          submitButton = submitButton.closest('[role="button"]');
        }
      }

      // As a last resort, find buttons that appear next to the comment field
      if (!submitButton) {
        const buttonCandidates = Array.from(
          document.querySelectorAll('[role="button"]'),
        );
        // Look for buttons containing common submit terms
        submitButton = buttonCandidates.find((btn) => {
          const text = btn.textContent.toLowerCase();
          return (
            (text.includes("post") ||
              text.includes("send") ||
              text.includes("comment")) &&
            isElementNearCommentInput(btn, commentInput)
          );
        });
      }

      if (submitButton) {
        console.log("Found comment submit button, clicking...");
        submitButton.click();
      } else {
        // If no submit button found, try pressing Enter key
        console.log("No submit button found, trying Enter key...");
        const enterEvent = new KeyboardEvent("keydown", {
          bubbles: true,
          cancelable: true,
          keyCode: 13,
          which: 13,
          key: "Enter",
          code: "Enter",
        });

        commentInput.dispatchEvent(enterEvent);
      }

      // Wait for the comment to post
      await sleep(3);

      console.log("Comment posting attempt completed");
      return true;
    } catch (error) {
      console.error("Error adding first comment:", error);
      return false;
    }
  }

  function isElementNearCommentInput(button, input) {
    if (!button || !input) return false;

    const buttonRect = button.getBoundingClientRect();
    const inputRect = input.getBoundingClientRect();

    // Check if the button is in reasonable proximity to the input
    // This is a simple heuristic - adjust values as needed
    const horizontalProximity =
      Math.abs(buttonRect.right - inputRect.right) < 100;
    const verticalProximity = Math.abs(buttonRect.top - inputRect.bottom) < 50;

    return horizontalProximity || verticalProximity;
  }
  function isElementVisible(element) {
    if (!element) return false;

    const style = window.getComputedStyle(element);
    if (
      style.display === "none" ||
      style.visibility === "hidden" ||
      style.opacity === "0"
    ) {
      return false;
    }

    const rect = element.getBoundingClientRect();
    return (
      rect.width > 0 &&
      rect.height > 0 &&
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  // --- UNIVERSAL TAB SWITCHER (Language Agnostic v2) ---
  async function switchToDiscussionTabIfNeeded() {
    console.log("Checking tab state (Universal Method v2)...");

    const allTabs = Array.from(document.querySelectorAll('a[role="tab"]'));
    if (allTabs.length === 0) return false;

    // PRIORITY 1: Look for "Buy Sell Discussion" specific link
    let discussionTab = allTabs.find((tab) => {
      const href = (tab.getAttribute("href") || "").toLowerCase();
      // This part of the URL is constant across languages for Buy/Sell groups
      return href.includes("/buy_sell_discussion/");
    });

    // PRIORITY 2: Fallback to standard group root (for non-Buy/Sell groups)
    if (!discussionTab) {
      discussionTab = allTabs.find((tab) => {
        const href = (tab.getAttribute("href") || "").toLowerCase();
        // Standard groups just link to the group root
        if (
          href.includes("/groups/") &&
          !href.includes("/buy_sell_discussion/")
        ) {
          const cleanPath = href.split("?")[0].replace(/\/$/, "");
          const pathParts = cleanPath.split("/");
          const lastPart = pathParts[pathParts.length - 1];
          // Exclude known sub-pages
          const isSubPage = [
            "members",
            "people",
            "about",
            "media",
            "files",
            "events",
            "photos",
            "learning_content",
            "albums",
          ].includes(lastPart);
          return !isSubPage;
        }
        return false;
      });
    }

    if (discussionTab) {
      // Check if ALREADY active
      const isSelected = discussionTab.getAttribute("aria-selected") === "true";

      // Also check URL for safety (sometimes UI lags)
      const currentUrl = window.location.href;
      const isUrlMatch =
        discussionTab.href &&
        currentUrl.includes(discussionTab.getAttribute("href"));

      if (isSelected || isUrlMatch) {
        console.log("Already on Discussion/Main tab.");
        return false; // No action needed
      }

      console.log("Switching to Discussion/Main tab...", discussionTab);
      discussionTab.focus();
      await sleep(0.1);
      discussionTab.click();

      // Critical wait for React to swap the feed
      await sleep(3.5);
      return true;
    }

    return false;
  }
  // in content.js
  // ACTION: Ensure fetchVideoFromBackground handles single-chunk small videos gracefully.

  function fetchVideoFromBackground(id, mimeType) {
    return new Promise((resolve, reject) => {
      console.log(`[VideoClient] Requesting video ${id}...`);
      const port = chrome.runtime.connect({ name: "video-stream" });

      const chunks = [];
      // Default to mp4 if mimeType is missing
      const finalType = mimeType || "video/mp4";

      port.onMessage.addListener((msg) => {
        if (msg.action === "meta") {
          console.log(`[VideoClient] Metadata received. Size: ${msg.size}`);
        } else if (msg.action === "chunk") {
          const chunkData = new Uint8Array(msg.data);
          chunks.push(chunkData);
          port.postMessage({ action: "ack" });
        } else if (msg.action === "done") {
          console.log("[VideoClient] Done. Rebuilding blob...");
          const fullBlob = new Blob(chunks, { type: finalType });
          port.disconnect();
          resolve(fullBlob);
        } else if (msg.error) {
          port.disconnect();
          reject(new Error(msg.error));
        }
      });

      port.postMessage({ action: "download_video", id: id });

      // Safety timeout (e.g. 60 seconds)
      setTimeout(() => {
        if (chunks.length === 0) {
          port.disconnect();
          reject(new Error("Video download timed out"));
        }
      }, 60000);
    });
  }

  // ACTION: Update insertMediaToPost to handle stored videos
  async function insertMediaToPost(mediaItem, context = "post") {
    await sleep(1);
    const fileInput = await getFileInput(context, mediaItem);
    if (!fileInput) return;

    try {
      let blob;
      let filename;

      // --- CASE A: Stored Video (New System) ---
      if (mediaItem.type === "stored_video") {
        writeInfo(I18n.t("overlayDlVideo")); // "Downloading video..."
        blob = await fetchVideoFromBackground(mediaItem.id, mediaItem.mimeType);
        const ext = mediaItem.mimeType.includes("mp4") ? "mp4" : "mov";
        filename = `video_${Date.now()}.${ext}`;
      }
      // --- CASE B: Regular Data URI (Images) ---
      else {
        blob = dataURItoBlob(mediaItem.data);
        const ext = blob.type.split("/")[1];
        filename = `uploaded_${mediaItem.type}.${ext}`;
      }

      const file = new File([blob], filename, { type: blob.type });

      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInput.files = dataTransfer.files;

      // Don't click the input: Chrome blocks file pickers without a user gesture and Facebook
      // sometimes triggers a native picker call in its click handlers.
      fileInput.dispatchEvent(new Event("input", { bubbles: true }));
      fileInput.dispatchEvent(new Event("change", { bubbles: true }));

      // If it's a video, give it extra time to register the upload start
      if (mediaItem.type === "video" || mediaItem.type === "stored_video") {
        await sleep(5);
      } else {
        await sleep(0.5);
      }
    } catch (error) {
      console.error(`Failed to insert media:`, error);
      throw error; // Re-throw so the main loop handles the error
    }
  }

  // ***** APPEND THIS ENTIRE BLOCK TO THE END OF content.js *****

  // This listener is for the group extraction process in the temporary hidden tab.
  if (!window.groupExtractionListenerAdded) {
    window.groupExtractionListenerAdded = true;
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === "startGroupExtractionLoop") {
        console.log(
          "CONTENT SCRIPT: Received startGroupExtractionLoop message.",
        );

        const runExtraction = async () => {
          try {
            // ***** ADD TRY HERE *****
            const storedTokens = sessionStorage.getItem("fbGroupTokens");
            if (!storedTokens) {
              throw new Error(
                "Authentication tokens not found in session storage.",
              );
            }
            const tokens = JSON.parse(storedTokens);

            const makeRequest = async (docId, variables) => {
              // ... (The makeRequest function we fixed before stays exactly the same)
              const formData = new URLSearchParams();
              formData.append("fb_dtsg", tokens.fbDtsg);
              formData.append("doc_id", docId);
              formData.append("variables", JSON.stringify(variables));

              const response = await fetch(
                "https://www.facebook.com/api/graphql/",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                  },
                  body: formData.toString(),
                },
              );

              if (!response.ok) {
                throw new Error(
                  `API request failed with HTTP status: ${response.status}`,
                );
              }

              const responseText = await response.text();
              if (!responseText) {
                throw new Error("API returned an empty response.");
              }

              for (const line of responseText.split("\n")) {
                if (!line.trim()) continue;
                const cleanedLine = line.startsWith("for (;;);")
                  ? line.substring("for (;;);".length)
                  : line;
                try {
                  const parsed = JSON.parse(cleanedLine);
                  if (
                    parsed.errors &&
                    Array.isArray(parsed.errors) &&
                    parsed.errors.length > 0
                  ) {
                    const fbErrorMessage =
                      parsed.errors[0].message || "Unknown Facebook API error.";
                    throw new Error(`Facebook API Error: ${fbErrorMessage}`);
                  }
                  if (parsed.data) {
                    return parsed;
                  }
                } catch (e) {
                  // Ignore non-JSON lines
                }
              }
              throw new Error(
                "Could not find a valid data object in the API response. The response format might have changed.",
              );
            };

            let allGroups = [];
            const initialDocId = "7740459739385247";
            const initialVariables = { ordering: ["viewer_added"], scale: 1 };
            const initialResponse = await makeRequest(
              initialDocId,
              initialVariables,
            );
            const groupsTab = initialResponse.data?.viewer?.groups_tab;
            if (!groupsTab)
              throw new Error(
                "Could not find `data.viewer.groups_tab` in the API response.",
              );
            if (groupsTab.pinned_groups?.edges) {
              allGroups.push(
                ...groupsTab.pinned_groups.edges.map((e) => ({
                  name: e.node.name,
                  url: `https://www.facebook.com/groups/${e.node.id}`,
                })),
              );
            }
            if (groupsTab.tab_groups_list?.edges) {
              allGroups.push(
                ...groupsTab.tab_groups_list.edges.map((e) => ({
                  name: e.node.name,
                  url: `https://www.facebook.com/groups/${e.node.id}`,
                })),
              );
            }
            let hasNextPage =
              groupsTab.tab_groups_list?.page_info?.has_next_page || false;
            let cursor =
              groupsTab.tab_groups_list?.page_info?.end_cursor || null;
            const paginateDocId = "7218669964900608";
            while (hasNextPage) {
              await new Promise((resolve) => setTimeout(resolve, 300));
              const paginateVariables = {
                count: 10,
                cursor,
                ordering: ["viewer_added"],
                scale: 1,
              };
              const paginatedResponse = await makeRequest(
                paginateDocId,
                paginateVariables,
              );
              const paginatedList =
                paginatedResponse.data?.viewer?.groups_tab?.tab_groups_list;
              if (paginatedList?.edges) {
                allGroups.push(
                  ...paginatedList.edges.map((e) => ({
                    name: e.node.name,
                    url: `https://www.facebook.com/groups/${e.node.id}`,
                  })),
                );
              }
              hasNextPage = paginatedList?.page_info?.has_next_page || false;
              cursor = paginatedList?.page_info?.end_cursor || null;
            }

            // On success, send the data back
            chrome.runtime.sendMessage({
              action: "finalGroupListFromContentScript",
              success: true,
              data: allGroups,
            });
          } catch (error) {
            // ***** ADD CATCH HERE *****
            // On ANY error inside the try block, send a failure message back
            console.error(
              "CONTENT SCRIPT: Error during extraction loop:",
              error,
            );
            chrome.runtime.sendMessage({
              action: "finalGroupListFromContentScript",
              success: false,
              error: error.message, // Send the specific error message
            });
          }
        };

        runExtraction();
        return true; // Indicate we will respond asynchronously
      }
    });
  }
}
function disableUnloadPrompt() {
  console.log("Proactively disabling 'beforeunload' prompt.");
  // By setting this to null, we remove any listener Facebook has attached.
  window.onbeforeunload = null;
}
function isElementVisible(element) {
  if (!element) return false;
  // offsetParent is unreliable for `position: fixed` elements (common in FB dialogs).
  const style = window.getComputedStyle(element);
  if (
    style.display === "none" ||
    style.visibility === "hidden" ||
    style.opacity === "0"
  ) {
    return false;
  }
  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}
