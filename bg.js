onunhandledrejection = e => e.preventDefault();
{
  let { contextMenus, runtime, scripting, tabs } = chrome;
  contextMenus.onClicked.addListener((info, tab) => {
    let { srcUrl } = info;
    let index = tab.index + 1;
    info.mediaType == "image" &&
      fetch(srcUrl)
        .then(r => r.blob())
        .then(r => createImageBitmap(r))
        .then(r => r.width > r.height > 1 && tabs.create({ url: srcUrl, index }));

    scripting.executeScript({
      target: { tabId: tab.id },
      world: "MAIN",
      files: ["main.js"]
    }, results => {
      let result = results[0].result;
      let url;
      let i = result.length;
      while (
        i &&
        url !== result[--i] &&
        tabs.create({ url, index })
      );
    });
  });

  runtime.onInstalled.addListener(() =>
    contextMenus.create({
      id: "",
      title: "View background image",
      contexts: ["page", "link", "image"],
      documentUrlPatterns: ["https://*/*", "http://*/*"]
    })
  );
}
