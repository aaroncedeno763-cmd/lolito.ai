class PromptInput extends HTMLElement {

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

      form {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .promt-input {
        width: 45vw;
        min-height: 3.5rem;
        background-color: hsl(0, 0%, 14%);
        border-radius: 2rem;
        display: flex;
        align-items: center;
        padding: 0 1%;
        gap: 0.6rem;
       }


      .promt-input input {
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
      <div class="promt-input">
        <button type="button" class="boton-mas">+</button>
        <textarea type="text" placeholder="¿En qué puedo ayudarte hoy?" rows="1"></textarea>
        <button type="submit" class="boton-enviar">Enviar</button>
      </div>
    </form>
    `
  }
}

export default (() => {

  const form = document.querySelector('form');
  const sendFormButton = document.querySelector('.boton-enviar');

  sendFormButton.addEventListener('click', async event => {
    event.preventDefault();

    let formData = new FormData(form);
    let formDataJson = Object.fromEntries(formData.entries());

    try {

      const response = await fetch('http://localhost:5177/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formDataJson)
      })

      const data = await response.json()

    } catch (error) {
      console.log(error);
    }
  });

})();

customElements.define('prompt-input-component', PromptInput);