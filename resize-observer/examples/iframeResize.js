// iframeResize.js: ResizeObserver demo of iframe sizing
//
// Size iframes to content width using ResizeObserver
//
// iframeResize uses ResizeObserver to detect changes to iframe size
// and postMessage to communicate its size to an enclosing window.
//
// Usage:
// <script src="iframeResize.js"></script>
// Inside iframe: iframeResize.setupIframe()
// Inside window: iframeResize.setupWindow()

(function() {

function computeIdealSize(isImage) {
  if (isImage) {
    let imageSize = document.querySelector('img').getBoundingClientRect();
    return { width: imageSize.width, height: imageSize.height };
  }
  // Handle text sizing
  // hide scrollbars before measuring ideal size
  let saveOverflow = document.scrollingElement.style.overflow;
  document.scrollingElement.style.overflow = "hidden";

  let idealWidth, idealHeight;
  if (document.body.scrollWidth > window.innerWidth) {
    // If document is wider than iframe, resize to scroll width
    idealWidth = document.scrollingElement.scrollWidth;
  } else {
    // Document is narrower, resize to offset width
    idealWidth = document.scrollingElement.offsetWidth;
  }
  if (document.body.scrollHeight > window.innerHeight) {
    // document is taller than iframe, resize to scroll height
    idealHeight = document.scrollingElement.scrollHeight;
  } else {
    idealHeight = document.scrollingElement.offsetHeight;
  }
  document.scrollingElement.style.overflow = saveOverflow;
  return { width: idealWidth, height: idealHeight };
}

// isImage should be true if iframe is being sized to an image.
function setupIframe(isImage) {
  if (!window.ResizeObserver) {
    document.querySelector('#warning').classList.remove('hide');
    throw "No ResizeObserver";
  }
  if (document.compatMode != 'CSS1Compat' )
    console.warning("Quirks mode inside iframe. Frame might not size properly");
  let ro = new ResizeObserver(entries => {
    let idealSize = computeIdealSize(isImage);
    window.parent.postMessage({
      name: "iframeResize",
      width: idealSize.width,
      height: idealSize.height
    }, '*');
  });
  ro.observe(document.body);
}

function findEventSourceIframe(eventSource) {
  let frames = Array.from(document.querySelectorAll('iframe'));
  for (let iframe of Array.from(document.querySelectorAll('iframe'))) {
    if (iframe.contentWindow == eventSource)
      return iframe;
  }
  console.error("iframe not found");
}

function setupWindow() {
  window.addEventListener("message", ev => {
    if (ev.data && ev.data.name == "iframeResize") {
      let iframe = findEventSourceIframe(ev.source);
      if (iframe) {
        iframe.style.width = ev.data.width + "px";
        iframe.style.height = ev.data.height + "px";
      }
    }
  }, false);
}

window.iframeResize = {
  setupIframe: setupIframe,
  setupWindow: setupWindow
}
})();
