import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import vue from 'rollup-plugin-vue'
import typescript from 'rollup-plugin-typescript'
import pug from 'vue-pug-plugin'

export default {
	input: 'src/index.ts',
	context: 'window',
	output: {
		format: 'esm',
		file: 'build/v-pdf.esm.js'
	},
	external: ['vue', 'pdfjs-dist'],
	plugins: [
		resolve(),
		commonjs(),
		typescript(),
		vue({
			template: {
				preprocessOptions: { // 'preprocessOptions' is passed through to the pug compiler 
					plugins: [{
						preCodeGen: pug
					}]
				}
			}
		}),
	]
}