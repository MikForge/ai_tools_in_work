<!-- 权威源：assets/scripts/core/base/BaseProxy.ts -->
<!-- 最后验证：2026-05-14 -->

# Proxy 创建模式

## 基类
- 类：`BaseProxy`（`assets/scripts/core/base/BaseProxy.ts`）
- 继承：`export class XxxProxy extends BaseProxy`
- `BaseProxy` 继承 PureMVC `Proxy` 并实现 `IProxy`

## 命名
- 类名：`XxxProxy`（PascalCase + Proxy 后缀）
- 静态名：`public static NAME = 'XxxProxy'`

## 目录
- `assets/scripts/game/model/XxxProxy.ts`

## 注册
- 位置：`assets/scripts/game/controller/cmd/startup/ModelPrepCmd.ts`
- 代码：`this.facade.registerProxy(new XxxProxy());`
- 顺序：Proxy 层在第一顺位，先于 View/Mediator（违反则运行时 undefined）

## 生命周期
- `onRegister(): void` — 注册时初始化数据（由 PureMVC Framework 调用）
- `onRemove(): void` — 移除时清理（由 PureMVC Framework 调用）
- 构造函数签名：`constructor(name?: string, data?: any)`

## 通信
- Proxy 不引用 View/Mediator（纯数据层）
- Proxy 通过 `this.facade.sendNotification()` 通知外部数据变化

## 完整示例

```typescript
import { BaseProxy } from 'db://assets/scripts/core/base/BaseProxy';

export class ConfigProxy extends BaseProxy {
    public static NAME = 'ConfigProxy';

    onRegister(): void {
        // 初始化数据
    }

    onRemove(): void {
        // 清理
    }
}
```

## 搜索模式
- 已有 Proxy 注册：grep `ModelPrepCmd.ts` 查找 `registerProxy`
- 已有 Proxy 类定义：grep `assets/scripts/game/model/` 查找 `extends BaseProxy`
