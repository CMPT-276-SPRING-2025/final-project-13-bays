import React from "react";
import { saveTabsToFirestore, getTabsFromFirestore } from "../utils/FirestoreUtils";

const TabMarkIntegration = ({ projectId, userId }) => {
  const saveTabs = () => {
    if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ action: "saveTabs" }, async (response) => {
        if (response?.success) {
          const tabs = response.tabs.map((tab) => ({ url: tab.url, title: tab.title }));
          try {
            await saveTabsToFirestore(userId, projectId, tabs);
            console.log("Tabs saved to Firestore successfully!");
          } catch (error) {
            console.error("Failed to save tabs to Firestore:", error);
          }
        } else {
          console.error("Failed to retrieve tabs from Chrome:", response?.error);
        }
      });
    } else {
      console.error("Chrome runtime is not available.");
    }
  };

  const openTabs = async () => {
    try {
      const tabs = await getTabsFromFirestore(userId, projectId);
      const urls = tabs.map((tab) => tab.url);

      if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({ action: "openTabs", urls }, (response) => {
          if (response?.success) {
            console.log("Tabs opened successfully!");
          } else {
            console.error("Failed to open tabs:", response?.error);
          }
        });
      } else {
        console.error("Chrome runtime is not available.");
      }
    } catch (error) {
      console.error("Failed to retrieve tabs from Firestore:", error);
    }
  };

  return (
    <div>
      <button onClick={saveTabs}>Save Tabs</button>
      <button onClick={openTabs}>Open Tabs</button>
    </div>
  );
};

export default TabMarkIntegration;