chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  let srcUrl = info.srcUrl;
  let index = tab.index;
  if (info.mediaType == "image") {
    let bmp = await createImageBitmap(await (await fetch(srcUrl)).blob());
    (bmp.width > 1 || bmp.height > 1) &&
    chrome.tabs.create({
      url: srcUrl,
      index: index + 1
    });
  }
  try {
    let result = (await chrome.userScripts.execute({
      target: { tabId: tab.id },
      js: [{ file: "main.js" }] 
    }))[0].result;
    let i = result.length;
    if (i) {
      let url = 0;
      while (
        (url = result[--i]) != srcUrl &&
        chrome.tabs.create({
          url,
          index: index + 1
        }),
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