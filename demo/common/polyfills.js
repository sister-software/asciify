// Polyfill the OffscreenCanvas API for browsers that don't support it.
if (typeof OffscreenCanvas === 'undefined') {
  window.OffscreenCanvas = class OffscreenCanvas {
    constructor(_width, _height) {
      return document.createElement('canvas')
    }
  }
}
