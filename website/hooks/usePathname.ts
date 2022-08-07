import { useRouter } from 'next/router';
import { useMemo } from 'react';

export const usePathname = () => {
  const { asPath, basePath } = useRouter();
  const pathname = useMemo(() => {
    return new URL(`http://localhost:3000${basePath}${asPath}`).pathname;
  }, [asPath, basePath]);
  return pathname;
};
