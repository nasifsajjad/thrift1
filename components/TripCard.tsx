
import React from 'react';
import { TripProposal } from '../types';
import { Icons } from '../constants';

interface TripCardProps {
  trip: TripProposal;
  onClick: (trip: TripProposal) => void;
  isCheapest?: boolean;
}

const TripCard: React.FC<TripCardProps> = ({ trip, onClick, isCheapest }) => {
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div 
      onClick={() => onClick(trip)}
      className="group relative bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-3xl transition-all duration-700 cursor-pointer border border-gray-100 hover:border-sky-100"
    >
      {isCheapest && (
        <div className="absolute top-6 left-6 z-10 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full shadow-xl">
          Best Value Pair
        </div>
      )}

      <div className="relative h-72 overflow-hidden">
        <img 
          src={trip.imageUrl} 
          alt={trip.destination} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-8 flex flex-col justify-end">
          <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-2">{trip.country}</p>
          <h3 className="text-4xl font-black text-white leading-none">{trip.destination}</h3>
          
          <div className="mt-4 flex items-center space-x-3 bg-white/10 backdrop-blur-md w-fit px-3 py-1.5 rounded-xl border border-white/20">
            <span className="text-sky-300 text-xs"><Icons.Calendar /></span>
            <span className="text-white text-[11px] font-bold">
              {formatDate(trip.flight.departureDate)} — {formatDate(trip.flight.returnDate)}
            </span>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center">
              <span className="mr-2 text-sky-500"><Icons.Flight /></span> Round Trip
            </p>
            <p className="text-xl font-black text-gray-900">{trip.currency}{trip.flight.price}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center">
              <span className="mr-2 text-sky-500"><Icons.Hotel /></span> Entire Stay
            </p>
            <p className="text-xl font-black text-gray-900">{trip.currency}{trip.hotel.totalPrice}</p>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Trip Pairing</p>
            <div className="flex items-baseline space-x-1">
              <span className="text-4xl font-black text-sky-600">{trip.currency}{trip.totalCost}</span>
              <span className="text-xs text-gray-400 font-bold">est.</span>
            </div>
          </div>
          <button className="bg-sky-50 text-sky-600 w-14 h-14 rounded-2xl flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-all duration-500 group-hover:shadow-lg group-hover:shadow-sky-100">
            <Icons.ArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TripCard;
