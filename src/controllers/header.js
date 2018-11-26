import $ from 'jquery'
import { isMobile } from '../helpers/device'
import debounce from 'lodash/debounce'

export const className = 'nm-header'

export function getHeader () {
  return $('#header')
}

export function getTitleList () {
  return getHeader().find(`.${className}__title-list`)
}

export function getHamburger () {
  return getHeader().find(`.${className}__menu`)
}

export function selectSection (elements) {
  return elements.find(el => el.tagName === 'SECTION')
}

const activeTitleClass = className + '__title--active'
const openClass = className + '--open'

export default class HeaderController {
  constructor () {
    this.scroll = {
      prevX: 0,
      prevY: 0
    }
  }

  mount () {
    const headings = $('section > h2')
    const elements = []
    headings.each((idx, el) => {
      const titleEl = document.createElement('div')
      titleEl.className = className + '__title'
      titleEl.innerText = el.innerText
      const sectionId = titleEl.dataset.sectionId = el.parentElement.id
      titleEl.onclick = () => this.scrollToSection(sectionId)
      elements.push(titleEl)
    })

    getTitleList().append(elements)
  }

  register () {
    const handler = this.onScroll.bind(this)
    this.mount()

    getHamburger().click(this.toggleMenu.bind(this))
    getHeader().find(`.${className}__logo`).click(this.scrollToSection.bind(this, 'home'))

    if (isMobile()) {
      this.onScroll()
      const onTransitionEnd = debounce((evt) => {
        getHeader()[0].removeEventListener('transitionend', onTransitionEnd)
        getTitleList()[0].removeEventListener('transitionend', onTransitionEnd)

        this.syncHeader(true)
        window.addEventListener('scroll', handler, { passive: true })
      }, 200)
      getHeader()[0].addEventListener('transitionend', onTransitionEnd)
      getTitleList()[0].addEventListener('transitionend', onTransitionEnd)
    } else {
      window.addEventListener('scroll', handler, { passive: true })
    }

    return function unregister () {
      window.removeEventListener('scroll', handler)
    }
  }

  isOpen () {
    return getHeader().is('.' + openClass)
  }

  toggleMenu (open) {
    if ((typeof open !== 'undefined' && !open) || this.isOpen()) {
      getHeader().removeClass(openClass)
      this.onScroll()
    } else {
      this.opaque()
      this.collapse()
      getHeader().addClass(openClass)
    }
  }

  expand () {
    getHeader().get(0).className = className
  }

  collapse () {
    getHeader().addClass(className + '--collapsed')
  }

  opaque (add = true) {
    const $className = className + '--opaque'
    getHeader()[add ? 'addClass' : 'removeClass']($className)
  }

  update (pageHeight, scrollY) {
    const tenth = pageHeight / 10
    this.opaque(scrollY > (tenth * 2))
    if (scrollY > tenth) {
      this.collapse()
    } else {
      this.expand()
    }
  }

  onScroll (evt, force) {
    if (this.isOpen()) {
      return
    }
    if (typeof evt === 'boolean' && typeof force === 'undefined') {
      force = evt
    }
    this.update(window.innerHeight, window.scrollY)
    if (isMobile()) {
      this.syncHeader(force)
    }
  }

  syncHeader (force) {
    const titleList = getTitleList()
    const visibleTitle = titleList.find('.' + activeTitleClass)
    const middleSection = selectSection(document.elementsFromPoint(window.innerWidth / 2, window.innerHeight / 2 + 1))

    if (!middleSection) return

    if (force || middleSection.id !== visibleTitle.data('sectionId')) {
      const target = titleList.find(`[data-section-id=${middleSection.id}]`)[0]
      visibleTitle.removeClass(activeTitleClass)
      target.classList.add(activeTitleClass)
      titleList.animate({ scrollTop: target.offsetTop - target.offsetHeight / 2 }, 200)
    }
  }

  scrollToSection (sectionId) {
    this.toggleMenu(false)
    const anchor = document.getElementById(sectionId)
    $('html,body').animate({
      scrollTop: anchor.offsetTop
    }, 200)
  }
}
