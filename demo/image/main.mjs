import { AsciifyGUI } from '../common/gui.mjs'

const isLocal = !window.location.origin.includes('sister.software')
const asciifyModuleID = isLocal ? '/dist/mod.mjs' : '@sister.software/asciify'
console.debug(`Loading Asciify module from ${asciifyModuleID}`)

const { Asciify, createDefaultOptions } = await import(asciifyModuleID)

async function initialize() {
  const canvasContainer = document.getElementById('canvas-container')
  const imagePreviewerSource = document.getElementById('image-previewer-source')
  const canvas = document.createElement('canvas')

  canvas.style.maxHeight = `${canvasContainer.clientHeight}px`
  canvas.style.height = '100%'
  canvas.style.width = '100%'
  canvasContainer.appendChild(canvas)

  const asciiOptions = createDefaultOptions({
    // backgroundColor: '#00ff00',
    // pixelRatio: 1,
    // fontSize: 17,
  })
  const asciify = new Asciify(canvas, asciiOptions)

  const filePicker = document.getElementById('file-picker')
  let sourceRef = null
  let imageElementRef = null
  let timeoutRef = -1

  function decodeImageFromFile(fileOrURL) {
    return new Promise((resolve, reject) => {
      // We use an image element to take advantage of the browser's built-in image
      // decoding and and orientation handling.
      const imageElement = new Image()
      imageElement.onerror = reject

      imageElement.onload = () => {
        console.debug('Image loaded, rasterizing...')
        resolve(imageElement)
      }

      const normalizedURL = fileOrURL instanceof URL ? fileOrURL : URL.createObjectURL(fileOrURL)
      imageElement.src = normalizedURL
      imagePreviewerSource.src = normalizedURL
    })
  }

  // Expose asciify to the window for debugging
  window.asciify = asciify
  asciify.setSize(canvas.parentElement.clientWidth, canvas.parentElement.clientHeight)
  imagePreviewerSource.style.width = `${canvas.parentElement.clientWidth}px`

  async function updateDemo(nextSourceRef) {
    sourceRef = nextSourceRef
    imageElementRef = await decodeImageFromFile(sourceRef)

    await asciify.rasterizeImage(imageElementRef)
  }

  const onOptionChange = () => {
    clearTimeout(timeoutRef)
    asciify.setOptions(asciiOptions)

    timeoutRef = setTimeout(() => {
      if (imageElementRef) {
        asciify.rasterizeImage(imageElementRef)
      }
    }, 100)
  }

  const gui = new AsciifyGUI(asciiOptions, onOptionChange)
  gui.domElement.classList.add('top', 'right')
  document.getElementById('options-fieldset').appendChild(gui.domElement)

  const onWindowResize = async () => {
    // Check for upward overscrolling...
    if (window.document.documentElement.clientHeight !== window.innerHeight) return
    // Check for downward overscrolling...
    if (window.pageYOffset !== 0) return

    clearTimeout(timeoutRef)
    canvas.style.maxHeight = `${canvasContainer.clientHeight}px`

    asciify.setSize(canvasContainer.clientHeight, canvasContainer.clientWidth)

    if (sourceRef) {
      updateDemo(sourceRef)
    }
  }

  window.addEventListener('resize', onWindowResize)

  filePicker.addEventListener('change', async (e) => {
    const file = e.target.files[0]

    console.log('CHANGE')
    await updateDemo(new File([file], file.name, { type: file.type }))

    filePicker.value = ''
  })

  await updateDemo(new URL('/demo/common/test-pattern.svg', window.location.origin))
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize)
} else {
  initialize()
}
