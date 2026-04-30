---
title: Spring AI 权威指南：从入门到深度应用
published: 2026-04-20
description: 基于 Spring AI 官方参考文档，系统解析 Spring AI 的核心概念、ChatClient API、Tool Calling、RAG、Chat Memory、Advisor 架构等关键技术，助你构建企业级 AI 应用。
image: ''
tags: ['Spring AI', 'Java', 'Spring Boot', 'AI', 'RAG', 'ChatGPT', 'Claude', 'Embedding']
category: 'Java开发'
draft: false
lang: ''
---

## 引言

Spring AI 是 Spring 生态系统中专注于 AI 集成的项目。它的核心使命是：**把企业数据和 APIs 与 AI 模型连接起来**，让 Java 开发者无需深入的机器学习背景，也能构建强大的生成式 AI 应用。

Spring AI 受到了 Python 生态中 LangChain 和 LlamaIndex 的启发，但它并不是简单移植。其设计理念是：**下一波生成式 AI 应用不会只有 Python 开发者，而是会遍及多种编程语言**。

**当前版本**：Spring AI 1.1.4，支持 Spring Boot 3.4.x 和 3.5.x。

---

## 第一部分：基础概念

### AI Models（AI 模型）

AI 模型是设计用来处理和生成信息的算法，通过从大数据集中学习模式和洞察来进行预测。GPT 中的 "P"（Pre-trained，预训练）使其成为通用开发工具，不需要深入的机器学习背景。

Spring AI 支持的模型类型：

| 输入 | 输出 | 模型类型 |
|------|------|----------|
| 文本 | 文本 | Chat Completion（对话补全） |
| 文本 | 数字（向量） | Embedding（嵌入） |
| 文本 | 图片 | Text-to-Image（文生图） |
| 图片 | 文本 | Vision（视觉） |
| 音频 | 文本 | Transcription（语音转文本） |
| 文本 | 音频 | Text-to-Speech（文本转语音） |

### Prompts（提示词）

Prompt 是引导 AI 模型产生特定输出的基础。Prompt 不只是一个简单字符串，在 ChatGPT API 中，Prompt 包含多个文本输入，每个都有角色分配：

- **System Role**：告诉模型如何行为，设置交互上下文
- **User Role**：用户输入

```
┌─────────────────────────────────────────────────────────────┐
│                    Prompt 结构                              │
├─────────────────────────────────────────────────────────────┤
│  System: "你是一个专业的 Java 顾问，简洁且准确"              │
│  User:  "解释一下 Spring AI 的 ChatClient 用法"             │
└─────────────────────────────────────────────────────────────┘
```

Prompt Engineering（提示词工程）既是一门艺术也是一门科学。一个反直觉的例子：研究表明，最有效的提示词之一以 "Take a deep breath and work on this step by step"（深呼吸，一步一步来）开头。

### Prompt Templates（提示词模板）

创建有效提示词涉及建立请求上下文和运行时替换占位符。Spring AI 通过 `PromptTemplate` 类支持这一功能：

```java
// 定义模板
var promptTemplate = PromptTemplate.builder()
    .template("请解释 {concept} 的核心概念")
    .build();

// 运行时替换
Prompt prompt = promptTemplate.create(
    Map.of("concept", "Spring AI")
);
```

---

## 第二部分：核心 API

### ChatClient

`ChatClient` 是 Spring AI 提供的用于与 AI 模型通信的流畅（Fluent）API，风格类似于 `WebClient` 和 `RestClient`。它同时支持同步和流式编程模型。

#### 基本用法

```java
@RestController
class MyController {
    private final ChatClient chatClient;

    public MyController(ChatClient.Builder builder) {
        this.chatClient = builder.build();
    }

    @GetMapping("/ai")
    String generation(String userInput) {
        return this.chatClient.prompt()
            .user(userInput)
            .call()
            .content();
    }
}
```

#### 多模型支持

Spring AI 支持同时使用多个 Chat Model。以下是配置多个不同模型提供商的示例：

