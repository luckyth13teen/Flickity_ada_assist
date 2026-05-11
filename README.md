# Flickity ADA Assist

`flick-ada.js` is a small accessibility helper for Flickity carousels.
It ensures that hidden slides and their interactive content are not keyboard-focusable,
helping prevent users from tabbing into off-screen carousel elements. Flickity v2.2.1 initial build. 

## What it does

- Detects Flickity slider containers using the selector `.flickity-slider`
- Watches slider DOM updates using `MutationObserver`
- Finds slides marked with `aria-hidden="true"`
- Sets focusable child elements inside hidden slides to `tabindex="-1"`
- Restores original tabindex values when slides become visible again

## Why it matters

Flickity carousels may keep hidden slides in the DOM even when they are visually hidden.
Without this patch, keyboard users can tab into those hidden slide controls, which is an accessibility issue.

## Installation

Include `flick-ada.js` after Flickity and before your closing `</body>` tag:

```html
<script src="path/to/flickity.pkgd.min.js"></script>
<script src="path/to/flick-ada.js"></script>
```

## Usage

No configuration is required by default.
The script automatically initializes once the page has fully loaded and attaches to the first set of elements matching `.flickity-slider`.

If you need to change the slider selector, update the selector passed to `new FlickPatch(document, ".flickity-slider")`.

## Supported focusable elements

The script handles common keyboard-focusable elements, including:

- links and area elements with `href`
- buttons, inputs, selects, textareas
- iframes, objects, embeds
- elements with `tabindex`
- elements with `contenteditable="true"`

## Notes

- The script preserves original `tabindex` values by storing them in `data-flick-ada-prev-tabindex`.
- When a slide becomes visible again, it restores the original `tabindex` or removes the attribute if none existed.
