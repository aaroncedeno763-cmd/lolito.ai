class Main extends HTMLElement {

  constructor() {
    super()
    this.shadow = this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    this.render()
  }

  render() {
    this.shadow.innerHTML =
      /*html*/`
    <style>

      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
       main {
        background-color: hsl(200, 50%, 50%);
        height: 100vh;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
      }

    </style>

    <main>
      <slot></slot>
    </main>

    `
  }
}

customElements.define('main-component', Main);