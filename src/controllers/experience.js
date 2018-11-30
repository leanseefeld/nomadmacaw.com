import AbstractLoaderController from './AbstractLoaderController'
import experienceTemplate from '../partials/experience-template.ejs'
import { parse as parseText } from '../helpers/text-parser'
import * as domUtils from '../helpers/dom-utils'
import animateValue from '../helpers/animate'

function configToggleHandler (container, toggle, fullContent, collapsedContent) {
  const insertLast = () => domUtils.findLastInnermostElement(container).insertAdjacentElement('beforeend', toggle)

  const expandedSummaryClass = 'c-experience__summary--expanded'

  toggle.addEventListener('click', () => {
    toggle.remove()
    if (!container.classList.contains(expandedSummaryClass)) {
      toggle.lastElementChild.innerHTML = 'See less'
      toggle.firstChild.textContent = ' '
      container.innerHTML = fullContent
      container.classList.add(expandedSummaryClass)
    } else {
      toggle.lastElementChild.innerHTML = 'see more'
      toggle.firstChild.textContent = '... '
      container.innerHTML = collapsedContent
      container.classList.remove(expandedSummaryClass)
    }
    insertLast()
  })

  insertLast()
}

export function collapseSummary (container) {
  const elements = container.querySelectorAll('.c-experience__summary')
  for (let summary of elements) {
    const toggle = summary.querySelector('.c-experience__summary__toggle')
    const toggleWidth = toggle.offsetWidth
    toggle.remove()

    const heightPercentage = Math.floor(summary.offsetHeight * 100 / window.innerHeight)
    if (heightPercentage > 40) {
      const originalHtml = summary.innerHTML

      domUtils.spannizeElementContents(summary)
      const wordElements = summary.querySelectorAll('span')
      let spaceAfter = 0
      let lastVisibleWord
      do {
        lastVisibleWord = lastVisibleWord
          ? lastVisibleWord.previousElementSibling
          : domUtils.lastChildBeforeOffsetTop(summary, window.innerHeight * 0.4, wordElements)
        spaceAfter = summary.offsetWidth - (lastVisibleWord.offsetLeft + lastVisibleWord.offsetWidth)
      } while (spaceAfter < toggleWidth)

      while (lastVisibleWord.nextSibling) {
        lastVisibleWord.nextSibling.remove()
      }
      let parent = lastVisibleWord.parentElement
      while (parent !== summary) {
        while (parent.nextElementSibling) {
          parent.nextElementSibling.remove()
        }
        parent = parent.parentElement
      }
      domUtils.unspannizeElementContents(summary)

      configToggleHandler(summary, toggle, originalHtml, summary.innerHTML)
    }
  }
}

export default class ExperienceController extends AbstractLoaderController {
  constructor () {
    super('experience')
    this.$touches = {
      first: null,
      last: null
    }

    const opacityForPosition = function (element, position) {
      let mid = Math.min(Math.max((position.left + position.right) / 2, 0), 100)
      if (mid > 50) mid = 50 - (mid - 50)
      element.style.opacity = mid / 50
    }

    this.content = new ScrollableContainer('#experience .c-experiences__content', opacityForPosition)
    this.paginator = new ScrollableContainer('#experience .c-experiences__paginator', opacityForPosition)
  }

  onDataLoaded (data) {
    super.onDataLoaded(data)
    const wrapper = document.querySelector('#experience .c-experiences')
    const experiences = data.experiences.map(exp => ({
      ...exp,
      summary: parseText(exp.summary)
    }))
    wrapper.innerHTML = experienceTemplate({ experiences })
    collapseSummary(wrapper)
    this.configureTouchListeners(wrapper)

    this.paginator.element.addEventListener('click', (evt) => {
      if (evt.target.dataset.companyId) {
        evt.preventDefault()
        this.slideToExperience(evt.target.dataset.companyId)
      }
    })

    const onResize = () => {
      this.configurePaginator()
      this.slideToExperience(domUtils.childAtOrBeforeX(this.content.element, window.innerWidth / 2), false)
    }
    window.addEventListener('resize', onResize)
    onResize()
  }

  slideExperiencesBy (deltaX) {
    this.content.transformBy(deltaX).apply()
    this.paginator.transform(this.content.$transform.x * this.paginator.scrollRatio).apply()
  }

  setExperiencesPosition (x) {
    this.content.transform(x).apply()
    this.paginator.transform(x * this.paginator.scrollRatio).apply()
  }

  slideToExperience (experience, animate = true) {
    if (typeof experience === 'string') {
      experience = this.content.element.querySelector(`[data-company-id="${experience}"]`)
    }
    const experienceBcr = experience.getBoundingClientRect()
    const offset = experienceBcr.x + (experienceBcr.width / 2) - (window.innerWidth / 2)
    const x = this.content.$transform.x
    if (animate) {
      animateValue(200, x, x - offset, this.setExperiencesPosition.bind(this))
    } else {
      this.setExperiencesPosition(x - offset)
    }
  }

