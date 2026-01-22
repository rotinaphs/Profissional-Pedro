import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Portfolio from './pages/Portfolio';
import Album from './pages/Album';
import Writings from './pages/Writings';
import WritingDetail from './pages/WritingDetail';
import About from './pages/About';
import Admin from './pages/Admin';
import { DataProvider } from './context/DataContext';

const App: React.FC = () => {
  return (
    <DataProvider>
      <Router>
        <div className="flex flex-col min-h-screen font-sans text-stone-900 antialiased selection:bg-stone-200">
          <Routes>
            {/* Admin Route outside of standard layout if desired, but here sharing it */}
            <Route path="/admin" element={<Admin />} />
            
            {/* Public Routes */}
            <Route path="*" element={
              <>
                <Navbar />
                <main className="flex-grow">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/portfolio" element={<Portfolio />} />
                    <Route path="/portfolio/:id" element={<Album />} />
                    <Route path="/writings" element={<Writings />} />
                    <Route path="/writings/:id" element={<WritingDetail />} />
                    <Route path="/about" element={<About />} />
                  </Routes>
                </main>
                <Footer />
              </>
            } />
          </Routes>
        </div>
      </Router>
    </DataProvider>
  );
};

export default App;