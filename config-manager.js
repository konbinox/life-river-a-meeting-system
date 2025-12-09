/**
 * 配置管理器 - 完整24页版本
 * 修复：显示24个页面而不是7个
 */

class ConfigManager {
    constructor() {
        this.currentData = null;
        this.isDirty = false;
        this.pageEditor = null;
    }
    
    // =============== 初始化 ===============
    async initialize() {
        console.log('初始化配置管理器...');
        
        try {
            await this.loadData();
            this.initializeUI();
            this.bindEvents();
            this.pageEditor = new PageEditor(this);
            this.updateStatus();
            console.log('配置管理器初始化完成');
        } catch (error) {
            console.error('初始化失败:', error);
        }
    }
    
    async loadData() {
        try {
            const savedConfig = localStorage.getItem('churchMeetingConfig');
            
            if (savedConfig) {
                this.currentData = JSON.parse(savedConfig);
                console.log('从本地存储加载配置');
            } else {
                this.currentData = this.getDefaultData();
                console.log('使用默认配置');
            }
            
            this.ensureDataStructure();
            
        } catch (error) {
            console.error('加载数据失败:', error);
            this.currentData = this.getDefaultData();
        }
    }
    
    ensureDataStructure() {
        if (!this.currentData.meetingInfo) {
            this.currentData.meetingInfo = {};
        }
        if (!this.currentData.pages || this.currentData.pages.length < 24) {
            this.currentData.pages = this.getDefaultPages();
        }
        if (!this.currentData.settings) {
            this.currentData.settings = {
                background: { type: 'gradient', theme: 'blue' },
                fontSize: 'medium'
            };
        }
    }
    
    // =============== 核心数据方法 ===============
    getDefaultData() {
        return {
            version: "1.0",
            meetingInfo: {
                date: new Date().toISOString().split('T')[0],
                title: "主日崇拜",
                theme: "在主爱中合一",
                time: "09:30",
                location: "教会大堂",
                host: {
                    type: "selected",
                    selectedId: null,
                    options: []
                }
            },
            pages: this.getDefaultPages(),
            settings: {
                background: { type: "gradient", theme: "blue" },
                fontSize: "medium",
                transitionSpeed: "normal"
            },
            lastUpdated: new Date().toISOString()
        };
    }
    
