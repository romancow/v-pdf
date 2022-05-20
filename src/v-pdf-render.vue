<script lang="ts">
import { Component, Prop, Emit } from 'vue-property-decorator'
import VPdfViewport from './v-pdf-viewport'

@Component
export default class VPdfRender extends VPdfViewport {

	@Prop({ type: Number, default: null })
	readonly loadingWidth!: number | null

	@Prop({ type: Number, default: null })
	readonly loadingHeight!: number | null

	get pageNumber() {
		return this.page?.pageNumber ?? 0
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

	@Emit()
	rendered() {
		const { page, viewport } = this
		return { page, viewport }
	}
}
</script>


<template lang="pug">

	.v-pdf-render(
		:class='{ loading: isLoading }',
		:style='style',
		:data-page='pageNumber',
		:data-scale='calculatedScale',
	)
		slot(name='loading', v-if='isLoading')
			span Loading page...
		canvas(
			v-else-if='hasPage',
			ref='canvas',
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