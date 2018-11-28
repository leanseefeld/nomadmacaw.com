import AbstractLoaderController from './AbstractLoaderController'
import experienceTemplate from '../partials/experience-template.ejs'
import { parse as parseText } from '../helpers/text-parser'
import * as domQueries from '../helpers/dom-queries'

function configToggleHandler (container, toggle, fullContent, collapsedContent) {
  const insertLast = () => domQueries.findLastInnermostElement(container).insertAdjacentElement('beforeend', toggle)

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

function spannizeElementContents (element) {
  if (!element.childElementCount) {
    element.innerHTML = element.textContent.split(/\s+/).map(word => word ? `<span nm-generated>${word}</span>` : '').join(' ')
  } else {
    for (let i = 0; i < element.childElementCount; i++) {
      spannizeElementContents(element.children.item(i))
    }
  }
}

function unspannizeElementContents (element) {
  if (element.tagName === 'SPAN' && element.getAttribute('nm-generated') !== null) {
    element.parentElement.innerHTML = element.parentElement.textContent
    return true
  } else {
    for (let i = 0; i < element.childElementCount; i++) {
      if (unspannizeElementContents(element.children.item(i))) {
        break
      }
    }
  }
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

      spannizeElementContents(summary)
      const wordElements = summary.querySelectorAll('span')
      let spaceAfter = 0
      let lastVisibleWord
      do {
        lastVisibleWord = lastVisibleWord
          ? lastVisibleWord.previousElementSibling
          : domQueries.lastChildBeforeOffsetTop(summary, window.innerHeight * 0.4, wordElements)
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
      unspannizeElementContents(summary)

      configToggleHandler(summary, toggle, originalHtml, summary.innerHTML)
    }
  }
}

export class Container {
  constructor (selector, applyTransition) {
    this.selector = selector
    this.$transform = { x: 0, y: 0 }
    this.maxOffsetX = 0
    if (applyTransition) {
      this.applyTransition = applyTransition
    }
  }

  get element () {
    return document.querySelector(this.selector)
  }

  transform (x, y = 0) {
    this.$transform.x = Math.min(Math.max(-this.maxOffsetX, x), 0)
    this.$transform.y = Math.min(y, 0)
    return this
  }

  transformBy (deltaX, deltaY = 0) {
    const pX = this.$transform.x
    const pY = this.$transform.y
    return this.transform(pX + deltaX, pY + deltaY)
  }

  computeElementPosition (element) {
    const bcr = element.getBoundingClientRect()
    return {
      left: bcr.x * 100 / window.innerWidth,
      right: (bcr.x + bcr.width) * 100 / window.innerWidth
    }
  }

