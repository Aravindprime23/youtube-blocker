document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.local.get(['viewCount'], function (result) {
        document.getElementById('count').textContent = result.viewCount || 0;
    });
});
