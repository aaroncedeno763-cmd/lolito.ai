class Historial extends HTMLElement {

  constructor() {
    super()
    this.shadow = this.attachShadow({ mode: 'open' })
    this.data = []
  }

  async connectedCallback() {
    await this.loadData()
    this.render()
  }

  async loadData() {
    try {
      const apiUrl = import.meta.env.VITE_API_URL ?? ''
      const result = await fetch(`${apiUrl}/api/worker/conversations`)

      if (!result.ok) throw new Error(`HTTP ${result.status}`)

      const conversaciones = await result.json()

      this.data = conversaciones.map(({ id, titulo }) => ({
        id,
        pregunta: titulo
      }))
    } catch (error) {
      console.error('Error al cargar el historial:', error)
    }
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
      .nombre-chat {
        width: 100%;
        border: 0;
        padding: 0;
        background: transparent;
        color: inherit;
        font: inherit;
        text-align: left;
        cursor: pointer;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .historial li {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: start;
        gap: 0.5rem;
      }

      .opciones-chat summary {
        list-style: none;
        text-align: right;
        cursor: pointer;
      }

      .opciones-chat summary::-webkit-details-marker {
        display: none;
      }

      .opciones-chat button {
        display: block;
        padding: 0.35rem 0.5rem;
        border: 0;
        background: transparent;
        color: inherit;
        font: inherit;
        cursor: pointer;
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
      const boton = document.createElement('button')

      boton.type = 'button'
      boton.className = 'nombre-chat'
      boton.textContent = chat.pregunta

      boton.addEventListener('click', async () => {
        const input = document.querySelector('prompt-input-component')

        try {
          await input.abrirConversacion(chat.id)
        } catch (error) {
          window.alert(error.message)
        }
      })

      const menu = document.createElement('details')
      menu.className = 'opciones-chat'

      menu.innerHTML = `
        <summary aria-label="Opciones del chat">⋯</summary>
        <button type="button" data-accion="renombrar">Renombrar</button>
        <button type="button" data-accion="eliminar">Eliminar</button>
      `
      menu.querySelector('[data-accion="renombrar"]').addEventListener('click', async () => {
        menu.open = false

        const titulo = window.prompt('Nuevo nombre del chat', chat.pregunta)?.trim()
        if (!titulo) return

        try {
          const apiUrl = import.meta.env.VITE_API_URL ?? ''
          const result = await fetch(
            `${apiUrl}/api/worker/conversations/${encodeURIComponent(chat.id)}`,
            {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ titulo })
            }
          )

          if (!result.ok) {
            throw new Error(`No se pudo renombrar el chat (${result.status}).`)
          }

          await this.loadData()
          this.render()
        } catch (error) {
          window.alert(error.message)
        }
      })

      menu.querySelector('[data-accion="eliminar"]').addEventListener('click', async () => {
        menu.open = false

        if (!window.confirm(`¿Eliminar «${chat.pregunta}»?`)) return

        try {
          const input = document.querySelector('prompt-input-component')
          await input.eliminarConversacion(chat.id)

          await this.loadData()
          this.render()
        } catch (error) {
          window.alert(error.message)
        }
      })
      li.append(boton, menu)
      ul.appendChild(li)
    })
  }

}

customElements.define('historial-component', Historial);