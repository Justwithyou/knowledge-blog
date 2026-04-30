---
title: MCP (Model Context Protocol) 全面学习指南
published: 2026-04-29
description: 从定义、架构、SDK使用到实战开发，系统性掌握 MCP（模型上下文协议）的完整知识体系，涵盖 Node.js/Java/Python 多语言 MCP Server 开发、Claude Code 接入、自定义 Agent 集成以及优秀开源项目推荐。
image: ''
tags: ['MCP', 'AI', 'Model Context Protocol', 'Claude', 'Agent']
category: '技术分享'
draft: false
lang: ''
---

## 引言

MCP（Model Context Protocol，模型上下文协议）是一个**开放源代码标准**，用于将 AI 应用程序连接到外部系统。借助 MCP，AI 应用程序（如 Claude、ChatGPT）可以连接到数据源（如本地文件、数据库）、工具（如搜索引擎、计算器）和工作流（如专业化提示词）——使它们能够访问关键信息并执行任务。

可以把 MCP 想象成 **AI 应用程序的 USB-C 接口**：就像 USB-C 提供了连接电子设备的标准化方式一样，MCP 提供了将 AI 应用程序连接到外部系统的标准化方式。

### MCP 可以实现什么？

- **Agent 可以访问 Google Calendar 和 Notion**，成为更个性化的 AI 助手
- **Claude Code 可以根据 Figma 设计稿生成整个 Web 应用**
- **企业聊天机器人可以连接组织内的多个数据库**，使用户能够通过聊天分析数据
- **AI 模型可以在 Blender 上创建 3D 设计并通过 3D 打印机打印出来**

### MCP 的意义

| 角色 | 收益 |
|------|------|
| **开发者** | 减少构建或集成 AI 应用程序/Agent 时的开发时间和复杂性 |
| **AI 应用/Agent** | 获得数据源、工具和应用程序生态系统，增强功能并改善用户体验 |
| **最终用户** | 获得更强大的 AI 应用程序/Agent，能够在必要时访问数据并代为执行操作 |

### 广泛生态支持

MCP 是一个开放协议，在广泛的客户端和服务器中得到支持。AI 助手如 **Claude** 和 **ChatGPT**、开发工具如 **VS Code**、**Cursor**、**MCPJam** 等都支持 MCP——实现一次构建，处处集成。

---

## 第一部分：MCP 架构详解

### 核心概念

MCP 服务器可以提供三种主要类型的能力：

| 类型 | 说明 | 示例 |
|------|------|------|
| **Resources（资源）** | 可被客户端读取的类文件数据（如 API 响应或文件内容） | 数据库查询结果、配置文件 |
| **Tools（工具）** | 可被 LLM 调用（需用户批准）的函数 | 搜索、计算、API 调用 |
| **Prompts（提示词）** | 帮助用户完成特定任务的预写模板 | 代码审查模板、周报生成 |

### 协议分层架构

MCP 协议分为两个主要层：

```
┌─────────────────────────────────────────────┐
│              应用层 (Application)            │
├─────────────────────────────────────────────┤
│              数据层 (Data Layer)             │
│  ┌─────────────┬─────────────┬──────────┐ │
│  │   Tools     │  Resources  │  Prompts  │ │
│  └─────────────┴─────────────┴──────────┘ │
├─────────────────────────────────────────────┤
│           传输层 (Transport Layer)          │
│        STDIO  │  SSE  │  Streamable HTTP    │
└─────────────────────────────────────────────┘
```

#### 传输层（Transport Layer）

| 传输方式 | 适用场景 | 特点 |
|----------|----------|------|
| **STDIO** | 本地进程 | 通过标准输入/输出通信，适合本地集成 |
| **SSE (Server-Sent Events)** | Web 集成 | 服务器推送事件到客户端 |
| **Streamable HTTP** | 远程服务（推荐） | 支持高效双向通信 |

#### 数据层协议（Data Layer Protocol）

MCP 的核心协议交互流程：

