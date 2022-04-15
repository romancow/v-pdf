<script lang="ts">
import { Component, Prop } from 'vue-property-decorator'
import VPdfBase from './v-pdf-base'

@Component
export default class VPdfScroll extends VPdfBase {

	@Prop({ type: Boolean, default: false})
	readonly horizontal!: boolean

}
</script>


<template lang="pug">

	div.v-pdf-scroll(:class='{ horizontal }')
		v-pdf-render(
			v-for='pageNum in pageCount',
			:key='getPageKey(pageNum)',
			:value='pages[pageNum - 1]',
			:scale='scale',
			:fit-width='!horizontal',
			:fit-height='horizontal'
		)

</template>


<style lang="css" scoped>

	.v-pdf-scroll {
		overflow: scroll;
	}

</style>
 