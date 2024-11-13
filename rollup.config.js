export default {
	input: 'src/dailib.mjs',
	output: {
    name: 'dailib',
		file: 'dist/dailib.js',
		format: 'iife',
    indent: '  ',
    sourcemap: true,
		globals: {
			'gl-matrix': 'glMatrix'
		}
	},
	external: ['gl-matrix']
}
