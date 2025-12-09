/**
 * 教会聚会系统 - 主控制器
 * 管理整个应用的初始化和事件处理
 */

class ChurchMeetingApp {
    constructor() {
        this.currentPageIndex = 0;
        this.totalPages = 0;
        this.meetingData = null;
        this.timerInterval = null;
        this.pageStartTime = null;
        this.isFullscreen = false;
        this.voiceControlActive = false;
        this.resetMode = false; // 新增：复位模式标记
        
        // 修复：绑定方法到正确的this上下文
        this.prevPage = this.prevPage.bind(this);
        this.nextPage = this.nextPage.bind(this);
        this.toggleFullscreen = this.toggleFullscreen.bind(this);
        this.openConfig = this.openConfig.bind(this);
        this.toggleVoiceControl = this.toggleVoiceControl.bind(this);
        this.confirmReset = this.confirmReset.bind(this);
        
        this.initializeApp();
    }
    
    async initializeApp() {
        console.log('初始化教会聚会系统...');
        
        try {
            // 1. 加载数据
            await this.loadData();
            
            // 2. 初始化UI
            this.initializeUI();
            
            // 3. 绑定事件
            this.bindEvents();
            
            // 4. 显示第一页
            this.showPage(this.currentPageIndex);
            
            // 5. 初始化语音控制（预留）
            this.initializeVoiceControl();
            
            console.log('系统初始化完成！');
            
        } catch (error) {
            console.error('初始化失败:', error);
            this.showError('系统初始化失败，请检查数据文件');
        }
    }
    
    async loadData() {
        try {
            // 1. 只从文件加载
            const response = await fetch('content.json');
            if (!response.ok) throw new Error(`文件加载失败: ${response.status}`);
            const fileData = await response.json();

            // 2. 数据完整性检查（关键！）
            if (!fileData.pages || !Array.isArray(fileData.pages)) {
                console.warn('文件中的pages字段无效，使用默认数据');
                throw new Error('Invalid pages data');
            }

            // 3. 使用文件数据
            this.meetingData = fileData;

            // 4. 关键步骤：确保启用状态并计算总页数
            // 这里假设文件里有些页面的 "enabled" 为 false，所以需要过滤
            this.meetingData.pages.forEach(page => {
                if (page.enabled === undefined) page.enabled = true; // 默认启用
            });
            
            // 计算启用的页面总数
            this.totalPages = this.meetingData.pages.filter(page => page.enabled).length;
            
            console.log(`✅ 数据加载完成。总页面数：${this.meetingData.pages.length}，启用页面数：${this.totalPages}`);

        } catch (error) {
            console.error('❌ 加载失败，使用默认数据:', error);
            // 修复：使用正确的默认数据方法
            this.meetingData = this.getDefaultData();
            this.totalPages = this.meetingData.pages.filter(page => page.enabled !== false).length;
        }
    }
    
    getDefaultData() {
        // 修复：提供完整的24页默认数据
        const timestamp = Date.now();
        return {
            meetingInfo: {
                date: new Date().toISOString().split('T')[0],
                title: '主日崇拜',
                theme: '在主爱中合一',
                host: {
                    selectedId: 'default',
                    options: [
                        { id: 'default', name: '主持人', avatar: '' }
                    ]
                }
            },
            pages: [
                { id: 'welcome_' + timestamp, title: '欢迎页', type: 'welcome', enabled: true, order: 1, content: { text: '欢迎参加主日崇拜', subtext: '在主爱中合一敬拜' } },
                { id: 'call_' + timestamp, title: '宣召', type: 'scripture', enabled: true, order: 2, content: { text: '你们要赞美耶和华！在神的圣所赞美他！在他显能力的穹苍赞美他！', reference: '诗篇 150:1' } },
                { id: 'opening_prayer_' + timestamp, title: '开祷', type: 'prayer', enabled: true, order: 3, content: { title: '开堂祷告', text: '亲爱的天父，我们感谢赞美你...' } },
                { id: 'hymn1_' + timestamp, title: '赞美诗', type: 'worship', enabled: true, order: 4, content: { songs: [{ title: '圣哉三一歌', key: 'C', tempo: '中板' }], showLyrics: true } },
                { id: 'hymn2_' + timestamp, title: '敬拜诗', type: 'worship', enabled: true, order: 5, content: { songs: [{ title: '你真伟大', key: 'G', tempo: '慢板' }], showLyrics: true } },
                { id: 'scripture_reading_' + timestamp, title: '读经', type: 'scripture', enabled: true, order: 6, content: { text: '神爱世人，甚至将他的独生子赐给他们，叫一切信他的，不至灭亡，反得永生。', reference: '约翰福音 3:16' } },
                { id: 'special_music_' + timestamp, title: '特别献诗', type: 'specialMusic', enabled: true, order: 7, content: { performers: '诗班', songTitle: '奇异恩典' } },
                { id: 'pastoral_prayer_' + timestamp, title: '牧祷', type: 'prayer', enabled: true, order: 8, content: { title: '牧者祷告', text: '求主祝福我们的聚会...' } },
                { id: 'announcements_' + timestamp, title: '家事报告', type: 'announcements', enabled: true, order: 9, content: { items: [{ title: '欢迎新朋友', content: '欢迎第一次参加的朋友', important: true }] } },
                { id: 'offering_' + timestamp, title: '奉献', type: 'offering', enabled: true, order: 10, content: { text: '各人要随本心所酌定的，不要作难，不要勉强', scripture: '哥林多后书 9:7' } },
                { id: 'offering_hymn_' + timestamp, title: '奉献诗歌', type: 'worship', enabled: true, order: 11, content: { songs: [{ title: '献上感恩', key: 'D', tempo: '中板' }], showLyrics: true } },
                { id: 'scripture_' + timestamp, title: '经文', type: 'scripture', enabled: true, order: 12, content: { text: '因为罪的工价乃是死；惟有神的恩赐，在我们的主基督耶稣里，乃是永生。', reference: '罗马书 6:23' } },
                { id: 'message_' + timestamp, title: '证道', type: 'message', enabled: true, order: 13, content: { title: '在主爱中合一', speaker: '讲员', outline: ['引言', '本论', '结论'] } },
                { id: 'communion_' + timestamp, title: '圣餐', type: 'communion', enabled: true, order: 14, content: { instructions: '请安静预备心，领受主的饼和杯' } },
                { id: 'testimony_' + timestamp, title: '见证', type: 'testimony', enabled: true, order: 15, content: { speaker: { name: '见证人' }, content: '我要述说主在我身上的作为...' } },
                { id: 'baptism_' + timestamp, title: '洗礼', type: 'baptism', enabled: true, order: 16, content: { scripture: '所以，你们要去，使万民作我的门徒，奉父、子、圣灵的名给他们施洗。' } },
                { id: 'new_members_' + timestamp, title: '迎新会友', type: 'newMembers', enabled: true, order: 17, content: { welcomeMessage: '欢迎加入教会大家庭' } },
                { id: 'birthdays_' + timestamp, title: '生日祝福', type: 'birthday', enabled: true, order: 18, content: { birthdayPersons: [{ name: '张三', birthdate: '1990-01-01' }] } },
                { id: 'children_blessing_' + timestamp, title: '儿童祝福', type: 'childrenBlessing', enabled: true, order: 19, content: { children: [{ name: '小明', age: 5 }] } },
                { id: 'lords_prayer_' + timestamp, title: '主祷文', type: 'lordsPrayer', enabled: true, order: 20, content: { title: '主祷文' } },
                { id: 'closing_hymn_' + timestamp, title: '回应诗', type: 'worship', enabled: true, order: 21, content: { songs: [{ title: '再相会歌', key: 'F', tempo: '中板' }], showLyrics: true } },
                { id: 'benediction_' + timestamp, title: '祝福', type: 'benediction', enabled: true, order: 22, content: { title: '祝福祷告', text: '愿赐平安的神亲自使你们全然成圣！' } },
                { id: 'doxology_' + timestamp, title: '三一颂', type: 'doxology', enabled: true, order: 23, content: { title: '三一颂' } },
                { id: 'closing_' + timestamp, title: '散会', type: 'closing', enabled: true, order: 24, content: { blessing: '愿主耶稣基督的恩惠，神的慈爱，圣灵的感动，常与你们众人同在！' } }
            ],
            settings: {
                background: { type: "gradient", theme: "blue" },
                fontSize: "medium",
                transitionSpeed: "normal"
            }
        };
    }
    