  configureTouchListeners (wrapper) {
    wrapper.addEventListener('touchstart', (evt) => {
      this.$touches.first = {
        x: evt.touches[0].clientX,
        y: evt.touches[0].clientY
      }
      this.$touches.last = this.$touches.first
    }, { passive: true })

    wrapper.addEventListener('touchmove', (evt) => {
      const lastTouch = {
        x: evt.touches[0].clientX,
        y: evt.touches[0].clientY
      }
      const prevTouch = this.$touches.last
      const deltaX = lastTouch.x - prevTouch.x
      window.requestAnimationFrame(() => this.slideExperiencesBy(deltaX))
      this.$touches.last = lastTouch
    }, { passive: true })

    const touchEndHandler = (evt) => {
      if (!this.$touches.last) return
      const direction = this.$touches.first.x < this.$touches.last.x ? 'RIGHT' : 'LEFT'

      const minimumOffset = Math.floor(window.innerWidth / 5)
      const targetX = direction === 'LEFT' ? window.innerWidth - minimumOffset : minimumOffset
      let target = domUtils.childAtOrBeforeX(this.content.element, targetX)
      if (!target) {
        target = domUtils.childAtOrBeforeX(this.content.element, window.innerWidth / 2)
      }
      this.slideToExperience(target)
    }
    wrapper.addEventListener('touchend', touchEndHandler, { passive: true })
    wrapper.addEventListener('touchcancel', touchEndHandler, { passive: true })
  }

  configurePaginator () {
    const experiences = Array.from(this.content.element.children)
    const pages = Array.from(this.paginator.element.querySelectorAll('.c-experiences__page'))
    const separators = Array.from(this.paginator.element.querySelectorAll('.c-experiences__page-separator'))

    const paginatorPageWidth = (experiences[0].offsetWidth - pages[1].offsetWidth) / 2
    const contentPageWidth = experiences[1].offsetLeft - experiences[0].offsetLeft
    const pageWidthRatio = paginatorPageWidth / contentPageWidth

    const screenMiddle = window.innerWidth / 2
    const initialOffset = screenMiddle - (experiences[0].offsetLeft + experiences[0].offsetWidth / 2)
    const offsetMiddle = domUtils.offsetMiddle

    pages[0].style.left = screenMiddle - pages[0].offsetWidth / 2 - initialOffset * pageWidthRatio + 'px'
    pages[1].style.left = offsetMiddle(pages[0]) + experiences[0].offsetWidth / 2 - pages[1].offsetWidth + 'px'

    const middleDistance = offsetMiddle(pages[1]) - offsetMiddle(pages[0])
    for (let i = 2; i < pages.length; i++) {
      pages[i].style.left = offsetMiddle(pages[0]) + middleDistance * i - pages[i].offsetWidth / 2 + 'px'
    }

    for (let i = 0; i < separators.length; i++) {
      const prevPage = pages[i]
      const nextPage = pages[i + 1]
      const separator = separators[i]
      separator.style.left = `calc(${prevPage.offsetLeft + prevPage.offsetWidth}px + 1rem)`
      separator.style.width = `calc(${nextPage.offsetLeft - prevPage.offsetLeft - prevPage.offsetWidth}px - 2rem)`
    }

    this.paginator.scrollRatio = pageWidthRatio
  }
}

export class ScrollableContainer {
  constructor (selector, applyTransition) {
    this.selector = selector
    this.$transform = { x: 0 }
    this.applyTransition = applyTransition
  }

  get maxOffsetX () {
    return (window.innerWidth - this.element.firstElementChild.offsetWidth) / 2
  }

  get minOffsetX () {
    return -this.element.lastElementChild.offsetLeft
  }

  get element () {
    return document.querySelector(this.selector)
  }

  transform (x) {
    this.$transform.x = Math.min(this.maxOffsetX, Math.max(this.minOffsetX, x))
    return this
  }

  transformBy (deltaX) {
    const pX = this.$transform.x
    return this.transform(pX + deltaX)
  }

  computeElementPosition (element) {
    const bcr = element.getBoundingClientRect()
    return {
      left: bcr.x * 100 / window.innerWidth,
      right: (bcr.x + bcr.width) * 100 / window.innerWidth
    }
  }

  apply () {
    const x = this.$transform.x
    this.element.style.transform = `translateX(${x}px)`
    if (this.applyTransition) {
      for (let element of this.element.children) {
        if (element.getAttribute('nm-ignore-animation') === null) {
          this.applyTransition(element, this.computeElementPosition(element))
        }
      }
    }
    return this
  }
}
