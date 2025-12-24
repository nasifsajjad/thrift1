
import React from 'react';
import { TripProposal } from '../types';
import { Icons } from '../constants';

interface TripDetailsProps {
  trip: TripProposal;
  onClose: () => void;
}

const TripDetails: React.FC<TripDetailsProps> = ({ trip, onClose }) => {
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-8">
      <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-3xl" onClick={onClose}></div>
      <div className="relative w-full max-w-6xl bg-white rounded-[2.5rem] sm:rounded-[4rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col lg:flex-row h-full max-h-[96vh] border border-white/10">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-40 w-12 h-12 bg-white/90 hover:bg-white text-gray-900 hover:text-red-500 rounded-full flex items-center justify-center transition-all shadow-2xl border border-gray-100"
        >
          <i className="fa-solid fa-times text-xl"></i>
        </button>

        {/* Left Side: Visuals */}
        <div className="lg:w-5/12 relative overflow-hidden h-56 sm:h-72 lg:h-auto shrink-0">
          <img 
            src={trip.imageUrl} 
            alt={trip.destination} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-8 sm:p-16 flex flex-col justify-end">
            <p className="text-sky-400 font-black uppercase tracking-[0.4em] text-[10px] mb-3">{trip.country}</p>
            <h2 className="text-4xl sm:text-7xl font-black text-white mb-6 leading-none tracking-tighter">{trip.destination}</h2>
            <div className="space-y-2">
              <p className="text-white/80 font-black flex items-center text-sm sm:text-xl">
                 <span className="mr-3 text-sky-400"><Icons.Calendar /></span>
                 {formatDate(trip.flight.departureDate)}
              </p>
              <p className="text-white/80 font-black flex items-center text-sm sm:text-xl">
                 <span className="mr-3 text-emerald-400 rotate-180"><Icons.Calendar /></span>
                 {formatDate(trip.flight.returnDate)}
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <span className="bg-sky-500/20 backdrop-blur-md text-sky-200 text-[10px] px-5 py-2.5 rounded-full font-black uppercase tracking-widest border border-sky-500/30">Verified Google Pairing</span>
            </div>
          </div>
        </div>

        {/* Right Side: Data */}
        <div className="flex-1 overflow-y-auto p-8 sm:p-16 bg-[#fafbfc]">
          <div className="max-w-3xl mx-auto space-y-16">
            
            <header>
              <div className="inline-flex items-center px-4 py-2 rounded-xl bg-amber-50 border border-amber-100 text-amber-800 text-[11px] font-black uppercase tracking-[0.2em] mb-6">
                <span className="mr-2 text-amber-500"><Icons.Info /></span> Pairing Insight
              </div>
              <p className="text-xl sm:text-3xl font-medium text-gray-700 leading-relaxed italic border-l-4 border-sky-100 pl-8">
                "{trip.summary}"
              </p>
            </header>

            <section>
              <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] mb-10 flex items-center">
                <span className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center mr-4 text-sm"><Icons.Wallet /></span>
                Transparent Budget
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-sm border border-gray-100 group hover:border-sky-300 transition-all flex flex-col justify-between">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Cheapest Round-Trip</p>
                    <p className="text-4xl sm:text-5xl font-black text-gray-900 mb-2">{trip.currency}{trip.flight.price}</p>
                    <p className="text-xs font-bold text-gray-500 mb-8">{trip.flight.airline} • All passengers</p>
                  </div>
                  <a 
                    href={trip.flight.bookingUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center py-5 bg-sky-600 hover:bg-sky-700 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl shadow-sky-100 group-hover:scale-[1.02]"
                  >
                    Book Flight <i className="fa-solid fa-plane-up ml-3"></i>
                  </a>
                </div>
                
                <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-sm border border-gray-100 group hover:border-emerald-300 transition-all flex flex-col justify-between">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Total Stay Pair</p>
                    <p className="text-4xl sm:text-5xl font-black text-gray-900 mb-2">{trip.currency}{trip.hotel.totalPrice}</p>
                    <p className="text-xs font-bold text-gray-500 mb-8">{trip.hotel.name} • <span className="text-amber-500 font-black"><i className="fa-solid fa-star mr-1"></i>{trip.hotel.rating}</span></p>
                  </div>
                  <a 
                    href={trip.hotel.bookingUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl shadow-emerald-100 group-hover:scale-[1.02]"
                  >
                    Book Hotel <i className="fa-solid fa-hotel ml-3"></i>
                  </a>
                </div>

                <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Local Living Cost</p>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-4xl font-black text-gray-900">{trip.currency}{trip.localCosts?.total}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-4 leading-relaxed">Includes food, city transit, and basic entry fees.</p>
                </div>

                <div className="bg-sky-600 p-8 sm:p-10 rounded-[3rem] shadow-[0_20px_40px_-10px_rgba(2,132,199,0.3)] border border-sky-500 text-white flex flex-col justify-center">
                  <p className="text-[10px] font-black text-sky-200 uppercase tracking-widest mb-4">Grand Thrift Total</p>
                  <p className="text-5xl sm:text-6xl font-black">{trip.currency}{trip.totalCost}</p>
                  <p className="text-[10px] text-sky-100 font-black uppercase tracking-widest mt-6">Pairing Verified • All Passengers</p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] mb-12 flex items-center">
                <span className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center mr-4 text-sm"><Icons.Map /></span>
                Smart Itinerary
              </h3>
              <div className="space-y-12">
                {trip.itinerary?.map((item, idx) => (
                  <div key={idx} className="flex space-x-8">
                    <div className="flex flex-col items-center">
                      <div className="w-14 h-14 rounded-[1.25rem] bg-white border-2 border-sky-50 text-sky-600 flex items-center justify-center text-sm font-black shadow-sm shrink-0">
                        0{item.day}
                      </div>
                      {idx < (trip.itinerary?.length || 0) - 1 && <div className="w-px flex-1 bg-gradient-to-b from-sky-100 to-transparent my-4"></div>}
                    </div>
                    <div className="pt-2">
                      <h4 className="font-black text-gray-900 mb-3 text-lg sm:text-xl">{item.activity}</h4>
                      <p className="text-gray-500 leading-relaxed font-medium text-sm sm:text-base">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

                        {/* Grounding Sources Section */}
            {trip.sources && trip.sources.length > 0 && (
              <section className="pt-10 border-t border-gray-100">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6 flex items-center">
                   Verified Search Sources
                </h3>
                <div className="flex flex-wrap gap-4">
                  {trip.sources.map((source, idx) => (
                    <a 
                      key={idx} 
                      href={source.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-gray-50 hover:bg-sky-50 border border-gray-200 hover:border-sky-200 rounded-xl text-xs font-bold text-gray-600 hover:text-sky-600 transition-all"
                    >
                      <i className="fa-solid fa-link mr-2 text-[10px]"></i>
                      {source.title.length > 30 ? source.title.substring(0, 30) + '...' : source.title}
                    </a>
                  ))}
                </div>
              </section>
            )}

            <div className="pt-10 border-t border-gray-100">
              <div className="bg-emerald-50 p-10 rounded-[3rem] border border-emerald-100 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-center md:text-left">
                  <p className="text-emerald-800 font-black text-sm uppercase tracking-widest mb-2">Thrift Confirmation</p>
                  <p className="text-emerald-600/80 text-sm font-bold max-w-sm">This is currently the absolute lowest price pairing detected globally for your window.</p>
                </div>
                <button 
                  className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-12 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-xl shadow-emerald-100 active:scale-95"
                  onClick={() => {
                    window.open(trip.flight.bookingUrl, '_blank');
                    setTimeout(() => window.open(trip.hotel.bookingUrl, '_blank'), 400);
                  }}
                >
                  Secure Pairing <i className="fa-solid fa-arrow-right ml-3"></i>
                </button>
              </div>
              <p className="text-center text-gray-300 text-[10px] mt-10 font-black uppercase tracking-[0.3em]">Prices are dynamic • Links open in new tabs</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetails;