   initializeUI() {
    // 设置会议信息
    document.getElementById('meeting-title').textContent = 
        this.meetingData.meetingInfo.title;
    document.getElementById('current-date').textContent = 
        this.meetingData.meetingInfo.date;
    document.getElementById('current-theme').textContent = 
        this.meetingData.meetingInfo.theme || '';
    
    // 设置主持人
    this.updateHostDisplay();
    
    // 创建页面导航点
    this.createNavigationDots();
    
    // 更新页面指示器
    this.updatePageIndicator();
    
    // 设置背景（新增这一行）
    this.updateBackground();
}
    
    updateHostDisplay() {
        const hostConfig = this.meetingData.meetingInfo.host;
        if (hostConfig && hostConfig.selectedId) {
            const selectedHost = hostConfig.options.find(
                host => host.id === hostConfig.selectedId
            );
            
            if (selectedHost) {
                document.getElementById('host-name').textContent = selectedHost.name;
                // 注意：实际项目中需要处理头像路径
                // document.getElementById('host-img').src = selectedHost.avatar;
            }
        }
    }
    
    // 新增：背景设置方法
updateBackground() {
    const settings = this.meetingData.settings;
    const appElement = document.getElementById('app');
    
    // 如果没有背景设置或app元素，使用默认
    if (!settings || !settings.background || !appElement) {
        console.log('使用默认背景');
        return;
    }
    
    const background = settings.background;
    console.log('应用背景设置:', background);
    
    // 清除之前的背景样式
    appElement.style.background = '';
    appElement.style.backgroundImage = '';
    appElement.style.backgroundColor = '';
    
    switch(background.type) {
        case 'gradient':
            const gradientStyle = this.getGradientStyle(background);
            appElement.style.background = gradientStyle;
            console.log('应用渐变背景:', gradientStyle);
            break;
            
        case 'solid':
            const color = background.color || '#2c3e50';
            appElement.style.backgroundColor = color;
            console.log('应用纯色背景:', color);
            break;
            
        case 'image':
            if (background.imageUrl) {
                appElement.style.backgroundImage = `url('${background.imageUrl}')`;
                appElement.style.backgroundSize = 'cover';
                appElement.style.backgroundPosition = 'center';
                appElement.style.backgroundRepeat = 'no-repeat';
                if (background.opacity) {
                    appElement.style.opacity = background.opacity;
                }
                console.log('应用图片背景:', background.imageUrl);
            }
            break;
            
        case 'pattern':
            const patternStyle = this.getPatternStyle(background);
            appElement.style.background = patternStyle;
            console.log('应用图案背景:', patternStyle);
            break;
            
        default:
            console.log('使用默认背景类型');
    }
}

// 新增：获取渐变背景样式
getGradientStyle(background) {
    const gradients = {
        blue: ['#667eea', '#764ba2'],
        purple: ['#8e2de2', '#4a00e0'],
        red: ['#f093fb', '#f5576c'],
        green: ['#43e97b', '#38f9d7'],
        gold: ['#fa709a', '#fee140'],
        light: ['#a1c4fd', '#c2e9fb'],
        dark: ['#2c3e50', '#4ca1af']
    };
    
    const colors = gradients[background.theme] || gradients.blue;
    const direction = background.direction || '135deg';
    const intensity = background.intensity || 'normal';
    
    // 根据强度调整颜色
    let adjustedColors = [...colors];
    if (intensity === 'strong') {
        adjustedColors = colors.map(color => this.adjustColor(color, 20));
    } else if (intensity === 'soft') {
        adjustedColors = colors.map(color => this.adjustColor(color, -20));
    }
    
    return `linear-gradient(${direction}, ${adjustedColors[0]} 0%, ${adjustedColors[1]} 100%)`;
}

// 新增：调整颜色亮度
adjustColor(color, percent) {
    // 简化版颜色调整
    return color;
}

// 新增：获取图案背景样式
getPatternStyle(background) {
    const color = background.patternColor || '#3498db';
    const type = background.patternType || 'cross';
    
    const patterns = {
        cross: `repeating-linear-gradient(45deg, ${color} 0, ${color} 2px, transparent 2px, transparent 10px)`,
        dove: `radial-gradient(circle at 10px 10px, ${color} 2px, transparent 2px), radial-gradient(circle at 30px 30px, ${color} 2px, transparent 2px)`,
        fish: `linear-gradient(45deg, ${color} 25%, transparent 25%), linear-gradient(-45deg, ${color} 25%, transparent 25%)`,
        geometric: `linear-gradient(90deg, ${color} 50%, transparent 50%), linear-gradient(90deg, ${color} 50%, transparent 50%)`
    };
    
    const pattern = patterns[type] || patterns.cross;
    return `${pattern}; background-size: 20px 20px;`;
}
    
