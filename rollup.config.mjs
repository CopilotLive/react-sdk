import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.esm.js',
        format: 'esm',
        sourcemap: true,
      },
      {
        file: 'dist/index.cjs.js',
        format: 'cjs',
        sourcemap: true,
      },
    ],
    external: ['react', 'react-dom', 'react/jsx-runtime'],
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
      }),
    ],
  },
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'es',
    },
    external: ['react', 'react-dom', 'react/jsx-runtime'],
    plugins: [dts()],
  },
];