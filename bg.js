chrome.contextMenus.onClicked.addListener((_, tab) =>
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    world: "MAIN",
    func: () => {
      let d = document;
      let walker = d.createTreeWalker(d.activeElement, 1);
      let w = innerWidth;
      let h = innerHeight;
      let srcs = [];
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
            src && !srcs.includes(src) && srcs.push(src);
          }
        }
      }
      return srcs;
    }
  }, results => {
    for (let i = 0, srcs = results[0].result; i < srcs.length;)
      chrome.tabs.create({ url: srcs[i], index: ++i + tab.index });
  })
);
chrome.runtime.onInstalled.addListener(() =>
  chrome.contextMenus.create({
    id: "",
    title: "View background image",
    contexts: ["page", "link", "image"],
    documentUrlPatterns: ["https://*/*", "https://*/", "http://*/*", "http://*/", "file://*/*", "file://*/"]
  })
);