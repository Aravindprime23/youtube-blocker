document.addEventListener("DOMContentLoaded", function () {
    const videoListContainer = document.getElementById("videoList");
  
    // Get today's date as a string
    const today = new Date().toDateString();
  
    // Load the watched videos and view limit from storage
    chrome.storage.local.get(["watchedVideos", "lastViewDate", "videoLimit"], function (result) {
      const watchedVideos = result.watchedVideos || [];
      const lastViewDate = result.lastViewDate || "";
      const viewLimit = result.videoLimit || 10; // Default to 10 if not set
  
      // Check if today's watch history is available
      if (lastViewDate !== today) {
        videoListContainer.innerHTML = "<p>No videos watched today.</p>";
        return;
      }
  
      // Limit the number of displayed videos to the view limit
      const videosToDisplay = watchedVideos.slice(0, viewLimit);
  
      if (videosToDisplay.length === 0) {
        videoListContainer.innerHTML = "<p>No videos watched today.</p>";
        return;
      }
  
      // Embed each watched video up to the view limit
      videosToDisplay.forEach(videoId => {
        const videoItem = document.createElement("div");
        videoItem.classList.add("video-item");
        
        videoItem.innerHTML = `
          <iframe 
            src="https://www.youtube.com/embed/${videoId}" 
            allow="autoplay; encrypted-media" 
            allowfullscreen>
          </iframe>
          <div class="video-title">Video ID: ${videoId}</div>
        `;
        
        videoListContainer.appendChild(videoItem);
      });
  
      console.log(`Displayed up to ${viewLimit} videos from today's watch history.`);
    });
  });
  