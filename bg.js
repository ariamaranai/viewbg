chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  let { srcUrl } = info;
  let index = tab.index + 1;
  if (info.mediaType == "image") {
    let bmp = await createImageBitmap(await (await fetch(srcUrl)).blob());
    bmp.width > 1 && bmp.height > 1 &&
    chrome.tabs.create({ url: srcUrl, index });
  }
  try {
    let result = (await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      world: "MAIN",
      files: ["main.js"]
    }))[0].result;
    let i = result.length;
    if (i) {
      let url = 0;
      while (
        (url = result[--i]) != srcUrl &&
        chrome.tabs.create({ url, index }),
        i
      );
    }
  } catch {}
});
chrome.runtime.onInstalled.addListener(() =>
  chrome.contextMenus.create({
    id: "",
    title: "View background image",
    contexts: ["page", "link", "image"],
    documentUrlPatterns: ["https://*/*", "http://*/*"]
  })
);