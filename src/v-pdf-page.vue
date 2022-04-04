<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import type { PDFPageProxy } from 'pdfjs-dist'

@Component
export default class VPdfPage extends Vue {

	@Prop({ type: Object, default: null })
	readonly value!: Promise<PDFPageProxy | null> | PDFPageProxy | null

	@Prop({ type: Number, default: 1 })
	readonly scale!: number

	page: PDFPageProxy | null = null

	get pageNumber() {
		return this.page?.pageNumber ?? 0
	}

	get viewport() {
		const { scale, page } = this
		return page?.getViewport({ scale })
	}

	get size() {
		const { width = 0, height = 0 } = this.viewport ?? {}
		return { width, height }
	}

	get renderParams() {
		const { $refs, viewport } = this
		const canvas = $refs.canvas as HTMLCanvasElement | undefined
		const canvasContext = canvas?.getContext('2d')
		return  ((viewport == null) || (canvas == null) || (canvasContext == null)) ?
			null : { canvasContext, viewport }
	}

	get isLoading() {
		const { value, page } = this
		return (value != null) && (page ==null)
	}

	updated() {
		const { page, renderParams } = this
		renderParams && page?.render(renderParams)
	}

	@Watch("value", { immediate: true })
	async handleValuePromise(value: VPdfPage['value']) {
		this.page = await value
	}
}
</script>


<template lang="pug">

	div.v-pdf-page.loading(v-if='isLoading')
		slot(name='loading')
	canvas.v-pdf-page(
		v-else,
		ref='canvas',
		:data-page='pageNumber',
		:data-scale='scale',
		:width='size.width',
		:height='size.height'
	)

</template>


<style lang="sass" scoped>

</style>