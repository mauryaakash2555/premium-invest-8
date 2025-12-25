import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import Footer from './Footer';
import WhatsAppFloat from './WhatsAppFloat';

const Layout = () => {
  return (
    <>
      <Navigation />
      <main>
        <Outlet />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
};

export default Layout;