import React, { useState } from 'react';
import { Scale, Send, BookOpen, ShieldAlert, Link as LinkIcon, SearchCheck, FileText, ExternalLink } from 'lucide-react';
import { getLegalConsultation } from '../services/gemini';
import { LegalResponse } from '../types';
import ReactMarkdown from 'react-markdown';

// Lista de documentos legales con enlaces al BOE consolidado
const LEGAL_DOCS = [
  {
    id: 'cc',
    acronym: 'CC',
    title: 'Código Civil',
    desc: 'Relaciones civiles, propiedad y familia.',
    color: 'text-blue-600 bg-blue-50 border-blue-100',
    url: 'https://www.boe.es/buscar/pdf/1889/BOE-A-1889-4763-consolidado.pdf'
  },
  {
    id: 'cp',
    acronym: 'CP',
    title: 'Código Penal',
    desc: 'Delitos, penas y política criminal.',
    color: 'text-red-600 bg-red-50 border-red-100',
    url: 'https://www.boe.es/buscar/pdf/1995/BOE-A-1995-25444-consolidado.pdf'
  },
  {
    id: 'ce',
    acronym: 'CE',
    title: 'Constitución',
    desc: 'Norma suprema del ordenamiento jurídico.',
    color: 'text-yellow-600 bg-yellow-50 border-yellow-100',
    url: 'https://www.boe.es/buscar/pdf/1978/BOE-A-1978-31229-consolidado.pdf'
  },
  {
    id: 'lec',
    acronym: 'LEC',
    title: 'Enj. Civil',
    desc: 'Regulación procesal civil.',
    color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    url: 'https://www.boe.es/buscar/pdf/2000/BOE-A-2000-323-consolidado.pdf'
  },
  {
    id: 'lecrim',
    acronym: 'LECrim',
    title: 'Enj. Criminal',
    desc: 'Regulación procesal penal.',
    color: 'text-purple-600 bg-purple-50 border-purple-100',
    url: 'https://www.boe.es/buscar/pdf/1882/BOE-A-1882-6036-consolidado.pdf'
  },
  {
    id: 'et',
    acronym: 'ET',
    title: 'Estatuto Trab.',
    desc: 'Derecho laboral y trabajadores.',
    color: 'text-orange-600 bg-orange-50 border-orange-100',
    url: 'https://www.boe.es/buscar/pdf/2015/BOE-A-2015-11430-consolidado.pdf'
  },
  {
    id: 'lopj',
    acronym: 'LOPJ',
    title: 'Poder Judicial',
    desc: 'Funcionamiento de juzgados.',
    color: 'text-slate-600 bg-slate-100 border-slate-200',
    url: 'https://www.boe.es/buscar/pdf/1985/BOE-A-1985-12666-consolidado.pdf'
  },
  {
    id: 'lpac',
    acronym: 'LPAC',
    title: 'Proc. Admin.',
    desc: 'Ley 39/2015 Procedimiento.',
    color: 'text-teal-600 bg-teal-50 border-teal-100',
    url: 'https://www.boe.es/buscar/pdf/2015/BOE-A-2015-10565-consolidado.pdf'
  }
];

export const LegalSection: React.FC = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<LegalResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setResponse(null);

    try {
      const result = await getLegalConsultation(query);
      setResponse(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fadeIn pb-24 md:pb-0">
      {/* Header */}
      <header className="mb-8 pt-4 md:pt-0">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-slate-100 rounded-xl text-slate-600">
            <Scale size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold text-slate-800">Consultoría Jurídica</h1>
            <p className="text-slate-500 text-sm">Asistente legal con verificación de fuentes</p>
          </div>
        </div>
      </header>

      {/* Search Box */}
      <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 p-6 mb-8 border border-slate-100">
        <form onSubmit={handleSearch}>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Consulta Legal IA
          </label>
          <div className="relative">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ej. ¿Cuáles son los requisitos para la usucapión? ¿Qué dice el artículo 18 de la CE?"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 pr-12 text-slate-800 focus:ring-2 focus:ring-slate-200 focus:border-slate-400 outline-none transition-all resize-none h-32 placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="absolute bottom-3 right-3 p-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" /> : <Send size={20} />}
            </button>
          </div>
          <p className="mt-3 text-xs text-slate-400 flex items-center gap-1.5">
            <ShieldAlert size={12} />
            La IA cita fuentes legales. Verifica siempre con el BOE oficial.
          </p>
        </form>
      </div>

      {/* Results Area */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12 opacity-70 space-y-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-slate-800 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
               <SearchCheck size={20} className="text-slate-800" />
            </div>
          </div>
          <p className="text-slate-600 font-medium animate-pulse">Analizando jurisprudencia y leyes...</p>
        </div>
      )}

      {response && (
        <div className="animate-slideUp mb-12">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Response Header */}
            <div className="bg-slate-50 px-6 py-3 border-b border-slate-100 flex items-center gap-2">
              <BookOpen size={16} className="text-slate-500" />
              <span className="text-sm font-semibold text-slate-700">Respuesta Fundamentada</span>
            </div>
            
            {/* Markdown Content */}
            <div className="p-6 prose prose-slate prose-sm max-w-none">
               <div className="whitespace-pre-line leading-relaxed text-slate-800">
                  <ReactMarkdown>{response.text}</ReactMarkdown>
               </div>
            </div>

            {/* Sources Footer */}
            {response.sources.length > 0 && (
              <div className="bg-slate-900 px-6 py-4 text-white">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Fuentes Consultadas</h4>
                <ul className="space-y-2">
                  {response.sources.map((source, idx) => (
                    <li key={idx}>
                      <a 
                        href={source.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors group"
                      >
                        <LinkIcon size={14} className="group-hover:text-blue-400 transition-colors" />
                        <span className="truncate">{source.title}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Documents Grid */}
      {!isLoading && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Textos Legales BOE</h3>
            <span className="text-xs text-slate-300">PDFs Oficiales</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
             {LEGAL_DOCS.map((doc) => (
               <a 
                key={doc.id}
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-md group flex flex-col justify-between h-full ${doc.color.replace('text-', 'border-').replace('bg-', 'hover:bg-opacity-80 ')} bg-white border-slate-100`}
               >
                  <div>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 font-serif font-bold ${doc.acronym.length > 4 ? 'text-[10px] tracking-tighter' : doc.acronym.length > 2 ? 'text-sm' : 'text-lg'} ${doc.color}`}>
                      {doc.acronym}
                    </div>
                    <h3 className="font-semibold text-slate-800 text-sm leading-tight">{doc.title}</h3>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">{doc.desc}</p>
                  </div>
                  <div className="mt-3 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                     <ExternalLink size={14} className="text-slate-400" />
                  </div>
               </a>
             ))}
          </div>
        </div>
      )}
    </div>
  );
};