```java
@Configuration
public class ChatClientConfig {
    @Bean
    public ChatClient openAiChatClient(OpenAiChatModel chatModel) {
        return ChatClient.create(chatModel);
    }

    @Bean
    public ChatClient anthropicChatClient(AnthropicChatModel chatModel) {
        return ChatClient.create(chatModel);
    }
}
```

使用时通过 `@Qualifier` 注入：

```java
@Configuration
public class ChatClientExample {
    @Bean
    CommandLineRunner cli(
        @Qualifier("openAiChatClient") ChatClient openAiChatClient,
        @Qualifier("anthropicChatClient") ChatClient anthropicChatClient) {
        return args -> {
            // 根据用户选择使用不同的 client
        };
    }
}
```

#### 返回值类型

ChatClient 的 `call()` 和 `stream()` 方法支持多种返回值：

| 方法 | 返回类型 |
|------|----------|
| `.call().content()` | `String` — 纯文本响应 |
| `.call().entity(MyClass.class)` | `MyClass` — 结构化对象 |
| `.call().chatResponse()` | `ChatResponse` — 完整响应对象 |
| `.stream()` | `Flux<String>` — 流式文本 |

#### 消息元数据

```java
// 添加用户消息元数据
this.chatClient.prompt()
    .user(u -> u.text(userInput).metadata("priority", "high"))
    .call()
    .content();

// 添加系统消息元数据
this.chatClient.prompt()
    .system(s -> s.text("You are helpful").metadata("role", "assistant"))
    .user(userInput)
    .call()
    .content();
```

#### 默认系统文本

```java
// 全局默认系统提示
ChatClient chatClient = ChatClient.builder(chatModel)
    .defaultSystemPrompt("你是一个 {role} 助手")
    .build();

// 使用时指定参数
chatClient.prompt()
    .system(s -> s.param("role", "Java"))
    .user("解释 Spring")
    .call()
    .content();
```

---

## 第三部分：Structured Output（结构化输出）

LLM 输出结构化数据对依赖可靠解析输出的下游应用至关重要。Spring AI 的 Structured Output Converters 将 AI 模型输出转换为 Java 类、JSON、XML 等结构化格式。

### 工作原理

```
                     LLM Call
Prompt + Format Instructions ──────────────┐
                                           │
   Before Call:                            │
   • Converter 添加格式指令到 prompt        │     After Call:
                                           │     • Converter 解析原始文本
                                           │     • 映射到目标数据结构
                                           ▼
                    Raw Text Output ──────────────▶ Structured Data (Java POJO)
```

### 基本用法

```java
// 定义目标类
public class Movie {
    private String title;
    private int releaseYear;
    private String genre;
    // getters and setters
}

// 获取结构化输出
Movie movie = chatClient.prompt()
    .user("推荐一部科幻电影")
    .call()
    .entity(Movie.class);
```

### Native Structured Output

随着更多 AI 模型原生支持结构化输出，Spring AI 通过 `AdvisorParams.ENABLE_NATIVE_STRUCTURED_OUTPUT` 提供支持：

```java
// 使用模型原生结构化输出能力
ChatResponse response = chatClient.prompt()
    .user(userInput)
    .advisors(a -> a.param("enable-native-structured-output", true))
    .call()
    .chatResponse();
```

**注意**：`StructuredOutputConverter` 不用于 Tool Calling，因为该功能本身提供结构化输出。

---

## 第四部分：Tool Calling（工具调用）

Tool Calling（也称 Function Calling）是 AI 应用中的常见模式，允许模型与一组 API（工具）交互以增强其能力。

### 核心概念

```
┌──────────────────────────────────────────────────────────────┐
│                      Tool Calling 流程                         │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   User ──▶ LLM ──▶ Tool Request ──▶ Your Code ──▶ Result      │
│              ▲                        │                       │
│              │                        ▼                       │
│              └────────────────── (Loop if needed)            │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 定义工具的方式

#### 1. 方法作为工具（@Tool 或 @Bean）

```java
@Component
public class WeatherService {

