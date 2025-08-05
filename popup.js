document.addEventListener("DOMContentLoaded", function () {
  const settingsButton = document.getElementById("settingsButton");
  const resetExtensionButton = document.getElementById("resetExtensionButton");
  const incrementViewCountButton = document.getElementById(
    "incrementViewCountButton"
  );
  const clearWatchedVideosButton = document.getElementById(
    "clearWatchedVideosButton"
  );
  const showCurrentStateButton = document.getElementById(
    "showCurrentStateButton"
  );
  const limitInfo = document.getElementById("limitInfo");

  // Load initial limits and counts from storage
  chrome.storage.local.get(["videoLimit", "timeLimit", "viewCount", "watchTime"], function (result) {
    const videoLimit = result.videoLimit || 10; // Default to 10 if not set
    const timeLimit = result.timeLimit || 30; // Default to 30 minutes if not set
    const viewCount = result.viewCount || 0;
    const watchTime = result.watchTime || 0;

    if (typeof result.videoLimit !== "undefined" && typeof result.timeLimit !== "undefined") {
      limitInfo.textContent = `Limits: ${videoLimit} videos or ${timeLimit} minutes.`;
    } else if (typeof result.videoLimit !== "undefined") {
      limitInfo.textContent = `Your daily video limit is set to ${videoLimit}.`;
    } else if (typeof result.timeLimit !== "undefined") {
      limitInfo.textContent = `Your daily time limit is set to ${timeLimit} minutes.`;
    } else {
      limitInfo.textContent = "You can set your daily video or time limit.";
    }

    updateUI(viewCount, videoLimit, watchTime, timeLimit);
  });

  // Function to update the UI
  function updateUI(viewCount, videoLimit, watchTime, timeLimit) {
    document.getElementById("count").textContent = viewCount;
    const remainingCount = Math.max(videoLimit - viewCount, 0);
    document.getElementById("remainingCount").textContent = remainingCount;

    // Calculate progress based on both video count and time
    const videoProgressPercent = (viewCount / videoLimit) * 100;
    const timeProgressPercent = (watchTime / timeLimit) * 100;
    
    // Use the higher progress percentage to show overall progress
    const overallProgress = Math.max(videoProgressPercent, timeProgressPercent);
    
    document.querySelector(".progress-bar-fill").style.width =
      Math.min(overallProgress, 100) + "%";
      
    // Update the remaining count text to show time if applicable
    if (typeof timeLimit !== "undefined" && timeLimit > 0) {
      const remainingTime = Math.max(timeLimit - watchTime, 0);
      const remainingText = `${remainingCount} videos / ${remainingTime.toFixed(0)} min`;
      document.querySelector(".remaining p").textContent = "Remaining";
      document.getElementById("remainingCount").textContent = remainingText;
      document.getElementById("remainingCount").style.fontSize = "18px"; // Smaller font for longer text
    }
  }

  // Always show the settings button
  settingsButton.style.display = "block";

  // Open settings page when the settings button is clicked
  settingsButton.addEventListener("click", function () {
    chrome.runtime.openOptionsPage();
  });

  // Reset extension when the reset button is clicked
  if (resetExtensionButton) {
    resetExtensionButton.addEventListener("click", function () {
      chrome.storage.local.clear(function () {
        const defaultVideoLimit = 10; // Set default reset limit to 10
        const defaultTimeLimit = 30; // Set default time limit to 30 minutes
        chrome.storage.local.set(
          {
            viewCount: 0,
            videoLimit: defaultVideoLimit,
            timeLimit: defaultTimeLimit,
            watchTime: 0,
            watchedVideos: [],
          },
          function () {
            limitInfo.textContent =
              "Extension has been reset. You can set new daily limits.";
            updateUI(0, defaultVideoLimit, 0, defaultTimeLimit);

            // Notify background script to reset internal variables
            chrome.runtime.sendMessage({ action: "resetExtension" });

            // Reload active YouTube tabs to unblock them after reset
            chrome.tabs.query({ url: "*://*.youtube.com/*" }, function (tabs) {
              tabs.forEach((tab) => {
                chrome.tabs.reload(tab.id);
              });
            });
          }
        );
      });
    });
  }

  // Increment view count button (for testing)
  if (incrementViewCountButton) {
    incrementViewCountButton.addEventListener("click", function () {
      chrome.storage.local.get(["viewCount", "videoLimit", "watchTime", "timeLimit"], function (result) {
        let newViewCount = (result.viewCount || 0) + 1;
        const videoLimit = result.videoLimit || 10;
        const watchTime = result.watchTime || 0;
        const timeLimit = result.timeLimit || 30;

        chrome.storage.local.set({ viewCount: newViewCount }, function () {
          console.log(`View count incremented. New count: ${newViewCount}`);
          updateUI(newViewCount, videoLimit, watchTime, timeLimit);
        });
      });
    });
  }

  // Clear watched videos button (for testing)
  if (clearWatchedVideosButton) {
    clearWatchedVideosButton.addEventListener("click", function () {
      chrome.storage.local.set({ watchedVideos: [] }, function () {
        console.log("Watched videos cleared.");
      });
    });
  }

  // Show current state button (for testing)
  if (showCurrentStateButton) {
    showCurrentStateButton.addEventListener("click", function () {
      chrome.storage.local.get(
        ["viewCount", "videoLimit", "timeLimit", "watchTime", "watchedVideos"],
        function (result) {
          console.log("Current State:");
          console.log("View Count:", result.viewCount || 0);
          console.log("View Limit:", result.videoLimit || 10);
          console.log("Time Limit:", result.timeLimit || 30, "minutes");
          console.log("Watch Time:", result.watchTime || 0, "minutes");
          console.log("Watched Videos:", result.watchedVideos || []);
        }
      );
    });
  }
});
