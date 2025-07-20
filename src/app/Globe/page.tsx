// app/page.tsx
'use client';

import { useState } from 'react';
import EarthCanvas from '@/component/EarthCanvas';
import DetailView from '@/component/detailView';
import { Location } from '@/types/location'; // Make sure this path is correct

export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  const handleMarkerClick = (location: Location) => {
    setSelectedLocation(location);
  };

  const handleCloseDetail = () => {
    setSelectedLocation(null);
  };

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black flex">
      {/* Earth Canvas Container */}
      <div
        className={`
          relative h-full transition-all duration-1000 ease-in-out
          ${selectedLocation ? 'w-1/3' : 'w-full'}
        `}
      >
        <EarthCanvas onMarkerClick={handleMarkerClick} />
      </div>

      {/* Detail View Container */}
      <div
        className={`
          h-full transition-all duration-1000 ease-in-out
          ${selectedLocation ? 'w-2/3' : 'w-0'}
        `}
      >
        {/* We only render the DetailView when a location is selected to ensure smooth animation */}
        {selectedLocation && (
          <DetailView location={selectedLocation} onClose={handleCloseDetail} />
        )}
      </div>
    </main>
  );
}
