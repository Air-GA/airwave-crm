
import React from 'react';
import { Link } from 'react-router-dom';

export function SiteHeader() {
  return (
    <header className="bg-background border-b">
      <div className="container flex h-14 items-center">
        <Link to="/" className="flex items-center space-x-2 font-bold">
          <img 
            src="/lovable-uploads/f169bc97-451d-4387-9c63-d2955fe90926.png" 
            alt="Logo" 
            className="h-8 w-auto" 
          />
          <span>Air Georgia Home Comfort Systems</span>
        </Link>
      </div>
    </header>
  );
}
