chrome.contextMenus.onClicked.addListener((_, tab) =>
  chrome.userScripts.execute({
    target: { tabId: tab.id },
    js: [{ code:
`(() => {
  let n = document;
  let root = n.scrollingElement;
  let walker = n.createTreeWalker(n.activeElement, 1);
  let x0 = root.scrollLeft;
  let x1 = x0 + innerWidth;
  let y0 = root.scrollTop;
  let y1 = y0 + innerHeight;
  let urls = [];
  n = walker.currentNode;
  while (n) {
    if (n.checkVisibility()) {
      let rect = n.getBoundingClientRect();
      if ((rect.y < y1 && y0 < rect.bottom) || (rect.x < x1 && x0 < rect.right)) {
        let styleMap = n.computedStyleMap();
        let src = n.tagName == "IMG" && (
          styleMap.get("position") + "" != "static" ||
          styleMap.get("pointer-events") + "" == "none"
        ) &&
        n.currentSrc ||
        (styleMap = styleMap.get("background-image") + "")[3] == "(" &&
        styleMap.slice(5, -2);
        src && (urls.includes(src) || urls.push(src));
      }
    }
    n = walker.nextNode();
  }
  return urls;
})();`
      }]
  }).then(results => {
    let urls = results[0].result;
    let len = urls.length;
    let tabIds = Array(len);
    let i = 0;
    while (i < len) (
      tabIds[i] = chrome.tabs.create({
        url: urls[i],
        index: tab.index + 1
      }),
      ++i
    );
    len > 1 &&
    Promise.all(tabIds).then(tabs => {
      while (tabIds[--i] = tabs[i].id, i);
      chrome.tabs.group({ tabIds });
    });
  }).catch(() => 0)
);
chrome.runtime.onInstalled.addListener(() => (
  chrome.userScripts.configureWorld({
    messaging: !0
  }),
  chrome.contextMenus.create({
    id: "",
    title: "View background image",
    contexts: ["page", "link", "image"],
    documentUrlPatterns: ["https://*/*", "http://*/*"]
  })
));