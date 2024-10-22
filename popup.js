document.addEventListener("DOMContentLoaded", function () {
    const settingsButton = document.getElementById("settingsButton");
    const incrementButton = document.getElementById("incrementViewCountButton");
    const resetButton = document.getElementById("resetViewCountButton");
    const showStatsButton = document.getElementById("showStatsButton");
    const resetLimitButton = document.getElementById("resetLimitButton");
    const limitInfo = document.getElementById("limitInfo");
  
    // Load initial video limit and view count from storage
    chrome.storage.local.get(["videoLimit", "viewCount"], function (result) {
      const videoLimit = result.videoLimit;
      const viewCount = result.viewCount || 0;
  
      // Check if a video limit is set
      if (videoLimit) {
        limitInfo.textContent = `Your daily video limit is set to ${videoLimit}.`;
        settingsButton.style.display = "none"; // Hide settings button if limit is set
        console.log("Limit is set. Settings button hidden.");
      } else {
        limitInfo.textContent = "You can set your daily video limit.";
        settingsButton.style.display = "block"; // Show settings button if no limit is set
        console.log("Limit not set. Settings button displayed.");
      }
  
      // Update the UI with initial values
      updateUI(viewCount, videoLimit || 10);
    });
  
    // Function to update the UI
    function updateUI(viewCount, videoLimit) {
      document.getElementById("count").textContent = viewCount;
      const remainingCount = Math.max(videoLimit - viewCount, 0);
      document.getElementById("remainingCount").textContent = remainingCount;
  
      // Update progress bar
      const progressPercent = (viewCount / videoLimit) * 100;
      document.querySelector(".progress-bar-fill").style.width = Math.min(progressPercent, 100) + "%";
  
      // Log UI state
      console.log(`UI Updated: View Count = ${viewCount}, Remaining = ${remainingCount}, Limit = ${videoLimit}`);
    }
  
    // Open settings page when the settings button is clicked
    settingsButton.addEventListener("click", function () {
      chrome.runtime.openOptionsPage(); // Open the settings/options page
      console.log("Opened settings page.");
    });
      });
  