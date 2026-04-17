import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { useWindowTitle } from '../hooks';

export default function NotFound() {
  useWindowTitle('Page Not Found');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6">
      <div className="text-center max-w-md animate-fade-up">
        {/* 404 graphic */}
        <div className="relative mb-8">
          <p className="text-[120px] font-display font-black text-text-primary leading-none select-none"
            style={{ opacity: 0.04 }}>
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
              <Search size={32} className="text-accent" />
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-display font-bold text-text-primary mb-2">Page not found</h1>
        <p className="text-text-secondary text-sm mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="btn-secondary text-sm flex items-center gap-2"
          >
            <ArrowLeft size={15} /> Go back
          </button>
          <Link to="/dashboard" className="btn-primary text-sm flex items-center gap-2">
            <Home size={15} /> Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
