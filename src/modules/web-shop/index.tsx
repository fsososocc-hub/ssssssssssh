/**
 * E-commerce Online Store Custon Theme Customizer - Level 10 Separation compliant
 * Visual customize controls, headers layouts, CSS variable configs, slider banners, and live theme simulations.
 */

import React, { useState, useEffect } from 'react';
import { useContentStore } from '../../stores/contentStore';
import { ThemeConfig } from '../../database/themes';
import { contentSchemas } from '../../schemas/content.schema';
import { Palette, Layers, RefreshCw, LayoutTemplate, Plus, Trash2, Eye, Save } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';

export default function ThemeEditorView() {
  const { themes, updateTheme, hydrateAll } = useContentStore();
  const [activeThemeId, setActiveThemeId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    hydrateAll();
  }, [hydrateAll]);

  useEffect(() => {
    if (themes.length > 0 && !activeThemeId) {
      const active = themes.find(t => t.status === 'active') || themes[0];
      setActiveThemeId(active.id);
    }
  }, [themes, activeThemeId]);

  const activeTheme = themes.find(t => t.id === activeThemeId);

  const handleUpdate = (updatedFields: Partial<ThemeConfig>) => {
    if (!activeTheme) return;
    updateTheme(activeTheme.id, updatedFields);
  };

  const handleSaveTheme = () => {
    if (!activeTheme) return;
    const validation = contentSchemas.theme.validate(activeTheme);
    if (!validation.success) {
      alert(validation.errors?.[0] || 'Verification failed');
      return;
    }
    
    // Set other themes status to draft if custom set to active
    if (activeTheme.status === 'active') {
      themes.forEach(t => {
        if (t.id !== activeTheme.id && t.status === 'active') {
          updateTheme(t.id, { status: 'draft' });
        }
      });
    }

    setToastMessage('Theme templates configurations committed and saved!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const addBanner = () => {
    if (!activeTheme) return;
    const freshBanner = {
      id: 'banner_' + Date.now(),
      imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1000&q=80',
      title: 'New Collections Spotlight',
      subtitle: 'Organic textures crafted for architectural silhouettes',
      buttonText: 'Acquire Look',
      buttonLink: '#products'
    };
    handleUpdate({
      sliderBanners: [...activeTheme.sliderBanners, freshBanner]
    });
  };

  const removeBanner = (bannerId: string) => {
    if (!activeTheme) return;
    handleUpdate({
      sliderBanners: activeTheme.sliderBanners.filter(b => b.id !== bannerId)
    });
  };

  if (!activeTheme) {
    return <div className="text-center font-mono text-neutral-400 py-10">Hydrating Theme Assets ...</div>;
  }

  return (
    <div className="space-y-4 animate-fadeIn text-xs">
      {/* Page Title */}
      <div className="flex items-center justify-between border-b pb-3.5 border-black/5">
        <div>
          <span className="text-[10px] font-sans tracking-widest text-[#888] font-bold">网店模板</span>
          <h2 className="text-sm font-bold tracking-tight text-[#111] font-sans">店铺装修</h2>
        </div>
        <div className="flex space-x-1.5 shrink-0">
          <button
            onClick={handleSaveTheme}
            className="bg-black text-white px-3 py-1.5 rounded-lg font-medium hover:bg-neutral-800 transition-colors cursor-pointer flex items-center space-x-1 text-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>发布</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 p-2.5 rounded-lg font-mono">
          {toastMessage}
        </div>
      )}

      {/* Selector layout style */}
      <div className="flex items-center space-x-3 bg-neutral-50/50 p-2 border rounded-lg">
        <span className="font-sans font-bold text-neutral-600 pl-1">配置模板:</span>
        <select
          value={activeThemeId || ''}
          onChange={(e) => setActiveThemeId(e.target.value)}
          className="bg-white border rounded px-2.5 py-1 text-xs focus:ring-1 focus:ring-black focus:outline-none"
        >
          {themes.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <Badge variant={activeTheme.status === 'active' ? 'success' : 'neutral'}>
          {activeTheme.status.toUpperCase()}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Customized Side Panel */}
        <div className="lg:col-span-2 space-y-4 h-[650px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-neutral-200">
          
          {/* Logo & Brand assets */}
          <div className="bg-white border rounded-lg p-3.5 space-y-3.5 shadow-xs">
            <h4 className="font-bold font-mono text-neutral-800 flex items-center space-x-1.5 border-b pb-1.5 uppercase">
              <Layers className="w-4 h-4 text-neutral-600" />
              <span>Logo & Brand Configurations</span>
            </h4>
            <div className="space-y-3">
              <div className="flex flex-col">
                <label className="font-semibold mb-1">Header Logo URL</label>
                <input
                  type="text"
                  placeholder="Paste URL to lookbook logo..."
                  value={activeTheme.logoUrl || ''}
                  onChange={(e) => handleUpdate({ logoUrl: e.target.value })}
                  className="border rounded px-2.5 py-1.5 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col">
                  <label className="font-semibold mb-1">Header Layout Style</label>
                  <select
                    value={activeTheme.headerStyle}
                    onChange={(e) => handleUpdate({ headerStyle: e.target.value as any })}
                    className="border rounded px-2.5 py-1.5 focus:outline-none"
                  >
                    <option value="inline">Inline Horizontal</option>
                    <option value="centered">Centered Portrait</option>
                    <option value="minimal">Minimal Hamburger</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="font-semibold mb-1">Footer Layout Style</label>
                  <select
                    value={activeTheme.footerLayout}
                    onChange={(e) => handleUpdate({ footerLayout: e.target.value as any })}
                    className="border rounded px-2.5 py-1.5 focus:outline-none"
                  >
                    <option value="simple">Simple Footer</option>
                    <option value="extended">Bento Index</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col">
                <label className="font-semibold mb-1">Footer Rights Reserved Claim</label>
                <input
                  type="text"
                  value={activeTheme.footerText}
                  onChange={(e) => handleUpdate({ footerText: e.target.value })}
                  className="border rounded px-2.5 py-1.5 text-[11px]"
                />
              </div>
            </div>
          </div>

          {/* Sizing Colors Hex Palettes */}
          <div className="bg-white border rounded-lg p-3.5 space-y-3.5 shadow-xs">
            <h4 className="font-bold font-mono text-neutral-800 flex items-center space-x-1.5 border-b pb-1.5 uppercase">
              <Palette className="w-4 h-4 text-neutral-600" />
              <span>Identity Palettes Colour Configuration</span>
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <label className="font-semibold mb-1">Primary Color (Hex)</label>
                <div className="flex items-center space-x-1">
                  <input
                    type="color"
                    value={activeTheme.primaryColor}
                    onChange={(e) => handleUpdate({ primaryColor: e.target.value })}
                    className="w-8 h-8 rounded p-0 border border-neutral-300"
                  />
                  <input
                    type="text"
                    value={activeTheme.primaryColor}
                    onChange={(e) => handleUpdate({ primaryColor: e.target.value })}
                    className="border rounded px-2 py-1 w-full text-center font-mono"
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="font-semibold mb-1">Accent Canvas (Hex)</label>
                <div className="flex items-center space-x-1">
                  <input
                    type="color"
                    value={activeTheme.accentColor}
                    onChange={(e) => handleUpdate({ accentColor: e.target.value })}
                    className="w-8 h-8 rounded p-0 border border-neutral-300"
                  />
                  <input
                    type="text"
                    value={activeTheme.accentColor}
                    onChange={(e) => handleUpdate({ accentColor: e.target.value })}
                    className="border rounded px-2 py-1 w-full text-center font-mono"
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="font-semibold mb-1">Background color (Hex)</label>
                <div className="flex items-center space-x-1">
                  <input
                    type="color"
                    value={activeTheme.backgroundColor}
                    onChange={(e) => handleUpdate({ backgroundColor: e.target.value })}
                    className="w-8 h-8 rounded p-0 border border-neutral-300"
                  />
                  <input
                    type="text"
                    value={activeTheme.backgroundColor}
                    onChange={(e) => handleUpdate({ backgroundColor: e.target.value })}
                    className="border rounded px-2 py-1 w-full text-center font-mono"
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="font-semibold mb-1">Main text color (Hex)</label>
                <div className="flex items-center space-x-1">
                  <input
                    type="color"
                    value={activeTheme.textColor}
                    onChange={(e) => handleUpdate({ textColor: e.target.value })}
                    className="w-8 h-8 rounded p-0 border border-neutral-300"
                  />
                  <input
                    type="text"
                    value={activeTheme.textColor}
                    onChange={(e) => handleUpdate({ textColor: e.target.value })}
                    className="border rounded px-2 py-1 w-full text-center font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Banner Slider Configuration */}
          <div className="bg-white border rounded-lg p-3.5 space-y-3.5 shadow-xs">
            <div className="flex justify-between items-center border-b pb-1.5">
              <h4 className="font-bold font-mono text-neutral-800 flex items-center space-x-1.5 uppercase">
                <LayoutTemplate className="w-4 h-4 text-neutral-600" />
                <span>Slider Hero Board Banner Setup</span>
              </h4>
              <div className="flex items-center space-x-1 font-mono text-[10px]">
                <input
                  type="checkbox"
                  id="enable_slider"
                  checked={activeTheme.enableSlider}
                  onChange={(e) => handleUpdate({ enableSlider: e.target.checked })}
                  className="rounded border border-neutral-300 mr-1"
                />
                <label htmlFor="enable_slider" className="cursor-pointer">Active</label>
              </div>
            </div>

            {activeTheme.enableSlider && (
              <div className="space-y-3">
                <div className="space-y-2 border divide-y rounded-lg overflow-hidden bg-neutral-50/50">
                  {activeTheme.sliderBanners.map((b, idx) => (
                    <div key={b.id} className="p-3 space-y-2 text-[10px]">
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold font-mono text-neutral-500 uppercase">BANNER ELEMENT {idx + 1}</span>
                        <button
                          onClick={() => removeBanner(b.id)}
                          className="text-red-500 hover:text-red-700 bg-white p-1 rounded border hover:border-red-200 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <input
                          type="text"
                          placeholder="Headline Text"
                          value={b.title}
                          onChange={(e) => {
                            const updated = [...activeTheme.sliderBanners];
                            updated[idx].title = e.target.value;
                            handleUpdate({ sliderBanners: updated });
                          }}
                          className="w-full border rounded px-2.5 py-1 text-[11px]"
                        />
                        <input
                          type="text"
                          placeholder="Sub-headline Description"
                          value={b.subtitle}
                          onChange={(e) => {
                            const updated = [...activeTheme.sliderBanners];
                            updated[idx].subtitle = e.target.value;
                            handleUpdate({ sliderBanners: updated });
                          }}
                          className="w-full border rounded px-2.5 py-1 text-[11px]"
                        />
                        <input
                          type="text"
                          placeholder="Image URL"
                          value={b.imageUrl}
                          onChange={(e) => {
                            const updated = [...activeTheme.sliderBanners];
                            updated[idx].imageUrl = e.target.value;
                            handleUpdate({ sliderBanners: updated });
                          }}
                          className="w-full border rounded px-2.5 py-1 text-[11px] font-mono"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={addBanner}
                  className="w-full border border-dashed rounded text-indigo-600 hover:bg-neutral-50 font-bold py-1.8 text-center cursor-pointer flex items-center justify-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Append Hero slide</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Live Simulator Viewport */}
        <div className="lg:col-span-3 bg-neutral-900 border rounded-xl p-3 shadow-xl h-[650px] flex flex-col justify-between">
          {/* Mock Screen Header */}
          <div className="flex justify-between items-center mb-3">
            <div className="flex space-x-1 pl-1">
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span>
              <span className="w-2.5 h-2.5 bg-amber-500 rounded-full"></span>
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() => setPreviewMode('desktop')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${previewMode === 'desktop' ? 'bg-white text-black' : 'text-neutral-400 bg-neutral-800'}`}
              >
                Desktop Desktop
              </button>
              <button
                onClick={() => setPreviewMode('mobile')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${previewMode === 'mobile' ? 'bg-white text-black' : 'text-neutral-400 bg-neutral-800'}`}
              >
                Mobile Adaptive
              </button>
            </div>
          </div>

          {/* Iframe-like Mock container */}
          <div className="flex-1 bg-white border rounded-lg overflow-y-auto overflow-x-hidden flex flex-col justify-between" style={{ backgroundColor: activeTheme.backgroundColor, color: activeTheme.textColor, maxWidth: previewMode === 'mobile' ? '375px' : 'none', margin: '0 auto', width: '100%' }}>
            
            {/* Simulation Header */}
            <div className={`p-4 border-b flex ${activeTheme.headerStyle === 'centered' ? 'flex-col items-center space-y-2' : 'justify-between items-center'} border-neutral-100`}>
              <div className="flex items-center space-x-2 shrink-0">
                {activeTheme.logoUrl ? (
                  <img referrerPolicy="no-referrer" src={activeTheme.logoUrl} alt="Logo preview" className="h-6 w-auto object-contain" />
                ) : (
                  <span className="font-extrabold uppercase font-mono tracking-wider text-xs">ATELIER NOIR</span>
                )}
              </div>
              <div className="flex items-center space-x-3 font-mono text-[9px] uppercase tracking-widest text-[#555] font-semibold">
                <span>Collections</span>
                <span>Journal</span>
                <span>Concierge</span>
              </div>
            </div>

            {/* Simulation Main */}
            <div className="flex-1">
              {activeTheme.enableSlider && activeTheme.sliderBanners.length > 0 ? (
                <div className="relative h-64 bg-neutral-100 overflow-hidden flex items-center justify-center">
                  <img referrerPolicy="no-referrer" src={activeTheme.sliderBanners[0].imageUrl} alt="Slider simulation" className="absolute inset-0 w-full h-full object-cover opacity-80" />
                  <div className="absolute inset-0 bg-black/30"></div>
                  <div className="relative text-center text-white p-4 space-y-2.5 max-w-sm">
                    <h3 className="text-sm sm:text-base font-extrabold tracking-tight font-mono uppercase">{activeTheme.sliderBanners[0].title}</h3>
                    <p className="text-[10px] text-neutral-200">{activeTheme.sliderBanners[0].subtitle}</p>
                    <button
                      className="inline-block px-3.5 py-1.5 text-[10px] font-bold uppercase rounded tracking-wider"
                      style={{ backgroundColor: activeTheme.accentColor, color: '#ffffff' }}
                    >
                      {activeTheme.sliderBanners[0].buttonText}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center font-mono text-neutral-400 text-[10px]">No banner layout slider is enabled. Header connects to the product catalog below directly.</div>
              )}

              {/* Simulation of mock standard catalog cards */}
              <div className="p-4 space-y-3">
                <div className="text-center">
                  <span className="text-[8px] uppercase tracking-widest block font-mono" style={{ color: activeTheme.accentColor }}>Curated highlights</span>
                  <h4 className="text-[11px] font-bold tracking-tight uppercase font-mono">Artisanal Masterworks</h4>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="border rounded overflow-hidden bg-white/50 space-y-1.5 p-2">
                    <div className="h-24 bg-neutral-100 rounded overflow-hidden">
                      <img referrerPolicy="no-referrer" src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300&q=80" alt="Bespoke luxury bag" className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-0.5">
                      <span className="font-bold text-[10px] block font-mono truncate">Tuscan Leather Holdall</span>
                      <strong className="text-[11px] font-mono block">€1,450.00</strong>
                    </div>
                  </div>
                  <div className="border rounded overflow-hidden bg-white/50 space-y-1.5 p-2">
                    <div className="h-24 bg-neutral-100 rounded overflow-hidden">
                      <img referrerPolicy="no-referrer" src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&q=80" alt="Sartorial coat" className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-0.5">
                      <span className="font-bold text-[10px] block font-mono truncate">Architectural Wool Overcoat</span>
                      <strong className="text-[11px] font-mono block">€1,880.00</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Simulation Footer */}
            <div className="p-4 border-t border-neutral-100 bg-neutral-50/50 text-center space-y-1 text-[9px] font-mono">
              <p className="text-neutral-500 leading-relaxed font-bold">{activeTheme.footerText}</p>
              <p className="text-neutral-400 font-mono text-[8px] uppercase tracking-widest">Handmade with precision in Brussels</p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
