const chrome = window.chrome
// const config = require('./config')
const utils = require('./utils')
// const storage = require('./chrome-storage.js')(chrome.storage.local)

chrome.storage.onChanged.addListener(function (changes, namespace) {
  for (let key in changes) {
    let storageChange = changes[key]
    console.log('Storage key "%s" in namespace "%s" changed. ' + 'Old value was "%s", new value is "%s".', key, namespace, storageChange.oldValue, storageChange.newValue)
  }
})

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  var selection
  console.log(sender.tab ? 'from a content script:' + sender.tab.url : 'from the extension')
  switch (request.action) {
    case 'select text':
      selection = utils.getSelectedText().toString().split('\n').filter(function (e) {
        return e.replace(/(\r\n|\n|\r)/gm, '')
      })
      sendResponse({
        data: selection
      })
      break
    case 'find tracks':
      sendResponse('looking for tracks')
  }
  return false
})
