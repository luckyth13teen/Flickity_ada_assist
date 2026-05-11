# Flick-ADA: Flickity ADA Compliance Patch

A lightweight JavaScript solution to ensure [Flickity](https://flickity.metafizzy.co/) carousels are fully compliant with ADA accessibility standards by preventing focus on hidden/non-visible slides.

## Problem

Flickity carousels dynamically show and hide slides but don't automatically manage focus states for hidden elements. This creates an accessibility violation:

```
"Ensure aria-hidden elements are not focusable nor contain focusable elements."
```

Users can tab into focusable elements (links, buttons, inputs) on hidden slides, violating WCAG 2.1 Level A compliance.

## Solution

Flick-ADA automatically:

- ✅ Sets `tabindex="-1"` on all focusable elements inside hidden slides
- ✅ Adds `aria-disabled="true"` for semantic clarity
- ✅ Prevents focus events from reaching hidden elements
- ✅ Disables pointer events on links within hidden slides
- ✅ Restores full focus capability when slides become visible
- ✅ Monitors DOM mutations to handle dynamic slide changes
- ✅ Works seamlessly with Flickity's lifecycle

## Installation

### Manual

Download `flick-ada.js` and include it in your project:

```html
<script src="path/to/flickity.min.js"></script>
<script src="path/to/flick-ada.js"></script>
```

### WordPress

Add to your theme's `functions.php`:

```php
wp_enqueue_script(
  'flick-ada',
  get_stylesheet_directory_uri() . '/assets/js/vendor/flick-ada.js',
  array(),
  '1.0.0',
  true
);
```

**Important**: Ensure Flickity is loaded first.


The patch automatically activates on `DOMContentLoaded` and requires no additional configuration.

## How It Works

### Initialization

- Waits 150ms after DOM content is loaded to ensure Flickity is initialized
- Queries all `.flickity-slider` elements on the page
- Sets up `MutationObserver` on each slider to monitor changes

### Mutation Detection

- Only processes mutations when `aria-hidden` attribute changes
- Ignores unrelated DOM mutations for performance

### Focus Management

- **Hidden slides**: All focusable elements get `tabindex="-1"`, `aria-disabled="true"`, and focus event listeners
- **Visible slides**: Original `tabindex` values are restored, focus listeners removed
- **Links**: Receive `pointer-events: none` while hidden

### Restoration

- Checks entire parent chain to ensure no hidden ancestors
- Cleanly removes all added attributes and listeners
- Restores natural pointer events

## Accessibility Benefits

✅ **WCAG 2.1 Compliance**

- Level A: Ensures no focus traps on hidden content
- Level AA: Improves keyboard navigation experience

✅ **Screen Reader Friendly**

- `aria-hidden="true"` properly prevents announcement
- `aria-disabled` provides semantic context

✅ **Keyboard Navigation**

- Tab/Shift+Tab skips over hidden slides completely
- Focus indicators only on visible, interactive elements

## Browser Support

| Browser | Support                                 |
| ------- | --------------------------------------- |
| Chrome  | ✅ Full                                 |
| Firefox | ✅ Full                                 |
| Safari  | ✅ Full                                 |
| Edge    | ✅ Full                                 |
| IE 11   | ⚠️ Partial (MutationObserver supported) |

Requires `MutationObserver` support. Use polyfills for older browsers.

## Dependencies

- **Flickity** v2.0+ (required)
- Vanilla JavaScript (no jQuery required)

## File Size

- Minified: ~2.5 KB
- Gzipped: ~0.9 KB

## API Reference

### `FlickPatch` Class

#### Constructor

```javascript
new FlickPatch(document, ".flickity-slider");
```

**Parameters:**

- `document` - DOM document object
- `".flickity-slider"` - CSS selector for carousel containers

#### Methods

##### `init()`

Initializes the patch, sets up observers, and applies initial focus management.

**Returns:** FlickPatch instance (chainable)

##### `processMutations(mutations)`

Internal method called by MutationObserver. Only processes `aria-hidden` attribute changes.

##### `updateFocusableStates(slider)`

Updates focus state of all focusable elements based on `aria-hidden` status.

##### `disableHiddenSlideFocus(slider)`

Disables focus for elements inside hidden slides.

##### `restoreVisibleSlideFocus(slider)`

Restores focus capability for elements in visible slides.

## Performance Considerations

- **Mutation Observer**: Efficiently filters for `aria-hidden` changes only
- **Lazy initialization**: 150ms delay allows Flickity to fully initialize
- **Memory efficient**: Stores element references and uses event delegation
- **No polling**: Uses event-driven architecture

## Troubleshooting

### "Ensure aria-hidden elements are not focusable" still failing

1. **Verify Flickity is loaded first**

   ```html
   <script src="flickity.pkgd.min.js"></script>
   <script src="flick-ada.js"></script>
   ```

2. **Check the selector matches your HTML**
   - Flick-ADA looks for `.flickity-slider` class
   - Ensure your carousel container has this class

3. **Run in browser console**

   ```javascript
   console.log(flickPatch);
   console.log(flickPatch.aF); // Should show carousel elements
   ```

4. **Verify no caching issues**
   - Hard refresh: `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)
   - Clear browser cache

### Elements still focusable on mobile

- Use keyboard testing tools; touch interfaces don't expose focus issues
- Test with external keyboard on mobile devices
- Use Chrome DevTools accessibility inspector

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/improvement`)
3. Test thoroughly with accessibility audits
4. Submit a pull request with description

## Testing

Run accessibility audits with:

- **Axe DevTools**: Browser extension
- **WAVE**: Browser extension or web version
- **Lighthouse**: Built into Chrome DevTools
- **NVDA/JAWS**: Screen reader testing

## License

[Add your license here - MIT, GPL, etc.]

## Changelog

### v1.0.0 (2026-05-11)

- Initial release
- Full ADA compliance for Flickity v2.0+
- Support for dynamic slide changes
- Comprehensive focus management

## Support

For issues, questions, or suggestions:

- Open an issue on GitHub
- Check existing issues for solutions
- Include browser version and Flickity version in reports

## Credits

Built to help solve accessibility challenges with [Flickity](https://flickity.metafizzy.co/) carousels and comply with [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/) standards.

---

**Made with ♿ accessibility in mind**
