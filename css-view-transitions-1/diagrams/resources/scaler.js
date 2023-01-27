export class Scaler extends HTMLElement {
  static observedAttributes = ["canvaswidth", "canvasheight"];

  #shadowRoot;
  #scaledElement;
  #contentElement;

  attributeChangedCallback(name, oldValue, newValue) {
    const width = Number(this.getAttribute("canvaswidth"));
    const height = Number(this.getAttribute("canvasheight"));

    this.#contentElement.style.aspectRatio = `${width} / ${height}`;
    this.#scaledElement.style.width = `${width}px`;
    this.#scaledElement.style.height = `${height}px`;
  }

  constructor() {
    super();
    this.#shadowRoot = this.attachShadow({ mode: "closed" });
    this.#shadowRoot.innerHTML = `
      <style>
        .content {
          contain: strict;
          overflow: hidden;
        }
        .scaled {
          transform-origin: 0 0;
        }
      </style>
      <div class="content">
        <div class="scaled"><slot></slot></div>
      </div>
    `;
    this.#scaledElement = this.#shadowRoot.querySelector(".scaled");
    this.#contentElement = this.#shadowRoot.querySelector(".content");

    new ResizeObserver(([entry]) => {
      this.#scaledElement.style.transform = `scale(${
        entry.contentRect.width / Number(this.getAttribute("canvaswidth"))
      })`;
    }).observe(this.#contentElement);
  }
}

customElements.define("spec-scaler", Scaler);
