class Titulo extends HTMLElement {

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

      .titulo {
        width: 100%;
        text-align: center;
      }

      .titulo h2 {
        font-size: 1.6rem;
        font-weight: normal;
        padding-bottom: 2rem;
      }
    </style>

    <div class="titulo">
     <h2>Bienvenido de nuevo, Aarón.</h2>
    </div>
    `
  }
}

customElements.define('titulo-component', Titulo);