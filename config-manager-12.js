/**
 * 配置管理器
 * 负责配置界面的所有交互逻辑
 */

class ConfigManager {
    constructor() {
        this.currentData = null;
        this.currentSection = 'basic';
        this.isDirty = false;
        this.initialized = false;
    }
    
    async initialize() {
        console.log('初始化配置管理器...');
        
        try {
            // 加载现有数据
            await this.loadData();
            
            // 初始化UI
            this.initializeUI();
            
            // 绑定事件
            this.bindEvents();
            
            // 初始化背景设置
            this.initializeBackgroundSettings();
            
            // 更新状态
            this.updateStatus();
            
            this.initialized = true;
            console.log('配置管理器初始化完成');
            
        } catch (error) {
            console.error('初始化失败:', error);
            this.showError('配置管理器初始化失败：' + error.message);
        }
    }
    
    async loadData() {
        try {
            // 首先尝试从 localStorage 加载
            const savedConfig = localStorage.getItem('churchMeetingConfig');
            
            if (savedConfig) {
                this.currentData = JSON.parse(savedConfig);
                console.log('从本地存储加载配置');
            } else {
                // 如果本地没有，从文件加载
                const response = await fetch('content.json');
                if (!response.ok) {
                    throw new Error(`HTTP错误: ${response.status}`);
                }
                this.currentData = await response.json();
                console.log('从文件加载配置');
            }
            
            // 确保数据结构完整
            this.ensureDataStructure();
            
        } catch (error) {
            console.error('加载数据失败，使用默认数据:', error);
            this.currentData = this.getDefaultData();
        }
    }
    
    ensureDataStructure() {
        // 确保有settings对象
        if (!this.currentData.settings) {
            this.currentData.settings = {};
        }
        
        // 确保有background设置
        if (!this.currentData.settings.background) {
            this.currentData.settings.background = {
                type: 'gradient',
                theme: 'blue'
            };
        }
        
        // 确保有meetingInfo对象
        if (!this.currentData.meetingInfo) {
            this.currentData.meetingInfo = {};
        }
        
        // 确保有pages数组
        if (!this.currentData.pages) {
            this.currentData.pages = this.getDefaultPages();
        }
    }
    
    getDefaultData() {
        return {
            version: "1.0",
            lastUpdated: new Date().toISOString(),
            meetingInfo: {
                date: new Date().toISOString().split('T')[0],
                title: "主日崇拜",
                theme: "",
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
                background: {
                    type: "gradient",
                    theme: "blue"
                },
                fontSize: "medium",
                transitionSpeed: "normal",
                autoAdvance: false,
                autoAdvanceTime: 30,
                showPageNumbers: true,
                showTimer: false,
                showHostInfo: true,
                enableKeyboard: true,
                enableVoice: false
            }
        };
    }
    
    getDefaultPages() {
        return [
            {
                id: 'welcome',
                title: '欢迎页',
                type: 'welcome',
                enabled: true,
                order: 1,
                content: {
                    text: '欢迎参加今日主日崇拜',
                    subtext: '在主爱中合一，在圣灵里敬拜',
                    showTime: true,
                    showDate: true
                }
            },
            {
                id: 'worship',
                title: '敬拜赞美',
                type: 'worship',
                enabled: true,
                order: 2,
                content: {
                    songs: [],
                    currentSongIndex: 0,
                    showLyrics: true
                }
            },
            {
                id: 'scripture',
                title: '经文分享',
                type: 'scripture',
                enabled: true,
                order: 3,
                content: {
                    reference: '约翰福音 3:16',
                    text: '神爱世人，甚至将他的独生子赐给他们，叫一切信他的，不至灭亡，反得永生。',
                    version: '和合本',
                    showReference: true,
                    showVersion: true
                }
            },
            {
                id: 'message',
                title: '信息分享',
                type: 'message',
                enabled: true,
                order: 4,
                content: {
                    title: '在基督里的新生命',
                    speaker: '讲员',
                    outline: [
                        { id: 'point1', title: '一、引言', content: '信息内容' }
                    ],
                    currentPointIndex: 0
                }
            },
            {
                id: 'announcements',
                title: '家事报告',
                type: 'announcements',
                enabled: true,
                order: 5,
                content: {
                    items: [],
                    style: 'list'
                }
            },
            {
                id: 'offering',
                title: '奉献',
                type: 'offering',
                enabled: true,
                order: 6,
                content: {
                    text: '各人要随本心所酌定的，不要作难，不要勉强',
                    scripture: '哥林多后书 9:7'
                }
            },
            {
                id: 'closing',
                title: '结束祝福',
                type: 'closing',
                enabled: true,
                order: 7,
                content: {
                    blessing: '愿主耶稣基督的恩惠，神的慈爱，圣灵的感动，常与你们众人同在！',
                    scripture: '哥林多后书 13:14'
                }
            }
        ];
    }
    
    initializeUI() {
        // 初始化基本信息
        this.initializeBasicInfo();
        
        // 初始化主持人选项
        this.initializeHostOptions();
        
        // 初始化页面列表
        this.initializePageList();
        
        // 初始化歌曲列表
        this.initializeSongList();
        
        // 初始化报告列表
        this.initializeAnnouncementsList();
        
        // 初始化系统设置
        this.initializeSystemSettings();
        
        // 更新导航状态
        this.updateNavigation();
    }
    
    initializeBasicInfo() {
        if (!this.currentData.meetingInfo) return;
        
        const data = this.currentData.meetingInfo;
        
        // 安全设置值，避免undefined错误
        document.getElementById('meeting-date').value = data.date || '';
        document.getElementById('meeting-title').value = data.title || '';
        document.getElementById('meeting-theme').value = data.theme || '';
        document.getElementById('meeting-time').value = data.time || '09:30';
        document.getElementById('meeting-location').value = data.location || '';
    }
    