    @Tool(description = "获取指定城市的当前天气")
    public String getWeather(String city) {
        // 调用天气 API
        return "北京今天晴，25°C";
    }

    @Tool(description = "获取指定城市的天气预报")
    public String getForecast(String city, @ToolParam("天数") int days) {
        // 调用天气预报 API
        return "北京未来" + days + "天晴";
    }
}
```

#### 2. 函数作为工具（FunctionToolCallback）

```java
@Bean
public FunctionToolCallback weatherTool(WeatherService weatherService) {
    return FunctionToolCallback.builder(weatherService, WeatherService.class)
        .description("获取天气信息")
        .inputSchema(schemaFromClass(WeatherRequest.class))
        .build();
}
```

### 工具执行模式

Spring AI 提供三种工具执行控制方式：

| 模式 | 说明 |
|------|------|
| **Framework-Controlled** | 框架自动执行工具调用（默认） |
| **Advisor-Controlled** | 通过 `ToolCallAdvisor` 控制执行 |
| **User-Controlled** | 用户手动控制工具执行 |

```java
// Framework-Controlled（默认）
ChatResponse response = chatClient.prompt()
    .tools(weatherTool)
    .user("北京天气怎么样？")
    .call()
    .chatResponse();

// User-Controlled - 返回 ToolCall 而不是自动执行
ChatResponse response = chatClient.prompt()
    .tools(weatherTool)
    .user("北京天气怎么样？")
    .advisors(new UserControlledToolExecutionAdvisor())
    .call()
    .chatResponse();
```

### 工具回调与定义

```java
// 工具定义包含：
// - name: 工具名称
// - description: 工具描述（模型据此决定是否调用）
// - inputSchema: 输入参数的 JSON Schema

// 工具结果转换
// 框架自动将工具返回结果转换为模型可读的格式

// 工具上下文
// ToolContext 允许在多次工具调用间共享状态
```

### 异常处理

```java
// 工具执行异常会被捕获并转换为适当的响应
// 可以通过自定义 ToolCallAdvisor 来处理特定异常
```

---

## 第五部分：Chat Memory（对话记忆）

LLM 是无状态的，不会保留之前交互的信息。Spring AI 的 Chat Memory 功能允许跨多次交互存储和检索信息。

### 关键区分

| 概念 | 说明 |
|------|------|
| **Chat Memory** | 大型语言模型用于在对话中保持上下文感知的信息 |
| **Chat History** | 完整的对话历史，包括所有交换的消息 |

### 快速入门

```java
@Autowired
ChatMemory chatMemory;

// 存储消息
chatMemory.add(conversationId, new UserMessage("你好"));
chatMemory.add(conversationId, new AssistantMessage("你好，有什么可以帮助你的？"));

// 检索相关消息
List<Message> history = chatMemory.get(conversationId, new MessageWindowRequest(10));
```

### 内存类型

Spring AI 提供多种内存管理策略：

```java
// 消息窗口内存 - 保留最近 N 条消息
MessageWindowChatMemory memory = MessageWindowChatMemory.builder()
    .chatMemoryRepository(inMemoryChatMemoryRepository)
    .maxMessages(10)
    .build();

// 摘要内存 - 自动摘要旧消息
SummaryChatMemory memory = SummaryChatMemory.builder()
    .chatMemoryRepository(inMemoryChatMemoryRepository)
    .build();
```

### 在 ChatClient 中使用

```java
ChatMemory chatMemory = new InMemoryChatMemory();

ChatClient chatClient = ChatClient.builder(chatModel)
    .defaultAdvisors(
        MessageChatMemoryAdvisor.builder(chatMemory)
            .build()
    )
    .build();

// 运行时指定会话 ID
String response = chatClient.prompt()
    .advisors(a -> a.param(ChatMemory.CONVERSATION_ID, "user-123"))
    .user("接着上次的讨论继续")
    .call()
    .content();
