chrome.contextMenus.onClicked.addListener((_, tab) =>
  chrome.userScripts.execute({
    target: { tabId: tab.id },
    js: [{ code:
`(() => {
  let d = document;
  let root = d.scrollingElement;
  let { activeElement } = d;
  let walker = d.createTreeWalker(activeElement, 1);
  let x0 = root.scrollLeft;
  let x1 = x0 + innerWidth;
  let y0 = root.scrollTop;
  let y1 = y0 + innerHeight;
  let urls = [];
  let n = walker.currentNode;

  while (n) {
    if (n.checkVisibility()) {
      let r = n.getBoundingClientRect();
      if ((r.y < y1 && y0 < r.bottom) || (r.x < x1 && x0 < r.right)) {
        let styleMap = n.computedStyleMap();
        let src = n.tagName == "IMG" && (
          styleMap.get("position") + "" != "static" ||
          styleMap.get("pointer-events") + "" == "none"
        ) &&
        n.currentSrc ||
        (styleMap = styleMap.get("background-image") + "")[3] == "(" &&
        styleMap.slice(5, -2);
        src && urls.push(src);
      }
    }
    n = walker.nextNode();
  }

  if (!urls.length) {
    let { x, y, right, bottom } = activeElement.getBoundingClientRect();
    let { images } = d;
    let i = 0;
    while (i < images.length) {
      let image = images[i];
      let r = image.getBoundingClientRect();
      (image.naturalWidth > 1 || image.naturalHeight > 1) &&
      r.y >= y && r.bottom <= bottom && r.x >= x && r.right <= right &&
      urls.push(image.currentSrc);
      ++i;
    }
  }

  return urls;
})();`
    }]
  }).then(results => {
    let urls = results[0].result;
    let i = urls.length;
    if (i)
      while (
        chrome.tabs.create({
          url: urls[--i],
          index: tab.index + 1
        }),
        i
      );
  }).catch(() => 0)
);
chrome.runtime.onInstalled.addListener(() =>
  chrome.contextMenus.create({
    id: "",
    title: "View background image",
    contexts: ["page", "link", "image"],
    documentUrlPatterns: ["https://*/*", "http://*/*"]
  })
);