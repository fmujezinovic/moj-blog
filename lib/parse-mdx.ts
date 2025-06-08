// lib/parse-mdx.ts
import { compile } from '@mdx-js/mdx';
import * as runtime from 'react/jsx-runtime';

export async function parseMDX(source: string) {
  const compiled = await compile(source, {
    outputFormat: 'function-body',
    jsxImportSource: 'react',
  });

  // Turn the compiled function body into a real component
  const mdxModule = new Function(
    'React',
    'jsx',
    'jsxs',
    String(compiled)
  )(
    runtime,
    runtime.jsx,
    runtime.jsxs
  );

  return mdxModule.default;
}
