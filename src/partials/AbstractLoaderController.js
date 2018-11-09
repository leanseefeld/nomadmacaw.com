export default class AbstractLoaderController {
  constructor (containerId) {
    this.containerId = containerId
  }

  removeLoader () {
    const loader = document.querySelector(`#${this.containerId} .c-loading-icon`)
    if (loader) {
      loader.remove()
    }
  }

  onDataLoaded () {
    this.removeLoader()
  }
}
