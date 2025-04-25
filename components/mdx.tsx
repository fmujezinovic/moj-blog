'use client';

import * as React from 'react';
import { MDXProvider } from '@mdx-js/react';
import LottiePlayer from './Lottie';

const components = {
  Lottie: LottiePlayer,
  img: (props) => <img {...props} className="rounded-md shadow-md" />,
  h2: (props) => <h2 {...props} className="text-2xl text-blue-600" />,
};


export function MDXWrapper({ children }: { children: React.ReactNode }) {
  return <MDXProvider components={components}>{children}</MDXProvider>;
}

