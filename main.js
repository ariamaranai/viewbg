(() => {
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
        (n.srcset && n.srcset.split(" ").filter((v, i) => i % 2 == 0).at(-1) || n.currentSrc) ||
        (styleMap = styleMap.get("background-image") + "")[3] == "(" &&
        styleMap.slice(5, -2);
        src && urls.push(src);
      }
    }
    n = walker.nextNode();
  }
  if (!urls.length) {
    let { x, y } = activeElement.getBoundingClientRect();
    x ^= 0;
    y ^= 0;
    let { images } = d;
    let minDist = 0;
    let i = 0;
    while (i < images.length) {
      let img = images[i];
      let r = img.getBoundingClientRect();
      if (img.naturalWidth > 1 || img.naturalHeight > 1) {
        let dist = r.x - x;
        let distY = r.y - y;
        dist >= 0 && distY >= 0 &&
        (dist += distY, minDist == 0 || dist < minDist) && (
          minDist = dist,
          urls[0] = img.srcset && img.srcset.split(" ").filter((v, i) => i % 2 == 0).at(-1) || img.currentSrc
        );
      }
      ++i;
    }
  }
  return urls;
})()
