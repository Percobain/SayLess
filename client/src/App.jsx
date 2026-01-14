import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Report from './pages/Report';
import Authority from './pages/Authority';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/r/:sessionId" element={<Report />} />
        <Route path="/report/:sessionId" element={<Report />} />
        <Route path="/authority" element={<Authority />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
