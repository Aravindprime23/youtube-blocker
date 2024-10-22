let viewCount = 0;
let viewLimit = 10; // Default limit
let maxArraySize = viewLimit;
let watchedVideos = [];
const today = new Date().toDateString();

// Load stored values from local storage
chrome.storage.local.get(
  ["viewCount", "lastViewDate", "videoLimit", "watchedVideos"],
  function (result) {
    const lastViewDate = result.lastViewDate || "";
    const storedViewCount = result.viewCount || 0;
    const storedViewLimit = result.videoLimit || viewLimit;
    const storedWatchedVideos = result.watchedVideos || [];

    // Set the current view limit and max array size
    viewLimit = storedViewLimit;
    maxArraySize = viewLimit;
    watchedVideos = storedWatchedVideos.slice(0, maxArraySize); // Trim to max size

    // Reset view count if it's a new day
    if (lastViewDate === today) {
      viewCount = storedViewCount;
    } else {
      viewCount = 0;
      chrome.storage.local.set({ viewCount: viewCount, lastViewDate: today });
    }

    console.log("Initial viewCount:", viewCount);
    console.log("Current viewLimit (and max array size):", viewLimit);
  }
);

// Listen for messages from other scripts
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "updateLimit") {
    viewLimit = message.limit;
    maxArraySize = viewLimit;
    watchedVideos = watchedVideos.slice(0, maxArraySize); // Trim to new max size

    // Save the new limit and array size to storage
    chrome.storage.local.set({ videoLimit: viewLimit, watchedVideos: watchedVideos });

    console.log(`View limit and max array size updated to: ${viewLimit}`);
  } else if (message.action === "resetExtension") {
    // Reset internal variables
    viewCount = 0;
    viewLimit = 3;
    maxArraySize = viewLimit;
    watchedVideos = [];

    console.log("Extension reset. Internal variables cleared.");
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
function updateViewCount(tabId, videoUrl) {
  const baseVideoId = getBaseVideoId(videoUrl);
  if (!baseVideoId) return;

  if (watchedVideos.includes(baseVideoId)) {
    console.log(`Video ID ${baseVideoId} already watched.`);
    return;
  }

  // Add the video ID to the watched list if there's space
  if (watchedVideos.length < maxArraySize) {
    watchedVideos.push(baseVideoId);
    chrome.storage.local.set({ watchedVideos: watchedVideos });
    console.log(`Added video ID ${baseVideoId}. Watched videos: ${watchedVideos}`);
  } else {
    console.log(`Cannot add video ID ${baseVideoId}. Array is full.`);
  }

  // Increment the view count
  viewCount++;
  chrome.storage.local.set({ viewCount: viewCount, lastViewDate: today });
  console.log(`YouTube Video Count: ${viewCount}`);

  // Block YouTube if viewCount exceeds the limit
  if (viewCount > viewLimit) {
    console.log(`View limit exceeded. Blocking further videos.`);
    chrome.tabs.update(tabId, {
      url: chrome.runtime.getURL("blocked.html"),
    });
  }
}

// Listen for YouTube video navigation
chrome.webNavigation.onHistoryStateUpdated.addListener(function (details) {
  if (details.url.includes("youtube.com/watch")) {
    if (viewCount < viewLimit) {
      updateViewCount(details.tabId, details.url);
    } else {
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
      viewCount >= viewLimit
    ) {
      console.log(`Blocking YouTube URL: ${details.url}`);
      chrome.tabs.update(details.tabId, {
        url: chrome.runtime.getURL("blocked.html"),
      });
    } else {
      console.log(`Skipping embed or other URL: ${details.url}`);
    }
  } catch (e) {
    console.error("Error parsing URL:", e);
  }
});
