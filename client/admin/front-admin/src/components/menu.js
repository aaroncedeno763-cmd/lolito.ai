class Menu extends HTMLElement {

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
        .menu {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          height: 8vh;
          width: 100%;
          position: relative;
        }

        .svg {
          width: 3rem;
          height: 3rem;
          fill: white;
        }

        button {
          background-color: transparent;
          border: none;
          cursor: pointer;
        }

        .desplegable {
          display: none;
          position: absolute;
          right: 0;
          top: 4rem;
          width: 15rem;
          padding: 0.7rem;
          background-color: hsl(200, 50%, 50%);
          border-radius: 1rem;
          flex-direction: column;
          gap: 0.5rem;
        }

        .desplegable a {
          text-decoration: none;
          color: white;
        }

        .desplegable a:hover {
          background-color: hsl(200, 50%, 70%);
        }

        .desplegable.mostrar {
          display: flex;
        }
      </style>

      <div class="menu">      
        <button class="boton-menu">
          <svg class="svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>menu</title><path
            d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z" /></svg>
        </button>

        <div class="desplegable">
          <a href="#">Inicio</a>
          <a href="#">Usuarios</a>
          <a href="#">Cerrar sesión</a>
        </div>
      </div>
      `

    const boton = this.shadow.querySelector('.boton-menu')
    const desplegable = this.shadow.querySelector('.desplegable')

    boton.addEventListener('click', () => {
      desplegable.classList.toggle('mostrar')
    })
  }
}

customElements.define('menu-component', Menu)