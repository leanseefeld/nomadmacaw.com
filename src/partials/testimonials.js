import AbstractLoaderController from './AbstractLoaderController'
import testimonialTemplate from './testimonial-template.ejs'

export default class TestinomialsController extends AbstractLoaderController {
  constructor () {
    super('testimonials')
  }

  onDataLoaded (data) {
    super.onDataLoaded(data)
    const testimonialsHtml = data.testimonials
      .map(testimonial => testimonialTemplate({ testimonial }))
      .join('\n')
    document.querySelector('#testimonials .l-testimonials-wrapper')
      .innerHTML = testimonialsHtml
  }
}
