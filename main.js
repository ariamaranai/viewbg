(() => {
  let d = document;
  let { activeElement } = d;
  let walker = d.createTreeWalker(activeElement, 1);
  let { innerWidth, innerHeight } = self;
  let urls = [];
  let e = walker.currentNode;
  let parseSrcset = e => (e.srcset && e.srcset.split(",").map(v => v.split(" ")).map(v => [v[0], parseInt(v[1])]).sort((a, b) => b[1] - a[1])[0][0] || e.currentSrc);

  while (e) {
    if (e.checkVisibility()) {
      let { y, bottom, x, right } = e.getBoundingClientRect();
      if (y >= 0 && y < innerHeight && bottom > 0 && ((x >= 0 && x < innerWidth) || right > 0)) {
        let styleMap = e.computedStyleMap();
        let src = e.tagName == "IMG" && (
          (e.naturalWidth > 1 || e.naturalHeight > 1) &&
          styleMap.get("position").value != "static" ||
          styleMap.get("pointer-events").value == "none"
        ) &&
        parseSrcset(e) || (styleMap = styleMap.get("background-image").value)[3] == "(" && styleMap.slice(5, -2);
        src && urls.push(src);
      }
    }
    e = walker.nextNode();
  }

  if (!urls.length) {
    let rect = activeElement.getBoundingClientRect();
    let { images } = d;
    let minOffset = 65535;
    let i = 0;
    let _x = rect.x ^ 0;
    let _y = rect.y ^ 0;
    while (i < images.length) {
      let e = images[i];
      if (e.naturalWidth > 1 || e.naturalHeight > 1) {
        let rect = e.getBoundingClientRect();
        let offsetX = rect.x - _x;
        if (offsetX >= 0) {
          let offsetY = rect.y - _y;
          offsetY >= 0 && (offsetY += offsetX) <= minOffset && (
            minOffset = offsetY,
            urls[0] = parseSrcset(e)
          );
        }
      }
      ++i;
    }
  }
  return urls;
})()