
// Type definitions for Google Maps
/// <reference types="google.maps" />

declare global {
  interface Window {
    initMap: () => void;
    google: typeof google;
  }
}

export {};
