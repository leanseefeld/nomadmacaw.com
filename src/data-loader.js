import $ from 'jquery'

export default class DataLoader {
  constructor () {
    this._listeners = []
  }

  addListener (listener) {
    this._listeners.push(listener)
  }

  load () {
    return $.getJSON('/data.json').then(data => {
      for (let listener of this._listeners) {
        listener.onDataLoaded(data)
      }
      return data
    })
  }
}
