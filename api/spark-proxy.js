// api/spark-proxy.js
const CryptoJS = require('crypto-js');

module.exports = async (req, res) => {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { message, celebrity, history } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: '消息不能为空' });
    }
    
    // 星火API配置 - 从环境变量获取
    const API_KEY = process.env.SPARK_API_KEY;
    const API_SECRET = process.env.SPARK_API_SECRET;
    const APP_ID = process.env.SPARK_APP_ID || "11fa6957";
    const API_URL = "https://spark-api-open.xf-yun.com/v2/chat/completions";
    
    if (!API_KEY || !API_SECRET) {
      return res.status(500).json({ error: 'API配置错误' });
    }
    
    // 获取明星信息
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
    
    // 生成鉴权头
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
    
    // 构建对话历史
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
    
    // 调用星火API
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(requestData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`星火API错误: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const data = await response.json();
    
    if (data.header.code !== 0) {
      throw new Error(`星火API错误: ${data.header.message} (代码: ${data.header.code})`);
    }
    
    if (data.payload?.choices?.text?.[0]?.content) {
      return res.status(200).json({ 
        response: data.payload.choices.text[0].content 
      });
    } else {
      throw new Error("星火API返回空响应");
    }
    
  } catch (error) {
    console.error("处理请求时出错:", error);
    return res.status(500).json({ error: error.message });
  }
};
