export default {
	input: 'src/dlib.mjs',
	output: {
    name: 'dlib',
		file: 'dist/dlib.js',
		format: 'iife',
    indent: '  ',
    sourcemap: true,
		globals: {
			'gl-matrix': 'glMatrix'
		}
	},
	external: ['gl-matrix']
}
