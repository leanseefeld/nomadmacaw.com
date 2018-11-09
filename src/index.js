import Header from './partials/header'
import DataLoader from './data-loader'
import ExperienceController from './partials/experience'
import TestimonialsController from './partials/testimonials'

new Header().register()

const dataLoader = new DataLoader()
dataLoader.addListener(new ExperienceController())
dataLoader.addListener(new TestimonialsController())
dataLoader.load()
