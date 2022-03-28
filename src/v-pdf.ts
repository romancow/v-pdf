import type { VueConstructor, CreateElement } from 'vue'
import Vue from 'vue'
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist'
import PdfJs from 'pdfjs-dist/legacy/build/pdf.js'
import VPdfPage from './v-pdf-page.js'

type VPdf = Vue & {
	readonly src: string | null
	readonly page: number
	readonly scale: number
	readonly transition: string | null

	readonly pageCount: number
	readonly currentPage: number

	document: PDFDocumentProxy | null
	documentPage: PDFPageProxy | null

	loadEmit<T>(type: string, loading: Promise<T>): Promise<T | null>
}

export default (Vue as VueConstructor<VPdf>).extend({
	components: { VPdfPage },

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
		const { src, currentPage, scale, documentPage, transition } = this
		const key = `${src}#${currentPage}`
		const props = { value: documentPage, scale }
		const page = h('v-pdf-page', { key, props })
		const transtionNode = h('transition', { props: { name: transition }}, [page])
		return h('div', { class: "v-pdf" }, [transtionNode])
	},

	beforeDestroy(this: VPdf) {
		this.document?.destroy()
	}
})