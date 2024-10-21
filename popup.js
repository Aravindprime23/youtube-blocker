document.addEventListener("DOMContentLoaded", function () {
    const settingsButton = document.getElementById("settingsButton");
    const limitInfo = document.getElementById("limitInfo");

    // Check if a limit has already been set
    chrome.storage.local.get(["videoLimit"], function (result) {
        if (result.videoLimit) {
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

    // Increment view count button
    document.getElementById("incrementViewCountButton").addEventListener("click", function () {
        chrome.storage.local.get(["viewCount"], function (result) {
            const newViewCount = (result.viewCount || 0) + 1;
            chrome.storage.local.set({ viewCount: newViewCount });
            alert(`View count incremented. New count: ${newViewCount}`);
            location.reload(); // Refresh to update the displayed values
        });
    });

    // Reset view count button
    document.getElementById("resetViewCountButton").addEventListener("click", function () {
        chrome.storage.local.set({ viewCount: 0 });
        alert('View count reset to 0.');
        location.reload(); // Refresh to update the displayed values
    });

    // Set limit button
    document.getElementById("setLimitButton").addEventListener("click", function () {
        chrome.storage.local.set({ videoLimit: 5 });
        alert('Daily video limit set to 5.');
        location.reload(); // Refresh to update the displayed values
    });

    // Open blocked page button
    document.getElementById("openBlockedPageButton").addEventListener("click", function () {
        chrome.tabs.create({ url: chrome.runtime.getURL("blocked.html") });
    });
});
