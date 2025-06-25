chrome.contextMenus.onClicked.addListener(async (info, { id, index }) => {
  if (info.mediaType == "image") {
    let { srcUrl } = info;
    srcUrl &&
    chrome.tabs.create({
      url: srcUrl,
      index: index + 1
    });
  } else {
    try {
      let { result } = (await chrome.userScripts.execute({
        target: { tabId: id },
        js: [{ file: "main.js" }] 
      }))[0];
      let i = result.length;
      if (i) {
        while (
          chrome.tabs.create({
            url: result[--i],
            index: index + 1
          }),
          i
        );
      }
    } catch (e) {}
  }
});
chrome.runtime.onInstalled.addListener(() =>
  chrome.contextMenus.create({
    id: "",
    title: "View background image",
    contexts: ["page", "link", "image"],
    documentUrlPatterns: ["https://*/*", "http://*/*"]
  })
);