**1. 初始化交换（Initialization Exchange）**
```
Client → Server:  发送协议版本和支持的能力
Server → Client:  确认协议版本和服务器能力
```

**2. 工具发现（Tool Discovery）**
```
Client → Server:  list_tools 请求
Server → Client:  返回可用工具列表（含名称、描述、参数模式）
```

**3. 工具执行（Tool Execution）**
```
Client → Server:  call_tool 请求（含工具名和参数）
Server → Client:  返回执行结果
```

**4. 通知机制（Notifications）**
- 服务器可以主动通知客户端工具列表变更
- 支持进度追踪（Progress Notifications）

### 生命周期管理

MCP 连接遵循明确的生命周期：

```
握手连接 → 能力协商 → 正常通信 → 资源释放
   ↓          ↓           ↓          ↓
  初始化    版本匹配    工具调用    断开连接
```

---

## 第二部分：官方 SDK 与多语言支持

### SDK 分级体系

MCP 官方提供多语言 SDK，按维护级别分为三层：

| 等级 | 语言 | 仓库 | 状态 |
|------|------|------|------|
| **Tier 1** | TypeScript | modelcontextprotocol/typescript-sdk | 全力维护 |
| **Tier 1** | Python | modelcontextprotocol/python-sdk | 全力维护 |
| **Tier 1** | C# | modelcontextprotocol/csharp-sdk | 全力维护 |
| **Tier 1** | Go | modelcontextprotocol/go-sdk | 全力维护 |
| **Tier 2** | Java | modelcontextprotocol/java-sdk | 积极维护 |
| **Tier 2** | Rust | modelcontextprotocol/rust-sdk | 积极维护 |
| **Tier 3** | Swift | modelcontextprotocol/swift-sdk | 社区维护 |
| **Tier 3** | Ruby | modelcontextprotocol/ruby-sdk | 社区维护 |
| **Tier 3** | PHP | modelcontextprotocol/php-sdk | 社区维护 |

### SDK 官方文档

| 语言 | 文档地址 |
|------|----------|
| TypeScript | https://ts.sdk.modelcontextprotocol.io |
| Python | https://py.sdk.modelcontextprotocol.io |
| Java | https://java.sdk.modelcontextprotocol.io |
| C# | https://csharp.sdk.modelcontextprotocol.io |
| Go | https://go.sdk.modelcontextprotocol.io |

---

## 第三部分：Node.js (TypeScript) MCP Server 开发

### 环境准备

```bash
# 创建项目
mkdir my-mcp-server && cd my-mcp-server
npm init -y

# 安装 MCP TypeScript SDK（必须依赖 zod）
npm install @modelcontextprotocol/sdk zod
```

### 基础示例：天气服务器

以下示例展示如何创建一个提供 `get_alerts` 和 `get_forecast` 两个工具的 MCP 服务器：

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPTransport } from "@modelcontextprotocol/sdk/server/streamable-http.js";
import { z } from "zod";

// 创建 MCP 服务器实例
const server = new McpServer({
  name: "weather-server",
  version: "1.0.0",
});

// 注册天气预警工具
server.tool(
  "get_alerts",
  "获取指定州的天气预警信息",
  {
    state: z.string().describe("美国州名，如 CA、NY"),
  },
  async ({ state }) => {
    // 实际应用中这里调用天气 API
    const alerts = await fetchWeatherAlerts(state);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(alerts),
        },
      ],
    };
  }
);

// 注册天气预报工具
server.tool(
  "get_forecast",
  "获取指定位置的天气预报",
  {
    latitude: z.number().describe("纬度"),
    longitude: z.number().describe("经度"),
  },
  async ({ latitude, longitude }) => {
    const forecast = await fetchWeatherForecast(latitude, longitude);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(forecast),
        },
      ],
    };
  }
);

