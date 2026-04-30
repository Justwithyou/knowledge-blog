---
title: Spring AI Alibaba 权威指南：构建企业级 Agent 智能体应用
published: 2026-04-20
description: 基于 Spring AI Alibaba 官方文档与源码，系统解析其核心架构（Agent Framework、Graph Core、Augmented LLM）、ReactAgent 原理、Multi-agent 编排模式、上下文工程、Hooks 机制等关键技术，助你从入门到深度掌握阿里 AI Agent 开发框架。
image: ''
tags: ['Spring AI Alibaba', 'Java', 'AI Agent', 'ReactAgent', 'Multi-agent', 'Graph', '阿里云', 'DashScope', 'RAG', 'MCP']
category: 'Java开发'
draft: false
lang: ''
---

## 引言

Spring AI Alibaba 是阿里巴巴开源的 **AI Agent 开发框架**，旨在为 Java 开发者提供构建生产级 Agent 智能体应用的最简路径。其核心理念是：只需不到 10 行代码即可构建一个可用的智能体。

> Spring AI Alibaba 深度集成了 Spring AI 生态，但它不仅仅是对 Spring AI 的简单封装。它是一个**专为多智能体系统和工作流编排设计**的项目，ReactAgent 运行在 Graph 运行时之上，设计目标是完成复杂的工作流和多智能体协同。

**当前版本**：Spring AI Alibaba 1.1.2.0（推荐版本）
**依赖**：Spring AI 1.1.2 + Spring Boot 3.5.x
**GitHub**：9.3k stars，2k forks

---

## 第一部分：核心架构

Spring AI Alibaba 从架构上包含**三层**，每一层都有清晰的职责边界：

```
┌─────────────────────────────────────────────────────────────┐
│                    Spring AI Alibaba                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌─────────────────────────────────────────────────────┐    │
│   │         Agent Framework（顶层）                      │    │
│   │  ReactAgent + Multi-agent + Hooks + Skills          │    │
│   └─────────────────────────────────────────────────────┘    │
│                          │                                   │
│                          ▼                                   │
│   ┌─────────────────────────────────────────────────────┐    │
│   │            Graph Core（中层运行时）                  │    │
│   │  图工作流 + 状态管理 + 持久化 + 流式 + MCP 节点      │    │
│   └─────────────────────────────────────────────────────┘    │
│                          │                                   │
│                          ▼                                   │
│   ┌─────────────────────────────────────────────────────┐    │
│   │       Augmented LLM（底层抽象）                      │    │
│   │  ChatModel + Tool + MCP + Message + VectorStore     │    │
│   └─────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 三层职责

| 层次 | 组件 | 职责 |
|------|------|------|
| **顶层** | Agent Framework | 以 ReactAgent 为核心的 Agent 开发框架，提供多智能体编排、Hooks、Skills 等 |
| **中层** | Graph Core | 低级别的图工作流和多代理协调框架，负责状态管理、持久化、流式输出 |
| **底层** | Augmented LLM | 基于 Spring AI 的基础抽象，涵盖 Model、Tool、MCP、Message、VectorStore |

### 生态全景

```
Spring AI Alibaba 生态
├── spring-ai-alibaba-agent-framework  — Agent 开发框架
├── spring-ai-alibaba-graph-core      — Graph 运行时
├── spring-ai-alibaba-admin            — 可视化 Agent 开发平台
├── spring-ai-alibaba-studio           — 嵌入式调试 UI
├── spring-ai-alibaba-sandbox          — Agent 沙箱运行时
├── spring-boot-starters               — Nacos 集成的 A2A 支持
│
├── JManus        — 通用 Agent 实现（阿里巴巴内部使用）
├── DataAgent     — 自然语言转 SQL
├── DeepResearch  — 深度研究 Agent
└── spring-ai-extensions — 扩展实现（DashScope、MCP 等）
```

---

## 第二部分：基础入门

### 环境要求

- JDK 17+
- Maven 3.8+
- AI Model Provider API-KEY（如阿里云百炼 DashScope）

### 添加依赖

推荐使用 BOM 统一版本管理：

```xml
<dependencyManagement>
    <dependencies>
        <!-- Spring AI Alibaba BOM -->
        <dependency>
            <groupId>com.alibaba.cloud.ai</groupId>
            <artifactId>spring-ai-alibaba-bom</artifactId>
            <version>1.1.2.0</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
        <!-- Spring AI BOM -->
        <dependency>
            <groupId>org.springframework.ai</groupId>
            <artifactId>spring-ai-bom</artifactId>
            <version>1.1.2</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>

