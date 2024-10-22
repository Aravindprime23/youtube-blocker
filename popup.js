document.addEventListener("DOMContentLoaded", function () {
    const settingsButton = document.getElementById("settingsButton");
    const incrementButton = document.getElementById("incrementViewCountButton");
    const resetButton = document.getElementById("resetViewCountButton");
    const setLimitButton = document.getElementById("setLimitButton");
    const openBlockedPageButton = document.getElementById("openBlockedPageButton");
    const limitInfo = document.getElementById("limitInfo");
  
    // Check if a limit has already been set
    chrome.storage.local.get(["videoLimit"], function (result) {
      const videoLimit = result.videoLimit || 10;
  
      if (result.videoLimit) {
        settingsButton.style.display = "none"; // Hide the button if limit is set
        limitInfo.textContent = `Your daily video limit is set to ${videoLimit}.`; // Display the saved limit
      } else {
        limitInfo.textContent = "You can set your daily video limit.";
      }
  
      // Update the view count and remaining videos
      chrome.storage.local.get(["viewCount"], function (countResult) {
        const viewCount = countResult.viewCount || 0;
        document.getElementById("count").textContent = viewCount;
  
        const remainingCount = Math.max(videoLimit - viewCount, 0); // Calculate remaining videos
        document.getElementById("remainingCount").textContent = remainingCount;
  
        // Calculate progress percentage and update progress bar
        const progressPercent = (viewCount / videoLimit) * 100;
        document.querySelector(".progress-bar-fill").style.width = Math.min(progressPercent, 100) + "%";
      });
    });
  
    // Open settings page when the button is clicked
    settingsButton.addEventListener("click", function () {
      chrome.runtime.openOptionsPage(); // Open the settings/options page
    });
  
    // Increment view count button (for testing)
    incrementButton.addEventListener("click", function () {
      chrome.storage.local.get(["viewCount", "videoLimit"], function (result) {
        const newViewCount = (result.viewCount || 0) + 1;
        const videoLimit = result.videoLimit || 10;
  
        // Update view count in storage
        chrome.storage.local.set({ viewCount: newViewCount }, function () {
          alert(`View count incremented. New count: ${newViewCount}`);
          document.getElementById("count").textContent = newViewCount;
  
          const remainingCount = Math.max(videoLimit - newViewCount, 0);
          document.getElementById("remainingCount").textContent = remainingCount;
  
          // Update progress bar
          const progressPercent = (newViewCount / videoLimit) * 100;
          document.querySelector(".progress-bar-fill").style.width = Math.min(progressPercent, 100) + "%";
        });
      });
    });
  
    // Reset view count button (for testing)
    resetButton.addEventListener("click", function () {
      chrome.storage.local.set({ viewCount: 0 }, function () {
        alert("View count reset to 0.");
        document.getElementById("count").textContent = 0;
        document.getElementById("remainingCount").textContent = 10;
  
        // Reset progress bar
        document.querySelector(".progress-bar-fill").style.width = "0%";
      });
    });
  
    // Set limit to 5 button (for testing)
    setLimitButton.addEventListener("click", function () {
      chrome.storage.local.set({ videoLimit: 5 }, function () {
        alert("Daily video limit set to 5.");
        document.getElementById("remainingCount").textContent = 5;
  
        // Update progress bar
        chrome.storage.local.get(["viewCount"], function (result) {
          const viewCount = result.viewCount || 0;
          const progressPercent = (viewCount / 5) * 100;
          document.querySelector(".progress-bar-fill").style.width = Math.min(progressPercent, 100) + "%";
        });
      });
    });
  
    // Open blocked page button (for testing)
    openBlockedPageButton.addEventListener("click", function () {
      chrome.tabs.create({ url: chrome.runtime.getURL("blocked.html") });
    });
  });
  