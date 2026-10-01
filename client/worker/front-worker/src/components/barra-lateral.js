class BarraLateral extends HTMLElement {

  constructor() {
    super()
    this.shadow = this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    this.render()
    this.eventos()
  }

  render() {
    this.shadow.innerHTML =
      /*html*/`
      <style>
       .botones {
          box-sizing: border-box;
          background-color: hsl(0, 3%, 13%);
          width: 20%;
          height: 100vh;
          position: fixed;
          left: 0;
          top: 0;
          padding: 5vh 2% 2vh;
          display: flex;
          flex-direction: column;
          z-index: 1000;
          transition: width 0.5s ease;
        }


        .botones-cerrar {
          width: 3.25rem;
          transform: none !important;
          padding: 5vh 0.5rem 2vh;
        }

        .botones-cerrar .boton-nuevo-chat {
          justify-content: center;
          font-size: 0;
          padding: 0.5rem 0;
        }

        .botones svg {
          width: 1.5rem;
          height: 1.5rem;
          fill: hsl(180, 100%, 97%);
        }

        .boton-busqueda {
          background-color: transparent;
          border: none;
          position: absolute;
          right: 4rem;
          top: 2.5%;
          width: 2rem;
          height: 2rem;
          cursor: pointer;
          z-index: 1002;
        }

        .boton-cerrar {
          background-color: transparent;
          color: hsl(0, 0%, 100%);
          border: none;
          position: absolute;
          right: 0.1rem;
          top: 2.5%;
          width: 2rem;
          height: 2rem;
          cursor: pointer;
        }


        .nuevo-chat {
          padding-bottom: 2rem;
          display: flex;
          align-items: center;
        }


        .boton-nuevo-chat {
          width: 100%;
          padding: 0.5rem;
          background-color: hsl(0, 3%, 13%);
          color: hsl(0, 0%, 100%);
          border: none;
          border-radius: 0.5rem;
          text-align: left;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }

        .botones-cerrar .boton-cerrar {
          right: 0.6rem;
          top: 2.5%;
        }

        .botones-cerrar .nuevo-chat {
          padding: 0;
          margin: 0;
          position: absolute;
          top: 6%;
          left: 0;
          width: 100%;
        }

        .botones-cerrar .boton-nuevo-chat {
          width: 2rem;
          margin: 0 auto;
          padding: 0.5rem 0;
          justify-content: center;
          font-size: 0;
        }

        .botones-cerrar .boton-busqueda {
          right: 0.6rem;
          top: 12%;
        }

       .botones-cerrar .contenido {
          visibility: hidden;
        } 


       .contenido {
        flex: 1;
        min-height: 0;
        overflow: hidden;
      }

      .cuenta {
        flex-shrink: 0;
      }

       @media (max-width: 430px) {
        .botones {
          padding: 12vh 2% 2vh;
        }

        .boton-busqueda {
          right: 0;
          top: 6%;
        }
        
        .boton-cerrar {
          top: 6%;
        }
        
      }
  
      </style>

      <div class="botones">
        <button class="boton-cerrar"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>menu</title><path d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z" /></svg></button>
        <button class="boton-busqueda"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <title>magnify</title>
            <path
              d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
          </svg></button>
        <div class="nuevo-chat">
          <button class="boton-nuevo-chat"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path
                d="M12 3C17.5 3 22 6.58 22 11C22 11.58 21.92 12.14 21.78 12.68C21.19 12.38 20.55 12.16 19.88 12.06C19.96 11.72 20 11.36 20 11C20 7.69 16.42 5 12 5C7.58 5 4 7.69 4 11C4 14.31 7.58 17 12 17L13.09 16.95L13 18L13.08 18.95L12 19C10.81 19 9.62 18.83 8.47 18.5C6.64 20 4.37 20.89 2 21C4.33 18.67 4.75 17.1 4.75 16.5C3.06 15.17 2.05 13.15 2 11C2 6.58 6.5 3 12 3M18 14H20V17H23V19H20V22H18V19H15V17H18V14Z" />
            </svg>Nuevo chat</button>
        </div>

        <div class="contenido">
          <slot name="historial"></slot>
        </div>

        <div class="cuenta">
          <slot name="cuenta"></slot>
        </div>
      </div>
      `
  }
  eventos() {
    const botonCerrar = this.shadow.querySelector(".boton-cerrar");
    const cuenta = this.querySelector('[slot="cuenta"]')
    const barraLateral = this.shadow.querySelector(".botones");
    botonCerrar.addEventListener('click', () => {
      barraLateral.classList.toggle("botones-cerrar")
      cuenta.toggleAttribute("cerrada")
    })
  }
}


customElements.define('barra-lateral-component', BarraLateral)