<dependencies>
    <!-- Agent Framework -->
    <dependency>
        <groupId>com.alibaba.cloud.ai</groupId>
        <artifactId>spring-ai-alibaba-agent-framework</artifactId>
    </dependency>
    <!-- DashScope 模型支持 -->
    <dependency>
        <groupId>com.alibaba.cloud.ai</groupId>
        <artifactId>spring-ai-alibaba-starter-dashscope</artifactId>
    </dependency>
</dependencies>
```

### 配置 API-KEY

```bash
export AI_DASHSCOPE_API_KEY=your_api_key_here
```

或在 `application.yml` 中配置（生产环境推荐使用环境变量）：

```yaml
spring:
  ai:
    dashscope:
      api-key: ${AI_DASHSCOPE_API_KEY}
```

> 获取 API-KEY：访问[阿里云百炼控制台](https://bailian.console.aliyun.com/?apiKey=1&tab=api#/api)

### 快速构建一个 Agent

只需约 20 行代码即可构建一个具备工具调用能力的天气查询 Agent：

```java
// 1. 初始化 DashScope API 和 ChatModel
DashScopeApi dashScopeApi = DashScopeApi.builder()
    .apiKey(System.getenv("AI_DASHSCOPE_API_KEY"))
    .build();

ChatModel chatModel = DashScopeChatModel.builder()
    .dashScopeApi(dashScopeApi)
    .build();

// 2. 定义天气查询工具
public class WeatherTool implements BiFunction<String, ToolContext, String> {
    @Override
    public String apply(String city, ToolContext toolContext) {
        return "The weather in " + city + " is sunny!";
    }
}

ToolCallback weatherTool = FunctionToolCallback.builder("get_weather", new WeatherTool())
    .description("Get weather for a given city")
    .inputType(String.class)
    .build();

// 3. 创建 Agent
ReactAgent agent = ReactAgent.builder()
    .name("weather_agent")
    .model(chatModel)
    .tools(weatherTool)
    .systemPrompt("You are a helpful weather assistant")
    .saver(new MemorySaver())
    .build();

// 4. 运行 Agent
AssistantMessage response = agent.call("What's the weather in Hangzhou?");
System.out.println(response.getText());
```

---

## 第三部分：ReactAgent 核心原理

### ReAct 范式

ReactAgent 遵循 **ReAct（Reasoning + Acting）** 范式，让 Agent 在循环中通过运行工具来实现目标：

```
┌──────────────────────────────────────────────────────────────┐
│                  ReAct 执行循环                                │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌─────────┐    思考     ┌─────────┐    行动     ┌────────┐ │
│   │ Reason  │ ────────▶ │  Act    │ ────────▶ │ Observe│ │
│   │ (推理)  │            │ (工具)  │            │ (观察) │ │
│   └─────────┘            └─────────┘            └────────┘ │
│        ▲                                              │     │
│        └──────────────────── (循环) ──────────────────────  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

ReAct 循环使 Agent 能够：
- 将复杂问题分解为多个步骤
- 动态调整策略基于中间结果
- 处理需要多次工具调用的任务
- 在不确定的环境中做出决策

### ReactAgent 的内部架构

Spring AI Alibaba 中的 ReactAgent 基于 **Graph 运行时**构建：

| 节点类型 | 作用 |
|---------|------|
| **Model Node** | 调用 LLM 进行推理和决策 |
| **Tool Node** | 执行工具调用 |
| **Hook Nodes** | 在关键位置插入自定义逻辑 |

### 基础模型配置

```java
// 基础配置
ChatModel chatModel = DashScopeChatModel.builder()
    .dashScopeApi(dashScopeApi)
    .build();

// 高级配置（通过 ChatOptions）
ChatModel chatModelAdvanced = DashScopeChatModel.builder()
    .dashScopeApi(dashScopeApi)
    .defaultOptions(DashScopeChatOptions.builder()
        .withModel(DashScopeChatModel.DEFAULT_MODEL_NAME)
        .withTemperature(0.7)    // 控制随机性
        .withMaxToken(2000)      // 最大输出长度
        .withTopP(0.9)           // 核采样参数
        .build())
    .build();
```

