import pkg from './package.json'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import vue from 'rollup-plugin-vue'
import typescript from 'rollup-plugin-typescript'
import pug from 'vue-pug-plugin'

const base = {
	context: 'window',
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

export default [
	{
		...base,
		input: 'src/index.ts',
		external: [/node_modules/],
		output: {
			format: 'esm',
			file: pkg.main
		}
	},{
		...base,
		input: 'src/browser.ts',
		external: ['vue', 'pdfjs-dist'],
		output: {
			format: 'iife',
			file: "build/v-pdf.js",
			name: "VPdf",
			globals: {
				vue: "Vue",
				"pdfjs-dist": "pdfjsLib"
			}
		}
	}
]