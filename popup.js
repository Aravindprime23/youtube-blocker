document.addEventListener("DOMContentLoaded", function () {
  const settingsButton = document.getElementById("settingsButton");
  const resetExtensionButton = document.getElementById("resetExtensionButton");
  const incrementViewCountButton = document.getElementById("incrementViewCountButton");
  const clearWatchedVideosButton = document.getElementById("clearWatchedVideosButton");
  const showCurrentStateButton = document.getElementById("showCurrentStateButton");
  const limitInfo = document.getElementById("limitInfo");

  // Load initial video limit and view count from storage
  chrome.storage.local.get(["videoLimit", "viewCount"], function (result) {
    const videoLimit = result.videoLimit || 3; // Default to 3 if not set
    const viewCount = result.viewCount || 0;

    if (typeof result.videoLimit === "undefined") {
      limitInfo.textContent = "You can set your daily video limit.";
    } else {
      limitInfo.textContent = `Your daily video limit is set to ${videoLimit}.`;
    }

    updateUI(viewCount, videoLimit);
  });

  // Function to update the UI
  function updateUI(viewCount, videoLimit) {
    document.getElementById("count").textContent = viewCount;
    const remainingCount = Math.max(videoLimit - viewCount, 0);
    document.getElementById("remainingCount").textContent = remainingCount;

    const progressPercent = (viewCount / videoLimit) * 100;
    document.querySelector(".progress-bar-fill").style.width = Math.min(progressPercent, 100) + "%";
  }

  // Always show the settings button
  settingsButton.style.display = "block";

  // Open settings page when the settings button is clicked
  settingsButton.addEventListener("click", function () {
    chrome.runtime.openOptionsPage();
  });

  // Reset extension when the reset button is clicked
  resetExtensionButton.addEventListener("click", function () {
    chrome.storage.local.clear(function () {
      const defaultLimit = 3; // Set default reset limit to 3
      chrome.storage.local.set({
        viewCount: 0,
        videoLimit: defaultLimit,
        watchedVideos: []
      }, function () {
        limitInfo.textContent = "Extension has been reset. You can set a new daily video limit.";
        updateUI(0, defaultLimit);

        // Notify background script to reset internal variables
        chrome.runtime.sendMessage({ action: "resetExtension" });

        // Reload active YouTube tabs to unblock them after reset
        chrome.tabs.query({ url: "*://*.youtube.com/*" }, function (tabs) {
          tabs.forEach(tab => {
            chrome.tabs.reload(tab.id);
          });
        });
      });
    });
  });

  // Increment view count button (for testing)
  incrementViewCountButton.addEventListener("click", function () {
    chrome.storage.local.get(["viewCount", "videoLimit"], function (result) {
      let newViewCount = (result.viewCount || 0) + 1;
      const videoLimit = result.videoLimit || 3;

      chrome.storage.local.set({ viewCount: newViewCount }, function () {
        console.log(`View count incremented. New count: ${newViewCount}`);
        updateUI(newViewCount, videoLimit);
      });
    });
  });

  // Clear watched videos button (for testing)
  clearWatchedVideosButton.addEventListener("click", function () {
    chrome.storage.local.set({ watchedVideos: [] }, function () {
      console.log("Watched videos cleared.");
    });
  });

  // Show current state button (for testing)
  showCurrentStateButton.addEventListener("click", function () {
    chrome.storage.local.get(["viewCount", "videoLimit", "watchedVideos"], function (result) {
      console.log("Current State:");
      console.log("View Count:", result.viewCount || 0);
      console.log("View Limit:", result.videoLimit || 3);
      console.log("Watched Videos:", result.watchedVideos || []);
    });
  });
});