    initializeSystemSettings() {
        if (!this.currentData.settings) return;
        
        const settings = this.currentData.settings;
        
        // 设置值，避免undefined错误
        if (document.getElementById('font-size')) {
            document.getElementById('font-size').value = settings.fontSize || 'medium';
        }
        
        if (document.getElementById('transition-speed')) {
            document.getElementById('transition-speed').value = settings.transitionSpeed || 'normal';
        }
        
        if (document.getElementById('auto-advance-time')) {
            document.getElementById('auto-advance-time').value = settings.autoAdvanceTime || 30;
        }
        
        if (document.getElementById('page-margin')) {
            document.getElementById('page-margin').value = settings.pageMargin || 'medium';
        }
        
        // 设置复选框
        const checkboxes = ['auto-advance', 'show-page-numbers', 'show-timer', 'show-host-info', 'enable-keyboard', 'enable-voice'];
        checkboxes.forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                checkbox.checked = settings[id] || false;
            }
        });
        
        // 特别设置show-page-numbers，默认true
        const pageNumbersCheckbox = document.getElementById('show-page-numbers');
        if (pageNumbersCheckbox) {
            pageNumbersCheckbox.checked = settings.showPageNumbers !== undefined ? settings.showPageNumbers : true;
        }
    }
    
    initializeHostOptions() {
        const container = document.getElementById('host-options');
        if (!container) return;
        
        const hostConfig = this.currentData.meetingInfo.host;
        if (!hostConfig) return;
        
        container.innerHTML = '';
        
        // 生成现有主持人选项
        if (hostConfig.options && hostConfig.options.length > 0) {
            hostConfig.options.forEach(host => {
                const option = document.createElement('div');
                option.className = `host-option ${host.id === hostConfig.selectedId ? 'selected' : ''}`;
                option.dataset.hostId = host.id;
                
                option.innerHTML = `
                    <div class="host-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <h4>${host.name}</h4>
                    ${host.role ? `<p>${host.role}</p>` : ''}
                    <div class="host-controls">
                        <button class="btn btn-danger btn-sm delete-host" data-host-id="${host.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
                
                option.addEventListener('click', (e) => {
                    if (!e.target.closest('.delete-host')) {
                        this.selectHost(host.id);
                    }
                });
                
                container.appendChild(option);
            });
        }
        
        // 添加默认主持人选项（如果没有的话）
        if (!hostConfig.options || hostConfig.options.length === 0) {
            const defaultHosts = [
                { id: 'host1', name: '王弟兄', role: '长老' },
                { id: 'host2', name: '李姊妹', role: '执事' },
                { id: 'host3', name: '张牧师', role: '牧师' },
                { id: 'host4', name: '陈长老', role: '长老' },
                { id: 'host5', name: '刘弟兄', role: '同工' },
                { id: 'host6', name: '杨姊妹', role: '同工' }
            ];
            
            this.currentData.meetingInfo.host.options = defaultHosts;
            this.initializeHostOptions(); // 重新生成
        }
    }
    
 initializePageList() {
    const container = document.getElementById('page-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    // 确保有pages数组（修复：如果没有就创建默认页面）
    if (!this.currentData.pages || this.currentData.pages.length === 0) {
        console.log('没有页面数据，创建默认页面');
        this.currentData.pages = this.getDefaultPages();
        this.markDirty();
    }
    
    // 按order排序
    const sortedPages = [...this.currentData.pages].sort((a, b) => (a.order || 0) - (b.order || 0));
    
    if (sortedPages.length === 0) {
        container.innerHTML = '<p class="no-items">暂无页面，请添加页面</p>';
        return;
    }
    
    sortedPages.forEach((page, index) => {
        const pageItem = document.createElement('div');
        pageItem.className = 'page-item';
        pageItem.draggable = true;
        pageItem.dataset.pageId = page.id;
        
        // 确保有必要的属性
        if (!page.title) page.title = '未命名页面';
        if (typeof page.enabled === 'undefined') page.enabled = true;
        if (!page.order) page.order = index + 1;
        
        pageItem.innerHTML = `
            <div class="page-info">
                <div class="checkbox-group">
                    <input type="checkbox" id="page-${page.id}" ${page.enabled ? 'checked' : ''}>
                    <label for="page-${page.id}">${page.title}</label>
                </div>
                <span class="page-type">${this.getPageTypeName(page.type || 'generic')}</span>
            </div>
            <div class="page-controls">
                <button class="btn btn-secondary btn-sm edit-page" data-page-id="${page.id}" title="编辑">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm delete-page" data-page-id="${page.id}" title="删除">
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
            if (!pageItem.classList.contains('dragover')) {
                pageItem.classList.add('dragover');
            }
        });
        
        pageItem.addEventListener('dragleave', () => {
            pageItem.classList.remove('dragover');
        });
        
        pageItem.addEventListener('drop', (e) => {
            e.preventDefault();
            pageItem.classList.remove('dragover');
            const sourceId = e.dataTransfer.getData('text/plain');
            if (sourceId !== page.id) {
                this.reorderPages(sourceId, page.id);
            }
        });
        
        // 复选框事件
        const checkbox = pageItem.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', (e) => {
            this.togglePageEnabled(page.id, e.target.checked);
        });
        
        // 编辑按钮事件
        const editBtn = pageItem.querySelector('.edit-page');
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.editPage(page.id);
        });
        
        // 删除按钮事件
        const deleteBtn = pageItem.querySelector('.delete-page');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm(`确定要删除页面 "${page.title}" 吗？`)) {
                this.deletePage(page.id);
            }
        });
        
        // 点击页面项也可以启用/禁用
        pageItem.addEventListener('click', (e) => {
            if (!e.target.closest('.page-controls') && !e.target.closest('input[type="checkbox"]')) {
                checkbox.checked = !checkbox.checked;
                this.togglePageEnabled(page.id, checkbox.checked);
            }
        });
        
        container.appendChild(pageItem);
    });
}
    
    // ============ 背景设置功能 ============
    
    initializeBackgroundSettings() {
        try {
            // 确保有background设置
            if (!this.currentData.settings.background) {
                this.currentData.settings.background = {
                    type: 'gradient',
                    theme: 'blue'
                };
            }
            
            const background = this.currentData.settings.background;
            
            // 设置背景类型和主题
            const typeSelect = document.getElementById('background-type');
            const themeSelect = document.getElementById('theme-color');
            
            if (typeSelect && themeSelect) {
                typeSelect.value = background.type || 'gradient';
                themeSelect.value = background.theme || 'blue';
                
                // 监听变化
                typeSelect.addEventListener('change', () => {
                    this.updateBackgroundOptions(typeSelect.value);
                    this.updateBackgroundPreview();
                    this.markDirty();
                });
                
                themeSelect.addEventListener('change', () => {
                    this.updateBackgroundPreview();
                    this.markDirty();
                });
                
                // 初始化背景选项
                this.updateBackgroundOptions(background.type || 'gradient');
                this.updateBackgroundPreview();
            }
        } catch (error) {
            console.error('初始化背景设置失败:', error);
        }
    }
    
    updateBackgroundOptions(type) {
        const container = document.getElementById('background-options');
        if (!container) return;
        
        container.innerHTML = '';
        
        const background = this.currentData.settings.background || {};
        
        switch(type) {
            case 'gradient':
                container.innerHTML = `
                    <div class="form-row">
                        <div class="form-group">
                            <label>渐变方向</label>
                            <select class="form-control" id="gradient-direction">
                                <option value="135deg" ${background.direction === '135deg' ? 'selected' : ''}>右下到左上</option>
                                <option value="90deg" ${background.direction === '90deg' ? 'selected' : ''}>左到右</option>
                                <option value="45deg" ${background.direction === '45deg' ? 'selected' : ''}>左下到右上</option>
                                <option value="180deg" ${background.direction === '180deg' ? 'selected' : ''}>上到下</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>渐变强度</label>
                            <select class="form-control" id="gradient-intensity">
                                <option value="normal" ${background.intensity === 'normal' ? 'selected' : ''}>正常</option>
                                <option value="strong" ${background.intensity === 'strong' ? 'selected' : ''}>强烈</option>
                                <option value="soft" ${background.intensity === 'soft' ? 'selected' : ''}>柔和</option>
                            </select>
                        </div>
                    </div>
                `;
                break;
                
            case 'solid':
                container.innerHTML = `
                    <div class="form-group">
                        <label>背景颜色</label>
                        <input type="color" class="form-control" id="solid-color" value="${background.color || '#2c3e50'}">
                    </div>
                `;
                break;
                
            case 'image':
                container.innerHTML = `
                    <div class="form-group">
                        <label>背景图片URL</label>
                        <input type="text" class="form-control" id="image-url" placeholder="输入图片地址" value="${background.imageUrl || ''}">
                    </div>
                    <div class="form-group">
                        <label>图片透明度</label>
                        <input type="range" id="image-opacity" min="0.1" max="1" step="0.1" value="${background.opacity || 0.8}">
                        <span class="range-value">${Math.round((background.opacity || 0.8) * 100)}%</span>
                    </div>
                `;
                break;
                
            case 'pattern':
                container.innerHTML = `
                    <div class="form-group">
                        <label>图案类型</label>
                        <select class="form-control" id="pattern-type">
                            <option value="cross" ${background.patternType === 'cross' ? 'selected' : ''}>十字架图案</option>
                            <option value="dove" ${background.patternType === 'dove' ? 'selected' : ''}>鸽子图案</option>
                            <option value="fish" ${background.patternType === 'fish' ? 'selected' : ''}>鱼形图案</option>
                            <option value="geometric" ${background.patternType === 'geometric' ? 'selected' : ''}>几何图案</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>图案颜色</label>
                        <input type="color" class="form-control" id="pattern-color" value="${background.patternColor || '#3498db'}">
                    </div>
                `;
                break;
        }
        
        // 为动态生成的元素添加事件监听
        this.bindBackgroundEvents();
    }
    
    bindBackgroundEvents() {
        // 监听所有背景相关的输入变化
        setTimeout(() => {
            const inputs = document.querySelectorAll('#background-options select, #background-options input');
            inputs.forEach(input => {
                input.addEventListener('change', () => {
                    this.updateBackgroundPreview();
                    this.markDirty();
                });
                
                // 为滑块显示数值
                if (input.type === 'range') {
                    const valueSpan = input.parentElement.querySelector('.range-value');
                    if (valueSpan) {
                        input.addEventListener('input', (e) => {
                            valueSpan.textContent = Math.round(e.target.value * 100) + '%';
                        });
                    }
                }
            });
        }, 100);
    }
    
    updateBackgroundPreview() {
        const preview = document.getElementById('background-preview');
        if (!preview) return;
        
        const type = document.getElementById('background-type').value;
        const theme = document.getElementById('theme-color').value;
        
        let backgroundStyle = '';
        
        switch(type) {
            case 'gradient':
                const direction = document.getElementById('gradient-direction')?.value || '135deg';
                backgroundStyle = this.getGradientBackground(theme, direction);
                break;
                
            case 'solid':
                const color = document.getElementById('solid-color')?.value || '#2c3e50';
                backgroundStyle = `background: ${color}`;
                break;
                
            case 'image':
                const url = document.getElementById('image-url')?.value || '';
                const opacity = document.getElementById('image-opacity')?.value || 0.8;
                if (url) {
                    backgroundStyle = `background-image: url('${url}'); background-size: cover; background-position: center; opacity: ${opacity}`;
                } else {
                    backgroundStyle = `background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)`;
                }
                break;
                
            case 'pattern':
                const patternType = document.getElementById('pattern-type')?.value || 'cross';
                const patternColor = document.getElementById('pattern-color')?.value || '#3498db';
                backgroundStyle = this.getPatternBackground(patternType, patternColor);
                break;
        }
        
        preview.style.cssText = backgroundStyle;
    }
    
    getGradientBackground(theme, direction = '135deg') {
        const gradients = {
            blue: ['#667eea', '#764ba2'],
            purple: ['#8e2de2', '#4a00e0'],
            red: ['#f093fb', '#f5576c'],
            green: ['#43e97b', '#38f9d7'],
            gold: ['#fa709a', '#fee140'],
            light: ['#a1c4fd', '#c2e9fb'],
            dark: ['#2c3e50', '#4ca1af']
        };
        
        const colors = gradients[theme] || gradients.blue;
        return `background: linear-gradient(${direction}, ${colors[0]} 0%, ${colors[1]} 100%)`;
    }
    
    getPatternBackground(type, color) {
        const patterns = {
            cross: `repeating-linear-gradient(45deg, ${color} 0, ${color} 2px, transparent 2px, transparent 10px)`,
            dove: `radial-gradient(circle at 10px 10px, ${color} 2px, transparent 2px), radial-gradient(circle at 30px 30px, ${color} 2px, transparent 2px)`,
            fish: `linear-gradient(45deg, ${color} 25%, transparent 25%), linear-gradient(-45deg, ${color} 25%, transparent 25%)`,
            geometric: `linear-gradient(90deg, ${color} 50%, transparent 50%), linear-gradient(90deg, ${color} 50%, transparent 50%)`
        };
        
        return `background: ${patterns[type] || patterns.cross}; background-size: 20px 20px;`;
    }
    
    // ============ 事件绑定 ============
    
    bindEvents() {
        // 添加主持人按钮
        const addHostBtn = document.getElementById('add-host-btn');
        if (addHostBtn) {
            addHostBtn.addEventListener('click', () => {
                this.addNewHost();
            });
        }
        
        // 删除主持人事件委托
        const hostOptions = document.getElementById('host-options');
        if (hostOptions) {
            hostOptions.addEventListener('click', (e) => {
                if (e.target.closest('.delete-host')) {
                    const hostId = e.target.closest('.delete-host').dataset.hostId;
                    this.deleteHost(hostId);
                }
            });
        }
        
        // 添加歌曲按钮
        const addSongBtn = document.getElementById('add-song-btn');
        if (addSongBtn) {
            addSongBtn.addEventListener('click', () => {
                this.addNewSong();
            });
        }
        
        // 添加报告按钮
        const addAnnouncementBtn = document.getElementById('add-announcement-btn');
        if (addAnnouncementBtn) {
            addAnnouncementBtn.addEventListener('click', () => {
                this.addNewAnnouncement();
            });
        }
        
        // 保存按钮
        const saveBtn = document.getElementById('save-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveConfig();
            });
        }
        
        // 加载按钮
        const loadBtn = document.getElementById('load-btn');
        if (loadBtn) {
            loadBtn.addEventListener('click', () => {
                this.loadConfig();
            });
        }
        
        // 导出按钮
        const exportBtn = document.getElementById('export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportConfig();
            });
        }
        
        // 重置按钮
        const resetBtn = document.getElementById('reset-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('⚠️ 警告：这将重置所有配置，恢复为初始状态！\n\n确定要重置吗？')) {
                    this.resetConfig();
                }
            });
        }
        
        // 刷新预览按钮
        const refreshPreviewBtn = document.getElementById('refresh-preview');
        if (refreshPreviewBtn) {
            refreshPreviewBtn.addEventListener('click', () => {
                this.refreshPreview();
            });
        }
        
        // 打开预览按钮
        const openPreviewBtn = document.getElementById('open-preview');
        if (openPreviewBtn) {
            openPreviewBtn.addEventListener('click', () => {
                this.openPreview();
            });
        }
        
        // 恢复页面顺序按钮
        const resetPagesBtn = document.getElementById('reset-pages');
        if (resetPagesBtn) {
            resetPagesBtn.addEventListener('click', () => {
                this.resetPageOrder();
            });
        }
        
        // 应用到主页面按钮
        const applyBtn = document.getElementById('apply-btn');
        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                this.applyToMainPage();
            });
        }
        
        // 重新加载按钮
        const reloadBtn = document.getElementById('load-btn');
        if (reloadBtn) {
            reloadBtn.addEventListener('click', () => {
                if (this.isDirty) {
                    if (confirm('您有未保存的更改，确定要重新加载吗？')) {
                        this.loadConfig();
                    }
                } else {
                    this.loadConfig();
                }
            });
        }
        
        // 表单输入变化监听
        setTimeout(() => {
            document.querySelectorAll('.form-control, input[type="checkbox"], input[type="date"], input[type="time"], select').forEach(input => {
                input.addEventListener('input', () => {
                    this.markDirty();
                    this.saveFormData();
                });
                
                input.addEventListener('change', () => {
                    this.markDirty();
                    this.saveFormData();
                });
            });
        }, 500);
        
        // 监听页面关闭
        window.addEventListener('beforeunload', (e) => {
            if (this.isDirty) {
                e.preventDefault();
                e.returnValue = '您有未保存的更改，确定要离开吗？';
            }
        });
    }
    
    // ============ 表单数据处理 ============
    
    saveFormData() {
        if (!this.currentData) return;
        
        // 保存基本信息
        this.currentData.meetingInfo.date = document.getElementById('meeting-date')?.value || '';
        this.currentData.meetingInfo.title = document.getElementById('meeting-title')?.value || '';
        this.currentData.meetingInfo.theme = document.getElementById('meeting-theme')?.value || '';
        this.currentData.meetingInfo.time = document.getElementById('meeting-time')?.value || '09:30';
        this.currentData.meetingInfo.location = document.getElementById('meeting-location')?.value || '';
        
        // 保存系统设置
        this.currentData.settings.fontSize = document.getElementById('font-size')?.value || 'medium';
        this.currentData.settings.transitionSpeed = document.getElementById('transition-speed')?.value || 'normal';
        this.currentData.settings.autoAdvanceTime = parseInt(document.getElementById('auto-advance-time')?.value) || 30;
        this.currentData.settings.pageMargin = document.getElementById('page-margin')?.value || 'medium';
        
        // 保存复选框设置
        const checkboxes = ['auto-advance', 'show-page-numbers', 'show-timer', 'show-host-info', 'enable-keyboard', 'enable-voice'];
        checkboxes.forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                this.currentData.settings[id] = checkbox.checked;
            }
        });
        
        // 保存背景设置
        const backgroundType = document.getElementById('background-type')?.value;
        if (backgroundType) {
            if (!this.currentData.settings.background) {
                this.currentData.settings.background = {};
            }
            
            this.currentData.settings.background.type = backgroundType;
            this.currentData.settings.background.theme = document.getElementById('theme-color')?.value || 'blue';
            
            // 根据类型保存其他设置
            switch(backgroundType) {
                case 'gradient':
                    this.currentData.settings.background.direction = document.getElementById('gradient-direction')?.value;
                    this.currentData.settings.background.intensity = document.getElementById('gradient-intensity')?.value;
                    break;
                case 'solid':
                    this.currentData.settings.background.color = document.getElementById('solid-color')?.value;
                    break;
                case 'image':
                    this.currentData.settings.background.imageUrl = document.getElementById('image-url')?.value;
                    this.currentData.settings.background.opacity = document.getElementById('image-opacity')?.value;
                    break;
                case 'pattern':
                    this.currentData.settings.background.patternType = document.getElementById('pattern-type')?.value;
                    this.currentData.settings.background.patternColor = document.getElementById('pattern-color')?.value;
                    break;
            }
        }
        
        this.updateLastSaved();
    }
    
    // ============ 业务逻辑方法 ============
    
    selectHost(hostId) {
        if (!this.currentData.meetingInfo.host) {
            this.currentData.meetingInfo.host = { options: [] };
        }
        
        this.currentData.meetingInfo.host.selectedId = hostId;
        this.initializeHostOptions();
        this.markDirty();
    }
    
    addNewHost() {
        const name = document.getElementById('new-host-name')?.value.trim();
        const role = document.getElementById('new-host-role')?.value.trim();
        
        if (!name) {
            alert('请输入主持人姓名');
            return;
        }
        
        if (!this.currentData.meetingInfo.host) {
            this.currentData.meetingInfo.host = { options: [] };
        }
        
        if (!this.currentData.meetingInfo.host.options) {
            this.currentData.meetingInfo.host.options = [];
        }
        
        const newHost = {
            id: 'host' + Date.now(),
            name: name,
            role: role || '主持人'
        };
        
        this.currentData.meetingInfo.host.options.push(newHost);
        
        // 清空输入框
        if (document.getElementById('new-host-name')) {
            document.getElementById('new-host-name').value = '';
        }
        if (document.getElementById('new-host-role')) {
            document.getElementById('new-host-role').value = '';
        }
        
        this.initializeHostOptions();
        this.markDirty();
    }
    
    deleteHost(hostId) {
        if (!this.currentData.meetingInfo.host || !this.currentData.meetingInfo.host.options) return;
        
        this.currentData.meetingInfo.host.options = 
            this.currentData.meetingInfo.host.options.filter(host => host.id !== hostId);
        
        // 如果删除的是当前选中的主持人，清空选择
        if (this.currentData.meetingInfo.host.selectedId === hostId) {
            this.currentData.meetingInfo.host.selectedId = null;
        }
        
        this.initializeHostOptions();
        this.markDirty();
    }
    
 reorderPages(sourceId, targetId) {
    if (sourceId === targetId || !this.currentData.pages) return;
    
    const pages = this.currentData.pages;
    const sourceIndex = pages.findIndex(p => p.id === sourceId);
    const targetIndex = pages.findIndex(p => p.id === targetId);
    
    if (sourceIndex === -1 || targetIndex === -1) {
        console.error('找不到页面:', { sourceId, targetIndex });
        return;
    }
    
    console.log(`移动页面 ${sourceId} 到 ${targetId} 位置`);
    
    // 移动元素
    const [movedPage] = pages.splice(sourceIndex, 1);
    pages.splice(targetIndex, 0, movedPage);
    
    // 更新所有页面的order
    pages.forEach((page, index) => {
        page.order = index + 1;
    });
    
    this.initializePageList();
    this.markDirty();
    this.showSuccess('页面顺序已更新');
}
    
 togglePageEnabled(pageId, enabled) {
    if (!this.currentData.pages) return;
    
    const page = this.currentData.pages.find(p => p.id === pageId);
    if (page) {
        const wasEnabled = page.enabled;
        page.enabled = enabled;
        
        // 如果从禁用变为启用，确保有基本内容
        if (enabled && !wasEnabled && !page.content) {
            page.content = this.getDefaultPageContent(page.type);
        }
        
        this.markDirty();
        console.log(`页面 ${page.title} ${enabled ? '启用' : '禁用'}`);
    }
}

