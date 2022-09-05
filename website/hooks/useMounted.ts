import { useBoolean } from '@chakra-ui/react';
import { useEffect } from 'react';

export const useMounted = () => {
  const [mounted, mountedOp] = useBoolean(false);

  useEffect(() => {
    mountedOp.on();
  }, []);

  return mounted;
};
