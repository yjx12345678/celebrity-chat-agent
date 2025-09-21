const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const CryptoJS = require('crypto-js');
const { v4: uuidv4 } = require('uuid');

const app = express();

const port = process.env.PORT || 80;

// 星火API配置 - 使用环境变量
const sparkConfig = {
    APPID: process.env.SPARK_APPID || "11fa6957",
    APISecret: process.env.SPARK_APISECRET || "YWFiNDc3NnnRhMDkxMjhhZDFiYjE2OVEW",
    APIKey: process.env.SPARK_APIKEY || "157667d9f972963adacc2bc7a506f55f",
    host: "spark-api.xf-yun.com",
    path: "/v1.1/chat",
};

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

function generateAuthUrl() {
    const host = sparkConfig.host;
    const path = sparkConfig.path;
    const date = new Date().toUTCString();

    const signatureOrigin = `host: ${host}\ndate: ${date}\nGET ${path} HTTP/1.1`;

    const signatureSha = CryptoJS.HmacSHA256(signatureOrigin, sparkConfig.APISecret);
    const signature = CryptoJS.enc.Base64.stringify(signatureSha);

    const authorizationOrigin = `api_key="${sparkConfig.APIKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
    const authorization = Buffer.from(authorizationOrigin).toString('base64');

    return `wss://${host}${path}?authorization=${authorization}&date=${encodeURIComponent(date)}&host=${encodeURIComponent(host)}`;
}

app.post('/chat', async (req, res) => {
    try {
        const { message, celebrity, history, systemPrompt } = req.body;

        const authUrl = generateAuthUrl();
        const ws = new WebSocket(authUrl);
        
        let responseText = '';
        let resolved = false;

        const timeout = setTimeout(() => {
            if (!resolved) {
                resolved = true;
                ws.close();
                res.status(408).json({ 
                    success: false, 
                    error: '请求超时' 
                });
            }
        }, 15000); 
        
        ws.on('open', () => {

            const requestData = {
                header: {
                    app_id: sparkConfig.APPID,
                    uid: uuidv4().slice(0, 10),
                },
                parameter: {
                    chat: {
                        domain: "general",
                        temperature: 0.5,
                        max_tokens: 1024,
                    }
                },
                payload: {
                    message: {
                        text: [
                            { role: 'system', content: systemPrompt },
                            ...history.map(msg => ({
                                role: msg.role === 'user' ? 'user' : 'assistant',
                                content: msg.content
                            }))
                        ]
                    }
                }
            };
            
            ws.send(JSON.stringify(requestData));
        });
        
        ws.on('message', (data) => {
            const response = JSON.parse(data);
            
            if (response.header.code !== 0) {
                clearTimeout(timeout);
                resolved = true;
                ws.close();
                res.status(500).json({ 
                    success: false, 
                    error: `API错误: ${response.header.message}`,
                    code: response.header.code
                });
                return;
            }

            responseText += response.payload.choices.text[0].content;
  
            if (response.header.status === 2) {
                clearTimeout(timeout);
                resolved = true;
                ws.close();
                res.json({ 
                    success: true, 
                    response: responseText 
                });
            }
        });
        
        ws.on('error', (error) => {
            clearTimeout(timeout);
            resolved = true;
            res.status(500).json({ 
                success: false, 
                error: `WebSocket错误: ${error.message}` 
            });
        });
        
        ws.on('close', () => {
            if (!resolved) {
                clearTimeout(timeout);
                resolved = true;
                res.status(500).json({ 
                    success: false, 
                    error: '连接意外关闭' 
                });
            }
        });
        
    } catch (error) {
        console.error('处理请求时出错:', error);
        res.status(500).json({ 
            success: false, 
            error: `服务器错误: ${error.message}` 
        });
    }
});

// 启动服务器
app.listen(port, () => {
    console.log(`服务器运行在端口 ${port}`);
});
