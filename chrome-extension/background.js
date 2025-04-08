// Handle external connections
chrome.runtime.onConnectExternal.addListener((port) => {
  console.log("External connection established:", port.name);

  port.onMessage.addListener((message) => {
    console.log("Message received from frontend:", message);

    if (message.action === "saveTabs") {
      chrome.tabs.query({ currentWindow: true }, (tabs) => {
        if (chrome.runtime.lastError) {
          console.error("Error querying tabs:", chrome.runtime.lastError.message);
          port.postMessage({ success: false, error: chrome.runtime.lastError.message });
          return;
        }
    
        const tabData = tabs
          .filter((tab) => tab.url && tab.title) // Filter out invalid tabs
          .filter((tab) => !tab.url.includes("localhost:5173") &&  !tab.url.includes("https://tabmark-d081a.web.app"))
          .map((tab) => ({ url: tab.url, title: tab.title }));
    
        console.log("Formatted tab data:", tabData);
        port.postMessage({ success: true, tabs: tabData });
      });
    } else if (message.action === 'openTabs') {
      const urls = message.urls;
      if (Array.isArray(urls)) {
        urls.forEach((url) => {
          chrome.tabs.create({ url });
        });
        port.postMessage({ success: true });
      } else {
        port.postMessage({ success: false, error: "Invalid URLs format" });
      } 
    } else {
      port.postMessage({ success: false, error: "Unknown action" });
    }
  });
});

// chrome.runtime.onConnect.addListener((port) => {
//   port.onMessage.addListener((message) => {
//     if (message.action === "openTabs") {
//       const urls = message.urls;
//       if (Array.isArray(urls)) {
//         urls.forEach((url) => {
//           chrome.tabs.create({ url });
//         });
//         port.postMessage({ success: true });
//       } else {
//         port.postMessage({ success: false, error: "Invalid URLs format" });
//       }
//     } else {
//       port.postMessage({ success: false, error: "Unknown action" });
//     }
//   });
// });


// Handle internal messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "saveTabs") {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      console.log("Raw tabs from Chrome API:", tabs); // Log raw tabs
      const tabData = tabs.map((tab) => ({
        url: tab.url,
        title: tab.title,
      }));
      console.log("Formatted tab data:", tabData); // Log formatted tabs
      sendResponse({ success: true, tabs: tabData });
    });
    return true; // Keep the message channel open for async response
  }
});

