const chrome = window.chrome
const version = '1.0.0'

const storage = require('./chrome-storage.js')(chrome.storage.local)

/*

function setIcon (path) {
  path == null && (path = 'icon-small.png')
  return chrome.browserAction.setIcon({
    path: path
  })
}

*/

function setBadgeText (text) {
  return chrome.browserAction.setBadgeText({
    text: text
  })
}

setBadgeText('1')

function setBadgeBackgroundColor (hex) {
  hex == null && (hex = '#5F30FF')
  return chrome.browserAction.setBadgeBackgroundColor({
    color: hex
  })
}

setBadgeBackgroundColor()

chrome.contextMenus.onClicked.addListener(function (tab) {
  console.log(tab)
  return chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function (tabs) {
    const url = tabs[0].url
    console.log(url)
    return chrome.tabs.sendMessage(tabs[0].id, {
      action: 'select text'
    }, function (response) {
      if (response.data) {
        return storage.set('selection', response.data).then(function (response) {
          return console.log(response)
        })
      }
    })
  })
})

const showForPages = ['https://soundcloud.com/*']

/*

function clearStack () {
  return chrome.storage.local.remove('stack', function (response) {
    return console.log('stack cleared')
  })
}

*/

chrome.runtime.onInstalled.addListener(function () {
  console.log('Installed version ' + version)
  chrome.contextMenus.create({
    title: 'Stack',
    id: 'parent',
    contexts: ['page', 'selection', 'link'],
    documentUrlPatterns: showForPages
  })
  chrome.contextMenus.create({
    title: 'Add tracks from selection',
    parentId: 'parent',
    contexts: ['selection'],
    id: 'child1',
    documentUrlPatterns: showForPages
  })
  chrome.contextMenus.create({
    title: 'Add tracks from current page',
    parentId: 'parent',
    contexts: ['page', 'selection', 'link'],
    id: 'child2',
    documentUrlPatterns: showForPages
  })
  return chrome.contextMenus.create({
    title: 'Clear stack',
    parentId: 'parent',
    contexts: ['page', 'selection', 'link'],
    id: 'child3'
  })
})

chrome.runtime.onMessageExternal.addListener(function (request, sender, sendResponse) {
  switch (request.message) {
    case 'import stack':
      storage.get('stack').then(function (response) {
        return sendResponse(response)
      })
      return true
    case 'reset stack':
      storage.remove('stack').then(function (response) {
        return sendResponse(response)
      })
      return true
    case 'version':
      sendResponse(version)
  }
  return false
})

chrome.webNavigation.onHistoryStateUpdated.addListener(function (details) {
  const tabUrl = details.url
  console.log(tabUrl)
  return chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function (tabs) {
    return chrome.tabs.sendMessage(tabs[0].id, {
      action: 'find tracks'
    }, function (response) {
      return console.log(response)
    })
  })
})
