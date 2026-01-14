import Navbar from './Navbar';
import Footer from './Footer';
import AlertBanner from './AlertBanner';

export default function Layout({ children, showAlert = false }) {
  return (
    <div className="min-h-screen flex flex-col bg-neo-cream">
      <Navbar />
      <main className={`flex-1 ${showAlert ? 'pb-12' : ''}`}>
        {children}
      </main>
      <Footer />
      
      {/* Fixed Alert Banner at Bottom */}
      {showAlert && (
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <AlertBanner />
        </div>
      )}
    </div>
  );
}
