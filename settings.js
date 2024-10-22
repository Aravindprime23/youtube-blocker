document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("limitForm");
    const statusMessage = document.getElementById("statusMessage");
  
    // Check if a limit has already been set
    chrome.storage.local.get(["videoLimit"], function (result) {
      if (result.videoLimit) {
        statusMessage.textContent = `Your daily video limit is already set to ${result.videoLimit}. You cannot change it.`;
        form.style.display = 'none'; // Hide the form once the limit is set
      }
    });
  
    // Set the video limit if not already set
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const videoLimit = document.getElementById("videoLimit").value;
  
      chrome.storage.local.get(["videoLimit"], function (result) {
        if (!result.videoLimit) {
          // Store the limit in local storage
          chrome.storage.local.set({ videoLimit: parseInt(videoLimit) }, function () {
            statusMessage.textContent = `Your daily video limit is set to ${videoLimit}.`;
            form.style.display = 'none'; // Hide the form after setting the limit
  
            // Send a message to background.js to update the limit
            chrome.runtime.sendMessage({ action: "updateLimit", limit: parseInt(videoLimit) });
          });
        } else {
          // Prevent resetting the limit
          statusMessage.textContent = `You already set the limit to ${result.videoLimit}. You cannot change it.`;
        }
      });
    });
  });
  