    // =============== 修复：返回24个页面 ===============
    getDefaultPages() {
        const timestamp = Date.now();
        return [
            // 1. 欢迎页
            {
                id: 'welcome_' + timestamp,
                title: '欢迎页',
                type: 'welcome',
                enabled: true,
                order: 1,
                content: {
                    text: '欢迎参加今日主日崇拜',
                    subtext: '在主爱中合一，在圣灵里敬拜',
                    showDate: true,
                    showTime: true,
                    style: 'classic'
                },
                backgroundColor: '#4a6fa5',
                textColor: '#ffffff',
                fontSize: 'large',
                align: 'center'
            },
            // 2. 宣召
            {
                id: 'call_' + timestamp,
                title: '宣召',
                type: 'scripture',
                enabled: true,
                order: 2,
                content: {
                    scripture: {
                        book: '诗篇',
                        chapter: '100',
                        verse: '1-5',
                        text: '普天下当向耶和华欢呼！你们当乐意事奉耶和华，当来向他歌唱！',
                        translation: '和合本',
                        displayStyle: 'full'
                    },
                    showReference: true,
                    showVersion: true
                },
                backgroundColor: '#5a9bd4',
                textColor: '#ffffff',
                fontSize: 'medium',
                align: 'center'
            },
            // 3. 开祷
            {
                id: 'opening_prayer_' + timestamp,
                title: '开祷',
                type: 'prayer',
                enabled: true,
                order: 3,
                content: {
                    title: '开堂祷告',
                    text: '亲爱的天父，我们感谢赞美你，求你用圣灵光照我们，洁净我们的心，使我们能用心灵和诚实敬拜你。',
                    prayerPoints: [],
                    instruction: '请同心开声祷告'
                },
                backgroundColor: '#6c757d',
                textColor: '#ffffff',
                fontSize: 'medium',
                align: 'center'
            },
            // 4. 赞美诗
            {
                id: 'hymn1_' + timestamp,
                title: '赞美诗',
                type: 'worship',
                enabled: true,
                order: 4,
                content: {
                    songs: [{
                        title: '圣哉三一歌',
                        key: 'C',
                        tempo: '中板',
                        lyrics: '圣哉，圣哉，圣哉！全能大主宰！\n清晨我众歌声，穿云上达天庭；\n圣哉，圣哉，圣哉！慈悲与全能，\n荣耀与赞美，归三一妙身。'
                    }],
                    order: 'manual',
                    backgroundMusic: 'none',
                    slideDuration: 15,
                    showLyrics: true
                },
                backgroundColor: '#28a745',
                textColor: '#ffffff',
                fontSize: 'medium',
                align: 'center'
            },
            // 5. 敬拜诗
            {
                id: 'hymn2_' + timestamp,
                title: '敬拜诗',
                type: 'worship',
                enabled: true,
                order: 5,
                content: {
                    songs: [{
                        title: '你真伟大',
                        key: 'G',
                        tempo: '慢板',
                        lyrics: '主啊，我神，我每逢举目观看，\n你手所造一切奇妙大工，\n看见星宿，又听到隆隆雷声，\n你的大能遍满了宇宙中。'
                    }],
                    order: 'manual',
                    backgroundMusic: 'none',
                    slideDuration: 15,
                    showLyrics: true
                },
                backgroundColor: '#20c997',
                textColor: '#ffffff',
                fontSize: 'medium',
                align: 'center'
            },
            // 6. 读经
            {
                id: 'scripture_reading_' + timestamp,
                title: '读经',
                type: 'scripture',
                enabled: true,
                order: 6,
                content: {
                    scripture: {
                        book: '约翰福音',
                        chapter: '3',
                        verse: '16',
                        text: '神爱世人，甚至将他的独生子赐给他们，叫一切信他的，不至灭亡，反得永生。',
                        translation: '和合本',
                        displayStyle: 'full'
                    },
                    showReference: true,
                    showVersion: true
                },
                backgroundColor: '#e8f4fd',
                textColor: '#2c3e50',
                fontSize: 'medium',
                align: 'left'
            },
            // 7. 特别献诗
            {
                id: 'special_music_' + timestamp,
                title: '特别献诗',
                type: 'specialMusic',
                enabled: true,
                order: 7,
                content: {
                    performers: '诗班',
                    songTitle: '奇异恩典',
                    description: '诗班献唱'
                },
                backgroundColor: '#ffc107',
                textColor: '#212529',
                fontSize: 'medium',
                align: 'center'
            },
            // 8. 牧祷
            {
                id: 'pastoral_prayer_' + timestamp,
                title: '牧祷',
                type: 'prayer',
                enabled: true,
                order: 8,
                content: {
                    title: '牧者祷告',
                    text: '求主祝福我们的聚会，保守每位弟兄姊妹，赐福我们的教会和事工。',
                    prayerPoints: [],
                    instruction: '请同声祷告'
                },
                backgroundColor: '#dc3545',
                textColor: '#ffffff',
                fontSize: 'medium',
                align: 'center'
            },
            // 9. 家事报告
            {
                id: 'announcements_' + timestamp,
                title: '家事报告',
                type: 'announcements',
                enabled: true,
                order: 9,
                content: {
                    items: [{
                        title: '欢迎新朋友',
                        content: '欢迎第一次参加的朋友，散会后请到接待处领取礼物。',
                        important: true
                    }, {
                        title: '周二祷告会',
                        content: '每周二晚7:30在副堂举行，欢迎参加。',
                        important: false
                    }],
                    layout: 'list',
                    showTime: true,
                    highlightStyle: 'red'
                },
                backgroundColor: '#f8f9fa',
                textColor: '#212529',
                fontSize: 'medium',
                align: 'left'
            },
            // 10. 奉献
            {
                id: 'offering_' + timestamp,
                title: '奉献',
                type: 'offering',
                enabled: true,
                order: 10,
                content: {
                    text: '各人要随本心所酌定的，不要作难，不要勉强，因为捐得乐意的人是神所喜爱的。',
                    scripture: '哥林多后书 9:7',
                    bankInfo: {
                        bank: '中国银行',
                        account: '1234567890',
                        name: 'XX教会'
                    },
                    qrCode: ''
                },
                backgroundColor: '#f0f8ff',
                textColor: '#2c3e50',
                fontSize: 'medium',
                align: 'center'
            },
            // 11. 奉献诗歌
            {
                id: 'offering_hymn_' + timestamp,
                title: '奉献诗歌',
                type: 'worship',
                enabled: true,
                order: 11,
                content: {
                    songs: [{
                        title: '献上感恩',
                        key: 'D',
                        tempo: '中板',
                        lyrics: '献上感恩的心，归给至圣全能神，\n因祂赐下独生子主耶稣基督。'
                    }],
                    order: 'manual',
                    backgroundMusic: 'none',
                    slideDuration: 15,
                    showLyrics: true
                },
                backgroundColor: '#17a2b8',
                textColor: '#ffffff',
                fontSize: 'medium',
                align: 'center'
            },
            // 12. 经文
            {
                id: 'message_scripture_' + timestamp,
                title: '经文',
                type: 'scripture',
                enabled: true,
                order: 12,
                content: {
                    scripture: {
                        book: '罗马书',
                        chapter: '6',
                        verse: '23',
                        text: '因为罪的工价乃是死；惟有神的恩赐，在我们的主基督耶稣里，乃是永生。',
                        translation: '和合本',
                        displayStyle: 'full'
                    },
                    showReference: true,
                    showVersion: true
                },
                backgroundColor: '#e8f4fd',
                textColor: '#2c3e50',
                fontSize: 'medium',
                align: 'left'
            },
            // 13. 证道
            {
                id: 'message_' + timestamp,
                title: '证道',
                type: 'message',
                enabled: true,
                order: 13,
                content: {
                    message: {
                        title: '在主爱中合一',
                        speaker: '王牧师',
                        series: '约翰福音系列',
                        outline: '1. 神的爱是普世性的\n2. 耶稣是神的独生子\n3. 信靠带来永生',
                        duration: 45,
                        slideStyle: 'outline'
                    }
                },
                backgroundColor: '#ffffff',
                textColor: '#000000',
                fontSize: 'medium',
                align: 'left'
            },
            // 14. 圣餐
            {
                id: 'communion_' + timestamp,
                title: '圣餐',
                type: 'communion',
                enabled: true,
                order: 14,
                content: {
                    instructions: '请安静预备心，领受主的饼和杯',
                    scripture: '你们每逢吃这饼，喝这杯，是表明主的死，直等到他来。',
                    scriptureReference: '哥林多前书 11:26',
                    showCountdown: true
                },
                backgroundColor: '#fff8e1',
                textColor: '#5d4037',
                fontSize: 'medium',
                align: 'center'
            },
            // 15. 见证
            {
                id: 'testimony_' + timestamp,
                title: '见证',
                type: 'testimony',
                enabled: true,
                order: 15,
                content: {
                    speaker: {
                        name: '李弟兄',
                        title: ''
                    },
                    content: '感谢主，上个月医生说我需要手术，但在弟兄姊妹的代祷下，神完全医治了我。',
                    scripture: ''
                },
                backgroundColor: '#f5f5f5',
                textColor: '#333333',
                fontSize: 'medium',
                align: 'left'
            },
            // 16. 洗礼
            {
                id: 'baptism_' + timestamp,
                title: '洗礼',
                type: 'baptism',
                enabled: true,
                order: 16,
                content: {
                    scripture: '所以，你们要去，使万民作我的门徒，奉父、子、圣灵的名给他们施洗。',
                    candidates: [{
                        name: '张三',
                        testimony: '我愿意接受耶稣作我的救主'
                    }]
                },
                backgroundColor: '#e3f2fd',
                textColor: '#1565c0',
                fontSize: 'medium',
                align: 'center'
            },
            // 17. 迎新会友
            {
                id: 'new_members_' + timestamp,
                title: '迎新会友',
                type: 'newMembers',
                enabled: true,
                order: 17,
                content: {
                    welcomeMessage: '欢迎加入教会大家庭',
                    members: [{
                        name: '王五',
                        family: '王弟兄一家'
                    }]
                },
                backgroundColor: '#e8f5e9',
                textColor: '#2e7d32',
                fontSize: 'medium',
                align: 'center'
            },
            // 18. 生日祝福
            {
                id: 'birthdays_' + timestamp,
                title: '生日祝福',
                type: 'birthday',
                enabled: true,
                order: 18,
                content: {
                    birthdayPersons: [{
                        name: '赵六',
                        birthdate: '1990-01-01',
                        age: 34
                    }],
                    blessing: '愿耶和华赐福给你，保护你！愿耶和华使他的脸光照你，赐恩给你！'
                },
                backgroundColor: '#fff3e0',
                textColor: '#e65100',
                fontSize: 'medium',
                align: 'center'
            },
            // 19. 儿童祝福
            {
                id: 'children_blessing_' + timestamp,
                title: '儿童祝福',
                type: 'childrenBlessing',
                enabled: true,
                order: 19,
                content: {
                    children: [{
                        name: '小明',
                        age: 5
                    }],
                    blessing: '耶稣说："让小孩子到我这里来，不要禁止他们，因为在天国的，正是这样的人。"'
                },
                backgroundColor: '#f3e5f5',
                textColor: '#7b1fa2',
                fontSize: 'medium',
                align: 'center'
            },
            // 20. 主祷文
            {
                id: 'lords_prayer_' + timestamp,
                title: '主祷文',
                type: 'lordsPrayer',
                enabled: true,
                order: 20,
                content: {
                    title: '主祷文'
                },
                backgroundColor: '#e8eaf6',
                textColor: '#3949ab',
                fontSize: 'large',
                align: 'center'
            },
            // 21. 回应诗
            {
                id: 'closing_hymn_' + timestamp,
                title: '回应诗',
                type: 'worship',
                enabled: true,
                order: 21,
                content: {
                    songs: [{
                        title: '再相会歌',
                        key: 'F',
                        tempo: '中板',
                        lyrics: '愿主同在直到再相会，\n主为良师常指导你，\n主为牧人常养护你，\n愿主同在直到再相会。'
                    }],
                    order: 'manual',
                    backgroundMusic: 'none',
                    slideDuration: 15,
                    showLyrics: true
                },
                backgroundColor: '#4db6ac',
                textColor: '#ffffff',
                fontSize: 'medium',
                align: 'center'
            },
            // 22. 祝福
            {
                id: 'benediction_' + timestamp,
                title: '祝福',
                type: 'benediction',
                enabled: true,
                order: 22,
                content: {
                    title: '祝福祷告',
                    text: '愿赐平安的神亲自使你们全然成圣！又愿你们的灵与魂与身子得蒙保守，在我们主耶稣基督降临的时候，完全无可指摘！',
                    source: '帖撒罗尼迦前书 5:23'
                },
                backgroundColor: '#fff8e1',
                textColor: '#5d4037',
                fontSize: 'large',
                align: 'center'
            },
            // 23. 三一颂
            {
                id: 'doxology_' + timestamp,
                title: '三一颂',
                type: 'doxology',
                enabled: true,
                order: 23,
                content: {
                    title: '三一颂'
                },
                backgroundColor: '#fce4ec',
                textColor: '#c2185b',
                fontSize: 'medium',
                align: 'center'
            },
            // 24. 散会
            {
                id: 'closing_' + timestamp,
                title: '散会',
                type: 'closing',
                enabled: true,
                order: 24,
                content: {
                    blessing: '愿主耶稣基督的恩惠，神的慈爱，圣灵的感动，常与你们众人同在！',
                    scripture: '哥林多后书 13:14',
                    dismissalTime: '11:30',
                    nextMeeting: '下周日 09:30',
                    fellowshipTime: '散会后有茶点交通'
                },
                backgroundColor: '#212529',
                textColor: '#ffffff',
                fontSize: 'medium',
                align: 'center'
            }
        ];
    }
    