getDefaultPageContent(pageType) {
    const defaultContents = {
        'welcome': {
            text: '欢迎参加聚会',
            subtext: '请预备心来敬拜',
            showTime: true,
            showDate: true
        },
        'worship': {
            songs: [],
            currentSongIndex: 0,
            showLyrics: true
        },
        'scripture': {
            reference: '约翰福音 3:16',
            text: '神爱世人，甚至将他的独生子赐给他们...',
            version: '和合本',
            showReference: true,
            showVersion: true
        },
        'message': {
            title: '信息分享',
            speaker: '讲员',
            outline: [{ id: 'point1', title: '要点一', content: '内容' }],
            currentPointIndex: 0
        },
        'announcements': {
            items: [],
            style: 'list'
        },
        'generic': {
            text: '页面内容'
        }
    };
    
    return defaultContents[pageType] || defaultContents.generic;
}
        
        const newSong = {
            id: 'song' + Date.now(),
            title: title,
            key: key || 'C',
            tempo: tempo || '中板',
            duration: duration,
            lyrics: lyrics || ''
        };
        
        // 找到或创建敬拜页面
        let worshipPage = this.currentData.pages?.find(page => page.type === 'worship');
        
        if (!worshipPage) {
            // 如果没有敬拜页面，创建一个
            worshipPage = {
                id: 'worship',
                title: '敬拜赞美',
                type: 'worship',
                enabled: true,
                order: 2,
                content: {
                    songs: [],
                    currentSongIndex: 0,
                    showLyrics: true
                }
            };
            if (!this.currentData.pages) {
                this.currentData.pages = [];
            }
            this.currentData.pages.push(worshipPage);
        }
        
        if (!worshipPage.content) {
            worshipPage.content = {};
        }
        
        if (!worshipPage.content.songs) {
            worshipPage.content.songs = [];
        }
        
        worshipPage.content.songs.push(newSong);
        
        // 清空输入框
        const inputs = ['song-title', 'song-key', 'song-tempo', 'song-duration', 'song-lyrics'];
        inputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) input.value = '';
        });
        
        this.initializeSongList();
        this.markDirty();
    }
    
    moveSong(index, direction) {
        const worshipPage = this.currentData.pages?.find(page => page.type === 'worship');
        if (!worshipPage || !worshipPage.content || !worshipPage.content.songs) return;
        
        const songs = worshipPage.content.songs;
        
        if (direction === 'up' && index > 0) {
            [songs[index], songs[index - 1]] = [songs[index - 1], songs[index]];
            this.initializeSongList();
            this.markDirty();
        } else if (direction === 'down' && index < songs.length - 1) {
            [songs[index], songs[index + 1]] = [songs[index + 1], songs[index]];
            this.initializeSongList();
            this.markDirty();
        }
    }
    
    deleteSong(index) {
        const worshipPage = this.currentData.pages?.find(page => page.type === 'worship');
        if (!worshipPage || !worshipPage.content || !worshipPage.content.songs) return;
        
        worshipPage.content.songs.splice(index, 1);
        this.initializeSongList();
        this.markDirty();
    }
    
    addNewAnnouncement() {
        const title = document.getElementById('announcement-title')?.value.trim();
        const content = document.getElementById('announcement-content')?.value.trim();
        const important = document.getElementById('announcement-important')?.checked || false;
        
        if (!title) {
            alert('请输入报告标题');
            return;
        }
        
        const newAnnouncement = {
            id: 'ann' + Date.now(),
            title: title,
            content: content,
            important: important
        };
        
        // 找到或创建家事报告页面
        let announcementsPage = this.currentData.pages?.find(page => page.type === 'announcements');
        
        if (!announcementsPage) {
            // 如果没有家事报告页面，创建一个
            announcementsPage = {
                id: 'announcements',
                title: '家事报告',
                type: 'announcements',
                enabled: true,
                order: 5,
                content: {
                    items: [],
                    style: 'list'
                }
            };
            if (!this.currentData.pages) {
                this.currentData.pages = [];
            }
            this.currentData.pages.push(announcementsPage);
        }
        
        if (!announcementsPage.content) {
            announcementsPage.content = {};
        }
        
        if (!announcementsPage.content.items) {
            announcementsPage.content.items = [];
        }
        
        announcementsPage.content.items.push(newAnnouncement);
        
        // 清空输入框
        const inputs = ['announcement-title', 'announcement-content'];
        inputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) input.value = '';
        });
        
        const checkbox = document.getElementById('announcement-important');
        if (checkbox) checkbox.checked = false;
        
        this.initializeAnnouncementsList();
        this.markDirty();
    }
    
    toggleAnnouncementImportant(index) {
        const announcementsPage = this.currentData.pages?.find(page => page.type === 'announcements');
        if (!announcementsPage || !announcementsPage.content || !announcementsPage.content.items) return;
        
        if (announcementsPage.content.items[index]) {
            announcementsPage.content.items[index].important = 
                !announcementsPage.content.items[index].important;
            
            this.initializeAnnouncementsList();
            this.markDirty();
        }
    }
    // ============ 页面编辑功能 ============
 editPage(pageId) {
    const page = this.currentData.pages?.find(p => p.id === pageId);
    if (!page) return;
    
    // 创建完整的编辑对话框
    const modalHtml = `
        <div class="modal-overlay" id="edit-page-modal">
            <div class="modal-content" style="max-width: 500px;">
                <h2><i class="fas fa-edit"></i> 编辑页面</h2>
                
                <div class="form-group">
                    <label>页面标题 *</label>
                    <input type="text" class="form-control" id="edit-page-title" 
                           value="${this.escapeHtml(page.title || '')}" placeholder="请输入页面标题">
                </div>
                
                <div class="form-group">
                    <label>页面类型</label>
                    <select class="form-control" id="edit-page-type">
                        <option value="welcome" ${page.type === 'welcome' ? 'selected' : ''}>欢迎页</option>
                        <option value="worship" ${page.type === 'worship' ? 'selected' : ''}>敬拜赞美</option>
                        <option value="scripture" ${page.type === 'scripture' ? 'selected' : ''}>经文分享</option>
                        <option value="message" ${page.type === 'message' ? 'selected' : ''}>信息分享</option>
                        <option value="announcements" ${page.type === 'announcements' ? 'selected' : ''}>家事报告</option>
                        <option value="offering" ${page.type === 'offering' ? 'selected' : ''}>奉献</option>
                        <option value="closing" ${page.type === 'closing' ? 'selected' : ''}>结束祝福</option>
                        <option value="prayer" ${page.type === 'prayer' ? 'selected' : ''}>祷告</option>
                    </select>
                </div>
                
                <div class="form-section">
                    <h3><i class="fas fa-palette"></i> 页面显示样式</h3>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>页面背景色</label>
                            <div class="color-input-group">
                                <input type="color" class="form-control color-picker" id="edit-page-bgcolor" 
                                       value="${page.backgroundColor || '#ffffff'}">
                                <input type="text" class="form-control color-hex" value="${page.backgroundColor || '#ffffff'}" 
                                       placeholder="#FFFFFF" maxlength="7">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>文字颜色</label>
                            <div class="color-input-group">
                                <input type="color" class="form-control color-picker" id="edit-page-textcolor" 
                                       value="${page.textColor || '#000000'}">
                                <input type="text" class="form-control color-hex" value="${page.textColor || '#000000'}" 
                                       placeholder="#000000" maxlength="7">
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>字体大小</label>
                            <select class="form-control" id="edit-page-fontsize">
                                <option value="normal" ${page.fontSize === 'normal' ? 'selected' : ''}>正常 (16px)</option>
                                <option value="large" ${page.fontSize === 'large' ? 'selected' : ''}>较大 (20px)</option>
                                <option value="xlarge" ${page.fontSize === 'xlarge' ? 'selected' : ''}>特大 (24px)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>文字对齐</label>
                            <select class="form-control" id="edit-page-align">
                                <option value="center" ${page.align === 'center' ? 'selected' : ''}>居中</option>
                                <option value="left" ${page.align === 'left' ? 'selected' : ''}>左对齐</option>
                                <option value="right" ${page.align === 'right' ? 'selected' : ''}>右对齐</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="checkbox-group">
                        <input type="checkbox" id="edit-page-showtitle" ${page.showTitle !== false ? 'checked' : ''}>
                        <label for="edit-page-showtitle">显示页面标题</label>
                    </div>
                </div>
                
                <div class="modal-buttons">
                    <button class="btn btn-secondary" id="cancel-edit">
                        <i class="fas fa-times"></i> 取消
                    </button>
                    <button class="btn btn-primary" id="save-edit">
                        <i class="fas fa-save"></i> 保存设置
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // 添加到页面
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // 获取元素
    const modal = document.getElementById('edit-page-modal');
    
    // 颜色输入联动
    this.setupColorInputs('edit-page-bgcolor');
    this.setupColorInputs('edit-page-textcolor');
    
    // 关闭对话框函数
    const closeModal = () => {
        if (modal) modal.remove();
        // 移除ESC键监听
        document.removeEventListener('keydown', escapeHandler);
    };
    
    // ESC键处理函数
    const escapeHandler = (e) => {
        if (e.key === 'Escape') closeModal();
    };
    
    // 取消按钮
    document.getElementById('cancel-edit').addEventListener('click', closeModal);
    
    // 保存按钮
    document.getElementById('save-edit').addEventListener('click', () => {
        const titleInput = document.getElementById('edit-page-title');
        const title = titleInput.value.trim();
        
        if (!title) {
            alert('请输入页面标题');
            titleInput.focus();
            return;
        }
        
        // 保存所有设置
        page.title = title;
        page.type = document.getElementById('edit-page-type').value;
        page.backgroundColor = document.getElementById('edit-page-bgcolor').value;
        page.textColor = document.getElementById('edit-page-textcolor').value;
        page.fontSize = document.getElementById('edit-page-fontsize').value;
        page.align = document.getElementById('edit-page-align').value;
        page.showTitle = document.getElementById('edit-page-showtitle').checked;
        
        // 更新页面列表显示
        this.initializePageList();
        
        // 标记数据已修改
        this.markDirty();
        
        // 提示成功
        this.showSuccess(`页面"${title}"已更新`);
        
        // 关闭对话框
        closeModal();
    });
    
    // 点击背景关闭
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    // ESC键关闭
    document.addEventListener('keydown', escapeHandler);
    
    // 聚焦到标题输入框
    setTimeout(() => {
        document.getElementById('edit-page-title').focus();
        document.getElementById('edit-page-title').select();
    }, 100);
}
// --- 辅助方法 ---
escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

setupColorInputs(colorId) {
    const colorPicker = document.getElementById(colorId);
    if (!colorPicker) return;
    
    // 找到对应的十六进制输入框
    const hexInput = colorPicker.parentElement.querySelector('.color-hex');
    if (!hexInput) return;
    
    // 颜色选择器变化时更新十六进制值
    colorPicker.addEventListener('input', (e) => {
        hexInput.value = e.target.value.toUpperCase();
    });
    
    // 十六进制输入变化时更新颜色选择器
    hexInput.addEventListener('input', (e) => {
        let value = e.target.value;
        if (!value.startsWith('#')) {
            value = '#' + value;
        }
        if (/^#[0-9A-F]{6}$/i.test(value)) {
            colorPicker.value = value;
        }
    });
    
    // 失去焦点时格式化
    hexInput.addEventListener('blur', (e) => {
        let value = e.target.value.toUpperCase();
        if (!value.startsWith('#')) {
            value = '#' + value;
        }
        if (value.length === 4) {
            value = '#' + value[1] + value[1] + value[2] + value[2] + value[3] + value[3];
        }
        if (/^#[0-9A-F]{6}$/i.test(value)) {
            e.target.value = value;
            colorPicker.value = value;
        }
    });
}   
    // ============ 存储功能 ============
    
    async saveConfig() {
        try {
            // 保存表单数据
            this.saveFormData();
            
            // 更新最后修改时间
            this.currentData.lastUpdated = new Date().toISOString();
            this.currentData.version = "1.1"; // 更新版本
            
            // 保存到 localStorage
            localStorage.setItem('churchMeetingConfig', JSON.stringify(this.currentData, null, 2));
            
            console.log('配置已保存到本地存储:', this.currentData);
            
            // 显示成功消息
            this.showSuccess('配置保存成功！已保存到浏览器本地存储。');
            this.isDirty = false;
            this.updateStatus();
            
            // 更新状态栏
            this.updateLastSaved();
            
        } catch (error) {
            console.error('保存配置失败:', error);
            this.showError('保存配置失败：' + error.message);
        }
    }
    
    async loadConfig() {
        try {
            await this.loadData();
            
            // 重新初始化UI
            this.initializeUI();
            
            // 重新初始化背景设置
            this.initializeBackgroundSettings();
            
            this.showSuccess('配置加载成功！');
            this.isDirty = false;
            this.updateStatus();
            
        } catch (error) {
            console.error('加载配置失败:', error);
            this.showError('加载配置失败：' + error.message);
        }
    }
    
    exportConfig() {
        try {
            // 确保数据是最新的
            this.saveFormData();
            
            const dataStr = JSON.stringify(this.currentData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const downloadUrl = URL.createObjectURL(dataBlob);
            const downloadLink = document.createElement('a');
            downloadLink.href = downloadUrl;
            downloadLink.download = `church-meeting-config-${new Date().toISOString().split('T')[0]}.json`;
            
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(downloadUrl);
            
            this.showSuccess('配置导出成功！');
            
        } catch (error) {
            console.error('导出配置失败:', error);
            this.showError('导出配置失败：' + error.message);
        }
    }
    
    resetConfig() {
        this.currentData = this.getDefaultData();
        this.initializeUI();
        this.initializeBackgroundSettings();
        this.isDirty = true;
        this.saveConfig();
    }
    
    resetPageOrder() {
        this.currentData.pages = this.getDefaultPages();
        this.initializePageList();
        this.markDirty();
    }
    
    refreshPreview() {
        const previewArea = document.getElementById('preview-area');
        if (!previewArea) return;
        
        const enabledPages = this.currentData.pages?.filter(page => page.enabled) || [];
        
        let previewHTML = `
            <h3>聚会预览（共 ${enabledPages.length} 个页面）</h3>
            <div class="preview-pages">
        `;
        
        enabledPages.forEach((page, index) => {
            previewHTML += `
                <div class="preview-page">
                    <div class="preview-page-header">
                        <span class="page-number">${index + 1}</span>
                        <strong>${page.title}</strong>
                        <span class="page-type">${this.getPageTypeName(page.type)}</span>
                    </div>
                    <div class="preview-page-content">
                        ${this.getPagePreview(page)}
                    </div>
                </div>
            `;
        });
        
        previewHTML += '</div>';
        previewArea.innerHTML = previewHTML;
    }
    
    getPagePreview(page) {
        if (!page.content) return `<p>无内容</p>`;
        
        switch(page.type) {
            case 'welcome':
                return `<p>${page.content.text || '欢迎参加崇拜'}</p>`;
            case 'worship':
                const songs = page.content.songs || [];
                return `<p>${songs.length} 首歌曲</p>`;
            case 'scripture':
                return `<p>${page.content.reference || '经文'}</p>`;
            case 'announcements':
                const items = page.content.items || [];
                return `<p>${items.length} 个报告事项</p>`;
            default:
                return `<p>${page.type} 页面</p>`;
        }
    }
    
    openPreview() {
        // 先保存配置
        this.saveFormData();
        
        // 在新窗口打开主页面
        const previewWindow = window.open('index.html', '_blank');
        
        // 将配置传递给新窗口
        setTimeout(() => {
            if (previewWindow) {
                localStorage.setItem('churchMeetingConfig', JSON.stringify(this.currentData));
            }
        }, 1000);
    }
    
    applyToMainPage() {
        this.saveConfig();
        
        // 尝试刷新主页面
        if (window.opener && !window.opener.closed) {
            window.opener.location.reload();
            this.showSuccess('配置已应用到主页面！');
        } else {
            this.showSuccess('配置已保存，请手动刷新主页面查看效果。');
        }
    }
    
    // ============ 状态管理 ============
    
    markDirty() {
        this.isDirty = true;
        this.updateStatus();
    }
    
    updateStatus() {
        const statusText = document.getElementById('status-text');
        if (!statusText) return;
        
        if (this.isDirty) {
            statusText.textContent = '🟡 有未保存的更改';
            statusText.style.color = '#f39c12';
        } else {
            statusText.textContent = '🟢 已保存';
            statusText.style.color = '#27ae60';
        }
    }
    
    updateLastSaved() {
        const lastSaved = document.getElementById('last-saved');
        if (!lastSaved) return;
        
        const now = new Date();
        lastSaved.textContent = `最后更新: ${now.toLocaleTimeString('zh-CN')}`;
    }
    
    updateNavigation() {
        // 可以在这里添加导航状态更新
    }
    
    showSuccess(message) {
        const alert = document.getElementById('success-alert');
        if (!alert) return;
        
        alert.textContent = message;
        alert.style.display = 'block';
        
        setTimeout(() => {
            alert.style.display = 'none';
        }, 3000);
    }
    
    showError(message) {
        const alert = document.getElementById('error-alert');
        if (!alert) return;
        
        alert.textContent = message;
        alert.style.display = 'block';
        
        setTimeout(() => {
            alert.style.display = 'none';
        }, 3000);
    }
    // ============ 获取默认页面内容 ============
getDefaultPageContent(pageType) {
    const defaultContents = {
        'welcome': {
            text: '欢迎参加聚会',
            subtext: '请预备心来敬拜',
            showTime: true,
            showDate: true
        },
        'worship': {
            songs: [],
            currentSongIndex: 0,
            showLyrics: true
        },
        'scripture': {
            reference: '约翰福音 3:16',
            text: '神爱世人...',
            version: '和合本',
            showReference: true,
            showVersion: true
        },
        'message': {
            title: '信息分享',
            speaker: '讲员',
            outline: [{ id: 'point1', title: '要点一', content: '内容' }],
            currentPointIndex: 0
        },
        'announcements': {
            items: [],
            style: 'list'
        }
    };
    
    return defaultContents[pageType] || { text: '页面内容' };
}
}