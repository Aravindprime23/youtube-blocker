let viewCount = 0;
let viewLimit = 10; // Default limit
let watchedVideos = [];
let watchTime = 0; // Time spent watching videos today (in minutes)
let timeLimit = 30; // Default time limit in minutes
let videoStartTime = null; // Track when a video starts
let currentVideoId = null; // Track current video
const today = new Date().toDateString();

// Load stored values from local storage
chrome.storage.local.get(
  ["viewCount", "lastViewDate", "videoLimit", "timeLimit", "watchTime", "watchedVideos"],
  function (result) {
    const lastViewDate = result.lastViewDate || "";
    viewCount = result.viewCount || 0;
    viewLimit = result.videoLimit || viewLimit;
    timeLimit = result.timeLimit || timeLimit;
    watchTime = result.watchTime || 0;
    watchedVideos = result.watchedVideos || [];

    // Reset view count, watch time, and watched videos if it's a new day
    if (lastViewDate !== today) {
      viewCount = 0;
      watchTime = 0;
      watchedVideos = [];
      chrome.storage.local.set({
        viewCount: viewCount,
        watchTime: watchTime,
        lastViewDate: today,
        watchedVideos: watchedVideos,
      });
    }

    console.log("Initial viewCount:", viewCount);
    console.log("Current viewLimit:", viewLimit);
    console.log("Current timeLimit:", timeLimit);
    console.log("Watch time today:", watchTime, "minutes");
    console.log("Watched videos:", watchedVideos);
  }
);

// Listen for messages from other scripts
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "updateLimit") {
    viewLimit = message.limit;

    // Save the new limit to storage
    chrome.storage.local.set({ videoLimit: viewLimit });
    console.log(`View limit updated to: ${viewLimit}`);
  } else if (message.action === "updateTimeLimit") {
    timeLimit = message.limit;

    // Save the new time limit to storage
    chrome.storage.local.set({ timeLimit: timeLimit });
    console.log(`Time limit updated to: ${timeLimit} minutes`);
  } else if (message.action === "resetExtension") {
    // Reset internal variables
    viewCount = 0;
    viewLimit = 10;
    timeLimit = 30;
    watchTime = 0;
    watchedVideos = [];
    videoStartTime = null;
    currentVideoId = null;

    // Save reset state to storage
    chrome.storage.local.set({
      viewCount: viewCount,
      videoLimit: viewLimit,
      timeLimit: timeLimit,
      watchTime: watchTime,
      watchedVideos: watchedVideos,
      lastViewDate: today,
    });

    console.log("Extension reset. Internal variables cleared.");
  } else if (message.action === "blockPreviews") {
    // Send a message to the content script to block YouTube previews
    chrome.tabs.sendMessage(sender.tab.id, { action: "blockPreviews" });
  } else if (message.action === "videoStarted") {
    // Track when a video starts playing
    const videoId = getBaseVideoId(message.url);
    if (videoId && videoId !== currentVideoId) {
      // Save any accumulated time from previous video
      if (currentVideoId && videoStartTime) {
        const timeWatched = (Date.now() - videoStartTime) / (1000 * 60); // Convert to minutes
        addWatchTime(timeWatched);
      }
      
      currentVideoId = videoId;
      videoStartTime = Date.now();
      console.log(`Video started: ${videoId}`);
    }
  } else if (message.action === "videoPaused") {
    // Track when a video is paused
    if (videoStartTime) {
      const timeWatched = (Date.now() - videoStartTime) / (1000 * 60); // Convert to minutes
      addWatchTime(timeWatched);
      videoStartTime = null;
      console.log(`Video paused. Time watched: ${timeWatched.toFixed(2)} minutes`);
    }
  } else if (message.action === "videoEnded") {
    // Track when a video ends
    if (videoStartTime) {
      const timeWatched = (Date.now() - videoStartTime) / (1000 * 60); // Convert to minutes
      addWatchTime(timeWatched);
      videoStartTime = null;
      currentVideoId = null;
      console.log(`Video ended. Time watched: ${timeWatched.toFixed(2)} minutes`);
    }
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

// Add watch time and check time limit
function addWatchTime(minutes) {
  if (minutes > 0) {
    watchTime += minutes;
    
    // Save updated watch time
    chrome.storage.local.set({
      watchTime: watchTime,
      lastViewDate: today,
    });
    
    console.log(`Total watch time today: ${watchTime.toFixed(2)} minutes`);
    
    // Check if time limit is exceeded
    if (watchTime >= timeLimit) {
      console.log("Time limit reached. YouTube will be blocked.");
    }
  }
}

// Check if YouTube should be blocked
function shouldBlockYoutube(videoUrl) {
  const baseVideoId = getBaseVideoId(videoUrl);
  
  // Block if video limit exceeded and it's a new video
  if (viewCount >= viewLimit && !watchedVideos.includes(baseVideoId)) {
    return true;
  }
  
  // Block if time limit exceeded
  if (watchTime >= timeLimit) {
    return true;
  }
  
  return false;
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
        watchTime: watchTime,
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
    if (!shouldBlockYoutube(details.url)) {
      updateViewCount(details.url);
    } else {
      console.log("Blocking YouTube due to exceeded limits.");
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
      shouldBlockYoutube(details.url)
    ) {
      console.log(`Blocking YouTube URL: ${details.url}`);
      chrome.tabs.update(details.tabId, {
        url: chrome.runtime.getURL("blocked.html"),
      });
    } else {
      console.log(`Allowing URL: ${details.url}`);
    }
  } catch (error) {
    console.error("Error parsing URL:", error);
  }
});
