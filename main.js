(() => {
  let d = document;
  let { activeElement } = d;
  let walker = d.createTreeWalker(activeElement, 1);
  let { innerWidth, innerHeight } = self;
  let urls = [];
  let n = walker.currentNode;
  while (n) {
    if (n.checkVisibility()) {
      let { y, bottom, x, right } = n.getBoundingClientRect();
      if (y >= 0 && y < innerHeight && bottom > 0 && ((x >= 0 && x < innerWidth) || right > 0)) {
        let styleMap = n.computedStyleMap();
        let src = n.tagName == "IMG" && (
          styleMap.get("position") + "" != "static" ||
          styleMap.get("pointer-events") + "" == "none"
        ) &&
        (n.srcset && n.srcset.split(" ").filter((v, i) => i % 2 == 0).at(-1) || n.currentSrc) ||
        (styleMap = styleMap.get("background-image") + "")[3] == "(" &&
        styleMap.slice(5, -2);
        src && urls.push(src);
      }
    }
    n = walker.nextNode();
  }
  if (!urls.length) {
    let rect = activeElement.getBoundingClientRect();
    let { images } = d;
    let minds = 65535;
    let i = 0;
    let _x = rect.x ^ 0;
    let _y = rect.y ^ 0;
    while (i < images.length) {
      let img = images[i];
      if (img.naturalWidth > 1 || img.naturalHeight > 1) {
        let { x, y } = img.getBoundingClientRect();
        let dsx = x - _x;
        let dsy = y - _y;
        if (dsx >= 0 && dsy >= 0) {
          let ds = dsx + dxy;
          ds <= minds && (
            minds = ds,
            urls[0] = img.srcset && img.srcset.split(" ").filter((v, i) => i % 2 == 0).at(-1) || img.currentSrc
          );
        }
      }
      ++i;
    }
  }
  return urls;
})()