```

---

## 第六部分：Advisors（顾问）架构

Advisors API 是 Spring AI 最强大的特性之一，提供了拦截、修改和增强 AI 交互的灵活方式。

### 核心价值

1. **封装常见模式**：RAG、Chat Memory 等开箱即用
2. **数据转换**：在数据发送到 LLM 前和从 LLM 接收后进行转换
3. **跨模型可移植性**：同一个 Advisor 可用于不同模型

### 工作原理

```
┌─────────────────────────────────────────────────────────────────┐
│                      Advisor Chain 流程                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ChatClientRequest ──▶ Advisor 1 ──▶ Advisor 2 ──▶ ... ──▶ LLM │
│                          │                                      │
│                          ▼                                      │
│                    [可能阻止请求或修改数据]                        │
│                                                                  │
│  LLM Response ──▶ Advisor N ──▶ ... ──▶ Advisor 2 ──▶ Advisor 1 │
│                                    │                            │
│                                    ▼                            │
│                              ChatClientResponse                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 核心组件

| 组件 | 说明 |
|------|------|
| `CallAdvisor` | 非流式场景的顾问接口 |
| `CallAdvisorChain` | 顾问调用链 |
| `StreamAdvisor` | 流式场景的顾问接口 |
| `ChatClientRequest` | 包含 Prompt 和共享上下文 |
| `ChatClientResponse` | 包含响应和共享上下文 |

### 执行顺序

顾问链的执行顺序由 `getOrder()` 方法决定：

- **较低 order 值**：先执行（请求处理先，响应处理后）
- **较高 order 值**：后执行（请求处理后，响应处理先）

```java
// 设置顾问顺序
@Component
public class MyAdvisor implements CallAdvisor {
    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE; // 先执行
    }
}
```

### 内置 Advisors

#### QuestionAnswerAdvisor（RAG 问答）

```java
// 确保数据已加载到 VectorStore
var qaAdvisor = QuestionAnswerAdvisor.builder(vectorStore)
    .searchRequest(SearchRequest.builder()
        .similarityThreshold(0.8)
        .topK(6)
        .build())
    .build();

String response = chatClient.prompt()
    .advisors(qaAdvisor)
    .user("关于 Spring AI 的问题？")
    .call()
    .content();
```

#### MessageChatMemoryAdvisor（对话记忆）

```java
var chatMemoryAdvisor = MessageChatMemoryAdvisor.builder(chatMemory)
    .build();

ChatClient chatClient = ChatClient.builder(chatModel)
    .defaultAdvisors(chatMemoryAdvisor)
    .build();
```

### 自定义 Advisor

```java
@Component
public class LoggingAdvisor implements CallAdvisor {

    @Override
    public String getName() {
        return "logging";
    }

    @Override
    public int getOrder() {
        return 0;
    }

    @Override
    public ChatClientResponse adviseCall(
            ChatClientRequest request,
            CallAdvisorChain chain) {
        
        // 请求前处理
        System.out.println("Request: " + request.getPrompt());
        
        // 继续调用链
        ChatClientResponse response = chain.next(request);
        
        // 响应后处理
        System.out.println("Response: " + response.getResult());
        
        return response;
    }
}
```

---

## 第七部分：RAG（检索增强生成）

RAG 是一种解决大语言模型在长文本内容、事实准确性和上下文感知方面局限性的技术。

### 核心问题

```
┌─────────────────────────────────────────────────────────────┐
│  LLM 的局限性                                                │
├─────────────────────────────────────────────────────────────┤
│  • 缺乏企业私有数据                                           │
│  • 训练数据截止日期后的信息                                    │
│  • 长文档处理能力有限                                          │
│  • 可能产生"幻觉"（hallucination）                            │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  RAG 解决方案                                                 │
├─────────────────────────────────────────────────────────────┤
│  1. 将文档分块并存储到 Vector Store                           │
│  2. 用户提问时，先检索相关文档                                 │
│  3. 将相关文档作为上下文提供给 LLM                             │
│  4. LLM 基于真实文档内容生成回答                               │
└─────────────────────────────────────────────────────────────┘
```

