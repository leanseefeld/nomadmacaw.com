import HeaderController from './controllers/header'
import DataLoader from './data-loader'
import ServicesController from './controllers/services'
import AboutController from './controllers/about'
import ExperienceController from './controllers/experience'
import TestimonialsController from './controllers/testimonials'

new HeaderController().register()
new ServicesController().register()

const dataLoader = new DataLoader()
dataLoader.addListener(new AboutController())
dataLoader.addListener(new ExperienceController())
dataLoader.addListener(new TestimonialsController())
dataLoader.load()
