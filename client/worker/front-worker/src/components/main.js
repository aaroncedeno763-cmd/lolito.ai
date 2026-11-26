class Main extends HTMLElement {
  constructor() {
    super()
    this.shadow = this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    this.render()
  }

  render() {
    this.shadow.innerHTML = /*html*/ `
      <style>
        :host {
          display: block;
          --ancho-chat: min(48rem, calc(100% - 2rem));
        }

        main {
          position: relative;
          height: 100dvh;
        }

        .respuesta {
          position: absolute;
          inset: var(--alto-cabecera, 3.75rem) 0 6rem;
          width: var(--ancho-chat);
          margin-inline: auto;
          padding-top: 1.25rem;
          overflow-y: auto;
        }

        .barra {
          position: absolute;
          inset-inline: 0;
          top: 50%;
          width: var(--ancho-chat);
          margin-inline: auto;
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
        }

        :host(.chat-activo) .barra {
          top: calc(100% - 1rem);
          transform: translateY(-100%);
        }

        :host(.chat-activo) .titulo {
          visibility: hidden;
        }

        @media (prefers-reduced-motion: reduce) {
          .barra {
            transition: none;
          }
        }
      </style>

      <main>
        <div class="respuesta">
          <slot name="respuesta"></slot>
        </div>

        <div class="barra">
          <div class="titulo">
            <slot name="titulo"></slot>
          </div>
          <slot></slot>
        </div>
      </main>
    `
  }
}

customElements.define('main-component', Main)