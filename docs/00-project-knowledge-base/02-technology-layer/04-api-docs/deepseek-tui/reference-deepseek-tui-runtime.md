# DeepSeek TUI 运行时

> 来源: [Hmbown/DeepSeek-TUI](https://github.com/Hmbown/DeepSeek-TUI)  
> 更新日期: 2026-05-17  
> 版本: v0.8.38

## 引擎执行流

```
Turn 开始
  → 3. Pre-execution hooks run
  → 4. 工具执行
  → 6. Post-execution hooks run  
  → 8. LSP post-edit hook (v0.8.6): edit_file/apply_patch/write_file 后收集诊断
  → 9. Diagnostics flush (v0.8.6): 下次 API 请求前 flush_pending_lsp_diagnostics() 注入诊断
  → 10. 结果返回 agent loop
Turn 结束
```

## Sub-agents

- `agent_open` / `agent_eval` / `agent_close` 管理持久子代理会话
- 默认最大并发 10，可配置至 20 (`[subagents].max_concurrent`)
- 完成后发送 `<deepseek:subagent.done>` 结构化事件
- 大结果通过 `var_handle` + `handle_read` 按需读取

## RLM (Recursive Language Model)

- `rlm_open` / `rlm_eval` / `rlm_close` 管理持久 Python REPL 会话
- 用于批量分析，支持 `peek`/`search`/`chunk`/`sub_query_batch` 等辅助函数
- 子查询支持 `dependency_mode="independent"` 并行批量执行

## LSP Diagnostics

- LSP 子系统通过 `core/engine/lsp_hooks.rs` 在每次编辑后注入诊断
- 支持 rust-analyzer、pyright、typescript-language-server、gopls、clangd
- v0.8.6 起：Diagnostics flush 在下一次 API 请求前自动注入

## 来源

| 资源 | URL |
|------|-----|
| GitHub 仓库 | https://github.com/Hmbown/DeepSeek-TUI |
| 架构文档 | https://raw.githubusercontent.com/Hmbown/DeepSeek-TUI/main/docs/ARCHITECTURE.md |
