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
      if (result.videoLimit) {
          videoLimitSet = true;
          statusMessage.textContent = `Permanent video limit set to ${result.videoLimit}. It cannot be changed.`;
          limitForm.classList.add("hidden");
      } else if (result.timeLimit) {
          timeLimitSet = true;
          statusMessage.textContent = `Permanent time limit set to ${result.timeLimit} minutes. It cannot be changed.`;
          timeLimitForm.classList.add("hidden");
      } else {
          statusMessage.textContent = "Please set your permanent limit.";
      }
  });

  // Switch to Video Limit tab
  videoTab.addEventListener("click", function () {
      videoTab.classList.add("active");
      timeTab.classList.remove("active");
      
      if (videoLimitSet) {
          statusMessage.textContent = `Permanent video limit is set and cannot be changed.`;
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
          statusMessage.textContent = `Permanent time limit is set and cannot be changed.`;
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
              statusMessage.textContent = `Permanent video limit set to ${videoLimit}. It cannot be changed.`;
              limitForm.classList.add("hidden");
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
              statusMessage.textContent = `Permanent time limit set to ${timeLimit} minutes. It cannot be changed.`;
              timeLimitForm.classList.add("hidden");
          });
      } else {
          statusMessage.textContent = `Time limit is already set and cannot be changed.`;
      }
  });
});
