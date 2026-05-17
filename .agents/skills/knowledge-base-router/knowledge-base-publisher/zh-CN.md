---
name: knowledge-base-publisher
description: 将已确认草稿写入知识库，更新索引，并在发布完成后立即执行 Git 提交。唯一写入路径。
disable-model-invocation: true
user-invocable: false
---

# Publisher

## 触发

Router 交接，带草稿内容和 `confirmation_status=confirmed`。

## 做

### 1. 分类解析
- 优先用户指定 → `category_hint` → 与 `.knowledge-base.yml` 匹配
- 多匹配时暂停询问

### 2. 文件命名
- 优先用户指定 → 从 title 生成 kebab-case
- 禁止空格、中文标点、下划线、大写

### 3. 冲突处理
- 文件不存在 → add
- 文件存在 → 询问 update / save-as / cancel

### 4. 写入
```
写入 {root}/{category.path}/{filename}
更新 {root}/{category.path}/{category.index}（添加链接条目）
如需要，更新 layer/root index
```

### 5. 自检
文件存在 → 索引链接可达 → 无未确认覆盖

### 6. Git 提交（发布完成后立即执行 Git 提交）

自检通过后立即提交，不再询问用户是否提交。

暂停条件：
- 自检失败
- 分类、命名、覆盖冲突仍未确认
- 没有本次发布相关变更可提交

提交规则：
- 只暂存本次发布写入的内容文件和索引文件
- 不暂存工作区中的其他变更
- 新增文档用 `docs(<category>): add <filename>`
- 更新文档用 `docs(<category>): update <filename>`
- 不 push

```bash
rtk git status --short
rtk git add <内容文件> <索引文件...>
rtk git commit -m "docs(<category>): add <filename>"
```

## Handoff

```markdown
## Handoff
→ done
commit: <hash>
```
