# drink-skill WeStoreCafe 点单场景

## 业务流程图

```
用户意图
  │
  ├─ 模糊意图（"想喝点什么"）─→ getRecommendedDrinks → 推荐卡片
  │                                                        │
  ├─ 明确关键词（"拿铁"）───→ searchDrinks → 搜索结果卡片 ─┤
  │                                                        │
  │                          用户点击卡片选择某款饮品         │
  │                                    ↓                    │
  │                              selectDrink → 饮品详情卡片
  │                                    │
  │                    ┌───────────────┤
  │                    ↓               ↓
  │         用户在半屏选规格    Agent 使用默认规格
  │              ↓                     ↓
  │         confirmSku ←───────────────┘
  │              │
  │              ↓
  │       订单确认卡（order-confirm-card）
  │         ├─ 有地址：展示完整订单
  │         └─ 无地址：展示"添加收货地址"空态
  │                    ↓
  │              用户点击地址区域 → 半屏填写 → saveAddress
  │                                              ↓
  │                                    订单确认卡更新（含地址）
  │              ↓
  │       用户点击"确认下单" → payOrder → 支付成功卡片
  │
  └─ 门店查询（"最近的店"）──→ getStoreStatus → 门店状态卡片（实时刷新）
```

> **Agent 不能跳过 selectDrink 直接调 confirmSku**——必须先有 selectDrink 返回的有效 drinkId。
> **Agent 不能跳过 confirmSku 直接调 payOrder**——必须先有 confirmed 状态的订单。
> **payOrder 未返回成功前，禁止向用户宣布"已支付成功"。**

## 原子接口依赖关系

| 接口 | 作用 | 组件 | 前置条件 |
|------|------|------|----------|
| getRecommendedDrinks | 模糊意图时展示精选饮品 | recommended-drinks | — |
| searchDrinks | 按关键词搜索饮品 | recommended-drinks | 用户提供了关键词 |
| getAllDrinks | 半屏页面加载全量数据 | — | Agent 通常不直接调用 |
| selectDrink | 查看饮品详情与规格 | drink-detail-card | 已有 drinkId（来自推荐/搜索） |
| confirmSku | 确认规格生成订单 | order-confirm-card | 已调 selectDrink 获取规格信息 |
| getAddress | 查看默认地址 | address-card | — |
| saveAddress | 保存地址并续跑订单 | order-confirm-card | 用户提供了完整地址三要素 |
| confirmOrder | 重新展示订单确认 | order-confirm-card | 已有 orderId |
| payOrder | 发起支付 | pay-success-card | 订单 status=confirmed |
| getStoreStatus | 门店实时状态 | store-status-card | 用户询问门店信息 |

## 业务约束（跨接口铁律）

### 1. 输出形态
- 所有成功返回的接口（isError=false）且绑定了组件的，**必须展示卡片**，禁止以纯文本列出卡片中的详情数据。
- Agent 回复时可附加一句简短引导话术（如"为你推荐了 3 款，点击卡片选择"），但**禁止把商品名、价格、规格等以 markdown 列表形式展开**。

### 2. 执行顺序
- `payOrder` 必须在调用成功（isError=false）后才能向用户宣布"支付成功"。
- `confirmSku` 必须在 `selectDrink` 成功后调用。
- 禁止并发调用 `payOrder`；须等上一笔结束后再发起下一笔。

### 3. 数据来源
- `drinkId` 必须来自 `getRecommendedDrinks` / `searchDrinks` / `getAllDrinks` 返回的 `items[].drinkId` 原值，禁止编造。
- `orderId` 必须来自 `confirmSku` / `saveAddress` / `confirmOrder` 返回的 `orderId` 原值，禁止编造。
- 所有枚举类规格值必须使用英文枚举（如 `ice` / `hot`），禁止使用中文 label。

### 4. 地址处理
- `confirmSku` 无论有无地址都直接返回订单确认卡，地址空态由卡片组件自行展示入口。
- Agent 无需主动调 `getAddress` 来判断是否有地址——这由 `confirmSku` 内部自动处理。
- 用户在地址为空时点击"确认下单"，`payOrder` 会返回 isError 提示缺少地址。

## 用户意图分流

### 直接意图（触发本 SKILL）
- "想喝点什么"
- "来杯咖啡"
- "推荐一下饮品"
- "有什么奶茶"
- "帮我点杯拿铁"
- "看看菜单"
- "大杯热美式"
- "最近的门店排队吗"

### 意图分流规则
- 用户只说"想喝/推荐"等模糊表达 → `getRecommendedDrinks`
- 用户说出具体品名/品类 → `searchDrinks`
- 用户从卡片点击选中某饮品 → `selectDrink`（drinkId 由卡片 sendFollowUpMessage 传入）
- 用户问门店/排队 → `getStoreStatus`
- 用户表达歧义短语（如"那个"）→ 先反问澄清，禁止猜测
