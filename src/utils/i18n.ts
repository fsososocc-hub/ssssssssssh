/**
 * Clean Monolingual Chinese Translation Engine for Merchant OS
 * Following strict brand guidelines (Names <= 4 characters, subtitles/descriptions <= 8 characters)
 * Completely removes double-language labels and retains elegant, professional terminology.
 */

import { StoreSettings } from '../types';

export function getLanguage(settings: StoreSettings): 'zh' {
  return 'zh';
}

export const translations = {
  zh: {
    // 基础标签及当前节点 (<=4字名称, <=8字副标题)
    "store_node": "当前分店",
    "switch_outlet": "切换分店",
    "create_outlet": "开设分店",
    "merchant_suffix": "商户大盘",
    "menu_options": "扩展菜单",
    "system_core": "对账核心",
    "system_title": "系统控制",
    "general_desc": "商号凭证",

    // 侧栏一级导航主菜单 (严格控制在 4 字之内)
    "home": "管理首页",
    "orders": "订单流水",
    "products": "货品中心",
    "customers": "客群管理",
    "marketing": "全网营销",
    "discounts": "折扣配置",
    "content": "内容资产",
    "markets": "跨境市场",
    "financials": "财务清算",
    "analytics": "数据报表",
    "settings": "系统设置",

    // 侧栏二级子菜单 (严格限制在 4 字之内)
    "all_orders": "全部订单",
    "draft_orders": "草稿合同",
    "abandoned": "订单挽单",
    "returns_orders": "退换流水",
    "product_catalog": "商品列表",
    "inventory": "库存盘点",
    "collections": "货品分类",
    "customers_list": "档案卡片",
    "segments": "细分群组",
    "campaigns": "营销活动",
    "automations": "自动流程",
    "asset_files": "图片中心",
    "static_pages": "独立单页",
    "overview_stats": "财务看板",
    "atelier_capital": "商盟结算",
    "trends": "核对趋势",
    "reports_list": "对接单报",

    // 销售网关及扩展
    "sales_channels": "发货管道",
    "online_store": "展示网店",
    "pos_sales": "实体店面",
    "agentico_ai": "商铺大脑",
    "embedded_apps": "系统插件",
    "app_integrations": "套件集成",

    // 设置中心细分类别
    "cat_general": "基础商号",
    "cat_plan": "资费套餐",
    "cat_users": "后勤成员",
    "cat_payments": "收款网关",
    "cat_checkout": "结算表单",
    "cat_shipping": "保价邮资",
    "cat_taxes": "国别税率",
    "cat_locations": "实体仓库",
    "cat_brand": "品牌识别",
    "cat_notifications": "服务通知",
    "cat_languages": "销售语言",
    "cat_policies": "协议制度",

    // 动作及杂项
    "sync": "同步对账",
    "more": "更多",
  },
  en: {}
};

export function translate(key: keyof typeof translations.zh, settings: StoreSettings): string {
  return translations.zh[key] || String(key);
}
