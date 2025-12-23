
import React, { useState, useEffect, useRef } from 'react';
import { SearchParams, CitySuggestion } from '../types';
import { Icons } from '../constants';
import { getCitySuggestions } from '../services/geminiService';

interface SearchFormProps {
  onSearch: (params: SearchParams) => void;
  isLoading: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading }) => {
  const [origin, setOrigin] = useState('');
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [windowStart, setWindowStart] = useState('');
  const [windowEnd, setWindowEnd] = useState('');
  const [stayDuration, setStayDuration] = useState(7);
  const [passengers, setPassengers] = useState(1);
  const suggestionRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  const minDateStr = today.toISOString().split('T')[0];
  
  const maxDate = new Date();
  maxDate.setMonth(today.getMonth() + 3);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  useEffect(() => {
    const detectLocation = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        if (data.city && data.country_name) {
          setOrigin(`${data.city}, ${data.country_name}`);
        }
      } catch (e) {
        console.warn("Location auto-detection failed:", e);
      }
    };
    detectLocation();

    const start = new Date();
    start.setDate(today.getDate() + 14); // Default to 2 weeks out
    const end = new Date(start);
    end.setDate(start.getDate() + 21); // 3-week window

    setWindowStart(start.toISOString().split('T')[0]);
    setWindowEnd(end.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (origin.length > 2 && showSuggestions) {
        const res = await getCitySuggestions(origin);
        setSuggestions(res);
      } else {
        setSuggestions([]);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [origin, showSuggestions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !windowStart || !windowEnd) return;

    const start = new Date(windowStart);
    const end = new Date(windowEnd);
    const windowDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    if (windowDays < stayDuration) {
      alert(`Search window (${windowDays} days) must be at least as long as your stay (${stayDuration} days).`);
      return;
    }

    onSearch({ origin, windowStart, windowEnd, stayDuration, passengers });
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card p-10 rounded-[3rem] shadow-2xl max-w-5xl mx-auto -mt-20 relative z-20 border border-white/40 flex flex-col gap-10">
      
      {/* Tier 1: Origin and Availability */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-3 relative" ref={suggestionRef}>
          <label className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2 flex items-center">
            <span className="mr-2 text-sky-500"><Icons.Location /></span> Departure Origin
          </label>
          <input
            type="text"
            placeholder="Loading location..."
            className="w-full bg-gray-50/50 border-2 border-transparent focus:border-sky-500 focus:bg-white rounded-[1.5rem] p-5 transition-all placeholder:text-gray-400 font-semibold text-gray-800"
            value={origin}
            onChange={(e) => { setOrigin(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            required
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white shadow-2xl rounded-2xl mt-3 overflow-hidden z-30 border border-gray-100 ring-4 ring-sky-500/5">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="w-full text-left px-6 py-5 hover:bg-sky-50 transition-colors text-sm font-bold border-b border-gray-50 last:border-none flex items-center justify-between group"
                  onClick={() => { setOrigin(`${s.city}, ${s.country}`); setShowSuggestions(false); }}
                >
                  <span>{s.city}, {s.country}</span>
                  <i className="fa-solid fa-arrow-right opacity-0 group-hover:opacity-100 transition-opacity text-sky-500"></i>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <label className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2 flex items-center">
            <span className="mr-2 text-sky-500"><Icons.Calendar /></span> Availability Window
          </label>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="date"
              min={minDateStr}
              max={maxDateStr}
              className="w-full bg-gray-50/50 border-2 border-transparent focus:border-sky-500 focus:bg-white rounded-[1.5rem] p-5 transition-all text-sm font-bold text-gray-800"
              value={windowStart}
              onChange={(e) => setWindowStart(e.target.value)}
              required
            />
            <input
              type="date"
              min={windowStart || minDateStr}
              max={maxDateStr}
              className="w-full bg-gray-50/50 border-2 border-transparent focus:border-sky-500 focus:bg-white rounded-[1.5rem] p-5 transition-all text-sm font-bold text-gray-800"
              value={windowEnd}
              onChange={(e) => setWindowEnd(e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      {/* Tier 2: Stay and Passengers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <label className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2 flex items-center">
            <span className="mr-2 text-sky-500"><i className="fa-solid fa-moon"></i></span> Duration of stay
          </label>
          <div className="flex items-center bg-gray-50/50 rounded-[1.5rem] p-3 border-2 border-transparent hover:border-gray-100 transition-all">
            <button type="button" onClick={() => setStayDuration(Math.max(1, stayDuration - 1))} className="w-14 h-14 flex items-center justify-center bg-white hover:bg-sky-50 text-sky-600 rounded-2xl shadow-sm transition-all text-xl font-black">
              <i className="fa-solid fa-minus"></i>
            </button>
            <span className="flex-1 text-center font-black text-xl text-gray-800">{stayDuration} Days</span>
            <button type="button" onClick={() => setStayDuration(stayDuration + 1)} className="w-14 h-14 flex items-center justify-center bg-white hover:bg-sky-50 text-sky-600 rounded-2xl shadow-sm transition-all text-xl font-black">
              <i className="fa-solid fa-plus"></i>
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2 flex items-center">
            <span className="mr-2 text-sky-500"><Icons.Users /></span> Total Passengers
          </label>
          <div className="flex items-center bg-gray-50/50 rounded-[1.5rem] p-3 border-2 border-transparent hover:border-gray-100 transition-all">
            <button type="button" onClick={() => setPassengers(Math.max(1, passengers - 1))} className="w-14 h-14 flex items-center justify-center bg-white hover:bg-sky-50 text-sky-600 rounded-2xl shadow-sm transition-all text-xl font-black">
              <i className="fa-solid fa-minus"></i>
            </button>
            <span className="flex-1 text-center font-black text-xl text-gray-800">{passengers} {passengers === 1 ? 'Person' : 'People'}</span>
            <button type="button" onClick={() => setPassengers(passengers + 1)} className="w-14 h-14 flex items-center justify-center bg-white hover:bg-sky-50 text-sky-600 rounded-2xl shadow-sm transition-all text-xl font-black">
              <i className="fa-solid fa-plus"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Find Pairing Button */}
      <div className="pt-6 border-t border-gray-100 flex justify-center">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full md:w-fit px-20 py-6 bg-sky-600 hover:bg-sky-700 text-white font-black rounded-[2rem] transition-all shadow-2xl shadow-sky-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-4 uppercase tracking-[0.3em] text-sm group"
        >
          {isLoading ? (
            <><i className="fa-solid fa-spinner fa-spin"></i><span>Scanning The World...</span></>
          ) : (
            <><span>Find Absolute Cheapest Pairing</span><i className="fa-solid fa-arrow-right group-hover:translate-x-2 transition-transform"></i></>
          )}
        </button>
      </div>
    </form>
  );
};

export default SearchForm;
