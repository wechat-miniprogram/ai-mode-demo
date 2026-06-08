# 小程序 AI Demo - WeStoreCafe 点单场景

本项目是微信小程序 AI demo，演示如何将小程序业务封装为 SKILL，实现智能化的 WeStoreCafe 点单场景。

## 功能概览

- 饮品推荐与搜索
- 饮品详情查看
- 规格选择（温度、糖度、杯型、加料）
- 收货地址选择（系统地址选择器）
- 订单确认与支付
- 门店实时状态查询（实时动态组件示例）

## 项目结构

```
├── app.js / app.json / app.wxss    # 小程序全局配置
├── pages/                           # 主包页面
│   └── home/                        # 首页
├── skills/                          # SKILL 独立分包
│   └── drink-skill/                 # WeStoreCafe 点单场景 SKILL
│       ├── SKILL.md                 # SKILL 业务说明
│       ├── mcp.json                 # 原子接口声明
│       ├── index.js                 # 原子接口注册
│       ├── apis/                    # 原子接口实现
│       └── components/              # 原子组件
├── packageDetail/                   # 半屏页面分包
│   └── pages/
│       ├── more-drinks              # 全部饮品浏览
│       ├── sku-picker               # 规格选择
│       └── address-edit             # 地址编辑（降级方案）
└── page-meta.json                   # 页面元数据（文字链）
```

## 业务流程

```
用户意图 → 推荐/搜索饮品 → 展示饮品卡片
    → 用户点击选择 → 展示详情卡片
    → 用户点击「直接下单」→ 生成订单确认卡片
    → 用户补充地址（wx.chooseAddress）
    → 用户点击「确认下单」→ 支付 → 完成
```

## 快速开始

1. 使用微信开发者工具导入本项目
2. 填写已申请 AI 开发模式内测权限的 AppID
3. 编译运行，通过 AI 对话界面体验 WeStoreCafe 点单场景
