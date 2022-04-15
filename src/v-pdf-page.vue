<script lang="ts">
import { Component, Prop, Watch } from 'vue-property-decorator'
import VPdfBase from './v-pdf-base'
import type { PDFPageProxy } from 'pdfjs-dist'

@Component
export default class VPdfPage extends VPdfBase {

	@Prop({ type: String, default: null })
	readonly transition!: string | null

	documentPage: PDFPageProxy | null = null

	get currentPage() {
		return this.documentPage?.pageNumber ?? 0
	}

	@Watch('document')
	@Watch('page')
	async setDocumentPage() {
		const { document, page } = this
		this.documentPage = !document ? null :
			await this.loadEmit('page', document.getPage(page))
	}
}
</script>


<template lang="pug">

	div.v-pdf-page
		transition(:name='transition')
			v-pdf-render(:key='src + "#" + currentPage', :value='documentPage', :scale='scale')

</template>


<style lang="css" scoped>

</style>