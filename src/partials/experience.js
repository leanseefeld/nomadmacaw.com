import experienceTemplate from './experience-template.ejs'

export function findLastElementBeforeY (parent, y, elements) {
  if (y >= parent.offsetHeight) {
    return elements[elements.length - 1]
  }
  let p = 0
  let q = elements.length - 1
  let i = 0

  while (p !== q) {
    i = Math.floor((p + q) / 2)
    if (elements[i].offsetTop < y) {
      p = i + 1
    } else {
      q = i - 1
    }
  }
  return elements[i]
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
    const heightPercentage = summary.offsetHeight * 100 / window.innerHeight
    if (heightPercentage > 20) {
      const toggle = summary.querySelector('.c-experience__summary__toggle')
      const toggleWidth = toggle.offsetWidth
      toggle.remove()

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

export default class ExperienceController {
  removeLoader () {
    document.querySelector('#experience .c-loading-icon').remove()
  }

  onDataLoaded (data) {
    this.removeLoader()
    const wrapper = document.querySelector('#experience .l-experience-wrapper')
    wrapper.innerHTML = experienceTemplate({ experiences: data.experiences })
    collapseSummary(wrapper)
  }
}
