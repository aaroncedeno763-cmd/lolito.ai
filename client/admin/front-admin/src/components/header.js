class Header extends HTMLElement {

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
      header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background-color: hsl(200, 50%, 50%);
        height: 8vh;
        padding: 0 4rem;
      }

      @media (max-width: 450px) {
        header{
          width:100%;
          height: auto;
          padding: 0 0.5rem;
        }
      }
    </style>

    <header>
      <slot></slot>
    </header>
     `
  }
}

customElements.define('header-component', Header);