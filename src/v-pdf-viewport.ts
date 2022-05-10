import { Vue, Component, Prop, Watch, Emit } from 'vue-property-decorator'
import type { PDFPageProxy } from 'pdfjs-dist'
import { CreateElement } from 'vue'

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

	page: PDFPageProxy | null = null
	isLoading: boolean = false

	get defaultViewport() {
		const { page } = this
		return page?.getViewport({ scale: 1 }) ?? null
	}

	get calculatedScale() {
		const { scale, defaultViewport, fitWidth, fitHeight, $el } = this
		if (scale != null) return scale

		const { width: pdfWidth, height: pdfHeight } = defaultViewport ?? {}
		const { width, height } = $el?.parentElement?.getBoundingClientRect() ?? {}
		const widthScale = (fitWidth && pdfWidth && width) ? width / pdfWidth : 1
		const heightScale = (fitHeight && pdfHeight && height) ? height / pdfHeight : 1
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
