const choo = require('choo')
const css = require('sheetify')
const icon = require('./elements/icon')

css('./styles/layout.css')

const prefix = css`
  :host {
    background: #161616;
    color: #fff;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    align-content: center;
    width: 220px;
    height: 220px;
  }
`
const html = require('choo/html')
const app = choo()

app.route('*', function (state, emitter) {
  return html`
    <div class=${prefix} id="app">
      ${icon('stack', {'class': 'icon icon-large icon-stack'})}
      <h1>Stack</h1>
    </div>
  `
})

app.mount('#app')
