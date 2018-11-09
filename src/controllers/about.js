import AbstractLoaderController from './AbstractLoaderController'

export default class AboutController extends AbstractLoaderController {
  constructor () {
    super('about')

    const contentPromise = new Promise((resolve, reject) => {
      this.contentReceived = resolve
    })

    document.querySelector('#about .about__expand').addEventListener('click',
      () => contentPromise.then((content) => {
        document.querySelector('#about .about-message').innerHTML = content
      }))
  }

  onDataLoaded (data) {
    super.onDataLoaded(data)
    this.contentReceived('<p>' + data.about.join('</p><p>') + '</p>')
  }
}
