document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.local.get(['viewCount'], function (result) {

        const container = document.querySelector('.container');
        const viewCount = result.viewCount || 0;
        document.getElementById('count').textContent = viewCount;

        const remainingCount = 10 - viewCount; // Calculate remaining videos
        document.getElementById('remainingCount').textContent = remainingCount;
        // Calculate progress percentage and update progress bar
        const progressPercent = (viewCount / 10) * 100; 
        document.querySelector('.progress-bar-fill').style.width = progressPercent + '%'; 

        // background color according to videos watched
        if (viewCount < remainingCount) {
            container.style.background = 'linear-gradient(to bottom right, #8d2828, #148fec)'; 
        } else if (viewCount > remainingCount) {
            container.style.background = 'linear-gradient(to bottom right, #046cb6, #f60808)'; 
        } else {
            container.style.background = 'linear-gradient(to bottom right, #046cb6, #148fec)';
        }
    });

    // (Optional) Reset button functionality
    // document.getElementById('resetButton').addEventListener('click', function() {
    //     chrome.storage.local.set({ 'viewCount': 7 });
    //     document.getElementById('count').textContent = 7;
    //     document.querySelector('.progress-bar-fill').style.width = '70%'; 
    // });
});