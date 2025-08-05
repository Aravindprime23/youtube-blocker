# YouTube Video Limiter

A Chrome extension that helps you limit your YouTube consumption by setting daily limits on either the number of videos you watch or the time you spend watching.

## Features

- **Video Count Limit**: Set a maximum number of videos you can watch per day (default: 10)
- **Time Limit**: Set a maximum amount of time you can spend watching YouTube per day (default: 30 minutes)
- **Dual Limiting**: You can set both limits - the extension will block YouTube when either limit is reached
- **Daily Reset**: Limits automatically reset each day
- **Watch History**: View the videos you've watched today
- **Progress Tracking**: Visual progress bar showing your usage
- **Motivational Blocking**: When limits are reached, shows an encouraging message and alternative activities

## Installation

Since this extension isn't published on the Chrome Web Store, you need to load it manually:

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in the top right)
4. Click "Load unpacked" 
5. Select the folder containing the extension files
6. The YouTube Video Limiter extension should now appear in your extensions list

## Usage

### Setting Limits
1. Click the extension icon in your browser toolbar
2. Click "Open Settings"
3. Choose between "Video Limit" or "Time Limit" tabs
4. Set your desired limit and click save
5. **Note**: Once set, limits cannot be changed (this is intentional to prevent easy bypassing)

### Monitoring Usage
- Click the extension icon to see your current progress
- View remaining videos and/or time
- Check which limit is closer to being reached

### Testing (Development)
The popup includes testing tools to:
- Increment video count manually
- Add watch time manually  
- View current state in console
- Clear watched videos list
- Reset the entire extension

### When Limits Are Reached
- YouTube will be blocked and redirect to a motivational page
- The blocking page shows which limit was reached
- You can view your watch history
- Links to productive alternatives like LeetCode

## How It Works

1. **Video Tracking**: Counts unique videos watched by tracking YouTube video IDs
2. **Time Tracking**: Monitors video play/pause/end events to calculate watch time
3. **Blocking**: Intercepts YouTube navigation and redirects when limits are exceeded
4. **Storage**: Uses Chrome's local storage to persist data across browser sessions

## Files Overview

- `manifest.json` - Extension configuration
- `background.js` - Core functionality and limit enforcement
- `content.js` - Tracks video events and removes previews
- `popup.html/js` - Extension popup interface
- `settings.html/js/css` - Settings configuration page
- `blocked.html` - Page shown when limits are reached
- `history.html/js` - Watch history viewer

## Technical Details

- Built for Chrome Manifest V3
- Uses `chrome.storage.local` for data persistence
- Implements `webNavigation` API for URL monitoring
- Uses content scripts for video event tracking
- Automatically resets daily at midnight

![Extension Screenshot](https://github.com/user-attachments/assets/54a0176c-f085-4652-8f51-8205e1f54968)
