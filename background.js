let viewCount = 0;
let viewLimit = 10; // Default limit
const today = new Date().toDateString();
let watchedVideos = []; // Array to store watched video URLs

// Load the stored values from local storage
chrome.storage.local.get(["viewCount", "lastViewDate", "viewLimit", "watchedVideos"], function (result) {
  const lastViewDate = result.lastViewDate || ""; // Default to an empty string if undefined
  const storedViewCount = result.viewCount || 0; // Default to 0 if undefined
  const storedViewLimit = result.viewLimit || viewLimit; // Default to the initial limit if undefined
  const storedWatchedVideos = result.watchedVideos || []; // Default to empty array if undefined

  viewLimit = storedViewLimit; // Set the limit from storage
  watchedVideos = storedWatchedVideos; // Set the watched videos from storage

  if (lastViewDate === today) {
    viewCount = storedViewCount;
  } else {
    viewCount = 0;
    chrome.storage.local.set({ viewCount: viewCount, lastViewDate: today });
  }

  console.log("Initial viewCount:", viewCount); // Log initial view count
  console.log("Current viewLimit:", viewLimit); // Log current limit
});

// Function to extract base video ID from YouTube URL
function getBaseVideoId(url) {
  const urlObj = new URL(url);
  return urlObj.searchParams.get("v"); // Extract the 'v' parameter from the URL
}

// Function to update view count and check the limit
function updateViewCount(tabId, videoUrl) {
  const baseVideoId = getBaseVideoId(videoUrl);

  // Check if the video ID is already in the watched list
  if (watchedVideos.includes(baseVideoId)) {
    console.log(`Video ID ${baseVideoId} is already watched, count will not increase.`);
    return; // Do not increase the count
  }

  // Add the video ID to the watched list
  watchedVideos.push(baseVideoId);
  chrome.storage.local.set({ watchedVideos: watchedVideos });

  viewCount++;
  chrome.storage.local.set({ viewCount: viewCount, lastViewDate: today });
  console.log(`YouTube Video Count: ${viewCount}`);
  console.log(watchedVideos);

  // Check if the view count exceeds the dynamic limit
  if (viewCount > viewLimit) {
    chrome.tabs.update(tabId, {
      url: chrome.runtime.getURL("blocked.html"),
    });
  }
}

// Function to change the dynamic limit
function changeViewLimit(newLimit) {
  viewLimit = newLimit;
  chrome.storage.local.set({ viewLimit: newLimit });
  console.log(`New view limit set to: ${viewLimit}`);
}

// Example: Change the limit to 5 (this could be triggered by user input
changeViewLimit(10);

// Listen for URL changes to a YouTube video
chrome.webNavigation.onHistoryStateUpdated.addListener(function (details) {
  if (details.url.includes("youtube.com/watch")) {
    updateViewCount(details.tabId, details.url);
  }
});

// Also listen for page navigation to block immediately if the view count is exceeded
chrome.webNavigation.onBeforeNavigate.addListener(function (details) {
  if (
    (details.url.includes("https://www.youtube.com") && viewCount > viewLimit) ||
    details.url.includes("youtube.com/watch")
  ) {
    chrome.tabs.update(details.tabId, {
      url: chrome.runtime.getURL("blocked.html"),
    });
  }
});
