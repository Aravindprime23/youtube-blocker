// Function to create the blocking overlay
function createBlockingOverlay() {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.zIndex = 9999;
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.color = 'white';
    overlay.style.fontSize = '24px';
    overlay.textContent = 'You have reached your daily limit of 10 videos.';
    
    document.body.appendChild(overlay);
  }
  
  // Function to navigate to YouTube Playback & Performance settings
  function navigateToPlaybackSettings() {
    if (window.location.href !== "https://www.youtube.com/account_playback") {
      // Redirect to Playback & Performance settings page
      window.location.href = "https://www.youtube.com/account_playback";
    } else {
      // Once on the Playback settings page, disable the toggle
      disableAndRemoveVideoPreviewToggle();
    }
  }
  
  // Function to disable the video preview toggle and remove it from DOM
  function disableAndRemoveVideoPreviewToggle() {
    const observer = new MutationObserver(() => {
      // Locate the "Video Previews" toggle in Playback settings
      const videoPreviewToggle = document.querySelector(
        'tp-yt-paper-toggle-button[aria-label="Video previews"]'
      );
  
      // Check if the toggle is found and currently enabled
      if (videoPreviewToggle && videoPreviewToggle.getAttribute("aria-pressed") === "true") {
        // Turn off the toggle
        videoPreviewToggle.click();
        alert("Video previews have been disabled.");
  
        // Remove the entire toggle element from the DOM
        const toggleContainer = videoPreviewToggle.closest("ytd-settings-switch-renderer");
        if (toggleContainer) {
          toggleContainer.remove();
          console.log("Video previews toggle removed from the DOM.");
        }
  
        // Stop observing after disabling and removing the toggle
        observer.disconnect();
      }
    });
  
    // Start observing the body for changes
    observer.observe(document.body, { childList: true, subtree: true });
  }
  
  // Listen for messages from the background script
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "block") {
      // Create and display the blocking overlay
      createBlockingOverlay();
    }
  });
  
  // Ask for user confirmation before proceeding
  if (confirm("This extension will disable video previews on YouTube. Do you want to proceed?")) {
    // Redirect to Playback & Performance settings
    window.location.href = "https://www.youtube.com/account_playback";
  
    // Delay execution to allow the navigation to complete
    setTimeout(disableAndRemoveVideoPreviewToggle, 3000);
  }
  
