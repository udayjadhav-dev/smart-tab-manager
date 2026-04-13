// Predefined categories with keywords
const CATEGORIES = {
  "Work": ["github", "jira", "notion", "docs.google", "slack", "linear"],
  "Shopping": ["amazon", "flipkart", "myntra", "meesho", "nykaa"],
  "YouTube": ["youtube", "youtu.be"],
  "News": ["ndtv", "timesofindia", "thehindu", "bbc", "news"],
  "Social": ["twitter", "instagram", "facebook", "linkedin", "x.com"]
};

// URL dekho aur category decide karo
function getCategory(url) {
  for (const [category, keywords] of Object.entries(CATEGORIES)) {
    if (keywords.some(kw => url.includes(kw))) {
      return category;
    }
  }
  return "Other";
}

// Jab bhi tab update ho, sunno
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    const category = getCategory(tab.url);
    // Category store karo chrome storage mein
    chrome.storage.local.get("tabCategories", (data) => {
      const cats = data.tabCategories || {};
      cats[tabId] = category;
      chrome.storage.local.set({ tabCategories: cats });
    });
  }
});

// Tab band ho toh storage se hatao
chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.storage.local.get("tabCategories", (data) => {
    const cats = data.tabCategories || {};
    delete cats[tabId];
    chrome.storage.local.set({ tabCategories: cats });
  });
});