
# 技能设计约束

## 路径规则

包含内部文件的 skill 必须使用显式路径根：

- `ROUTER_SKILL_DIR`：当前 skill package 自有文件。
- `TARGET_WORKSPACE`：项目 workflow 产物。
- `TARGET_SKILL_DIR`：正在创建或修改的目标 skill。

子 skill 继承这些路径根，不能重新绑定。不要从 cwd 或父级相对路径解析 skill 自有文件。任何读写文件的指令都必须明确写出正确路径根。
