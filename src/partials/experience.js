import AbstractLoaderController from './AbstractLoaderController'
import experienceTemplate from './experience-template.ejs'
import $ from 'jquery'

export function findLastElementBeforeY (parent, y, elements) {
  if (y >= parent.offsetHeight) {
    return elements[elements.length - 1]
  }
  let p = 0
  let q = elements.length - 1
  let i = 0

  // binary search on array with repeated items
  while (p < q - 1) {
    i = Math.floor((p + q) / 2)
    const currentOffsetTop = elements[i].offsetTop
    if (currentOffsetTop < y) {
      p = i
      while (p < q && elements[p + 1].offsetTop === currentOffsetTop) p++
    } else {
      q = i
      while (p < q && elements[q - 1].offsetTop === currentOffsetTop) q--
    }
  }
  return elements[p]
}

function configToggleHandler (toggle, fullContent, collapsedContent) {
  const expandedSummaryClass = 'c-experience__summary--expanded'

  toggle.addEventListener('click', () => {
    const summary = toggle.parentElement.parentElement // div.toggle < p < div.summary
    toggle.remove()
    if (!summary.classList.contains(expandedSummaryClass)) {
      toggle.lastElementChild.innerHTML = 'See less'
      toggle.firstChild.textContent = ' '
      summary.innerHTML = fullContent
      summary.classList.add(expandedSummaryClass)
    } else {
      toggle.lastElementChild.innerHTML = 'see more'
      toggle.firstChild.textContent = '... '
      summary.innerHTML = collapsedContent
      summary.classList.remove(expandedSummaryClass)
    }
    summary.lastElementChild.appendChild(toggle)
  })
}

export function collapseSummary (container) {
  const elements = container.querySelectorAll('.c-experience__summary')
  for (let summary of elements) {
    const toggle = summary.querySelector('.c-experience__summary__toggle')
    const toggleWidth = toggle.offsetWidth
    toggle.remove()

    const heightPercentage = Math.floor(summary.offsetHeight * 100 / window.innerHeight)
    if (heightPercentage > 20) {
      const originalHtml = summary.innerHTML

      for (let p of summary.querySelectorAll('p')) {
        p.innerHTML = p.textContent.split(/\s/).map(word => `<span>${word}</span>`).join(' ')
      }
      const wordElements = summary.querySelectorAll('p > span')
      let spaceAfter = 0
      let lastVisibleWord
      do {
        lastVisibleWord = lastVisibleWord
          ? lastVisibleWord.previousElementSibling
          : findLastElementBeforeY(summary, window.innerHeight * 0.2, wordElements)
        spaceAfter = summary.offsetWidth - (lastVisibleWord.offsetLeft + lastVisibleWord.offsetWidth)
      } while (spaceAfter < toggleWidth)

      while (lastVisibleWord.nextSibling) {
        lastVisibleWord.nextSibling.remove()
      }
      while (lastVisibleWord.parentElement.nextElementSibling) {
        lastVisibleWord.parentElement.nextElementSibling.remove()
      }
      for (let p of summary.children) {
        p.innerHTML = p.textContent
      }

      configToggleHandler(toggle, originalHtml, summary.innerHTML)

      summary.lastElementChild.appendChild(toggle)
    }
  }
}

export function getExperienceFromPoints (x, y) {
  let targetElements = document.elementsFromPoint(x, y)
  let target
  do {
    target = targetElements.shift()
  } while (targetElements.length && !target.classList.contains('c-experience'))
  return target
}

export default class ExperienceController extends AbstractLoaderController {
  constructor () {
    super('experience')
    this._scrollInfo = {}
  }

  configureScroll (wrapper) {
    wrapper.addEventListener('touchstart', (evt) => {
      if (this._scrollInfo.active) {
        return
      }
      this._scrollInfo = {
        active: true,
        startPoint: {
          x: evt.touches[0].clientX,
          y: evt.touches[0].clientY
        },
        scrollLeft: wrapper.scrollLeft
      }
      this._scrollInfo.activeArticle = getExperienceFromPoints(
        this._scrollInfo.startPoint.x,
        this._scrollInfo.startPoint.y
      )
    })

    wrapper.addEventListener('touchmove', (evt) => {
      wrapper.scrollLeft = this._scrollInfo.scrollLeft + (this._scrollInfo.startPoint.x - evt.touches[0].clientX)
      this._scrollInfo.lastPoint = {
        x: evt.touches[0].clientX,
        y: evt.touches[0].clientY
      }
    })

    const touchEndHandler = (evt) => {
      if (this._scrollInfo.lastPoint) {
        const direction = this._scrollInfo.startPoint.x < this._scrollInfo.lastPoint.x ? 'RIGHT' : 'LEFT'

        const minimumOffset = Math.floor(window.innerWidth / 5)
        const targetX = direction === 'LEFT' ? window.innerWidth - minimumOffset : minimumOffset
        let target = getExperienceFromPoints(targetX, Math.max(0, wrapper.getBoundingClientRect().y))
        const activeArticle = this._scrollInfo.activeArticle
        $(wrapper).animate({
          scrollLeft: target.offsetLeft
        }, 200, () => {
          if (target !== activeArticle) {
            $('html,body').animate({
              scrollTop: wrapper.offsetTop - document.getElementById('header').offsetHeight * 2
            }, 100)
          }
        })
      }
      this._scrollInfo = {}
    }
    wrapper.addEventListener('touchend', touchEndHandler)
    wrapper.addEventListener('touchcancel', touchEndHandler)
  }

  onDataLoaded (data) {
    super.onDataLoaded(data)
    const wrapper = document.querySelector('#experience .l-experience-wrapper')
    wrapper.innerHTML = experienceTemplate({ experiences: data.experiences })
    collapseSummary(wrapper)
    this.configureScroll(wrapper)
  }
}
