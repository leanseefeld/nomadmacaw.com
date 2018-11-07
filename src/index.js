import Header from './partials/header'
import DataLoader from './data-loader'
import ExperienceController from './partials/experience'

new Header().register()

const dataLoader = new DataLoader()
dataLoader.addListener(new ExperienceController())
dataLoader.load()