---

## 第四部分：Tools（工具调用）

Tools 赋予 Agent 执行操作的能力，是 Agent 与外部世界交互的桥梁。

### 工具的两大用途

| 类别 | 用途 | 示例 |
|------|------|------|
| **信息检索** | 从外部源获取实时信息 | 天气查询、新闻搜索、数据库查询 |
| **执行操作** | 在软件系统中执行操作 | 发送邮件、创建记录、触发工作流 |

### 定义工具的方式

#### 1. 使用 `@Tool` 注解

```java
class DateTimeTools {
    @Tool(description = "Get the current date and time in the user's timezone")
    String getCurrentDateTime() {
        return LocalDateTime.now().toString();
    }

    @Tool(description = "Set an alarm for the specified time")
    String setAlarm(@ToolParam("ISO-8601 format time") String time) {
        return "Alarm set for " + time;
    }
}
```

#### 2. 使用 FunctionToolCallback

```java
ToolCallback weatherTool = FunctionToolCallback.builder("get_weather", new WeatherTool())
    .description("Get weather for a given city")
    .inputType(String.class)
    .build();
```

#### 3. 在 ChatClient 中使用

```java
String response = ChatClient.create(chatModel)
    .prompt("What's the weather tomorrow?")
    .tools(new DateTimeTools())
    .call()
    .content();
```

> **重要**：模型只能请求工具调用并提供参数，实际执行由应用程序负责。模型永远无法直接访问作为工具提供的任何 API——这是关键的安全考量。

---

## 第五部分：上下文工程（Context Engineering）

### 为什么 Agent 会失败？

构建 Agent 的难点在于使其足够可靠。当 Agent 失败时，原因通常有两个：
1. 底层 LLM 能力不足
2. **没有向 LLM 传递"正确"的上下文**

大多数情况下，**第二个原因才是 Agent 不可靠的根源**。上下文工程是以正确的格式提供正确的信息和工具，使 LLM 能够完成任务——这是 AI 工程师的首要工作。

### 三种上下文类型

| 上下文类型 | 你控制的内容 | 瞬态/持久 |
|-----------|-------------|----------|
| **模型上下文** | 模型调用中包含什么（指令、消息历史、工具、响应格式） | 瞬态 |
| **工具上下文** | 工具可以访问和产生什么（对状态、存储、运行时上下文的读/写） | 持久 |
| **生命周期上下文** | 模型和工具调用之间发生什么（摘要、防护栏、日志等） | 持久 |

### 三层数据源

```
数据源
├── 运行时上下文（静态配置，会话范围）
│   └── 用户 ID、API 密钥、数据库连接、权限
│
├── 状态 State（短期记忆，会话范围）
│   └── 当前消息、上传的文件、认证状态、工具结果
│
└── 存储 Store（长期记忆，跨会话）
    └── 用户偏好、提取的见解、记忆、历史数据
```

---

## 第六部分：Hooks 和 Interceptors

Hooks 和 Interceptors 是 Spring AI Alibaba 实现上下文工程的核心机制，允许你挂接到 Agent 生命周期的任何步骤。

### 可以做什么

- **监控**：通过日志、分析和调试跟踪 Agent 行为
- **修改**：转换提示、工具选择和输出格式
- **控制**：添加重试、回退和提前终止逻辑
- **强制执行**：应用速率限制、护栏和 PII 检测

### 使用方式

```java
ReactAgent agent = ReactAgent.builder()
    .name("my_agent")
    .model(chatModel)
    .tools(tools)
    .hooks(loggingHook, messageTrimmingHook)
    .interceptors(guardrailInterceptor, retryInterceptor)
    .build();
```

### 内置 Hooks

#### 1. 消息压缩（SummarizationHook）

当接近 token 限制时自动压缩对话历史，适用于长期对话和上下文窗口限制场景：

```java
SummarizationHook summarizationHook = SummarizationHook.builder()
    .model(chatModel)                    // 用于生成摘要的模型
    .maxTokensBeforeSummary(4000)        // 触发摘要前的最大 token 数
    .messagesToKeep(20)                   // 摘要后保留的最新消息数
    .build();
```

#### 2. Human-in-the-Loop（人机协同）

暂停 Agent 执行以获得人工批准、编辑或拒绝工具调用：

