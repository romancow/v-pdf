import { Vue, Component, Prop, Watch, Emit } from 'vue-property-decorator'
import type { PDFPageProxy } from 'pdfjs-dist'
import { CreateElement } from 'vue'

function calcScale(dimension: number, fit: number, margin = 0) {
	const wMargin =  Math.max(fit - 2 * margin, 0)
	return (dimension && wMargin) ? wMargin / dimension : 1
}

@Component
export default class VPdfViewport extends Vue {

	@Prop({ type: [Object, Promise], default: null })
	readonly value!: Promise<PDFPageProxy | null> | PDFPageProxy | null

	@Prop({ type: Number, default: null })
	readonly scale!: number | null

	@Prop({ type: Boolean, default: false })
	readonly fitWidth!: boolean

	@Prop({ type: Boolean, default: false })
	readonly fitHeight!: boolean

	@Prop({ type: Number, default: 0 })
	readonly margin!: number

	page: PDFPageProxy | null = null
	isLoading: boolean = false

	get defaultViewport() {
		const { page } = this
		return page?.getViewport({ scale: 1 }) ?? null
	}

	get calculatedScale() {
		const { scale, defaultViewport, fitWidth, fitHeight, margin, $el } = this
		if (scale != null) return scale

		const { width = 0, height = 0 } = defaultViewport ?? {}
		const { clientWidth = 0, clientHeight = 0 } = $el?.parentElement ?? {}
		const widthScale = fitWidth ? calcScale(width, clientWidth, margin) : 1
		const heightScale = fitHeight ? calcScale(height, clientHeight, margin) : 1
		return Math.min(widthScale, heightScale, 1)
	}

	get viewport() {
		const { calculatedScale, page } = this
		return page?.getViewport({ scale: calculatedScale })
	}

	@Watch("value", { immediate: true })
	async handleValuePromise(value: VPdfViewport['value']) {
		this.isLoading = value != null
		if (this.page = await value)
			this.loaded()
	}

	@Emit()
	loaded() {
		this.isLoading = false
		const { page, viewport } = this
		return { page, viewport }
	}

	render(h: CreateElement) {
		return h()
	}
}
