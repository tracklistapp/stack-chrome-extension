const chrome = window.chrome
const html = require('choo/html')
const css = require('sheetify')
const choo = require('choo')
const logger = require('choo-log')
const icon = require('./elements/icon.js')
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

/*
 * Restyle soundcloud
 */

css('./styles/layout.css')

const prefix = css`
  :host {
    background: #323232;
    flex: 1;
    max-height: 100vh;
    overflow-y: scroll;
  }
  :host .stack-topbar {
    margin-top: 46px;
    height: 60px;
    background: #161616;
    display: flex;
    position: sticky;
    top: 0;
    flex-shrink: 0;
    z-index: 1;
    justify-content: center;
    align-items: center;
  }
`

const bodyStyle = css`
  :host {
    padding-bottom: 0;
    display: flex;
    background: #fff;
  }
`

const appStyle = css`
  :host {
    flex: 2;
    max-height: 100vh;
    overflow-y: scroll;
  }
`

const body = document.querySelector('body')

body.classList.add(bodyStyle)

document.querySelector('#app').classList.add(appStyle)
document.querySelector('#content').style.width = 'auto'

body.appendChild(html`<div id="stack"></div>`) // create div for choo to mount on

/*
 * Choo app
 */

const app = choo()

app.use(logger())

app.use((state, emitter) => {
  emitter.on('DOMContentLoaded', () => {
    console.log('Hello choo')
  })
})

app.route('*', (state, emitter) => {
  return html`
    <div class=${prefix} id="stack">
      <div class="stack-topbar">
        ${icon('stack', {'class': 'icon icon-large icon-stack'})}
      </div>
    </div>
  `
})

app.mount('#stack')

const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="display:none">
    <symbol viewBox='0 0 100 100' id='icon-play'>
      <title>icon play</title>
      <path d="M100 50c0-27.6-22.4-50-50-50S0 22.4 0 50s22.4 50 50 50 50-22.4 50-50zM4.76 50C4.76 25.02 25.02 4.76 50 4.76S95.24 25.02 95.24 50 74.98 95.24 50 95.24 4.76 74.98 4.76 50z"></path><path d="M33.06 33.84v32.32c0 3.35 2.7 6.06 6.06 6.06.02 0 .05-2.02.05-2.02l-.04 2.02c1.1.03 2.2-.25 3.16-.8L70.2 55.27l-1-1.75.97 1.77c.48-.27.94-.6 1.34-1.02.52-.5.94-1.12 1.24-1.8.35-.78.53-1.63.53-2.48 0-.85-.17-1.7-.52-2.5-.3-.66-.72-1.27-1.24-1.8-.4-.4-.86-.73-1.35-1l-1 1.77 1.02-1.75L42.3 28.6c-.98-.57-2.07-.85-3.17-.82l.04 2.02.03-2.02c-3.43 0-6.14 2.7-6.14 6.06zm7.2-1.75L68.2 48.2c.2.1.35.22.48.35.18.17.3.38.4.6.13.26.2.54.2.83 0 .3-.07.57-.18.83-.1.22-.24.43-.42.6-.13.13-.28.25-.45.34L40.27 67.9c-.33.2-.7.3-1.05.28h-.1c-1.12 0-2.02-.9-2.02-2.02V33.84c0-1.12.9-2.02 2.02-2.02.46 0 .82.08 1.15.27z"></path>
    </symbol>
    <symbol viewBox='0 0 100 100' id='icon-pause'>
      <title>icon pause</title>
      <path d="M100 50c0-27.6-22.4-50-50-50S0 22.4 0 50s22.4 50 50 50 50-22.4 50-50zM4.76 50C4.76 25.02 25.02 4.76 50 4.76S95.24 25.02 95.24 50 74.98 95.24 50 95.24 4.76 74.98 4.76 50z"></path><path d="M32.22 36.1v27.8c0 2.14 1.74 3.88 3.9 3.88 2.13 0 3.88-1.75 3.88-3.9V36.12c0-2.14-1.74-3.88-3.9-3.88-2.13 0-3.88 1.75-3.88 3.9zm-4.44 0c0-4.6 3.74-8.32 8.33-8.32 4.6 0 8.34 3.73 8.34 8.33v27.8c0 4.6-3.74 8.32-8.33 8.32-4.6 0-8.32-3.73-8.32-8.33V36.1zM60 36.1v27.8c0 2.14 1.74 3.88 3.9 3.88 2.13 0 3.88-1.75 3.88-3.9V36.12c0-2.14-1.74-3.88-3.9-3.88-2.13 0-3.88 1.75-3.88 3.9zm-4.44 0c0-4.6 3.74-8.32 8.33-8.32 4.6 0 8.32 3.73 8.32 8.33v27.8c0 4.6-3.74 8.32-8.33 8.32-4.6 0-8.34-3.73-8.34-8.33V36.1z"></path>
    </symbol>
    <symbol viewBox='0 0 100 100' id='icon-stack'>
      <title>icon stack</title>
      <path d="M95 47l5 2.8L50 77 0 50l5-3 45 24.7"></path>
      <path d="M95 57l5 2.8L50 87 0 60l5-3 45 24.7"></path>
      <path d="M50 13l50 27.4-50 27.3L0 40.4"></path>
    </symbol>
  </svg>
`

const div = document.createElement('div')
div.innerHTML = svg

document.body.appendChild(div, document.body.firstChild)
