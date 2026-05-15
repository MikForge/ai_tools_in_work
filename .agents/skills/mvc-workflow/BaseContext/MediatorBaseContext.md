<!-- 权威源：assets/scripts/core/base/BaseMeditor.ts -->
<!-- 最后验证：2026-05-14 -->

# Mediator 创建模式

## 基类
- 类：`BaseMeditor`（`assets/scripts/core/base/BaseMeditor.ts`）
- 继承：`export class XxxMediator extends BaseMeditor`
- `BaseMeditor` 继承 PureMVC `Mediator`

## 装饰器
- `@registerMediator(ViewId.Xxx)`
- 绑定 ViewId 枚举值，注册到 UIConfigRegistry

## 命名
- 类名：`XxxMediator`（PascalCase + Mediator 后缀）
- 静态名：`public static NAME: string = "XxxMediator"`

## 目录
- `assets/scripts/game/view/<module>/XxxMediator.ts`
- View 和 Mediator 同目录（co-located）

## 注册
- 方式 1（推荐）：`@registerMediator` 装饰器 → 自动注册到 `UIConfigRegistry`
- 方式 2（UI 命令）：`OpenUICommand` 中通过 `UIConfigRegistry` 查找 `meditorCls`，`new MediatorClass(viewId, uiNode, param)` 后 `this.facade.registerMediator(mediator)`
- 构造函数签名：`constructor(name?: string, viewComponent?: Node, param?: any)`

## 事件绑定
- 只用 `this.addEventListenerOn(target, eventType, callback, thisArg)` — 自动管理生命周期，`onRemove` 时批量注销
- 可选参数 `cooldown`（毫秒）用于防连击
- 禁止 `node.on()` 直接绑定（会泄漏）
- 绑定时机：`onInit()` 中

## 通信
- 只用 `this.sendNotification(Commands.XXX, data)` 发送通知
- 不直接引用其他 Mediator / Proxy
- `listNotificationInterests()` 返回感兴趣的通知名列表
- `handleNotification()` 中用 `switch` 分发

## 生命周期
- `onInit(): void` — 获取 View 组件引用，设置事件监听
- `onStart(): void` — 异步初始化（框架在 `onInit` 后立即调用 `onStart`）
- `onDestroy(): void` — 销毁前清理
- 以上钩子在 `onRegister` 中依次调用，子类直接重写，无需调用 `super`

## 完整示例

```typescript
import { _decorator, Node, EventTouch } from 'cc';
import { BaseMeditor } from '../../../core/base/BaseMeditor';
import { MainuiView } from './MainuiView';
import { registerMediator } from 'db://assets/core/gui';
import { ViewId } from '../../common/constants/UIManifest';
import { INotification } from 'db://assets/core/libs/puremvc';

const { ccclass } = _decorator;

@registerMediator(ViewId.MainUI)
export class MainViewMediator extends BaseMeditor {
    public static NAME: string = "MainViewMediator";
    private view!: MainuiView;

    protected onInit(): void {
        const node = this.viewComponent as Node;
        this.view = node.getComponent(MainuiView)!;
        this.addEventListenerOn(this.view.v_nodes.btnSet, Node.EventType.TOUCH_END, this.onClickSet, this);
    }

    private onClickSet(event: EventTouch): void { }

    public listNotificationInterests(): string[] { return []; }

    public handleNotification(notification: INotification): void {
        switch (notification.name) { default: }
    }
}
```

## 搜索模式
- 已有 Mediator：grep `assets/scripts/game/view/` 查找 `@registerMediator`
