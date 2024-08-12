console.log("Content script running");
// document.addEventListener('DOMContentLoaded', () => {
chrome.runtime.sendMessage({ action: 'startMonitoring' });
// });

document.addEventListener('contextmenu', (event) => {
    let element = event.target as HTMLElement;
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
            });

        } else {
            console.log("not Image Element:", element);

        }
    }
});