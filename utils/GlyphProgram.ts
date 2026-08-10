/**
 * @copyright Sister Software
 * @license MIT
 * @author Teffen Ellis, et al.
 */

import type { GlyphAtlas } from "./GlyphAtlas.ts"

const VERTEX_SHADER = /* glsl */ `#version 300 es
in vec2 position;

void main() {
	gl_Position = vec4(position, 0.0, 1.0);
}`

const FRAGMENT_SHADER = /* glsl */ `#version 300 es
precision highp float;

/** One texel per character cell. */
uniform sampler2D uSource;
/** Every distinct glyph, packed into a horizontal strip. */
uniform sampler2D uAtlas;
/** 256x1, red channel holds the glyph slot for that luminance. */
uniform sampler2D uLuminanceToSlot;

uniform vec2 uGrid;
uniform float uCellSize;
uniform float uTextureSize;
uniform float uSlotCount;
uniform float uCanvasHeight;
uniform vec4 uBackground;
uniform float uColorize;
uniform float uFlipY;

out vec4 fragColor;

void main() {
	// gl_FragCoord is bottom-up; the character grid is top-down, like the 2D renderer's.
	vec2 pixel = vec2(gl_FragCoord.x, uCanvasHeight - gl_FragCoord.y);
	vec2 cell = floor(pixel / uCellSize);

	// The surface is rarely an exact multiple of the cell size. Anything past the last full
	// row or column is background, matching the 2D renderer leaving those pixels unpainted.
	if (cell.x < 0.0 || cell.y < 0.0 || cell.x >= uGrid.x || cell.y >= uGrid.y) {
		fragColor = uBackground;
		return;
	}

	float sourceRow = mix(cell.y, uGrid.y - 1.0 - cell.y, uFlipY);
	vec3 rgb = texelFetch(uSource, ivec2(int(cell.x), int(sourceRow)), 0).rgb;

	// Recover the exact 0-255 bytes before quantizing. A normalized texel is byte/255, and
	// multiplying that straight back by 255 lands a hair under the integer often enough to
	// shift the luminance by one — which picks a different glyph, not a slightly different
	// shade. Rounding first makes this bit-identical to the CPU path's (3R + 4G + B) >> 3.
	vec3 bytes = floor(rgb * 255.0 + 0.5);
	float luminance = floor(dot(bytes, vec3(3.0, 4.0, 1.0)) / 8.0);
	float slot = texelFetch(uLuminanceToSlot, ivec2(int(luminance), 0), 0).r * 255.0;

	// The glyph is drawn at its natural size in the top-left of the cell, exactly as the 2D
	// renderer's drawImage does. With characterSpacingRatio > 1 the cell is larger than the
	// glyph, and the remainder must stay empty rather than stretching the glyph to fit.
	vec2 withinCell = pixel - cell * uCellSize;

	if (withinCell.x >= uTextureSize || withinCell.y >= uTextureSize) {
		fragColor = uBackground;
		return;
	}

	vec2 withinGlyph = withinCell / uTextureSize;
	vec2 atlasUv = vec2((slot + withinGlyph.x) / uSlotCount, withinGlyph.y);
	float coverage = texture(uAtlas, atlasUv).a;

	vec3 ink = mix(vec3(1.0), rgb, uColorize);

	fragColor = vec4(mix(uBackground.rgb, ink, coverage), max(uBackground.a, coverage));
}`

const UNIFORM_NAMES = [
	"uSource",
	"uAtlas",
	"uLuminanceToSlot",
	"uGrid",
	"uCellSize",
	"uTextureSize",
	"uSlotCount",
	"uCanvasHeight",
	"uBackground",
	"uColorize",
	"uFlipY",
] as const

/**
 * Everything needed to draw one asciified frame.
 *
 * @internal
 */
export interface GlyphDrawOptions {
	/**
	 * A `columnCount` x `rowCount` texture, one texel per character cell.
	 */
	sourceTexture: WebGLTexture
	columnCount: number
	rowCount: number
	/**
	 * The grid pitch in device pixels.
	 */
	cellSize: number
	/**
	 * The glyph's own size in device pixels, which is smaller than `cellSize` when `characterSpacingRatio` exceeds one.
	 */
	textureSize: number
	drawingBufferWidth: number
	drawingBufferHeight: number
	background: readonly [number, number, number, number]
	colorize: boolean
	/**
	 * Whether the source texture's rows run bottom-to-top. Textures rendered into a framebuffer do; textures uploaded
	 * from a canvas do not.
	 */
	flipY: boolean
}

/**
 * The shader program, glyph textures, and single draw call shared by every WebGL renderer.
 *
 * @remarks
 *   Both {@linkcode AsciifyWebGL} and {@linkcode AsciifyPass} rasterize the same way — the only difference is who owns
 *   the context and where the source texture comes from. Keeping the GLSL in one place is what lets the two backends
 *   stay pixel-identical. Texture units 1 and 2 belong to this program. The source texture is bound to unit 0 at draw
 *   time from the handle the caller supplies.
 * @category Utility
 * @internal
 */
export class GlyphProgram {
	public readonly gl: WebGL2RenderingContext

	protected _program: WebGLProgram
	protected _vertexArray: WebGLVertexArrayObject
	protected _buffer: WebGLBuffer
	protected _uniforms: Record<string, WebGLUniformLocation | null>
	protected _atlasTexture: WebGLTexture
	protected _luminanceTexture: WebGLTexture
	protected _slotCount = 1

