import React, { useState, useRef, useEffect } from 'react';
import { Brush, Camera, Plus, Trash2, AlertCircle, RefreshCw, Sparkles, X, RefreshCcw, Check, Scan, ArrowLeft, Grid, LayoutDashboard, Clock } from 'lucide-react';
import { MakeupProduct, MakeupRecommendation } from '../types';
import { getMakeupRecommendations, analyzeMakeupImage } from '../services/gemini';

interface MakeupSectionProps {
  products: MakeupProduct[];
  onAddProduct: (product: MakeupProduct) => void;
  onRemoveProduct: (id: string) => void;
}

export const MakeupSection: React.FC<MakeupSectionProps> = ({
  products,
  onAddProduct,
  onRemoveProduct
}) => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'finder' | 'vanity'>('dashboard');

  return (
    <div className="pb-24 md:pb-0 animate-fadeIn min-h-screen">
      
      {/* MAIN DASHBOARD VIEW */}
      {currentView === 'dashboard' && (
        <div className="space-y-6">
            <header className="flex items-center justify-between pt-4 md:pt-0 px-1">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-purple-900">Beauty Studio</h1>
                    <p className="text-slate-500 text-sm mt-1">Tu espacio personal de belleza</p>
                </div>
                <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center border border-purple-50">
                    <Brush className="text-purple-400" size={20} />
                </div>
            </header>

            <div className="animate-slideUp space-y-5">
                
                {/* Navigation Cards */}
                <div className="grid gap-4">
                    <button 
                        onClick={() => setCurrentView('finder')}
                        className="group relative overflow-hidden bg-gradient-to-br from-purple-600 to-indigo-600 p-6 rounded-3xl text-white shadow-lg shadow-purple-200 text-left transition-transform active:scale-[0.98]"
                    >
                        <div className="relative z-10">
                            <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur-sm mb-4">
                                <Scan size={24} />
                            </div>
                            <h3 className="text-2xl font-serif font-bold mb-1">Smart Mirror</h3>
                            <p className="text-purple-100 text-sm">Encuentra tonos perfectos con la cámara.</p>
                        </div>
                        <div className="absolute -right-4 -bottom-4 opacity-20 transform rotate-12 group-hover:rotate-0 transition-transform duration-500">
                             <Scan size={120} />
                        </div>
                    </button>

                    <button 
                        onClick={() => setCurrentView('vanity')}
                        className="group relative overflow-hidden bg-white p-6 rounded-3xl border border-purple-100 shadow-md text-left transition-transform active:scale-[0.98]"
                    >
                        <div className="relative z-10">
                            <div className="bg-purple-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-purple-600">
                                <Grid size={24} />
                            </div>
                            <h3 className="text-2xl font-serif font-bold text-slate-800 mb-1">Mi Neceser</h3>
                            <p className="text-slate-500 text-sm">Gestiona y organiza tus cosméticos.</p>
                        </div>
                         <div className="absolute -right-4 -bottom-4 opacity-5 transform rotate-12 group-hover:rotate-0 transition-transform duration-500">
                             <Grid size={120} className="text-purple-900" />
                        </div>
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* TONE FINDER VIEW */}
      {currentView === 'finder' && (
        <div className="animate-fadeIn">
             <div className="flex items-center gap-2 mb-4">
                <button onClick={() => setCurrentView('dashboard')} className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors">
                    <ArrowLeft size={24} className="text-slate-600" />
                </button>
                <h2 className="text-lg font-bold text-slate-800">Smart Mirror</h2>
             </div>
             <ToneFinder />
        </div>
      )}

      {/* VIRTUAL VANITY VIEW */}
      {currentView === 'vanity' && (
        <div className="animate-fadeIn h-full">
             <div className="flex items-center gap-2 mb-4">
                <button onClick={() => setCurrentView('dashboard')} className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors">
                    <ArrowLeft size={24} className="text-slate-600" />
                </button>
                <h2 className="text-lg font-bold text-slate-800">Mi Neceser</h2>
             </div>
             <VirtualVanity products={products} onAdd={onAddProduct} onRemove={onRemoveProduct} />
        </div>
      )}

    </div>
  );
};

