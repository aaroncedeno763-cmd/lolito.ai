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
      :host {
        display: block;
        margin-left: 15rem;
      }

      main {
        position: relative;
        height: 100dvh;
      }

      .respuesta {
        position: absolute;
        inset: 1rem 1rem 6rem;
        max-width: 45vw;
        margin-inline: auto;
        overflow-y: auto;
      }

      ::slotted(#respuesta) {
        white-space: pre-wrap;
        overflow-wrap: anywhere;
      }

      .barra {
        position: absolute;
        inset-inline: 0;
        top: 50%;
        transform: translateY(-50%);
        transition:
          top 400ms cubic-bezier(.22, 1, .36, 1),
          transform 400ms cubic-bezier(.22, 1, .36, 1);
      }

      .titulo {
        position: absolute;
        inset-inline: 0;
        bottom: 100%;
        text-align: center;
        transition: opacity 180ms ease;
      }

      :host(.chat-activo) .barra {
        top: calc(100% - 1rem);
        transform: translateY(-100%);
      }

      :host(.chat-activo) .titulo {
        opacity: 0;
        visibility: hidden;
      }

      @media (prefers-reduced-motion: reduce) {
        .barra, .titulo {
          transition: none;
        }
      }
</style>


  <main>
    <div class="respuesta"><slot name="respuesta"></slot></div>
    <div class="barra">
      <div class="titulo"><slot name="titulo"></slot></div>
      <slot></slot>
    </div>
  </main>
     `
  }
}

customElements.define('main-component', Main);