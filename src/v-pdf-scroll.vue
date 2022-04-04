<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import type { PDFDocumentProxy/*, PDFPageProxy*/ } from 'pdfjs-dist'
import VPdfPage from './v-pdf-page.vue'

@Component({
	components: { VPdfPage }
})
export default class VPdfScroll extends Vue {

	@Prop({ type: String, default: null })
	readonly src!: string | null

	@Prop({ type: Number, default: 1 })
	readonly page!: number

	@Prop({ type: Number, default: 1})
	readonly scale!: number

	@Prop({ type: Boolean, default: false})
	readonly horizontal!: boolean

	document: PDFDocumentProxy | null = null

	get pageCount() {
		return this.document?.numPages ?? 0
	}

	getPageKey(page: number) {
		const { src } = this
 		return `${src || ""}#${page}`
	}
}
</script>


<template lang="pug">

	div.v-pdf-scroll(:class='{ horizontal }')
		v-pdf-page(
			v-for='pageNum in pageCount',
			:key='getPageKey(pageNum)',
			value='pageNum',
			scale='scale'
		)

</template>


<style lang="css" scoped>

</style>
