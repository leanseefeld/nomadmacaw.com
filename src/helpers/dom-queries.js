/**
 * Returns the child element on, or just before, the given screen x position.
 * @param {HTMLElement} container element containing the children to be queried
 * @param {Number} x horizontal position inside screen
 */
export function childAtOrBeforeX (container, x) {
  let experience = container.firstElementChild
  let bcr = experience.getBoundingClientRect()
  while (experience && bcr.x < x && x > (bcr.x + bcr.width)) {
    experience = experience.nextElementSibling
    bcr = experience && experience.getBoundingClientRect()
  }
  return experience || container.lastElementChild
}

/**
 * Returns the child element just before the given offset from the top.
 * @param {HTMLElement} container semantical container of the elements (the offsetParent)
 * @param {Number} offsetTop the maximum distance from the parent's top position
 * @param {NodeList|Array<HTMLElement>} children collection of elements to be queried, sorted from
 *    closest to farthest from the parent's top edge
 */
export function lastChildBeforeOffsetTop (container, offsetTop, children) {
  if (offsetTop >= container.offsetHeight) {
    return children[children.length - 1]
  }
  let p = 0
  let q = children.length - 1
  let i = 0

  // binary search on array with repeated items
  while (p < q - 1) {
    i = Math.floor((p + q) / 2)
    const currentOffsetTop = children[i].offsetTop
    if (currentOffsetTop < offsetTop) {
      p = i
      while (p < q && children[p + 1].offsetTop === currentOffsetTop) p++
    } else {
      q = i
      while (p < q && children[q - 1].offsetTop === currentOffsetTop) q--
    }
  }
  return children[p]
}

/**
 * Returns the last, innermost element in the container's tree.
 * @param {HTMLElement} container element that contains the children to be queried
 */
export function findLastInnermostElement (container) {
  let parent
  let lastElement = container
  do {
    parent = lastElement
    lastElement = parent.lastElementChild
  } while (lastElement)
  return parent
}