### Spring AI RAG 流程

```
User Question
      │
      ▼
┌─────────────┐     ┌──────────────┐     ┌─────────┐
│  Embedding  │────▶│ Vector Store │◀────│  Search │
│   Model     │     │  (检索相似)  │     │ Request │
└─────────────┘     └──────────────┘     └─────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │  Retrieved Documents   │
              │  (相关文档 + 用户问题)   │
              └────────────────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │     LLM     │
                    │  (生成回答)  │
                    └─────────────┘
```

### VectorStore 配置

Spring AI 支持多种向量数据库：

| 向量数据库 | 支持情况 |
|-----------|---------|
| PostgreSQL/PGVector | ✅ |
| Redis | ✅ |
| Pinecone | ✅ |
| Milvus | ✅ |
| Neo4j | ✅ |
| Elasticsearch | ✅ |
| MongoDB Atlas | ✅ |
| Weaviate | ✅ |
| Qdrant | ✅ |
| Chroma | ✅ |
| Azure Cosmos DB | ✅ |
| Apache Cassandra | ✅ |

### 完整 RAG 示例

```java
@Configuration
public class RAGConfig {
    
    @Bean
    public VectorStore vectorStore(EmbeddingModel embeddingModel) {
        // 使用 PGVector 作为存储
        return PgVectorStore.builder(embeddingModel, jdbcTemplate)
            .tableName("document_vectors")
            .build();
    }
}

// 数据加载
@Service
public class DocumentService {
    
    @Autowired
    private VectorStore vectorStore;
    
    public void loadDocument(String content, String metadata) {
        Document document = new Document(content, Map.of("source", metadata));
        
        List<Document> documents = List.of(document);
        vectorStore.accept(documents);
    }
}

// RAG 问答
@Service
public class QAService {
    
    @Autowired
    private ChatClient chatClient;
    
    @Autowired
    private VectorStore vectorStore;
    
    public String answerQuestion(String question) {
        var qaAdvisor = QuestionAnswerAdvisor.builder(vectorStore)
            .searchRequest(SearchRequest.builder()
                .similarityThreshold(0.8)
                .topK(5)
                .build())
            .build();
        
        return chatClient.prompt()
            .advisors(qaAdvisor)
            .user(question)
            .call()
            .content();
    }
}
```

### 自定义 RAG 模板

```java
PromptTemplate customPromptTemplate = PromptTemplate.builder()
    .renderer(StTemplateRenderer.builder()
        .startDelimiterToken('<')
        .endDelimiterToken('>')
        .build())
    .template("""
        <query>
        上下文信息如下：
        ---------------------
        <question_answer_context>
        ---------------------
        基于以上上下文信息回答问题。如果上下文中没有答案，请直接说明不知道。
        回答时避免使用"根据上下文..."等表述。
        """)
    .build();

QuestionAnswerAdvisor qaAdvisor = QuestionAnswerAdvisor.builder(vectorStore)
    .promptTemplate(customPromptTemplate)
    .build();
```

---

## 第八部分：Model Context Protocol (MCP)

MCP 是一种新兴的标准化协议，用于 AI 模型与外部工具和数据源的连接。

### MCP 架构

```
┌─────────────────────────────────────────────────────────────┐
│                        MCP 架构                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌─────────────┐         ┌─────────────┐                   │
│   │ MCP Client  │◀───────▶│ MCP Server  │                   │
│   │  (Spring)   │   STDIO  │  (数据源)   │                   │
│   └─────────────┘         └─────────────┘                   │
│         │                                                   │
│         ▼                                                   │
│   ┌─────────────┐                                           │
│   │   Tools     │                                           │
│   │   Resources  │                                           │
│   │   Prompts   │                                           │
│   └─────────────┘                                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Spring AI MCP 支持

Spring AI 提供 MCP Client 和 Server 的 Boot Starter：

```xml
<!-- MCP Client -->
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-mcp-client-boot-starter</artifactId>
</dependency>

