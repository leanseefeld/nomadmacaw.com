import $ from 'jquery'
import debounce from 'lodash/debounce'

export const className = 'nm-header'

export function getHeader () {
  return $('#header')
}

export function getTitleList () {
  return getHeader().find(`.${className}__title-list`)
}

export function selectSection (elements) {
  return elements.find(el => el.tagName === 'SECTION')
}

const activeTitleClass = className + '__title--active'

export default class Header {
  constructor () {
    this.scroll = {
      prevX: 0,
      prevY: 0
    }
    this.$syncSection = debounce(this.scrollToSection.bind(this), 100)
    this.$syncHeader = debounce(this.syncHeader.bind(this), 100)
  }

  mount () {
    const headings = $('section > h2')
    const elements = []
    headings.each((idx, el) => {
      const titleEl = document.createElement('div')
      titleEl.classList = className + '__title'
      titleEl.innerText = el.innerText
      titleEl.dataset.sectionId = el.parentElement.id
      elements.push(titleEl)
    }).detach()

    getTitleList().append(elements)
  }

  register () {
    const handler = this.onScroll.bind(this)
    window.addEventListener('scroll', handler)
    this.mount()
    this.update(window.innerHeight, window.scrollY)
    this.syncHeader()
    return function unregister () {
      window.removeEventListener('scroll', handler)
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

  onScroll (evt) {
    this.update(window.innerHeight, window.scrollY)
    // this.$syncSection()
    this.$syncHeader()
  }

  syncHeader () {
    const titleList = getTitleList()
    const visibleTitle = titleList.find('.' + activeTitleClass)
    const middleSection = selectSection(document.elementsFromPoint(1, window.innerHeight / 2 + 1))

    if (middleSection.id !== visibleTitle.data('sectionId')) {
      const listTop = titleList[0].getBoundingClientRect().top
      const target = titleList.find(`[data-section-id=${middleSection.id}]`)
      const targetTop = target[0].getBoundingClientRect().top
      visibleTitle.removeClass(activeTitleClass)
      target.addClass(activeTitleClass)
      titleList.animate({ scrollTop: titleList[0].scrollTop + (targetTop - listTop) }, 200)
    }
  }

  scrollToSection () {
    const scroll = this.scroll
    const topSection = selectSection(document.elementsFromPoint(10, 10))
    const bottomSection = selectSection(document.elementsFromPoint(10, window.innerHeight - 10))
    if (topSection !== bottomSection) {
      const anchor = scroll.prevY < window.scrollY ? bottomSection : topSection
      $('html,body').animate({
        scrollTop: anchor.offsetTop
      }, 200)
    }
    scroll.prevX = window.scrollX
    scroll.prevY = window.scrollY
  }
}
