<script lang="ts">
import { Component, Prop, Watch } from 'vue-property-decorator'
import VPdfBase from './v-pdf-base'
import type { PDFPageProxy } from 'pdfjs-dist'

@Component
export default class VPdfPage extends VPdfBase {

	@Prop({ type: String, default: null })
	readonly transition!: string | null

	@Prop({ type: Boolean, default: false })
	readonly contain!: boolean

	documentPage: PDFPageProxy | null = null

	get currentPage() {
		return this.documentPage?.pageNumber ?? 0
	}

	@Watch('document')
	@Watch('pageNumber')
	async setDocumentPage() {
		const { document, pageNumber } = this
		this.documentPage = !document ? null :
			await this.loadEmit('page', document.getPage(pageNumber))
	}
}
</script>


<template lang="pug">

	div.v-pdf-page
		transition(:name='transition', mode='out-in')
			v-pdf-render(
				:key='getPageKey(currentPage)',
				:value='documentPage',
				:scale='scale',
				:fit-width='contain',
				:fit-height='contain'
			)

</template>


<style lang="css" scoped>

	.v-pdf-page {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.v-pdf-page .v-pdf-render.loading {
		width: 100%;
		height: 100%;
	}

</style>