
import React from 'react';

export function SiteFooter() {
  return (
    <footer className="py-6 border-t">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-14 md:flex-row">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Air Georgia Home Comfort Systems. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