	constructor(gl: WebGL2RenderingContext) {
		this.gl = gl

		const program = gl.createProgram()!
		const vertexShader = this._compile(gl.VERTEX_SHADER, VERTEX_SHADER)
		const fragmentShader = this._compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER)

		gl.attachShader(program, vertexShader)
		gl.attachShader(program, fragmentShader)
		gl.linkProgram(program)

		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			throw new Error(`Asciify: shader program failed to link. ${gl.getProgramInfoLog(program)}`)
		}

		gl.deleteShader(vertexShader)
		gl.deleteShader(fragmentShader)

		this._program = program

		// A VAO keeps our attribute state off whatever the host context is doing.
		this._vertexArray = gl.createVertexArray()!
		gl.bindVertexArray(this._vertexArray)

		// One oversized triangle covers the viewport with no index buffer and no clipping seam.
		this._buffer = gl.createBuffer()!
		gl.bindBuffer(gl.ARRAY_BUFFER, this._buffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)

		gl.useProgram(program)

		const positionLocation = gl.getAttribLocation(program, "position")
		gl.enableVertexAttribArray(positionLocation)
		gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

		gl.bindVertexArray(null)

		this._uniforms = Object.fromEntries(UNIFORM_NAMES.map((name) => [name, gl.getUniformLocation(program, name)]))

		this._atlasTexture = this._createTexture()
		this._luminanceTexture = this._createTexture()

		gl.uniform1i(this._uniforms.uSource!, 0)
		gl.uniform1i(this._uniforms.uAtlas!, 1)
		gl.uniform1i(this._uniforms.uLuminanceToSlot!, 2)
	}

	/**
	 * Uploads a glyph atlas and its luminance table. Call whenever the character set changes.
	 */
	public setAtlas(atlas: GlyphAtlas): void {
		const { gl } = this

		this._slotCount = atlas.slotCount

		gl.activeTexture(gl.TEXTURE1)
		gl.bindTexture(gl.TEXTURE_2D, this._atlasTexture)
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
		gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false)
		gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE)
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas.canvas)

		// The luminance table rides along as a 256x1 texture so the shader never recomputes it,
		// which keeps the contrast-ratio padding defined in exactly one place.
		const table = new Uint8Array(256 * 4)

		for (let luminance = 0; luminance < 256; luminance++) {
			table[luminance * 4] = atlas.luminanceToSlot[luminance]!
			table[luminance * 4 + 3] = 255
		}

		gl.activeTexture(gl.TEXTURE2)
		gl.bindTexture(gl.TEXTURE_2D, this._luminanceTexture)
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 256, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, table)
	}

	/**
	 * Rasterizes one frame into whatever framebuffer is currently bound.
	 */
	public draw(options: GlyphDrawOptions): void {
		const { gl } = this
		const [red, green, blue, alpha] = options.background

		gl.useProgram(this._program)
		gl.bindVertexArray(this._vertexArray)
		gl.viewport(0, 0, options.drawingBufferWidth, options.drawingBufferHeight)

		gl.activeTexture(gl.TEXTURE1)
		gl.bindTexture(gl.TEXTURE_2D, this._atlasTexture)
		gl.activeTexture(gl.TEXTURE2)
		gl.bindTexture(gl.TEXTURE_2D, this._luminanceTexture)
		gl.activeTexture(gl.TEXTURE0)
		gl.bindTexture(gl.TEXTURE_2D, options.sourceTexture)

		gl.uniform2f(this._uniforms.uGrid!, options.columnCount, options.rowCount)
		gl.uniform1f(this._uniforms.uCellSize!, options.cellSize)
		gl.uniform1f(this._uniforms.uTextureSize!, options.textureSize)
		gl.uniform1f(this._uniforms.uSlotCount!, this._slotCount)
		gl.uniform1f(this._uniforms.uCanvasHeight!, options.drawingBufferHeight)
		gl.uniform4f(this._uniforms.uBackground!, red, green, blue, alpha)
		gl.uniform1f(this._uniforms.uColorize!, options.colorize ? 1 : 0)
		gl.uniform1f(this._uniforms.uFlipY!, options.flipY ? 1 : 0)

		gl.drawArrays(gl.TRIANGLES, 0, 3)

		gl.bindVertexArray(null)
	}

	/**
	 * Creates a texture suitable for the source: nearest filtering, clamped, no mips.
	 *
	 * @internal
	 */
	public createSourceTexture(): WebGLTexture {
		return this._createTexture()
	}

	public dispose(): void {
		const { gl } = this

		gl.deleteTexture(this._atlasTexture)
		gl.deleteTexture(this._luminanceTexture)
		gl.deleteBuffer(this._buffer)
		gl.deleteVertexArray(this._vertexArray)
		gl.deleteProgram(this._program)
	}

	/**
	 * @ignore
	 */
	protected _compile(type: number, source: string): WebGLShader {
		const { gl } = this
		const shader = gl.createShader(type)!

		gl.shaderSource(shader, source)
		gl.compileShader(shader)

		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			const log = gl.getShaderInfoLog(shader)
			gl.deleteShader(shader)

			throw new Error(`Asciify: shader failed to compile. ${log}`)
		}

		return shader
	}

	/**
	 * @ignore
	 */
	protected _createTexture(): WebGLTexture {
		const { gl } = this
		const texture = gl.createTexture()!

		gl.bindTexture(gl.TEXTURE_2D, texture)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

		return texture
	}
}
