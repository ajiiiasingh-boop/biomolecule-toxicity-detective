import { useEffect } from 'react';
import { HashRouter, Route, Routes, useLocation } from 'react-router-dom';

import Chrome from './components/Chrome.jsx';
import Field from './components/Field.jsx';
import Footer from './components/Footer.jsx';
import { SessionProvider } from './lib/session.jsx';

import Home from './pages/Home.jsx';
import CaseFiles from './pages/CaseFiles.jsx';
import Investigation from './pages/Investigation.jsx';
import Biomolecules from './pages/Biomolecules.jsx';
import CellLab from './pages/CellLab.jsx';
import MechanismMap from './pages/MechanismMap.jsx';
import ToxinLibrary from './pages/ToxinLibrary.jsx';
import Quiz from './pages/Quiz.jsx';
import Debrief from './pages/Debrief.jsx';
import About from './pages/About.jsx';
import NotFound from './pages/NotFound.jsx';

/** Every navigation starts at the top of the new page, except in-page anchors. */
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    /* HashRouter, not BrowserRouter: the built site has to work when opened
       straight from a file or served from any static host, neither of which
       can rewrite deep paths back to index.html. */
    <HashRouter>
      <SessionProvider>
        <Field />
        <div className="app">
          <a href="#main" className="skip">
            Skip to content
          </a>
          <Chrome />
          <ScrollToTop />
          <main id="main">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/cases" element={<CaseFiles />} />
              <Route path="/cases/:caseId" element={<Investigation />} />
              <Route path="/biomolecules" element={<Biomolecules />} />
              <Route path="/cell" element={<CellLab />} />
              <Route path="/mechanism-map" element={<MechanismMap />} />
              <Route path="/toxins" element={<ToxinLibrary />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/debrief" element={<Debrief />} />
              <Route path="/about" element={<About />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </SessionProvider>
    </HashRouter>
  );
}
