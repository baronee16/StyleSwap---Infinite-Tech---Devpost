
import React, { useState, useRef, useEffect } from 'react';
import { BACKDROP_PRESETS } from './constants';
import { AppStatus, Preset } from './types';
import { generateBackdrop } from './services/geminiService';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [originalMimeType, setOriginalMimeType] = useState<string>('');
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<Preset>(BACKDROP_PRESETS[0]);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [needsApiKey, setNeedsApiKey] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check for API key selection on mount for Gemini 3 compliance
  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setNeedsApiKey(!hasKey);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      // Assume success as per guidelines to avoid race condition
      setNeedsApiKey(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setOriginalImage(event.target?.result as string);
        setOriginalMimeType(file.type);
        setResultImage(null);
        setStatus(AppStatus.IDLE);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStartOver = () => {
    setOriginalImage(null);
    setResultImage(null);
    setOriginalMimeType('');
    setStatus(AppStatus.IDLE);
    setError(null);
    setCustomPrompt('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGenerate = async () => {
    if (!originalImage) return;

    setStatus(AppStatus.GENERATING);
    setError(null);

    const prompt = customPrompt || selectedPreset.description;

    try {
      const result = await generateBackdrop(originalImage, originalMimeType, prompt);
      setResultImage(result);
      setStatus(AppStatus.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong.");
      setStatus(AppStatus.ERROR);
      
      // If the error suggests a missing project/key, prompt for re-selection
      if (err.message?.includes("API Key configuration")) {
        setNeedsApiKey(true);
      }
    }
  };

  const downloadImage = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = `styleswap-gemini3-${Date.now()}.png`;
    link.click();
  };

  // Onboarding screen for API Key Selection
  if (needsApiKey) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full p-8 rounded-3xl shadow-xl text-center border border-orange-100">
          <div className="w-20 h-20 bg-orange-500 rounded-2xl flex items-center justify-center text-white text-3xl mx-auto mb-6 shadow-lg animate-bounce">
            <i className="fas fa-key"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Unlock Gemini 3</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            StyleSwap now uses the cutting-edge <strong>Gemini 3 Pro Image</strong> model. To proceed, please connect your Google Cloud project.
          </p>
          <div className="space-y-4">
            <button 
              onClick={handleSelectKey}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-md active:scale-95 flex items-center justify-center gap-3"
            >
              <i className="fas fa-plug"></i>
              Connect API Key
            </button>
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block text-sm text-orange-600 hover:underline font-medium"
            >
              Learn about paid project keys
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-white border-b border-orange-100 py-4 px-4 md:px-8 mb-8 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white text-xl shadow-md">
              <i className="fas fa-magic"></i>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800 leading-none">StyleSwap</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-orange-600 font-bold uppercase tracking-wider bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100">PRO EDIT</span>
                <span className="flex items-center gap-1 text-[10px] text-blue-600 font-bold uppercase tracking-wider bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping"></span>
                  Gemini 3 API Active
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {originalImage && (
              <button 
                onClick={handleStartOver}
                className="hidden md:flex items-center gap-2 text-gray-500 hover:text-orange-600 px-4 py-2 font-semibold transition-all"
              >
                <i className="fas fa-arrow-rotate-left text-sm"></i>
                Start Over
              </button>
            )}
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="hidden md:flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-full font-semibold transition-all shadow-md active:scale-95"
            >
              <i className="fas fa-upload"></i>
              {originalImage ? 'New Photo' : 'Upload Photo'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Editor Controls */}
          <div className="lg:col-span-1 space-y-8">
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-orange-50">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <i className="fas fa-sliders text-orange-500"></i>
                AI Style Designer
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Atmosphere Presets</label>
                  <div className="grid grid-cols-2 gap-3">
                    {BACKDROP_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => {
                          setSelectedPreset(preset);
                          setCustomPrompt('');
                        }}
                        className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 text-center ${
                          selectedPreset.id === preset.id && !customPrompt
                          ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm' 
                          : 'border-gray-100 hover:border-orange-200 text-gray-600'
                        }`}
                      >
                        <i className={`fas ${preset.icon} text-lg`}></i>
                        <span className="text-xs font-medium">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Custom Setting</label>
                  <textarea
                    placeholder="Describe your perfect background..."
                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-sm h-24 transition-all"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                  />
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={!originalImage || status === AppStatus.GENERATING}
                  className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-3 active:scale-95 ${
                    !originalImage || status === AppStatus.GENERATING 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-orange-600 hover:bg-orange-700 shadow-orange-200'
                  }`}
                >
                  {status === AppStatus.GENERATING ? (
                    <>
                      <i className="fas fa-atom fa-spin"></i>
                      Gemini 3 Processing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-wand-sparkles"></i>
                      Transform Backdrop
                    </>
                  )}
                </button>
                
                {error && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs font-medium border border-red-100 animate-in fade-in slide-in-from-top-1">
                    <i className="fas fa-exclamation-triangle mr-1"></i>
                    {error}
                  </div>
                )}
              </div>
            </section>

            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
              <div className="flex items-start gap-3">
                <div className="text-blue-500 mt-0.5">
                  <i className="fas fa-star text-sm"></i>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-blue-800 mb-1">Gemini 3 Frontier</h3>
                  <p className="text-[11px] text-blue-700 leading-relaxed">
                    You are using <strong>Gemini 3 Pro Image</strong>. This model uses advanced spatial reasoning to place products perfectly in 3D-aware environments.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Preview */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-orange-50 p-4 md:p-8 min-h-[500px] flex flex-col relative overflow-hidden">
              
              {!originalImage ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-orange-300 hover:bg-orange-50/30 transition-all p-10 group"
                >
                  <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
                    <i className="fas fa-camera text-3xl"></i>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Ready for Gemini 3 Transformation</h3>
                  <p className="text-gray-500 text-center max-w-sm mb-6 text-sm">
                    Upload a product photo to see how Gemini 3 reimagines its surroundings.
                  </p>
                  <span className="bg-white border border-gray-200 px-6 py-2 rounded-full text-sm font-semibold text-gray-700 shadow-sm group-hover:shadow-md transition-all">
                    Choose Photo
                  </span>
                </div>
              ) : (
                <div className="flex-1 flex flex-col lg:flex-row gap-6 h-full">
                  {/* Before */}
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-3 px-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-100 px-2 py-1 rounded">Input</span>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={handleStartOver}
                          className="text-xs font-medium text-gray-400 hover:text-red-500"
                        >
                          Clear
                        </button>
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="text-xs font-medium text-orange-600 hover:underline"
                        >
                          Replace
                        </button>
                      </div>
                    </div>
                    <div className="relative flex-1 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center">
                      <img src={originalImage} alt="Original" className="max-h-full max-w-full object-contain p-2" />
                    </div>
                  </div>

                  {/* After */}
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-3 px-1">
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded">Gemini 3 Pro Output</span>
                      {status === AppStatus.SUCCESS && resultImage && (
                         <button 
                            onClick={downloadImage}
                            className="text-xs font-medium text-green-600 hover:underline flex items-center gap-1"
                         >
                           <i className="fas fa-download"></i> Save HD
                         </button>
                      )}
                    </div>
                    <div className="relative flex-1 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center shadow-inner">
                      {status === AppStatus.GENERATING ? (
                        <div className="flex flex-col items-center gap-4 text-center p-4">
                          <div className="relative">
                            <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center text-blue-600">
                              <i className="fas fa-microchip animate-pulse"></i>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-700 uppercase tracking-tighter">Gemini 3 is creating...</p>
                            <p className="text-[11px] text-gray-500 mt-1">Applying global lighting & depth maps</p>
                          </div>
                        </div>
                      ) : resultImage ? (
                        <img src={resultImage} alt="Transformed" className="max-h-full max-w-full object-contain animate-in fade-in zoom-in duration-1000 p-2" />
                      ) : (
                        <div className="text-center p-8 text-gray-400">
                          <i className="fas fa-sparkles text-3xl mb-3 opacity-20"></i>
                          <p className="text-xs italic">Awaiting AI transformation</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Mobile Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 md:hidden bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-[0_-4px_15px_rgba(0,0,0,0.08)] z-20">
        {!originalImage ? (
           <button 
           onClick={() => fileInputRef.current?.click()}
           className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg"
         >
           <i className="fas fa-camera"></i>
           Upload Photo
         </button>
        ) : (
          <div className="flex gap-3">
             <button 
              onClick={handleStartOver}
              className="bg-gray-100 text-gray-600 p-4 rounded-xl font-bold transition-all active:bg-gray-200"
            >
              <i className="fas fa-arrow-rotate-left"></i>
            </button>
            <button 
              onClick={handleGenerate}
              disabled={status === AppStatus.GENERATING}
              className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg disabled:bg-gray-400"
            >
              {status === AppStatus.GENERATING ? <i className="fas fa-atom fa-spin"></i> : <i className="fas fa-magic"></i>}
              {status === AppStatus.GENERATING ? 'Rendering...' : 'Gemini 3 Magic'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
