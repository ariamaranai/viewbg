chrome.contextMenus.onClicked.addListener(async (_, tab) => {
  if (tab.url[0] != "c") {
    try {
      let results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          let d = document;
          let walker = d.createTreeWalker(d.activeElement, 1);
          let w = innerWidth;
          let h = innerHeight;
          let urls = [];
          let node;
          while ((node = walker.nextNode())) {
            if (node.checkVisibility()) {
              let rect = node.getBoundingClientRect();
              if (
                rect.y < w &&
                rect.bottom > 0 &&
                rect.x < h &&
                rect.right > 0 &&
                rect.width > 99 &&
                rect.height > 99
              ) {
                let styleMap = node.computedStyleMap();
                let src = (
                  node.tagName == "IMG" && (
                    styleMap.get("position").toString() != "static" ||
                    styleMap.get("pointer-events").toString() == "none"
                  ) && node.src
                ) || (
                  (styleMap = styleMap.get("background-image").toString())[3] == "(" &&
                    styleMap.slice(5, -2)
                );
                src && !urls.includes(src) && urls.push(src);
              }
            }
          }
          return urls;
        }
      });
      let i = 0;
      let urls = results[0].result;
      while (i < urls.length)
        chrome.tabs.create({ url: urls[i], index: ++i + tab.index });
    } catch (e) {}
  }
});
chrome.runtime.onInstalled.addListener(() =>
  chrome.contextMenus.create({
    id: "",
    title: "View background image",
    contexts: ["page", "link", "image"],
    documentUrlPatterns: ["https://*/*", "https://*/", "http://*/*", "http://*/", "file://*/*", "file://*/"]
  })
);