```java
HumanInTheLoopHook humanReviewHook = HumanInTheLoopHook.builder()
    .approvalOn("sendEmailTool", ToolConfig.builder()
        .description("Please confirm sending the email.")
        .build())
    .approvalOn("deleteDataTool")
    .build();

ReactAgent agent = ReactAgent.builder()
    .name("supervised_agent")
    .model(chatModel)
    .tools(sendEmailTool, deleteDataTool)
    .hooks(humanReviewHook)
    .saver(new RedisSaver())  // Human-in-the-loop 需要 checkpointer 维护状态
    .build();
```

适用场景：
- 需要人工批准的高风险操作（数据库写入、金融交易）
- 人工监督是强制性的合规工作流程
- 长期对话中使用人工反馈引导 Agent

---

## 第七部分：Multi-agent（多智能体编排）

Multi-agent 将复杂的应用程序分解为多个协同工作的专业化 Agent，适用于：

- 单个 Agent 拥有太多工具，难以做出正确的工具选择决策
- 上下文或记忆增长过大，单个 Agent 难以有效跟踪
- 任务需要**专业化**（例如：规划器、研究员、数学专家）

### 两种核心模式

| 模式 | 工作原理 | 控制流 | 使用场景 |
|------|---------|--------|---------|
| **Tool Calling** | Supervisor Agent 将其他 Agent 作为工具调用 | 集中式：所有路由通过调用 Agent | 任务编排、结构化工作流 |
| **Handoffs** | 当前 Agent 决定将控制权转移给另一个 Agent | 去中心化：Agent 可以改变当前担当者 | 跨领域对话、专家接管 |

### 模式选择决策树

```
需要集中控制工作流程？
  ├── 是 → 选择 Tool Calling（Agent Tool）模式
  └── 否 → 选择 Handoffs 模式

希望 Agent 直接与用户交互？
  ├── 否 → 选择 Tool Calling（Agent Tool）模式
  └── 是 → 选择 Handoffs 模式

专家之间需要复杂的类人对话？
  ├── 否 → 选择 Tool Calling（Agent Tool）模式
  └── 是 → 选择 Handoffs 模式
```

### Instruction 占位符

在 Multi-agent 系统中，`instruction` 支持使用占位符来动态引用状态中的数据：

| 占位符 | 说明 | 使用场景 |
|-------|------|---------|
| `{input}` | 用户输入的原始内容 | 第一个 Agent 或需要用户输入的 Agent |
| `{outputKey}` | 引用其他 Agent 通过 outputKey 存储的输出 | 顺序执行中，后续 Agent 引用前面 Agent 的输出 |

---

## 第八部分：Graph 工作流编排

Graph 是 Agent Framework 的底层运行时，提供了一个低级别的图工作流和多代理协调框架。

### Graph 核心概念

```
Graph = Nodes（节点）+ Edges（边）+ State（状态）
```

- **Nodes（节点）**：执行特定任务的函数，分为 LLM Step、Data Step、Action Step、User Input Step
- **Edges（边）**：节点之间的连接，定义可能的路径
- **State（状态）**：图中所有节点可访问的共享记忆

### 节点类型

| 节点类型 | 说明 | 决策能力 |
|---------|------|---------|
| **LLM Step** | 调用 LLM 进行推理和决策 | 可以决定下一步路由 |
| **Data Step** | 从外部源检索信息 | 无，通常进入固定下一步 |
| **Action Step** | 执行外部操作（发送邮件、创建记录等） | 无，通常进入固定下一步 |
| **User Input Step** | 等待人工干预 | 可以决定下一步路由 |

### Graph vs Agent Framework

