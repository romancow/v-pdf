import type { VueConstructor, CreateElement } from 'vue'
import Vue from 'vue'
import type { PDFDocumentProxy, PDFPageProxy, PageViewport } from 'pdfjs-dist'
import PdfJs from 'pdfjs-dist'

type RenderParameters = Parameters<PDFPageProxy['render']>[0]

type VPdf = Vue & {
	readonly src: string | null
	readonly page: number
	readonly scale: number
	readonly transition: string | null

	readonly pageCount: number
	readonly pageSize: { width: number, height: number }
	readonly pageViewport: PageViewport | null
	readonly pageRenderParams: RenderParameters | null
	readonly currentPage: number

	document: PDFDocumentProxy | null
	documentPage: PDFPageProxy | null

	renderPage(): Promise<void>
	loadEmit<T>(type: string, loading: Promise<T>): Promise<T | null>
}

export default (Vue as VueConstructor<VPdf>).extend({

	props: {
		src: { type: String, default: null },
		page: { type: Number, default: 1 },
		scale: { type: Number, default: 1 },
		transition: { type: String, default: null }
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
			const { width = 0, height = 0 } = this.pageViewport ?? {}
			return { width, height }
		},

		pageViewport(this: VPdf) {
			const { scale, documentPage } = this
			return documentPage?.getViewport({ scale })
		},

		pageRenderParams(this: VPdf) {
			const { $el, page, pageViewport: viewport } = this
			if (viewport == null) return null
			const canvas = $el.querySelector(`canvas[data-page="${page}"]`) as HTMLCanvasElement | null
			const canvasContext = canvas?.getContext('2d') as Object | undefined
			return { canvasContext, viewport }
		},

		currentPage(this: VPdf) {
			return this.documentPage?.pageNumber ?? 0
		}
	},

	methods: {
		async setDocumentPage(this: VPdf) {
			const { document, page } = this
			this.documentPage = !document ? null :
				await this.loadEmit('page', document.getPage(page))
		},

		async renderPage(this: VPdf) {
			const { documentPage, pageRenderParams: params } = this
			params && documentPage?.render(params)
		},

		async loadEmit<T>(this: VPdf, type: string, promise: Promise<T>) {
			const { src } = this
			let loaded: T | null = null
			try {
				loaded = await promise
				this.$emit(`${type}-load`, { src, [type]: loaded })
			}
			catch (error) {
				this.$emit('error', error)
			}
			return loaded
		}
	},

	watch: {
		src: {
			async handler(this: VPdf, src: string | null) {
				this.document?.destroy()
				this.document = !src ? null :
					await this.loadEmit('document', PdfJs.getDocument(src).promise)
			},
			immediate: true
		},

		document: "setDocumentPage",
		page: "setDocumentPage"
	},

	render(this: VPdf, h: CreateElement) {
		const { src, currentPage, pageSize: domProps, transition } = this
		const attrs = { "data-page": currentPage }
		const key = `${src}#${currentPage}`
		const canvas = h('canvas', { attrs, domProps, key })
		const transtionNode = h('transition', { props: { name: transition }}, [canvas])
		return h('div', { class: 'v-pdf'}, [transtionNode])
	},

	updated(this: VPdf) {
		return this.renderPage()
	},

	beforeDestroy(this: VPdf) {
		this.document?.destroy()
	}
})