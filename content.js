(function () {
  let domains = {};
  let images = {};
  let faviconDomains = {};

  function applyFilters() {
    // Determine the page's domain for page-level toggles
    let pageDomain = null;
    try {
      pageDomain = new URL(window.location.href).hostname;
    } catch (e) {
      pageDomain = null;
    }
    for (let img of document.images) {
      try {
        const src = img.src;
        const url = new URL(src);
        const srcDomain = url.hostname;
        // Apply if individually toggled, or toggled for this image's domain, or toggled for the page's domain
        if (images[src] || domains[srcDomain] || (pageDomain && domains[pageDomain])) {
          img.style.filter = "grayscale(100%)";
        } else {
          img.style.filter = "";
        }
      } catch (e) {
        // ignore invalid URLs
      }
    }
  }

  // Apply grayscale filter to page favicon based on stored settings
  function applyFavicon() {
    try {
      let pageUrl = window.location.href;
      let url = new URL(pageUrl);
      let domain = url.hostname;
      // Find all favicon link elements
      let links = document.querySelectorAll('link[rel*="icon"]');
      if (faviconDomains[domain]) {
        // Desaturate favicon(s)
        links.forEach(link => {
          if (!link.dataset.originalHref) {
            link.dataset.originalHref = link.href;
          }
          fetch(link.dataset.originalHref)
            .then(response => response.blob())
            .then(blob => {
              let img = new Image();
              img.crossOrigin = 'anonymous';
              img.onload = () => {
                let canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                let ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                let data = imageData.data;
                for (let i = 0; i < data.length; i += 4) {
                  let avg = (data[i] + data[i+1] + data[i+2]) / 3;
                  data[i] = avg;
                  data[i+1] = avg;
                  data[i+2] = avg;
                }
                ctx.putImageData(imageData, 0, 0);
                link.href = canvas.toDataURL();
              };
              img.src = URL.createObjectURL(blob);
            })
            .catch(e => console.error('Failed to desaturate favicon', e));
        });
      } else {
        // Restore favicon(s)
        links.forEach(link => {
          if (link.dataset.originalHref) {
            link.href = link.dataset.originalHref;
            delete link.dataset.originalHref;
          }
        });
      }
    } catch (e) {
      console.error('Error applying favicon filter', e);
    }
  }

  function updateSettings() {
    chrome.storage.local.get({ domains: {}, images: {}, faviconDomains: {} }, (data) => {
      domains = data.domains || {};
      images = data.images || {};
      faviconDomains = data.faviconDomains || {};
      applyFilters();
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
    for (let mutation of mutationsList) {
      if (mutation.type === "childList" && mutation.addedNodes.length) {
        applyFilters();
        break;
      }
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();