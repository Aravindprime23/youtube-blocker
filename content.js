chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "block") {
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
});
