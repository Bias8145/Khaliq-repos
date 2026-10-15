import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import { supabase } from './lib/supabase';
import { ToastProvider } from './components/ui/Toast';
import { NetworkStatus } from './components/ui/NetworkStatus';
import { SkipLink } from './components/ui/SkipLink';
import { EnhancedErrorBoundary } from './components/EnhancedErrorBoundary';
import { FullPageLoader } from './components/ui/LoadingSpinner';

const Login = lazy(() => import('./pages/Login'));
const Repository = lazy(() => import('./pages/Repository'));
const Editor = lazy(() => import('./pages/Editor'));
const PostView = lazy(() => import('./pages/PostView'));

function App() {
  useEffect(() => {
    const recordVisit = async () => {
        if (!sessionStorage.getItem('khaliq_visited')) {
            try {
                await supabase.rpc('increment_site_visit');
                sessionStorage.setItem('khaliq_visited', 'true');
            } catch (e) {
                console.error("Analytics Error", e);
            }
        }
    };
    recordVisit();
  }, []);

  return (
    <ToastProvider>
      <Router>
        <EnhancedErrorBoundary>
          <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-primary font-sans flex flex-col transition-colors duration-300">
            <SkipLink />
            <NetworkStatus />
            <Navbar />
            <main id="main-content" className="flex-grow" role="main">
              <Suspense fallback={<FullPageLoader text="Loading page..." />}>
                <Routes>
                  <Route path="/" element={<Repository />} />
                  <Route path="/repo" element={<Navigate to="/" replace />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/post/:id" element={<PostView />} />
                  <Route path="/editor/:id" element={<Editor />} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
            <ScrollToTop />
          </div>
        </EnhancedErrorBoundary>
      </Router>
    </ToastProvider>
  );
}

export default App;
