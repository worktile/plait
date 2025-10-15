import express, { Request, Response } from 'express';
import cors from 'cors';
import MCPClient from './mcp-client';
import axios from 'axios';
import { config } from './config';
import { elements, PlaitElement } from './types/element';
import { generateId } from './utils';
import {
    BatchCreatedMessage,
    ElementCreatedMessage,
    ElementDeletedMessage,
    ElementUpdatedMessage,
    InitialElementsMessage,
    SyncStatusMessage,
    WebSocketMessage
} from './types/message';
import { WebSocketServer } from 'ws';
import { createServer, Server } from 'http';
import WebSocket from 'ws';
import { toolNames } from './tools/tools';
import { ChatInputMessageItem, ChatInputMessages, ChatMessages } from './types/chat';
import dotenv from 'dotenv';
import { toolAuxiliaryPrompt } from './tools/schemas';

// 加载环境变量
dotenv.config();
class APIServer {
    private app: express.Application;
    private mcpClient: MCPClient;
    private wss: WebSocketServer;
    private clients: Set<WebSocket>;
    private historyMessages: ChatMessages = [];
    constructor() {
        this.app = express();
        this.mcpClient = new MCPClient();
        this.setupMiddleware();
        this.setupRoutes();
        const server = createServer(this.app);
        this.wss = new WebSocketServer({ server });
        this.initialize(server);
        this.clients = new Set<WebSocket>();
    }