// 使用 Streamable HTTP 传输启动服务器
const transport = new StreamableHTTPTransport("/mcp");
transport.connect(server);
```

### 注册资源（Resources）

```typescript
// 提供只读数据资源
server.resource(
  "weather-data",
  "weather://{location}",
  async (uri) => {
    const location = uri.pathname;
    const data = await fetchWeatherData(location);
    return {
      contents: [
        {
          uri: uri.toString(),
          mimeType: "application/json",
          text: JSON.stringify(data),
        },
      ],
    };
  }
);
```

### 注册提示词模板（Prompts）

```typescript
server.prompt(
  "analyze-weather",
  "分析天气数据并给出建议",
  {
    location: z.string(),
    includeAirQuality: z.boolean().optional(),
  },
  ({ location, includeAirQuality }) => {
    return `请分析 ${location} 的天气数据${includeAirQuality ? '包括空气质量' : ''}，并给出出行建议。`;
  }
);
```

### 运行服务器

```bash
# 直接运行
npx tsx server.ts

# 或使用 MCP Inspector 测试
npx -y @modelcontextprotocol/inspector
# 然后连接 http://localhost:8000/mcp
```

### 配置 Claude Desktop 接入

创建 `~/.claude-desktop/mcp.json`：

```json
{
  "mcpServers": {
    "weather": {
      "command": "npx",
      "args": ["tsx", "/path/to/your/server.ts"],
      "env": {
        "API_KEY": "your-weather-api-key"
      }
    }
  }
}
```

---

## 第四部分：Java MCP Server 开发

### Maven 依赖

```xml
<dependency>
    <groupId>io.modelcontextprotocol.sdk</groupId>
    <artifactId>mcp</artifactId>
    <version>1.1.2</version>
</dependency>
```

### 核心特性

Java SDK 支持：
- 协议版本兼容协商
- Tools（发现、执行、列表变更通知、Schema 验证）
- Resources（URI 模板管理）
- Roots（列表管理和通知）
- Prompts
- Sampling（AI 模型交互）
- Elicitation（请求用户输入）
- Completions（参数自动完成建议）
- Progress（长运行操作追踪）
- Logging（结构化日志）

### 传输实现

| 传输方式 | 说明 |
|----------|------|
| STDIO | 基于进程的标准输入/输出通信 |
| Java HttpClient SSE | 基于 Java HttpClient 的 SSE 客户端传输 |
| Servlet SSE | 基于 Servlet 的 SSE 服务器传输 |
| Streamable HTTP | 高效双向通信（推荐） |

Spring 2.0+ 用户推荐使用 Spring AI 的 MCP 集成。

### 基础示例

```java
import io.modelcontextprotocol.sdk.server.*;
import io.modelcontextprotocol.sdk.transport.*;
import io.modelcontextprotocol.sdk.spec.*;
import io.modelcontextprotocol.sdk.spec.validator.ZodSchema;

public class WeatherServer {
    public static void main(String[] args) {
        // 创建服务器
        McpServer server = McpServer.builder()
            .name("weather-server")
            .version("1.0.0")
            .build();
        
        // 注册工具
        server.addTool(
            ToolDeclaration.builder()
                .name("get_weather")
                .description("获取天气预报")
                .inputSchema(ZodSchema.object(
                    ZodSchema.field("location", ZodSchema.string())
                ))
                .handler(args -> {
                    String location = args.getString("location");
                    String forecast = fetchWeather(location);
                    return CallToolResult.builder()
                        .addTextContent(forecast)
                        .build();
                })
                .build()
        );
        
        // 启动服务器（Streamable HTTP）
        ServerTransport transport = new StreamableHttpTransport("/mcp");
        server.start(transport);
    }
}
```

---

## 第五部分：Python MCP Server 开发

### 安装

```bash
# 推荐使用 uv
uv add mcp

# 或使用 pip
pip install mcp
```

### 快速开始：FastMCP

Python SDK 提供 `FastMCP` 高级封装，最简方式构建服务器：

```python
from mcp.server.fastmcp import FastMCP

# 创建 MCP 服务器
mcp = FastMCP("My Server", json_response=True)

# 注册工具
@mcp.tool()
def add(a: int, b: int) -> int:
    """Add two numbers"""
    return a + b

@mcp.tool()
def get_weather(location: str) -> str:
    """Get weather for a location"""
    return f"The weather in {location} is sunny."

