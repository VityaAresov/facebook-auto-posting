chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.action === "offscreen_copy") {
    const text = message.text || "";
    navigator.clipboard
      .writeText(text)
      .then(() => sendResponse({ ok: true }))
      .catch((err) =>
        sendResponse({ ok: false, error: err?.message || "Copy failed" }),
      );
    return true;
  }
});
