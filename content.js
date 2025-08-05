chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "block") {
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.zIndex = 9999;
    overlay.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.color = "white";
    overlay.style.fontSize = "24px";
    overlay.textContent = "You have reached your daily limit.";
    document.body.appendChild(overlay);
  }
});

// Track video events for time limit functionality
let currentVideo = null;

function trackVideoEvents() {
  const video = document.querySelector('video');
  if (video && video !== currentVideo) {
    currentVideo = video;
    
    // Video started/loaded
    video.addEventListener('loadstart', () => {
      chrome.runtime.sendMessage({
        action: "videoStarted",
        url: window.location.href
      });
    });
    
    // Video played
    video.addEventListener('play', () => {
      chrome.runtime.sendMessage({
        action: "videoStarted",
        url: window.location.href
      });
    });
    
    // Video paused
    video.addEventListener('pause', () => {
      chrome.runtime.sendMessage({
        action: "videoPaused",
        url: window.location.href
      });
    });
    
    // Video ended
    video.addEventListener('ended', () => {
      chrome.runtime.sendMessage({
        action: "videoEnded",
        url: window.location.href
      });
    });
    
    console.log("Video event listeners attached for time tracking");
  }
}

// Remove video previews
const disableVideoPreviews = () => {
  const hoverPreviews = document.querySelectorAll("ytd-video-preview, .ytd-video-preview");
  
  hoverPreviews.forEach((preview) => {
    preview.remove();
  });
};

// Continuously observe the page for dynamic content changes and remove previews
const observer = new MutationObserver(() => {
  disableVideoPreviews();
  trackVideoEvents(); // Also track video events when DOM changes
});

observer.observe(document.body, { childList: true, subtree: true });

// Initial call to set up video tracking
trackVideoEvents();

console.log("YouTube previews are blocked and video time tracking is enabled.");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "blockPreviews") {
    disableVideoPreviews();
  }
});
