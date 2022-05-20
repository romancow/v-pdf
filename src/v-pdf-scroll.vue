<script lang="ts">
import { Component, Prop, Watch } from 'vue-property-decorator'
import VPdfBase from './v-pdf-base'

@Component
export default class VPdfScroll extends VPdfBase {

	@Prop({ type: Boolean, default: false})
	readonly horizontal!: boolean

	@Prop({ type: Number, default: 5 })
	readonly margin!: number

	@Prop({ type: Boolean, default: true })
	readonly smooth!: boolean

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

	async pageRendered({ page }: { page: { pageNumber: number }}) {
		const current = this.page
		if ((page.pageNumber <= current) && (current !== 1))
			this.scrollToPage(current)
	}

}
</script>


<template lang="pug">

	div.v-pdf-scroll(:class='{ horizontal }')
		v-pdf-render(
			v-for='(page, num) in pages',
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
 