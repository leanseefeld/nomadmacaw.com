import $ from 'jquery'
import { isDesktop } from '../helpers/device'
export const CLASS_HEADER = 'nm-header'

const CLASS_HEADER_OPEN = CLASS_HEADER + '--open'
const CLASS_HEADER_COLLAPSED = CLASS_HEADER + '--collapsed'
const CLASS_TITLE_ACTIVE = CLASS_HEADER + '__title--active'

const ANIMATION_DURATION = 350

export function getHeader () {
  return $('#header')
}

export function getTitleList () {
  return getHeader().find(`.${CLASS_HEADER}__title-list`)
}

export function getHamburger () {
  return getHeader().find(`.${CLASS_HEADER}__menu`)
}

export function selectSection (elements) {
  return elements.find(el => el.tagName === 'SECTION')
}

export const DISPLAY = { INITIAL: 'INITIAL', COLLAPSED: 'COLLAPSED', OPEN: 'OPEN' }

export default class HeaderController {
  constructor () {
    this.state = {
      display: DISPLAY.INITIAL,
      activeSection: null,
      compactMode: !isDesktop()
    }
    this.mount()
  }

  mount () {
    const headings = $('section > h2')
    const elements = []
    headings.each((idx, el) => {
      const titleEl = document.createElement('div')
      titleEl.className = CLASS_HEADER + '__title'
      titleEl.innerText = el.innerText
      const sectionId = titleEl.dataset.sectionId = el.parentElement.id
      titleEl.onclick = this.scrollToSection.bind(this, sectionId)
      elements.push(titleEl)
    })
    this.firstSection = 'home' // defined in template

    getTitleList().append(elements)
  }

  register () {
    const handler = this.onScroll.bind(this)

    getHamburger().click(() => {
      if (this.state.display !== DISPLAY.OPEN) {
        this.setState({ display: DISPLAY.OPEN })
      } else {
        this.focusVisibleSection()
      }
    })

    getHeader().find(`.${CLASS_HEADER}__logo`).click(this.scrollToSection.bind(this, this.firstSection))

    window.addEventListener('load', () => {
      handler()
      window.addEventListener('scroll', handler, { passive: true })
    })

    window.addEventListener('resize', () => this.focusVisibleSection())

    return function unregister () {
      window.removeEventListener('scroll', handler)
    }
  }

  onScroll () {
    if (this.scrolling || this.state.display === DISPLAY.OPEN) {
      return
    }
    this.focusVisibleSection()
  }

  focusVisibleSection () {
    // TODO: compatibility with IE/Edge
    const middleSection = selectSection(document.elementsFromPoint(window.innerWidth / 2, window.innerHeight / 2 + 1))
    if (!middleSection) {
      return
    }
    this.setActiveSection(middleSection.id)
  }

  setActiveSection (sectionId) {
    this.setState({
      activeSection: sectionId,
      display: sectionId === this.firstSection ? DISPLAY.INITIAL : DISPLAY.COLLAPSED,
      compactMode: !isDesktop()
    })
  }

  scrollToSection (sectionId) {
    const anchor = document.getElementById(sectionId)
    this.scrolling = true
    this.setActiveSection(sectionId)
    $('html,body').animate({
      scrollTop: anchor.offsetTop
    }, ANIMATION_DURATION, () => {
      this.scrolling = false
    })
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
    const changedDisplay = prevState.display !== state.display
    const changedSection = prevState.activeSection !== state.activeSection
    const changedCompact = prevState.compactMode !== state.compactMode
    let closedMenu = false

    if (changedDisplay) {
      this._renderDisplay(state.display)
      closedMenu = prevState.display === DISPLAY.OPEN
    }
    if (changedSection || changedCompact || closedMenu) {
      this._syncHeader(state.activeSection, state.compactMode)
    }
  }

  _renderDisplay (display) {
    let classList = [ CLASS_HEADER ]
    if (display === DISPLAY.OPEN) {
      classList.push(CLASS_HEADER_OPEN)
      getTitleList()[0].style.transform = ''
    } else if (display === DISPLAY.COLLAPSED) {
      classList.push(CLASS_HEADER_COLLAPSED)
    }

    getHeader()[0].className = classList.join(' ')
  }

  _syncHeader (sectionId, isCompact) {
    const titleList = getTitleList()
    const visibleTitle = titleList.find('.' + CLASS_TITLE_ACTIVE)
    visibleTitle.removeClass(CLASS_TITLE_ACTIVE)
    const target = titleList.find(`[data-section-id=${sectionId}]`)[0]
    target.classList.add(CLASS_TITLE_ACTIVE)

    if (isCompact) {
      const offset = titleList[0].offsetHeight / 2 - (target.offsetTop + target.offsetHeight / 2)
      titleList[0].style.transform = `translateY(${offset}px)`
    } else {
      titleList[0].style.transform = ''
    }
  }
}
