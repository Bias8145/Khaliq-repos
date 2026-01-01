import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Repository from './pages/Repository';
import Editor from './pages/Editor';
import PostView from './pages/PostView';
import ScrollToTop from './components/ScrollToTop';
import AIAssistant from './components/AIAssistant';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-primary font-sans flex flex-col transition-colors duration-300">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/repo" element={<Repository />} />
            <Route path="/post/:id" element={<PostView />} />
            <Route path="/editor/:id" element={<Editor />} />
          </Routes>
        </main>
        <Footer />
        <ScrollToTop />
        <AIAssistant />
      </div>
    </Router>
  );
}

export default App;
