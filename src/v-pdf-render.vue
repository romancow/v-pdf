<script lang="ts">
import { Vue, Component, Prop, Watch, Emit } from 'vue-property-decorator'
import type { PDFPageProxy } from 'pdfjs-dist'

@Component
export default class VPdfRender extends Vue {

	@Prop({ type: [Object, Promise], default: null })
	readonly value!: Promise<PDFPageProxy | null> | PDFPageProxy | null

	@Prop({ type: Number, default: null })
	readonly scale!: number | null

	@Prop({ type: Boolean, default: false })
	readonly fitWidth!: boolean

	@Prop({ type: Boolean, default: false })
	readonly fitHeight!: boolean

	@Prop({ type: Number, default: null })
	readonly loadingWidth!: number | null

	@Prop({ type: Number, default: null })
	readonly loadingHeight!: number | null

	page: PDFPageProxy | null = null
	isLoading: boolean = false

	get defaultViewport() {
		const { page } = this
		return page?.getViewport({ scale: 1 }) ?? null
	}

	get calculatedScale() {
		const { scale, defaultViewport, fitWidth, fitHeight, $el } = this
		if (scale != null) return scale

		const { width: pdfWidth, height: pdfHeight } = defaultViewport ?? {}
		const { width, height } = $el?.parentElement?.getBoundingClientRect() ?? {}
		const widthScale = (fitWidth && pdfWidth && width) ? width / pdfWidth : 1
		const heightScale = (fitHeight && pdfHeight && height) ? height / pdfHeight : 1
		return Math.min(widthScale, heightScale, 1)
	}

	get pageNumber() {
		return this.page?.pageNumber ?? 0
	}

	get viewport() {
		const { calculatedScale, page } = this
		return page?.getViewport({ scale: calculatedScale })
	}

	get renderParams() {
		const { $refs, viewport } = this
		const canvas = $refs.canvas as HTMLCanvasElement | undefined
		const canvasContext = canvas?.getContext('2d')
		return  ((viewport == null) || (canvas == null) || (canvasContext == null)) ?
			null : { canvasContext, viewport }
	}

	get hasPage() {
		return !!this.page
	}

	get canvasWidth() {
		const { viewport } = this
		return viewport?.width
	}

	get canvasHeight() {
		const { viewport } = this
		return viewport?.height
	}

	get style() {
		const { viewport, loadingWidth, loadingHeight, hasPage, isLoading } = this
		const sizes: (number | null | undefined)[] = (hasPage && !isLoading) ?
			[viewport?.width, viewport?.height] :
			[loadingWidth, loadingHeight]
		return sizes.reduce((rules, size, index) => {
			if (size != null)
				rules[index ? "height" : "width"] = `${size}px`
			return rules
		}, {} as { [rule: string]: string })
	}

	async updated() {
		const { page, renderParams } = this
		await (renderParams && page?.render(renderParams))
		this.rendered()
	}

	@Watch("value", { immediate: true })
	async handleValuePromise(value: VPdfRender['value']) {
		this.isLoading = value != null
		this.page = await value
		this.isLoading = false
	}

	@Emit()
	rendered() {
		return this.page
	}
}
</script>


<template lang="pug">

	.v-pdf-render(:class='{ loading: isLoading }', :style='style')
		slot(name='loading', v-if='isLoading')
			span Loading page...
		canvas(
			v-else-if='hasPage',
			ref='canvas',
			:data-page='pageNumber',
			:data-scale='calculatedScale',
			:width='canvasWidth',
			:height='canvasHeight'
		)

</template>


<style lang="css" scoped>

	.v-pdf-render {
		border: 1px solid rgba(0,0,0,0.5);
		overflow: hidden;
		box-sizing: border-box;
	}

</style>