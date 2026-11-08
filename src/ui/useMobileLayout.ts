import { useEffect, useState } from 'react';

const query = '(pointer: coarse), (max-width: 860px)';

const read = () =>
  typeof window !== 'undefined' && window.matchMedia(query).matches;

/** True for phones/tablets and narrow desktop windows. */
export const useMobileLayout = () => {
  const [mobile, setMobile] = useState(read);
  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = () => setMobile(media.matches);
    media.addEventListener('change', onChange);
    window.addEventListener('resize', onChange);
    return () => {
      media.removeEventListener('change', onChange);
      window.removeEventListener('resize', onChange);
    };
  }, []);
  return mobile;
};
