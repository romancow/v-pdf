var app = new Vue({
	components: {  VPdf: VPdf.VPdfPage },
	el: '#app',
	data: {
		title: "VPdf Test",
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
