let viewCount = 0;
let viewLimit = 10; // Default limit
const today = new Date().toDateString();
let watchedVideos = [];

// Load stored values from local storage
chrome.storage.local.get(["viewCount", "lastViewDate", "videoLimit", "watchedVideos"], function (result) {
  const lastViewDate = result.lastViewDate || "";
  const storedViewCount = result.viewCount || 0;
  const storedViewLimit = result.videoLimit || viewLimit;
  const storedWatchedVideos = result.watchedVideos || [];

  viewLimit = storedViewLimit;
  watchedVideos = storedWatchedVideos;

  if (lastViewDate === today) {
    viewCount = storedViewCount;
  } else {
    viewCount = 0;
    chrome.storage.local.set({ viewCount: viewCount, lastViewDate: today });
  }
  console.log("Initial viewCount:", viewCount);
  console.log("Current viewLimit:", viewLimit);
});

// Listen for messages from other scripts
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "updateLimit") {
    viewLimit = message.limit;
    console.log(`View limit updated to: ${viewLimit}`);
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

  // Add the video ID to the watched list
  watchedVideos.push(baseVideoId);
  chrome.storage.local.set({ watchedVideos: watchedVideos });

  // Increment the view count
  viewCount++;
  chrome.storage.local.set({ viewCount: viewCount, lastViewDate: today });
  console.log(`YouTube Video Count: ${viewCount}`);

  // Block YouTube if viewCount exceeds (viewLimit + 1)
  if (viewCount > viewLimit) {
    chrome.tabs.update(tabId, {
      url: chrome.runtime.getURL("blocked.html"),
    });
  }
}

// Listen for YouTube video navigation
chrome.webNavigation.onHistoryStateUpdated.addListener(function (details) {
  if (details.url.includes("youtube.com/watch")) {
    updateViewCount(details.tabId, details.url);
  }
});

// Block YouTube access immediately if the limit is exceeded
chrome.webNavigation.onBeforeNavigate.addListener(function (details) {
  if (details.url.includes("https://www.youtube.com") && viewCount > viewLimit) {
    chrome.tabs.update(details.tabId, {
      url: chrome.runtime.getURL("blocked.html"),
    });
  }
});