# 注册资源
@mcp.resource("greeting://{name}")
def get_greeting(name: str) -> str:
    """Get a personalized greeting"""
    return f"Hello, {name}!"

# 注册提示词模板
@mcp.prompt()
def greet_user(name: str, style: str = "friendly") -> str:
    """Generate a greeting prompt"""
    return f"Write a {style} greeting for someone named {name}."

# 运行服务器
if __name__ == "__main__":
    mcp.run(transport="streamable-http")
```

### 低级别 API

对于高级定制需求，可以使用低级 API：

```python
from mcp.server import Server
from mcp.types import Tool, TextContent
from mcp.server.stdio import stdio_server
import asyncio

server = Server("my-server")

@server.list_tools()
async def list_tools():
    return [
        Tool(
            name="calculate",
            description="Perform calculation",
            inputSchema={
                "type": "object",
                "properties": {
                    "expression": {"type": "string"}
                }
            }
        )
    ]

@server.call_tool()
async def call_tool(name: str, arguments: dict):
    if name == "calculate":
        result = eval(arguments["expression"])
        return [TextContent(type="text", text=str(result))]

async def main():
    async with stdio_server() as (read_stream, write_stream):
        await server.run(read_stream, write_stream, server.create_initialization_options())

asyncio.run(main())
```

### 运行和测试

```bash
# 运行服务器
uv run python server.py

# 使用 MCP Inspector 测试
npx -y @modelcontextprotocol/inspector
# 连接 http://localhost:8000/mcp
```

---

## 第六部分：Claude Code 接入 MCP

### 方式一：本地 MCP 服务器

**1. 安装 Claude Code**

```bash
# macOS
brew install claude

# 或下载对应平台的二进制文件
```

**2. 配置 MCP 服务器**

编辑 `~/.claude-desktop/mcp.json`（Claude Code 使用相同的配置格式）：

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/allowed/directory"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "your-github-personal-access-token"
      }
    },
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
    }
  }
}
```

**3. 可用的官方 MCP 服务器**

| 服务器 | 包 | 说明 |
|--------|-----|------|
| Filesystem | @modelcontextprotocol/server-filesystem | 安全文件操作 |
| Git | @modelcontextprotocol/server-git | Git 仓库操作 |
| Memory | @modelcontextprotocol/server-memory | 知识图谱持久化记忆 |
| Fetch | @modelcontextprotocol/server-fetch | Web 内容获取 |
| Time | @modelcontextprotocol/server-time | 时间和时区转换 |
| Sequential Thinking | @modelcontextprotocol/server-sequential-thinking | 动态问题解决 |

### 方式二：使用 mcp-server-dev 插件

Anthropic 官方提供 `mcp-server-dev` 插件，帮助开发者交互式构建、测试和打包 MCP 服务器：

```bash
# 在 Claude Code 中安装插件
# /install mcp-server-dev
```

### 方式三：远程 MCP 服务器

对于远程服务器，配置稍有不同：

```json
{
  "mcpServers": {
    "remote-weather": {
      "url": "https://your-remote-mcp-server.com/mcp",
      "headers": {
        "Authorization": "Bearer your-token"
      }
    }
  }
}
```

---

## 第七部分：自定义 Agent 接入 MCP

### Python Agent 接入 MCP

#### 使用 LangChain + MCP

```python
from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain.agents import AgentExecutor, create_structured_chat_agent
from langchain_openai import ChatOpenAI

async def main():
    # 连接到多个 MCP 服务器
    async with MultiServerMCPClient({
        "weather": {
            "command": "npx",
            "args": ["-y", "@modelcontextprotocol/server-weather"],
        },
        "filesystem": {
            "command": "npx", 
            "args": ["-y", "@modelcontextprotocol/server-filesystem", "/tmp"]
        }
    }) as client:
        # 获取所有可用工具
        tools = client.get_tools()
        
        # 创建 Agent
        llm = ChatOpenAI(model="gpt-4")
        agent = create_structured_chat_agent(llm, tools)
        
        # 执行
        executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
        result = await executor.ainvoke({"input": "What's the weather in San Francisco?"})
        print(result)

asyncio.run(main())
```

