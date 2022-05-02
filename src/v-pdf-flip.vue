<script lang="ts">
import { Component, Watch } from 'vue-property-decorator'
import VPdfBase from './v-pdf-base'
import { PageFlip, FlipCorner, SizeType } from 'page-flip'
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

	pageFlip!: PageFlip | null

	get pageIndex() {
		return this.pageFlip?.getCurrentPageIndex() ?? -1
	}

	set pageIndex(index: number) {
		this.$emit('update:page', index + 1)
	}

	get settings() {
		const settings = PageFlipSetting.get(this)
		const { pageCount, $el } = this
		const { width: clientWidth, height } = $el.getBoundingClientRect()
		const width = clientWidth / ((pageCount <= 1) ? 1 : 2)
		return Object.assign({ width, height }, settings)
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
		const { settings } = this
		const elem = this.$el as HTMLElement
		const pageFlip = this.pageFlip = new PageFlip(elem, settings)
		pageFlip.on('flip', ev => this.pageIndex = ev.data as number)
		const pages = this.getPages()
		pageFlip.loadFromHTML(pages)
	}

	async updated() {
		await this.$nextTick()
		const pages = this.getPages()
		this.pageFlip?.updateFromHtml(pages)
	}

	beforeDestroy() {
		this.pageFlip?.destroy()
	}

}
</script>


<template lang="pug">

	.v-pdf-flip(:data-pages='pageCount')
		.v-pdf-flip-page(v-for='(page, num) in pages', :key='getPageKey(num)')
			v-pdf-render(fit-width, fit-height, :value='page', :scale='scale')
		//- v-pdf-render.v-pdf-flip-page(
		//- 	v-for='(page, num) in pages',
		//- 	:key='getPageKey(num)',
		//- 	:value='page',
		//- 	:scale='scale',
		//- 	fit-width
		//- )

</template>


<style lang="css" scoped>

	.v-pdf-flip-page {
		display: block !important;
		width: 50%;
		height: 100%;
	}

	.v-pdf-flip[data-pages="1"] .v-pdf-flip-page {
		width: 100%;
	}

	.v-pdf-flip-page .v-pdf-render {
		width: 100%;
		height: 100%;
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