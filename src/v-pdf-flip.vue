<script lang="ts">
import { Component, Watch } from 'vue-property-decorator'
import VPdfBase from './v-pdf-base'
import { PageFlip, FlipCorner, SizeType } from 'page-flip'
import type { PageViewport } from 'pdfjs-dist'
import PageFlipSetting from './page-flip-setting'

type FlipAnimate = boolean | FlipCorner
namespace FlipAnimate {
	export function toCorner(animate: true | FlipCorner) {
		return (animate === true) ? undefined : animate
	}
}

@Component
export default class VPdfFlip extends VPdfBase {

	@PageFlipSetting.Number
	readonly width!: number | null

	@PageFlipSetting.Number
	readonly height!: number

	@PageFlipSetting.Boolean('size', stretch => stretch ? <SizeType>"stretch" : undefined)
	readonly stretch!: boolean

	@PageFlipSetting.Number
	readonly minWidth!: number | null

	@PageFlipSetting.Number
	readonly maxWidth!: number | null

	@PageFlipSetting.Number
	readonly minHeight!: number | null

	@PageFlipSetting.Number
	readonly maxHeight!: number | null

	@PageFlipSetting.Boolean
	readonly drawShadow!: boolean | null

	@PageFlipSetting.Inverse('drawShadow')
	readonly noShadow!: boolean | null

	@PageFlipSetting.Number
	readonly flippingTime!: number | null

	@PageFlipSetting.Boolean
	readonly usePortrait!: boolean | null

	@PageFlipSetting.Inverse('usePortrait')
	readonly noPortrait!: boolean | null

	@PageFlipSetting.Boolean
	autoSize!: boolean | null

	@PageFlipSetting.Inverse('autoSize')
	readonly noAutoSize!: boolean | null

	@PageFlipSetting.Number
	readonly maxShadowOpacity!: number | null

	@PageFlipSetting.Boolean
	readonly showCover!: boolean | null

	@PageFlipSetting.Boolean
	mobileScrollSupport!: boolean | null

	@PageFlipSetting.Inverse('mobileScrollSupport')
	readonly noMobileScrollSupport!: boolean | null

	renderedWidth: number | null = null
	renderedHeight: number | null = null
	pageFlip!: PageFlip | null

	get pageWidth() {
		return this.width ?? this.renderedWidth
	}

	get pageHeight() {
		return this.height ?? this.renderedHeight
	}

	get isSized() {
		const { pageWidth, pageHeight } = this
		return (pageWidth != null) && (pageHeight != null)
	}

	get pageIndex() {
		return this.pageFlip?.getCurrentPageIndex() ?? -1
	}

	set pageIndex(index: number) {
		this.$emit('update:page', index + 1)
	}

	get settings() {
		const settings = PageFlipSetting.get(this)
		const { renderedWidth: width, renderedHeight: height } = this
		return Object.assign({ width, height }, settings)
	}

	get pageStyle() {
		const { renderedWidth: width, renderedHeight: height } = this
		const props: (keyof VPdfFlip)[]  = ["width", "minWidth", "maxWidth", "height", "minHeight", "maxHeight"]
		return props.reduce((style, prop) => {
			const value = this[prop]
			if (value != null)
				style[prop] = `${value}px`
			return style
		}, { width, height } as { [r: string]: string | null })
	}

	flipNext(animate: FlipAnimate = true) {
		const { pageFlip } = this
		if (animate)
			pageFlip?.flipNext(FlipAnimate.toCorner(animate))
		else
			pageFlip?.turnToNextPage()
	}

	flipPrev(animate: FlipAnimate = true) {
		const { pageFlip } = this
		if (animate)
			pageFlip?.flipPrev(FlipAnimate.toCorner(animate))
		else
			pageFlip?.turnToPrevPage()
	}

	@Watch('page')
	flip(page: number, animate: FlipAnimate = true) {
		const { pageFlip } = this
		const pageIndex = page - 1
		if (animate)
			pageFlip?.flip(pageIndex, FlipAnimate.toCorner(animate))
		else
			pageFlip?.turnToPage(pageIndex)
	}

	getPages() {
		return this.$el.querySelectorAll<HTMLElement>(".v-pdf-flip-page")
	}

	async mounted() {
		await this.$nextTick()
		this.setPageFlip(this.isSized)
	}

	@Watch('isSized')
	setPageFlip(isSized: boolean) {
		if (!isSized) return

		setTimeout(() => {
			const { settings } = this
			const elem = this.$el as HTMLElement
			const pageFlip = this.pageFlip = new PageFlip(elem, settings)
			pageFlip.on('flip', ev => this.pageIndex = ev.data as number)
			const pages = this.getPages()
			pageFlip.loadFromHTML(pages)
		}, 1000)
	}

	async updated() {
		await this.$nextTick()
		const pages = this.getPages()
		this.pageFlip?.updateFromHtml(pages)
	}

	beforeDestroy() {
		this.pageFlip?.destroy()
	}

	setPageSize({ viewport }: { viewport: PageViewport }) {
		this.renderedWidth ??= viewport.width
		this.renderedHeight ??= viewport.height
	}

}
</script>


<template lang="pug">

	.v-pdf-flip(:data-pages='pageCount', :class='{ loading: !isSized}')
		.v-pdf-flip-page(v-for='(page, num) in pages', :key='getPageKey(num)', :style="pageStyle")
			v-pdf-render(
				fit-width, fit-height,
				:value='page',
				:scale='scale',
				@rendered='setPageSize'
			)
		//- v-pdf-render.v-pdf-flip-page(
		//- 	v-for='(page, num) in pages',
		//- 	:key='getPageKey(num)',
		//- 	:value='page',
		//- 	:scale='scale',
		//- 	fit-width
		//- )

</template>


<style lang="css" scoped>

	.v-pdf-flip {
		overflow: hidden;
	}

	.v-pdf-flip-page {
		display: inline-block;
	}

	.v-pdf-flip.loading .v-pdf-flip-page:not(.stf__item) {
		width: 50%;
		height: 100%;
	}

	.v-pdf-flip.loading[data-pages="1"] .v-pdf-flip-page:not(.stf__item) {
		width: 100%;
	}

	/* Undo some conflicting internal styles Page Flip has for canvas elements */
	.v-pdf-flip-page .v-pdf-render ::v-deep canvas {
		position: unset;
		width: unset;
		height: unset;
		left: unset;
		right: unset
	}	


</style>