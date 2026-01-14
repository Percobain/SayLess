import Navbar from './Navbar';
import Footer from './Footer';
import AlertBanner from './AlertBanner';

export default function Layout({ children, showAlert = false }) {
  return (
    <div className="min-h-screen flex flex-col bg-neo-white">
      <Navbar />
      {showAlert && <AlertBanner />}
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
