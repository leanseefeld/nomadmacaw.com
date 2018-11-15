import $ from 'jquery'

export const STATE = {
  IDLE: 'IDLE',
  MONITORING: 'MONITORING',
  ANIMATING: 'ANIMATING'
}

export default class ParallaxController {
  constructor () {
    this.state = STATE.IDLE
  }

  get homeSection () {
    return document.querySelector('section.l-home')
  }

  get homeBackground () {
    return document.querySelector('section.l-home .l-home__gradient')
  }

  get paperStreak () {
    return document.querySelector('section.l-home .l-home__paper-streak')
  }

  get visibleSection () {
    let section = this.homeSection
    let bcr
    while (section && (bcr = section.getBoundingClientRect()) && bcr.y + bcr.height < window.innerHeight / 2) {
      section = section.nextElementSibling
    }
    return section
  }

  configureGradientAnimation () {
    const nextSectionTop = this.homeSection.nextElementSibling.offsetTop
    this.opacityStep = 1 / (nextSectionTop - window.innerHeight / 2)
  }

  configurePaperStreakAnimation () {
    // svg height * css-bg-size
    this.paperStreakStep = window.innerHeight * 5 / document.scrollingElement.scrollHeight
  }

  register () {
    this.configureGradientAnimation()
    this.configurePaperStreakAnimation()

    window.addEventListener('scroll', (evt) => {
      window.requestAnimationFrame(() => {
        const scrollTop = document.scrollingElement.scrollTop
        this.homeBackground.style.opacity = 1 - this.opacityStep * scrollTop
        this.paperStreak.style['background-position-y'] = 210 - this.paperStreakStep * scrollTop + 'px'
      })

      if (this.state === STATE.IDLE) {
        if (+new Date() - this.$animationFinishedTime < 200) {
          return
        }
        this.state = STATE.MONITORING
        const visibleSection = this.visibleSection
        const initialScroll = document.scrollingElement.scrollTop

        setTimeout(() => {
          const currentScroll = document.scrollingElement.scrollTop
          // TODO: scroll top
          if (currentScroll < visibleSection.offsetTop + window.innerHeight / 5 + (visibleSection.offsetHeight - window.innerHeight)) {
            this.state = STATE.IDLE
            return
          }

          let targetSection
          if (currentScroll > initialScroll) {
            targetSection = visibleSection.nextElementSibling
          } else {
            targetSection = visibleSection.previousElementSibling
          }
          if (targetSection && targetSection.tagName === 'SECTION') {
            this.state = STATE.ANIMATING
            $(document.scrollingElement).animate({
              scrollTop: targetSection.offsetTop
            }, 400, () => {
              this.$animationFinishedTime = +new Date()
              this.state = STATE.IDLE
            })
          } else {
            this.state = STATE.IDLE
          }
        }, 200)
      }
    })
  }
}
