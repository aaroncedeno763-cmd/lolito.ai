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
        width: 100%;
        height: 5vh;
        display: flex;
        align-items: center;
        padding: 0 2%;
        position: fixed;
        top: 0;
        left: 50%;
        z-index: 1001;
      }

     
    </style>
  
    <header>
      <slot></slot>
    </header>
     `
  }
}

customElements.define('header-component', Header);