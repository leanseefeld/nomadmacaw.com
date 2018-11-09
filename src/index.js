import HeaderController from './controllers/header'
import DataLoader from './data-loader'
import ExperienceController from './controllers/experience'
import TestimonialsController from './controllers/testimonials'

new HeaderController().register()

const dataLoader = new DataLoader()
dataLoader.addListener(new ExperienceController())
dataLoader.addListener(new TestimonialsController())
dataLoader.load()