```
┌────────────────────────────────────────────────────────────┐
│                    如何选择？                                 │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Agent Framework（推荐）                                    │
│  • 需要快速构建 Agent                                       │
│  • 需要 ReactAgent 范式                                     │
│  • 需要 Human-in-the-loop、Hooks 等开箱即用功能            │
│                                                            │
│  Graph API（高级场景）                                      │
│  • 需要超高可靠性                                           │
│  • 需要大量自定义逻辑                                        │
│  • 需要精确控制延迟                                          │
│  • 需要灵活的图状态定义                                       │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### 设计状态的最佳实践

什么应该放在状态中？问自己：

1. **这个数据是否被多个节点使用？** → 放状态
2. **这个数据是否需要跨会话持久化？** → 放存储
3. **这个数据是否只在单个节点内有意义？** → 不放状态
4. **这个数据是否影响 Agent 的决策？** → 放状态

---

## 第九部分：支持模型一览

Spring AI Alibaba 支持多种 LLM 提供商，通过统一的抽象层实现组件可替换：

| 提供商 | 多模态 | 工具调用 | 流式 | 重试 | 可观测性 | 原生 JSON | 本地部署 |
|--------|--------|---------|------|------|---------|----------|---------|
| **DashScope** | text, pdf, image | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Qwen** | text, pdf, image | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **DeepSeek** | text | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Anthropic Claude** | text, pdf, image | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Azure OpenAI** | text, image | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Google Gemini** | text, pdf, image, audio, video | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **OpenAI** | text, image, audio | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Ollama** | text | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |

### DashScope 配置示例

```yaml
spring:
  ai:
    dashscope:
      api-key: ${AI_DASHSCOPE_API_KEY}
      # 以下为可选配置
      base-url: https://dashscope.aliyuncs.com/api/v1  # 默认值
      chat:
        options:
          model: qwen-max  # 默认模型
          temperature: 0.7
          max-tokens: 2000
```

---

## 第十部分：RAG（检索增强生成）

Spring AI Alibaba 支持 RAG 模式，让 Agent 能够基于私有知识库回答问题：

### RAG 工作流程

```
用户问题 ──▶ Embedding 模型 ──▶ 向量数据库相似搜索
                                    │
                                    ▼
              ┌──────────────────────────────┐
              │  Retrieved Documents + 用户问题 │
              └──────────────────────────────┘
                                    │
                                    ▼
                                LLM 生成回答
```

### 集成方式

RAG 可以通过以下方式集成：

1. **作为 Tool**：将向量数据库查询封装为工具供 Agent 调用
2. **作为 Hook**：在模型调用前自动注入检索到的上下文
3. **通过 Agent Framework 内置支持**：使用预置的 RAG 模式

---

## 第十一部分：A2A（分布式智能体）

A2A（Agent-to-Agent）通过 Nacos 集成支持跨服务的分布式 Agent 协调和协作。

### 架构

```
┌─────────────────┐         ┌─────────────────┐
│   Agent A      │◀───────▶│   Agent B       │
│  (Nacos 服务)   │  A2A   │  (Nacos 服务)   │
└─────────────────┘         └─────────────────┘
```

### Spring Boot Starter

```xml
<dependency>
    <groupId>com.alibaba.cloud.ai</groupId>
    <artifactId>spring-ai-alibaba-starter-a2a-nacos</artifactId>
</dependency>
```

通过 Nacos 实现服务发现和注册，Agent 可以跨服务边界进行协作。

---

## 第十二部分：生态工具

### Admin 平台

Spring AI Alibaba Admin 是一站式 Agent 开发与评估平台：

- **Prompt Management**：模板管理、版本控制、实时调试
- **Dataset Management**：数据集创建、版本管理、数据项 CRUD
- **Evaluator Management**：评估器配置、模板系统、在线调试
- **Experiment Management**：自动化实验执行、结果分析
- **Observability**：OpenTelemetry 集成追踪、Span 分析

### Studio

嵌入式 Agent 调试与可视化 UI，支持：
- Agent 可视化调试
- 运行时追踪
- 项目管理

### 预置 Agent 应用

| 应用 | 说明 |
|------|------|
| **JManus** | 通用 Agent 实现（阿里巴巴内部使用） |
| **DataAgent** | 自然语言转 SQL，查询数据库无需写 SQL |
| **DeepResearch** | 深度研究 Agent，基于 Graph 实现 |

---

## 第十三部分：实战模式与最佳实践

### 模式一：简单问答 Agent

```java
ReactAgent agent = ReactAgent.builder()
    .name("qa_agent")
    .model(chatModel)
    .systemPrompt("你是一个专业的技术顾问。")
    .build();

AssistantMessage response = agent.call("解释一下微服务架构");
```

### 模式二：带工具调用的自主 Agent

```java
ReactAgent agent = ReactAgent.builder()
    .name("assistant_agent")
    .model(chatModel)
    .tools(weatherTool, searchTool, calculatorTool)
    .systemPrompt("""
        你是一个智能助手，可以调用工具来完成用户任务。
        如果需要实时信息，使用工具获取。
        """)
    .saver(new MemorySaver())
    .build();
