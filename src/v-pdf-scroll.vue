<script lang="ts">
import { Component, Prop, Watch } from 'vue-property-decorator'
import VPdfBase from './v-pdf-base'
import Intersect from './v-intersect'


@Component({
	directives: { Intersect }
})
export default class VPdfScroll extends VPdfBase {

	@Prop({ type: Boolean, default: false})
	readonly horizontal!: boolean

	@Prop({ type: Number, default: 5 })
	readonly margin!: number

	@Prop({ type: Boolean, default: true })
	readonly smooth!: boolean

	@Prop({ type: Number, default: 0.67 })
	readonly threshold!: number

	intersectionObserver!: IntersectionObserver

	get pageStyle() {
		const { margin } = this
		return {
			margin: margin ? `${margin}px` : null
		}
	}

	getPageElement(page: number) {
		return this.$el.querySelector<HTMLElement>(`.v-pdf-render[data-page="${page}"]`)
	}

	@Watch('page')
	scrollToPage(page: number) {
		const pageElem = this.getPageElement(page)
		pageElem?.scrollIntoView({
			block: "start",
			inline: "nearest",
			behavior: this.smooth ? "smooth" : "auto"
		})
	}

	@Watch('threshold')
	setIntersectionObserver(threshold: number = this.threshold) {
		this.intersectionObserver?.disconnect()
		this.intersectionObserver = new IntersectionObserver(
			this.pageIntersected,
			{ root: this.$el, threshold }
		)
	}

	async pageRendered({ page }: { page: { pageNumber: number }}) {
		const current = this.page
		if ((page.pageNumber <= current) && (current !== 1))
			this.scrollToPage(current)
	}

	pageIntersected(entries: IntersectionObserverEntry[]) {
		const { page } = this
		const pages = entries
			.filter(entry => entry.isIntersecting)
			.map(entry => +((<HTMLElement>entry.target).dataset.page ?? ""))
			.filter(entry => !!entry)
		if (!pages.includes(page) && pages.length)
			this.$emit('update:page', pages[0])
	}

	mounted() {
		this.setIntersectionObserver()
	}

}
</script>


<template lang="pug">

	div.v-pdf-scroll(:class='{ horizontal }')
		v-pdf-render(
			v-for='(page, num) in pages',
			v-intersect='intersectionObserver',
			:key='getPageKey(num)',
			:value='page',
			:scale='scale',
			:fit-width='!horizontal',
			:fit-height='horizontal',
			:margin='margin',
			:style='pageStyle',
			@rendered='pageRendered'
		)

</template>


<style lang="css" scoped>

	.v-pdf-scroll {
		overflow: scroll;
		display: flex;
		flex-direction: column;
		flex-wrap: nowrap;
		border: 1px solid rgba(0,0,0,0.5);
		background-color: rgba(0,0,0,0.25);
	}

	.v-pdf-scroll.horizontal {
		flex-direction: row;
	}

	.v-pdf-scroll .v-pdf-render {
		flex: none;
		margin: 5px;
		border: none;
		box-shadow: 0px 0px 10px #222;
	}

</style>
 