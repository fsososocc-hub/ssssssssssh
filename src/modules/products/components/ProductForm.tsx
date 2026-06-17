import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Upload, Sparkles, HelpCircle, Eye, Trash2, 
  Settings, Save, Plus, X, Globe, DollarSign, Archive, CheckCircle2,
  Trash, Info, ChevronRight, Play, FileText, Check, AlertTriangle
} from 'lucide-react';
import { Product } from '../../../types';
import { useProductStore } from '../../../stores/productStore';
import { eventBus } from '../../../services/eventBus';

interface ProductFormProps {
  productToEdit?: Product | null;
  onBack: () => void;
  onSubmit: (formData: any) => void;
}

export default function ProductForm({ productToEdit, onBack, onSubmit }: ProductFormProps) {
  // Check Mode
  const isEditMode = !!productToEdit;

  // 1. Basic Information
  const [title, setTitle] = useState(productToEdit?.title || '');
  const [description, setDescription] = useState(productToEdit?.description || '');
  
  // 2. Media / Image
  const [mediaItems, setMediaItems] = useState<string[]>(productToEdit?.images || ['wallet']);
  const [selectedAsset, setSelectedAsset] = useState<string>(productToEdit?.images?.[0] || 'wallet');
  const [altText, setAltText] = useState('Premium collection hand-crafted leather item');

  // 3. Pricing
  const [price, setPrice] = useState<number>(productToEdit?.price || 120);
  const [compareAtPrice, setCompareAtPrice] = useState<number>(productToEdit?.compareAtPrice || 180);
  const [costPerItem, setCostPerItem] = useState<number>(productToEdit?.costPerItem || 45);
  const [chargeTax, setChargeTax] = useState(true);

  // 4. Inventory, SKU, Locations
  const [sku, setSku] = useState(productToEdit?.sku || `SKU-ATL-${Math.floor(1000 + Math.random() * 9000)}`);
  const [barcode, setBarcode] = useState('4006381333931');
  const [trackInventory, setTrackInventory] = useState(true);
  const [inventoryAtLocations, setInventoryAtLocations] = useState<Record<string, number>>(() => {
    return productToEdit?.inventoryByLocation || {
      'Main Warehouse': productToEdit?.inventory ?? 40,
      'Milan Store': 15,
      'Rome Store': 8
    };
  });

  // 5. Variants Option Manager
  const [optionName, setOptionName] = useState('Color');
  const [optionValuesInput, setOptionValuesInput] = useState('Noir Black, Camel Tan, Forest Green');
  const [variantsGenerated, setVariantsGenerated] = useState<any[]>([]);

  // 6. Shipping & customs
  const [isPhysical, setIsPhysical] = useState(true);
  const [weight, setWeight] = useState(isEditMode ? 0.35 : 0.45);
  const [hsCode, setHsCode] = useState('6104.43');
  const [countryOfOrigin, setCountryOfOrigin] = useState('FR');

  // 7. SEO overrides
  const [seoTitle, setSeoTitle] = useState(productToEdit?.title || '');
  const [seoDescription, setSeoDescription] = useState(productToEdit?.description?.slice(0, 140) || '');
  const [seoUrl, setSeoUrl] = useState(productToEdit?.title ? productToEdit.title.toLowerCase().replace(/\s+/g, '-') : 'luxury-leather-atelier');

  // 8. Organizations
  const [status, setStatus] = useState<'active' | 'draft' | 'archived' | 'suspended' | 'pending_suspension'>(
    (productToEdit?.status as any) || 'active'
  );
  const [vendor, setVendor] = useState(productToEdit?.vendor || 'Atelier Paris');
  const [productType, setProductType] = useState(productToEdit?.type || 'High-End Leather');
  const [collections, setCollections] = useState<string[]>(productToEdit?.collections || ['Default Collection']);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(productToEdit?.tags || ['Atelier', 'Organic', 'Noir']);

  // 9. Metafields
  const [metafieldMaterial, setMetafieldMaterial] = useState('100% Organico Calfskin');
  const [metafieldWashing, setMetafieldWashing] = useState('Professional Leather Clean Only');
  const [metafieldVideo, setMetafieldVideo] = useState('https://youtube.com/watch?v=atelier-bag-process');
  const [metafieldIsNew, setMetafieldIsNew] = useState(true);

  // 10. Publishing Channels
  const [channels, setChannels] = useState({
    onlineStore: true,
    pos: true,
    shopApp: true,
    b2b: false
  });
  const [schedulePublish, setSchedulePublish] = useState(false);
  const [publishDate, setPublishDate] = useState('2026-06-18');
  const [publishTime, setPublishTime] = useState('10:00');

  // Profit/Margin auto counters
  const profit = price - costPerItem;
  const margin = price > 0 ? ((profit / price) * 100).toFixed(1) : '0';

  // Available SVG vector catalog options
  const MOCK_ASSETS = ['wallet', 'bag', 'shoes', 'jewelry', 'coat', 'belt'];

  // Handle Dynamic Variants generation
  useEffect(() => {
    if (!optionValuesInput.trim()) {
      setVariantsGenerated([]);
      return;
    }
    const vals = optionValuesInput.split(',').map(v => v.trim()).filter(v => v.length > 0);
    const generated = vals.map((val, idx) => ({
      id: `var-${idx}`,
      optionValue: val,
      sku: `${sku}-${val.substring(0, 3).toUpperCase()}`,
      price: price,
      stock: 15,
      weight: weight
    }));
    setVariantsGenerated(generated);
  }, [optionValuesInput, price, sku, weight]);

  // Sync SEO default on title typing
  const handleTitleChange = (val: string) => {
    setTitle(val);
    setSeoTitle(val);
    setSeoUrl(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
  };

  const handleLocationStockChange = (loc: string, val: number) => {
    setInventoryAtLocations(prev => ({
      ...prev,
      [loc]: Math.max(0, val)
    }));
  };

  const deleteProductLocally = () => {
    if (productToEdit) {
      if (confirm('🔒 您确定要永久删除此商品及其所有 SKU 和多仓库存数据吗？此操作无法撤销。')) {
        eventBus.emit('product:delete-product', productToEdit.id);
        onBack();
      }
    }
  };

  const handleLocalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('⚠️ 请输入商品标题！');
      return;
    }

    // Sum overall inventory from location stock mappings
    const totalInventory = Object.values(inventoryAtLocations).reduce((sum: number, current: any) => sum + Number(current), 0);

    const completeFormObject = {
      title,
      description,
      vendor,
      type: productType,
      status: (status === 'suspended' || status === 'pending_suspension') ? 'draft' : status, // backend storage mapping compatibility
      price,
      compareAtPrice,
      costPerItem,
      sku,
      inventory: totalInventory,
      inventoryByLocation: inventoryAtLocations,
      images: mediaItems,
      collections,
      tags
    };

    onSubmit(completeFormObject);
  };

  // Helper quick add tag
  const handleAddTag = (newTag: string) => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
    }
    setTagInput('');
  };

  return (
    <div className="space-y-6 text-xs max-w-5xl mx-auto pb-12 animate-fadeIn">
      
      {/* 1. Header Control Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-neutral-200 pb-4 gap-4">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onBack}
            className="p-1 px-1.5 hover:bg-neutral-100 rounded text-neutral-500 hover:text-black border border-neutral-200 transition-colors flex items-center space-x-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-mono text-[9px] uppercase font-bold">返回 (Back)</span>
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold font-mono uppercase tracking-wide border border-indigo-100">
                {isEditMode ? '编辑面板 (EDIT MODE)' : '独立上架 (CREATE MODE)'}
              </span>
            </div>
            <h1 className="text-base font-extrabold text-neutral-900 font-mono tracking-tight uppercase mt-0.5">
              {isEditMode ? `编辑: ${productToEdit?.title}` : '创建并上架新品 (New Catalog Entry)'}
            </h1>
          </div>
        </div>

        {/* Action button rows */}
        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          {isEditMode && (
            <button
              type="button"
              onClick={deleteProductLocally}
              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-650 rounded border border-red-200 transition-all font-bold font-mono uppercase tracking-wider flex items-center space-x-1.5 text-[9px]"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>永久下架 (Delete)</span>
            </button>
          )}

          <button
            type="button"
            onClick={onBack}
            className="px-3 py-1.5 hover:bg-neutral-150 text-neutral-600 rounded border border-neutral-300 transition-all font-bold font-mono uppercase tracking-wider text-[9px]"
          >
            取消 (Cancel)
          </button>

          <button
            type="button"
            onClick={handleLocalSubmit}
            className="px-4 py-1.5 bg-neutral-900 hover:bg-black text-white hover:shadow-md rounded transition-all font-bold font-mono uppercase tracking-widest flex items-center space-x-1.5 text-[9px]"
          >
            <Save className="w-3.5 h-3.5" />
            <span>保存变更 (Save Item)</span>
          </button>
        </div>
      </div>

      {/* 2. Primary 2-Column Shopify Grid Architecture */}
      <form onSubmit={handleLocalSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Main specifications (Spans 2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card A: Title & Description */}
          <div className="bg-white border border-[#e3e3e3] rounded-lg p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-mono font-extrabold uppercase tracking-wider border-b border-neutral-100 pb-2 text-neutral-800">
              🏷️ 商品基本信息 (Title & Rich Description)
            </h3>
            
            <div className="space-y-1">
              <label className="block text-[10px] font-mono uppercase font-bold text-neutral-500">
                商品标题 / 检索名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Atelier Soft Merino Cashmere Scarf"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-250 rounded px-3.5 py-2 font-medium text-xs focus:ring-1 focus:ring-black focus:outline-none transition-all"
              />
              <p className="text-[9px] text-neutral-400 font-mono">建议 20-70 汉字或英文字符，有利于搜索引擎 SEO 引流</p>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-mono uppercase font-bold text-neutral-500">
                富文本描述说明 (Product Description)
              </label>
              
              {/* Rich-text simulator bar */}
              <div className="border border-neutral-200 rounded">
                <div className="bg-neutral-50 border-b border-neutral-200 px-3 py-1.5 flex flex-wrap items-center gap-1.5 text-[#555] font-mono text-[10px]">
                  <span className="font-bold cursor-pointer hover:text-black px-1">B</span>
                  <span className="italic cursor-pointer hover:text-black px-1">I</span>
                  <span className="underline cursor-pointer hover:text-black px-1">U</span>
                  <span className="line-through cursor-pointer hover:text-black px-1">S</span>
                  <span className="border-l border-neutral-300 h-3 mx-1"></span>
                  <span className="cursor-pointer hover:text-black font-semibold text-[8px]">H1</span>
                  <span className="cursor-pointer hover:text-black font-semibold text-[8px]">H2</span>
                  <span className="cursor-pointer hover:text-black font-semibold text-[8px]">H3</span>
                  <span className="border-l border-neutral-300 h-3 mx-1"></span>
                  <span>≡ List</span>
                  <span>🔢 Ordered</span>
                  <span className="border-l border-neutral-300 h-3 mx-1"></span>
                  <span className="text-[9px] text-indigo-600 bg-indigo-50 px-1 rounded flex items-center gap-1 cursor-pointer">
                    <Sparkles className="w-2.5 h-2.5" /> Auto-Write AI
                  </span>
                </div>
                
                <textarea
                  placeholder="详细介绍商品亮点：源头选材、设计理念、尺码重量、精致手工细节..."
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white p-3 font-sans text-xs focus:outline-none focus:ring-0 resize-y"
                />
              </div>
            </div>
          </div>

          {/* Card B: Media Assets Loader */}
          <div className="bg-white border border-[#e3e3e3] rounded-lg p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
              <h3 className="text-xs font-mono font-extrabold uppercase tracking-wider text-neutral-800">
                🖼️ 媒体中心 (Media Gallery)
              </h3>
              <span className="text-[9px] text-neutral-400 font-mono">WEBP Optimization</span>
            </div>

            {/* Selector Grid of Preloaded High-Gloss Micro Vector Graphics */}
            <div className="space-y-2">
              <label className="block text-[10px] font-mono uppercase font-bold text-neutral-500">
                选择精品视觉贴纸 (Select Handcrafted Accent Icon)
              </label>
              <div className="grid grid-cols-6 gap-2">
                {MOCK_ASSETS.map((asset) => {
                  const active = mediaItems.includes(asset);
                  return (
                    <button
                      type="button"
                      key={asset}
                      onClick={() => {
                        if (active) {
                          setMediaItems(mediaItems.filter(m => m !== asset));
                        } else {
                          setMediaItems([...mediaItems, asset]);
                        }
                      }}
                      className={`p-2 bg-neutral-50 border rounded flex flex-col items-center gap-1 hover:bg-neutral-100/50 transition-all ${
                        active ? 'border-neutral-900 bg-neutral-100/50 ring-1 ring-black' : 'border-neutral-200'
                      }`}
                    >
                      <span className="capitalize text-[8px] font-bold font-mono text-neutral-500">{asset}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Draped upload mockup */}
            <div className="border border-dashed border-neutral-300 hover:border-black p-6 rounded-lg text-center cursor-pointer transition-all bg-neutral-50/50">
              <Upload className="w-6 h-6 mx-auto text-neutral-400 mb-2" />
              <p className="text-[10px] text-neutral-600 font-mono font-bold">拖动多张高清大图到此上传</p>
              <p className="text-[9px] text-neutral-400 mt-1">支持 JPEG, PNG, WEBP, SVG 格式 (单张最大 20MB)</p>
            </div>

            {/* Current Selected Items Display */}
            {mediaItems.length > 0 && (
              <div className="space-y-2">
                <p className="text-[9px] font-mono text-neutral-400 uppercase font-bold">已挂载商品相册 ({mediaItems.length}张):</p>
                <div className="flex flex-wrap gap-2.5">
                  {mediaItems.map((imgName, index) => (
                    <div 
                      key={index} 
                      onClick={() => setSelectedAsset(imgName)}
                      className={`relative w-14 h-14 border rounded p-1.5 flex items-center justify-center bg-white cursor-pointer ${
                        selectedAsset === imgName ? 'border-black ring-1 ring-black shadow-sm' : 'border-neutral-200 hover:border-neutral-400'
                      }`}
                    >
                      <span className="text-[10px] font-mono capitalize">{imgName.slice(0, 4)}</span>
                      {index === 0 && (
                        <span className="absolute top-0.5 right-0.5 bg-neutral-900 text-[6px] text-white font-mono px-0.5 rounded scale-75">
                          ⭐主
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Card C: Pricing Dynamics */}
          <div className="bg-white border border-[#e3e3e3] rounded-lg p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-mono font-extrabold uppercase tracking-wider border-b border-neutral-100 pb-2 text-neutral-800">
              💶 价格设定 (Pricing Logic)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-mono uppercase font-bold text-neutral-500">
                  当前零售价格 (Price €) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-neutral-500 font-mono">€</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-neutral-50 border border-neutral-250 rounded pl-6 pr-3 py-1.5 text-xs font-mono font-bold focus:ring-1 focus:ring-black focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-mono uppercase font-bold text-neutral-500">
                  原价 / 比较价格 (Compare €)
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-neutral-500 font-mono">€</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="250.00"
                    value={compareAtPrice}
                    onChange={(e) => setCompareAtPrice(Number(e.target.value))}
                    className="w-full bg-neutral-50 border border-neutral-250 rounded pl-6 pr-3 py-1.5 text-xs font-mono text-neutral-500 focus:ring-1 focus:ring-black focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-mono uppercase font-bold text-neutral-500">
                  商品生成成本 (Cost €)
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-neutral-500 font-mono">€</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={costPerItem}
                    onChange={(e) => setCostPerItem(Number(e.target.value))}
                    className="w-full bg-neutral-50 border border-neutral-250 rounded pl-6 pr-3 py-1.5 text-xs font-mono focus:ring-1 focus:ring-black focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Tax toggle */}
            <div className="flex items-center space-x-2 bg-neutral-50 p-2.5 rounded border border-neutral-100">
              <input
                type="checkbox"
                id="chargeTax"
                checked={chargeTax}
                onChange={(e) => setChargeTax(e.target.checked)}
                className="rounded cursor-pointer checked:bg-black checked:border-black accent-black focus:ring-0 focus:outline-none"
              />
              <label htmlFor="chargeTax" className="text-[10px] font-mono select-none cursor-pointer font-bold text-neutral-600">
                对此商品计入增值税或商品税 (Charge taxes on this product)
              </label>
            </div>

            {/* Real-time Profit Margin Counters */}
            <div className="bg-neutral-900 text-white rounded p-3.5 flex items-center justify-between font-mono">
              <div>
                <span className="text-[8px] uppercase text-neutral-400 block tracking-widest font-bold">Atelier Computed Margin</span>
                <span className="text-base font-extrabold select-all">{margin}%</span>
              </div>
              <div className="text-right">
                <span className="text-[8px] uppercase text-neutral-400 block tracking-widest font-bold">Gross Profit (Each)</span>
                <span className="text-sm font-semibold text-emerald-400">€{profit.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Card D: Inventory & Multi-Origin Stock Control */}
          <div className="bg-white border border-[#e3e3e3] rounded-lg p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-mono font-extrabold uppercase tracking-wider border-b border-neutral-100 pb-2 text-neutral-800">
              🏢 仓储货架及多仓配额 (Inventory Settings)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-mono uppercase font-bold text-neutral-500">
                  货号 SKU (Inventory unit code) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BAG-MER-01"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-250 rounded px-3 py-1.5 text-xs font-mono focus:ring-1 focus:ring-black focus:outline-none font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-mono uppercase font-bold text-neutral-500">
                  条形码 Barcode (UPC/EAN/ISBN)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 4006381333931"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-250 rounded px-3 py-1.5 text-xs font-mono focus:ring-1 focus:ring-black focus:outline-none text-neutral-500"
                />
              </div>
            </div>

            {/* Track Inventory switch */}
            <div className="flex items-center justify-between border-t border-neutral-100 pt-3">
              <div className="space-y-0.5">
                <h4 className="font-bold text-[10px] font-mono uppercase text-neutral-700">追踪库存量 (Track Quantity)</h4>
                <p className="text-[9px] text-neutral-400">关闭后购买不限量（适合虚拟数字服务）</p>
              </div>
              <input
                type="checkbox"
                checked={trackInventory}
                onChange={(e) => setTrackInventory(e.target.checked)}
                className="w-8 h-4 rounded cursor-pointer accent-black bg-neutral-100"
              />
            </div>

            {/* Location Mappings */}
            {trackInventory && (
              <div className="space-y-3 pt-2">
                <p className="text-[9px] font-mono text-neutral-400 uppercase font-bold">多物理仓库及门店库存分配 (Quantity at Locations)</p>
                
                <div className="space-y-2 border border-neutral-200 rounded p-3 bg-neutral-50/50">
                  {Object.entries(inventoryAtLocations).map(([locName, qty]) => {
                    const typedQty = qty as number;
                    return (
                      <div key={locName} className="flex items-center justify-between font-mono">
                        <span className="text-[10px] font-bold text-neutral-600">🏬 {locName}</span>
                        <div className="flex items-center space-x-1.5">
                          <button
                            type="button"
                            onClick={() => handleLocationStockChange(locName, typedQty - 1)}
                            className="w-6 h-6 border border-neutral-300 rounded hover:bg-neutral-150 flex items-center justify-center font-bold text-neutral-600 active:scale-95"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={typedQty}
                            onChange={(e) => handleLocationStockChange(locName, Number(e.target.value))}
                            className="w-16 text-center border border-neutral-300 bg-white rounded py-0.5 font-bold text-xs focus:ring-1 focus:ring-black"
                          />
                          <button
                            type="button"
                            onClick={() => handleLocationStockChange(locName, typedQty + 1)}
                            className="w-6 h-6 border border-neutral-300 rounded hover:bg-neutral-150 flex items-center justify-center font-bold text-neutral-600 active:scale-95"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Card E: Advanced Variant Option Generator */}
          <div className="bg-white border border-[#e3e3e3] rounded-lg p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
              <h3 className="text-xs font-mono font-extrabold uppercase tracking-wider text-neutral-800">
                🧬 多规格多属性组合 (Product Variants)
              </h3>
              <span className="text-[9px] text-indigo-600 font-mono bg-indigo-50 px-1.5 py-0.5 rounded font-bold border border-indigo-150">
                Max 100 Variants
              </span>
            </div>

            <div className="bg-neutral-50 border border-neutral-150 p-4 rounded-lg space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block text-[9px] font-mono uppercase font-bold text-neutral-400">选项维度 (Option Name)</label>
                  <select
                    value={optionName}
                    onChange={(e) => setOptionName(e.target.value)}
                    className="w-full bg-white border border-neutral-300 rounded p-1.5 text-xs"
                  >
                    <option value="Color">颜色 (Color)</option>
                    <option value="Size">尺码 (Size)</option>
                    <option value="Material">材质 (Material)</option>
                    <option value="Style">款式 (Style)</option>
                  </select>
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="block text-[9px] font-mono uppercase font-bold text-neutral-400">多个规格值 (Comma Separated Values)</label>
                  <input
                    type="text"
                    value={optionValuesInput}
                    onChange={(e) => setOptionValuesInput(e.target.value)}
                    placeholder="e.g. Noir Black, Camel Tan, Forest Green"
                    className="w-full bg-white border border-neutral-300 rounded px-3 py-1.5 text-xs font-mono"
                  />
                  <p className="text-[8px] text-neutral-400 font-mono">键入英文逗号分隔，下方实时生成组合对账网格</p>
                </div>
              </div>
            </div>

            {/* Variants table */}
            {variantsGenerated.length > 0 && (
              <div className="space-y-2">
                <p className="text-[9px] font-mono text-neutral-400 uppercase font-bold">自动生成的规格列表 ({variantsGenerated.length}个组合):</p>
                <div className="border border-neutral-200 rounded overflow-x-auto">
                  <table className="w-full max-w-full text-left border-collapse font-mono text-[10px]">
                    <thead className="bg-[#f0f0f0] border-b border-neutral-200">
                      <tr>
                        <th className="p-2 py-1.5 font-bold">尺寸规格/组合</th>
                        <th className="p-2 py-1.5 font-bold">独立价格 (€)</th>
                        <th className="p-2 py-1.5 font-bold">SKU 货号</th>
                        <th className="p-2 py-1.5 font-bold">配额库存 (pcs)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 bg-white">
                      {variantsGenerated.map((v, i) => (
                        <tr key={v.id} className="hover:bg-neutral-50/50">
                          <td className="p-2 font-bold text-neutral-800">{v.optionValue}</td>
                          <td className="p-1.5">
                            <input
                              type="number"
                              defaultValue={v.price}
                              className="w-16 border border-neutral-250 bg-neutral-55/40 rounded px-1.5 py-0.5 text-[10px] font-bold"
                            />
                          </td>
                          <td className="p-1.5">
                            <input
                              type="text"
                              defaultValue={v.sku}
                              className="w-24 border border-neutral-250 bg-neutral-55/40 px-1.5 py-0.5 text-[9px] font-mono text-neutral-500"
                            />
                          </td>
                          <td className="p-1.5">
                            <input
                              type="number"
                              defaultValue={v.stock}
                              className="w-12 border border-neutral-250 bg-neutral-55/40 rounded px-1 text-[10px]"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Card F: Weight & HS Code Freight Customs */}
          <div className="bg-white border border-[#e3e3e3] rounded-lg p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-mono font-extrabold uppercase tracking-wider border-b border-neutral-100 pb-2 text-neutral-800">
              📦 物流配运及海关税则 (Shipping Specifications)
            </h3>

            <div className="flex items-center space-x-2 bg-neutral-50 p-2 rounded border border-neutral-150">
              <input
                type="checkbox"
                id="isPhysical"
                checked={isPhysical}
                onChange={(e) => setIsPhysical(e.target.checked)}
                className="rounded cursor-pointer checked:bg-black checked:border-black accent-black focus:ring-0"
              />
              <label htmlFor="isPhysical" className="text-[10px] font-mono select-none cursor-pointer font-bold text-neutral-600">
                本商品为实体货品，需出库物流包裹 (This is a physical product)
              </label>
            </div>

            {isPhysical && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono uppercase font-bold text-neutral-500">产品毛重 (Weight kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full bg-neutral-50 border border-neutral-250 rounded px-3 py-1.5 text-xs font-mono focus:ring-1 focus:ring-black focus:outline-none"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono uppercase font-bold text-neutral-500">海关税则 HS Code</label>
                  <input
                    type="text"
                    value={hsCode}
                    onChange={(e) => setHsCode(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-250 rounded px-3 py-1.5 text-xs font-mono focus:ring-1 focus:ring-black focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono uppercase font-bold text-neutral-500">原产国家/地区 (Origin)</label>
                  <select
                    value={countryOfOrigin}
                    onChange={(e) => setCountryOfOrigin(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-250 rounded p-1.5 text-xs font-mono cursor-pointer focus:ring-1 focus:ring-black"
                  >
                    <option value="FR">France (法国 FR)</option>
                    <option value="CN">China (中国 CN)</option>
                    <option value="IT">Italy (意大利 IT)</option>
                    <option value="US">USA (美国 US)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Card G: Search Engine Optimization overrides (SEO) */}
          <div className="bg-white border border-[#e3e3e3] rounded-lg p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-mono font-extrabold uppercase tracking-wider border-b border-neutral-100 pb-2 text-neutral-800">
              🌐 搜索引擎前台预览 (SEO Metadata Editor)
            </h3>
            
            {/* Google snippet view */}
            <div className="bg-[#fcfcfc] border border-neutral-200 rounded p-4 font-sans text-xs space-y-1">
              <span className="text-[10px] text-neutral-400 block font-mono">Google Web Snippet:</span>
              <h4 className="text-indigo-800 font-medium text-sm leading-tight hover:underline cursor-pointer">
                {seoTitle || 'Luxury Product Atelier'} | {vendor}
              </h4>
              <span className="text-emerald-800 text-[10px] font-mono block">
                https://atelier.noir/products/{seoUrl || 'product-slug'}
              </span>
              <p className="text-neutral-500 text-[11px] leading-relaxed">
                {seoDescription || '精致无华的高级皮革艺术、卓越的设计理念、极致苛求的用料与无可挑剔的剪裁缝纫。立刻咨询查看最新系列...'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="uppercase font-bold text-neutral-500">自定义网页标题 (SEO Title Override)</span>
                  <span className="text-neutral-400 text-[8px]">{seoTitle.length}/70</span>
                </div>
                <input
                  type="text"
                  maxLength={70}
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-250 rounded px-3 py-1.5 text-xs focus:ring-1 focus:ring-black focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="uppercase font-bold text-neutral-500">静态链接别名 (SEO Slug Override)</span>
                  <span className="text-neutral-400 text-[8px]">Clean URL</span>
                </div>
                <input
                  type="text"
                  value={seoUrl}
                  onChange={(e) => setSeoUrl(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  className="w-full bg-neutral-50 border border-neutral-250 rounded px-3 py-1.5 text-xs font-mono focus:ring-1 focus:ring-black focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="uppercase font-bold text-neutral-500">自定义元摘要 (SEO Meta Description)</span>
                <span className="text-neutral-400 text-[8px]">{seoDescription.length}/160</span>
              </div>
              <textarea
                rows={2}
                maxLength={160}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="撰写160字内的元描述，提供简洁明确的高点击率文案..."
                className="w-full bg-neutral-50 border border-neutral-250 rounded px-3 py-1.5 text-xs focus:ring-1 focus:ring-black focus:outline-none"
              />
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Sidebar (Spans 1 column) */}
        <div className="space-y-6">
          
          {/* Card Alpha: Product Status */}
          <div className="bg-white border border-[#e3e3e3] rounded-lg p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-mono font-extrabold uppercase tracking-wider border-b border-neutral-100 pb-2 text-neutral-800">
              🚥 商品上架状态 (Product Status)
            </h3>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2.5">
                <input
                  type="radio"
                  name="productStatus"
                  id="statusActive"
                  checked={status === 'active'}
                  onChange={() => setStatus('active')}
                  className="accent-black cursor-pointer"
                />
                <label htmlFor="statusActive" className="font-bold flex items-center gap-1.5 cursor-pointer">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-emerald-600 block"></span>
                  <span>上架销售 (Active)</span>
                </label>
              </div>

              <div className="flex items-center space-x-2.5">
                <input
                  type="radio"
                  name="productStatus"
                  id="statusDraft"
                  checked={status === 'draft'}
                  onChange={() => setStatus('draft')}
                  className="accent-black cursor-pointer"
                />
                <label htmlFor="statusDraft" className="font-medium text-neutral-600 flex items-center gap-1.5 cursor-pointer">
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-400 border border-zinc-500 block"></span>
                  <span>存入草稿 (Draft)</span>
                </label>
              </div>

              <div className="flex items-center space-x-2.5">
                <input
                  type="radio"
                  name="productStatus"
                  id="statusArchived"
                  checked={status === 'archived'}
                  onChange={() => setStatus('archived')}
                  className="accent-black cursor-pointer"
                />
                <label htmlFor="statusArchived" className="font-medium text-amber-600 flex items-center gap-1.5 cursor-pointer">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-amber-600 block"></span>
                  <span>归档不扣减 (Archived)</span>
                </label>
              </div>

              <div className="flex items-center space-x-2.5">
                <input
                  type="radio"
                  name="productStatus"
                  id="statusSuspended"
                  checked={status === 'suspended'}
                  onChange={() => setStatus('suspended')}
                  className="accent-black cursor-pointer"
                />
                <label htmlFor="statusSuspended" className="font-medium text-rose-600 flex items-center gap-1.5 cursor-pointer">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 border border-rose-600 block animate-pulse"></span>
                  <span>违规下架 (Suspended)</span>
                </label>
              </div>
            </div>
            
            {status === 'suspended' && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-750 rounded text-[10px] font-mono leading-relaxed">
                🚨 Shopify 直接介入暂停交易：此变体检测涉侵权或合规疑虑，请修改资料申诉上级。
              </div>
            )}
          </div>

          {/* Card Beta: Publishing Channels with scheduler */}
          <div className="bg-white border border-[#e3e3e3] rounded-lg p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-mono font-extrabold uppercase tracking-wider border-b border-neutral-100 pb-2 text-neutral-800">
              📢 销售渠道分发 (Publishing Channels)
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="chanOnline"
                    checked={channels.onlineStore}
                    onChange={(e) => setChannels({ ...channels, onlineStore: e.target.checked })}
                    className="rounded accent-black"
                  />
                  <label htmlFor="chanOnline" className="font-mono font-bold text-neutral-700 cursor-pointer select-none">🌐 在线网店 (Online Store)</label>
                </div>
                <span className="text-[8px] font-mono text-emerald-600 bg-emerald-50 px-1 rounded">Live</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="chanPOS"
                    checked={channels.pos}
                    onChange={(e) => setChannels({ ...channels, pos: e.target.checked })}
                    className="rounded accent-black"
                  />
                  <label htmlFor="chanPOS" className="font-mono font-bold text-neutral-700 cursor-pointer select-none">🏪 POS 实体收银 (Atelier Point)</label>
                </div>
                <span className="text-[8px] font-mono text-emerald-600 bg-emerald-50 px-1 rounded">Live</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="chanShop"
                    checked={channels.shopApp}
                    onChange={(e) => setChannels({ ...channels, shopApp: e.target.checked })}
                    className="rounded accent-black"
                  />
                  <label htmlFor="chanShop" className="font-mono font-bold text-neutral-700 cursor-pointer select-none">📱 Shop App 移动店面</label>
                </div>
                <span className="text-[8px] font-mono text-neutral-400 bg-neutral-100 px-1 rounded">Pre-Listed</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="chanB2B"
                    checked={channels.b2b}
                    onChange={(e) => setChannels({ ...channels, b2b: e.target.checked })}
                    className="rounded accent-black"
                  />
                  <label htmlFor="chanB2B" className="font-mono font-bold text-neutral-700 cursor-pointer select-none">💼 B2B 批发客户专属</label>
                </div>
                <span className="text-[8px] font-mono text-neutral-400 bg-neutral-100 px-1 rounded">In Bulk</span>
              </div>
            </div>

            {/* Timed Scheduling */}
            <div className="border-t border-neutral-150 pt-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="font-bold text-[10px] font-mono uppercase text-neutral-700">定时预约发布 (Timed Publishing)</h4>
                  <p className="text-[9px] text-neutral-400 font-mono">仅在 Active 状态生效</p>
                </div>
                <input
                  type="checkbox"
                  checked={schedulePublish}
                  onChange={(e) => setSchedulePublish(e.target.checked)}
                  className="rounded cursor-pointer accent-black"
                />
              </div>

              {schedulePublish && (
                <div className="grid grid-cols-2 gap-2 bg-neutral-50 p-2.5 rounded border border-neutral-200">
                  <input
                    type="date"
                    value={publishDate}
                    onChange={(e) => setPublishDate(e.target.value)}
                    className="bg-white border border-neutral-300 p-1 rounded text-[10px] font-mono"
                  />
                  <input
                    type="time"
                    value={publishTime}
                    onChange={(e) => setPublishTime(e.target.value)}
                    className="bg-white border border-neutral-300 p-1 rounded text-[10px] font-mono"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Card Gamma: Product Organization */}
          <div className="bg-white border border-[#e3e3e3] rounded-lg p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-mono font-extrabold uppercase tracking-wider border-b border-neutral-100 pb-2 text-neutral-800">
              📦 品类归口与标签 (Organization)
            </h3>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="block text-[10px] font-mono uppercase font-bold text-neutral-500">产品大类 (Type)</label>
                <select
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-250 rounded p-1.5 text-xs font-mono cursor-pointer"
                >
                  <option value="High-End Leather">High-End Leather (奢华皮革)</option>
                  <option value="Artisan Ceramic">Artisan Ceramic (手作瓷器)</option>
                  <option value="Eco Homeware">Eco Homeware (环境友好居家)</option>
                  <option value="Fragrance Accent">Fragrance Accent (小众沙龙香氛)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-mono uppercase font-bold text-neutral-500">主创供应商 / 品牌商 (Vendor)</label>
                <input
                  type="text"
                  placeholder="e.g. Atelier Paris"
                  value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-250 rounded px-3 py-1.5 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-mono uppercase font-bold text-neutral-500">归纳产品系列 (Collections)</label>
                <select
                  multiple
                  value={collections}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, (option: any) => option.value);
                    setCollections(values);
                  }}
                  className="w-full bg-neutral-50 border border-neutral-250 rounded p-1.5 text-xs font-mono h-20"
                >
                  <option value="Home Screen Products">首页推广专区 (Home Feature)</option>
                  <option value="Summer Accent Collection">盛夏新风沙龙 (Summer Accent)</option>
                  <option value="Limited Handcraft 2026">限量非遗手工秀场 (2026 Vintage)</option>
                  <option value="Default Collection">默认通货专区 (Standard)</option>
                </select>
                <p className="text-[8px] text-neutral-400 font-mono">按住 Ctrl/Cmd 键可以选中多个系列</p>
              </div>

              {/* Tags Manager with pill pools */}
              <div className="space-y-1.5 border-t border-neutral-100 pt-3">
                <label className="block text-[10px] font-mono uppercase font-bold text-neutral-500">标签分组管理 (Tags Pool)</label>
                
                {/* Active Tags */}
                <div className="flex flex-wrap gap-1">
                  {tags.map((tag) => (
                    <span 
                      key={tag} 
                      className="bg-neutral-900 text-white font-mono text-[9px] px-2 py-0.5 rounded-full flex items-center space-x-1"
                    >
                      <span>{tag}</span>
                      <button 
                        type="button" 
                        onClick={() => setTags(tags.filter(t => t !== tag))} 
                        className="hover:text-red-300 ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex space-x-1.5">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="New tag..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag(tagInput.trim());
                      }
                    }}
                    className="flex-1 bg-neutral-50 border border-neutral-250 rounded px-2.5 py-1 text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddTag(tagInput.trim())}
                    className="bg-neutral-800 text-white font-mono font-bold text-[9px] uppercase px-2.5 rounded hover:bg-black active:scale-95"
                  >
                    Add
                  </button>
                </div>

                {/* Quick Add Pill Reservoir */}
                <div className="space-y-1 mt-2">
                  <p className="text-[8px] font-mono text-neutral-400 uppercase font-bold">快速挑选推荐常态标签：</p>
                  <div className="flex flex-wrap gap-1">
                    {['Summer Selected', 'Atelier Pure', 'Bestseller', 'Limited Edition', 'Imported Silk', 'Calfskin'].map((qp) => {
                      if (tags.includes(qp)) return null;
                      return (
                        <button
                          type="button"
                          key={qp}
                          onClick={() => handleAddTag(qp)}
                          className="bg-neutral-100 border border-neutral-250 hover:border-black text-neutral-600 px-2 py-0.5 rounded-full text-[8.5px] font-mono active:scale-95 transition-all"
                        >
                          + {qp}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card Delta: Metadata Metafields Schema */}
          <div className="bg-white border border-[#e3e3e3] rounded-lg p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-mono font-extrabold uppercase tracking-wider border-b border-neutral-100 pb-2 text-neutral-800">
              🧪 自定义元字段属性 (Metafields)
            </h3>

            <div className="space-y-3 font-mono text-[10px]">
              <div className="space-y-1">
                <span className="text-neutral-400 block text-[9.5px] uppercase">材质成分 (custom.material)</span>
                <input
                  type="text"
                  value={metafieldMaterial}
                  onChange={(e) => setMetafieldMaterial(e.target.value)}
                  className="w-full bg-neutral-55 border border-neutral-200 rounded px-2 py-1 text-xs"
                />
              </div>

              <div className="space-y-1">
                <span className="text-neutral-400 block text-[9.5px] uppercase">洗涤养护说明 (custom.care)</span>
                <input
                  type="text"
                  value={metafieldWashing}
                  onChange={(e) => setMetafieldWashing(e.target.value)}
                  className="w-full bg-neutral-55 border border-neutral-200 rounded px-2 py-1 text-xs"
                />
              </div>

              <div className="space-y-1">
                <span className="text-neutral-400 block text-[9.5px] uppercase">工艺宣传视频 (custom.video_url)</span>
                <input
                  type="text"
                  value={metafieldVideo}
                  onChange={(e) => setMetafieldVideo(e.target.value)}
                  className="w-full bg-neutral-55 border border-neutral-200 rounded px-2 py-1 text-xs text-indigo-700"
                />
              </div>

              <div className="flex items-center justify-between border-t border-neutral-100 pt-2.5">
                <span className="text-neutral-400 text-[9.5px] uppercase">新品勋章标识 (custom.badge_new)</span>
                <input
                  type="checkbox"
                  checked={metafieldIsNew}
                  onChange={(e) => setMetafieldIsNew(e.target.checked)}
                  className="rounded cursor-pointer accent-black"
                />
              </div>
            </div>
          </div>

        </div>

      </form>
      
    </div>
  );
}
