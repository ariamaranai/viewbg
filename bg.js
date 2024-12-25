chrome.contextMenus.onClicked.addListener(async (_, tab) =>
  tab.url[0] != "c" && chrome.scripting.executeScript({
    target: { tabId: tab.id },
    world: "MAIN",
    func: () => {
      let node;
      let srcs = [];
      let walker = document.createTreeWalker(document.activeElement, 1);
      while ((node = walker.nextNode())) {
        if (node.checkVisibility()) {
          let rect = node.getBoundingClientRect();
          if (
            rect.y < innerHeight &&
            rect.bottom > 0 &&
            rect.x < innerWidth &&
            rect.right > 0 &&
            rect.width > 99 &&
            rect.height > 99
          ) {
            let styleMap = node.computedStyleMap();
            let src =
              (node.tagName == "IMG" &&
                (styleMap.get("position").toString() != "static" ||
                 styleMap.get("pointer-events").toString() == "none") &&
               node.src) ||
              ((styleMap = styleMap.get("background-image").toString())[3] == "(" &&
                styleMap.slice(5, -2));
            src && !srcs.includes(src) && srcs.push(src);
          }
        }
      }
      return srcs;
    }
  }, results => {
    for (let i = 0, srcs = results[0].result; i < srcs.length; )
      chrome.tabs.create({ url: srcs[i], index: ++i + tab.index});
  })
);
chrome.runtime.onInstalled.addListener(() =>
  chrome.contextMenus.create({
    id: "",
    title: "View background image",
    contexts: ["page", "link", "image"]
  })
);