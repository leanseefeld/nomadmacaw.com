export default function animate (duration, from, to, animateFrame) {
  let start
  const incrementPerMili = (to - from) / duration

  window.requestAnimationFrame(function computeFrame (time) {
    if (!start) start = time
    let value = from + (time - start) * incrementPerMili
    if (incrementPerMili > 0) {
      value = Math.min(to, value)
    } else {
      value = Math.max(to, value)
    }
    animateFrame(value)
    if (value !== to) {
      window.requestAnimationFrame(computeFrame)
    }
  })
}