    // =============== UI初始化 ===============
    initializeUI() {
        this.initializeBasicInfo();
        this.initializeHostOptions();
        this.initializePageList();
        this.initializeSongList();
        this.initializeAnnouncementsList();
        this.initializeSystemSettings();
    }
    
    initializeBasicInfo() {
        if (!this.currentData.meetingInfo) return;
        
        const setValue = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.value = value || '';
        };
        
        const data = this.currentData.meetingInfo;
        setValue('meeting-date', data.date);
        setValue('meeting-title', data.title);
        setValue('meeting-theme', data.theme);
        setValue('meeting-time', data.time || '09:30');
        setValue('meeting-location', data.location);
    }
    
    initializeHostOptions() {
        const container = document.getElementById('host-options');
        if (!container) return;
        
        const hostConfig = this.currentData.meetingInfo.host;
        if (!hostConfig) return;
        
        container.innerHTML = '';
        
        if (hostConfig.options && hostConfig.options.length > 0) {
            hostConfig.options.forEach(host => {
                const option = document.createElement('div');
                option.className = `host-option ${host.id === hostConfig.selectedId ? 'selected' : ''}`;
                option.dataset.hostId = host.id;
                
                option.innerHTML = `
                    <div class="host-avatar"><i class="fas fa-user"></i></div>
                    <h4>${host.name}</h4>
                    ${host.role ? `<p>${host.role}</p>` : ''}
                    <button class="btn btn-danger btn-sm delete-host" data-host-id="${host.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                `;
                
                option.addEventListener('click', (e) => {
                    if (!e.target.closest('.delete-host')) {
                        this.selectHost(host.id);
                    }
                });
                
                container.appendChild(option);
            });
        }
        
        container.querySelectorAll('.delete-host').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-host-id');
                if (confirm('确定删除该主持人？')) {
                    this.currentData.meetingInfo.host.options = 
                        (this.currentData.meetingInfo.host.options || []).filter(h => h.id !== id);
                    if (this.currentData.meetingInfo.host.selectedId === id) {
                        this.currentData.meetingInfo.host.selectedId = null;
                    }
                    this.initializeHostOptions();
                    this.markDirty();
                }
            });
        });
    }
    
    initializePageList() {
        const container = document.getElementById('page-list');
        if (!container) return;

        container.innerHTML = '';

        if (!this.currentData.pages || this.currentData.pages.length === 0) {
            this.currentData.pages = this.getDefaultPages();
        }

        const allPages = [...this.currentData.pages].sort((a, b) => (a.order || 0) - (b.order || 0));

        allPages.forEach((page) => {
            const pageItem = document.createElement('div');
            pageItem.className = 'page-item';
            pageItem.draggable = true;
            pageItem.dataset.pageId = page.id;

            const isChecked = page.enabled !== false;

            pageItem.innerHTML = `
                <div class="page-info">
                    <div class="checkbox-group">
                        <input type="checkbox" id="page-${page.id}" ${isChecked ? 'checked' : ''}>
                        <label for="page-${page.id}">${page.title || '未命名'}</label>
                    </div>
                    <span class="page-type">${this.getPageTypeName(page.type)}</span>
                </div>
                <div class="page-controls">
                    <button class="btn btn-secondary btn-sm edit-page" data-page-id="${page.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm delete-page" data-page-id="${page.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;

            // 拖拽事件
            pageItem.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', page.id);
                pageItem.classList.add('dragging');
            });

            pageItem.addEventListener('dragend', () => {
                pageItem.classList.remove('dragging');
            });

            pageItem.addEventListener('dragover', (e) => {
                e.preventDefault();
                pageItem.classList.add('drag-over');
            });

            pageItem.addEventListener('dragleave', () => {
                pageItem.classList.remove('drag-over');
            });

            pageItem.addEventListener('drop', (e) => {
                e.preventDefault();
                pageItem.classList.remove('drag-over');
                const sourceId = e.dataTransfer.getData('text/plain');
                this.reorderPages(sourceId, page.id);
            });

            // 复选框事件
            const checkbox = pageItem.querySelector('input[type="checkbox"]');
            checkbox.addEventListener('change', (e) => {
                this.togglePageEnabled(page.id, e.target.checked);
            });

            // 编辑按钮
            const editBtn = pageItem.querySelector('.edit-page');
            const manager = this;

            editBtn.addEventListener('click', function() {
                const pageId = this.getAttribute('data-page-id');
                if (manager.pageEditor) {
                    manager.pageEditor.open(pageId);
                } else {
                    console.error('pageEditor 未初始化！');
                    alert('页面编辑器未就绪，请刷新页面重试。');
                }
            });

            // 删除按钮
            const deleteBtn = pageItem.querySelector('.delete-page');
            deleteBtn.addEventListener('click', () => {
                if (confirm('确定要删除此页面吗？')) {
                    this.deletePage(page.id);
                }
            });

            container.appendChild(pageItem);
        });
    }
    
    getPageTypeName(type) {
        const names = {
            'welcome': '欢迎页',
            'scripture': '经文',
            'prayer': '祷告',
            'worship': '敬拜',
            'specialMusic': '特别献诗',
            'announcements': '家事报告',
            'offering': '奉献',
            'message': '证道',
            'communion': '圣餐',
            'testimony': '见证',
            'baptism': '洗礼',
            'newMembers': '迎新会友',
            'birthday': '生日祝福',
            'childrenBlessing': '儿童祝福',
            'lordsPrayer': '主祷文',
            'benediction': '祝福',
            'doxology': '三一颂',
            'closing': '散会',
            'special': '特别项目'
        };
        return names[type] || type;
    }
    
    initializeSongList() {
        const container = document.getElementById('songs-list');
        if (!container) return;
        
        const worshipPage = this.currentData.pages.find(p => p.type === 'worship');
        if (!worshipPage?.content?.songs) return;
        
        const songs = worshipPage.content.songs || [];
        container.innerHTML = '';
        
        songs.forEach((song, index) => {
            const songItem = document.createElement('div');
            songItem.className = 'song-item';
            
            songItem.innerHTML = `
                <div class="song-header">
                    <h4>${song.title || '未命名'}</h4>
                    <div class="song-meta">
                        <span>调性: ${song.key || 'C'}</span>
                        <span>速度: ${song.tempo || '中板'}</span>
                    </div>
                </div>
                <div class="song-lyrics">
                    <pre>${song.lyrics || '无歌词'}</pre>
                </div>
                <div class="song-controls">
                    <button class="btn btn-danger btn-sm delete-song" data-index="${index}">
                        <i class="fas fa-trash"></i> 删除
                    </button>
                </div>
            `;
            
            const deleteBtn = songItem.querySelector('.delete-song');
            deleteBtn.addEventListener('click', () => {
                if (confirm('确定要删除此歌曲吗？')) {
                    this.deleteSong(index);
                }
            });
            
            container.appendChild(songItem);
        });
    }
    
    initializeAnnouncementsList() {
        const container = document.getElementById('announcements-list');
        if (!container) return;
        
        const annPage = this.currentData.pages.find(p => p.type === 'announcements');
        if (!annPage?.content?.items) return;
        
        const items = annPage.content.items || [];
        container.innerHTML = '';
        
        items.forEach((item, index) => {
            const annItem = document.createElement('div');
            annItem.className = `announcement-item ${item.important ? 'important' : ''}`;
            
            annItem.innerHTML = `
                <div class="announcement-header">
                    <h4>${item.title || '未命名'}</h4>
                    ${item.important ? '<span class="important-badge">重要</span>' : ''}
                </div>
                <div class="announcement-content">
                    <p>${item.content || '无内容'}</p>
                </div>
                <div class="announcement-controls">
                    <button class="btn btn-danger btn-sm delete-announcement" data-index="${index}">
                        <i class="fas fa-trash"></i> 删除
                    </button>
                </div>
            `;
            
            const deleteBtn = annItem.querySelector('.delete-announcement');
            deleteBtn.addEventListener('click', () => {
                if (confirm('确定要删除此报告吗？')) {
                    this.deleteAnnouncement(index);
                }
            });
            
            container.appendChild(annItem);
        });
    }
    
    initializeSystemSettings() {
        if (!this.currentData.settings) return;
        
        const setValue = (id, value) => {
            const el = document.getElementById(id);
            if (el && value !== undefined) el.value = value;
        };
        
        const settings = this.currentData.settings;
        setValue('font-size', settings.fontSize || 'medium');
        setValue('transition-speed', settings.transitionSpeed || 'normal');
        setValue('auto-advance-time', settings.autoAdvanceTime || 30);
    }
    
    // =============== 事件绑定 ===============
    bindEvents() {
        document.getElementById('add-host-btn')?.addEventListener('click', () => this.addNewHost());
        document.getElementById('add-song-btn')?.addEventListener('click', () => this.addNewSong());
        document.getElementById('add-announcement-btn')?.addEventListener('click', () => this.addNewAnnouncement());
        document.getElementById('save-btn')?.addEventListener('click', () => this.saveConfig());
        document.getElementById('load-btn')?.addEventListener('click', () => this.loadConfig());
        document.getElementById('export-btn')?.addEventListener('click', () => this.exportConfig());
        document.getElementById('reset-btn')?.addEventListener('click', () => {
            if (confirm('确定要重置所有配置吗？')) this.resetConfig();
        });
        document.getElementById('refresh-preview')?.addEventListener('click', () => this.refreshPreview());
        document.getElementById('open-preview')?.addEventListener('click', () => this.openPreview());
        document.getElementById('reset-pages')?.addEventListener('click', () => this.resetPageOrder());
        document.getElementById('show-standard-flow')?.addEventListener('click', () => this.showStandardFlow());
        
        // 新增页面按钮
        document.querySelectorAll('[data-page-type]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const pageType = e.target.getAttribute('data-page-type');
                this.addNewPage(pageType);
            });
        });
        
        // 表单变化监听
        setTimeout(() => {
            document.querySelectorAll('input, select, textarea').forEach(input => {
                input.addEventListener('change', () => {
                    this.saveFormData();
                    this.markDirty();
                });
            });
        }, 500);
    }
    
    // =============== 页面管理 ===============
    reorderPages(sourceId, targetId) {
        if (!this.currentData.pages || sourceId === targetId) return;
        
        const pages = this.currentData.pages;
        const sourceIndex = pages.findIndex(p => p.id === sourceId);
        const targetIndex = pages.findIndex(p => p.id === targetId);
        
        if (sourceIndex === -1 || targetIndex === -1) return;
        
        const [movedPage] = pages.splice(sourceIndex, 1);
        pages.splice(targetIndex, 0, movedPage);
        
        pages.forEach((page, index) => {
            page.order = index + 1;
        });
        
        this.initializePageList();
        this.markDirty();
    }
    
    togglePageEnabled(pageId, enabled) {
        const page = this.currentData.pages?.find(p => p.id === pageId);
        if (page) {
            page.enabled = enabled;
            this.markDirty();
        }
    }
    
    deletePage(pageId) {
        if (!this.currentData.pages || this.currentData.pages.length <= 1) {
            alert('至少需要保留一个页面');
            return;
        }
        
        this.currentData.pages = this.currentData.pages.filter(p => p.id !== pageId);
        this.currentData.pages.forEach((page, index) => {
            page.order = index + 1;
        });
        
        this.initializePageList();
        this.markDirty();
        this.showSuccess('页面已删除');
    }
    
    addNewPage(pageType) {
        const pageTypes = {
            'welcome': { title: '欢迎页', backgroundColor: '#4a6fa5' },
            'worship': { title: '敬拜赞美', backgroundColor: '#5a9bd4' },
            'announcements': { title: '家事报告', backgroundColor: '#f8f9fa' },
            'scripture': { title: '经文分享', backgroundColor: '#e8f4fd' },
            'message': { title: '信息分享', backgroundColor: '#ffffff' },
            'special': { title: '特别项目', backgroundColor: '#f0f8ff' }
        };

        if (!pageTypes[pageType]) {
            console.error('未知的页面类型:', pageType);
            return;
        }

        const template = pageTypes[pageType];
        const newPage = {
            id: pageType + '_' + Date.now(),
            title: template.title,
            type: pageType,
            enabled: true,
            order: this.currentData.pages.length + 1,
            content: {},
            backgroundColor: template.backgroundColor,
            textColor: pageType === 'announcements' ? '#212529' : '#ffffff',
            fontSize: 'medium',
            align: pageType === 'announcements' || pageType === 'message' ? 'left' : 'center'
        };

        this.currentData.pages.push(newPage);
        this.initializePageList();
        this.markDirty();
        this.showSuccess(`已添加${template.title}`);
    }
    
    showStandardFlow() {
        alert('标准聚会流程：\n1. 欢迎\n2. 宣召\n3. 祷告\n4. 敬拜\n5. 读经\n6. 献诗\n7. 牧祷\n8. 报告\n9. 奉献\n10. 诗歌\n11. 经文\n12. 证道\n13. 圣餐\n14. 见证\n15. 洗礼\n16. 迎新\n17. 生日\n18. 儿童\n19. 主祷文\n20. 回应诗\n21. 祝福\n22. 三一颂\n23. 散会');
    }
    
    // =============== 主持人管理 ===============
    selectHost(hostId) {
        this.currentData.meetingInfo.host.selectedId = hostId;
        this.initializeHostOptions();
        this.markDirty();
    }
    
    addNewHost() {
        const name = document.getElementById('new-host-name')?.value.trim();
        if (!name) {
            alert('请输入主持人姓名');
            return;
        }
        
        const newHost = {
            id: 'host_' + Date.now(),
            name: name,
            role: document.getElementById('new-host-role')?.value.trim() || '主持人'
        };
        
        this.currentData.meetingInfo.host.options.push(newHost);
        document.getElementById('new-host-name').value = '';
        document.getElementById('new-host-role').value = '';
        
        this.initializeHostOptions();
        this.markDirty();
    }
    
    // =============== 歌曲管理 ===============
    addNewSong() {
        const title = document.getElementById('song-title')?.value.trim();
        if (!title) {
            alert('请输入歌曲名称');
            return;
        }
        
        const newSong = {
            id: 'song_' + Date.now(),
            title: title,
            key: document.getElementById('song-key')?.value || 'C',
            tempo: document.getElementById('song-tempo')?.value || '中板',
            lyrics: document.getElementById('song-lyrics')?.value || ''
        };
        
        let worshipPage = this.currentData.pages.find(p => p.type === 'worship');
        if (!worshipPage) {
            worshipPage = {
                id: 'worship',
                title: '敬拜赞美',
                type: 'worship',
                enabled: true,
                order: 2,
                content: { songs: [] }
            };
            this.currentData.pages.push(worshipPage);
        }
        
        if (!worshipPage.content.songs) {
            worshipPage.content.songs = [];
        }
        
        worshipPage.content.songs.push(newSong);
        
        ['song-title', 'song-key', 'song-tempo', 'song-lyrics'].forEach(id => {
            const input = document.getElementById(id);
            if (input) input.value = '';
        });
        
        this.initializeSongList();
        this.markDirty();
    }
    
    deleteSong(index) {
        const worshipPage = this.currentData.pages.find(p => p.type === 'worship');
        if (!worshipPage?.content?.songs) return;
        
        worshipPage.content.songs.splice(index, 1);
        this.initializeSongList();
        this.markDirty();
    }
    
    // =============== 报告管理 ===============
    addNewAnnouncement() {
        const title = document.getElementById('announcement-title')?.value.trim();
        if (!title) {
            alert('请输入报告标题');
            return;
        }
        
        const newAnnouncement = {
            id: 'ann_' + Date.now(),
            title: title,
            content: document.getElementById('announcement-content')?.value || '',
            important: document.getElementById('announcement-important')?.checked || false
        };
        
        let annPage = this.currentData.pages.find(p => p.type === 'announcements');
        if (!annPage) {
            annPage = {
                id: 'announcements',
                title: '家事报告',
                type: 'announcements',
                enabled: true,
                order: 3,
                content: { items: [] }
            };
            this.currentData.pages.push(annPage);
        }
        
        if (!annPage.content.items) {
            annPage.content.items = [];
        }
        
        annPage.content.items.push(newAnnouncement);
        
        document.getElementById('announcement-title').value = '';
        document.getElementById('announcement-content').value = '';
        document.getElementById('announcement-important').checked = false;
        
        this.initializeAnnouncementsList();
        this.markDirty();
    }
    
    deleteAnnouncement(index) {
        const annPage = this.currentData.pages.find(p => p.type === 'announcements');
        if (!annPage?.content?.items) return;
        
        annPage.content.items.splice(index, 1);
        this.initializeAnnouncementsList();
        this.markDirty();
    }
    
    // =============== 表单保存 ===============
    saveFormData() {
        if (!this.currentData) return;
        
        // 基本信息
        const data = this.currentData.meetingInfo;
        data.date = document.getElementById('meeting-date')?.value || '';
        data.title = document.getElementById('meeting-title')?.value || '';
        data.theme = document.getElementById('meeting-theme')?.value || '';
        data.time = document.getElementById('meeting-time')?.value || '09:30';
        data.location = document.getElementById('meeting-location')?.value || '';
        
        // 系统设置
        const settings = this.currentData.settings;
        settings.fontSize = document.getElementById('font-size')?.value || 'medium';
        settings.transitionSpeed = document.getElementById('transition-speed')?.value || 'normal';
        settings.autoAdvanceTime = parseInt(document.getElementById('auto-advance-time')?.value) || 30;
        
        this.currentData.lastUpdated = new Date().toISOString();
    }
    
    // =============== 状态和提示 ===============
    markDirty() {
        this.isDirty = true;
        this.updateStatus();
    }
    
    updateStatus() {
        const statusText = document.getElementById('status-text');
        const lastSaved = document.getElementById('last-saved');
        if (statusText) {
            statusText.textContent = this.isDirty ? '🟡 未保存更改' : '🟢 已保存';
        }
        if (lastSaved && this.currentData?.lastUpdated) {
            const date = new Date(this.currentData.lastUpdated);
            lastSaved.textContent = `最后保存：${date.toLocaleString()}`;
        }
    }
    
    showSuccess(message) {
        const alert = document.getElementById('success-alert');
        if (alert) {
            alert.querySelector('i + span').textContent = message;
            alert.style.display = 'block';
            setTimeout(() => {
                alert.style.display = 'none';
            }, 3000);
        } else {
            alert(message);
        }
    }
    
    // =============== 预览功能 ===============
    refreshPreview() {
        const container = document.getElementById('preview-area');
        if (!container) return;
        
        container.innerHTML = '';
        
        const pages = (this.currentData?.pages || [])
            .filter(p => p.enabled !== false)
            .sort((a, b) => (a.order || 0) - (b.order || 0));
        
        if (pages.length === 0) {
            container.innerHTML = `
                <div class="preview-placeholder">
                    <h3>暂无可预览页面</h3>
                    <p>请在"页面管理"启用或新增页面</p>
                </div>`;
            return;
        }
        
        const grid = document.createElement('div');
        grid.className = 'preview-pages';
        
        pages.forEach((p, idx) => {
            const card = document.createElement('div');
            card.className = 'preview-page';
            card.innerHTML = `
                <div class="preview-page-header">
                    <span class="page-number">${idx + 1}</span>
                    <strong>${p.title || '未命名'}</strong>
                    <span class="page-type">${this.getPageTypeName(p.type)}</span>
                </div>
                <div class="preview-page-body" style="
                    background:${p.backgroundColor || '#fff'};
                    color:${p.textColor || '#000'};
                    padding:10px;border-radius:6px;">
                    ${this.renderPreviewContent(p)}
                </div>`;
            grid.appendChild(card);
        });
        
        container.appendChild(grid);
    }
    
    renderPreviewContent(page) {
        const c = page.content || {};
        switch (page.type) {
            case 'welcome':
                return `<div>
                    <div style="font-size:1.6em">${c.text || '欢迎参加今日主日崇拜'}</div>
                    <div style="opacity:0.8">${c.subtext || ''}</div>
                </div>`;
            case 'worship':
                return (c.songs || []).length
                    ? c.songs.map(s => `<div>
                        <strong>${s.title || '未命名歌曲'}</strong>
                        <div style="opacity:0.8;white-space:pre-wrap">${s.lyrics || ''}</div>
                    </div>`).join('')
                    : '<div>暂无歌曲</div>';
            case 'announcements':
                return (c.items || []).length
                    ? c.items.map(it => `<div style="margin:10px 0;padding:10px;background:${it.important ? '#fff3cd' : '#f8f9fa'};border-radius:5px">
                        <strong>${it.title || '未命名报告'}</strong>
                        <div>${it.content || ''}</div>
                    </div>`).join('')
                    : '<div>暂无家事报告</div>';
            default:
                return `<div>${page.title} - ${page.type}</div>`;
        }
    }
    
    openPreview() {
        const win = window.open('', '_blank');
        if (!win) {
            alert('无法打开新窗口');
            return;
        }
        
        win.document.write(`
            <html><head><title>预览</title></head>
            <body style="padding:20px;font-family:Arial">
                <h3>当前配置预览</h3>
                <div id="preview"></div>
            </body></html>`);
        win.document.close();
        
        const pages = (this.currentData?.pages || [])
            .filter(p => p.enabled !== false)
            .sort((a, b) => (a.order || 0) - (b.order || 0));
        
        const container = win.document.getElementById('preview');
        pages.forEach((p, idx) => {
            const div = win.document.createElement('div');
            div.style.cssText = `
                margin:10px 0;padding:15px;border:1px solid #ddd;border-radius:8px;
                background:${p.backgroundColor || '#fff'};color:${p.textColor || '#000'};
            `;
            div.innerHTML = `<strong>${idx+1}. ${p.title}</strong> (${this.getPageTypeName(p.type)})`;
            container.appendChild(div);
        });
    }
    
    resetPageOrder() {
        if (!this.currentData?.pages?.length) return;
        
        this.currentData.pages
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .forEach((p, i) => p.order = i + 1);
        
        this.initializePageList();
        this.markDirty();
        this.showSuccess('页面顺序已恢复默认');
    }
    
    // =============== 存储功能 ===============
    async saveConfig() {
        try {
            this.saveFormData();
            this.currentData.lastUpdated = new Date().toISOString();
            
            localStorage.setItem('churchMeetingConfig', JSON.stringify(this.currentData));
            
            this.showSuccess('配置保存成功！');
            this.isDirty = false;
            this.updateStatus();
            
        } catch (error) {
            console.error('保存失败:', error);
            alert('保存失败：' + error.message);
        }
    }
    
    async loadConfig() {
        try {
            await this.loadData();
            this.initializeUI();
            this.showSuccess('配置加载成功！');
            this.isDirty = false;
            this.updateStatus();
        } catch (error) {
            alert('加载失败：' + error.message);
        }
    }
    
    exportConfig() {
        try {
            this.saveFormData();
            const dataStr = JSON.stringify(this.currentData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const downloadUrl = URL.createObjectURL(dataBlob);
            
            const downloadLink = document.createElement('a');
            downloadLink.href = downloadUrl;
            downloadLink.download = `教会配置-${new Date().toISOString().split('T')[0]}.json`;
            
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(downloadUrl);
            
            this.showSuccess('配置导出成功！');
        } catch (error) {
            alert('导出失败：' + error.message);
        }
    }
    
    resetConfig() {
        this.currentData = this.getDefaultData();
        this.initializeUI();
        this.markDirty();
        this.saveConfig();
    }
}