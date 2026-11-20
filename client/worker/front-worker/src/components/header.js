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
    position: fixed;
    top: 0;
    left: var(--ancho-lateral);
    right: 0;
    height: var(--alto-cabecera);
    display: flex;
    align-items: center;
    padding-inline: 1rem;
    background: #1b2028;
    border-bottom: 1px solid #303742;
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