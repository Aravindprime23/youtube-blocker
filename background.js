let viewCount = 0;
const today = new Date().toDateString();

// Load the stored values from local storage
chrome.storage.local.get(["viewCount", "lastViewDate"], function (result) {
  const lastViewDate = result.lastViewDate || ""; // Default to an empty string if undefined
  const storedViewCount = result.viewCount || 0; // Default to 0 if undefined

  if (lastViewDate === today) {
    viewCount = storedViewCount;
  } else {
    viewCount = 0;
    chrome.storage.local.set({ viewCount: viewCount, lastViewDate: today });
  }

  console.log("Initial viewCount:", viewCount); // Log initial view count
});

// Function to update view count and check the limit
function updateViewCount(tabId) {
  viewCount++;
  chrome.storage.local.set({ viewCount: viewCount, lastViewDate: today });
  console.log(`YouTube Video Count: ${viewCount}`);

  // Check if the view count exceeds the limit
  if (viewCount > 3) {
    chrome.tabs.update(tabId, {
      url: chrome.runtime.getURL("blocked.html"),
    });
  }
}

// Listen for URL changes to a YouTube video
chrome.webNavigation.onHistoryStateUpdated.addListener(function (details) {
  if (details.url.includes("youtube.com/watch")) {
    updateViewCount(details.tabId);
  }
});

// Also listen for page navigation to block immediately if the view count is exceeded
chrome.webNavigation.onBeforeNavigate.addListener(function (details) {
  if (
    (details.url.includes("https://www.youtube.com") && viewCount > 3) ||
    details.url.includes("youtube.com/watch")
  ) {
    chrome.tabs.update(details.tabId, {
      url: chrome.runtime.getURL("blocked.html"),
    });
  }
});
