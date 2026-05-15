<!-- 权威源：assets/core/gui/base/BaseView.ts -->
<!-- 最后验证：2026-05-14 -->

# View 创建模式

## 基类
- 类：`BaseView`（`assets/core/gui/base/BaseView.ts`）
- 继承：`export class XxxView extends BaseView`
- `BaseView` 继承 `UIComptBase`，采用 Template Method 模式

## 装饰器
- `@registerView(ViewId.Xxx, { layer: LayerType.Xxx, prefab: "path/to/prefab" })`
- 绑定 ViewId 枚举值 + LayerType + prefab 路径

## 命名
- 类名：`XxxView`（PascalCase + View 后缀）
- ViewId 枚举值：`ViewId.Xxx = "xxx"`（snake_case 字符串值）

## 目录
- View 类：`assets/scripts/game/view/<module>/XxxView.ts`
- Prefab：`assets/resources/gui/<module>/<PrefabName>.prefab`
- 或公共 Prefab：`assets/resources/common/prefab/<name>.prefab`
- View 和 Mediator 同目录（co-located）

## 注册（三步）
1. `assets/scripts/game/common/constants/UIManifest.ts` 的 `ViewId` 枚举新增值
2. `UIManifest.ts` 的 `UI_MANIFEST` 新增配置对象：

```typescript
[ViewId.Xxx]: {
    layer: LayerType.PopUp,
    prefab: "gui/module/XxxView",
    viewCls: XxxView,
    meditorCls: XxxMediator,
    mask: true,
    vacancy: true,
}
```

3. View 类上加 `@registerView` 装饰器

## LayerType 选取

| LayerType | 用途 | 容器类型 |
|-----------|------|----------|
| `UIScene = 2` | 全屏场景型界面 | Multi（栈） |
| `PopUp = 3` | 弹窗/对话框 | Multi（栈） |
| `Notify = 4` | 飘字/提示 | Single |
| `Guide = 5` | 新手引导 | Single |
| `Top = 6` | 顶层（断线重连等） | Single |

## UIContainer 绑定

View 上的 `v_nodes` / `v_compts` 由挂载在 prefab 上的 `UIContainer` 组件自动注入。
- 禁止 `getChildByName()` 手动查找节点
- 禁止 `@property(Node)` / `@property(Button)` 手动绑定 UI 节点
- 通过 `declare readonly __ui_nodes_type` / `declare readonly __ui_compts_type` 声明类型

```typescript
interface IUINodes { btn_close: Node; label_title: Node; }
interface IUICompts { btn_close_btn: Button; label_title_txt: Label; }

@registerView(ViewId.Xxx, { layer: LayerType.PopUp, prefab: "gui/module/XxxView" })
export class XxxView extends BaseView {
    declare readonly __ui_nodes_type?: IUINodes;
    declare readonly __ui_compts_type?: IUICompts;
    // 通过 this.v_nodes.btn_close / this.v_compts.btn_close_btn 访问
}
```

## 子视图
- 在 `onInit()` 内通过 `registerSubView(node)` 注册子组件（UIComptBase）
- 框架自动级联生命周期，无需手动管理
- `mountSubComp<T>(ItemCls, paths, bundle, container, data?)` 异步加载独立 prefab 子组件

## 生命周期
子类按需重写，**无需调用 `super.xxx()`**：

- `onPreload()` — prefab 加载完成，节点未激活
- `async onInit(data): Promise<boolean>` — 首次初始化，在此调用 `registerSubView()`
- `onShow(data?)` — 每次显示
- `onHide()` — 每次隐藏
- `onRefresh(data)` — 刷新数据
- `onBeforeDestroy()` — 销毁前
- `onDestroy_()` — 销毁（注意尾随下划线 `_`）

## 打开/关闭 UI
- 始终通过 `sendNotification()` 打开/关闭，不直接操作 UIMgr：

```typescript
this.sendNotification(Commands.UI.OPEN, ViewId.Xxx);
this.sendNotification(Commands.UI.OPEN, { viewId: ViewId.Xxx, data: { ... } });
this.sendNotification(Commands.UI.CLOSE, ViewId.Xxx);
```

## 完整示例

```typescript
import { _decorator, Node, Button } from 'cc';
import { BaseView, LayerType, registerView } from 'db://assets/core/gui';
import { ViewId } from '../../common/constants/UIManifest';

const { ccclass } = _decorator;

@registerView(ViewId.MainUI, {
    layer: LayerType.UIScene,
    prefab: "gui/mainui/MainUI"
})
export class MainuiView extends BaseView {
    declare readonly __ui_nodes_type?: { btnSet: Node };
    declare readonly __ui_compts_type?: { btnSet_btn: Button };
}
```

## 搜索模式
- 已有 ViewId：读 `UIManifest.ts` → ViewId 枚举
- 已有 UI 配置：读 `UIManifest.ts` → UI_MANIFEST 对象
- 已有 View 类：grep `assets/scripts/game/view/` 查找 `@registerView`
- 已有 Prefab：ls `assets/resources/gui/` + `assets/resources/common/prefab/`
