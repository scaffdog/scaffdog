import { Footer } from '../components/Footer';
import { Header } from '../components/Header';

export type Props = React.PropsWithChildren<{}>;

export const Layout: React.FC<Props> = ({ children }) => {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
};
