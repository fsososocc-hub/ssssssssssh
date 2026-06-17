import React, { useState, useMemo } from 'react';
import { 
  Search, Package, Eye, Share2, Copy, Check, X, Tag, ShoppingCart, ArrowUpRight, Barcode
} from 'lucide-react';
import { useProductStore } from '../../stores/productStore';
import { Product } from '../../types';
import { MOCK_PRODUCT_SVGS } from '../../data/mockData';

interface POSProductListProps {
  onSelectProduct: (product: Product) => void;
}

export default function POSProductList({ onSelectProduct }: POSProductListProps) {
  const products = useProductStore((state) => state.products);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('全部');
  
  // 选中的放大预览商品及分享反馈状态
  const [zoomedProduct, setZoomedProduct] = useState<Product | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // 提取产品中的所有唯一分类
  const categories = useMemo(() => {
    const types = new Set<string>();
    products.forEach((p) => {
      if (p.type) types.add(p.type);
    });
    return ['全部', ...Array.from(types)];
  }, [products]);

  // 按分类和搜索条件过滤有效商品
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (p.status !== 'active') return false;
      const matchesCategory = activeCategory === '全部' || p.type === activeCategory;
      const matchesSearch = 
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.vendor && p.vendor.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, searchTerm]);

  // 复制/分享单品链接
  const handleShareProduct = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止触发卡片点击弹出层
    const rawLink = `${window.location.origin}/products/${product.id}?ref=pos_retail`;
    navigator.clipboard.writeText(rawLink).then(() => {
      setCopiedId(product.id);
      showToast(`已成功复制《${product.title}》的商户专属单品推广链接`);
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(() => {
      showToast('分享复制失败，请重试');
    });
  };

  return (
    <div className="bg-white border border-[#E1E3E5] rounded-xl flex flex-col overflow-hidden h-full">
      {/* 消息提示框 */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-neutral-900 border border-neutral-800 text-[#07C2E3] px-4 py-2 rounded-lg shadow-xl z-55 flex items-center space-x-2 text-xs font-mono">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 搜索过滤与分类筛选头部 */}
      <div className="p-4 border-b border-[#F1F2F4] bg-neutral-50 flex flex-col md:flex-row gap-3 justify-between items-center">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="在库条码、SKU、商品名、品牌商..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#D1D5DB] hover:border-[#1a1a1a] focus:border-[#07C2E3] rounded-lg text-xs outline-none text-neutral-800 placeholder-neutral-400 transition-colors"
          />
        </div>

        {/* 分类切换 */}
        <div className="flex gap-1 overflow-x-auto w-full md:w-auto scrollbar-none pb-1 md:pb-0 justify-start">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeCategory === cat
                  ? 'bg-neutral-900 text-white border border-neutral-900 shadow-xs'
                  : 'bg-white border border-[#E1E3E5] text-neutral-600 hover:border-neutral-400 hover:text-neutral-950'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 响应式 Shopify-Card 风格商品列表 */}
      <div className="p-4 overflow-y-auto max-h-[520px] flex-1 bg-neutral-50/30">
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center text-neutral-400">
            <Package className="w-12 h-12 mb-3 text-neutral-300" />
            <p className="text-xs font-bold text-neutral-600">未找到符合搜索条件的在库商品</p>
            <p className="text-[10px] text-neutral-400 mt-1">请重试检索或使用现场追加款项商品功能</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((p) => {
              const mediaKey = p.images[0] as keyof typeof MOCK_PRODUCT_SVGS;
              return (
                <div
                  key={p.id}
                  onClick={() => setZoomedProduct(p)}
                  className="bg-white border border-[#E1E3E5] hover:border-[#07C2E3] rounded-xl flex flex-col justify-between overflow-hidden cursor-pointer transition-all hover:shadow-md group relative h-[252px]"
                >
                  {/* 分类与状态浮层 */}
                  <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
                    <span className="text-[9px] font-mono font-bold text-white bg-black/80 backdrop-blur-xs px-2 py-0.5 rounded-md tracking-wider">
                      {p.type}
                    </span>
                  </div>

                  {/* 快捷操作浮层 */}
                  <div className="absolute top-2.5 right-2.5 z-10 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      type="button"
                      onClick={(e) => handleShareProduct(p, e)}
                      className="w-7 h-7 bg-white hover:bg-[#F9FAFB] border border-[#E1E3E5] text-neutral-700 hover:text-[#07C2E3] rounded-lg flex items-center justify-center transition-all shadow-sm cursor-pointer"
                      title="分享商品及专属连结"
                    >
                      {copiedId === p.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setZoomedProduct(p);
                      }}
                      className="w-7 h-7 bg-white hover:bg-[#F9FAFB] border border-[#E1E3E5] text-neutral-700 hover:text-black rounded-lg flex items-center justify-center transition-all shadow-sm cursor-pointer"
                      title="放大预览多仓数据"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* 商品卡片主视觉缩略图 */}
                  <div className="bg-neutral-50 h-32 flex items-center justify-center p-4 border-b border-[#F1F2F4] relative group-hover:bg-neutral-100/50 transition-colors select-none shrink-0">
                    <div 
                      className="w-16 h-16 [&>svg]:w-full [&>svg]:h-full flex items-center justify-center"
                      dangerouslySetInnerHTML={{ __html: MOCK_PRODUCT_SVGS[mediaKey] || MOCK_PRODUCT_SVGS['wallet'] }}
                    />
                  </div>

                  {/* 属性信息排版 (Shopify Style) */}
                  <div className="p-3.5 flex-1 flex flex-col justify-between">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-neutral-400 font-sans tracking-wide">
                        {p.vendor || 'AI COMMERCE SA'}
                      </span>
                      <h4 className="text-xs font-bold text-neutral-900 group-hover:text-[#07C2E3] transition-colors line-clamp-1 leading-snug">
                        {p.title}
                      </h4>
                      <p className="text-[10px] text-neutral-400 font-mono flex items-center gap-1">
                        <Barcode className="w-3 h-3 text-neutral-300" />
                        <span>S: {p.sku || 'N/A'}</span>
                      </p>
                    </div>

                    <div className="pt-2 mt-2 border-t border-dashed border-[#F1F2F4] flex justify-between items-center bg-white">
                      <div>
                        <span className="text-xs font-mono font-bold text-neutral-900">
                          € {p.price.toFixed(2)}
                        </span>
                      </div>

                      {/* 进购物车按钮 */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProduct(p);
                        }}
                        className="py-1 px-2.5 bg-neutral-900 hover:bg-[#07C2E3] hover:text-black text-white text-[10px] font-bold rounded-lg flex items-center gap-1 transition-all group-hover:shadow-xs cursor-pointer"
                      >
                        <ShoppingCart className="w-3 h-3" />
                        <span>＋ 收单</span>
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 商品点开放大预览及多维度盘货分享模态层 (Zoom Preview Modal) */}
      {zoomedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-white border-2 border-neutral-900 rounded-xl max-w-lg w-full overflow-hidden shadow-2xl animate-scaleIn">
            
            {/* 顶栏信息 */}
            <div className="p-4 border-b border-[#F1F2F4] bg-neutral-50 flex justify-between items-center">
              <span className="text-[10px] font-mono font-extrabold text-[#07C2E3] bg-[#07C2E3]/10 border border-[#07C2E3]/25 px-2.5 py-1 rounded">
                在库商品卡片详情 [SKU: {zoomedProduct.sku || 'N/A'}]
              </span>
              <button 
                onClick={() => setZoomedProduct(null)}
                className="text-neutral-400 hover:text-black p-1 hover:bg-neutral-100 rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 内容区 */}
            <div className="p-6 space-y-5">
              <div className="flex gap-4 items-start">
                
                {/* 左侧大图 */}
                <div className="w-24 h-24 bg-neutral-50 border border-[#E1E3E5] rounded-xl flex items-center justify-center shrink-0 p-3 select-none">
                  <div 
                    className="w-16 h-16 [&>svg]:w-full [&>svg]:h-full"
                    dangerouslySetInnerHTML={{ __html: MOCK_PRODUCT_SVGS[zoomedProduct.images[0] as keyof typeof MOCK_PRODUCT_SVGS] || MOCK_PRODUCT_SVGS['wallet'] }}
                  />
                </div>

                {/* 右侧规格 */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{zoomedProduct.vendor}</span>
                    <span className="text-[10px] text-neutral-300">•</span>
                    <span className="text-[10px] font-bold text-neutral-500">{zoomedProduct.type}</span>
                  </div>
                  <h3 className="text-sm font-extrabold text-neutral-900 leading-tight">
                    {zoomedProduct.title}
                  </h3>
                  <div className="text-sm font-mono font-black text-[#07C2E3]">
                    € {zoomedProduct.price.toFixed(2)} EUR
                  </div>
                  <p className="text-[11px] text-neutral-500 leading-relaxed">
                    {zoomedProduct.description || '暂无为此商品配置前台说明信息。库存周转处于充足良好运转状态。'}
                  </p>
                </div>

              </div>

              {/* 多仓详情及当前库存 */}
              <div className="p-4 bg-neutral-50/80 rounded-xl border border-[#E1E3E5] space-y-2.5">
                <div className="flex justify-between items-center text-xs text-neutral-700">
                  <span className="font-bold flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-[#07C2E3]" />
                    在库多储位库存盘点汇总 (Storage Stock)
                  </span>
                  <span className="font-mono font-bold text-neutral-900 bg-neutral-200 px-2 py-0.5 rounded text-[10px]">
                    总库存: {zoomedProduct.inventory} 件
                  </span>
                </div>

                <div className="divide-y divide-neutral-200 pt-1 text-[11px] text-neutral-600 font-mono">
                  {zoomedProduct.inventoryByLocation ? (
                    Object.entries(zoomedProduct.inventoryByLocation).map(([loc, qty]) => (
                      <div key={loc} className="flex justify-between py-1.5 first:pt-0 last:pb-0">
                        <span className="font-sans text-neutral-500 font-medium">{loc}</span>
                        <span className="font-bold text-neutral-800">{qty} 件</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex justify-between py-1.5">
                      <span className="font-sans text-neutral-500">主仓库 (默认货箱储位)</span>
                      <span className="font-bold text-neutral-800">{zoomedProduct.inventory} 件</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 生成推广码、分销、发送单品板块 */}
              <div className="space-y-2">
                <span className="block text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest">
                  单品跨渠道分销与分享 (Distribute Link)
                </span>
                
                <div className="flex gap-2">
                  <div className="bg-neutral-100 border border-neutral-200 text-neutral-600 text-xs px-3 py-2 rounded-lg flex-1 truncate select-all font-mono">
                    {window.location.origin}/products/{zoomedProduct.id}?ref=pos_retail
                  </div>
                  
                  <button
                    type="button"
                    onClick={(e) => {
                      const shareLink = `${window.location.origin}/products/${zoomedProduct.id}?ref=pos_retail`;
                      navigator.clipboard.writeText(shareLink).then(() => {
                        showToast(`已成功复制推广链接：${zoomedProduct.title}`);
                      });
                    }}
                    className="bg-neutral-900 hover:bg-black text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 text-[#07C2E3]" />
                    <span>一键分获</span>
                  </button>
                </div>
              </div>

            </div>

            {/* 底底操作栏 */}
            <div className="p-4 border-t border-[#F1F2F4] bg-neutral-50 flex gap-2">
              <button
                type="button"
                onClick={() => setZoomedProduct(null)}
                className="flex-1 py-2 text-xs border border-[#D1D5DB] hover:bg-white rounded-lg font-bold text-neutral-600 transition-colors cursor-pointer text-center"
              >
                关闭预览
              </button>
              
              <button
                type="button"
                onClick={() => {
                  onSelectProduct(zoomedProduct);
                  setZoomedProduct(null);
                  showToast(`已将《${zoomedProduct.title}》追加至本次付款详单中`);
                }}
                className="flex-1 py-2 bg-[#07C2E3] hover:bg-[#06B2D0] active:bg-[#059BBC] text-black rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>立即拉入收银篮</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
