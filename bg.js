chrome.contextMenus.onClicked.addListener((info, { id, index }) => {
  if (info.mediaType == "image") {
    let { srcUrl } = info;
    srcUrl &&
    chrome.tabs.create({
      url: srcUrl,
      index: index + 1
    });
  } else
    chrome.userScripts.execute({
      target: { tabId: id },
      js: [{ file: "main.js" }] 
    }).then(results => {
      let urls = results[0].result;
      let i = urls.length;
      if (i) {
        while (
          chrome.tabs.create({
            url: urls[--i],
            index: index + 1
          }),
          i
        );
      }
    }).catch(() => 0)
});
chrome.runtime.onInstalled.addListener(() =>
  chrome.contextMenus.create({
    id: "",
    title: "View background image",
    contexts: ["page", "link", "image"],
    documentUrlPatterns: ["https://*/*", "http://*/*"]
  })
);