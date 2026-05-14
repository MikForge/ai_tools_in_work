---
name: mvc-workflow
description: Cocos Creator PureMVC 模块开发工作流入口。选择场景后委托给子 skill。
---

# MVC Workflow

## 概览

MVC 模块开发的两阶段工作流入口：上下文采集 → 执行实现。

## 子 Skill

| # | Skill | 场景 |
|---|-------|------|
| 1 | mvc-context-gatherer | 新建模块工作区、刷新上下文、添加子模块 |
| 2 | mvc-executor | 从断点继续执行已准备好的工作区 |

## 工作流程

1. 向用户展示两个子 skill 及其适用场景
2. 用户选择后，委托给对应子 skill
3. 不做任何业务处理

## 停止条件

用户意图不明确无法二选一时，追问确认。
