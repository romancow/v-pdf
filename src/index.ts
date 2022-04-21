export { default as VPdfPage } from './v-pdf-page.vue'
export { default as VPdfScroll } from './v-pdf-scroll.vue'
export { default as VPdfFlip} from './v-pdf-flip.vue'

import { GlobalWorkerOptions } from 'pdfjs-dist'
// @ts-ignore
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry'
GlobalWorkerOptions.workerSrc = pdfjsWorker
