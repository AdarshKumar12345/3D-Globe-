import React from 'react';

// Assuming the Location type is imported from a central types file or the EarthCanvas component
export type Location = {
  name: string;
  lat: number;
  lon: number;
  servername: string;
  organizationName: string;
};

type DetailViewProps = {
    location: Location;
    onClose: () => void;
};

function DetailView({ location, onClose }: DetailViewProps) {
  return (
    <div className="h-full bg-gray-900/70 backdrop-blur-md text-white p-8 relative flex flex-col animate-fade-in">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-white text-3xl font-bold transition-colors"
        aria-label="Close detail view"
      >
        &times;
      </button>

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-4xl lg:text-5xl font-bold text-cyan-300 mb-2">{location.name}</h2>
        <div className="text-sm text-gray-400">
          <span>Latitude: {location.lat.toFixed(2)}</span>
          <span className="mx-2">|</span>
          <span>Longitude: {location.lon.toFixed(2)}</span>
        </div>
      </div>

      {/* Divider */}
      <hr className="my-4 border-gray-700" />

      {/* Details Section */}
      <div className="flex-grow overflow-y-auto space-y-6">
        <div>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Organization</p>
          <p className="text-xl text-gray-100">{location.organizationName}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Server ID</p>
          <p className="text-xl font-mono text-cyan-400 bg-gray-800/50 px-2 py-1 rounded-md inline-block">
            {location.servername}
          </p>
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Status</p>
            <div className="flex items-center space-x-2 mt-1">
                <span className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></span>
                <p className="text-xl text-green-400">Online</p>
            </div>
        </div>
      </div>
      
      {/* Footer Action */}
       <div className="mt-6 flex-shrink-0">
         <button 
           className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg transition-colors"
         >
           View Server Logs
         </button>
       </div>
    </div>
  )
}

export default DetailView;