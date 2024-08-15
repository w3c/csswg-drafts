export class Slide extends HTMLElement {
  #slideFunction;
  #slideIterator;
  #currentState = -1;
  #queueChain = Promise.resolve();
  #done = false;

  useTransitions = false;

  constructor(slideFunction = async function* () {}) {
    super();
    this.#slideFunction = slideFunction;
    this.goto(0);
  }

  async #unqueuedGoto(targetState) {
    this.innerHTML = "";

    this.#done = false;
    this.#slideIterator = this.#slideFunction(this);
    this.#currentState = -1;

    while (this.#currentState !== targetState) {
      await this.#advance({ useTransitions: false });
      if (!this.hasNext) return;
    }
  }

  #queue(callback) {
    return (this.#queueChain = this.#queueChain.finally(callback));
  }

  goto(targetState) {
    return this.#queue(() => this.#unqueuedGoto(targetState));
  }

  async #advance({ useTransitions }) {
    if (this.#done) return;
    this.useTransitions = useTransitions;

    this.#currentState++;
    const { done } = await this.#slideIterator.next();
    this.#done = done;
  }

  previous() {
    return this.#queue(() => {
      if (this.#currentState === 0) return;
      return this.#unqueuedGoto(this.#currentState - 1);
    });
  }

  next() {
    return this.#queue(() => this.#advance({ useTransitions: true }));
  }

  get hasNext() {
    return !this.#done;
  }

  get hasPrevious() {
    return this.#currentState > 0;
  }
}

customElements.define("spec-slide", Slide);

/**
 * @param {HTMLElement} element
 * @param {Keyframe[] | PropertyIndexedKeyframes} from
 * @param {KeyframeAnimationOptions} options
 */
export function transitionFrom(element, from, options) {
  const slide = element.closest("spec-slide");
  if (!slide) throw Error("Transitioning element must be within spec-slide");

  from = Array.isArray(from) ? from : { ...from, offset: 0 };

  const anim = element.animate(from, {
    ...options,
    fill: "backwards",
    duration: slide.useTransitions ? options.duration : 0,
    delay: slide.useTransitions ? options.delay : 0,
  });

  return anim;
}

/**
 * @param {HTMLElement} element
 * @param {Keyframe[] | PropertyIndexedKeyframes} to
 * @param {KeyframeAnimationOptions} options
 */
export function transition(element, to, options) {
  const slide = element.closest("spec-slide");
  if (!slide) throw Error("Transitioning element must be within spec-slide");

  const anim = element.animate(to, {
    ...options,
    fill: "both",
    duration: slide.useTransitions ? options.duration : 0,
    delay: slide.useTransitions ? options.delay : 0,
  });

  anim.finished.then(() => {
    anim.commitStyles();
    anim.cancel();
  });

  return anim;
}
