chrome.contextMenus.onClicked.addListener((_, tab) =>
  chrome.userScripts.execute({
    target: { tabId: tab.id },
    js: [{ code:
`(() => {
  let n = document;
  let walker = n.createTreeWalker(n.activeElement, 1);
  let w = innerWidth;
  let h = innerHeight;
  let urls = [];
  while ((n = walker.nextNode())) {
    if (n.checkVisibility()) {
      let rect = n.getBoundingClientRect();
      if (
        rect.y < w &&
        rect.bottom > 0 &&
        rect.x < h &&
        rect.right > 0
      ) {
        let styleMap = n.computedStyleMap();
        let src = (
          n.tagName == "IMG" && (
            styleMap.get("position").toString() != "static" ||
            styleMap.get("pointer-events").toString() == "none"
          ) && n.src
        ) || (
          (styleMap = styleMap.get("background-image").toString())[3] == "(" &&
          styleMap.slice(5, -2)
        );
        src && !urls.includes(src) && urls.push(src);
      }
    }
  }
  return urls;
})();`
      }]
  }).then(results => {
    let i = 0;
    let urls = results[0].result;
    while (i < urls.length)
      chrome.tabs.create({
        url: urls[i],
        index: ++i + tab.index
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