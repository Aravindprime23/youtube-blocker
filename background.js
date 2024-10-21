let viewCount = 0;
const today = new Date().toDateString();

chrome.storage.local.get(["viewCount", "lastViewDate", "videoLimit"], function (result) {
    const lastViewDate = result.lastViewDate || ""; 
    const storedViewCount = result.viewCount || 0;
    const videoLimit = result.videoLimit || 3;  // Default to 3 if no limit is set

    if (lastViewDate === today) {
        viewCount = storedViewCount;
    } else {
        viewCount = 0;
        chrome.storage.local.set({ viewCount: viewCount, lastViewDate: today });
    }

    // Function to update view count and check limit
    function updateViewCount(tabId) {
        viewCount++;
        chrome.storage.local.set({ viewCount: viewCount, lastViewDate: today });

        // Check if the view count exceeds the limit
        if (viewCount >= videoLimit) {
            chrome.tabs.update(tabId, {
                url: chrome.runtime.getURL("blocked.html"),
            });
        }
    }

    // Listen for URL changes to YouTube videos
    chrome.webNavigation.onHistoryStateUpdated.addListener(function (details) {
        if (details.url.includes("youtube.com/watch")) {
            updateViewCount(details.tabId);
        }
    });

    // Listen for page navigation to block immediately if the limit is exceeded
    chrome.webNavigation.onBeforeNavigate.addListener(function (details) {
        if (
            (details.url.includes("https://www.youtube.com") && viewCount >= videoLimit) ||
            details.url.includes("youtube.com/watch")
        ) {
            chrome.tabs.update(details.tabId, {
                url: chrome.runtime.getURL("blocked.html"),
            });
        }
    });
});
