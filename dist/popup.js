"use strict";
var _a;
(_a = document.getElementById('myButton')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => {
    chrome.storage.local.get("imageUrl", (data) => {
        if (data.imageUrl) {
            console.log("Image URL:", data.imageUrl);
            document.body.appendChild(document.createElement('img')).src = data.imageUrl;
        }
        else {
            console.log("No image found");
        }
    });
});
