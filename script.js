document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const apiKeyInput = document.getElementById('apiKeyInput');
    const saveApiKeyButton = document.getElementById('saveApiKey');
    const clearChatButton = document.getElementById('clearChat');
    const toggleSimulationButton = document.getElementById('toggleSimulation');
    const currentModeSpan = document.getElementById('currentMode');
    const celebrityButtons = document.querySelectorAll('.celebrity-btn');
    
    let currentCelebrity = 'jay';
    let apiKey = '';
    let conversationHistory = [];
    let useSimulation = true; // 默认使用模拟模式
    
    // 从localStorage加载数据
    function loadFromStorage() {
        const savedApiKey = localStorage.getItem('celebrityChatApiKey');
        const savedHistory = localStorage.getItem(`celebrityChatHistory_${currentCelebrity}`);
        const savedCelebrity = localStorage.getItem('currentCelebrity');
        const savedUseSimulation = localStorage.getItem('useSimulation');
        
        if (savedApiKey) {
            apiKey = savedApiKey;
            apiKeyInput.value = '••••••••••••••••';
        }
        
        if (savedCelebrity) {
            currentCelebrity = savedCelebrity;
            document.querySelectorAll('.celebrity-btn').forEach(btn => {
                if (btn.dataset.celebrity === currentCelebrity) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        }
        
        if (savedUseSimulation !== null) {
            useSimulation = savedUseSimulation === 'true';
            updateModeDisplay();
        }
        
        if (savedHistory) {
            conversationHistory = JSON.parse(savedHistory);
            renderConversationHistory();
        } else {
            // 添加初始欢迎消息
            addMessage('ai', getCelebrityWelcomeMessage(currentCelebrity));
        }
    }
    
    // 更新模式显示
    function updateModeDisplay() {
        currentModeSpan.textContent = useSimulation ? "模拟对话模式" : "星火API模式";
        toggleSimulationButton.textContent = useSimulation ? "使用真实API" : "使用模拟对话";
    }
    
    // 渲染对话历史
    function renderConversationHistory() {
        chatMessages.innerHTML = '';
        conversationHistory.forEach(msg => {
            addMessage(msg.role === 'user' ? 'user' : 'ai', msg.content, false);
        });
    }
    
    // 保存到localStorage
    function saveToStorage() {
        localStorage.setItem('celebrityChatApiKey', apiKey);
        localStorage.setItem(`celebrityChatHistory_${currentCelebrity}`, JSON.stringify(conversationHistory));
        localStorage.setItem('currentCelebrity', currentCelebrity);
        localStorage.setItem('useSimulation', useSimulation);
    }
    
    // 获取明星欢迎消息
    function getCelebrityWelcomeMessage(celebrity) {
        const welcomeMessages = {
            jay: "嗨！哎呦不错哦～我是Jay Chou的AI分身，今天有什么想聊的吗？音乐、电影还是生活？😎",
            taylor: "Hi! I'm Taylor Swift's AI. Ready to chat about music, cats, or life in general? 🌟",
            jackie: "大家好！我是成龙AI，很高兴和你聊天！想聊聊电影、动作特技还是慈善？😊",
            kris: "Yo! 我是Kris Wu的AI分身，你想聊音乐、时尚还是篮球？🆒"
        };
        return welcomeMessages[celebrity] || "你好！我是明星AI分身，很高兴和你聊天！";
    }
    
    // 获取明星信息
    function getCelebrityInfo(celebrity) {
        const celebrities = {
            jay: {
                name: "周杰伦AI",
                style: "以周杰伦的方式回应，使用中文，略带台湾口音，喜欢说'哎呦不错哦'、'超diao的'等口头禅，涉及音乐、电影、家庭话题"
            },
            taylor: {
                name: "泰勒AI",
                style: "以泰勒·斯威夫特的方式回应，使用英语，友好且善于表达，经常提及音乐创作、猫咪、女权主义等话题"
            },
            jackie: {
                name: "成龙AI",
                style: "以成龙的方式回应，使用中文，热情友好，喜欢分享电影拍摄趣事、动作特技和慈善工作"
            },
            kris: {
                name: "吴亦凡AI",
                style: "以吴亦凡的方式回应，使用中英文混合，酷炫风格，涉及音乐、时尚、篮球等话题"
            }
        };
        return celebrities[celebrity] || {name: "明星AI", style: "以友好且热情的方式回应"};
    }
    
    // 添加消息到聊天窗口
    function addMessage(sender, text, saveToHistory = true) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(sender === 'user' ? 'user-message' : 'ai-message');
        
        const celebrityInfo = getCelebrityInfo(currentCelebrity);
        
        messageDiv.innerHTML = `
            <div class="message-header">
                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='40' r='30' fill='%23${sender === 'user' ? '66a6ff' : 'ff7e5f'}'/%3E%3Ccircle cx='50' cy='100' r='45' fill='%23${sender === 'user' ? '89f7fe' : 'feb47b'}'/%3E%3C/svg%3E" class="avatar" alt="Avatar">
                <span>${sender === 'user' ? '你' : celebrityInfo.name}</span>
            </div>
            ${text}
        `;
        
        chatMessages.appendChild(messageDiv);
        
        if (saveToHistory) {
            conversationHistory.push({
                role: sender === 'user' ? 'user' : 'assistant',
                content: text
            });
            saveToStorage();
        }
        
        // 滚动到底部
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // 生成WebSocket所需的鉴权参数
    function getAuthParams(apiKey, apiSecret) {
        const host = 'spark-api.xf-yun.com';
        const path = '/v1.1/chat';
        const date = new Date().toUTCString();
        
        // 生成签名
        const algorithm = 'hmac-sha256';
        const headers = 'host date request-line';
        const signatureOrigin = `host: ${host}\ndate: ${date}\nGET ${path} HTTP/1.1`;
        const signatureSha = CryptoJS.HmacSHA256(signatureOrigin, apiSecret);
        const signature = CryptoJS.enc.Base64.stringify(signatureSha);
        
        // 生成 authorization 参数
        const authorizationOrigin = `api_key="${apiKey}", algorithm="${algorithm}", headers="${headers}", signature="${signature}"`;
        const authorization = btoa(authorizationOrigin);
        
        // 生成请求URL
        const url = `wss://${host}${path}?authorization=${encodeURIComponent(authorization)}&date=${encodeURIComponent(date)}&host=${encodeURIComponent(host)}`;
        
        return url;
    }
    
    // 调用星火大模型API
    async function callSparkAPI(userMessage) {
        return new Promise((resolve, reject) => {
            if (!apiKey) {
                reject("请先设置API密钥");
                return;
            }
            
            // 这里应该是实际的API密钥和密钥，您需要从星火平台获取
            // 注意：实际应用中应该使用后端来保护这些密钥
            const API_KEY = apiKey;
            const API_SECRET = "您的API_SECRET"; // 需要从星火平台获取
            
            try {
                const url = getAuthParams(API_KEY, API_SECRET);
                const socket = new WebSocket(url);
                
                socket.onopen = () => {
                    // 构建请求数据
                    const celebrityInfo = getCelebrityInfo(currentCelebrity);
                    const requestData = {
                        header: {
                            app_id: "您的APP_ID", // 需要从星火平台获取
                            uid: "user123"
                        },
                        parameter: {
                            chat: {
                                domain: "general",
                                temperature: 0.5,
                                max_tokens: 1024
                            }
                        },
                        payload: {
                            message: {
                                text: [
                                    {
                                        role: "user",
                                        content: `请你扮演${celebrityInfo.name}，${celebrityInfo.style}。请用这种风格回答以下问题：${userMessage}`
                                    }
                                ]
                            }
                        }
                    };
                    
                    socket.send(JSON.stringify(requestData));
                };
                
                socket.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    if (data.header.code !== 0) {
                        reject(`API错误: ${data.header.message}`);
                        socket.close();
                        return;
                    }
                    
                    const text = data.payload.choices.text[0].content;
                    resolve(text);
                    
                    // 如果状态为2，则表示所有数据接收完毕，可以关闭连接
                    if (data.header.status === 2) {
                        socket.close();
                    }
                };
                
                socket.onerror = (error) => {
                    reject(`WebSocket错误: ${error}`);
                    socket.close();
                };
                
            } catch (error) {
                reject(`调用API时出错: ${error.message}`);
            }
        });
    }
    
    // 模拟AI响应
    function simulateAIResponse(userMessage) {
        const lowerCaseMessage = userMessage.toLowerCase();
        const celebrity = getCelebrityInfo(currentCelebrity);
        
        if (currentCelebrity === 'jay') {
            if (lowerCaseMessage.includes('音乐') || lowerCaseMessage.includes('歌')) {
                return "哎呦不错哦！我的新歌正在筹备中，依然是中国风混搭流行元素，敬请期待！🎵";
            } else if (lowerCaseMessage.includes('电影')) {
                return "电影啊...我最近在忙音乐，不过如果有好的剧本，我也会考虑重返大银幕哦！🎬";
            } else if (lowerCaseMessage.includes('家庭') || lowerCaseMessage.includes('孩子')) {
                return "家庭对我来说很重要，昆凌和孩子们是我最大的动力！😊";
            } else {
                return "嘿，这个话题很有趣！不过我还是想聊聊音乐，你知道我最近在听什么吗？";
            }
        } else if (currentCelebrity === 'taylor') {
            if (lowerCaseMessage.includes('music') || lowerCaseMessage.includes('song')) {
                return "I'm always writing new songs! My latest album is all about storytelling and emotions. 🎵";
            } else if (lowerCaseMessage.includes('cat') || lowerCaseMessage.includes('kitten')) {
                return "Oh I love my cats! Meredith and Olivia are the cutest! 🐱";
            } else {
                return "That's an interesting topic! But you know what I'd really love to talk about? My latest project!";
            }
        } else if (currentCelebrity === 'jackie') {
            if (lowerCaseMessage.includes('电影') || lowerCaseMessage.includes('拍摄')) {
                return "拍动作片真的很辛苦，但我坚持不用替身！最近我在筹备一部新电影，会有很多创新的特技！🎬";
            } else if (lowerCaseMessage.includes('慈善')) {
                return "我相信回馈社会非常重要，我的慈善基金会一直在帮助需要帮助的人们！❤️";
            } else {
                return "谢谢你的关注！我最近在忙很多项目，不只是电影，还有慈善工作！";
            }
        } else if (currentCelebrity === 'kris') {
            if (lowerCaseMessage.includes('音乐') || lowerCaseMessage.includes('rap')) {
                return "Yo! 我的新专辑正在制作中，会有很多新的尝试，hip-hop加上中国元素，超swag的！🎤";
            } else if (lowerCaseMessage.includes('篮球')) {
                return "篮球是我的 passion! 我经常参加慈善篮球赛，你有看过我打球吗？🏀";
            } else {
                return "挺有意思的话题！不过我还是想聊聊我的新歌，你想听吗？";
            }
        }
        
        return "谢谢你的消息！我很高兴能和你聊天。有什么特别想聊的话题吗？";
    }
    
    // 获取AI响应
    async function getAIResponse(userMessage) {
        if (useSimulation) {
            // 使用模拟响应
            return simulateAIResponse(userMessage);
        } else {
            // 使用星火API
            try {
                const response = await callSparkAPI(userMessage);
                return response;
            } catch (error) {
                console.error("API调用失败:", error);
                return `抱歉，调用API时出错: ${error}。已自动切换到模拟模式。`;
            }
        }
    }
    
    // 发送消息
    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;
        
        addMessage('user', message);
        userInput.value = '';
        
        // 显示"正在输入"指示器
        const typingIndicator = document.createElement('div');
        typingIndicator.classList.add('message', 'ai-message');
        typingIndicator.id = 'typingIndicator';
        typingIndicator.innerHTML = `
            <div class="message-header">
                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='40' r='30' fill='%23ff7e5f'/%3E%3Ccircle cx='50' cy='100' r='45' fill='%23feb47b'/%3E%3C/svg%3E" class="avatar" alt="AI Avatar">
                <span>${getCelebrityInfo(currentCelebrity).name}</span>
            </div>
            <div class="typing">正在输入...</div>
        `;
        chatMessages.appendChild(typingIndicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // 获取AI响应
        const response = await getAIResponse(message);
        
        // 移除"正在输入"指示器
        document.getElementById('typingIndicator')?.remove();
        
        // 添加AI响应
        addMessage('ai', response);
    }
    
    // 事件监听器
    sendButton.addEventListener('click', sendMessage);
    
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    saveApiKeyButton.addEventListener('click', function() {
        const key = apiKeyInput.value.trim();
        if (key) {
            apiKey = key;
            localStorage.setItem('celebrityChatApiKey', apiKey);
            apiKeyInput.value = '••••••••••••••••';
            alert('API密钥已保存！');
        } else if (apiKeyInput.value === '••••••••••••••••') {
            alert('API密钥已保存！');
        } else {
            alert('请输入有效的API密钥');
        }
    });
    
    clearChatButton.addEventListener('click', function() {
        if (confirm('确定要清空对话历史吗？')) {
            conversationHistory = [];
            localStorage.removeItem(`celebrityChatHistory_${currentCelebrity}`);
            chatMessages.innerHTML = '';
            addMessage('ai', getCelebrityWelcomeMessage(currentCelebrity));
        }
    });
    
    toggleSimulationButton.addEventListener('click', function() {
        useSimulation = !useSimulation;
        localStorage.setItem('useSimulation', useSimulation);
        updateModeDisplay();
        alert(`已切换到${useSimulation ? '模拟对话模式' : '星火API模式'}`);
    });
    
    celebrityButtons.forEach(button => {
        button.addEventListener('click', function() {
            celebrityButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // 保存当前对话历史
            saveToStorage();
            
            // 切换明星
            currentCelebrity = this.dataset.celebrity;
            localStorage.setItem('currentCelebrity', currentCelebrity);
            
            // 加载新明星的对话历史
            const savedHistory = localStorage.getItem(`celebrityChatHistory_${currentCelebrity}`);
            conversationHistory = savedHistory ? JSON.parse(savedHistory) : [];
            
            // 渲染对话历史或添加欢迎消息
            if (conversationHistory.length > 0) {
                renderConversationHistory();
            } else {
                chatMessages.innerHTML = '';
                addMessage('ai', getCelebrityWelcomeMessage(currentCelebrity));
            }
        });
    });
    
    // 初始化加载
    loadFromStorage();
});
