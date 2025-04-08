document.getElementById("save-tabs").addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "getTabs" }, (response) => {
      console.log("Tabs retrieved:", response.tabs);
      // Send tabs to the frontend or backend
    });
  });
  
  document.getElementById("open-tabs").addEventListener("click", () => {
    // Example URLs to open
    const urls = ["https://example.com", "https://google.com"];
    chrome.runtime.sendMessage({ action: "openTabs", urls }, (response) => {
      console.log("Tabs opened:", response.success);
    });
  });