chrome.runtime.onInstalled.addListener(()=> chrome.contextMenus.create({id: "", title: "View background image", contexts: ["page","link","image"]}))
chrome.contextMenus.onClicked.addListener(async (a, b)=> b.url[0] !="c" && chrome.scripting.executeScript({
  target: {tabId: b.id},
  world: "MAIN",
  func: ()=> {
    let n, w = innerWidth, h = innerHeight, v = [], t = document.createTreeWalker(document.activeElement, 1)
    while (n = t.nextNode()) {
      if (n.checkVisibility()) {
        let r = n.getBoundingClientRect()
        if (r.y < h && r.bottom > 0 && r.x < w && r.right > 0 && r.width > 99 && r.height > 99) {
          let m = n.computedStyleMap(),
              s = (n.tagName == "IMG" && (m.get("position").toString() != "static" || m.get("pointer-events").toString() == "none") && n.src) ||
            ((m = m.get("background-image").toString())[3] == "(" && m.slice(5, -2))
          s && !v.includes(s) && v.push(s)
        }
      }
    }
    return v
  }
}, e=> {
  a = (e = v[0].result).length;
  while(a) chrome.tabs.create({url: v[--a]})
})
)