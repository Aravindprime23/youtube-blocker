let viewCount = 0;
const today = new Date().toDateString();
chrome.storage.local.get(['viewCount', 'lastViewDate'], function(result) {
    const lastViewDate = result.lastViewDate || '';  // Default to an empty string if undefined
    const storedViewCount = result.viewCount || 0;   // Default to 0 if undefined

    if (lastViewDate === today) {
        viewCount = storedViewCount;
    } else {
        viewCount = 0;
        chrome.storage.local.set({ 'viewCount': viewCount, 'lastViewDate': today });
    }

    console.log('Initial viewCount:', viewCount);  // Log initial view count
});

chrome.webNavigation.onHistoryStateUpdated.addListener(function(details) {
    if (details.url.includes('youtube.com/watch')) {
        viewCount++;
        console.log(`YouTube Video Count: ${viewCount}`);
        chrome.storage.local.set({ 'viewCount': viewCount, 'lastViewDate': today });

        if (viewCount >= 10) {
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {action: "block"});
            });
        }
    }
});
