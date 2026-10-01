class Form extends HTMLElement {

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
        
        * {
          box-sizing: border-box;
        }
        .container{
          display: flex;
          justify-content: space-between;
        }

        .tabs{
          display: flex;
        }

        .tab{
          background-color: hsl(200, 50%, 50%);
          height: 2.5rem;
          padding: 0 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;         
          cursor: pointer;
        }

        .tab:hover{
          background-color: hsla(200, 4%, 83%, 1.00);
        }

        .botones{
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
        }

        .botones button:hover{
          background-color: hsla(200, 4%, 83%, 1.00);
        }

        .botones button{
          border: none;
          background-color: hsl(200, 50%, 50%);
          cursor: pointer;
          width: 2.5rem;
          height: 2.5rem;
        }

        form{
          display: flex;
          gap: 1rem;
          padding: 1rem;
          border-top: 0.15rem solid hsl(200, 50%, 50%);
          background-color: hsl(210, 30%, 95%);
        }

        form .form-element {
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        label{
          font-weight: bold;
        }

        input{
          padding-top: 0.5rem;
          height: 1.5rem;
        }

        .tab-content{
          display: grid;
        }
       

        @media (max-width: 450px) {
          .container {
            width: 95%;
          }

          .tab{
            height: 3.5vh;
            width: 50%;
            font-size: 1.5rem;
          }

          .botones{
            width: 50%;
          }

          .botones button{
            width: 3.5vh;
            height: 3.5vh;
          }

          form{
            width: 95%;
            flex-direction: column;
            height: auto;
            justify-content: space-between;
          }

          form .form-element{
            width: 100%;
          }

          .tab-content{
            display: grid;
          }
        }
      </style>

      <div class="container">
        <div class="tabs">
          <div class="tab active" data-tab="general">General</div>
          <div class="tab"  data-tab="imagenes">Imagenes</div>
        </div>
        <div class="botones">
          <button class="borrar"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>broom</title><path d="M19.36,2.72L20.78,4.14L15.06,9.85C16.13,11.39 16.28,13.24 15.38,14.44L9.06,8.12C10.26,7.22 12.11,7.37 13.65,8.44L19.36,2.72M5.93,17.57C3.92,15.56 2.69,13.16 2.35,10.92L7.23,8.83L14.67,16.27L12.58,21.15C10.34,20.81 7.94,19.58 5.93,17.57Z" /></svg></button>
          <button class="guardar"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>content-save-plus</title><path d="M17 3H5C3.89 3 3 3.9 3 5V19C3 20.11 3.9 21 5 21H12.81C12.45 20.38 12.2 19.7 12.08 19L12 19C10.34 19 9 17.66 9 16S10.34 13 12 13C12.68 13 13.34 13.23 13.87 13.65C15 12.59 16.46 12 18 12C19.05 12 20.09 12.28 21 12.81V7L17 3M15 9H5V5H15V9M17 14V17H14V19H17V22H19V19H22V17H19V14H17Z" /></svg>
        </div>
      </div>
      <form>
        <div class="tab-content active" data-tab="general">
          <div class="form-element">
            <label for="name">Nombre</label>
            <input type="text" id="name" name="name">
          </div>

          <div class="form-element">
            <label for="email">Email</label>
            <input type="email" id="email" name="email">
          </div>
        </div>
        <div class="tab-content"  data-tab="imagenes">
           <div class="form-element">
            <label for="email">Email</label>
            <input type="email" id="email" name="email">
          </div>
        </div>
      </form>
      `

  }
}

customElements.define('form-component', Form)