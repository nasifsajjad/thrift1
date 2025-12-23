
import React, { useState, useRef } from 'react';
import SearchForm from './components/SearchForm';
import TripCard from './components/TripCard';
import TripDetails from './components/TripDetails';
import { SearchParams, TripProposal } from './types';
import { generateTrips } from './services/geminiService';
import { Icons } from './constants';

type Page = 'home' | 'privacy' | 'terms' | 'cookies';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [trips, setTrips] = useState<TripProposal[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<TripProposal | null>(null);
  const [searchDone, setSearchDone] = useState(false);
  const [lastParams, setLastParams] = useState<SearchParams | null>(null);
  const [activePage, setActivePage] = useState<Page>('home');
  
  const resultsRef = useRef<HTMLDivElement>(null);
  const currentYear = new Date().getFullYear();

  const handleSearch = async (params: SearchParams) => {
    setIsLoading(true);
    setSearchDone(true);
    setLastParams(params);
    setActivePage('home');

    // Smooth scroll to results area
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);

    try {
      const results = await generateTrips(params);
      setTrips(results);
    } catch (error) {
      console.error("Search failed:", error);
      alert("Search failed. This is usually due to temporary volatility in live travel pricing. Please try adjusting your date window slightly.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderPageContent = () => {
    const backBtn = (
      <button 
        onClick={() => { setActivePage('home'); window.scrollTo(0,0); }} 
        className="mt-16 text-sky-600 font-black uppercase tracking-widest text-xs hover:text-sky-700 flex items-center group transition-all"
      >
        <i className="fa-solid fa-arrow-left mr-3 group-hover:-translate-x-2 transition-transform"></i> Return to Search
      </button>
    );

    switch (activePage) {
      case 'privacy':
        return (
          <div className="max-w-4xl mx-auto py-32 px-10 animate-in fade-in slide-in-from-bottom-8">
            <h1 className="text-6xl font-black mb-12 tracking-tighter">Privacy <span className="text-sky-500">Policy</span></h1>
            <div className="prose prose-xl prose-sky text-gray-600 space-y-10 max-w-none">
              <p className="font-bold text-gray-900 underline">Effective Date: {new Date().toLocaleDateString()}</p>
              <section className="space-y-4">
                <h2 className="text-2xl font-black text-gray-900">1. Data Minimalization</h2>
                <p>Thrift Trip is designed as a search-only platform. We use IP-based geolocation via third-party APIs (like ipapi.co) to detect your city without browser prompts. This data is processed in-memory and is not stored on our servers.</p>
              </section>
              <section className="space-y-4">
                <h2 className="text-2xl font-black text-gray-900">2. Third-Party Interactions</h2>
                <p>Our pairing engine uses Google Search grounding. When you click a "Book" link, you are redirected to official Google Flights or Google Hotels deep-search results. At that point, your interaction is governed by Google's Privacy Policy.</p>
              </section>
            </div>
            {backBtn}
          </div>
        );
      case 'terms':
        return (
          <div className="max-w-4xl mx-auto py-32 px-10 animate-in fade-in slide-in-from-bottom-8">
            <h1 className="text-6xl font-black mb-12 tracking-tighter">Terms of <span className="text-sky-500">Service</span></h1>
            <div className="prose prose-xl prose-sky text-gray-600 space-y-10 max-w-none">
              <section className="space-y-4">
                <h2 className="text-2xl font-black text-gray-900">1. Nature of Service</h2>
                <p>Thrift Trip is an AI-driven search aggregator. We do not sell tickets, manage hotel inventory, or provide customer support for bookings. We simply help you find the pairing.</p>
              </section>
              <section className="space-y-4">
                <h2 className="text-2xl font-black text-gray-900">2. Price Volatility</h2>
                <p>Travel pricing changes by the second. The prices shown on Thrift Trip are real-time estimates. We do not guarantee that the price shown here will match the final price on the booking platform, though our engine strives for maximum accuracy.</p>
              </section>
            </div>
            {backBtn}
          </div>
        );
      case 'cookies':
        return (
          <div className="max-w-4xl mx-auto py-32 px-10 animate-in fade-in slide-in-from-bottom-8">
            <h1 className="text-6xl font-black mb-12 tracking-tighter">Cookie <span className="text-sky-500">Notice</span></h1>
            <div className="prose prose-xl prose-sky text-gray-600 space-y-10 max-w-none">
              <p>We use zero tracking or advertising cookies. The only "cookies" utilized are functional, local-state markers in your browser memory that allow the app to remember your search parameters during a single session.</p>
              <p>We believe in a cleaner, faster web experience.</p>
            </div>
            {backBtn}
          </div>
        );
      default:
        return (
          <>
            <header className="relative animated-gradient pt-32 pb-60 px-6 text-center text-white overflow-hidden">
              <div className="max-w-5xl mx-auto relative z-10">
                <div className="inline-flex items-center space-x-3 bg-white/10 backdrop-blur-xl px-6 py-2.5 rounded-full mb-10 border border-white/20">
                  <span className="text-yellow-400 text-sm"><Icons.Star /></span>
                  <span className="text-[11px] font-black uppercase tracking-[0.3em]">Global Savings Intelligence 4.0</span>
                </div>
                <h1 className="text-6xl md:text-[9rem] font-black mb-8 tracking-tighter leading-none cursor-pointer select-none" onClick={() => window.location.reload()}>
                  Thrift <span className="text-sky-300">Trip.</span>
                </h1>
                <p className="text-xl md:text-3xl text-white/90 max-w-3xl mx-auto font-medium leading-relaxed tracking-tight">
                  Finding the world's absolute cheapest flight & hotel pairings in seconds.
                </p>
              </div>
            </header>

            <div className="max-w-7xl mx-auto px-6">
              <SearchForm onSearch={handleSearch} isLoading={isLoading} />
              
              <div ref={resultsRef} className="scroll-mt-32">
                <main className="mt-24">
                  {isLoading && (
                    <div className="text-center py-40 space-y-10 max-w-2xl mx-auto">
                      <div className="flex justify-center relative scale-150">
                        <div className="w-32 h-32 border-8 border-sky-100/30 border-t-sky-500 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center text-sky-500 text-3xl">
                          <Icons.Flight />
                        </div>
                      </div>
                      <div className="space-y-6 pt-10">
                        <h3 className="text-4xl font-black text-gray-900 tracking-tighter">Scanning 10,000+ Combinations</h3>
                        <div className="space-y-3">
                          <p className="text-gray-400 font-black text-[11px] uppercase tracking-[0.4em] animate-pulse">Running Deep-Search on Google Flights from {lastParams?.origin}</p>
                          <p className="text-gray-400 font-black text-[11px] uppercase tracking-[0.4em] animate-pulse delay-500">Pairing with verified hotel inventory for {lastParams?.stayDuration} nights</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {!searchDone && !isLoading && (
                    <div className="py-32">
                      <div className="text-center mb-24">
                        <h2 className="text-5xl font-black text-gray-900 mb-6 tracking-tighter">Pairing Intelligence</h2>
                        <p className="text-gray-500 max-w-xl mx-auto text-xl font-medium leading-relaxed">Unlike traditional search, we don't start with a city. We start with your budget and window, then scan the entire planet for the lowest pairing.</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                        {[
                          { title: "The Global Trawl", desc: "Our engine scans every budget route departing from your origin in your 3-month window.", icon: <Icons.Map />, color: "bg-blue-50 text-blue-500" },
                          { title: "Precision Match", desc: "Cheapest routes are instantly paired with the highest-rated budget hotel inventory.", icon: <Icons.Hotel />, color: "bg-purple-50 text-purple-500" },
                          { title: "Local Conversion", desc: "All prices are unified into your local currency, including food and transit estimates.", icon: <Icons.Wallet />, color: "bg-emerald-50 text-emerald-500" }
                        ].map((feature, i) => (
                          <div key={i} className="bg-white p-16 rounded-[4rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all group">
                            <div className={`${feature.color} w-24 h-24 rounded-[2rem] flex items-center justify-center mb-12 text-4xl group-hover:scale-110 transition-transform`}>{feature.icon}</div>
                            <h4 className="text-3xl font-black text-gray-900 mb-6 tracking-tight">{feature.title}</h4>
                            <p className="text-gray-500 leading-relaxed font-bold text-base">{feature.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchDone && !isLoading && trips.length > 0 && lastParams && (
                    <div className="space-y-20 animate-in fade-in slide-in-from-bottom-12 duration-1000 pb-32">
                      <div className="bg-white p-12 rounded-[4rem] border border-gray-100 shadow-2xl flex flex-wrap items-center justify-between gap-10">
                        <div className="space-y-2">
                          <h2 className="text-5xl font-black text-gray-900 tracking-tighter leading-none">Best Pairs Found</h2>
                          <p className="text-gray-400 font-black text-xs uppercase tracking-[0.4em] flex items-center">
                            <span className="text-sky-500 mr-3"><Icons.Location /></span> {lastParams.origin} • {lastParams.stayDuration} Days Stay
                          </p>
                        </div>
                        <div className="bg-emerald-50 text-emerald-700 px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] border border-emerald-100 flex items-center">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping mr-3"></span>
                          {trips.length} Top Value Pairings
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
                        {trips.map((trip, idx) => (
                          <TripCard key={trip.id} trip={trip} onClick={setSelectedTrip} isCheapest={idx === 0} />
                        ))}
                      </div>
                    </div>
                  )}

                  {searchDone && !isLoading && trips.length === 0 && (
                    <div className="text-center py-48 bg-white rounded-[5rem] border-4 border-dashed border-gray-100">
                      <div className="text-gray-200 text-[10rem] mb-12 leading-none"><Icons.Info /></div>
                      <h3 className="text-5xl font-black text-gray-800 tracking-tighter">No Thrift Pairings Detected</h3>
                      <p className="text-gray-500 mt-6 max-w-sm mx-auto font-bold text-xl leading-relaxed">Try widening your date window or choosing a more common origin city to unlock global pairings.</p>
                    </div>
                  )}
                </main>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen pb-24 bg-[#fbfcfd] selection:bg-sky-500 selection:text-white">
      {renderPageContent()}

      {selectedTrip && (
        <TripDetails trip={selectedTrip} onClose={() => setSelectedTrip(null)} />
      )}

      <footer className="mt-40 pt-32 border-t border-gray-100 px-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-center mb-24">
            <div className="text-center md:text-left space-y-4">
              <h4 className="text-5xl font-black text-gray-900 tracking-tighter">Thrift <span className="text-sky-600">Trip.</span></h4>
              <p className="text-[11px] text-gray-400 font-black uppercase tracking-[0.5em]">Global Intelligence Search</p>
            </div>
            <div className="flex flex-wrap justify-center md:justify-end gap-x-16 gap-y-6 text-[12px] font-black uppercase tracking-[0.2em] text-gray-400">
              <button onClick={() => { setActivePage('privacy'); window.scrollTo(0,0); }} className="hover:text-sky-600 transition-colors">Privacy</button>
              <button onClick={() => { setActivePage('terms'); window.scrollTo(0,0); }} className="hover:text-sky-600 transition-colors">Terms</button>
              <button onClick={() => { setActivePage('cookies'); window.scrollTo(0,0); }} className="hover:text-sky-600 transition-colors">Cookies</button>
            </div>
          </div>
          <div className="text-center pt-12 border-t border-gray-50 text-[11px] text-gray-400 font-black uppercase tracking-[0.4em]">
            © {currentYear} Thrift Trip Engine. Optimized for Global Budget Pairing.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
