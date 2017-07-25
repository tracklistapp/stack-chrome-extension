var RSVP = require('rsvp')

const chrome = window.chrome

module.exports = {
  matchUrl: function (n) {
    if (n != null) {
      return window.location.href.match(n)
    }
  },
  getSelectedText: function () {
    if (window.getSelection) {
      return window.getSelection().toString()
    } else if (document.selection) {
      return document.selection.createRange().text
    }
    return ''
  },
  importHtml: function (href) {
    var promise
    promise = new RSVP.Promise(function (resolve, reject) {
      var elem
      if ('import' in document.createElement('link')) {
        elem = document.createElement('link')
        elem.rel = 'import'
        elem.href = chrome.extension.getURL(href)
        elem.onload = function (e) {
          return resolve(e)
        }
        elem.onerror = function (e) {
          return reject(Error(e))
        }
        return document.head.appendChild(elem)
      } else {
        return reject(Error('Html import not supported'))
      }
    })
    return promise
  },
  getParameterByName: function (name, url) {
    var regex, results
    if (!url) {
      url = window.location.href
    }
    url = url.toLowerCase()
    name = name.replace(/[[\]]/g, '\\$&').toLowerCase()
    regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)')
    results = regex.exec(url)
    if (!results) {
      return null
    }
    if (!results[2]) {
      return ''
    }
    return decodeURIComponent(results[2].replace(/\+/g, ' '))
  }
}
