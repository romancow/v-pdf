<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import type { PropType } from 'vue'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import PdfJs from 'pdfjs-dist'
import { PageFlip, FlipSetting, FlipCorner } from 'page-flip'
import VPdfRender from './v-pdf-render.vue'

const PageFlipSetting = function(type: PropType<any>) {
	const prop = Prop({ type, default: null })
	return function(target: VPdfFlip, propertyKey: keyof FlipSetting) {
		PageFlipSetting.Props.push(propertyKey)
		prop(target, propertyKey)
	}
}
PageFlipSetting.Props = [] as (keyof FlipSetting)[]
PageFlipSetting.get = function(component: VPdfFlip) {
	const settings: Partial<FlipSetting> = {}
	PageFlipSetting.Props.forEach(<K extends keyof FlipSetting>(prop: K) => {
		const value = (component as Partial<FlipSetting>)[prop]
		if (value != null)
			settings[prop] = value
	})
	return settings
}

type FlipAnimate = boolean | FlipCorner
namespace FlipAnimate {
	export function toCorner(animate: true | FlipCorner) {
		return (animate === true) ? undefined : animate
	}
}


@Component({
	components: { VPdfRender }
})
export default class VPdfFlip extends Vue {

	@Prop({ type: String, default: null })
	readonly src!: string | null

	@Prop({ type: Number, default: 1 })
	readonly page!: number

	@Prop({ type: Number, default: null })
	readonly scale!: number | null

	@PageFlipSetting(Number)
	width!: number | null

	@PageFlipSetting(Number)
	height!: number

	@PageFlipSetting(Boolean)
	drawShadow!: boolean | null

	@PageFlipSetting(Number)
	flippingTime!: number | null

	@PageFlipSetting(Boolean)
	usePortrait!: boolean | null

	@PageFlipSetting(Number)
	maxShadowOpacity!: number | null

	@PageFlipSetting(Boolean)
	showCover!: boolean | null

	pageFlip!: PageFlip | null
	document: PDFDocumentProxy | null = null

	get pageIndex() {
		return this.pageFlip?.getCurrentPageIndex() ?? -1
	}

	set pageIndex(index: number) {
		this.$emit('update:page', index + 1)
	}

	get pageCount() {
		return this.document?.numPages ?? 0
	}

	get pages() {
		const { document, pageCount: length } = this
		return Array.from({ length }, (_, index) => document?.getPage(index + 1))
	}

	get settings() {
		const settings = PageFlipSetting.get(this)
		const { width, height } = this.$el.getBoundingClientRect()
		return Object.assign({ width: width / 2, height}, settings)
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

	async mounted() {
		await this.$nextTick()
		const { settings } = this
		const elem = this.$el as HTMLElement
		const pageFlip = this.pageFlip = new PageFlip(elem, settings)
		pageFlip.on('flip',ev => this.pageIndex = ev.data as number)
		const pages = elem.querySelectorAll<HTMLElement>(".v-pdf-flip-page")
		pageFlip.loadFromHTML(pages)
	}

	updated() {
		const pages = this.$el.querySelectorAll<HTMLElement>(".v-pdf-flip-page")
		this.pageFlip?.updateFromHtml(pages)
	}

	beforeDestroy() {
		this.pageFlip?.destroy()
		this.document?.destroy()
	}

}
</script>


<template lang="pug">

	div.v-pdf-flip
		div.v-pdf-flip-page(v-for='(page, num) in pages', :key='getPageKey(num)')
			v-pdf-render(:value='page', :scale='scale')

</template>


<style lang="css" scoped>

</style>