const STACKLIST_COLLAPSED = 'stack-container--collapsed'
const ARROW_CLASS = 'arrow-link--'

const TOGGLE_TYPE = { SEE_ALL: 'expand', SEE_LESS: 'collapse' }

export default class ServicesController {
  getStackContainer () {
    return document.querySelector('#services .stack-container')
  }

  isCollapsed () {
    return this.getStackContainer().classList.contains(STACKLIST_COLLAPSED)
  }

  getToggle (type) {
    return document.querySelector('#services .stack-container__toggle')
  }

  updateToggle () {
    const stackContainer = this.getStackContainer()
    const toggle = this.toggle

    if (this.isCollapsed()) {
      toggle.textContent = 'see more'
      toggle.classList.remove(ARROW_CLASS + TOGGLE_TYPE.SEE_LESS)
      toggle.classList.add(ARROW_CLASS + TOGGLE_TYPE.SEE_ALL)
      stackContainer.firstElementChild.insertAdjacentElement('afterend', toggle)
      toggle.focus()
    }
  }

  toggleStackList () {
    const stackContainer = this.getStackContainer()
    if (this.isCollapsed()) {
      const toggle = this.toggle
      stackContainer.style.height = (stackContainer.scrollHeight + toggle.offsetHeight) + 'px'

      toggle.remove()
      toggle.textContent = 'see less'
      toggle.classList.remove(ARROW_CLASS + TOGGLE_TYPE.SEE_ALL)
      toggle.classList.add(ARROW_CLASS + TOGGLE_TYPE.SEE_LESS)
      stackContainer.appendChild(toggle)
      toggle.focus()
      stackContainer.scrollTop = 0

      stackContainer.classList.remove(STACKLIST_COLLAPSED)
    } else {
      stackContainer.style.height = this._collapseHeight + 'px'
      stackContainer.classList.add(STACKLIST_COLLAPSED)
    }
  }

  register () {
    const toggle = this.toggle = this.getToggle(TOGGLE_TYPE.SEE_ALL)
    this._collapseHeight = toggle.offsetTop + toggle.offsetHeight

    toggle.addEventListener('click', this.toggleStackList.bind(this))
    this.getStackContainer().addEventListener('transitionend', this.updateToggle.bind(this))

    this.toggleStackList()
  }
}