// --- TONE FINDER COMPONENT ---
// (Logic remains identical, just ensuring it's cleanly inside the new structure)
const ToneFinder: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  
  const [capturedHex, setCapturedHex] = useState<string | null>(null);
  const [realtimeHex, setRealtimeHex] = useState<string>('#ffffff');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState<MakeupRecommendation[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isCameraOpen && mediaStream && videoRef.current) {
      videoRef.current.srcObject = mediaStream;
      videoRef.current.play().catch(e => console.error("Error playing video:", e));
      startRealtimeAnalysis();
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isCameraOpen, mediaStream]);

  const startCamera = async (mode: 'user' | 'environment' = 'user') => {
    setError(null);
    stopCamera(false);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Tu navegador no soporta acceso a la cámara.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });

      setMediaStream(stream);
      setFacingMode(mode);
      setIsCameraOpen(true);

    } catch (err: any) {
      console.error("Camera error", err);
      try {
        if (mode === 'user') {
           const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
           setMediaStream(fallbackStream);
           setIsCameraOpen(true);
           return;
        }
      } catch (e) {}
      setError("No pudimos acceder a la cámara. Verifica los permisos.");
    }
  };

  const toggleCamera = () => {
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    startCamera(newMode);
  };

  const stopCamera = (fullReset = true) => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
    }
    setMediaStream(null);
    if (fullReset) setIsCameraOpen(false);
  };

  const startRealtimeAnalysis = () => {
    const analyze = () => {
      if (videoRef.current && canvasRef.current) {
        const color = getAverageColor(videoRef.current, canvasRef.current);
        if (color) setRealtimeHex(color);
      }
      animationRef.current = requestAnimationFrame(analyze);
    };
    analyze();
  };

  const getAverageColor = (video: HTMLVideoElement, canvas: HTMLCanvasElement): string | null => {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx || video.readyState !== 4) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const size = 20;
    const centerX = Math.floor((canvas.width - size) / 2);
    const centerY = Math.floor((canvas.height - size) / 2);

    const frame = ctx.getImageData(centerX, centerY, size, size);
    const data = frame.data;

    let r = 0, g = 0, b = 0;
    const count = data.length / 4;

    for (let i = 0; i < data.length; i += 4) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
    }

    r = Math.round(r / count);
    g = Math.round(g / count);
    b = Math.round(b / count);

    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
  };

  const captureAndAnalyze = async () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    
    if (realtimeHex) {
      setCapturedHex(realtimeHex);
      stopCamera(true);
      setIsAnalyzing(true);
      try {
        const recs = await getMakeupRecommendations(realtimeHex);
        setRecommendations(recs);
      } catch (e) {
        console.error(e);
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const reset = () => {
    setCapturedHex(null);
    setRecommendations([]);
    startCamera(facingMode);
  };

  return (
    <div className="space-y-6">
      {!capturedHex ? (
        <div className="relative w-full aspect-[3/4] bg-slate-900 rounded-3xl overflow-hidden shadow-lg flex items-center justify-center group">
          {!isCameraOpen ? (
            <div className="text-center p-6 max-w-xs">
               <div className="bg-purple-900/50 p-4 rounded-full inline-block mb-4">
                 <Camera className="text-purple-300" size={32} />
               </div>
               <h3 className="text-white font-serif text-lg mb-2">Iniciar Espejo</h3>
               <p className="text-slate-400 text-sm mb-6">Activa la cámara para escanear y analizar tu tono de piel.</p>
               <button 
                onClick={() => startCamera('user')}
                className="bg-purple-500 hover:bg-purple-400 text-white px-6 py-3 rounded-full font-medium transition-colors shadow-lg shadow-purple-900/20"
               >
                 Encender
               </button>
               {error && (
                 <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-red-300 text-xs font-medium">{error}</p>
                 </div>
               )}
            </div>
          ) : (
            <>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted
                className={`absolute inset-0 w-full h-full object-cover ${facingMode === 'user' ? 'transform scale-x-[-1]' : ''}`}
              />
              <div className="absolute top-4 right-4 z-20">
                <button 
                  onClick={toggleCamera}
                  className="bg-black/40 backdrop-blur-md text-white p-3 rounded-full hover:bg-black/60 transition-colors"
                >
                  <RefreshCcw size={20} />
                </button>
              </div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                 <div className="w-24 h-24 border-2 rounded-full shadow-[0_0_1000px_rgba(0,0,0,0.5)] flex items-center justify-center transition-colors duration-100"
                      style={{ borderColor: realtimeHex === '#ffffff' ? 'rgba(255,255,255,0.8)' : realtimeHex }}>
                    <div className="w-3 h-3 rounded-full transition-colors duration-100 shadow-sm" style={{ backgroundColor: realtimeHex }}></div>
                 </div>
              </div>
              <div className="absolute bottom-8 left-0 right-0 flex justify-center pointer-events-auto z-20">
                <button 
                  onClick={captureAndAnalyze}
                  className="bg-white w-20 h-20 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                >
                  <div 
                    className="w-16 h-16 rounded-full border-4 transition-colors duration-100"
                    style={{ borderColor: realtimeHex, backgroundColor: realtimeHex }}
                  ></div>
                </button>
              </div>
            </>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      ) : (
        <div className="space-y-6 animate-slideUp">
           <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-purple-100 shadow-sm">
              <div className="flex items-center gap-4">
                 <div 
                   className="w-20 h-20 rounded-full border-4 border-white shadow-md ring-2 ring-purple-50" 
                   style={{ backgroundColor: capturedHex }}
                 ></div>
                 <div>
                   <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Tono Detectado</p>
                   <p className="font-mono text-2xl font-bold text-slate-800">{capturedHex}</p>
                 </div>
              </div>
              <button onClick={reset} className="p-3 text-slate-400 hover:text-purple-500 hover:bg-purple-50 rounded-xl transition-colors">
                <RefreshCw size={24} />
              </button>
           </div>

           {isAnalyzing ? (
             <div className="text-center py-12">
               <div className="relative inline-block">
                  <div className="absolute inset-0 bg-purple-200 rounded-full animate-ping opacity-20"></div>
                  <Sparkles className="relative z-10 text-purple-500 animate-pulse" size={32} />
               </div>
               <p className="text-purple-800 font-serif mt-4">Buscando productos en España...</p>
             </div>
           ) : (
             <div className="grid gap-4">
               <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider ml-1">Mejores Coincidencias</h3>
               {recommendations.map((item, idx) => (
                 <div key={idx} className="bg-white p-5 rounded-2xl border border-purple-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
                    <div className="flex-shrink-0">
                       {item.hexColorEstimate ? (
                         <div 
                           className="w-12 h-12 rounded-full shadow-inner border border-slate-100 ring-2 ring-white"
                           style={{ backgroundColor: item.hexColorEstimate }}
                         ></div>
                       ) : (
                         <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-300">
                           <Sparkles size={20} />
                         </div>
                       )}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-lg leading-tight">{item.productName}</h4>
                      <span className="inline-block mt-1 text-[10px] uppercase tracking-wider bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-100">
                          {item.category}
                      </span>
                      <p className="text-sm text-slate-500 mt-2 leading-relaxed">{item.reason}</p>
                    </div>
                 </div>
               ))}
             </div>
           )}
        </div>
      )}
    </div>
  );
};

// --- VIRTUAL VANITY COMPONENT ---

interface VirtualVanityProps {
    products: MakeupProduct[];
    onAdd: (p: MakeupProduct) => void;
    onRemove: (id: string) => void;
}

const VirtualVanity: React.FC<VirtualVanityProps> = ({ products, onAdd, onRemove }) => {
  const [isAddOpen, setIsAddOpen] = useState(false);

  const handleAdd = (name: string, brand: string, category: any, pao: number, imageUrl?: string) => {
    const newProduct: MakeupProduct = {
      id: crypto.randomUUID(),
      name, brand, category, paoMonths: pao,
      dateOpened: Date.now(),
      imageUrl
    };
    onAdd(newProduct);
    setIsAddOpen(false);
  };

  const getExpiryStatus = (product: MakeupProduct) => {
    const now = Date.now();
    const opened = product.dateOpened;
    const monthsPassed = (now - opened) / (1000 * 60 * 60 * 24 * 30);
    const percentage = Math.min(100, (monthsPassed / product.paoMonths) * 100);
    
    let status = 'fresh';
    if (percentage > 90) status = 'expired';
    else if (percentage > 75) status = 'warning';

    return { percentage, status, monthsPassed };
  };

  return (
    <div className="relative min-h-[50vh]">
      {products.length === 0 ? (
         <div className="text-center py-20 opacity-60 bg-white rounded-3xl border border-dashed border-purple-200">
           <div className="bg-purple-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
             <Brush className="text-purple-300" size={24} />
           </div>
           <p className="text-slate-500 font-medium">Tu neceser está vacío</p>
           <p className="text-slate-400 text-sm mt-1">Añade tus productos favoritos</p>
         </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 pb-24">
          {products.map(product => {
            const { percentage, status, monthsPassed } = getExpiryStatus(product);
            const statusColor = status === 'expired' ? 'bg-red-500' : status === 'warning' ? 'bg-yellow-500' : 'bg-emerald-500';
            
            return (
              <div key={product.id} className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm relative group flex flex-col h-full transition-all hover:shadow-md">
                
                {/* Image Area */}
                <div className="w-full aspect-square rounded-xl bg-slate-50 overflow-hidden border border-slate-50 mb-3 relative">
                   {product.imageUrl ? (
                     <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-purple-200">
                       <Brush size={24} />
                     </div>
                   )}
                   <div className="absolute top-2 right-2">
                       <div className={`w-2 h-2 rounded-full ${statusColor} shadow-sm ring-2 ring-white`}></div>
                   </div>
                </div>

                {/* Info */}
                <div className="flex-grow min-w-0">
                    <div className="text-[10px] font-bold text-purple-400 uppercase tracking-wider truncate">{product.brand}</div>
                    <h4 className="font-medium text-slate-800 text-sm leading-tight mb-2 line-clamp-2 h-9">{product.name}</h4>
                    
                    <div className="flex items-center gap-1 mt-auto pt-2 border-t border-slate-50">
                        <Clock size={12} className="text-slate-300" />
                        <span className="text-[10px] text-slate-400">{Math.floor(monthsPassed)}/{product.paoMonths} meses</span>
                    </div>
                </div>

                {/* Delete Action */}
                <button 
                    onClick={() => onRemove(product.id)} 
                    className="absolute -top-2 -right-2 bg-white text-slate-300 hover:text-red-400 p-1.5 rounded-full shadow-sm border border-slate-100 opacity-0 group-hover:opacity-100 transition-all"
                >
                   <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <button
        onClick={() => setIsAddOpen(true)}
        className="fixed md:absolute bottom-24 md:bottom-6 right-6 md:right-0 bg-purple-600 text-white p-4 rounded-full shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all hover:scale-110 z-30"
      >
        <Camera size={24} />
      </button>

      {isAddOpen && (
        <AddProductCameraModal onClose={() => setIsAddOpen(false)} onAdd={handleAdd} />
      )}
    </div>
  );
};

// --- SMART CAMERA ADD MODAL ---
const AddProductCameraModal: React.FC<{ 
  onClose: () => void, 
  onAdd: (n: string, b: string, c: any, p: number, img?: string) => void 
}> = ({ onClose, onAdd }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [step, setStep] = useState<'camera' | 'analyzing' | 'form'>('camera');
  const [image, setImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', brand: '', category: 'face', pao: 12 });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (step === 'camera') {
      (async () => {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment', width: { ideal: 720 } } 
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
        } catch (e) {
          console.error(e);
          setError("No se pudo acceder a la cámara.");
        }
      })();
    }
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, [step]);

  const takePhoto = async () => {
    if (videoRef.current && canvasRef.current) {
      const vid = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = vid.videoWidth;
      canvas.height = vid.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(vid, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
        setImage(dataUrl);
        setStep('analyzing');
        const analysis = await analyzeMakeupImage(dataUrl);
        setFormData({
          name: analysis.name,
          brand: analysis.brand,
          category: analysis.category,
          pao: analysis.paoMonths
        });
        setStep('form');
      }
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData.name, formData.brand, formData.category, formData.pao, image || undefined);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm animate-fadeIn p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl animate-slideUp relative">
        <button onClick={onClose} className="absolute top-4 right-4 z-20 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full backdrop-blur-md transition-colors">
          <X size={20} />
        </button>

        {step === 'camera' && (
          <div className="relative bg-black aspect-[3/4]">
            <video ref={videoRef} playsInline autoPlay muted className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 pointer-events-none">
               <div className="text-white/80 text-xs mb-6 bg-black/30 px-3 py-1 rounded-full backdrop-blur-md">
                 Enfoca el producto
               </div>
               <button onClick={takePhoto} className="w-16 h-16 rounded-full border-4 border-white bg-white/20 pointer-events-auto hover:scale-105 transition-transform flex items-center justify-center">
                 <div className="w-12 h-12 bg-white rounded-full"></div>
               </button>
            </div>
            <canvas ref={canvasRef} className="hidden" />
            {error && <div className="absolute top-1/2 w-full text-center text-white bg-red-500/50 p-2">{error}</div>}
          </div>
        )}

        {step === 'analyzing' && (
          <div className="aspect-[3/4] bg-purple-900 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
            {image && <img src={image} alt="Captured" className="absolute inset-0 w-full h-full object-cover opacity-30 blur-sm" />}
            <div className="relative z-10 bg-purple-950/80 p-6 rounded-3xl backdrop-blur-xl border border-purple-500/30">
              <div className="flex justify-center mb-4">
                 <div className="relative">
                    <div className="absolute inset-0 bg-purple-500 rounded-full blur-md opacity-40 animate-ping"></div>
                    <Sparkles className="relative z-10 text-purple-300 animate-pulse" size={40} />
                 </div>
              </div>
              <h3 className="text-white font-serif text-xl mb-1">Analizando...</h3>
              <p className="text-purple-200 text-sm">Extrayendo detalles con IA</p>
            </div>
          </div>
        )}

        {step === 'form' && (
          <div className="bg-white flex flex-col h-auto max-h-[85vh]">
             <div className="relative h-40 bg-slate-100 shrink-0">
               {image && <img src={image} className="w-full h-full object-cover" alt="Product" />}
               <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
               <div className="absolute bottom-2 left-6">
                  <span className="bg-purple-100 text-purple-700 text-[10px] font-bold uppercase px-2 py-1 rounded tracking-wider">Detectado</span>
               </div>
             </div>
             <form onSubmit={handleFormSubmit} className="p-6 space-y-4 overflow-y-auto">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Marca</label>
                  <input value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} className="w-full p-3 rounded-xl bg-slate-50 border-slate-100 border outline-none font-medium text-slate-800" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nombre</label>
                  <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3 rounded-xl bg-slate-50 border-slate-100 border outline-none font-medium text-slate-800" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Categoría</label>
                     <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any})} className="w-full p-3 rounded-xl bg-slate-50 border-slate-100 border outline-none">
                        <option value="face">Rostro</option>
                        <option value="eyes">Ojos</option>
                        <option value="lips">Labios</option>
                        <option value="skincare">Skincare</option>
                     </select>
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-400 uppercase mb-1">PAO (Meses)</label>
                     <input type="number" value={formData.pao} onChange={e => setFormData({...formData, pao: Number(e.target.value)})} className="w-full p-3 rounded-xl bg-slate-50 border-slate-100 border outline-none text-center font-mono text-purple-600 font-bold" />
                   </div>
                </div>
                <button className="w-full bg-purple-600 text-white py-3.5 rounded-xl font-medium hover:bg-purple-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-200 mt-2">
                  <Check size={20} />
                  Confirmar
                </button>
             </form>
          </div>
        )}
      </div>
    </div>
  );
};