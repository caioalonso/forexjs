import npm from 'rollup-plugin-node-resolve'

export default {
  input: 'd3.bundle.js',
  name: 'd3',
  plugins: [npm({jsnext: true})],
  output: {
    file: 'lib/d3.js',
    format: 'umd'
  }
}