  apply () {
    const { x, y } = this.$transform
    this.element.style.transform = `translate(${x}px, ${y}px)`
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

export class ExperiencesContainer extends Container {
  get maxOffsetX () {
    if (this.$maxOffsetX) {
      return this.$maxOffsetX
    }
    const containerEl = this.element
    const firstChildEl = containerEl.firstElementChild
    let width = containerEl.scrollWidth - window.innerWidth

    if (firstChildEl.computedStyleMap) {
      width += firstChildEl.computedStyleMap().get('margin-left').value
      width += containerEl.computedStyleMap().get('padding-left').value
    } else {
      width += +window.getComputedStyle(firstChildEl)
        .getPropertyValue('margin-left').replace('px', '')
      width += +window.getComputedStyle(containerEl)
        .getPropertyValue('padding-left').replace('px', '')
    }
    return (this.$maxOffsetX = width)
  }

  set maxOffsetX (value) { /* ignored */ }
}

function animate (duration, from, to, animateFrame) {
  let start
  const incrementPerMili = (to - from) / duration

  let requestAnimationFrame = window.requestAnimationFrame
  if (!requestAnimationFrame) {
    requestAnimationFrame = (callback) => setTimeout(() => {
      const timestamp = +new Date()
      callback(timestamp)
    }, 16)
  }

  requestAnimationFrame(function computeFrame (time) {
    if (!start) start = time
    let value = from + (time - start) * incrementPerMili
    if (incrementPerMili > 0) {
      value = Math.min(to, value)
    } else {
      value = Math.max(to, value)
    }
    animateFrame(value)
    if (value !== to) {
      requestAnimationFrame(computeFrame)
    }
  })
}

export default class ExperienceController extends AbstractLoaderController {
  constructor () {
    super('experience')
    this.$touches = {
      first: null,
      last: null
    }
    this.content = new ExperiencesContainer('#experience .c-experiences__content')
  }

  slideExperiencesBy (deltaX) {
    this.content.transformBy(deltaX).apply()
    this.paginator.transformBy(deltaX * this.paginator.scrollRatio).apply()
  }

  setExperiencesPosition (x, y) {
    this.content.transform(x, y).apply()
    this.paginator.transform(x * this.paginator.scrollRatio, y).apply()
  }

  slideToExperience (experience) {
    if (typeof experience === 'string') {
      experience = this.content.element.querySelector(`[data-company-id="${experience}"]`)
    }
    const experienceBcr = experience.getBoundingClientRect()
    const offset = experienceBcr.x + (experienceBcr.width / 2) - (window.innerWidth / 2)
    const x = this.content.$transform.x
    animate(100, x, x - offset, this.setExperiencesPosition.bind(this))
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
      if (this.$touches.last) {
        const direction = this.$touches.first.x < this.$touches.last.x ? 'RIGHT' : 'LEFT'

        const minimumOffset = Math.floor(window.innerWidth / 5)
        const targetX = direction === 'LEFT' ? window.innerWidth - minimumOffset : minimumOffset
        let target = domQueries.childAtOrBeforeX(this.content.element, targetX)
        if (!target) {
          target = domQueries.childAtOrBeforeX(this.content.element, window.innerWidth / 2)
        }
        this.slideToExperience(target)
      }
    }
    wrapper.addEventListener('touchend', touchEndHandler)
    wrapper.addEventListener('touchcancel', touchEndHandler)
    this.slideToExperience(this.content.element.firstElementChild)
  }

  configurePaginator () {
    const computeTransition = function (element, position) {
      let mid = Math.min(Math.max((position.left + position.right) / 2, 0), 100)
      if (mid > 50) mid = 50 - (mid - 50)
      element.style.opacity = 0.2 + 0.8 * mid / 50
    }

    this.paginator = new Container('#experience .c-experiences__paginator', computeTransition)
    const container = this.paginator.element
    const firstPage = container.firstElementChild

    let firstExperienceBcr = this.content.element.firstElementChild.getBoundingClientRect()

    firstPage.style.left = (firstExperienceBcr.x + (firstExperienceBcr.width - firstPage.offsetWidth) / 2) + 'px'
    firstPage.style.opacity = 1

    const secondPage = firstPage.nextElementSibling
    secondPage.style.left = firstExperienceBcr.x + firstExperienceBcr.width - secondPage.offsetWidth / 2 + 'px'

    const firstMidpoint = firstPage.offsetLeft + firstPage.offsetWidth / 2
    let lastMidpoint = secondPage.offsetLeft + secondPage.offsetWidth / 2
    const midpointDistance = lastMidpoint - firstMidpoint

    for (let i = 2, j = container.childElementCount; i < j; i++) {
      const page = container.children.item(i)
      lastMidpoint += midpointDistance
      page.style.left = lastMidpoint - page.offsetWidth / 2 + 'px'
    }
    const inserts = []
    for (let i = 1, j = container.childElementCount; i < j; i++) {
      const prevPage = container.children.item(i - 1)
      const nextPage = prevPage.nextElementSibling
      const separator = document.createElement('DIV')
      separator.className = 'c-experiences__page-separator'
      separator.style.left = `calc(${prevPage.offsetLeft + prevPage.offsetWidth}px + 1rem)`
      separator.style.width = `calc(${nextPage.offsetLeft - prevPage.offsetLeft - prevPage.offsetWidth}px - 2rem)`
      separator.setAttribute('nm-ignore-animation', '')
      inserts.push(() => prevPage.insertAdjacentElement('afterend', separator))
    }
    inserts.forEach(fn => fn())

    const paginatorWidth = container.lastElementChild.offsetLeft + (container.lastElementChild.offsetWidth / 2) - firstPage.offsetLeft
    this.paginator.maxOffsetX = paginatorWidth
    this.paginator.scrollRatio = paginatorWidth / this.content.maxOffsetX

    container.addEventListener('click', (evt) => {
      if (evt.target.dataset.companyId) {
        evt.preventDefault()
        this.slideToExperience(evt.target.dataset.companyId)
      }
    })
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
    this.configurePaginator()
    this.configureTouchListeners(wrapper)
  }
}
