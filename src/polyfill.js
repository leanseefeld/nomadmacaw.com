if (!window.requestAnimationFrame) {
  window.requestAnimationFrame = (callback) => setTimeout(() => {
    const timestamp = +new Date()
    callback(timestamp)
  }, 16)
}
