document.addEventListener("DOMContentLoaded", function () {
    const settingsButton = document.getElementById("settingsButton");
    const limitInfo = document.getElementById("limitInfo"); // Ensure you have this element in your HTML.
    
    // Check if a limit has already been set
    chrome.storage.local.get(["videoLimit"], function (result) {
        if (result.videoLimit) {
            // If the limit is already set, hide the settings button
            settingsButton.style.display = "none"; // Hide the button
            limitInfo.textContent = `Your daily video limit is set to ${result.videoLimit}.`; // Show saved limit
        } else {
            limitInfo.textContent = "You can set your daily video limit.";
        }

        // Update the view count and remaining videos
        chrome.storage.local.get(["viewCount"], function (countResult) {
            const viewCount = countResult.viewCount || 0;
            document.getElementById("count").textContent = viewCount;

            const remainingCount = (result.videoLimit || 10) - viewCount; // Calculate remaining videos
            document.getElementById("remainingCount").textContent = remainingCount;

            // Calculate progress percentage and update progress bar
            const progressPercent = (viewCount / (result.videoLimit || 10)) * 100;
            document.querySelector(".progress-bar-fill").style.width = progressPercent + "%";
        });
    });

    // Open settings page when the button is clicked
    settingsButton.addEventListener("click", function () {
        chrome.runtime.openOptionsPage(); // Open the settings/options page
    });
});