    createNavigationDots() {
        const navContainer = document.querySelector('.nav-dots');
        if (!navContainer) {
            console.error('找不到 .nav-dots 容器');
            return;
        }
        
        navContainer.innerHTML = '';
        
        const enabledPages = this.meetingData.pages.filter(page => page.enabled);
        
        enabledPages.forEach((page, index) => {
            const dot = document.createElement('div');
            dot.className = 'nav-dot';
            dot.dataset.index = index;
            dot.title = page.title;
            
            if (index === this.currentPageIndex) {
                dot.classList.add('active');
            }
            
            dot.addEventListener('click', (e) => {
                const targetIndex = parseInt(e.target.dataset.index);
                this.showPage(targetIndex);
            });
            
            navContainer.appendChild(dot);
        });
    }
    
    bindEvents() {
        // 修复：使用正确的this上下文
        const self = this;
        
        // 上一页/下一页按钮
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                console.log('上一页按钮点击');
                self.prevPage();
            });
        } else {
            console.error('找不到 prev-btn 按钮');
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                console.log('下一页按钮点击');
                self.nextPage();
            });
        } else {
            console.error('找不到 next-btn 按钮');
        }
        
        // 键盘控制
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowLeft':
                case 'PageUp':
                    e.preventDefault();
                    self.prevPage();
                    break;
                case 'ArrowRight':
                case 'PageDown':
                case ' ':
                    e.preventDefault();
                    self.nextPage();
                    break;
                case 'Home':
                    e.preventDefault();
                    self.showPage(0);
                    break;
                case 'End':
                    e.preventDefault();
                    self.showPage(self.totalPages - 1);
                    break;
                case 'f':
                case 'F':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        self.toggleFullscreen();
                    }
                    break;
                case 'r':
                case 'R':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        self.confirmReset();
                    }
                    break;
            }
        });
        
        // 全屏按钮
        const fullscreenBtn = document.getElementById('fullscreen-btn');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => {
                console.log('全屏按钮点击');
                self.toggleFullscreen();
            });
        }
        
        // 配置按钮
        const configBtn = document.getElementById('config-btn');
        if (configBtn) {
            configBtn.addEventListener('click', () => {
                console.log('配置按钮点击');
                self.openConfig();
            });
        }
        
        // 语音控制按钮
        const voiceToggle = document.getElementById('voice-toggle');
        if (voiceToggle) {
            voiceToggle.addEventListener('click', () => {
                console.log('语音控制按钮点击');
                self.toggleVoiceControl();
            });
        }
        
        // 新增：复位按钮事件
        const resetBtn = document.getElementById('reset-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                console.log('复位按钮点击');
                self.confirmReset();
            });
        } else {
            console.warn('找不到 reset-btn 按钮');
        }
    }
    
    showPage(pageIndex) {
        // 边界检查
        if (pageIndex < 0 || pageIndex >= this.totalPages) {
            console.warn('页面索引超出范围:', pageIndex);
            return;
        }
        
        // 获取启用的页面
        const enabledPages = this.meetingData.pages.filter(page => page.enabled);
        const targetPage = enabledPages[pageIndex];
        
        if (!targetPage) {
            console.error('找不到页面:', pageIndex);
            return;
        }
        
        // 停止当前计时器
        this.stopPageTimer();
        
        // 更新当前页面索引
        this.currentPageIndex = pageIndex;
        
        // 更新UI
        this.updatePageIndicator();
        this.updateNavigationDots();
        this.displayPageContent(targetPage);
        
        // 开始新页面的计时器
        this.startPageTimer();
        
        console.log(`显示页面: ${pageIndex + 1}/${this.totalPages} - ${targetPage.title}`);
    }
    
    displayPageContent(page) {
        const contentContainer = document.querySelector('.page-content');
        
        if (!contentContainer) {
            console.error('找不到 .page-content 容器');
            return;
        }
        
        // 根据页面类型显示不同内容
        switch(page.type) {
            case 'welcome':
                contentContainer.innerHTML = this.renderWelcomePage(page.content);
                break;
            case 'worship':
                contentContainer.innerHTML = this.renderWorshipPage(page.content);
                break;
            case 'scripture':
                contentContainer.innerHTML = this.renderScripturePage(page.content);
                break;
            case 'message':
                contentContainer.innerHTML = this.renderMessagePage(page.content);
                break;
            case 'announcements':
                contentContainer.innerHTML = this.renderAnnouncementsPage(page.content);
                break;
            case 'communion':
                contentContainer.innerHTML = this.renderCommunionPage(page.content);
                break;
            case 'offering':
                contentContainer.innerHTML = this.renderOfferingPage(page.content);
                break;
            case 'birthday':
                contentContainer.innerHTML = this.renderBirthdayPage(page.content);
                break;
            case 'closing':
                contentContainer.innerHTML = this.renderClosingPage(page.content);
                break;
            case 'prayer':
                contentContainer.innerHTML = this.renderPrayerPage(page.content);
                break;
            case 'testimony':
                contentContainer.innerHTML = this.renderTestimonyPage(page.content);
                break;
            case 'video':
                contentContainer.innerHTML = this.renderVideoPage(page.content);
                break;
            case 'responsiveReading':
                contentContainer.innerHTML = this.renderResponsiveReadingPage(page.content);
                break;
            case 'creed':
                contentContainer.innerHTML = this.renderCreedPage(page.content);
                break;
            case 'childrenBlessing':
                contentContainer.innerHTML = this.renderChildrenBlessingPage(page.content);
                break;
            case 'newMembers':
                contentContainer.innerHTML = this.renderNewMembersPage(page.content);
                break;
            case 'baptism':
                contentContainer.innerHTML = this.renderBaptismPage(page.content);
                break;
            case 'weddingAnniversary':
                contentContainer.innerHTML = this.renderWeddingAnniversaryPage(page.content);
                break;
            case 'missionReport':
                contentContainer.innerHTML = this.renderMissionReportPage(page.content);
                break;
            case 'specialMusic':
                contentContainer.innerHTML = this.renderSpecialMusicPage(page.content);
                break;
            case 'lordsPrayer':
                contentContainer.innerHTML = this.renderLordsPrayerPage(page.content);
                break;
            case 'benediction':
                contentContainer.innerHTML = this.renderBenedictionPage(page.content);
                break;
            case 'doxology':
                contentContainer.innerHTML = this.renderDoxologyPage(page.content);
                break;
            default:
                contentContainer.innerHTML = this.renderGenericPage(page);
        }
        
        // 添加页面类型类名用于样式定制
        contentContainer.parentElement.className = '';
        contentContainer.parentElement.classList.add(`page-${page.type}`);
    }
    
    // ============ 页面渲染函数 ============
    
    renderWelcomePage(content) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('zh-CN', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        const dateString = now.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        });
        
        return `
            <div class="welcome-container">
                <h1 class="welcome-title">${content.text || '欢迎参加崇拜'}</h1>
                <p class="welcome-subtitle">${content.subtext || '在主爱中合一敬拜'}</p>
                
                ${content.showDate ? `
                    <div class="time-display">
                        <div class="current-date">${dateString}</div>
                        ${content.showTime ? `<div class="current-time">${timeString}</div>` : ''}
                    </div>
                ` : ''}
                
                <div class="welcome-instruction">
                    <p>请将手机调至静音</p>
                    <p>预备心来敬拜神</p>
                </div>
            </div>
        `;
    }
    
    renderWorshipPage(content) {
        const currentSong = content.songs && content.songs[content.currentSongIndex || 0];
        
        if (!currentSong) {
            return '<div class="no-song">暂无歌曲信息</div>';
        }
        
        return `
            <div class="song-display">
                <h2 class="song-title">${currentSong.title || '诗歌'}</h2>
                
                <div class="song-meta">
                    <span class="song-key">调性: ${currentSong.key || 'C'}</span>
                    <span class="song-tempo">速度: ${currentSong.tempo || '中板'}</span>
                </div>
                
                ${content.showLyrics && currentSong.lyrics ? `
                    <div class="lyrics-container">
                        <pre class="lyrics-text">${currentSong.lyrics}</pre>
                    </div>
                ` : ''}
                
                <div class="song-navigation">
                    <div class="song-counter">
                        ${(content.currentSongIndex || 0) + 1} / ${content.songs.length}
                    </div>
                </div>
            </div>
        `;
    }
    
    renderScripturePage(content) {
        // 兼容两种数据结构
        let text = '', reference = '', version = '';
        let showReference = content.showReference !== false;
        let showVersion = content.showVersion !== false;

        // 格式1：直接字段（来自 content.json）
        if (content.text) {
            text = content.text;
            reference = content.reference || '';
            version = content.version || '';
        }
        // 格式2：嵌套字段（来自 config-manager）
        else if (content.scripture && content.scripture.text) {
            text = content.scripture.text;
            reference = `${content.scripture.book || ''} ${content.scripture.chapter || ''}:${content.scripture.verse || ''}`.trim();
            version = content.scripture.translation || '';
        }

        return `
            <div class="scripture-container">
                <h2 class="scripture-title">经文</h2>
                <div class="scripture-text">
                    ${text || '经文内容'}
                </div>
                ${showReference && reference ? `
                    <div class="scripture-reference">
                        ${reference}${showVersion && version ? ` (${version})` : ''}
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    renderMessagePage(content) {
        // 兼容 outline 为对象数组（content.json）或字符串（config-manager）
        let outlineItems = [];
        if (Array.isArray(content.outline)) {
            outlineItems = content.outline.map(item => {
                if (typeof item === 'string') {
                    return { title: item, content: '' };
                }
                return {
                    title: item.title || '',
                    content: item.content || ''
                };
            });
        } else if (typeof content.outline === 'string') {
            outlineItems = content.outline
                .split('\n')
                .map(line => line.trim())
                .filter(line => line)
                .map(line => ({ title: line, content: '' }));
        }

        const currentIdx = Math.min(content.currentPointIndex || 0, outlineItems.length - 1);
        const currentPoint = outlineItems[currentIdx] || { title: '', content: '' };

        return `
            <div class="message-container">
                <h2 class="message-title">${content.title || '信息分享'}</h2>
                <p class="message-speaker">讲员: ${content.speaker || '讲员'}</p>
                ${currentPoint.title ? `
                    <div class="current-point">
                        <h3 class="point-title">${currentPoint.title}</h3>
                        ${currentPoint.content ? `<p class="point-content">${currentPoint.content}</p>` : ''}
                    </div>
                ` : ''}
                ${outlineItems.length > 0 ? `
                    <div class="message-outline">
                        <h4>大纲:</h4>
                        <ul class="outline-list">
                            ${outlineItems.map((point, index) => `
                                <li class="${index === currentIdx ? 'active' : ''}">
                                    ${point.title}
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    renderAnnouncementsPage(content) {
        return `
            <div class="announcements-container">
                <h2 class="announcements-title">家事报告</h2>
                
                <div class="announcements-list">
                    ${content.items && content.items.length > 0 ? 
                        content.items.map(item => `
                            <div class="announcement-item ${item.important ? 'important' : ''}">
                                <h3 class="announcement-title">${item.title}</h3>
                                <p class="announcement-content">${item.content}</p>
                            </div>
                        `).join('') 
                        : '<p class="no-announcements">暂无报告事项</p>'
                    }
                </div>
            </div>
        `;
    }
    
    renderCommunionPage(content) {
        const countdown = content.showCountdown ? `
            <div class="communion-countdown">
                <div class="countdown-title">默想时间</div>
                <div class="countdown-timer" id="communion-timer">05:00</div>
            </div>
        ` : '';
        
        return `
            <div class="communion-container">
                <div class="communion-header">
                    <h2 class="communion-title">圣餐礼</h2>
                    <div class="communion-icon">🍷🍞</div>
                </div>
                
                <div class="communion-instruction">
                    <p>${content.instructions || '请安静预备心，领受主的饼和杯'}</p>
                </div>
                
                <div class="communion-scripture">
                    <blockquote>
                        "${content.scripture || '你们每逢吃这饼，喝这杯，是表明主的死，直等到他来。'}"
                        <cite>${content.scriptureReference || '哥林多前书 11:26'}</cite>
                    </blockquote>
                </div>
                
                ${countdown}
                
                <div class="communion-prayer">
                    <p>主啊，我们感谢你...</p>
                </div>
            </div>
        `;
    }
    
    renderOfferingPage(content) {
        return `
            <div class="offering-container">
                <h2 class="offering-title">奉献</h2>
                
                <div class="offering-scripture">
                    <blockquote>
                        "${content.text || '各人要随本心所酌定的，不要作难，不要勉强，因为捐得乐意的人是神所喜爱的。'}"
                        <cite>${content.scripture || '哥林多后书 9:7'}</cite>
                    </blockquote>
                </div>
                
                <div class="offering-methods">
                    <div class="offering-method">
                        <h3>扫码奉献</h3>
                        ${content.qrCode ? `
                            <div class="qr-code">
                                <img src="${content.qrCode}" alt="奉献二维码">
                            </div>
                        ` : '<p>请向招待人员索取二维码</p>'}
                    </div>
                    
                    <div class="offering-method">
                        <h3>银行转账</h3>
                        ${content.bankInfo ? `
                            <div class="bank-info">
                                <p>银行：${content.bankInfo.bank || ''}</p>
                                <p>账号：${content.bankInfo.account || ''}</p>
                                <p>户名：${content.bankInfo.name || ''}</p>
                            </div>
                        ` : '<p>请向财务同工咨询</p>'}
                    </div>
                </div>
                
                <div class="offering-prayer">
                    <p>求主悦纳我们的奉献，使用这些金钱扩展你的国度。</p>
                </div>
            </div>
        `;
    }
    
    renderBirthdayPage(content) {
        const birthdayList = content.birthdayPersons && content.birthdayPersons.length > 0 ? 
            content.birthdayPersons.map(person => `
                <div class="birthday-person">
                    <div class="birthday-icon">🎂</div>
                    <div class="person-info">
                        <h3>${person.name}</h3>
                        <p>${person.birthdate}</p>
                        ${person.age ? `<p>${person.age}岁</p>` : ''}
                    </div>
                </div>
            `).join('') 
            : '<p class="no-birthdays">本月没有生日</p>';
        
        return `
            <div class="birthday-container">
                <h2 class="birthday-title">生日祝福 🎉</h2>
                
                <div class="birthday-list">
                    ${birthdayList}
                </div>
                
                <div class="birthday-blessing">
                    <blockquote>
                        "${content.blessing || '愿耶和华赐福给你，保护你！愿耶和华使他的脸光照你，赐恩给你！'}"
                        <cite>民数记 6:24-26</cite>
                    </blockquote>
                </div>
                
                <div class="birthday-prayer">
                    <p>求主赐福给寿星们，让他们在新的一岁中更认识你、更爱你！</p>
                </div>
            </div>
        `;
    }
    
    renderClosingPage(content) {
        return `
            <div class="closing-container">
                <h2 class="closing-title">祝福与差遣</h2>
                
                <div class="closing-blessing">
                    <blockquote>
                        "${content.blessing || '愿主耶稣基督的恩惠，神的慈爱，圣灵的感动，常与你们众人同在！'}"
                        <cite>${content.scripture || '哥林多后书 13:14'}</cite>
                    </blockquote>
                </div>
                
                <div class="closing-info">
                    ${content.dismissalTime ? `
                        <div class="dismissal-time">
                            <i class="fas fa-clock"></i>
                            <span>散会时间：${content.dismissalTime}</span>
                        </div>
                    ` : ''}
                    
                    ${content.nextMeeting ? `
                        <div class="next-meeting">
                            <i class="fas fa-calendar-alt"></i>
                            <span>下次聚会：${content.nextMeeting}</span>
                        </div>
                    ` : ''}
                    
                    ${content.fellowshipTime ? `
                        <div class="fellowship-time">
                            <i class="fas fa-coffee"></i>
                            <span>茶点交通：${content.fellowshipTime}</span>
                        </div>
                    ` : ''}
                </div>
                
                <div class="closing-announcement">
                    <p>散会后请带走个人物品，欢迎留下交通。</p>
                </div>
            </div>
        `;
    }
    
    renderPrayerPage(content) {
        return `
            <div class="prayer-container">
                <h2 class="prayer-title">${content.title || '祷告'}</h2>
                
                <div class="prayer-content">
                    <p>${content.text || '亲爱的天父，我们感谢赞美你...'}</p>
                </div>
                
                ${content.prayerPoints && content.prayerPoints.length > 0 ? `
                    <div class="prayer-points">
                        <h3>代祷事项：</h3>
                        <ul>
                            ${content.prayerPoints.map(point => `<li>${point}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                <div class="prayer-instruction">
                    <p>${content.instruction || '请同心开声祷告'}</p>
                </div>
            </div>
        `;
    }
    
    renderTestimonyPage(content) {
        return `
            <div class="testimony-container">
                <h2 class="testimony-title">见证分享</h2>
                
                ${content.speaker ? `
                    <div class="testimony-speaker">
                        <h3>${content.speaker.name || '见证人'}</h3>
                        ${content.speaker.title ? `<p>${content.speaker.title}</p>` : ''}
                    </div>
                ` : ''}
                
                <div class="testimony-content">
                    ${content.content || '我要述说主在我身上的作为...'}
                </div>
                
                ${content.scripture ? `
                    <div class="testimony-scripture">
                        <blockquote>${content.scripture}</blockquote>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    renderVideoPage(content) {
        return `
            <div class="video-container">
                <h2 class="video-title">${content.title || '视频分享'}</h2>
                
                ${content.url ? `
                    <div class="video-player">
                        ${content.type === 'youtube' ? `
                            <iframe 
                                width="800" 
                                height="450" 
                                src="https://www.youtube.com/embed/${this.extractYouTubeId(content.url)}" 
                                frameborder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowfullscreen>
                            </iframe>
                        ` : `
                            <video controls width="800">
                                <source src="${content.url}" type="video/mp4">
                                您的浏览器不支持视频播放。
                            </video>
                        `}
                    </div>
                ` : '<p>视频链接未设置</p>'}
                
                ${content.description ? `
                    <div class="video-description">
                        <p>${content.description}</p>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    renderResponsiveReadingPage(content) {
        return `
            <div class="responsive-reading-container">
                <h2 class="responsive-title">${content.title || '启应经文'}</h2>
                
                ${content.leaderPart ? `
                    <div class="reading-part leader">
                        <h3>主领：</h3>
                        <p>${content.leaderPart}</p>
                    </div>
                ` : ''}
                
                ${content.congregationPart ? `
                    <div class="reading-part congregation">
                        <h3>会众：</h3>
                        <p>${content.congregationPart}</p>
                    </div>
                ` : ''}
                
                ${content.instruction ? `
                    <div class="reading-instruction">
                        <p>${content.instruction}</p>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    renderCreedPage(content) {
        return `
            <div class="creed-container">
                <h2 class="creed-title">${content.title || '使徒信经'}</h2>
                
                <div class="creed-content">
                    <p>我信上帝，全能的父，创造天地的主。</p>
                    <p>我信我主耶稣基督，上帝的独生子；</p>
                    <p>因圣灵感孕，由童贞女马利亚所生；</p>
                    <p>在本丢彼拉多手下受难，被钉于十字架，受死，埋葬；</p>
                    <p>降在阴间，第三天从死人中复活；</p>
                    <p>升天，坐在全能父上帝的右边；</p>
                    <p>将来必从那里降临，审判活人死人。</p>
                    <p>我信圣灵；</p>
                    <p>我信圣而公之教会；我信圣徒相通；</p>
                    <p>我信罪得赦免；</p>
                    <p>我信身体复活；</p>
                    <p>我信永生。阿们！</p>
                </div>
                
                <div class="creed-instruction">
                    <p>请全体起立，同颂使徒信经</p>
                </div>
            </div>
        `;
    }
    
    renderChildrenBlessingPage(content) {
        return `
            <div class="children-blessing-container">
                <h2 class="children-title">儿童祝福</h2>
                
                ${content.children && content.children.length > 0 ? `
                    <div class="children-list">
                        ${content.children.map(child => `
                            <div class="child-item">
                                <div class="child-name">${child.name}</div>
                                ${child.age ? `<div class="child-age">${child.age}岁</div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                <div class="children-blessing-text">
                    <p>${content.blessing || '耶稣说："让小孩子到我这里来，不要禁止他们，因为在天国的，正是这样的人。"'}</p>
                </div>
                
                <div class="children-prayer">
                    <p>求主赐福这些孩子，保守他们健康成长，从小认识主。</p>
                </div>
            </div>
        `;
    }
    
    renderNewMembersPage(content) {
        return `
            <div class="new-members-container">
                <h2 class="new-members-title">欢迎新会友</h2>
                
                <div class="welcome-message">
                    <p>${content.welcomeMessage || '欢迎加入教会大家庭'}</p>
                </div>
                
                ${content.members && content.members.length > 0 ? `
                    <div class="members-list">
                        ${content.members.map(member => `
                            <div class="member-item">
                                <h3>${member.name}</h3>
                                ${member.family ? `<p>${member.family}</p>` : ''}
                            </div>
                        `).join('')}
                    </div>
                ` : '<p>本月没有新会友</p>'}
            </div>
        `;
    }
    
    renderBaptismPage(content) {
        return `
            <div class="baptism-container">
                <h2 class="baptism-title">洗礼</h2>
                
                <div class="baptism-scripture">
                    <blockquote>
                        "${content.scripture || '所以，你们要去，使万民作我的门徒，奉父、子、圣灵的名给他们施洗。'}"
                        <cite>马太福音 28:19</cite>
                    </blockquote>
                </div>
                
                ${content.candidates && content.candidates.length > 0 ? `
                    <div class="candidates-list">
                        <h3>受洗候选人：</h3>
                        ${content.candidates.map(candidate => `
                            <div class="candidate-item">
                                <h4>${candidate.name}</h4>
                                ${candidate.testimony ? `<p>${candidate.testimony}</p>` : ''}
                            </div>
                        `).join('')}
                    </div>
                ` : '<p>本期没有洗礼</p>'}
            </div>
        `;
    }
    
    renderWeddingAnniversaryPage(content) {
        return `
            <div class="wedding-anniversary-container">
                <h2 class="anniversary-title">结婚周年祝福 💑</h2>
                
                ${content.couples && content.couples.length > 0 ? `
                    <div class="couples-list">
                        ${content.couples.map(couple => `
                            <div class="couple-item">
                                <h3>${couple.husband} & ${couple.wife}</h3>
                                <p>${couple.years}周年</p>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p>本月没有结婚周年</p>'}
                
                <div class="anniversary-blessing">
                    <p>${content.blessing || '愿耶和华赐福给你们，愿你们白头偕老，永沐爱河。'}</p>
                </div>
            </div>
        `;
    }
    
    renderMissionReportPage(content) {
        return `
            <div class="mission-report-container">
                <h2 class="mission-title">事工报告</h2>
                
                ${content.reports && content.reports.length > 0 ? 
                    content.reports.map(report => `
                        <div class="report-item">
                            <h3>${report.title}</h3>
                            <p>${report.content}</p>
                            ${report.reporter ? `<p class="reporter">报告人：${report.reporter}</p>` : ''}
                        </div>
                    `).join('')
                    : '<p>暂无事工报告</p>'
                }
            </div>
        `;
    }
    
    renderSpecialMusicPage(content) {
        return `
            <div class="special-music-container">
                <h2 class="special-music-title">特别献诗</h2>
                
                <div class="performer-info">
                    <h3>${content.performers || '献诗者'}</h3>
                    <p>献唱：${content.songTitle || '诗歌'}</p>
                </div>
                
                ${content.description ? `
                    <div class="music-description">
                        <p>${content.description}</p>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    renderLordsPrayerPage(content) {
        return `
            <div class="lords-prayer-container">
                <h2 class="lords-prayer-title">${content.title || '主祷文'}</h2>
                
                <div class="lords-prayer-content">
                    <p>我们在天上的父，愿人都尊你的名为圣。</p>
                    <p>愿你的国降临。愿你的旨意行在地上，如同行在天上。</p>
                    <p>我们日用的饮食，今日赐给我们。</p>
                    <p>免我们的债，如同我们免了人的债。</p>
                    <p>不叫我们遇见试探，救我们脱离凶恶。</p>
                    <p>因为国度、权柄、荣耀，全是你的，直到永远。阿们！</p>
                </div>
                
                <div class="prayer-instruction">
                    <p>请全体起立，同颂主祷文</p>
                </div>
            </div>
        `;
    }
    
    renderBenedictionPage(content) {
        return `
            <div class="benediction-container">
                <h2 class="benediction-title">${content.title || '祝福祷告'}</h2>
                
                <div class="benediction-content">
                    <p>${content.text || '愿赐平安的神亲自使你们全然成圣！又愿你们的灵与魂与身子得蒙保守，在我们主耶稣基督降临的时候，完全无可指摘！'}</p>
                </div>
                
                <div class="benediction-source">
                    <p>帖撒罗尼迦前书 5:23</p>
                </div>
            </div>
        `;
    }
    
    renderDoxologyPage(content) {
        return `
            <div class="doxology-container">
                <h2 class="doxology-title">${content.title || '三一颂'}</h2>
                
                <div class="doxology-content">
                    <p>赞美真神万福之源，世上万民都当颂赞；</p>
                    <p>天使天军赞美主名，赞美圣父圣子圣灵。阿们！</p>
                </div>
                
                <div class="doxology-instruction">
                    <p>请全体起立，同颂三一颂</p>
                </div>
            </div>
        `;
    }
    
    renderGenericPage(page) {
        return `
            <div class="generic-page">
                <h2>${page.title}</h2>
                <p>页面类型: ${page.type}</p>
                <pre>${JSON.stringify(page.content, null, 2)}</pre>
            </div>
        `;
    }
    
    extractYouTubeId(url) {
        if (!url) return '';
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : '';
    }
    
    prevPage() {
        console.log('prevPage 方法调用, currentIndex:', this.currentPageIndex);
        if (this.currentPageIndex > 0) {
            this.showPage(this.currentPageIndex - 1);
        } else {
            console.log('已经是第一页');
        }
    }
    
    nextPage() {
        console.log('nextPage 方法调用, currentIndex:', this.currentPageIndex);
        if (this.currentPageIndex < this.totalPages - 1) {
            this.showPage(this.currentPageIndex + 1);
        } else {
            console.log('已经是最后一页');
        }
    }
    
    updatePageIndicator() {
        const indicator = document.getElementById('page-indicator');
        if (indicator) {
            indicator.textContent = `${this.currentPageIndex + 1} / ${this.totalPages}`;
        }
    }
    
    updateNavigationDots() {
        const dots = document.querySelectorAll('.nav-dot');
        dots.forEach((dot, index) => {
            if (index === this.currentPageIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }
    
    startPageTimer() {
        this.pageStartTime = Date.now();
        this.updateTimer();
        
        this.timerInterval = setInterval(() => {
            this.updateTimer();
        }, 1000);
    }
    
    stopPageTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    updateTimer() {
        if (!this.pageStartTime) return;
        
        const timerElement = document.getElementById('timer');
        if (!timerElement) return;
        
        const elapsed = Math.floor((Date.now() - this.pageStartTime) / 1000);
        const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
        const seconds = (elapsed % 60).toString().padStart(2, '0');
        
        timerElement.textContent = `${minutes}:${seconds}`;
    }
    
    toggleFullscreen() {
        console.log('切换全屏');
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error('全屏失败:', err);
            });
            this.isFullscreen = true;
            const fullscreenBtn = document.getElementById('fullscreen-btn');
            if (fullscreenBtn) {
                fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
            }
        } else {
            document.exitFullscreen();
            this.isFullscreen = false;
            const fullscreenBtn = document.getElementById('fullscreen-btn');
            if (fullscreenBtn) {
                fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
            }
        }
    }
    
    openConfig() {
        console.log('打开配置页面');
        window.open('config.html', '_blank', 'width=800,height=600');
    }
    
    toggleVoiceControl() {
        console.log('切换语音控制');
        this.voiceControlActive = !this.voiceControlActive;
        const voiceIndicator = document.getElementById('voice-indicator');
        
        if (this.voiceControlActive) {
            if (voiceIndicator) voiceIndicator.classList.remove('hidden');
            const voiceToggle = document.getElementById('voice-toggle');
            if (voiceToggle) voiceToggle.innerHTML = '<i class="fas fa-microphone-slash"></i>';
            this.startVoiceControl();
        } else {
            if (voiceIndicator) voiceIndicator.classList.add('hidden');
            const voiceToggle = document.getElementById('voice-toggle');
            if (voiceToggle) voiceToggle.innerHTML = '<i class="fas fa-microphone"></i>';
            this.stopVoiceControl();
        }
    }
    
    initializeVoiceControl() {
        // 预留语音控制接口
        console.log('语音控制已准备就绪（需要annyang库支持）');
    }
    
    startVoiceControl() {
        // 语音控制实现（预留）
        console.log('语音控制已激活');
        
        // 示例：模拟语音控制命令
        setTimeout(() => {
            if (this.voiceControlActive) {
                const voiceIndicator = document.getElementById('voice-indicator');
                if (voiceIndicator) voiceIndicator.style.color = '#27ae60';
            }
        }, 1000);
    }
    
    stopVoiceControl() {
        console.log('语音控制已停用');
    }
    
    showError(message) {
        const contentContainer = document.querySelector('.page-content');
        if (contentContainer) {
            contentContainer.innerHTML = `
                <div class="error-message">
                    <h3>系统错误</h3>
                    <p>${message}</p>
                    <button onclick="location.reload()">重新加载</button>
                </div>
            `;
        }
    }
    
    // ============ 新增：复位功能 ============
    
    confirmReset() {
        if (!confirm('确定要恢复默认的24个页面吗？\n\n此操作将：\n• 清空当前页面配置\n• 恢复为24个默认页面\n• 保留会议基本信息\n\n您可以在配置页面重新编辑。')) {
            return;
        }
        
        this.performReset();
    }
    
    performReset() {
        console.log('执行页面复位...');
        
        try {
            // 1. 清空本地存储
            localStorage.removeItem('churchMeetingConfig');
            
            // 2. 创建24个页面的完整配置
            const fullConfig = {
                version: "2.0",
                meetingInfo: this.meetingData?.meetingInfo || {
                    date: new Date().toISOString().split('T')[0],
                    title: "主日崇拜",
                    theme: "在主爱中合一",
                    time: "09:30",
                    location: "教会大堂"
                },
                pages: this.createDefault24Pages(),
                settings: this.meetingData?.settings || {
                    background: { type: "gradient", theme: "blue" },
                    fontSize: "medium",
                    transitionSpeed: "normal"
                },
                lastUpdated: new Date().toISOString()
            };
            
            // 3. 保存新配置
            localStorage.setItem('churchMeetingConfig', JSON.stringify(fullConfig));
            
            // 4. 重新加载应用
            this.resetMode = true;
            this.loadData().then(() => {
                this.initializeUI();
                this.showPage(0);
                
                // 简单提示
                alert('✅ 已恢复24个默认页面！');
                
                setTimeout(() => {
                    this.resetMode = false;
                }, 1000);
            });
            
        } catch (error) {
            console.error('复位失败:', error);
            alert('复位失败，请刷新页面重试');
        }
    }
    
    createDefault24Pages() {
        const timestamp = Date.now();
        return [
            { id: 'welcome_' + timestamp, title: '欢迎页', type: 'welcome', enabled: true, order: 1, content: {} },
            { id: 'call_' + timestamp, title: '宣召', type: 'scripture', enabled: true, order: 2, content: {} },
            { id: 'opening_prayer_' + timestamp, title: '开祷', type: 'prayer', enabled: true, order: 3, content: {} },
            { id: 'hymn1_' + timestamp, title: '赞美诗', type: 'worship', enabled: true, order: 4, content: {} },
            { id: 'hymn2_' + timestamp, title: '敬拜诗', type: 'worship', enabled: true, order: 5, content: {} },
            { id: 'scripture_reading_' + timestamp, title: '读经', type: 'scripture', enabled: true, order: 6, content: {} },
            { id: 'special_music_' + timestamp, title: '特别献诗', type: 'specialMusic', enabled: true, order: 7, content: {} },
            { id: 'pastoral_prayer_' + timestamp, title: '牧祷', type: 'prayer', enabled: true, order: 8, content: {} },
            { id: 'announcements_' + timestamp, title: '家事报告', type: 'announcements', enabled: true, order: 9, content: {} },
            { id: 'offering_' + timestamp, title: '奉献', type: 'offering', enabled: true, order: 10, content: {} },
            { id: 'offering_hymn_' + timestamp, title: '奉献诗歌', type: 'worship', enabled: true, order: 11, content: {} },
            { id: 'scripture_' + timestamp, title: '经文', type: 'scripture', enabled: true, order: 12, content: {} },
            { id: 'message_' + timestamp, title: '证道', type: 'message', enabled: true, order: 13, content: {} },
            { id: 'communion_' + timestamp, title: '圣餐', type: 'communion', enabled: true, order: 14, content: {} },
            { id: 'testimony_' + timestamp, title: '见证', type: 'testimony', enabled: true, order: 15, content: {} },
            { id: 'baptism_' + timestamp, title: '洗礼', type: 'baptism', enabled: true, order: 16, content: {} },
            { id: 'new_members_' + timestamp, title: '迎新会友', type: 'newMembers', enabled: true, order: 17, content: {} },
            { id: 'birthdays_' + timestamp, title: '生日祝福', type: 'birthday', enabled: true, order: 18, content: {} },
            { id: 'children_blessing_' + timestamp, title: '儿童祝福', type: 'childrenBlessing', enabled: true, order: 19, content: {} },
            { id: 'lords_prayer_' + timestamp, title: '主祷文', type: 'lordsPrayer', enabled: true, order: 20, content: {} },
            { id: 'closing_hymn_' + timestamp, title: '回应诗', type: 'worship', enabled: true, order: 21, content: {} },
            { id: 'benediction_' + timestamp, title: '祝福', type: 'benediction', enabled: true, order: 22, content: {} },
            { id: 'doxology_' + timestamp, title: '三一颂', type: 'doxology', enabled: true, order: 23, content: {} },
            { id: 'closing_' + timestamp, title: '散会', type: 'closing', enabled: true, order: 24, content: {} }
        ];
    }
}

// 应用启动
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM已加载，启动应用...');
    const app = new ChurchMeetingApp();
    window.app = app; // 修复：暴露到全局，便于调试
    console.log('应用实例已创建:', app);
});