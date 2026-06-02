(function () {
  let domains = {};
  let images = {};
  let faviconDomains = {};
  let pageDomain = "";

  try {
    pageDomain = new URL(window.location.href).hostname;
  } catch (e) {
    pageDomain = null;
  }

  function applyImageStyle(img) {
    try {
      const src = img.src;
      if (!src) return;
      const url = new URL(src);
      const srcDomain = url.hostname;
      
      if (images[src] || domains[srcDomain] || (pageDomain && domains[pageDomain])) {
        img.style.filter = "grayscale(100%)";
      } else {
        img.style.filter = "";
      }
    } catch (e) {
      // ignore invalid URLs
    }
  }

  function applyFilters(target) {
    if (!target) return;
    
    // If target itself is an image, apply directly
    if (target.tagName === "IMG") {
      applyImageStyle(target);
    }
    
    // Find all images within the target subtree
    if (target.querySelectorAll) {
      const imgs = target.querySelectorAll("img");
      imgs.forEach(applyImageStyle);
    }
  }

  function applyFavicon() {
    try {
      if (!pageDomain) return;
      
      // Match both rel="icon" and rel="shortcut icon" robustly
      const links = document.querySelectorAll('link[rel~="icon"]');
      
      if (faviconDomains[pageDomain]) {
        links.forEach(link => {
          if (!link.dataset.originalHref) {
            link.dataset.originalHref = link.href;
          }
          fetch(link.dataset.originalHref)
            .then(response => response.blob())
            .then(blob => {
              const img = new Image();
              img.crossOrigin = "anonymous";
              img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);
                
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                for (let i = 0; i < data.length; i += 4) {
                  const avg = (data[i] + data[i+1] + data[i+2]) / 3;
                  data[i] = avg;     // R
                  data[i+1] = avg;   // G
                  data[i+2] = avg;   // B
                }
                ctx.putImageData(imageData, 0, 0);
                link.href = canvas.toDataURL();
              };
              img.src = URL.createObjectURL(blob);
            })
            .catch(e => console.error("Failed to desaturate favicon", e));
        });
      } else {
        // Restore original favicon(s)
        links.forEach(link => {
          if (link.dataset.originalHref) {
            link.href = link.dataset.originalHref;
            delete link.dataset.originalHref;
          }
        });
      }
    } catch (e) {
      console.error("Error applying favicon filter", e);
    }
  }

  function updateSettings() {
    chrome.storage.local.get({ domains: {}, images: {}, faviconDomains: {} }, (data) => {
      domains = data.domains || {};
      images = data.images || {};
      faviconDomains = data.faviconDomains || {};
      
      applyFilters(document.body);
      applyFavicon();
    });
  }

  updateSettings();

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && (changes.domains || changes.images || changes.faviconDomains)) {
      updateSettings();
    }
  });

  const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            applyFilters(node);
          }
        });
      }
    }
  });

  function initObserver() {
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    } else {
      document.addEventListener("DOMContentLoaded", () => {
        observer.observe(document.body, { childList: true, subtree: true });
      });
    }
  }

  initObserver();
})();