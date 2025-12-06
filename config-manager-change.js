/**
 * 配置管理器 - 最终修复版
 * 解决重复声明和 pageEditor 问题
 */

class ConfigManager {
    constructor() {
        this.currentData = null;
        this.isDirty = false;
        this.pageEditor = null;  // 实例变量，不是全局变量
    }
    
    async initialize() {
        console.log('初始化配置管理器...');
        
        try {
            await this.loadData();
            this.initializeUI();
            this.bindEvents();
            
            // 初始化页面编辑器
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
            console.error('加载数据失败，使用默认数据:', error);
            this.currentData = this.getDefaultData();
        }
    }
    
    ensureDataStructure() {
        if (!this.currentData.meetingInfo) {
            this.currentData.meetingInfo = {};
        }
        if (!this.currentData.pages) {
            this.currentData.pages = this.getDefaultPages();
        }
        if (!this.currentData.settings) {
            this.currentData.settings = {
                background: { type: 'gradient', theme: 'blue' },
                fontSize: 'medium'
            };
        }
    }
    
    getDefaultData() {
        return {
            version: "1.0",
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
                background: { type: "gradient", theme: "blue" },
                fontSize: "medium",
                transitionSpeed: "normal"
            }
        };
    }
    
    getDefaultPages() {
        return [
            {
                id: 'welcome_' + Date.now(),
                title: '欢迎页',
                type: 'welcome',
                enabled: true,
                order: 1,
                content: {
                    text: '欢迎参加今日主日崇拜',
                    subtext: '在主爱中合一，在圣灵里敬拜'
                }
            },
            {
                id: 'worship_' + Date.now(),
                title: '敬拜赞美',
                type: 'worship',
                enabled: true,
                order: 2,
                content: { songs: [] }
            },
            {
                id: 'announcements_' + Date.now(),
                title: '家事报告',
                type: 'announcements',
                enabled: true,
                order: 3,
                content: { items: [] }
            }
        ];
    }
    
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
    }
    
    initializePageList() {
        const container = document.getElementById('page-list');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (!this.currentData.pages || this.currentData.pages.length === 0) {
            this.currentData.pages = this.getDefaultPages();
        }
        
        const sortedPages = [...this.currentData.pages].sort((a, b) => (a.order || 0) - (b.order || 0));
        
        sortedPages.forEach((page) => {
            const pageItem = document.createElement('div');
            pageItem.className = 'page-item';
            pageItem.draggable = true;
            pageItem.dataset.pageId = page.id;
            
            pageItem.innerHTML = `
                <div class="page-info">
                    <div class="checkbox-group">
                        <input type="checkbox" id="page-${page.id}" ${page.enabled ? 'checked' : ''}>
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
            });
            
            pageItem.addEventListener('dragover', (e) => e.preventDefault());
            
            pageItem.addEventListener('drop', (e) => {
                e.preventDefault();
                const sourceId = e.dataTransfer.getData('text/plain');
                this.reorderPages(sourceId, page.id);
            });
            
            // 复选框事件
            const checkbox = pageItem.querySelector('input[type="checkbox"]');
            checkbox.addEventListener('change', (e) => {
                this.togglePageEnabled(page.id, e.target.checked);
            });
            
            // 编辑按钮 - 关键修复：使用 this.pageEditor
            const editBtn = pageItem.querySelector('.edit-page');
            const manager = this; // 保存 this 引用
            
            editBtn.addEventListener('click', function() {
                const pageId = this.getAttribute('data-page-id');
                console.log('点击编辑按钮，pageId:', pageId);
                console.log('pageEditor 实例:', manager.pageEditor);
                
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
            'worship': '敬拜赞美',
            'announcements': '家事报告',
            'scripture': '经文分享',
            'message': '信息分享'
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
    
    bindEvents() {
        // 主持人
        document.getElementById('add-host-btn')?.addEventListener('click', () => this.addNewHost());
        
        // 歌曲
        document.getElementById('add-song-btn')?.addEventListener('click', () => this.addNewSong());
        
        // 报告
        document.getElementById('add-announcement-btn')?.addEventListener('click', () => this.addNewAnnouncement());
        
        // 主要按钮
        document.getElementById('save-btn')?.addEventListener('click', () => this.saveConfig());
        document.getElementById('load-btn')?.addEventListener('click', () => this.loadConfig());
        document.getElementById('export-btn')?.addEventListener('click', () => this.exportConfig());
        document.getElementById('reset-btn')?.addEventListener('click', () => {
            if (confirm('确定要重置所有配置吗？')) this.resetConfig();
        });
        
        // 表单变化监听
        setTimeout(() => {
            document.querySelectorAll('input, select, textarea').forEach(input => {
                input.addEventListener('change', () => {
                    this.isDirty = true;
                    this.saveFormData();
                });
            });
        }, 500);
    }
    
    saveFormData() {
        if (!this.currentData) return;
        
        // 基本信息
        const data = this.currentData.meetingInfo;
        data.date = document.getElementById('meeting-date')?.value || '';
        data.title = document.getElementById('meeting-title')?.value || '';
        data.theme = document.getElementById('meeting-theme')?.value || '';
        data.time = document.getElementById('meeting-time')?.value || '09:30';
        data.location = document.getElementById('meeting-location')?.value || '';
        
        this.currentData.lastUpdated = new Date().toISOString();
    }
    
    // 页面管理
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
        this.isDirty = true;
    }
    
    togglePageEnabled(pageId, enabled) {
        const page = this.currentData.pages?.find(p => p.id === pageId);
        if (page) {
            page.enabled = enabled;
            this.isDirty = true;
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
        this.isDirty = true;
        alert('页面已删除');
    }
    
    // 主持人功能
    selectHost(hostId) {
        this.currentData.meetingInfo.host.selectedId = hostId;
        this.initializeHostOptions();
        this.isDirty = true;
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
        this.isDirty = true;
    }
    
    // 歌曲功能
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
        
        // 清空输入
        ['song-title', 'song-key', 'song-tempo', 'song-lyrics'].forEach(id => {
            const input = document.getElementById(id);
            if (input) input.value = '';
        });
        
        this.initializeSongList();
        this.isDirty = true;
    }
    
    deleteSong(index) {
        const worshipPage = this.currentData.pages.find(p => p.type === 'worship');
        if (!worshipPage?.content?.songs) return;
        
        worshipPage.content.songs.splice(index, 1);
        this.initializeSongList();
        this.isDirty = true;
    }
    
    // 报告功能
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
        this.isDirty = true;
    }
    
    deleteAnnouncement(index) {
        const annPage = this.currentData.pages.find(p => p.type === 'announcements');
        if (!annPage?.content?.items) return;
        
        annPage.content.items.splice(index, 1);
        this.initializeAnnouncementsList();
        this.isDirty = true;
    }
    
    // 存储功能
    async saveConfig() {
        try {
            this.saveFormData();
            this.currentData.lastUpdated = new Date().toISOString();
            
            localStorage.setItem('churchMeetingConfig', JSON.stringify(this.currentData));
            
            alert('配置保存成功！');
            this.isDirty = false;
            
        } catch (error) {
            console.error('保存失败:', error);
            alert('保存失败：' + error.message);
        }
    }
    
    async loadConfig() {
        try {
            await this.loadData();
            this.initializeUI();
            alert('配置加载成功！');
            this.isDirty = false;
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
            downloadLink.download = `church-config-${new Date().toISOString().split('T')[0]}.json`;
            
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(downloadUrl);
            
            alert('配置导出成功！');
        } catch (error) {
            alert('导出失败：' + error.message);
        }
    }
    
    resetConfig() {
        this.currentData = this.getDefaultData();
        this.initializeUI();
        this.isDirty = true;
        this.saveConfig();
    }
    
    updateStatus() {
        // 可选的：更新状态显示
    }
}