import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';

export default [
  {
    input: 'src/index.ts',
    output: [
      { file: 'dist/index.esm.js', format: 'esm' },
      { file: 'dist/index.cjs.js', format: 'cjs' }
    ],
    external: ['react', 'react-dom'],
    plugins: [typescript({ tsconfig: './tsconfig.json' })]
  },
  {
    input: 'src/index.ts',
    output: { file: 'dist/index.d.ts', format: 'es' },
    plugins: [dts()]
  }
];