class Historial extends HTMLElement {

  constructor() {
    super()
    this.shadow = this.attachShadow({ mode: 'open' })
    this.data = []
  }

  connectedCallback() {
    this.loadData()
    this.render()
  }

  loadData() {
    this.data = [
      {
        pregunta: "¿Qué es la fotosíntesis?",
        url: "#"
      },
      {
        pregunta: "¿Cuál es la capital de Australia?",
        url: "#"
      },
      {
        pregunta: "¿Qué se puede hacer si te encuentras a un oso?",
        url: "#"
      },
      {
        pregunta: "¿Qué es la fotosíntesis?",
        url: "#"
      },
      {
        pregunta: "¿Cuál es la capital de Australia?",
        url: "#"
      },
      {
        pregunta: "¿Qué se puede hacer si te encuentras a un oso?",
        url: "#"
      },
      {
        pregunta: "¿Qué es la fotosíntesis?",
        url: "#"
      },
      {
        pregunta: "¿Cuál es la capital de Australia?",
        url: "#"
      },
      {
        pregunta: "¿Qué se puede hacer si te encuentras a un oso?",
        url: "#"
      },
      {
        pregunta: "¿Qué es la fotosíntesis?",
        url: "#"
      },
      {
        pregunta: "¿Cuál es la capital de Australia?",
        url: "#"
      },
      {
        pregunta: "¿Qué se puede hacer si te encuentras a un oso?",
        url: "#"
      },
      {
        pregunta: "¿Qué es la fotosíntesis?",
        url: "#"
      },
      {
        pregunta: "¿Cuál es la capital de Australia?",
        url: "#"
      },
      {
        pregunta: "¿Qué se puede hacer si te encuentras a un oso?",
        url: "#"
      },
      {
        pregunta: "¿Qué es la fotosíntesis?",
        url: "#"
      },
      {
        pregunta: "¿Cuál es la capital de Australia?",
        url: "#"
      },
      {
        pregunta: "¿Qué se puede hacer si te encuentras a un oso?",
        url: "#"
      },
      {
        pregunta: "¿Qué es la fotosíntesis?",
        url: "#"
      },
      {
        pregunta: "¿Cuál es la capital de Australia?",
        url: "#"
      },
      {
        pregunta: "¿Qué se puede hacer si te encuentras a un oso?",
        url: "#"
      },
      {
        pregunta: "¿Qué es la fotosíntesis?",
        url: "#"
      },
      {
        pregunta: "¿Cuál es la capital de Australia?",
        url: "#"
      },
      {
        pregunta: "¿Qué se puede hacer si te encuentras a un oso?",
        url: "#"
      },
    ]
  }

  render() {
    this.shadow.innerHTML =
      /*html*/`
    <style>
      a{
        color: hsl(0, 0%, 100%);
        text-decoration: none;
      }

      :host {
        display: block;
        height: 100%;
      }

      .historial {
        color: hsla(0, 0%, 97%, 1.00);
        font-size: 1.3rem;
        height: 100%;
        display: flex;
        flex-direction: column;
        min-height: 0;
      }


      .lista-chats {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
      }

      .lista-chats::-webkit-scrollbar {
        width: 0.5rem;
      }

      .lista-chats::-webkit-scrollbar-track {
        background-color: hsl(0, 3%, 13%);
      }

      .lista-chats::-webkit-scrollbar-thumb {
        background-color: hsl(0, 0%, 29%);
        border-radius: 1rem;
      }

      .historial ul {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }


      .historial li {
        font-size: 1rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        position: relative;
        cursor: pointer;
        padding: 0.5rem 0.5rem;
        border-radius: 0.5rem;
      }

      .historial li:hover{
        background-color: hsl(0, 0%, 39%);
      }

    </style>

   <div class="historial">
      <p>historial</p>
      <div class="lista-chats">
        <ul>         
        </ul>
      </div>
    </div>

    `


    const ul = this.shadow.querySelector('ul')


    this.data.forEach(chat => {
      const li = document.createElement('li')
      li.href = chat.url
      li.textContent = chat.pregunta
      ul.appendChild(li)
    });










  }
}

customElements.define('historial-component', Historial);