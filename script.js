document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const clearChatButton = document.getElementById('clearChat');
    const celebrityButtons = document.querySelectorAll('.celebrity-btn');
    
    let currentCelebrity = 'jay';
    let conversationHistory = [];
    
    // 从localStorage加载数据
    function loadFromStorage() {
        const savedHistory = localStorage.getItem(`celebrityChatHistory_${currentCelebrity}`);
        const savedCelebrity = localStorage.getItem('currentCelebrity');
        
        if (savedCelebrity) {
            currentCelebrity = savedCelebrity;
            updateCelebrityButtons();
        }
        
        if (savedHistory) {
            conversationHistory = JSON.parse(savedHistory);
            renderConversationHistory();
        } else {
            addMessage('ai', getCelebrityWelcomeMessage(currentCelebrity), false);
        }
    }
    
    function updateCelebrityButtons() {
        celebrityButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.celebrity === currentCelebrity);
        });
    }
    
    function renderConversationHistory() {
        chatMessages.innerHTML = '';
        conversationHistory.forEach(msg => {
            addMessage(msg.role === 'user' ? 'user' : 'ai', msg.content, false);
        });
    }
    
    function saveToStorage() {
        localStorage.setItem(`celebrityChatHistory_${currentCelebrity}`, JSON.stringify(conversationHistory));
        localStorage.setItem('currentCelebrity', currentCelebrity);
    }
    
    function getCelebrityWelcomeMessage(celebrity) {
        const welcomeMessages = {
            jay: "嗨！哎呦不错哦～我是Jay Chou的AI分身，今天有什么想聊的吗？音乐、电影还是生活？😎",
            taylor: "Hi! I'm Taylor Swift's AI. Ready to chat about music, cats, or life in general? 🌟",
            jackie: "大家好！我是成龙AI，很高兴和你聊天！想聊聊电影、动作特技还是慈善？😊",
            kris: "Yo! 我是Kris Wu的AI分身，你想聊音乐、时尚还是篮球？🆒"
        };
        return welcomeMessages[celebrity] || "你好！我是明星AI分身，很高兴和你聊天！";
    }
    
    function getCelebrityInfo(celebrity) {
        const celebrities = {
            jay: { name: "周杰伦AI", style: "周杰伦风格" },
            taylor: { name: "泰勒AI", style: "泰勒风格" },
            jackie: { name: "成龙AI", style: "成龙风格" },
            kris: { name: "吴亦凡AI", style: "吴亦凡风格" }
        };
        return celebrities[celebrity] || { name: "明星AI", style: "友好风格" };
    }
    
    function addMessage(sender, text, saveToHistory = true) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender === 'user' ? 'user-message' : 'ai-message');
        
        const celebrityInfo = getCelebrityInfo(currentCelebrity);
        
        messageDiv.innerHTML = `
            <div class="message-header">
                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='40' r='30' fill='%23${sender === 'user' ? '43cea2' : '6e8efb'}'/%3E%3Ccircle cx='50' cy='100' r='45' fill='%23${sender === 'user' ? '185a9d' : 'a777e3'}'/%3E%3C/svg%3E" class="avatar">
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
        
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // 智能响应生成器（完全前端，无需API）
    function generateAIResponse(userMessage) {
        const celebrityInfo = getCelebrityInfo(currentCelebrity);
        const lowerMessage = userMessage.toLowerCase();
        
        // 各明星的响应库
        const responseTemplates = {
            jay: {
                greetings: ["哎呦不错哦～", "哼哼哈兮！", "哎哟，", "朋友，"],
                topics: {
                    music: [
                        "想听《双截棍》还是《晴天》？我都可以唱给你听！",
                        "音乐是我的生命，每首歌都有它的故事。",
                        "最近在写新歌，要不要给你透露一点点？"
                    ],
                    movie: [
                        "《不能说的秘密》是我最满意的电影作品！",
                        "拍电影和做音乐一样，都需要用心。",
                        "你想聊哪部我的电影？"
                    ],
                    life: [
                        "奶茶是我的最爱，一天不喝浑身难受！",
                        "家庭对我来说是最重要的。",
                        "喜欢魔术吗？我最近学了不少新 tricks！"
                    ],
                    default: [
                        "今天心情不错，想聊点什么？",
                        "哎呦，这个话题有意思！",
                        "你怎么知道我对这个感兴趣？"
                    ]
                }
            },
            taylor: {
                greetings: ["Hi! ", "Hey there! ", "Oh my gosh! ", "You guys! "],
                topics: {
                    music: [
                        "I'm working on new music right now! So excited!",
                        "Which album is your favorite? Mine is always the latest one!",
                        "Writing songs is how I process my feelings."
                    ],
                    cats: [
                        "My cats Meredith and Olivia say meow! 🐱",
                        "Did you know Olivia has her own Instagram?",
                        "Cats are better than people, don't you think?"
                    ],
                    life: [
                        "I believe in being kind to everyone.",
                        "Life is about learning and growing.",
                        "What's your favorite thing about today?"
                    ],
                    default: [
                        "That's so interesting! Tell me more!",
                        "I love talking about this!",
                        "You're making me think about things differently!"
                    ]
                }
            },
            jackie: {
                greetings: ["大家好！", "朋友们！", "喂！", "哈喽！"],
                topics: {
                    movie: [
                        "我拍电影从不用替身，这是我对观众的尊重！",
                        "动作戏虽然危险，但看到观众喜欢就值得了。",
                        "你想学功夫吗？我可以教你两招！"
                    ],
                    charity: [
                        "慈善是我一生的事业，帮助别人让我快乐。",
                        "每个人都可以为社会做点贡献。",
                        "看到需要帮助的人露出笑容，是最幸福的事。"
                    ],
                    life: [
                        "年龄不是问题，心态年轻最重要！",
                        "我每天坚持锻炼，身体是革命的本钱。",
                        "家庭和事业都要兼顾，这才是完整的人生。"
                    ],
                    default: [
                        "这个问题问得好！",
                        "让我想想怎么回答你...",
                        "很有意思的话题！"
                    ]
                }
            },
            kris: [
                "Yo! 你想聊音乐还是时尚？",
                "篮球是我的 passion，音乐是我的 soul！",
                "做自己，就是最酷的时尚态度！",
                "你看这个面它又长又宽～",
                "保持真实，保持酷！",
                "音乐没有界限，时尚没有规则！"
            ]
        };
        
        // 生成响应
        return new Promise((resolve) => {
            // 模拟思考时间
            const thinkTime = 800 + Math.random() * 1200;
            
            setTimeout(() => {
                let response;
                
                if (currentCelebrity === 'kris') {
                    // 吴亦凡的简单响应
                    const responses = responseTemplates.kris;
                    response = responses[Math.floor(Math.random() * responses.length)];
                } else {
                    // 其他明星的智能响应
                    const template = responseTemplates[currentCelebrity];
                    const greeting = template.greetings[Math.floor(Math.random() * template.greetings.length)];
                    
                    let topic = 'default';
                    if (lowerMessage.includes('音乐') || lowerMessage.includes('歌') || lowerMessage.includes('music') || lowerMessage.includes('song')) {
                        topic = 'music';
                    } else if (lowerMessage.includes('电影') || lowerMessage.includes('movie') || lowerMessage.includes('film')) {
                        topic = 'movie';
                    } else if (lowerMessage.includes('猫') || lowerMessage.includes('cat')) {
                        topic = 'cats';
                    } else if (lowerMessage.includes('慈善') || lowerMessage.includes('charity')) {
                        topic = 'charity';
                    } else if (lowerMessage.includes('生活') || lowerMessage.includes('life')) {
                        topic = 'life';
                    }
                    
                    const topicResponses = template.topics[topic] || template.topics.default;
                    const topicResponse = topicResponses[Math.floor(Math.random() * topicResponses.length)];
                    
                    response = greeting + topicResponse;
                }
                
                resolve(response);
            }, thinkTime);
        });
    }
    
    async function getAIResponse(userMessage) {
        try {
            return await generateAIResponse(userMessage);
        } catch (error) {
            return "让我想想该怎么回答你...";
        }
    }
    
    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;
        
        addMessage('user', message);
        userInput.value = '';
        
        const typingIndicator = document.createElement('div');
        typingIndicator.id = 'typingIndicator';
        typingIndicator.innerHTML = `
            <div class="message ai-message">
                <div class="message-header">
                    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='40' r='30' fill='%236e8efb'/%3E%3Ccircle cx='50' cy='100' r='45' fill='%23a777e3'/%3E%3C/svg%3E" class="avatar">
                    <span>${getCelebrityInfo(currentCelebrity).name}</span>
                </div>
                <div class="typing">正在思考中...</div>
            </div>
        `;
        chatMessages.appendChild(typingIndicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        try {
            const response = await getAIResponse(message);
            document.getElementById('typingIndicator')?.remove();
            addMessage('ai', response);
        } catch (error) {
            document.getElementById('typingIndicator')?.remove();
            addMessage('ai', "让我想想该怎么回答你...");
        }
    }
    
    // 事件监听
    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => e.key === 'Enter' && sendMessage());
    
    clearChatButton.addEventListener('click', () => {
        if (confirm('清空对话历史？')) {
            conversationHistory = [];
            localStorage.removeItem(`celebrityChatHistory_${currentCelebrity}`);
            chatMessages.innerHTML = '';
            addMessage('ai', getCelebrityWelcomeMessage(currentCelebrity), false);
        }
    });
    
    celebrityButtons.forEach(button => {
        button.addEventListener('click', function() {
            currentCelebrity = this.dataset.celebrity;
            localStorage.setItem('currentCelebrity', currentCelebrity);
            updateCelebrityButtons();
            
            const savedHistory = localStorage.getItem(`celebrityChatHistory_${currentCelebrity}`);
            conversationHistory = savedHistory ? JSON.parse(savedHistory) : [];
            
            renderConversationHistory();
            if (conversationHistory.length === 0) {
                addMessage('ai', getCelebrityWelcomeMessage(currentCelebrity), false);
            }
        });
    });
    
    // 初始化
    loadFromStorage();
});
