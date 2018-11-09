import HeaderController from './controllers/header'
import DataLoader from './data-loader'
import ExperienceController from './controllers/experience'
import TestimonialsController from './controllers/testimonials'
import ServicesController from './controllers/services'

new HeaderController().register()
new ServicesController().register()

const dataLoader = new DataLoader()
dataLoader.addListener(new ExperienceController())
dataLoader.addListener(new TestimonialsController())
dataLoader.load()
