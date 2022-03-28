import type { VueConstructor, CreateElement } from 'vue'
import Vue from 'vue'
import type { PDFPageProxy, PageViewport } from 'pdfjs-dist'

type RenderParameters = Parameters<PDFPageProxy['render']>[0]

type VPdfPage = Vue & {
	readonly value: PDFPageProxy | null,
	readonly scale: number,

	readonly pageNumber: number,
	readonly viewport: PageViewport | null
	readonly size: { width: number, height: number }
	readonly renderParams: RenderParameters | null

	renderPage(): Promise<void>
}

export default (Vue as VueConstructor<VPdfPage>).extend({

	props: {
		value: { type: Object, default: null },
		scale: { type: Number, default: 1 }
	},

	computed: {

		pageNumber() {
			return this.value?.pageNumber ?? 0
		},

		viewport(this: VPdfPage) {
			const { scale, value } = this
			return value?.getViewport({ scale })
		},

		size(this: VPdfPage) {
			const { width = 0, height = 0 } = this.viewport ?? {}
			return { width, height }
		},

		renderParams(this: VPdfPage) {
			const { $el, viewport } = this
			if (viewport == null) return null
			const canvas = $el as HTMLCanvasElement | null
			const canvasContext = canvas?.getContext('2d') as Object | undefined
			return { canvasContext, viewport }
		}

	},

	methods: {
		async renderPage(this: VPdfPage) {
			const { value, renderParams } = this
			renderParams && value?.render(renderParams)
		}
	},

	render(this: VPdfPage, h: CreateElement) {
		const { pageNumber, scale , size: domProps } = this
		const attrs = { "data-page": pageNumber, "data-scale": scale }
		return h('canvas', { class: "v-pdf-page", attrs, domProps })
	},

	async mounted(this: VPdfPage) {
		await this.$nextTick()
		return this.renderPage()
	},

	updated(this: VPdfPage) {
		return this.renderPage()
	}

})