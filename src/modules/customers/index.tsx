import React, { useState, useEffect } from 'react';
import { useCustomerStore } from '../../stores/customerStore';
import { useLayoutStore } from '../../stores/layoutStore';
import { usePanelStore } from '../../stores/panelStore';
import { useShopStore } from '../../stores/shopStore';
import { Customer } from '../../types';
import { CustomerEvents, NotificationEvents, eventBus } from '../../events';
import { customerSchemaMeta } from '../../schemas';
import DataGrid from '../../components/ui/DataGrid';
import { CustomerService } from '../../services/customer.service';

// Modular Subviews
import CustomersHeader from './components/CustomersHeader';
import CustomersTabs from './components/CustomersTabs';
import CustomerForm from './components/CustomerForm';
import CustomerDetailView from './components/CustomerDetailView';
import SegmentView from './components/SegmentView';
import CompanyView from './components/CompanyView';

// Icons
import { 
  Users2, Sparkles, Building2, Search, Filter, Trash2, 
  Tag, Download, CheckCircle, RefreshCcw, UserPlus 
} from 'lucide-react';

export default function CustomersView() {
  const { customers, customerFilter, setCustomerFilter, addCustomer, updateCustomer, deleteCustomer } = useCustomerStore();
  const { currentTab, setCurrentTab } = useLayoutStore();
  const { togglePreview } = usePanelStore();
  const { settings } = useShopStore();

  // Root CRM workspaces tabs
  // 'list' | 'segments' | 'companies'
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'list' | 'segments' | 'companies'>('list');

  // Active detail page route (null if not inspecting a single customer deep profile)
  const [activeDeepCustomerId, setActiveDeepCustomerId] = useState<string | null>(null);

  // Creating manual customer state
  const [isCreating, setIsCreating] = useState(false);

  // Advanced Filtering local states
  const [spentMin, setSpentMin] = useState<string>('');
  const [ordersMin, setOrdersMin] = useState<string>('');
  const [cityFilter, setCityFilter] = useState<string>('');
  const [tagFilter, setTagFilter] = useState<string>('');
  const [searchString, setSearchString] = useState<string>('');

  // Row selection for batch operations
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBatchTools, setShowBatchTools] = useState(false);
  const [batchTagInput, setBatchTagInput] = useState('');

  const currencySymbol = settings.currencySymbol || '€';

  // Synchronize dynamic rail tab selected from LHS to this view tab
  useEffect(() => {
    if (currentTab === 'segments') {
      setActiveWorkspaceTab('segments');
    } else if (currentTab === 'customers') {
      setActiveWorkspaceTab('list');
    }
  }, [currentTab]);

  // Master customer filtered collection
  const filteredCustomers = customers.filter((c) => {
    // Left-sidebar segment filters mapper
    if (customerFilter !== 'All' && c.segment !== customerFilter) return false;

    // Advanced Input selectors matching criteria:
    if (spentMin && (c.totalSpent < parseFloat(spentMin))) return false;
    if (ordersMin && (c.ordersCount < parseInt(ordersMin))) return false;
    if (cityFilter && c.addresses && !c.addresses.some(a => a.city.toLowerCase().includes(cityFilter.toLowerCase()))) return false;
    if (tagFilter && (!c.tags || !c.tags.some(t => t.toLowerCase() === tagFilter.toLowerCase().trim()))) return false;

    // Text search query index
    if (searchString) {
      const query = searchString.toLowerCase();
      const matchName = `${c.firstName} ${c.lastName}`.toLowerCase().includes(query);
      const matchEmail = c.email.toLowerCase().includes(query);
      const matchPhone = c.phone?.toLowerCase().includes(query) || false;
      const matchCompany = c.company?.toLowerCase().includes(query) || false;
      const matchNotes = c.notes?.toLowerCase().includes(query) || false;
      
      if (!matchName && !matchEmail && !matchPhone && !matchCompany && !matchNotes) return false;
    }

    return true;
  });

  const handleCreateSubmit = async (formData: any) => {
    const freshCustomer: Customer = {
      id: `cust-${Date.now()}`,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone || '',
      ordersCount: 0,
      totalSpent: 0,
      tags: ['manual-add'],
      segment: formData.segment || 'All',
      company: formData.company || '',
      notes: formData.notes || '',
      addresses: [
        { id: `addr-new-${Date.now()}`, isDefault: true, addressLines: 'Core Street 1', city: 'Milan', country: 'Italy', zipCode: '20121' }
      ]
    };

    addCustomer(freshCustomer);
    await CustomerService.saveCustomers([...customers, freshCustomer]);

    eventBus.emit(CustomerEvents.CREATED, freshCustomer);
    eventBus.emit(NotificationEvents.CREATED, {
      text: `👤 录入新客户: [${freshCustomer.firstName} ${freshCustomer.lastName}]`
    });

    setIsCreating(false);
  };

  const toggleRowSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(x => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBatchDelete = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`是否确定批量下线移除选中的 ${selectedIds.length} 位买家？`)) {
      selectedIds.forEach(id => {
        deleteCustomer(id);
      });
      setSelectedIds([]);
      alert('批量操作成功：关联买家档案已下线');
    }
  };

  const handleBatchAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchTagInput.trim() || selectedIds.length === 0) return;
    
    selectedIds.forEach(id => {
      const match = customers.find(c => c.id === id);
      if (match) {
        const updatedTags = Array.from(new Set([...(match.tags || []), batchTagInput.trim().toLowerCase()]));
        updateCustomer(id, { tags: updatedTags });
      }
    });

    setBatchTagInput('');
    alert(`成功为选择的 ${selectedIds.length} 名客户打上标签`);
  };

  const handleExportCSV = () => {
    const headers = 'ID,Name,Email,Phone,Segment,OrdersCount,TotalSpent,Company\n';
    const rows = filteredCustomers.map(c => 
      `"${c.id}","${c.firstName} ${c.lastName}","${c.email}","${c.phone || ''}","${c.segment}","${c.ordersCount}","${c.totalSpent}","${c.company || ''}"`
    ).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `atelier_customers_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // If inspection layout is loaded
  if (activeDeepCustomerId) {
    return (
      <CustomerDetailView 
        customerId={activeDeepCustomerId}
        onBack={() => setActiveDeepCustomerId(null)}
      />
    );
  }

  if (isCreating) {
    return (
      <CustomerForm 
        onBack={() => setIsCreating(false)}
        onSubmit={handleCreateSubmit}
      />
    );
  }

  return (
    <div className="space-y-4 animate-fadeIn font-sans pb-10">
      
      {/* 🚀 TOP CRM DESKS TAB NAVIGATION */}
      <div className="flex bg-neutral-25 border border-neutral-200.5 p-1 rounded-xl w-max shadow-xs max-w-full overflow-x-auto select-none">
        
        {/* CUSTOMERS LLIST */}
        <button
          onClick={() => {
            setActiveWorkspaceTab('list');
            setCurrentTab('customers');
          }}
          className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer uppercase ${
            activeWorkspaceTab === 'list' 
              ? 'bg-neutral-900 text-white font-extrabold' 
              : 'text-neutral-500 hover:text-black hover:bg-neutral-100'
          }`}
        >
          <Users2 className="w-3.5 h-3.5" />
          <span>核心客户目录 ({customers.length})</span>
        </button>

        {/* COHORTS SEGMENTS */}
        <button
          onClick={() => {
            setActiveWorkspaceTab('segments');
            setCurrentTab('segments');
          }}
          className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer uppercase ${
            activeWorkspaceTab === 'segments'
              ? 'bg-neutral-900 text-white font-extrabold'
              : 'text-neutral-500 hover:text-black hover:bg-neutral-100'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>深度分析细分 (Segments)</span>
        </button>

        {/* B2B CORPORATES */}
        <button
          onClick={() => {
            setActiveWorkspaceTab('companies');
            setCurrentTab('customers'); // Keep on main customer side
          }}
          className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer uppercase ${
            activeWorkspaceTab === 'companies'
              ? 'bg-neutral-900 text-white font-extrabold'
              : 'text-neutral-500 hover:text-black hover:bg-neutral-100'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>对公 B2B 机构</span>
        </button>

      </div>

      {/* ================= WORKSPACE INTERCHANGE ================= */}
      {activeWorkspaceTab === 'segments' && (
        <SegmentView onSelectCustomer={(id) => setActiveDeepCustomerId(id)} />
      )}

      {activeWorkspaceTab === 'companies' && (
        <CompanyView onSelectCustomer={(id) => setActiveDeepCustomerId(id)} />
      )}

      {activeWorkspaceTab === 'list' && (
        <div className="space-y-4">
          
          {/* Decoupled header card */}
          <CustomersHeader onAddClick={() => setIsCreating(true)} />

          {/* DYNAMIC METADATA ADVANCED FILTERS MODULE */}
          <div className="bg-white border border-neutral-200.5 p-4 rounded-xl shadow-xs space-y-3 font-mono text-xs">
            
            {/* Search + Clear query */}
            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="搜索客户姓名、邮件地址、所在城市、对公企业、备注标签等..."
                  value={searchString}
                  onChange={(e) => setSearchString(e.target.value)}
                  className="w-full bg-[#f8f8f8] border border-neutral-250 pl-9 pr-4 py-2 rounded text-xs focus:outline-none focus:ring-1 focus:ring-black focus:bg-white transition-all text-neutral-900"
                />
              </div>

              {/* Action utilities */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleExportCSV}
                  className="bg-neutral-50 hover:bg-neutral-100 border border-neutral-250 font-bold font-mono text-[10px] px-3.5 py-2 rounded uppercase tracking-wider flex items-center space-x-1 cursor-pointer transition-colors"
                  title="导出当前筛选出的买家至 CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>导出报表 ({filteredCustomers.length})</span>
                </button>

                {(spentMin || ordersMin || cityFilter || tagFilter || searchString) && (
                  <button
                    onClick={() => {
                      setSpentMin('');
                      setOrdersMin('');
                      setCityFilter('');
                      setTagFilter('');
                      setSearchString('');
                    }}
                    className="text-red-600 font-bold text-[10px] uppercase cursor-pointer hover:underline pl-2"
                  >
                    清除所有筛选器
                  </button>
                )}
              </div>
            </div>

            {/* Sub Filter Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div>
                <label className="block text-[8px] uppercase text-neutral-400 mb-1 font-bold">最小消费毛利额</label>
                <input
                  type="number"
                  placeholder="e.g. 100"
                  value={spentMin}
                  onChange={(e) => setSpentMin(e.target.value)}
                  className="w-full bg-[#fafafa] border border-neutral-200 rounded p-1.5 focus:outline-none focus:bg-white text-xs"
                />
              </div>
              <div>
                <label className="block text-[8px] uppercase text-neutral-400 mb-1 font-bold">成交订单单数</label>
                <input
                  type="number"
                  placeholder="e.g. 2"
                  value={ordersMin}
                  onChange={(e) => setOrdersMin(e.target.value)}
                  className="w-full bg-[#fafafa] border border-neutral-200 rounded p-1.5 focus:outline-none focus:bg-white text-xs"
                />
              </div>
              <div>
                <label className="block text-[8px] uppercase text-neutral-400 mb-1 font-bold">经营驻点城市</label>
                <input
                  type="text"
                  placeholder="e.g. Milano"
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="w-full bg-[#fafafa] border border-neutral-200 rounded p-1.5 focus:outline-none focus:bg-white text-xs"
                />
              </div>
              <div>
                <label className="block text-[8px] uppercase text-neutral-400 mb-1 font-bold">包含标签属性</label>
                <input
                  type="text"
                  placeholder="e.g. vip"
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                  className="w-full bg-[#fafafa] border border-neutral-200 rounded p-1.5 focus:outline-none focus:bg-white text-xs"
                />
              </div>
            </div>

          </div>

          {/* BATCH ACTION CONTROLLER BAR */}
          {selectedIds.length > 0 && (
            <div className="bg-neutral-900 text-white rounded-lg px-4 py-2.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs font-mono animate-fadeIn">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-450" />
                <span className="font-bold">已选择 {selectedIds.length} 位核心买家档案</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <form onSubmit={handleBatchAddTag} className="flex bg-neutral-800 rounded border border-neutral-700/50">
                  <input
                    type="text"
                    required
                    placeholder="批量打上特定标签..."
                    value={batchTagInput}
                    onChange={(e) => setBatchTagInput(e.target.value)}
                    className="bg-transparent border-none text-[11px] px-2 py-1 text-white focus:outline-none"
                  />
                  <button type="submit" className="px-3 bg-neutral-700 hover:bg-neutral-600 rounded-r text-[10px] font-bold">应用</button>
                </form>
                
                <button
                  onClick={handleBatchDelete}
                  className="bg-red-700 hover:bg-red-655 text-white text-[10px] font-bold px-3 py-1.5 rounded flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>注销所选档案</span>
                </button>

                <button
                  onClick={() => setSelectedIds([])}
                  className="text-neutral-400 hover:text-white font-medium cursor-pointer pl-1.5"
                >
                  取消
                </button>
              </div>
            </div>
          )}

          {/* Decoupled tabs filter label bar */}
          <CustomersTabs 
            customerFilter={customerFilter}
            setCustomerFilter={setCustomerFilter}
            filteredCount={filteredCustomers.length}
          />

          {/* PRESTIGE CUSTOMERS MANUAL DIRECTORY RENDERER */}
          <div className="bg-white border border-neutral-250 rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs border-collapse divide-y divide-neutral-200">
                <thead>
                  <tr className="bg-neutral-25 text-neutral-450 uppercase text-[10px]">
                    <th className="px-4 py-3 text-center w-10">选择</th>
                    <th className="px-4 py-3">买家贵宾姓名</th>
                    <th className="px-4 py-3 font-sans">账户电子邮件</th>
                    <th className="px-4 py-3">分群分轨</th>
                    <th className="px-4 py-3">联席对公机构</th>
                    <th className="px-4 py-3 text-right">下单总单数</th>
                    <th className="px-4 py-3 text-right">累计成交毛利</th>
                    <th className="px-4 py-3 text-center w-28">操作面板</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-150">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-neutral-400 italic">
                        未检索到任何符合上述精准筛选条件的买家档案
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((c) => (
                      <tr 
                        key={c.id}
                        className="hover:bg-neutral-25/50 transition-colors cursor-pointer group"
                      >
                        {/* TICK BOX CHECKBOX */}
                        <td 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRowSelect(c.id);
                          }}
                          className="px-4 py-3.5 text-center"
                        >
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(c.id)}
                            onChange={() => {}} // Controlled manually
                            className="w-3.5 h-3.5 accent-neutral-900 border-neutral-320 rounded cursor-pointer"
                          />
                        </td>

                        {/* NAME */}
                        <td 
                          onClick={() => setActiveDeepCustomerId(c.id)}
                          className="px-4 py-3.5 font-bold text-neutral-900 group-hover:text-indigo-650"
                        >
                          {c.firstName} {c.lastName}
                        </td>

                        {/* EMAIL */}
                        <td className="px-4 py-3.5 text-neutral-600 font-sans">{c.email}</td>

                        {/* SEGMENT BADGE */}
                        <td className="px-4 py-3.5">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                            c.segment === 'VIP' ? 'bg-red-50 text-red-650 border border-red-200' :
                            c.segment === 'Returning' ? 'bg-indigo-50 text-indigo-700 border border-indigo-150' :
                            c.segment === 'B2B' ? 'bg-neutral-950 text-white' : 'bg-neutral-100 text-neutral-550'
                          }`}>
                            {c.segment}
                          </span>
                        </td>

                        {/* COMPANY */}
                        <td className="px-4 py-3.5 text-neutral-450 italic font-mono truncate max-w-xs select-all">
                          {c.company || '个人非对公'}
                        </td>

                        {/* ORDERS COUNT */}
                        <td className="px-4 py-3.5 text-right font-bold text-neutral-750">
                          {c.ordersCount} 笔已交单
                        </td>

                        {/* TOTAL SPENT */}
                        <td className="px-4 py-3.5 text-right font-bold text-neutral-950">
                          {currencySymbol}{c.totalSpent.toFixed(2)}
                        </td>

                        {/* OPERATION ACTION */}
                        <td className="px-4 py-3.5 text-center">
                          <div className="flex items-center justify-center space-x-1.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDeepCustomerId(c.id);
                              }}
                              className="px-2 py-1 bg-neutral-900 text-white hover:bg-neutral-800 rounded font-bold font-mono text-[9px] uppercase cursor-pointer"
                            >
                              深入透视
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                togglePreview('customer', c.id);
                              }}
                              className="px-2 py-1 bg-neutral-50 hover:bg-neutral-100 border border-neutral-250 rounded font-bold font-mono text-[9px] text-[#616161] hover:text-[#1a1a1a] cursor-pointer"
                              title="在右侧第3栏抽屉滑出快捷视效看板"
                            >
                              右看
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
