import pkg from './package.json'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import vue from 'rollup-plugin-vue'
import typescript from 'rollup-plugin-typescript'
import pug from 'vue-pug-plugin'
import replace from '@rollup/plugin-replace'
import { terser } from 'rollup-plugin-terser'

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
		external: [
			...Object.keys(pkg.dependencies),
			...Object.keys(pkg.peerDependencies)
		],
		output: {
			format: 'esm',
			file: pkg.main
		}
	},{
		...base,
		input: 'src/browser.ts',
		external: Object.keys(pkg.peerDependencies),
		plugins: [
			...base.plugins,
			replace({
				preventAssignment: true,
				values: { 'process.env.NODE_ENV': '"production"' }
			})
		],
		output: {
			format: 'iife',
			file: "build/v-pdf.min.js",
			name: "VPdf",
			globals: {
				vue: "Vue",
				"pdfjs-dist": "pdfjsLib"
			},
			plugins: [ terser({ keep_classnames: true })],
			sourcemap: true
		}
	}
]