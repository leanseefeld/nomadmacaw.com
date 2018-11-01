import $ from 'jquery'

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

export default class Header {
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
      titleEl.classList = className + '__title'
      titleEl.innerText = el.innerText
      const sectionId = titleEl.dataset.sectionId = el.parentElement.id
      titleEl.onclick = () => this.scrollToSection(sectionId)
      elements.push(titleEl)
    }).detach()

    getTitleList().append(elements)
  }

  register () {
    const handler = this.onScroll.bind(this)
    window.addEventListener('scroll', handler)
    this.mount()
    getHamburger().click(this.toggleMenu.bind(this))
    const header = getHeader()[0]
    header.addEventListener('transitionend', (evt) => {
      if (evt.target === header && evt.propertyName === 'height') {
        this.onScroll(true)
      }
    })
    getHeader().find(`.${className}__logo`).click(this.scrollToSection.bind(this, 'home'))
    this.onScroll()

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
    this.syncHeader(force)
  }

  syncHeader (force) {
    const titleList = getTitleList()
    const visibleTitle = titleList.find('.' + activeTitleClass)
    const middleSection = selectSection(document.elementsFromPoint(1, window.innerHeight / 2 + 1))

    if (force || middleSection.id !== visibleTitle.data('sectionId')) {
      const listTop = titleList[0].getBoundingClientRect().top
      const target = titleList.find(`[data-section-id=${middleSection.id}]`)
      const targetMiddle = target[0].getBoundingClientRect().top - target[0].getBoundingClientRect().height / 3
      visibleTitle.removeClass(activeTitleClass)
      target.addClass(activeTitleClass)
      titleList.animate({ scrollTop: titleList[0].scrollTop + (targetMiddle - listTop) }, 200)
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
