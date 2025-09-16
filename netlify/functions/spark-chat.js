import CryptoJS from 'crypto-js';

export const handler = async function(event, context) {
    console.log('收到请求:', event.body);
    
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
    
    try {
        const body = JSON.parse(event.body);
        const { message, celebrity, history } = body;
        
        if (!message) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: '消息不能为空' })
            };
        }
        
        // 调试：检查环境变量
        const API_KEY = process.env.SPARK_API_KEY;
        const API_SECRET = process.env.SPARK_API_SECRET;
        const APP_ID = process.env.SPARK_APP_ID || "11fa6957";
        
        console.log('环境变量检查:');
        console.log('API_KEY exists:', !!API_KEY);
        console.log('API_SECRET exists:', !!API_SECRET);
        console.log('APP_ID:', APP_ID);
        
        if (!API_KEY || !API_SECRET) {
            console.error('缺少API密钥或Secret');
            return {
                statusCode: 500,
                body: JSON.stringify({ 
                    error: 'API配置错误，请联系管理员',
                    details: `API_KEY: ${!!API_KEY}, API_SECRET: ${!!API_SECRET}`
                })
            };
        }
        
        const API_URL = "https://spark-api-open.xf-yun.com/v2/chat/completions";
        
        function getCelebrityInfo(celeb) {
            const celebrities = {
                jay: { name: "周杰伦AI", style: "周杰伦风格" },
                taylor: { name: "泰勒AI", style: "泰勒风格" },
                jackie: { name: "成龙AI", style: "成龙风格" },
                kris: { name: "吴亦凡AI", style: "吴亦凡风格" }
            };
            return celebrities[celeb] || { name: "明星AI", style: "友好风格" };
        }
        
        const celebrityInfo = getCelebrityInfo(celebrity);
        
        function generateAuthHeader(apiKey, apiSecret) {
            const host = "spark-api-open.xf-yun.com";
            const date = new Date().toUTCString();
            const algorithm = 'hmac-sha256';
            const headers = 'host date request-line';
            
            const signatureOrigin = `host: ${host}\ndate: ${date}\nPOST /v2/chat/completions HTTP/1.1`;
            const signatureSha = CryptoJS.HmacSHA256(signatureOrigin, apiSecret);
            const signature = CryptoJS.enc.Base64.stringify(signatureSha);
            
            const authorizationOrigin = `api_key="${apiKey}", algorithm="${algorithm}", headers="${headers}", signature="${signature}"`;
            const authorization = Buffer.from(authorizationOrigin).toString('base64');
            
            return {
                'Authorization': authorization,
                'Content-Type': 'application/json',
                'Host': host,
                'Date': date
            };
        }
        
        const authHeaders = generateAuthHeader(API_KEY, API_SECRET);
        console.log('生成的认证头:', authHeaders);
        
        const messageHistory = [
            {
                role: "user",
                content: `请你扮演${celebrityInfo.name}，使用${celebrityInfo.style}与用户对话。保持角色一致性，模仿该明星的说话方式和特点。`
            },
            ...(history || []),
            {
                role: "user",
                content: message
            }
        ];
        
        const requestData = {
            header: {
                app_id: APP_ID,
                uid: "user123"
            },
            parameter: {
                chat: {
                    domain: "generalv2",
                    temperature: 0.7,
                    max_tokens: 2048
                }
            },
            payload: {
                message: {
                    text: messageHistory
                }
            }
        };
        
        console.log('发送到星火API的请求:', JSON.stringify(requestData, null, 2));
        
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify(requestData)
        });
        
        console.log('星火API响应状态:', response.status, response.statusText);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('星火API错误详情:', errorText);
            throw new Error(`星火API错误: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('星火API完整响应:', JSON.stringify(data, null, 2));
        
        if (data.header.code !== 0) {
            throw new Error(`星火API错误: ${data.header.message} (代码: ${data.header.code})`);
        }
        
        if (data.payload?.choices?.text?.[0]?.content) {
            return {
                statusCode: 200,
                body: JSON.stringify({ 
                    response: data.payload.choices.text[0].content 
                })
            };
        } else {
            throw new Error("星火API返回空响应");
        }
        
    } catch (error) {
        console.error("处理请求时出错:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: error.message,
                type: error.name
            })
        };
    }
};
