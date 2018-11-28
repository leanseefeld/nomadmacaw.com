import AbstractLoaderController from './AbstractLoaderController'
import { isMobile } from '../helpers/device'
import { parse as parseText } from '../helpers/text-parser'

export default class AboutController extends AbstractLoaderController {
  constructor () {
    super('about')
    this.state = {
      expanded: false
    }
    this._expandButton = document.querySelector('#about .about__expand')
    this._panel = document.querySelector('#about .about-message')

    this.contentPromise = new Promise((resolve, reject) => {
      this.contentReceived = resolve
    })
  }

  expandPanel () {
    this.setState({ expanded: true })
  }

  setState (digest) {
    const prevState = this.state
    this.state = {
      ...this.state,
      ...digest
    }
    this.render(prevState, this.state)
  }

  render (prevState, state) {
    if (prevState.expanded !== state.expanded) {
      this._updatePanel(state.expanded)
    } else if (state.mobile !== prevState.mobile) {
      if (state.mobile && !prevState.expanded) {
        this._updatePanel(false)
      }
      if (!state.mobile && !prevState.expandPanel) {
        this._updatePanel(true, true)
      }
    }
  }

  _updatePanel (expand, skipAnimation) {
    const panel = this._panel
    const expandedClass = 'about-message--expanded'

    if (expand) {
      this.contentPromise.then((content) => {
        if (!skipAnimation) {
          panel.style['max-height'] = panel.offsetHeight + 'px'
        }
        this._expandButton.remove()

        panel.innerHTML = parseText(content)
        panel.classList.add(expandedClass)

        if (!skipAnimation) {
          panel.addEventListener('transitionend',
            () => (panel.style['max-height'] = ''),
            { passive: true, once: true })
          panel.style['max-height'] = panel.scrollHeight + 'px'
        }
      })
    } else {
      for (let j = panel.childElementCount; j > 0; j--) {
        panel.lastElementChild.remove()
      }
      panel.classList.remove('about-message--expanded')
      panel.appendChild(this._expandButton)
    }
  }

  register () {
    this._expandButton.addEventListener('click', () => this.expandPanel())

    const onWindowResized = () => this.setState({ mobile: isMobile() })
    window.addEventListener('resize', onWindowResized)

    onWindowResized()
  }

  onDataLoaded (data) {
    super.onDataLoaded(data)
    this.contentReceived(data.about)
  }
}
