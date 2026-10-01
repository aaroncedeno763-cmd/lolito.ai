class Table extends HTMLElement {

  constructor() {
    super()
    this.shadow = this.attachShadow({ mode: 'open' })
    this.labels = JSON.parse(this.getAttribute('labels'))
  }

  connectedCallback() {
    this.loadData()
    this.render()
  }

  loadData() {
    this.data = [
      {
        nombre: "Aarón Cedeno",
        email: "aaroncedeno123@gmail.com",
        fechaCreacion: "23/09/2026",
        fechaActualizacion: "23/09/2026"
      },
      {
        nombre: "Aarón Cedeno",
        email: "aaroncedeno123@gmail.com",
        fechaCreacion: "23/09/2026",
        fechaActualizacion: "23/09/2026"
      },
      {
        nombre: "Aarón Cedeno",
        email: "aaroncedeno123@gmail.com",
        fechaCreacion: "23/09/2026",
        fechaActualizacion: "23/09/2026"
      },
      {
        nombre: "Aarón Cedeno",
        email: "aaroncedeno123@gmail.com",
        fechaCreacion: "23/09/2026",
        fechaActualizacion: "23/09/2026"
      },
      {
        nombre: "Aarón Cedeno",
        email: "aaroncedeno123@gmail.com",
        fechaCreacion: "23/09/2026",
        fechaActualizacion: "23/09/2026"
      },
      {
        nombre: "Aarón Cedeno",
        email: "aaroncedeno123@gmail.com",
        fechaCreacion: "23/09/2026",
        fechaActualizacion: "23/09/2026"
      },
      {
        nombre: "Aarón Cedeno",
        email: "aaroncedeno123@gmail.com",
        fechaCreacion: "23/09/2026",
        fechaActualizacion: "23/09/2026"
      },
      {
        nombre: "Aarón Cedeno",
        email: "aaroncedeno123@gmail.com",
        fechaCreacion: "23/09/2026",
        fechaActualizacion: "23/09/2026"
      },
      {
        nombre: "Aarón Cedeno",
        email: "aaroncedeno123@gmail.com",
        fechaCreacion: "23/09/2026",
        fechaActualizacion: "23/09/2026"
      },
      {
        nombre: "Aarón Cedeno",
        email: "aaroncedeno123@gmail.com",
        fechaCreacion: "23/09/2026",
        fechaActualizacion: "23/09/2026"
      },
      {
        nombre: "Aarón Cedeno",
        email: "aaroncedeno123@gmail.com",
        fechaCreacion: "23/09/2026",
        fechaActualizacion: "23/09/2026"
      },
      {
        nombre: "Aarón Cedeno",
        email: "aaroncedeno123@gmail.com",
        fechaCreacion: "23/09/2026",
        fechaActualizacion: "23/09/2026"
      },
      {
        nombre: "Aarón Cedeno",
        email: "aaroncedeno123@gmail.com",
        fechaCreacion: "23/09/2026",
        fechaActualizacion: "23/09/2026"
      }
    ]
  }

  render() {
    this.shadow.innerHTML =
      /*html*/`
      <style>
        
        * {
          box-sizing: border-box;
        }

        .table {
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .paginacion {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          height: 2.5rem;
          padding: 0;
          border-bottom: 0.15rem solid hsl(200, 50%, 50%);
        }

        .paginacion button {
          height: 100%;
          width: 2rem;
          border: none;
          background-color: hsl(200, 50%, 50%);
          color: white;
          font-size: 1.5rem;
          cursor: pointer;
        }

        .paginacion button:hover{
          background-color: hsla(200, 4%, 83%, 1.00);
        }

        .paginacion span {
          padding: 0 1.5rem;
          height: 100%;
          background-color: hsl(200, 50%, 50%);
          font-size: 1.5rem;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .table-body{
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          max-height: 80vh;
          overflow: auto;
          padding: 0 0.5rem;
        }


        ul {
          margin: 0;
          border: 0.15rem solid hsl(200, 50%, 50%);
          padding: 1rem;
          list-style: none;
        }

        li {
          padding: 0.2rem 0;
        }

        @media (max-width: 450px) {
          .table{
            width: 90%;
          }

          .paginacion{
            flex-direction: row;
            justify-content: flex-end;
            height: 3.7vh;
          }

          .paginacion span {
            font-size: 1rem;
            height: 3.5vh;
            padding: 0 1rem;
          }
          
          .paginacion button{
            height: 3.5vh;
            width: 1.5rem;
          }

          ul {
            padding: 0.5rem;
          }

          li {
            padding: 0.1rem 0;
          }
        }
      </style>

      <div class="table">
        <div class="paginacion">
          <button>&lt;</button>
          <span>1/1</span>
          <button>&gt;</button>
        </div>

        <div class="table-body">
        </div>
      </div>
      `


    const tableBody = this.shadow.querySelector('.table-body')

    this.data.forEach(element => {

      const dataElement = document.createElement('div')
      dataElement.classList.add('data-element')
      tableBody.appendChild(dataElement)

      const ul = document.createElement('ul')
      dataElement.appendChild(ul)

      Object.entries(element).forEach(([clave, valor]) => {
        const li = document.createElement('li')
        ul.appendChild(li)
      })
    });
  }
}

customElements.define('table-component', Table)