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
      main {
        display: grid;
        gap: 2rem;
        grid-template-columns: 2fr 6fr;
        padding: 1.5rem 4rem;
        max-height: 92vh;
      }

      @media (max-width: 450px) {
        main{
          width: 100%;
          padding: 0.2rem;
        }
      }
    </style>

    <main>
      <slot></slot>
    </main>
     `
  }
}

customElements.define('main-component', Main);