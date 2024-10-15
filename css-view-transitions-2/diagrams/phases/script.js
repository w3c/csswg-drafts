import { Slide, transition, transitionFrom } from "../resources/slides.js";

const slide = new Slide(async function* () {
  slide.innerHTML = `
    <div class="vt-demo">
      <div class="example" aria-hidden="true">
        <div class="title">Main DOM</div>
        <div class="page">
          <div class="state-1">State 1</div>
        </div>
      </div>
      <div class="example" aria-hidden="true">
        <div class="title">Transition root</div>
        <div class="page transition-page"></div>
      </div>
      <div class="example" aria-hidden="true">
        <div class="title">User sees</div>
        <div class="page combined-page">
          <div class="states">
            <div class="state-1">State 1</div>
            <div class="state-2">State 2</div>
          </div>
          <div class="what-user-sees">(Main DOM)</div>
        </div>
      </div>
      <div class="step" aria-live="polite">Developer calls <code>document.startViewTransition()</code></div>
    </div>
  `;

  /** @type {HTMLElement[]} */
  const [domPage, transitionPage, combinedPage] =
    slide.querySelectorAll(".page");

  /** @type {HTMLElement} */
  const whatUserSees = slide.querySelector(".what-user-sees");

  // This pauses the slide until 'next' is clicked.
  yield;

  /** @type {HTMLElement} */
  const step = slide.querySelector(".step");
  step.textContent = `Current state captured as the "old" state`;

  yield;

  step.textContent = "Rendering paused";
  whatUserSees.textContent = "(Paused render)";

  yield;

  step.textContent = "Developer updates document state";
  domPage.innerHTML = `<div class="state-2">State 2</div>`;

  yield;

  step.textContent = `Current state captured as the "new" state`;

  yield;

  step.textContent = "Transition pseudo-elements created";
  transitionPage.innerHTML = `
    <div class="states">
      <div class="state-1">State 1</div>
      <div class="state-2">State 2</div>
    </div>
  `;

  yield;

  step.textContent =
    "Rendering unpaused, revealing the transition pseudo-elements";
  whatUserSees.textContent = "(Transition root)";

  yield;

  step.textContent = "Pseudo-elements animate";

  // Wow, this would be way easier with view transitions…
  const states = [transitionPage, combinedPage].map((el) =>
    el.querySelector(".states")
  );
  const state1s = [transitionPage, combinedPage].map((el) =>
    el.querySelector(".state-1")
  );
  const state2s = [transitionPage, combinedPage].map((el) =>
    el.querySelector(".state-2")
  );

  for (const state of states) {
    transition(
      state,
      { transform: "translate(219px, 469px)" },
      {
        duration: 1000,
        easing: "ease-in-out",
      }
    );
  }

  for (const state1 of state1s) {
    transition(
      state1,
      { opacity: "0" },
      {
        duration: 1000,
        easing: "ease-in-out",
      }
    );
  }

  for (const state2 of state2s) {
    transition(
      state2,
      { opacity: "1" },
      {
        duration: 1000,
        easing: "ease-in-out",
      }
    );
  }

  yield;

  step.textContent = "Transition pseudo-elements removed";
  transitionPage.innerHTML = "";
  whatUserSees.textContent = "(Main DOM)";
});

document.querySelector(".stage").append(slide);
