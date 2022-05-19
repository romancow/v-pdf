var app = new Vue({
	components: {  VPdfPage: VPdf.Page, VPdfScroll: VPdf.Scroll, VPdfFlip: VPdf.Flip },
	el: '#app',
	data: {
		title: "VPdf Test",
		// pdf: "2021-Campus-Map.pdf",
		pdf: "file-sample.pdf",
		currentPage: 1,
		lastPage: 1
	},
	computed: {
		isLastPage() {
			const { currentPage, lastPage } = this
			return currentPage === lastPage
		},

		isFirstPage() {
			return this.currentPage <= 1
		}
	},
	methods: {
		documentLoad({ document }) {
			this.lastPage = document.numPages
		},

		prevPage() {
			const { currentPage } = this
			this.currentPage = Math.max(currentPage - 1, 1)
		},

		nextPage() {
			const { currentPage, lastPage } = this
			this.currentPage = Math.min(currentPage + 1, lastPage)
		},

		logError(error) {
			console.error(error)
		}
	}
})
