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
                            const imageUrl = `data:image/png;base64,${res.body}`;
                            console.log('Image URL:', imageUrl);
                            sendResponse({ success: true, imageUrl: imageUrl });
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
// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//     console.log('Tab activated:', changeInfo);
//     chrome.debugger.attach({ tabId: tabId }, '1.0', (error?: chrome.runtime.LastError) => {
//         if (error) {
//             console.error('Debugger attach failed:', error);
//             return;
//         }
//         console.log('Debugger attached');
//         chrome.debugger.sendCommand({ tabId: tabId }, 'Network.enable', {}, () => {
//             console.log('Network enabled');
//             chrome.debugger.onEvent.addListener((debuggeeId, message, params) => {
//                 if (message === 'Network.requestWillBeSent') {
//                     const event = params as NetworkRequestWillBeSentEvent;
//                     const requestId = event.requestId;
//                     const requestUrl = event.request.url;
//                     // リクエストID をストレージに保存または他の方法で使用
//                     checkedUrls.push(new requestIdUrl(requestUrl, requestId));
//                 }
//             });
//         });
//     });
// });
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
        const tabId = tabs[0].id;
        chrome.debugger.attach({ tabId: tabId }, '1.0', (error) => {
            if (error) {
                console.error('Debugger attach failed:', error);
                return;
            }
            console.log('Debugger attached');
            chrome.debugger.sendCommand({ tabId: tabId }, 'Network.enable', {}, () => {
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
