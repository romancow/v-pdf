<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist'
import PdfJs from 'pdfjs-dist'
import VPdfPage from './v-pdf-page.vue'

@Component({
	components: { VPdfPage }
})
export default class VPdf extends Vue {

	@Prop({ type: String, default: null })
	readonly src!: string | null

	@Prop({ type: Number, default: 1 })
	readonly page!: number

	@Prop({ type: Number, default: 1 })
	readonly scale!: number

	@Prop({ type: String, default: null })
	readonly transition!: string | null

	document: PDFDocumentProxy | null = null
	documentPage: PDFPageProxy | null = null

	get pageCount() {
		return this.document?.numPages ?? 0
	}

	get currentPage() {
		return this.documentPage?.pageNumber ?? 0
	}

	@Watch('src', { immediate: true })
	async setDocument(src: string | null) {
		this.document?.destroy()
		this.document = !src ? null :
			await this.loadEmit('document', PdfJs.getDocument(src).promise)
	}

	@Watch('document')
	@Watch('page')
	async setDocumentPage() {
		const { document, page } = this
		this.documentPage = !document ? null :
			await this.loadEmit('page', document.getPage(page))
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

	beforeDestroy() {
		this.document?.destroy()
	}
}
</script>


<template lang="pug">

	div.v-pdf
		transition(:name='transition')
			v-pdf-page(:key='src + "#" + currentPage', :value='documentPage', :scale='scale')

</template>


<style lang="css" scoped>

</style>