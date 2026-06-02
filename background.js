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

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  // Handle toggle-all action: images + favicon
  if (info.menuItemId === "toggleAllDomain") {
    const pageUrl = info.pageUrl || (tab && tab.url);
    if (!pageUrl) return;
    try {
      const domain = new URL(pageUrl).hostname;
      const data = await chrome.storage.local.get({ domains: {}, faviconDomains: {} });
      const { domains, faviconDomains: fD } = data;
      const isCurrentlyAll = !!domains[domain] && !!fD[domain];
      
      if (isCurrentlyAll) {
        delete domains[domain];
        delete fD[domain];
      } else {
        domains[domain] = true;
        fD[domain] = true;
      }
      await chrome.storage.local.set({ domains, faviconDomains: fD });
    } catch (e) {
      console.error("Invalid page URL or storage error:", e);
    }
    return;
  }

  // Handle per-image toggle
  if (info.menuItemId === "toggleImage") {
    if (!info.srcUrl) return;
    const imageUrl = info.srcUrl;
    try {
      const data = await chrome.storage.local.get({ images: {} });
      const { images } = data;
      if (images[imageUrl]) {
        delete images[imageUrl];
      } else {
        images[imageUrl] = true;
      }
      await chrome.storage.local.set({ images });
    } catch (e) {
      console.error("Invalid image URL or storage error:", e);
    }
    return;
  }

  // Handle per-domain image toggle
  if (info.menuItemId === "toggleDomain") {
    try {
      let domain;
      if (info.srcUrl) {
        domain = new URL(info.srcUrl).hostname;
      } else {
        const pageUrl = info.pageUrl || (tab && tab.url);
        if (!pageUrl) return;
        domain = new URL(pageUrl).hostname;
      }
      
      const data = await chrome.storage.local.get({ domains: {} });
      const { domains } = data;
      if (domains[domain]) {
        delete domains[domain];
      } else {
        domains[domain] = true;
      }
      await chrome.storage.local.set({ domains });
    } catch (e) {
      console.error("Invalid URL for domain toggle or storage error:", e);
    }
    return;
  }

  // Handle favicon toggle
  if (info.menuItemId === "toggleFavicon") {
    const pageUrl = info.pageUrl || (tab && tab.url);
    if (!pageUrl) return;
    try {
      const domain = new URL(pageUrl).hostname;
      const data = await chrome.storage.local.get({ faviconDomains: {} });
      const { faviconDomains: fD } = data;
      if (fD[domain]) {
        delete fD[domain];
      } else {
        fD[domain] = true;
      }
      await chrome.storage.local.set({ faviconDomains: fD });
    } catch (e) {
      console.error("Invalid page URL or storage error:", e);
    }
    return;
  }
});
