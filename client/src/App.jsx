import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppShell from './components/AppShell';
import Landing from './pages/Landing';
import Report from './pages/Report';
import Authority from './pages/Authority';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/r/:sessionId" element={<Report />} />
          <Route path="/report/:sessionId" element={<Report />} />
          <Route path="/authority" element={<Authority />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}

export default App;
