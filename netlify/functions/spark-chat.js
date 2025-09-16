import CryptoJS from 'crypto-js';

export const handler = async function(event, context) {
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
        
        const API_KEY = process.env.SPARK_API_KEY;
        const API_SECRET = process.env.SPARK_API_SECRET;
        const APP_ID = process.env.SPARK_APP_ID || "11fa6957";
        
        if (!API_KEY || !API_SECRET) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'API配置错误' })
            };
        }
        
        // 使用WebSocket API地址
        const API_URL = "wss://spark-api.xf-yun.com/v1/x1";
        
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
        
        // 生成WebSocket鉴权URL
        function generateWebSocketURL() {
            const host = "spark-api.xf-yun.com";
            const path = "/v1/x1";
            const date = new Date().toUTCString();
            
            // 生成签名
            const signatureOrigin = `host: ${host}\ndate: ${date}\nGET ${path} HTTP/1.1`;
            const signatureSha = CryptoJS.HmacSHA256(signatureOrigin, API_SECRET);
            const signature = CryptoJS.enc.Base64.stringify(signatureSha);
            
            // 生成授权参数
            const authorizationOrigin = `api_key="${API_KEY}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
            const authorization = Buffer.from(authorizationOrigin).toString('base64');
            
            // 生成WebSocket URL
            return `wss://${host}${path}?authorization=${encodeURIComponent(authorization)}&date=${encodeURIComponent(date)}&host=${encodeURIComponent(host)}`;
        }
        
        // 由于Netlify Functions不支持WebSocket，我们需要使用模拟响应或寻找替代方案
        // 这里先返回一个提示信息
        
        return {
            statusCode: 200,
            body: JSON.stringify({ 
                response: `嗨！我是${celebrityInfo.name}，检测到您使用的是WebSocket API密钥。请使用HTTP API或在客户端直接使用WebSocket连接。`,
                debug: "WebSocket API需要在客户端实现"
            })
        };
        
    } catch (error) {
        console.error("处理请求时出错:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
