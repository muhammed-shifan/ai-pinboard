import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { MasonryGrid } from './components/MasonryGrid';
import { PinDetailModal } from './components/PinDetailModal';
import { GeneratePinForm } from './components/GeneratePinForm';
import { ProfilePage } from './components/ProfilePage';
import { usePins } from './hooks/usePins';
import type { Pin, GenerationOptions, UploadedPinData } from './types';
import { PlusIcon } from './components/icons/PlusIcon';
import { LoginScreen } from './components/LoginScreen';

const App: React.FC = () => {
  const {
    pins,
    savedPins,
    createdPins,
    isLoading,
    isGenerating,
    generatePin,
    uploadPin,
    loadMorePins,
    toggleSavePin,
  } = usePins();

  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const [pinToRemix, setPinToRemix] = useState<Pin | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<'home' | 'profile'>('home');
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('isAuthenticated') === 'true');
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const handleLogin = () => {
    localStorage.setItem('isAuthenticated', 'true');
    setIsAuthenticated(true);
    window.location.reload(); // Reload to trigger initial pin generation
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
    setView('home');
  };

  const filteredPins = useMemo(() => {
    if (view !== 'home') return [];
    const pinsToDisplay = pins;
    if (!searchTerm) {
      return pinsToDisplay;
    }
    return pinsToDisplay.filter(pin =>
      pin.prompt.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [pins, searchTerm, view]);

  useEffect(() => {
    if (view !== 'home' || !isAuthenticated) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && !isLoading && !isGenerating) {
          loadMorePins();
        }
      },
      { threshold: 1.0 }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [isLoading, isGenerating, loadMorePins, view, isAuthenticated]);


  const handlePinClick = (pin: Pin) => {
    setSelectedPin(pin);
  };

  const handleCloseModal = () => {
    setSelectedPin(null);
  };

  const handleGenerate = async (options: GenerationOptions) => {
    await generatePin(options);
    setIsGeneratorOpen(false);
    setPinToRemix(null);
    setView('profile');
  };
  
  const handleUpload = async (data: UploadedPinData) => {
    await uploadPin(data);
    setIsGeneratorOpen(false);
    setView('profile');
  };

  const handleRemixClick = (pin: Pin) => {
    setSelectedPin(null);
    setPinToRemix(pin);
    setIsGeneratorOpen(true);
  };

  const savedPinIds = useMemo(() => new Set(savedPins.map(p => p.id)), [savedPins]);

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="bg-gray-50 min-h-screen text-gray-800">
      <Header
        searchTerm={searchTerm}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
        onNavigate={(newView) => {
            if (newView !== 'home') setSearchTerm('');
            setView(newView);
        }}
        currentView={view}
        onLogout={handleLogout}
      />
      <main className="pt-24 px-2 md:px-4 lg:px-6">
        {view === 'home' ? (
          <>
            <MasonryGrid
              pins={filteredPins}
              savedPinIds={savedPinIds}
              onPinClick={handlePinClick}
              onSaveClick={toggleSavePin}
            />
            <div ref={loaderRef} className="h-10" />
            {(isLoading || isGenerating) && (
                <div className="flex justify-center items-center py-10">
                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
                </div>
            )}
          </>
        ) : (
          <ProfilePage
            createdPins={createdPins}
            savedPins={savedPins}
            savedPinIds={savedPinIds}
            onPinClick={handlePinClick}
            onSaveClick={toggleSavePin}
           />
        )}
         {view === 'home' && pins.length === 0 && !isLoading && !isGenerating && (
            <div className="text-center py-20 text-gray-500">
                <h2 className="text-2xl font-semibold">Your feed is empty.</h2>
                <p>Start creating to see some magic!</p>
            </div>
        )}
      </main>

      {selectedPin && (
        <PinDetailModal
          pin={selectedPin}
          isSaved={savedPins.some(p => p.id === selectedPin.id)}
          onClose={handleCloseModal}
          onSaveClick={toggleSavePin}
          onRemixClick={handleRemixClick}
        />
      )}
      
      <button
        onClick={() => setIsGeneratorOpen(true)}
        className="fixed bottom-6 right-6 bg-red-600 text-white p-4 rounded-full shadow-lg hover:bg-red-700 transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        aria-label="Generate new pin"
      >
        <PlusIcon />
      </button>

      {isGeneratorOpen && (
        <GeneratePinForm 
            isGenerating={isGenerating}
            onGenerate={handleGenerate}
            onUpload={handleUpload}
            onClose={() => {
              setIsGeneratorOpen(false);
              setPinToRemix(null);
            }}
            pinToRemix={pinToRemix}
        />
      )}
    </div>
  );
};

export default App;
