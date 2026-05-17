# systematic-debugging — 系统化调试

> 来源: [obra/superpowers/skills/systematic-debugging](https://github.com/obra/superpowers/tree/main/skills/systematic-debugging)

## 概述

在遇到任何 bug、测试失败或意外行为时使用，在提出修复之前必须先进行系统化调试。

## 关键设计决策

- **铁律**：未完成根本原因调查之前不得提出修复。症状修复=失败
- **禁止随机修复**：随机修复浪费时间并产生新 bug，快速修补掩盖深层问题
- **适用范围**：所有技术问题——测试失败、生产 bug、意外行为、性能问题

## 工作流程

1. 定位问题 → 2. 调查根本原因 → 3. 确认原因后 → 4. 提出修复方案

## 来源

- https://raw.githubusercontent.com/obra/superpowers/main/skills/systematic-debugging/SKILL.md