<!-- MCP Server -->
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-mcp-server-boot-starter</artifactId>
</dependency>
```

### MCP 服务器类型

| 类型 | 说明 |
|------|------|
| STDIO | 标准输入/输出，适合本地进程 |
| SSE | Server-Sent Events，适合 Web 集成 |
| Streamable HTTP | 支持流式 HTTP 传输 |
| Stateless Streamable HTTP | 无状态流式 HTTP |

---

## 第九部分：Embedding（嵌入）与向量存储

Embedding 是将文本转换为数字向量的技术，使语义相似的内容在向量空间中接近。

### 基本用法

```java
@Autowired
EmbeddingModel embeddingModel;

// 创建嵌入
EmbeddingRequest request = new EmbeddingRequest(
    List.of("Hello world", "Spring AI is great"),
    EmbeddingOptions.defaults()
);

EmbeddingResponse response = embeddingModel.call(request);

for (Embedding embedding : response.getResults()) {
    System.out.println(embedding.getContents());
    System.out.println(Arrays.toString(embedding.getEmbedding()));
}
```

### 在 RAG 中使用

```java
// 文档自动转换为 embeddings 并存储
vectorStore.accept(List.of(new Document(content)));

// 检索时自动进行 embedding 并相似度搜索
List<Document> similarDocs = vectorStore.similaritySearch(
    SearchRequest.builder()
        .query(userQuestion)
        .topK(5)
        .build()
);
```

---

## 第十部分：Observability（可观测性）

Spring AI 基于 Spring 生态系统的可观测性功能，为 AI 相关操作提供洞察。

### 依赖配置

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

### 监控内容

Spring AI 为以下组件提供指标和追踪：

- `ChatClient`（包括 Advisor）
- `ChatModel`
- `EmbeddingModel`
- `ImageModel`
- `VectorStore`

### 配置项

| 属性 | 说明 |
|------|------|
| `spring.ai.chat.client.observations.log-prompt` | 记录 prompt 内容 |
| `spring.ai.chat.client.observations.log-completion` | 记录完成内容 |
| `spring.ai.vectorstore.observations.log-query-response` | 记录向量查询响应 |

---

## 第十一部分：ETL Pipeline（数据管道）

Spring AI 提供文档摄取 ETL 框架，用于数据工程。

### 功能

- 文档解析（PDF、Markdown、HTML 等）
- 文档分块（按段落、按 token 数等）
- 元数据提取
- 向量化存储

```java
@Component
public class DocumentIngestionService {
    
    @Autowired
    private DocumentLoader documentLoader;
    
    @Autowired
    private TextSplitter textSplitter;
    
    @Autowired
    private VectorStore vectorStore;
    
    public void ingestDocument(File file) {
        // 1. 加载文档
        Document document = documentLoader.load(file);
        
        // 2. 分块
        List<Document> chunks = textSplitter.split(document);
        
        // 3. 存储到向量数据库
        vectorStore.accept(chunks);
    }
}
```

---

## 第十二部分：多模型支持一览

Spring AI 支持的模型提供商：

| 提供商 | Chat | Embedding | Image | Audio |
|--------|------|----------|-------|-------|
| OpenAI | ✅ | ✅ | ✅ | ✅ |
| Anthropic | ✅ | - | - | ✅ |
| Azure OpenAI | ✅ | ✅ | ✅ | ✅ |
| Google Gemini | ✅ | ✅ | ✅ | ✅ |
| Amazon Bedrock | ✅ | ✅ | ✅ | - |
| Hugging Face | ✅ | ✅ | - | - |
| Ollama | ✅ | ✅ | - | - |
| DeepSeek | ✅ | ✅ | - | - |
| Moonshot AI | ✅ | ✅ | - | - |
| MiniMax | ✅ | ✅ | - | - |
| NVIDIA | ✅ | ✅ | - | - |
| Cohere | ✅ | ✅ | - | - |

---

## 第十三部分：实战模式与最佳实践

### 模式一：简单问答

```java
String response = chatClient.prompt()
    .user("解释 Spring Boot 的自动配置")
    .call()
    .content();
