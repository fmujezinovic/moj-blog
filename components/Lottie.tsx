'use client';

import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';

interface LottiePlayerProps {
  src: string;
  loop?: boolean;
  autoplay?: boolean;
}

export default function LottiePlayer({ src, loop = true, autoplay = true }: LottiePlayerProps) {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    import(`../public/${src}`).then((data) => {
      setAnimationData(data.default || data);
    });
  }, [src]);

  if (!animationData) return <p>Loading animation...</p>;

  return (
    <div className="max-w-md mx-auto my-6">
      <Lottie animationData={animationData} loop={loop} autoplay={autoplay} />
    </div>
  );
}