#### 使用直接 MCP Client

```python
from mcp.client import MCPClient
from mcp.client.stdio import stdio_client
import asyncio

async def main():
    # 创建 MCP 客户端
    async with MCPClient(stdio_client(["npx", "-y", "mcp-server-weather"])) as client:
        # 列出可用工具
        tools = await client.list_tools()
        print(f"可用工具: {[t.name for t in tools]}")
        
        # 调用工具
        result = await client.call_tool("get_forecast", {
            "latitude": 37.7749,
            "longitude": -122.4194
        })
        print(result)

asyncio.run(main())
```

### Java Agent 接入 MCP

#### 使用 Spring AI MCP Client

**依赖配置：**

```xml
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-mcp-client-boot-starter</artifactId>
</dependency>
```

**配置 application.yml：**

```yaml
spring:
  ai:
    mcp:
      client:
        enabled: true
        servers:
          weather:
            type: stdio
            command: npx
            args:
              - "-y"
              - "@modelcontextprotocol/server-weather"
          filesystem:
            type: stdio
            command: npx
            args:
              - "-y"
              - "@modelcontextprotocol/server-filesystem"
              - "/data"
```

**注入使用：**

```java
@Service
public class AgentService {
    
    @Autowired
    private List<McpToolCallbackAdapter> toolCallbacks;
    
    public void executeWithTools(String userMessage) {
        // 获取所有 MCP 工具
        for (McpToolCallbackAdapter tool : toolCallbacks) {
            System.out.println("Tool: " + tool.getName());
            System.out.println("Description: " + tool.getDescription());
        }
        
        // 将工具注入到 ChatClient
        ChatClient chatClient = ChatClient.builder()
            .defaultTools(toolCallbacks.toArray(new Tool[0]))
            .build();
            
        String response = chatClient.prompt()
            .user(userMessage)
            .call()
            .content();
            
        System.out.println(response);
    }
}
```

#### 直接使用 Java SDK MCP Client

```java
import io.modelcontextprotocol.sdk.client.*;
import io.modelcontextprotocol.sdk.transport.*;

public class McpAgent {
    public static void main(String[] args) {
        // 创建 MCP 客户端
        McpClient client = McpClient.builder()
            .name("my-agent")
            .version("1.0.0")
            .build();
        
        // 连接到本地 STDIO 服务器
        ServerTransport transport = new StdioTransport(
            "npx", "-y", "@modelcontextprotocol/server-weather"
        );
        
        client.connect(transport).join();
        
        // 列出可用工具
        ListToolsResult tools = client.listTools().join();
        System.out.println("可用工具: " + tools.getTools());
        
        // 调用工具
        CallToolResult result = client.callTool(
            "get_forecast",
            Map.of("latitude", 37.7749, "longitude", -122.4194)
        ).join();
        
        System.out.println("结果: " + result.getContent());
    }
}
```

---

## 第八部分：MCP 最佳实践

### 安全最佳实践

**1. 最小权限原则**
- 只暴露必要的工具和资源
- 对文件系统访问进行路径限制
- 避免在工具中暴露敏感凭据

**2. 输入验证**
- 使用 Zod/JSON Schema 严格验证所有输入参数
- 对用户输入进行清理和转义

**3. 认证与授权**
- 使用 OAuth 2.0 进行第三方服务认证
- 实现服务器端授权检查

**4. 传输安全**
- 生产环境使用 HTTPS
- 验证 Host/Origin 头防止 DNS 重绑定攻击

### 开发最佳实践