```

### 模式三：带人机协同的监控 Agent

```java
HumanInTheLoopHook humanReviewHook = HumanInTheLoopHook.builder()
    .approvalOn("deleteDataTool")
    .approvalOn("sendEmailTool")
    .build();

ReactAgent agent = ReactAgent.builder()
    .name("supervised_agent")
    .model(chatModel)
    .tools(deleteDataTool, sendEmailTool)
    .hooks(humanReviewHook)
    .saver(new RedisSaver())
    .build();
```

### 模式四：Multi-agent 协作

```java
// 创建专业化 Agent
ReactAgent researcher = ReactAgent.builder()
    .name("researcher")
    .model(chatModel)
    .tools(searchTool)
    .instruction("你是一个研究员，负责搜集信息。")
    .build();

ReactAgent writer = ReactAgent.builder()
    .name("writer")
    .model(chatModel)
    .instruction("你是一个作家，负责基于研究结果撰写报告。")
    .build();

// 使用 Handoffs 模式协作
// ... (通过 Agent Framework 内置的 Multi-agent API)
```

### 最佳实践

```
┌─────────────────────────────────────────────────────────────────┐
│              Spring AI Alibaba 最佳实践                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. 优先使用 Agent Framework                                     │
│     • ReactAgent 抽象覆盖大多数场景                                │
│     • 开箱即用的 Hooks 和 Human-in-the-loop 支持                  │
│                                                                  │
│  2. 工具设计要清晰                                                │
│     • description 要描述工具用途                                   │
│     • inputSchema 要完整且准确                                     │
│     • 优先使用 @Tool 注解方式，代码更简洁                           │
│                                                                  │
│  3. 上下文工程是可靠性的关键                                       │
│     • 不要假设模型"应该知道"什么                                    │
│     • 通过 Hook 控制 token 使用和上下文大小                         │
│     • 长期对话使用 SummarizationHook                              │
│                                                                  │
│  4. Multi-agent 按需使用                                          │
│     • 不要过早拆分，单个 Agent 足够时不拆分                         │
│     • 优先用 Handoffs 模式处理专家切换                              │
│     • Tool Calling 模式用于集中式工作流                             │
│                                                                  │
│  5. 生产环境注意事项                                              │
│     • 使用 BOM 管理依赖版本                                        │
│     • 配置合理的 token 限制和超时                                    │
│     • 敏感操作使用 Human-in-the-loop                               │
│     • 使用 RedisSaver 等持久化 checkpointer                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 总结

Spring AI Alibaba 为 Java 开发者打开了构建 AI Agent 的大门。其核心优势：

1. **架构清晰**：三层架构（Agent Framework → Graph Core → LLM）各司其职
2. **ReAct 范式**：内置推理-行动循环，让 Agent 具备真正的自主能力
3. **Multi-agent 支持**：Tool Calling 和 Handoffs 两种模式覆盖复杂协作场景
4. **上下文工程**：Hooks 和 Interceptors 提供细粒度的行为控制
5. **阿里云深度集成**：原生支持 DashScope、MCP、A2A 等阿里生态

**学习路径建议**：

```
第1步：掌握 ReactAgent 基本用法
         ↓
第2步：学习 Tools 定义和调用
         ↓
第3步：理解上下文工程的核心概念
         ↓
第4步：掌握 Hooks 和 Interceptors
         ↓
第5步：实践 Multi-agent 编排
         ↓
第6步：深入 Graph API 实现复杂工作流
         ↓
第7步：集成 RAG 和 A2A 等高级特性
```

---

## 参考资源

- [Spring AI Alibaba 官方文档](https://java2ai.com/docs/overview)
- [Spring AI Alibaba GitHub](https://github.com/alibaba/spring-ai-alibaba)
- [Spring AI Alibaba Admin](https://github.com/spring-ai-alibaba/spring-ai-alibaba-admin)
- [Spring AI Alibaba Examples](https://github.com/alibaba/spring-ai-alibaba/tree/main/examples)
- [阿里云百炼 DashScope](https://dashscope.console.aliyun.com/)
- [AI-Native Application Architecture White Paper](https://developer.aliyun.com/ebook/8479)

---

*本文基于 Spring AI Alibaba 1.1.2.0 官方文档整理，2026年4月*
