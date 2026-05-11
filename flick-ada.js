const FLICK_FOCUSABLE_ELEMENTS = [
  "a[href]",
  "area[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "button:not([disabled])",
  "iframe",
  "object",
  "embed",
  "[tabindex]",
  "[contenteditable='true']",
].join(",");

class FlickPatch {
  constructor(_d, _sQ) {
    this._d = _d;
    this._sQ = _sQ;
    this.aF = [];
    this.aObs = [];
  }

  init() {
    this.aF = Array.from(this._d.querySelectorAll(this._sQ));
    if (this.aF.length) {
      this.aObs = [];
      this.aF.forEach((eF) => {
        const oObs = new MutationObserver((mutations) =>
          this.processMutations(mutations),
        );
        oObs.observe(eF, { attributes: true, childList: true, subtree: true });
        this.aObs.push(oObs);
        this.updateFocusableStates(eF);
      });
    }
    return this;
  }

  processMutations(mutations) {
    if (!mutations?.length) {
      return;
    }

    // Only process if aria-hidden attribute actually changed
    const hasAriaHiddenChange = mutations.some(m => 
      m.type === 'attributes' && m.attributeName === 'aria-hidden'
    );

    if (!hasAriaHiddenChange) return;

    this.aF.forEach((eF) => this.updateFocusableStates(eF));
  }

  updateFocusableStates(slider) {
    this.disableHiddenSlideFocus(slider);
    this.restoreVisibleSlideFocus(slider);
  }

  disableHiddenSlideFocus(slider) {
    const hiddenSlides = Array.from(
      slider.querySelectorAll("[aria-hidden='true']"),
    );
    hiddenSlides.forEach((slide) => {
      slide.querySelectorAll(FLICK_FOCUSABLE_ELEMENTS).forEach((node) => {
        if (node.dataset.flickAdaPrevTabindex === undefined) {
          node.dataset.flickAdaPrevTabindex = node.hasAttribute("tabindex")
            ? node.getAttribute("tabindex")
            : "none";
        }
        node.tabIndex = -1;
        // Additional focus prevention
        node.setAttribute('aria-disabled', 'true');
        node.addEventListener('focus', this.preventFocus);
        // Prevent click activation on hidden slide elements
        if (node.tagName.toLowerCase() === 'a') {
          node.style.pointerEvents = 'none';
        }
      });
    });
  }

  preventFocus(e) {
    e.preventDefault();
    e.stopPropagation();
    if (document.activeElement) {
      document.activeElement.blur();
    }
  }

  restoreVisibleSlideFocus(slider) {
    const patched = Array.from(
      slider.querySelectorAll("[data-flick-ada-prev-tabindex]"),
    );
    patched.forEach((node) => {
      // Check if node or any parent is still hidden
      let parent = node;
      while (parent && parent !== slider) {
        if (parent.getAttribute('aria-hidden') === 'true') {
          return;
        }
        parent = parent.parentElement;
      }

      const previous = node.dataset.flickAdaPrevTabindex;
      if (previous === "none") {
        node.removeAttribute("tabindex");
      } else {
        node.setAttribute("tabindex", previous);
      }

      // Remove additional focus prevention attributes
      node.removeAttribute('aria-disabled');
      node.removeEventListener('focus', this.preventFocus);
      if (node.tagName.toLowerCase() === 'a') {
        node.style.pointerEvents = 'auto';
      }

      delete node.dataset.flickAdaPrevTabindex;
    });
  }
}

let flickPatch = {};
document.addEventListener("DOMContentLoaded", () => {
  // Delay patch initialization to ensure Flickity carousel has been initialized first
  // This prevents race condition where aria-hidden elements are set before focus management is active
  setTimeout(() => {
    flickPatch = new FlickPatch(document, ".flickity-slider");
    flickPatch.init();
  }, 150);
});
