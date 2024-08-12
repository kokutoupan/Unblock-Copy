document.getElementById('myButton')?.addEventListener('click', () => {
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
