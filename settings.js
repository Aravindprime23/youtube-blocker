document.addEventListener("DOMContentLoaded", function () {
  const videoTab = document.getElementById("videoTab");
  const timeTab = document.getElementById("timeTab");
  const limitForm = document.getElementById("limitForm");
  const timeLimitForm = document.getElementById("timeLimitForm");
  const statusMessage = document.getElementById("statusMessage");

  let videoLimitSet = false;
  let timeLimitSet = false;

  // Check if a limit is already set and update UI accordingly
  chrome.storage.local.get(["videoLimit", "timeLimit"], function (result) {
      if (result.videoLimit && result.timeLimit) {
          videoLimitSet = true;
          timeLimitSet = true;
          statusMessage.textContent = `Both limits are set: ${result.videoLimit} videos and ${result.timeLimit} minutes. They cannot be changed.`;
          limitForm.classList.add("hidden");
          timeLimitForm.classList.add("hidden");
      } else if (result.videoLimit) {
          videoLimitSet = true;
          statusMessage.textContent = `Video limit set to ${result.videoLimit}. You can still set a time limit.`;
          limitForm.classList.add("hidden");
          document.getElementById("videoLimit").value = result.videoLimit;
      } else if (result.timeLimit) {
          timeLimitSet = true;
          statusMessage.textContent = `Time limit set to ${result.timeLimit} minutes. You can still set a video limit.`;
          timeLimitForm.classList.add("hidden");
          document.getElementById("timeLimit").value = result.timeLimit;
      } else {
          statusMessage.textContent = "Please set your daily limits.";
      }
  });

  // Switch to Video Limit tab
  videoTab.addEventListener("click", function () {
      videoTab.classList.add("active");
      timeTab.classList.remove("active");
      
      if (videoLimitSet) {
          statusMessage.textContent = `Video limit is already set and cannot be changed.`;
          limitForm.classList.add("hidden");
      } else {
          statusMessage.textContent = "Set your video limit.";
          limitForm.classList.remove("hidden");
      }
      timeLimitForm.classList.add("hidden");
  });

  // Switch to Time Limit tab
  timeTab.addEventListener("click", function () {
      timeTab.classList.add("active");
      videoTab.classList.remove("active");
      
      if (timeLimitSet) {
          statusMessage.textContent = `Time limit is already set and cannot be changed.`;
          timeLimitForm.classList.add("hidden");
      } else {
          statusMessage.textContent = "Set your time limit.";
          timeLimitForm.classList.remove("hidden");
      }
      limitForm.classList.add("hidden");
  });

  // Set permanent video limit
  limitForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const videoLimit = document.getElementById("videoLimit").value;

      // Ensure the limit is not already set
      if (!videoLimitSet) {
          chrome.storage.local.set({ videoLimit: parseInt(videoLimit) }, function () {
              videoLimitSet = true;
              statusMessage.textContent = `Video limit set to ${videoLimit}. It cannot be changed.`;
              limitForm.classList.add("hidden");
              
              // Notify background script of the new video limit
              chrome.runtime.sendMessage({ 
                action: "updateLimit", 
                limit: parseInt(videoLimit) 
              });
          });
      } else {
          statusMessage.textContent = `Video limit is already set and cannot be changed.`;
      }
  });

  // Set permanent time limit
  timeLimitForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const timeLimit = document.getElementById("timeLimit").value;

      // Ensure the limit is not already set
      if (!timeLimitSet) {
          chrome.storage.local.set({ timeLimit: parseInt(timeLimit) }, function () {
              timeLimitSet = true;
              statusMessage.textContent = `Time limit set to ${timeLimit} minutes. It cannot be changed.`;
              timeLimitForm.classList.add("hidden");
              
              // Notify background script of the new time limit
              chrome.runtime.sendMessage({ 
                action: "updateTimeLimit", 
                limit: parseInt(timeLimit) 
              });
          });
      } else {
          statusMessage.textContent = `Time limit is already set and cannot be changed.`;
      }
  });
});
