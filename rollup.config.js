import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import url from '@rollup/plugin-url';
import terser from "@rollup/plugin-terser";

export default {
    input: 'src/index.js',
    onwarn: () => {
    },
    output: [
        {
            file: 'dist/index.cjs',
            format: 'cjs',
            inlineDynamicImports: true
        },
        {
            file: 'dist/index.js',
            format: 'es',
            inlineDynamicImports: true
        },
        {
            file: 'dist/index.umd.js',
            format: 'umd',
            name: 'diy',
            inlineDynamicImports: true
        }
    ],
    plugins: [
        commonjs(),
        json(),
        terser({
            compress: {
                drop_console: true,
            },
            mangle: {
                toplevel: true,
            },
            format: {
                comments: false,
            }
        }),
        url({
            limit: 500 * 1024, // 小于 10KB 的图片会内联，大于的会复制到输出目录
            include: '**/*.png', // 匹配 PNG 图片
            emitFiles: true // 默认为 true，表示会将图片文件复制到输出目录
        })
    ],
};