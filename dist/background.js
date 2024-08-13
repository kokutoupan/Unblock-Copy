"use strict";
chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed');
});
class requestIdUrl {
    constructor(url, requestId) {
        this.url = url;
        this.requestId = requestId;
    }
}
let requestIds = new Array();
let checkedUrls = new Array();
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "downloadImage") {
        chrome.downloads.download({
            url: message.imageUrl,
            filename: message.fileName,
            saveAs: true
        });
    }
    if (message.action === 'captureImage') {
        console.log('Capture image');
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                const tabId = tabs[0].id;
                if (tabId !== undefined && requestIds) {
                    console.log('Request url:', message.requestUrl);
                    console.log('Data:', checkedUrls);
                    const matchData = checkedUrls.find((item) => { return item.url == message.requestUrl; });
                    if (!matchData) {
                        console.error('No matching data found for URL:', message.requestUrl);
                        sendResponse({ success: false, status: "No matching data found for URL" });
                        return;
                    }
                    const requestId = matchData.requestId;
                    console.log('Request true ID:', requestId);
                    chrome.debugger.sendCommand({ tabId: tabId }, 'Network.getResponseBody', { requestId: requestId }, (result) => {
                        if (chrome.runtime.lastError) {
                            console.error('Debugger command failed:', chrome.runtime.lastError);
                            sendResponse({ success: false, status: chrome.runtime.lastError });
                            return;
                        }
                        const res = result;
                        if (result && res.body) {
                            const format = getImageFormat(res.body);
                            const imageUrl = `data:image/${format};base64,${res.body}`;
                            console.log('Image URL:', imageUrl);
                            sendResponse({ success: true, imageUrl: imageUrl, format: format });
                        }
                        else {
                            console.error('No image data received.');
                            sendResponse({ success: false, status: "No image data received" });
                        }
                        // chrome.debugger.detach({ tabId: tabId });
                    });
                }
                else {
                    console.error('Tab ID or Request ID is undefined.');
                    sendResponse({ success: false });
                }
            }
            else {
                console.error('No active tab found.');
                sendResponse({ success: false });
            }
        });
        // });
        // 非同期でレスポンスを返す
        return true;
    }
});
chrome.tabs.onActivated.addListener((activeInfo) => {
    console.log('Tab activated:', activeInfo);
    chrome.debugger.attach({ tabId: activeInfo.tabId }, '1.0', (error) => {
        if (error) {
            console.error('Debugger attach failed:', error);
            return;
        }
        console.log('Debugger attached');
        chrome.debugger.sendCommand({ tabId: activeInfo.tabId }, 'Network.enable', {}, () => {
            console.log('Network enabled');
            chrome.debugger.onEvent.addListener((debuggeeId, message, params) => {
                if (message === 'Network.requestWillBeSent') {
                    const event = params;
                    const requestId = event.requestId;
                    const requestUrl = event.request.url;
                    // リクエストID をストレージに保存または他の方法で使用
                    checkedUrls.push(new requestIdUrl(requestUrl, requestId));
                }
            });
        });
    });
});
function getImageFormat(base64String) {
    const binaryString = atob(base64String);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    // ヘッダバイトを確認してフォーマットを判定
    if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
        return 'jpeg';
    }
    else if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
        return 'png';
    }
    else if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
        return 'gif';
    }
    else if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
        bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
        return 'webp';
    }
    else {
        return 'unknown';
    }
}