    setupMiddleware() {
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.static('public'));
    }

    setupRoutes() {
        this.app.get('/', async (req: Request, res: Response) => {
            res.send('ok');
        });

        // 获取可用工具
        this.app.get('/api/tools', async (req: Request, res: Response) => {
            const tools = this.mcpClient.getAvailableTools();
            res.json({ tools });
        });

        // 调用工具
        this.app.post('/api/call-tool', async (req: Request, res: Response) => {
            try {
                const { tool_name, arguments: args } = req.body;
                const result = await this.mcpClient.callTool(tool_name, args);
                res.json({ success: true, result });
            } catch (error: any) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // 调用大模型 API
        this.app.post('/api/chat', async (req: Request, res: Response) => {
            try {
                const { messages, useTools = true } = req.body;
                const inputMessages: ChatMessages = (messages as ChatInputMessages).map((x: ChatInputMessageItem) => {
                    return {
                        role: x.role,
                        content: x.text
                    };
                });
                this.historyMessages.push(...inputMessages);
                const response = await this.processWithLLM(this.historyMessages, useTools);
                res.json({ role: 'ai', text: response });
            } catch (error: any) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // 健康检查
        this.app.get('/api/health', async (req: Request, res: Response) => {
            res.json({
                status: 'healthy',
                availableTools: this.mcpClient.getAvailableTools().length
            });
        });

        // 获取所有元素
        this.app.get('/api/elements', async (req: Request, res: Response) => {
            try {
                const elementsArray = Array.from(elements.values());
                res.json({
                    success: true,
                    elements: elementsArray,
                    count: elementsArray.length
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: (error as Error).message
                });
            }
        });

        // 添加元素
        this.app.post('/api/elements', async (req: Request, res: Response) => {
            try {
                const params = req.body;

                // Prioritize passed ID (for MCP sync), otherwise generate new ID
                const id = await generateId();
                const element: PlaitElement = {
                    id,
                    ...params
                };

                elements.set(id, element);

                // Broadcast to all connected clients
                const message: ElementCreatedMessage = {
                    type: 'element_created',
                    element: element
                };
                this.broadcast(message);

                res.json({
                    success: true,
                    element: element
                });
            } catch (error) {
                res.status(400).json({
                    success: false,
                    error: (error as Error).message
                });
            }
        });
        // 更新元素
        this.app.put('/api/elements/:id', async (req: Request, res: Response) => {
            try {
                const { id } = req.params;
                const updates = { id, ...req.body };

                if (!id) {
                    return res.status(400).json({
                        success: false,
                        error: 'Element ID is required'
                    });
                }

                const existingElement = elements.get(id);
                if (!existingElement) {
                    return res.status(404).json({
                        success: false,
                        error: `Element with ID ${id} not found`
                    });
                }

                const updatedElement: PlaitElement = {
                    ...existingElement,
                    ...updates
                };

                elements.set(id, updatedElement);

                // Broadcast to all connected clients
                const message: ElementUpdatedMessage = {
                    type: 'element_updated',
                    element: updatedElement
                };
                this.broadcast(message);

                res.json({
                    success: true,
                    element: updatedElement
                });
            } catch (error) {
                res.status(400).json({
                    success: false,
                    error: (error as Error).message
                });
            }
        });

        this.app.delete('/api/elements/:id', async (req: Request, res: Response) => {
            try {
                const { id } = req.params;

                if (!id) {
                    return res.status(400).json({
                        success: false,
                        error: 'Element ID is required'
                    });
                }

                if (!elements.has(id)) {
                    return res.status(404).json({
                        success: false,
                        error: `Element with ID ${id} not found`
                    });
                }

                elements.delete(id);

                // Broadcast to all connected clients
                const message: ElementDeletedMessage = {
                    type: 'element_deleted',
                    elementId: id!
                };
                this.broadcast(message);

                res.json({
                    success: true,
                    message: `Element ${id} deleted successfully`
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: (error as Error).message
                });
            }
        });

        this.app.post('/api/elements/batch', async (req: Request, res: Response) => {
            try {
                const elementsToCreate = req.body;

                if (!Array.isArray(elementsToCreate)) {
                    return res.status(400).json({
                        success: false,
                        error: 'Expected an array of elements'
                    });
                }
                const createdElements: PlaitElement[] = [];
                for (const elementData of elementsToCreate) {
                    const id = await generateId();
                    const element: PlaitElement = {
                        id,
                        ...elementData
                    };
                    elements.set(id, element);
                    createdElements.push(element);
                }
                // Broadcast to all connected clients
                const message: BatchCreatedMessage = {
                    type: 'elements_batch_created',
                    elements: createdElements
                };
                this.broadcast(message);

                res.json({
                    success: true,
                    elements: createdElements,
                    count: createdElements.length
                });
            } catch (error) {
                res.status(400).json({
                    success: false,
                    error: (error as Error).message
                });
            }
        });
    }

    broadcast(message: WebSocketMessage): void {
        const data = JSON.stringify(message);
        this.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
    }

    async processWithLLM(messages: ChatMessages, useTools = true) {
        if (!useTools) {
            // 直接调用 OpenAI API
            return await this.callOpenAI(messages);
        }

        // 分析用户意图，决定是否使用工具
        const tools = this.mcpClient.getAvailableTools();
        const toolDescriptions = tools
            .map((tool) => `工具: ${tool.name}\n描述: ${tool.description}\n参数: ${JSON.stringify(tool.parameters)}`)
            .join('\n\n');

        const systemPrompt = `你是一个流程图生成助手，你需要根据流程图生成对应的流程图代码:
${toolDescriptions}
如果调用工具，返回: {"action": "call_tool", "tool": "工具名称", "args": {参数对象}}
${toolAuxiliaryPrompt}`;

        const content = await this.callOpenAI([{ role: 'system', content: systemPrompt }, ...messages]);
        const decision = this.extractJSONFromResponse(content);

        try {
            if (decision.action === 'call_tool' || toolNames.includes(decision.type)) {
                // 调用工具
                const toolName = decision.tool || decision.type;
                await this.mcpClient.callTool(toolName, decision);
            }
        } catch (error) {
            // 如果 JSON 解析失败，直接返回分析结果
            throw error;
        }
        return content;
    }

    async callOpenAI(messages: ChatMessages) {
        try {
            const apiKey = process.env.CLAUDE_API_KEY;
            const baseURL = config.claude.baseUrl;

            if (!apiKey) {
                throw new Error('OpenAI API key not configured');
            }

            const payload = {
                model: config.claude.model,
                messages: Array.isArray(messages) ? messages : [{ role: 'user', content: messages }],
                max_tokens: config.claude.maxTokens,
                temperature: config.claude.temperature
            };

            const response = await axios.post(`${baseURL}/chat/completions`, payload, {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            const content = response.data.choices[0].message.content;
            return content;
            // return this.extractJSONFromResponse(content);
        } catch (error: any) {
            console.error('OpenAI API error:', error.response?.data || error.message);

            // 模拟回退响应（当没有 API key 时）
            if (error.response?.status === 401) {
                return `这是一个模拟响应（需要配置 OPENAI_API_KEY 环境变量来使用真实 AI）\n\n用户消息: ${messages}`;
            }

            throw new Error(`AI service error: ${error.message}`);
        }
    }

    private extractJSONFromResponse(response: string): any {
        response.replaceAll('\n', '').trim();
        const jsonLikeRegex = /\{[\s\S]*\}/g;
        const jsonLikeMatches = response.match(jsonLikeRegex);

        if (jsonLikeMatches) {
            // 从最长的匹配开始尝试解析
            const sortedMatches = jsonLikeMatches.sort((a, b) => b.length - a.length);

            for (const match of sortedMatches) {
                try {
                    return JSON.parse(match);
                } catch (e) {
                    // 继续尝试下一个匹配项
                    continue;
                }
            }
        } else {
            return response;
        }
    }

    async initialize(server: Server) {
        const PORT = 3000;
        const HOST = 'localhost';
        server.listen(PORT, HOST, () => {
            console.log(`POC server running on http://${HOST}:${PORT}`);
            console.log(`WebSocket server running on ws://${HOST}:${PORT}`);
            console.log('  GET  /api/tools - 查看可用工具');
            console.log('  POST /api/call-tool - 调用工具');
            console.log('  POST /api/chat - 与AI对话');
            console.log('  GET /api/elements - 获取所有元素');
            console.log('  POST /api/elements - 新建节点');
            console.log('  POST /api/elements/batch - 批量新建节点');
            console.log('  PUT /api/elements/:id - 更新节点');
            console.log('  DEL /api/elements/:id - 删除节点');
            console.log('  GET  /api/health - 健康检查');
        });
        this.wss.on('connection', (ws: WebSocket) => {
            this.clients.add(ws);

            // Send current elements to new client
            const initialMessage: InitialElementsMessage = {
                type: 'initial_elements',
                elements: Array.from(elements.values())
            };
            ws.send(JSON.stringify(initialMessage));

            // Send sync status to new client
            const syncMessage: SyncStatusMessage = {
                type: 'sync_status',
                elementCount: elements.size,
                timestamp: new Date().toISOString()
            };
            ws.send(JSON.stringify(syncMessage));

            ws.on('close', () => {
                this.clients.delete(ws);
            });

            ws.on('error', (error) => {
                this.clients.delete(ws);
            });
        });
    }
}

// 启动服务器
(async () => {
    new APIServer();
})();
