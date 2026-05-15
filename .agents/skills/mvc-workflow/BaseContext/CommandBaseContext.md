<!-- 权威源：assets/core/libs/puremvc -->
<!-- 最后验证：2026-05-14 -->

# Command 创建模式

## 基类
- `SimpleCommand`（`db://assets/core/libs/puremvc`）— 单步命令
- `MacroCommand`（`db://assets/core/libs/puremvc`）— 组合多条子命令
- 实现 `ICommand` 接口

## 命名
- 类名：`XxxCommand` 或 `XxxCmd`（PascalCase）
- 文件默认导出（`export default class`）

## 目录
- 业务命令：`assets/scripts/game/controller/cmd/<category>/XxxCommand.ts`
- 启动命令：`assets/scripts/game/controller/cmd/startup/XxxCmd.ts`
- UI 命令：`assets/scripts/game/controller/cmd/ui/XxxCommand.ts`

## 注册
- 位置：`assets/scripts/game/controller/cmd/startup/ControllerCmd.ts`
- 代码：`this.facade.registerCommand(Commands.XXX, () => new XxxCommand());`
- 注意：使用工厂函数 `() => new XxxCommand()`，不是直接 `new XxxCommand()`
- UI 类命令（OPEN/CLOSE）注册在 `ViewPrepCmd.ts` 中

## 触发
- 通过 `sendNotification(Commands.XXX, data)` 触发
- 不在请求路径中直接 `new XxxCmd()` 执行
- Command 可编排 Proxy + Mediator（C4）

## 执行
- `execute(notification: INotification): void` 或 `async execute(notification: INotification): Promise<void>`
- 通过 `notification.body` 获取参数
- 通过 `this.facade` 访问 Proxy 和 Mediator

## 完整示例

```typescript
import { SimpleCommand, INotification } from 'db://assets/core/libs/puremvc';

export default class OpenUICommand extends SimpleCommand {
    public async execute(notification: INotification): Promise<void> {
        const { viewId, param } = notification.body;
        // 业务逻辑
    }
}
```

## 搜索模式
- 已有 Command 注册：grep `ControllerCmd.ts` + `ViewPrepCmd.ts` 查找 `registerCommand`
- 已有 Command 类：grep `assets/scripts/game/controller/cmd/` 查找 `extends SimpleCommand`
