// This list defines all the types of HTML elements that can be focused by keyboard (like links, buttons, inputs).
// We join them into a single selector string to find these elements inside carousel slides.
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

// This class patches Flickity carousels to make them accessible.
// It ensures hidden slides are not keyboard-focusable, fixing ADA violations.
class FlickPatch {
  // Constructor: sets up the class with the document and the selector for Flickity sliders.
  constructor(_d, _sQ) {
    this._d = _d; // The document object
    this._sQ = _sQ; // CSS selector for sliders, like ".flickity-slider"
    this.aF = []; // Array to hold found slider elements
    this.aObs = []; // Array to hold MutationObserver instances
  }

  // init() finds all Flickity sliders on the page and sets up watchers for each one.
  init() {
    this.aF = Array.from(this._d.querySelectorAll(this._sQ)); // Find all sliders
    if (this.aF.length) {
      // If any sliders exist
      this.aObs = []; // Reset observers array
      this.aF.forEach((eF) => {
        // For each slider
        // Create a MutationObserver to watch for changes in the slider
        const oObs = new MutationObserver(
          (mutations) => this.processMutations(mutations), // Call processMutations when changes happen
        );
        // Observe the slider for attribute changes, child additions/removals, and subtree changes
        oObs.observe(eF, { attributes: true, childList: true, subtree: true });
        this.aObs.push(oObs); // Store the observer
        this.updateFocusableStates(eF); // Immediately update focus states for this slider
      });
    }
    return this; // Return the instance for chaining
  }

  // processMutations() is called whenever the MutationObserver detects changes.
  // It re-checks all sliders to update their focus states.
  processMutations(mutations) {
    if (!mutations?.length) {
      // If no mutations, do nothing
      return;
    }

    this.aF.forEach((eF) => this.updateFocusableStates(eF)); // Update each slider
  }

  // updateFocusableStates() ensures hidden slides are unfocusable and visible ones are focusable.
  updateFocusableStates(slider) {
    this.disableHiddenSlideFocus(slider); // Make hidden slides unfocusable
    this.restoreVisibleSlideFocus(slider); // Restore focusability to visible slides
  }

  // disableHiddenSlideFocus() finds slides marked as hidden (aria-hidden="true") and makes their focusable elements unfocusable.
  disableHiddenSlideFocus(slider) {
    const hiddenSlides = Array.from(
      slider.querySelectorAll("[aria-hidden='true']"), // Find hidden slides
    );
    hiddenSlides.forEach((slide) => {
      slide.querySelectorAll(FLICK_FOCUSABLE_ELEMENTS).forEach((node) => {
        // Find focusable elements in the slide
        if (node.dataset.flickAdaPrevTabindex === undefined) {
          // If we haven't stored the original tabindex yet
          // Store the original tabindex value (or "none" if it didn't have one)
          node.dataset.flickAdaPrevTabindex = node.hasAttribute("tabindex")
            ? node.getAttribute("tabindex")
            : "none";
        }
        node.tabIndex = -1; // Set tabindex to -1 to make it unfocusable
      });
    });
  }

  // restoreVisibleSlideFocus() finds elements that were made unfocusable and restores their original focusability if they're now in a visible slide.
  restoreVisibleSlideFocus(slider) {
    const patched = Array.from(
      slider.querySelectorAll("[data-flick-ada-prev-tabindex]"), // Find elements we modified
    );
    patched.forEach((node) => {
      if (node.closest("[aria-hidden='true']")) {
        // If the element is still inside a hidden slide, skip
        return;
      }

      const previous = node.dataset.flickAdaPrevTabindex; // Get the stored original tabindex
      if (previous === "none") {
        // If it originally had no tabindex
        node.removeAttribute("tabindex"); // Remove the attribute
      } else {
        // Otherwise, restore the original value
        node.setAttribute("tabindex", previous);
      }

      delete node.dataset.flickAdaPrevTabindex; // Clean up the stored data
    });
  }
}

// Create an instance of FlickPatch and initialize it when the page loads.
let flickPatch = {};
document.addEventListener("DOMContentLoaded", () => {
  flickPatch = new FlickPatch(document, ".flickity-slider"); // Target Flickity sliders
  flickPatch.init(); // Start watching and fixing
});
