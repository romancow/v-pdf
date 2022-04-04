import type { VueConstructor, CreateElement, VNode } from 'vue'
import Vue from 'vue'
import type { PDFPageProxy, PageViewport } from 'pdfjs-dist'

type RenderParameters = Parameters<PDFPageProxy['render']>[0]

type VPdfPage = Vue & {
	readonly value: Promise<PDFPageProxy | null> | PDFPageProxy | null,
	readonly scale: number,

	page: PDFPageProxy | null

	readonly pageNumber: number,
	readonly viewport: PageViewport | null
	readonly size: { width: number, height: number }
	readonly renderParams: RenderParameters | null
	readonly isLoading: boolean

	renderPage(): Promise<void>
	renderLoading(h: CreateElement): VNode
}

export default (Vue as VueConstructor<VPdfPage>).extend({

	props: {
		value: { type: Object, default: null },
		scale: { type: Number, default: 1 }
	},

	data() {
		return {
			page: null
		}
	},

	computed: {

		pageNumber() {
			return this.page?.pageNumber ?? 0
		},

		viewport(this: VPdfPage) {
			const { scale, page } = this
			return page?.getViewport({ scale })
		},

		size(this: VPdfPage) {
			const { width = 0, height = 0 } = this.viewport ?? {}
			return { width, height }
		},

		renderParams(this: VPdfPage) {
			const { $refs, viewport } = this
			const canvas = $refs.canvas as HTMLCanvasElement | undefined
			if ((viewport == null) || (canvas == null)) return null
			const canvasContext = canvas?.getContext('2d')
			return { canvasContext, viewport }
		},

		isLoading(this: VPdfPage) {
			const { value, page } = this
			return (value != null) && (page ==null)
		}

	},

	methods: {
		async renderPage(this: VPdfPage) {
			const { page, renderParams } = this
			renderParams && page?.render(renderParams)
		},

		renderLoading(this: VPdfPage, h: CreateElement) {
			const { $slots: { loading }} = this
			return h('div', loading)
		}
	},

	render(this: VPdfPage, h: CreateElement) {
		const { pageNumber, scale , size: domProps, isLoading } = this
		const attrs = { "data-page": pageNumber, "data-scale": scale }
		return isLoading ? this.renderLoading(h) :
			h('canvas', { ref: "canvas", class: "v-pdf-page", attrs, domProps })
	},

	async mounted(this: VPdfPage) {
		await this.$nextTick()
		return this.renderPage()
	},

	updated(this: VPdfPage) {
		return this.renderPage()
	},

	watch: {
		value: {
			async handler(this: VPdfPage, value: VPdfPage['value']) {
				this.page = await value
			},
			immediate: true
		}
	}

})