"use strict";
console.log("Content script running");
// document.addEventListener('DOMContentLoaded', () => {
chrome.runtime.sendMessage({ action: 'startMonitoring' });
// });
// document.addEventListener('click', (event) => {
//     // クリックされた要素またはその親要素が`div`かどうかを確認
//     let element = event.target as HTMLElement;
//     // while (element && element.tagName !== 'DIV') {
//     //   element = element.parentElement;
//     // }
//     if (element) {
//         const img = element.querySelector('img');
//         console.log("Element:", img);
//         if (img) {
//             chrome.runtime.sendMessage({ "action": "captureImage", "requestUrl": img.src }, (response) => {
//                 chrome.storage.local.get("imageUrl", (data) => {
//                     if (data.imageUrl) {
//                         console.log("Image URL:", data.imageUrl);
//                         // document.body.appendChild(document.createElement('img')).src = data.imageUrl;
//                     }
//                     else {
//                         console.log("No image found");
//                     }
//                 });
//             });
//         } else {
//             chrome.runtime.sendMessage({
//                 type: "storeClickedElement",
//                 elementHTML: element.outerHTML
//             });
//         }
//     }
// });
document.addEventListener('contextmenu', (event) => {
    let element = event.target;
    // while (element && element.tagName !== 'DIV') {
    //   element = element.parentElement;
    // }
    if (element) {
        const img = element.querySelector('img');
        console.log("Element:", img);
        if (img) {
            chrome.runtime.sendMessage({ "action": "captureImage", "requestUrl": img.src }, (response) => {
                if (response.success) {
                    console.log("Image captured", response.imageUrl);
                    chrome.runtime.sendMessage({
                        type: "downloadImage",
                        imageUrl: response.imageUrl,
                        fileName: document.title + ".png"
                    });
                }
                // chrome.storage.local.get("imageUrl", (data) => {
                //     if (data.imageUrl) {
                //         console.log("Image URL:", data.imageUrl);
                //         chrome.runtime.sendMessage({
                //             type: "downloadImage",
                //             imageUrl: data.imageUrl,
                //             fileName: document.title + ".png"
                //         });
                //         // document.body.appendChild(document.createElement('img')).src = data.imageUrl;
                //     }
                //     else {
                //         console.log("No image found");
                //     }
                // });
            });
        }
        else {
            console.log("not Image Element:", element);
        }
    }
});
