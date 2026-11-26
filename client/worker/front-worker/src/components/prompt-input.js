class PromptInput extends HTMLElement {

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

      form {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .prompt-input {
        width: 45vw;
        min-height: 3.5rem;
        background-color: hsl(0, 0%, 14%);
        border-radius: 2rem;
        display: flex;
        align-items: center;
        padding: 0 1%;
        gap: 0.6rem;
       }


      .prompt-input textarea {
        width: 100%;
        min-width: 0;
        background-color: transparent;
        color: hsl(0, 0%, 100%);
        border: none;
        outline: none;
        font-size: 0.9rem;
        }


      .boton-mas {
        width: 2rem;
        height: 2rem;
        background-color: hsl(0, 0%, 20%);
        color: hsl(0, 0%, 100%);
        border: none;
        border-radius: 50%;
        font-size: 1.2rem;
        cursor: pointer;
      }

      .boton-mas:hover{
        background-color: hsl(0, 0%, 30%);
      }

      .boton-enviar {
        width: 3rem;
        height: 3rem;
        background-color: hsl(214, 46%, 30%);
        color: hsl(0, 0%, 100%);
        border: none;
        border-radius: 50%;
        cursor: pointer;
      }

      .boton-enviar:hover{
        background-color: hsl(214, 46%, 40%);
      }

    </style>

    <form>
      <div class="prompt-input">
        <button type="button" class="boton-mas">+</button>
        <textarea type="text" name= "userQuery" placeholder="¿En qué puedo ayudarte hoy?" rows="1"></textarea>
        <button type="submit" class="boton-enviar">Enviar</button>
      </div>
    </form>
    `
  }

  eventos() {
    const form = this.shadow.querySelector('form')
    const textarea = form.elements.namedItem('userQuery')
    const boton = form.querySelector('.boton-enviar')
    const chat = this.closest('main-component')
    const mensajes = chat.querySelector('#mensajes')
    const zonaScroll = chat.shadowRoot.querySelector('.respuesta')

    function agregarMensaje(rol, texto) {
      const mensaje = document.createElement('p')
      mensaje.classList.add('mensaje', `mensaje--${rol}`)
      mensaje.textContent = texto
      mensajes.append(mensaje)
      zonaScroll.scrollTop = zonaScroll.scrollHeight
    }

    form.addEventListener('submit', async event => {
      event.preventDefault()

      const userQuery = textarea.value.trim()
      if (!userQuery || boton.disabled) return

      boton.disabled = true
      chat.classList.add('chat-activo')
      agregarMensaje('usuario', userQuery)
      form.reset()

      try {
        const result = await fetch(
          `${import.meta.env.VITE_API_URL}/api/worker/messages`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userQuery })
          }
        )

        if (!result.ok) throw new Error(`HTTP ${result.status}`)

        const data = await result.json()
        agregarMensaje('asistente', data.answer)
      } catch (error) {
        console.error('Error al enviar el mensaje:', error)
        agregarMensaje('asistente', 'No pude obtener una respuesta. Inténtalo de nuevo.')
      } finally {
        boton.disabled = false
      }
    })
  }
}

customElements.define('prompt-input-component', PromptInput);