```

### 模式二：带上下文的问答（RAG）

```java
String response = chatClient.prompt()
    .advisors(new QuestionAnswerAdvisor(vectorStore))
    .user("我的文档中关于 X 是怎么说的？")
    .call()
    .content();
```

### 模式三：多轮对话

```java
ChatMemory chatMemory = new InMemoryChatMemory();

ChatClient chatClient = ChatClient.builder(chatModel)
    .defaultAdvisors(MessageChatMemoryAdvisor.builder(chatMemory).build())
    .build();

// 多轮对话
chatClient.prompt()
    .advisors(a -> a.param(ChatMemory.CONVERSATION_ID, "session-1"))
    .user("我想学习 Spring")
    .call()
    .content();

chatClient.prompt()
    .advisors(a -> a.param(ChatMemory.CONVERSATION_ID, "session-1"))
    .user("它和 Spring Boot 有什么关系？")
    .call()
    .content();
```

### 模式四：带工具调用的自主Agent

```java
ChatResponse response = chatClient.prompt()
    .tools(weatherTool, calendarTool, emailTool)
    .system("""
        你是一个智能助手，可以调用工具来完成用户任务。
        如果需要实时信息，使用工具获取。
        """)
    .user("帮我安排明天下午三点的会议，并通知参与者")
    .call()
    .chatResponse();
```

### 最佳实践

```
┌─────────────────────────────────────────────────────────────────┐
│                    Spring AI 最佳实践                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. 优先使用 ChatClient API                                      │
│     • 更流畅的 API 设计                                          │
│     • 自动资源管理                                                │
│     • 更好的类型安全                                              │
│                                                                  │
│  2. 善用 Advisors                                                 │
│     • RAG、Chat Memory 等开箱即用                                  │
│     • 通过组合而非继承扩展                                        │
│                                                                  │
│  3. 工具定义要清晰                                                │
│     • description 要描述工具用途                                   │
│     • inputSchema 要完整且准确                                     │
│                                                                  │
│  4. 向量数据库选择                                                 │
│     • 开发环境：H2 / in-memory                                    │
│     • 生产环境：根据数据量和并发选择                               │
│                                                                  │
│  5. 关注可观测性                                                  │
│     • 配置 Actuator 端点                                          │
│     • 使用 tracing 调试复杂流程                                    │
│                                                                  │
│  6. 错误处理                                                      │
│     • AI 输出需要验证                                              │
│     • Tool 执行异常要妥善处理                                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 总结

Spring AI 为 Java 开发者打开了生成式 AI 的大门。其核心设计理念：

1. **抽象优先**：通过统一抽象层连接不同 AI 提供商，组件可替换
2. **Spring 生态深度集成**：与 Spring Boot、Spring Data 等无缝配合
3. **工程化思维**：Choreography（编排）模式、Advisor 架构、可观测性

**学习路径建议**：

```
第1步：掌握 ChatClient 基本用法
         ↓
第2步：理解 Prompt Templates 和 Structured Output
         ↓
第3步：学习 Tool Calling 实现工具调用
         ↓
第4步：掌握 Chat Memory 实现多轮对话
         ↓
第5步：深入 Advisor 架构
         ↓
第6步：实践 RAG 实现私有知识问答
         ↓
第7步：探索 MCP 协议和高级集成
```

---

## 参考资源

- [Spring AI 官方文档](https://docs.spring.io/spring-ai/reference/)
- [Spring AI GitHub](https://github.com/spring-projects/spring-ai)
- [Spring AI Guides](https://spring.io/guides/topics/spring-ai/)
- [Spring Initializr](https://start.spring.io/) — 创建 Spring AI 项目

---

*本文基于 Spring AI 1.1.4 官方参考文档整理，2026年4月*
