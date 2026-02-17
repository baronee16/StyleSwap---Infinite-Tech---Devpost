
import React, { useState, useRef, useEffect } from 'react';
import { BACKDROP_PRESETS, SYSTEM_INSTRUCTION } from './constants';
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

    const style = customPrompt || selectedPreset.description;
    // Combine current style with the system instruction context more explicitly
    const fullPrompt = `${style}. Ensure the lighting matches exactly and the product looks like a professional Etsy shop listing.`;

    try {
      const result = await generateBackdrop(originalImage, originalMimeType, fullPrompt);
      setResultImage(result);
      setStatus(AppStatus.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to reimagine background.");
      setStatus(AppStatus.ERROR);
      if (err.message?.includes("API Key configuration")) {
        setNeedsApiKey(true);
      }
    }
  };

  const downloadImage = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = `etsy-styled-${Date.now()}.png`;
    link.click();
  };

  if (needsApiKey) {
    return (
      <div className="min-h-screen bg-[#fdfaf6] flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full p-8 rounded-3xl shadow-xl text-center border border-orange-100">
          <div className="w-20 h-20 bg-[#f1641e] rounded-full flex items-center justify-center text-white text-3xl mx-auto mb-6 shadow-lg">
            <i className="fas fa-magic"></i>
          </div>
          <h2 className="text-2xl font-display font-bold text-gray-800 mb-3">Connect to Gemini 3</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Ready to upgrade your shop? StyleSwap uses <strong>Gemini 3 Pro Image</strong> to generate studio-quality backgrounds.
          </p>
          <div className="space-y-4">
            <button 
              onClick={handleSelectKey}
              className="w-full bg-[#f1641e] hover:bg-[#d8551a] text-white py-4 rounded-xl font-bold text-lg transition-all shadow-md active:scale-95"
            >
              Start Designing
            </button>
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block text-xs text-gray-400 hover:underline"
            >
              Requires a paid Google Cloud project key
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <header className="bg-white border-b border-orange-100 py-6 px-4 md:px-8 mb-8 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#f1641e] rounded-2xl flex items-center justify-center text-white text-2xl shadow-md rotate-3">
              <i className="fas fa-bag-shopping"></i>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-800 leading-none">StyleSwap</h1>
              <p className="text-xs text-orange-600 font-medium tracking-wide mt-1 uppercase">Artisan Background Generator</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-gray-800 hover:bg-black text-white px-6 py-2.5 rounded-full font-bold transition-all shadow-md active:scale-95 text-sm"
            >
              Upload Photo
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1 space-y-6">
            <section className="bg-white p-6 rounded-3xl shadow-sm border border-orange-50">
              <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <i className="fas fa-palette text-etsy"></i>
                Shop Aesthetics
              </h2>
              
              <div className="space-y-8">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Choose a Setting</label>
                  <div className="grid grid-cols-1 gap-3">
                    {BACKDROP_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => {
                          setSelectedPreset(preset);
                          setCustomPrompt('');
                        }}
                        className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-4 text-left ${
                          selectedPreset.id === preset.id && !customPrompt
                          ? 'border-etsy bg-orange-50 text-[#d8551a]' 
                          : 'border-gray-50 hover:border-orange-100 text-gray-600'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedPreset.id === preset.id ? 'bg-etsy text-white' : 'bg-gray-100 text-gray-400'}`}>
                          <i className={`fas ${preset.icon}`}></i>
                        </div>
                        <div>
                          <p className="text-sm font-bold">{preset.name}</p>
                          <p className="text-[10px] opacity-70 line-clamp-1">{preset.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Custom Vision</label>
                  <textarea
                    placeholder="E.g., A vintage trunk in a sunlit cabin..."
                    className="w-full p-4 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-etsy focus:border-transparent outline-none text-sm h-28 transition-all bg-gray-50/50"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                  />
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={!originalImage || status === AppStatus.GENERATING}
                  className={`w-full py-5 rounded-2xl font-bold text-lg shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 ${
                    !originalImage || status === AppStatus.GENERATING
                      ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                      : 'bg-[#f1641e] hover:bg-[#d8551a] text-white'
                  }`}
                >
                  {status === AppStatus.GENERATING ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Creating Magic...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-wand-sparkles"></i>
                      Reimagine Photo
                    </>
                  )}
                </button>
              </div>
            </section>

            {error && (
              <div className="bg-red-50 border border-red-100 p-4 rounded-2xl text-red-600 text-sm animate-pulse">
                <i className="fas fa-exclamation-triangle mr-2"></i>
                {error}
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-[2rem] shadow-sm border border-orange-50 overflow-hidden min-h-[600px] flex flex-col">
              <div className="flex-1 flex items-center justify-center p-8 bg-[#fdfaf6] relative">
                {!originalImage ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full max-w-lg aspect-square border-2 border-dashed border-orange-200 rounded-[2.5rem] flex flex-col items-center justify-center gap-6 cursor-pointer hover:bg-orange-50/50 transition-all group"
                  >
                    <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center text-etsy text-4xl shadow-sm border border-orange-100 group-hover:scale-110 transition-transform">
                      <i className="fas fa-camera"></i>
                    </div>
                    <div className="text-center">
                      <p className="font-display text-xl text-gray-800">Bring your product to life</p>
                      <p className="text-sm text-gray-400 mt-2">Upload a photo to see the Etsy magic</p>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col gap-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                      <div className="space-y-3">
                        <div className="flex justify-between items-end">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Your Photo</p>
                          <button onClick={handleStartOver} className="text-[10px] font-bold text-etsy uppercase">Change</button>
                        </div>
                        <div className="aspect-square bg-white rounded-3xl shadow-inner border border-gray-100 overflow-hidden flex items-center justify-center p-8">
                          <img src={originalImage} alt="Original" className="max-w-full max-h-full object-contain" />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reimagined Result</p>
                        <div className="aspect-square bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative">
                          {status === AppStatus.GENERATING ? (
                            <div className="absolute inset-0 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center text-center p-8">
                              <div className="w-12 h-12 border-4 border-etsy/20 border-t-etsy rounded-full animate-spin mb-4"></div>
                              <p className="font-display text-lg text-gray-800 mb-2">Generating Boutique Backdrop</p>
                              <p className="text-xs text-gray-400">Gemini 3 is crafting the perfect natural lighting for your shop...</p>
                            </div>
                          ) : resultImage ? (
                            <img src={resultImage} alt="Result" className="w-full h-full object-cover animate-in fade-in duration-1000" />
                          ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-200">
                              <i className="fas fa-magic text-6xl mb-4"></i>
                              <p className="text-sm font-medium">Click generate to begin</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {resultImage && status === AppStatus.SUCCESS && (
                      <div className="bg-white p-6 rounded-3xl border border-orange-100 shadow-lg flex items-center justify-between animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">
                            <i className="fas fa-check"></i>
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 text-sm">Perfect composition!</p>
                            <p className="text-xs text-gray-400">High-resolution 1K image ready for upload.</p>
                          </div>
                        </div>
                        <button 
                          onClick={downloadImage}
                          className="bg-gray-800 hover:bg-black text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all"
                        >
                          <i className="fas fa-download"></i>
                          Save Image
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />
    </div>
  );
};

export default App;
