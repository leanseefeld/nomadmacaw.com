import { isDesktop } from '../helpers/device'

const STACKLIST_COLLAPSED = 'stack-container--collapsed'
const ARROW_CLASS = 'arrow-link--'

const TOGGLE_TYPE = { SEE_ALL: 'expand', SEE_LESS: 'collapse' }

const MODE = { DESKTOP: 'DESKTOP', MOBILE: 'MOBILE' }
const detectMode = () => isDesktop() ? MODE.DESKTOP : MODE.MOBILE

export default class ServicesController {
  constructor () {
    this.state = {}
  }

  getStackContainer () {
    return document.querySelector('#services .stack-container')
  }

  getToggle () {
    return document.querySelector('#services .stack-container__toggle')
  }

  toggleStackList (collapsed = !this.state.collapsed) {
    this.update({ collapsed })
  }

  register () {
    const toggle = this.toggle = this.getToggle()
    toggle.addEventListener('click', () => this.toggleStackList())

    this.getStackContainer().addEventListener('transitionend', this._updateToggle.bind(this))

    window.addEventListener('resize', () => {
      const mode = detectMode()
      if (mode !== this.state.mode) {
        this.update({ mode })
      }
      this._updateHeight()
    })

    const mode = detectMode()
    this.update({
      mode,
      collapsed: mode === MODE.MOBILE
    })
  }

  update (newState) {
    const previousState = this.state
    this.state = {
      ...this.state,
      ...newState
    }

    this.render(previousState, this.state)
  }

  _updateHeight () {
    const stackContainer = this.getStackContainer()
    if (this.state.mode === MODE.DESKTOP) {
      stackContainer.style.height = ''
    } else {
      const toggle = this.toggle
      if (this.state.collapsed) {
        stackContainer.style.height = (toggle.offsetTop + toggle.offsetHeight) + 'px'
      } else {
        stackContainer.style.height = (stackContainer.scrollHeight + toggle.offsetHeight) + 'px'
      }
    }
  }

  _updateToggle () {
    const stackContainer = this.getStackContainer()
    const toggle = this.toggle

    if (this.state.collapsed) {
      toggle.textContent = 'see more'
      toggle.classList.remove(ARROW_CLASS + TOGGLE_TYPE.SEE_LESS)
      toggle.classList.add(ARROW_CLASS + TOGGLE_TYPE.SEE_ALL)
      stackContainer.firstElementChild.insertAdjacentElement('afterend', toggle)
      toggle.focus()
    }
  }

  render (prevState, state) {
    const stackContainer = this.getStackContainer()

    if (prevState.collapsed !== state.collapsed) {
      const toggle = this.toggle
      if (state.collapsed) {
        this._updateToggle()
        this._updateHeight()
        stackContainer.classList.add(STACKLIST_COLLAPSED)
      } else {
        toggle.remove()
        toggle.textContent = 'see less'
        toggle.classList.remove(ARROW_CLASS + TOGGLE_TYPE.SEE_ALL)
        toggle.classList.add(ARROW_CLASS + TOGGLE_TYPE.SEE_LESS)
        stackContainer.appendChild(toggle)
        toggle.focus()
        stackContainer.scrollTop = 0

        this._updateHeight()
        stackContainer.classList.remove(STACKLIST_COLLAPSED)
      }
    }
  }
}
