import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import PdfJs from 'pdfjs-dist'
import VPdfRender from './v-pdf-render.vue'

@Component({
	components: { VPdfRender }
})
export default class VPdfBase extends Vue {

	@Prop({ type: String, default: null })
	readonly src!: string | null

	@Prop({ type: Number, default: 1 })
	readonly page!: number

	@Prop({ type: Number, default: null })
	readonly scale!: number | null

	document: PDFDocumentProxy | null = null

	get pageCount() {
		return this.document?.numPages ?? 0
	}

	get pages() {
		const { document, pageCount: length } = this
		return Array.from({ length }, (_, index) => document?.getPage(index + 1))
	}

	getPageKey(page: number) {
		const { src } = this
 		return `${src || ""}#${page}`
	}

	async loadEmit<T>(type: string, promise: Promise<T>) {
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

	@Watch('src', { immediate: true })
	async setDocument(src: string | null) {
		this.document?.destroy()
		this.document = !src ? null :
			await this.loadEmit('document', PdfJs.getDocument(src).promise)
	}

	beforeDestroy() {
		this.document?.destroy()
	}

}