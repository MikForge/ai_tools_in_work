# DeepSeek TUI 配置系统

> 来源: [Hmbown/DeepSeek-TUI](https://github.com/Hmbown/DeepSeek-TUI)  
> 更新日期: 2026-05-17  
> 版本: v0.8.38

## 配置文件路径与优先级

| 层级 | 路径 | 说明 |
|------|------|------|
| 全局默认 | `~/.deepseek/config.toml` | 用户级配置 |
| 环境变量 | `DEEPSEEK_CONFIG_PATH` | 指定配置文件路径 |
| CLI 覆盖 | `deepseek --config /path/to/config.toml` | 优先级最高 |
| 项目覆盖 | `<workspace>/.deepseek/config.toml` | 每个仓库可按需覆盖 |

## 项目覆盖支持的键

| 键 | 作用 |
|----|------|
| `provider` | 切换后端 (e.g. `"nvidia-nim"`) |
| `model` | 覆盖 `default_text_model` |
| `api_key` | 仓库级密钥（通常从 `.env` 读取，**不可提交**） |
| `base_url` | 自托管端点 |
| `reasoning_effort` | 强制 `"high"` / `"max"` |
| `approval_policy` | `"never"` / `"on-request"` / `"untrusted"` |
| `sandbox_mode` | `"read-only"` / `"workspace-write"` / `"danger-full-access"` |
| `mcp_config_path` | 仓库级 MCP 服务器 |
| `notes_path` | 仓库内笔记 |
| `max_subagents` | 并发上限 (1..20) |
| `allow_shell` | 控制 shell 工具访问 |
| `instructions` | 清空/替换用户级 instructions（`[]` 清空） |

## Provider 配置

```toml
# ~/.deepseek/config.toml
api_key = "YOUR_DEEPSEEK_API_KEY"
default_text_model = "deepseek-v4-pro"

# 自定义 OpenAI 兼容网关
provider = "openai"
[providers.openai]
api_key = "YOUR_OPENAI_COMPATIBLE_API_KEY"
base_url = "https://your-gateway.example/v1"
```

## Profiles

```toml
api_key = "PERSONAL_KEY"
default_text_model = "deepseek-v4-pro"

[profiles.work]
api_key = "WORK_KEY"

[profiles.nvidia-nim]
provider = "nvidia-nim"
api_key = "NVIDIA_KEY"
default_text_model = "deepseek-ai/deepseek-v4-pro"

[profiles.ollama]
provider = "ollama"
base_url = "http://localhost:11434/v1"
default_text_model = "deepseek-coder:1.3b"
```

选择: `deepseek --profile work` 或 `DEEPSEEK_PROFILE=work`

## 来源

| 资源 | URL |
|------|-----|
| GitHub 仓库 | https://github.com/Hmbown/DeepSeek-TUI |
| 配置文档 | https://raw.githubusercontent.com/Hmbown/DeepSeek-TUI/main/docs/CONFIGURATION.md |
