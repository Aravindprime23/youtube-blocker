let viewCount = 0;
let viewLimit = 10; // Default limit
let watchedVideos = [];
const today = new Date().toDateString();

// Load stored values from local storage
chrome.storage.local.get(
  ["viewCount", "lastViewDate", "videoLimit", "watchedVideos"],
  function (result) {
    const lastViewDate = result.lastViewDate || "";
    viewCount = result.viewCount || 0;
    viewLimit = result.videoLimit || viewLimit;
    watchedVideos = result.watchedVideos || [];

    // Reset view count and watched videos if it's a new day
    if (lastViewDate !== today) {
      viewCount = 0;
      watchedVideos = [];
      chrome.storage.local.set({
        viewCount: viewCount,
        lastViewDate: today,
        watchedVideos: watchedVideos,
      });
    }

    console.log("Initial viewCount:", viewCount);
    console.log("Current viewLimit:", viewLimit);
    console.log("Watched videos:", watchedVideos);
  }
);

// Listen for messages from other scripts
chrome.runtime.onMessage.addListener(function (message) {
  if (message.action === "updateLimit") {
    viewLimit = message.limit;

    // Save the new limit to storage
    chrome.storage.local.set({ videoLimit: viewLimit });
    console.log(`View limit updated to: ${viewLimit}`);
  } else if (message.action === "resetExtension") {
    // Reset internal variables
    viewCount = 0;
    viewLimit = 10;
    watchedVideos = [];

    // Save reset state to storage
    chrome.storage.local.set({
      viewCount: viewCount,
      videoLimit: viewLimit,
      watchedVideos: watchedVideos,
      lastViewDate: today,
    });

    console.log("Extension reset. Internal variables cleared.");
  } else if (message.action === "blockPreviews") {
    // Send a message to the content script to block YouTube previews
    chrome.tabs.sendMessage(sender.tab.id, { action: "blockPreviews" });
  }
});

// Extract base video ID from YouTube URL
function getBaseVideoId(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.get("v");
  } catch (error) {
    console.error("Invalid URL:", error);
    return null;
  }
}

// Update view count and check the limit
function updateViewCount(videoUrl) {
  const baseVideoId = getBaseVideoId(videoUrl);
  if (!baseVideoId) return;

  if (!watchedVideos.includes(baseVideoId)) {
    if (watchedVideos.length < viewLimit) {
      watchedVideos.push(baseVideoId);
      viewCount++;

      // Save the updated state
      chrome.storage.local.set({
        watchedVideos: watchedVideos,
        viewCount: viewCount,
        lastViewDate: today,
      });

      console.log(`YouTube Video Count: ${viewCount}`);
      console.log(`Added video ID ${baseVideoId}.`);
    } else {
      console.log("View limit reached. No more videos allowed today.");
    }
  } else {
    console.log(`Video ID ${baseVideoId} already watched.`);
  }
}

// Listen for YouTube video navigation
chrome.webNavigation.onHistoryStateUpdated.addListener(function (details) {
  if (details.url.includes("youtube.com/watch")) {
    if (viewCount < viewLimit) {
      updateViewCount(details.url);
    } else if (!watchedVideos.includes(getBaseVideoId(details.url))) {
      console.log("View limit reached. Blocking YouTube.");
      chrome.tabs.update(details.tabId, {
        url: chrome.runtime.getURL("blocked.html"),
      });
    }
  }
});

// Block YouTube access immediately if the limit is exceeded
chrome.webNavigation.onBeforeNavigate.addListener(function (details) {
  try {
    const url = new URL(details.url);

    // Only block full YouTube URLs, not embedded ones
    if (
      url.hostname === "www.youtube.com" &&
      !url.pathname.startsWith("/embed") &&
      viewCount >= viewLimit &&
      !watchedVideos.includes(getBaseVideoId(details.url))
    ) {
      console.log(`Blocking YouTube URL: ${details.url}`);
      chrome.tabs.update(details.tabId, {
        url: chrome.runtime.getURL("blocked.html"),
      });
    } else {
      console.log(`Skipping embed or other URL: ${details.url}`);
    }
  } catch (error) {
    console.error("Error parsing URL:", error);
  }
});
