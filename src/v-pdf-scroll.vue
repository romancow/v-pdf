<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import PdfJs from 'pdfjs-dist'
import type { PDFDocumentProxy/*, PDFPageProxy*/ } from 'pdfjs-dist'
import VPdfRender from './v-pdf-render.vue'

@Component({
	components: { VPdfRender }
})
export default class VPdfScroll extends Vue {

	@Prop({ type: String, default: null })
	readonly src!: string | null

	@Prop({ type: Number, default: 1 })
	readonly page!: number

	@Prop({ type: Number, default: null })
	readonly scale!: number | null

	@Prop({ type: Boolean, default: false})
	readonly horizontal!: boolean

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
</script>


<template lang="pug">

	div.v-pdf-scroll(:class='{ horizontal }')
		v-pdf-render(
			v-for='pageNum in pageCount',
			:key='getPageKey(pageNum)',
			:value='pages[pageNum - 1]',
			:scale='scale',
			:fit-width='!horizontal',
			:fit-height='horizontal'
		)

</template>


<style lang="css" scoped>

	.v-pdf-scroll {
		overflow: scroll;
	}

</style>
 