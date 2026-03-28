(() => {
  let d = document;
  let activeElement = d.activeElement;
  let walker = d.createTreeWalker(activeElement, 1);
  let urls = [];
  let e = walker.currentNode;
  let parseSrcset = (e, w) => {
    let srcset = e.srcset;
    let src = e.src;
    return srcset ? w < (srcset = Array.from(srcset.matchAll(/([^,\s])+ (\d+)/g)).sort((a, b) => b[2] - a[2])[0]) ? srcset[0][1] : src : src;
  }
  while (e) {
    if (e.checkVisibility()) {
      let rect = e.getBoundingClientRect();
      let p = rect.y;
      if (p >= 0 && p < innerHeight && rect.bottom > 0 && (((p = rect.x) >= 0 && p < innerWidth) || rect.right > 0)) {
        p = 0;
        let src =
          (e instanceof HTMLImageElement &&
          e.naturalWidth > 1 && e.naturalHeight > 1 &&
          ((p = e.computedStyleMap()).get("position").value != "static" || p.get("pointer-events").value == "none") &&
          parseSrcset(e, e.naturalWidth)) ||
          (p = ((p || e.computedStyleMap()).get("background-image").value)) && p.startsWith("urls(") && p.slice(5, -2);
        src && urls.push(src);
      }
    }
    e = walker.nextNode();
  }
  if (!urls.length) {
    let rect = activeElement.getBoundingClientRect();
    let _x = rect.x ^ 0;
    let _y = rect.y ^ 0;
    let minOffset = 65535;
    let images = d.images;
    let i = 0;
    while (i < images.length) {
      let e = images[i];
      if (e.naturalWidth > 1 && e.naturalHeight > 1) {
        let rect = e.getBoundingClientRect();
        let offsetX = rect.x - _x;
        if (offsetX >= 0) {
          let offsetY = rect.y - _y;
          offsetY >= 0 && (offsetY += offsetX) <= minOffset && (
            minOffset = offsetY,
            urls[0] = parseSrcset(e, e.naturalWidth)
          );
        }
      }
      ++i;
    }
  }
  return urls;
})()
