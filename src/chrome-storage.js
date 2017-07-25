const RSVP = require('rsvp')
const chrome = window.chrome

const includes = require('lodash/includes')

module.exports = function (storage) {
  return {
    set: function (store, data) {
      return new RSVP.Promise(function (resolve, reject) {
        var ref$
        const promise = storage.set((ref$ = {}, ref$[store + ''] = data, ref$), function (response) {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError.message)
          }
          return resolve(response)
        })
        return promise
      })
    },
    get: function (store) {
      return new RSVP.Promise(function (resolve, reject) {
        return storage.get(store + '', function (response) {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError.message)
          }
          return resolve(response)
        })
      })
    },
    remove: function (store) {
      return new RSVP.Promise(function (resolve, reject) {
        return storage.remove(store, function (response) {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError.message)
          }
          return resolve(response)
        })
      })
    },
    clear: function (store, key) {
      var self = this
      return new RSVP.Promise(function (resolve, reject) {
        return self.update(store, key, {}).then(function (response) {
          return resolve(response)
        })
      })
    },
    update: function (store, key, data) {
      var self = this
      return new RSVP.Promise(function (resolve, reject) {
        return self.get(store).then(function (response) {
          var newData
          newData = response[store]
          newData[key] = data
          return self.set(store, newData)
        }).then(function (response) {
          return resolve(response)
        })['catch'](function (error) {
          return reject(error)
        })
      })
    },
    add: function (store, data) {
      var self = this
      return new RSVP.Promise(function (resolve, reject) {
        return self.get(store).then(function (response) {
          var newData
          if (includes(response[store], data)) {
            reject('Resource already exists')
          }
          newData = response[store].push(data)
          return self.set(store, newData)
        }).then(function (response) {
          return resolve(response)
        })['catch'](function (error) {
          return reject(error)
        })
      })
    }
  }
}
