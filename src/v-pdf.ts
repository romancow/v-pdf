import type { VueConstructor, CreateElement } from 'vue'
import Vue from 'vue'
import type { PDFDocumentProxy, PDFPageProxy, PageViewport } from 'pdfjs-dist'
import PdfJs from 'pdfjs-dist'

type RenderParameters = Parameters<PDFPageProxy['render']>[0]

type VPdf = Vue & {
	readonly src: string | null
	readonly page: number
	readonly scale: number

	readonly pageCount: number
	readonly pageSize: { width: number, height: number }
	readonly pageViewport: PageViewport | null
	readonly pageRenderParams: RenderParameters | null

	document: PDFDocumentProxy | null
	documentPage: PDFPageProxy | null

	renderPage(): Promise<void>
}

export default (Vue as VueConstructor<VPdf>).extend({

	props: {
		src: { type: String, default: null },
		page: { type: Number, default: 1 },
		scale: { type: Number, default: 1 }
	},

	data() {
		return {
			document: null,
			documentPage: null
		}
	},

	computed: {
		pageCount(this: VPdf) {
			return this.document?.numPages ?? 0
		},

		pageSize(this: VPdf) {
			const { width, height } = this.pageViewport ?? {}
			return { width, height }
		},

		pageViewport(this: VPdf) {
			const { scale, documentPage } = this
			return documentPage?.getViewport({ scale })
		},

		pageRenderParams(this: VPdf) {
			const { $el, pageViewport: viewport } = this
			if (viewport == null) return null
			const canvas = $el.getElementsByTagName('canvas')[0]
			const canvasContext = canvas.getContext('2d') as Object
			return { canvasContext, viewport }
		}
	},

	methods: {
		async setDocumentPage(this: VPdf) {
			const { document, page } = this
			this.documentPage = !document ? null :
				await document.getPage(page)
		},

		async renderPage(this: VPdf) {
			const { documentPage, pageRenderParams: params } = this
			params && documentPage?.render(params)
		}
	},

	watch: {
		src: {
			async handler(this: VPdf, newSrc: string | null) {
				this.document?.destroy()
				this.document = !newSrc ? null :
					await PdfJs.getDocument(newSrc).promise
			},
			immediate: true
		},

		document: "setDocumentPage",
		page: "setDocumentPage"
	},

	render(this: VPdf, h: CreateElement) {
		const domProps = this.pageSize
		const canvas = h('canvas', { domProps })
		return h('div', { class: 'v-pdf'}, [canvas])
	},

	updated(this: VPdf) {
		return this.renderPage()
	},

	beforeDestroy(this: VPdf) {
		this.document?.destroy()
	}
})