---
name: knowledge-base-publisher
description: 将已确认草稿写入知识库，更新索引，git 提交。唯一写入路径。
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

### 6. Git 提交
```bash
git add <内容文件> <索引文件>
git commit -m "docs(<category>): add <filename>"
```
只暂存发布文件。不 push。

## Handoff

```markdown
## Handoff
→ done
```