**1. 工具设计**
```typescript
// ✅ 好的设计：清晰的参数描述
server.tool(
  "create_issue",
  "在指定仓库创建一个 GitHub Issue",
  {
    owner: z.string().describe("仓库所有者用户名"),
    repo: z.string().describe("仓库名称"),
    title: z.string().describe("Issue 标题"),
    body: z.string().optional().describe("Issue 详细内容"),
  },
  async ({ owner, repo, title, body }) => { ... }
);

// ❌ 避免：模糊的参数描述
server.tool(
  "create",
  "创建一些东西",
  {
    a: z.string(),
    b: z.string(),
  },
  async ({ a, b }) => { ... }
);
```

**2. 错误处理**
```python
@mcp.tool()
def risky_operation(input: str) -> str:
    try:
        result = perform_operation(input)
        return f"Success: {result}"
    except ValidationError as e:
        return f"Validation error: {e}"
    except ExternalServiceError as e:
        return f"Service unavailable: {e}"
    except Exception as e:
        # 记录日志但不暴露内部细节
        logger.error(f"Unexpected error in risky_operation", exc_info=True)
        return "An unexpected error occurred"
```

**3. 异步处理**
```typescript
server.tool(
  "long_running_task",
  "执行长时间运行的任务",
  { /* schema */ },
  async ({ taskId }) => {
    // 启动任务，返回进度
    const task = startBackgroundTask(taskId);
    
    // 可以通过 progress 通知追踪进度
    return {
      content: [{ type: "text", text: `Task started: ${task.id}` }],
    };
  }
);
```

**4. 日志记录**
```typescript
import { Logger } from "@modelcontextprotocol/sdk/server/logger.js";

const logger = new Logger("weather-server", "debug");

// 在关键操作点记录日志
logger.debug("Fetching weather for", { location });
logger.info("Weather request completed", { 
  location, 
  duration: stopwatch.elapsed() 
});
logger.error("Weather API failed", { error: e.message });
```

### 性能最佳实践

**1. 减少响应大小**
```typescript
// 只返回必要的数据
server.tool(
  "search_database",
  "搜索数据库",
  { query: z.string() },
  async ({ query }) => {
    const results = await db.search(query);
    // 分页或限制返回数量
    const limited = results.slice(0, 10);
    return {
      content: [{
        type: "text",
        text: JSON.stringify(limited)
      }]
    };
  }
);
```

**2. 连接复用**
```python
# Python: 使用上下文管理器自动管理连接
async with MCPClient(stdio_client(["npx", "mcp-server-db"])) as client:
    # 多个工具调用共享连接
    tools = await client.list_tools()
    result1 = await client.call_tool("query1", {...})
    result2 = await client.call_tool("query2", {...})
```

**3. 缓存**
```typescript
const cache = new Map<string, { data: any; expiry: number }>();

server.tool(
  "get_data",
  "获取数据（带缓存）",
  { id: z.string() },
  async ({ id }) => {
    const cached = cache.get(id);
    if (cached && cached.expiry > Date.now()) {
      return { content: [{ type: "text", text: cached.data }] };
    }
    
    const data = await fetchData(id);
    cache.set(id, { data, expiry: Date.now() + 60000 }); // 1分钟缓存
    return { content: [{ type: "text", text: data }] };
  }
);
```

---

## 第九部分：优秀 MCP 开源项目推荐

### 官方参考实现

| 项目 | 仓库 | 说明 |
|------|------|------|
| **Everything Server** | modelcontextprotocol/servers/src/everything | 参考/测试服务器，包含所有功能演示 |
| **Fetch** | modelcontextprotocol/servers/src/fetch | Web 内容获取和转换 |
| **Filesystem** | modelcontextprotocol/servers/src/filesystem | 安全文件操作，可配置访问控制 |
| **Git** | modelcontextprotocol/servers/src/git | Git 仓库读取、搜索和操作 |
| **Memory** | modelcontextprotocol/servers/src/memory | 基于知识图谱的持久化记忆系统 |
| **Sequential Thinking** | modelcontextprotocol/servers/src/sequentialthinking | 动态反思性问题解决 |
| **Time** | modelcontextprotocol/servers/src/time | 时间和时区转换 |

### 官方集成（Official Integrations）

由各公司维护的平台集成 MCP 服务器：

