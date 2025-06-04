chrome.runtime.onInstalled.addListener(() => {
  // Image-level toggle
  chrome.contextMenus.create({
    id: "toggleImage",
    title: "Toggle Desat for this image",
    contexts: ["image"]
  });
  chrome.contextMenus.create({
    id: "toggleDomain",
    title: "Toggle Desat for all images on this domain",
    contexts: ["all"]
  });
  // Favicon toggle
  chrome.contextMenus.create({
    id: "toggleFavicon",
    title: "Toggle Desat for favicon for this domain",
    contexts: ["image", "page"]
  });
  // All-at-once toggle
  chrome.contextMenus.create({
    id: "toggleAllDomain",
    title: "Toggle Desat for all images and favicon for this domain",
    contexts: ["image", "page"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  // Handle toggle-all action: images + favicon
  if (info.menuItemId === "toggleAllDomain") {
    let pageUrl = info.pageUrl || (tab && tab.url);
    if (!pageUrl) return;
    let domain;
    try {
      domain = new URL(pageUrl).hostname;
    } catch (e) {
      console.error("Invalid page URL:", pageUrl, e);
      return;
    }
    chrome.storage.local.get({ domains: {}, faviconDomains: {} }, (data) => {
      let domains = data.domains;
      let fD = data.faviconDomains;
      let isCurrentlyAll = !!domains[domain] && !!fD[domain];
      if (isCurrentlyAll) {
        delete domains[domain];
        delete fD[domain];
      } else {
        domains[domain] = true;
        fD[domain] = true;
      }
      chrome.storage.local.set({ domains, faviconDomains: fD });
    });
    return;
  }
  // Handle per-image toggle
  if (info.menuItemId === "toggleImage") {
    if (!info.srcUrl) return;
    let imageUrl = info.srcUrl;
    try {
      chrome.storage.local.get({ images: {} }, (data) => {
        let images = data.images;
        if (images[imageUrl]) {
          delete images[imageUrl];
        } else {
          images[imageUrl] = true;
        }
        chrome.storage.local.set({ images });
      });
    } catch (e) {
      console.error("Invalid image URL:", info.srcUrl, e);
    }
    return;
  }
  // Handle per-domain image toggle
  if (info.menuItemId === "toggleDomain") {
    let domain;
    try {
      if (info.srcUrl) {
        domain = new URL(info.srcUrl).hostname;
      } else {
        let pageUrl = info.pageUrl || (tab && tab.url);
        if (!pageUrl) return;
        domain = new URL(pageUrl).hostname;
      }
      chrome.storage.local.get({ domains: {} }, (data) => {
        let domains = data.domains;
        if (domains[domain]) {
          delete domains[domain];
        } else {
          domains[domain] = true;
        }
        chrome.storage.local.set({ domains });
      });
    } catch (e) {
      console.error("Invalid URL for domain toggle:", e);
    }
    return;
  }
  // Handle favicon toggle
  if (info.menuItemId === "toggleFavicon") {
    let pageUrl = info.pageUrl || (tab && tab.url);
    if (!pageUrl) return;
    let domain;
    try {
      domain = new URL(pageUrl).hostname;
    } catch (e) {
      console.error("Invalid page URL:", pageUrl, e);
      return;
    }
    chrome.storage.local.get({ faviconDomains: {} }, (data) => {
      let fD = data.faviconDomains;
      if (fD[domain]) {
        delete fD[domain];
      } else {
        fD[domain] = true;
      }
      chrome.storage.local.set({ faviconDomains: fD });
    });
    return;
  }
});
