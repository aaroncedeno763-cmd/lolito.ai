class MiCuenta extends HTMLElement {

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
      .mi-cuenta {
        display: flex;
        align-items: center;
        gap: 1rem;
        width: max-content;
      }

      .mi-cuenta p {
        font-size: 1.2rem;
        margin: 0;
      }

      :host([cerrada]) .mi-cuenta p {
        display: none;
      }

      .mi-cuenta svg {
        width: 3rem;
        height: 3rem;
        display: block;
        fill: hsl(0,0%,100%);
        flex-shrink: 0;
      }
      
    </style>

   <div class="mi-cuenta">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <title>account</title>
        <path
          d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
      </svg>
      <p>Aarón</p>
    </div>
    `
  }
}

customElements.define('mi-cuenta-component', MiCuenta);