- **Slack** - Slack 消息和频道操作
- **Google Maps** - 地图和位置服务
- **AWS** - AWS 资源管理
- **Azure** - Azure 云服务
- **Cloudflare** - Cloudflare Workers 和 KV

完整列表见：https://github.com/modelcontextprotocol/servers

### 社区优秀项目

#### 数据库类
| 项目 | 说明 |
|------|------|
| **postgres-mcp** | PostgreSQL 数据库连接和查询 |
| **mongodb-mcp** | MongoDB 操作服务器 |
| **mysql-mcp** | MySQL 数据库集成 |
| **sqlite-mcp** | SQLite 轻量级数据库 |

#### 开发工具类
| 项目 | 说明 |
|------|------|
| **brave-search-mcp** | Brave 搜索引擎集成 |
| **github-mcp-server** | GitHub API 完整封装 |
| **gitlab-mcp** | GitLab 集成 |
| **jira-mcp** | Jira 问题追踪集成 |

#### AI/ML 工具类
| 项目 | 说明 |
|------|------|
| **chromadb-mcp** | ChromaDB 向量数据库 |
| **pinecone-mcp** | Pinecone 向量数据库 |
| **weaviate-mcp** | Weaviate 向量搜索引擎 |
| **llm-ollama** | Ollama 本地 LLM 集成 |

#### 办公效率类
| 项目 | 说明 |
|------|------|
| **notion-mcp** | Notion 笔记和数据库 |
| **google-calendar-mcp** | Google 日历 |
| **google-drive-mcp** | Google Drive 文件管理 |
| **linear-mcp** | Linear 项目管理 |
| **slack-mcp** | Slack 消息和工作流 |

### 各语言生态

#### TypeScript/Node.js
```bash
# 快速创建 MCP 服务器模板
npx create-mcp-server my-server

# 常用库
npm install @modelcontextprotocol/sdk zod
```

#### Python
```bash
# 常用框架
pip install mcp fastmcp

# 与 LangChain 集成
pip install langchain-mcp-adapters
```

#### Java
```xml
<!-- Spring AI MCP -->
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-mcp-client-boot-starter</artifactId>
</dependency>
```

### MCP 资源聚合

| 资源 | 地址 |
|------|------|
| **官方文档** | https://modelcontextprotocol.io |
| **规范文档** | https://modelcontextprotocol.io/specification/latest |
| **官方博客** | https://blog.modelcontextprotocol.io |
| **官方 GitHub** | https://github.com/modelcontextprotocol |
| **官方示例** | https://github.com/modelcontextprotocol/quickstart-resources |
| **官方服务器** | https://github.com/modelcontextprotocol/servers |
| **MCP Inspector** | https://github.com/modelcontextprotocol/inspector |
| **服务器注册表** | https://modelcontextprotocol.io/registry/about |

---

## 附录

### MCP 与 Function Calling 的区别

| 维度 | MCP | Function Calling |
|------|-----|------------------|
| **标准化** | 通用开放协议 | 各厂商私有实现 |
| **生态系统** | 一次构建，到处运行 | 需针对每个平台适配 |
| **能力范围** | 工具、资源、提示词 | 仅函数调用 |
| **发现机制** | 运行时自动发现 | 编译时定义 |
| **双向通信** | 支持（通知、进度） | 通常单向 |

### MCP 适用场景

**推荐使用 MCP：**
- 需要连接多个外部数据源/工具
- 希望工具能被多个 AI 应用复用
- 构建需要标准化接口的 Agent 平台
- 需要与他人共享工具生态

**可能不需要 MCP：**
- 简单的单工具集成
- 纯研究/原型项目
- 高度定制化的私有系统

### 版本历史

| 版本 | 发布日期 | 主要变化 |
|------|----------|----------|
| 1.0 | 2024.11 | 初始稳定版本 |
| 2025-03 | 2025.03 | Streamable HTTP 传输 |
| 2025-11 | 2025.11 | 采样、 elicitation、任务支持 |
| 2.0 (规划中) | TBD | 更多协议增强 |

---

*文档更新日期：2026-04-29*
