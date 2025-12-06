/**
 * 页面编辑器模块
 * 为不同类型页面提供特定的编辑表单
 */

class PageEditor {
    constructor(configManager) {
        this.configManager = configManager;
        this.currentPage = null;
        this.bindEvents();
    }
    
    open(pageId) {
        console.log('打开页面编辑器，pageId:', pageId);
        
        const page = this.findPageById(pageId);
        if (!page) {
            console.error('找不到页面:', pageId);
            return;
        }
        
        this.currentPage = page;
        this.showEditor();
        this.renderEditorContent(page);
    }
    
    findPageById(pageId) {
        return this.configManager.currentData?.pages?.find(p => p.id === pageId);
    }
    
    showEditor() {
    let editorModal = document.getElementById('page-editor');
    
    // 如果元素不存在，创建它
    if (!editorModal) {
        editorModal = document.createElement('div');
        editorModal.id = 'page-editor';
        editorModal.className = 'modal-overlay';
        editorModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        `;
        
        editorModal.innerHTML = `
            <div style="background: white; padding: 20px; border-radius: 10px; width: 700px; max-height: 80vh; overflow-y: auto;">
                <h2 style="margin-top: 0; color: #2c3e50;">页面编辑器</h2>
                <div id="page-editor-content"></div>
            </div>
        `;
        
        document.body.appendChild(editorModal);
    }
    
    // 显示模态框
    editorModal.style.display = 'flex';
}
    
    closeEditor() {
        const editorModal = document.getElementById('page-editor');
        if (editorModal) {
            editorModal.style.display = 'none';
            editorModal.classList.remove('show');
        }
        this.currentPage = null;
    }
    
    renderEditorContent(page) {
        const container = document.getElementById('page-editor-content');
        if (!container) return;
        
        // 清空容器
        container.innerHTML = '';
        
        // 标题
        const header = document.createElement('div');
        header.className = 'editor-header';
        header.innerHTML = `
            <h3>编辑页面：${page.title || '未命名'}</h3>
            <p class="page-type-badge">${this.getPageTypeName(page.type)}</p>
        `;
        container.appendChild(header);
        
        // 通用字段
        const commonFields = this.renderCommonFields(page);
        container.appendChild(commonFields);
        
        // 类型特定字段
        const typeSpecificFields = this.renderTypeSpecificFields(page);
        if (typeSpecificFields) {
            container.appendChild(typeSpecificFields);
        }
        
        // 样式设置
        const styleFields = this.renderStyleFields(page);
        container.appendChild(styleFields);
        
        // 保存按钮
        const actionButtons = this.renderActionButtons();
        container.appendChild(actionButtons);
    }
    
    renderCommonFields(page) {
        const fragment = document.createDocumentFragment();
        
        const section = document.createElement('div');
        section.className = 'editor-section';
        section.innerHTML = `
            <h4><i class="fas fa-info-circle"></i> 基本信息</h4>
            <div class="form-group">
                <label for="page-title">页面标题</label>
                <input type="text" id="page-title" class="form-control" 
                       value="${this.escapeHtml(page.title || '')}" 
                       placeholder="输入页面标题">
            </div>
            <div class="form-row">
                <div class="col">
                    <div class="form-group form-check">
                        <input type="checkbox" id="page-enabled" class="form-check-input" 
                               ${page.enabled ? 'checked' : ''}>
                        <label class="form-check-label" for="page-enabled">启用此页面</label>
                    </div>
                </div>
                <div class="col">
                    <div class="form-group form-check">
                        <input type="checkbox" id="page-show-title" class="form-check-input" 
                               ${page.showTitle !== false ? 'checked' : ''}>
                        <label class="form-check-label" for="page-show-title">显示标题</label>
                    </div>
                </div>
            </div>
        `;
        
        fragment.appendChild(section);
        return fragment;
    }
    
    renderStyleFields(page) {
        const fragment = document.createDocumentFragment();
        
        const section = document.createElement('div');
        section.className = 'editor-section';
        section.innerHTML = `
            <h4><i class="fas fa-palette"></i> 样式设置</h4>
            <div class="form-row">
                <div class="col-md-6">
                    <div class="form-group">
                        <label for="page-bg-color">背景颜色</label>
                        <input type="color" id="page-bg-color" class="form-control form-control-color" 
                               value="${page.backgroundColor || '#ffffff'}">
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="form-group">
                        <label for="page-text-color">文字颜色</label>
                        <input type="color" id="page-text-color" class="form-control form-control-color" 
                               value="${page.textColor || '#000000'}">
                    </div>
                </div>
            </div>
            <div class="form-row">
                <div class="col-md-6">
                    <div class="form-group">
                        <label for="page-font-size">字体大小</label>
                        <select id="page-font-size" class="form-control">
                            <option value="small" ${page.fontSize === 'small' ? 'selected' : ''}>小</option>
                            <option value="medium" ${page.fontSize === 'medium' || !page.fontSize ? 'selected' : ''}>中</option>
                            <option value="large" ${page.fontSize === 'large' ? 'selected' : ''}>大</option>
                            <option value="x-large" ${page.fontSize === 'x-large' ? 'selected' : ''}>特大</option>
                        </select>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="form-group">
                        <label for="page-align">对齐方式</label>
                        <select id="page-align" class="form-control">
                            <option value="left" ${page.align === 'left' ? 'selected' : ''}>左对齐</option>
                            <option value="center" ${page.align === 'center' || !page.align ? 'selected' : ''}>居中</option>
                            <option value="right" ${page.align === 'right' ? 'selected' : ''}>右对齐</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
        
        fragment.appendChild(section);
        return fragment;
    }
    
    renderTypeSpecificFields(page) {
        const fragment = document.createDocumentFragment();
        
        const section = document.createElement('div');
        section.className = 'editor-section type-specific';
        
        let contentHtml = '';
        const content = page.content || {};
        
        switch (page.type) {
            case 'welcome':
                contentHtml = this.renderWelcomeFields(content);
                break;
            case 'worship':
                contentHtml = this.renderWorshipFields(content);
                break;
            case 'announcements':
                contentHtml = this.renderAnnouncementsFields(content);
                break;
            case 'scripture':
                contentHtml = this.renderScriptureFields(content);
                break;
            case 'message':
                contentHtml = this.renderMessageFields(content);
                break;
            case 'special':
                contentHtml = this.renderSpecialFields(content);
                break;
            default:
                contentHtml = `
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle"></i> 此页面类型无需特殊内容设置
                    </div>
                `;
        }
        
        section.innerHTML = `
            <h4><i class="fas fa-edit"></i> 页面内容</h4>
            ${contentHtml}
        `;
        
        fragment.appendChild(section);
        return fragment;
    }
    
    renderWelcomeFields(content) {
        return `
            <div class="form-group">
                <label for="welcome-text">欢迎词</label>
                <input type="text" id="welcome-text" class="form-control" 
                       value="${this.escapeHtml(content.text || '欢迎参加今日主日崇拜')}" 
                       placeholder="输入欢迎词">
            </div>
            <div class="form-group">
                <label for="welcome-subtext">副标题/经文</label>
                <input type="text" id="welcome-subtext" class="form-control" 
                       value="${this.escapeHtml(content.subtext || '在主爱中合一，在圣灵里敬拜')}" 
                       placeholder="输入副标题或经文">
            </div>
            <div class="form-group">
                <label for="welcome-style">显示样式</label>
                <select id="welcome-style" class="form-control">
                    <option value="simple" ${content.style === 'simple' ? 'selected' : ''}>简约</option>
                    <option value="classic" ${content.style === 'classic' || !content.style ? 'selected' : ''}>经典</option>
                    <option value="modern" ${content.style === 'modern' ? 'selected' : ''}>现代</option>
                </select>
            </div>
        `;
    }
    
    renderWorshipFields(content) {
        const songs = content.songs || [];
        return `
            <div class="alert alert-info">
                <i class="fas fa-music"></i> 歌曲管理请在"敬拜歌曲"标签页进行编辑
            </div>
            <div class="form-group">
                <label for="worship-order">歌曲顺序</label>
                <select id="worship-order" class="form-control">
                    <option value="manual" ${content.order === 'manual' ? 'selected' : ''}>手动排序</option>
                    <option value="by-key" ${content.order === 'by-key' ? 'selected' : ''}>按调性排序</option>
                    <option value="by-tempo" ${content.order === 'by-tempo' ? 'selected' : ''}>按速度排序</option>
                </select>
            </div>
            <div class="form-row">
                <div class="col-md-6">
                    <div class="form-group">
                        <label for="worship-background">背景音乐</label>
                        <select id="worship-background" class="form-control">
                            <option value="none" ${content.backgroundMusic === 'none' ? 'selected' : ''}>无背景音乐</option>
                            <option value="ambient" ${content.backgroundMusic === 'ambient' ? 'selected' : ''}>氛围音乐</option>
                            <option value="instrumental" ${content.backgroundMusic === 'instrumental' ? 'selected' : ''}>器乐伴奏</option>
                        </select>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="form-group">
                        <label for="worship-slide-duration">幻灯片显示时间（秒）</label>
                        <input type="number" id="worship-slide-duration" class="form-control" 
                               min="5" max="60" value="${content.slideDuration || 15}">
                    </div>
                </div>
            </div>
            ${songs.length > 0 ? `
                <div class="song-preview mt-3">
                    <h5>当前歌曲列表（${songs.length}首）</h5>
                    <div class="list-group">
                        ${songs.map((song, index) => `
                            <div class="list-group-item">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <strong>${index + 1}. ${this.escapeHtml(song.title || '未命名歌曲')}</strong>
                                        <small class="text-muted ml-2">${song.key || 'C'} | ${song.tempo || '中板'}</small>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        `;
    }
    
    renderAnnouncementsFields(content) {
        const items = content.items || [];
        return `
            <div class="alert alert-info">
                <i class="fas fa-bullhorn"></i> 报告项目请在"家事报告"标签页进行编辑
            </div>
            <div class="form-group">
                <label for="announcements-layout">布局样式</label>
                <select id="announcements-layout" class="form-control">
                    <option value="list" ${content.layout === 'list' ? 'selected' : ''}>列表式</option>
                    <option value="cards" ${content.layout === 'cards' ? 'selected' : ''}>卡片式</option>
                    <option value="simple" ${content.layout === 'simple' ? 'selected' : ''}>简约式</option>
                </select>
            </div>
            <div class="form-group form-check">
                <input type="checkbox" id="announcements-show-time" class="form-check-input" 
                       ${content.showTime ? 'checked' : ''}>
                <label class="form-check-label" for="announcements-show-time">显示报告时间</label>
            </div>
            <div class="form-group">
                <label for="announcements-highlight-important">重要报告高亮样式</label>
                <select id="announcements-highlight-important" class="form-control">
                    <option value="red" ${content.highlightStyle === 'red' ? 'selected' : ''}>红色标记</option>
                    <option value="yellow" ${content.highlightStyle === 'yellow' ? 'selected' : ''}>黄色背景</option>
                    <option value="border" ${content.highlightStyle === 'border' ? 'selected' : ''}>边框高亮</option>
                    <option value="icon" ${content.highlightStyle === 'icon' ? 'selected' : ''}>图标标记</option>
                </select>
            </div>
            ${items.length > 0 ? `
                <div class="announcements-preview mt-3">
                    <h5>当前报告列表（${items.length}项）</h5>
                    <div class="list-group">
                        ${items.map((item, index) => `
                            <div class="list-group-item ${item.important ? 'list-group-item-warning' : ''}">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <strong>${index + 1}. ${this.escapeHtml(item.title || '未命名报告')}</strong>
                                        ${item.important ? '<span class="badge bg-danger ml-2">重要</span>' : ''}
                                    </div>
                                </div>
                                ${item.content ? `<small class="text-muted">${this.escapeHtml(item.content.substring(0, 50))}...</small>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        `;
    }
    
    renderScriptureFields(content) {
        const scripture = content.scripture || {};
        return `
            <div class="form-row">
                <div class="col-md-4">
                    <div class="form-group">
                        <label for="scripture-book">书卷</label>
                        <input type="text" id="scripture-book" class="form-control" 
                               value="${this.escapeHtml(scripture.book || '')}" 
                               placeholder="如：约翰福音">
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="form-group">
                        <label for="scripture-chapter">章</label>
                        <input type="number" id="scripture-chapter" class="form-control" 
                               min="1" value="${scripture.chapter || ''}">
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="form-group">
                        <label for="scripture-verse">节</label>
                        <input type="text" id="scripture-verse" class="form-control" 
                               value="${this.escapeHtml(scripture.verse || '')}" 
                               placeholder="如：1-5 或 16">
                    </div>
                </div>
            </div>
            <div class="form-group">
                <label for="scripture-text">经文内容</label>
                <textarea id="scripture-text" class="form-control" rows="5" 
                          placeholder="请输入完整的经文内容...">${this.escapeHtml(scripture.text || '')}</textarea>
            </div>
            <div class="form-row">
                <div class="col-md-6">
                    <div class="form-group">
                        <label for="scripture-translation">译本</label>
                        <select id="scripture-translation" class="form-control">
                            <option value="cuv" ${scripture.translation === 'cuv' ? 'selected' : ''}>和合本</option>
                            <option value="ncv" ${scripture.translation === 'ncv' ? 'selected' : ''}>新译本</option>
                            <option value="esv" ${scripture.translation === 'esv' ? 'selected' : ''}>ESV</option>
                            <option value="niv" ${scripture.translation === 'niv' ? 'selected' : ''}>NIV</option>
                        </select>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="form-group">
                        <label for="scripture-display-style">显示样式</label>
                        <select id="scripture-display-style" class="form-control">
                            <option value="full" ${scripture.displayStyle === 'full' ? 'selected' : ''}>完整显示</option>
                            <option value="verse-by-verse" ${scripture.displayStyle === 'verse-by-verse' ? 'selected' : ''}>逐节显示</option>
                            <option value="highlight-key" ${scripture.displayStyle === 'highlight-key' ? 'selected' : ''}>关键词高亮</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderMessageFields(content) {
        const message = content.message || {};
        return `
            <div class="form-group">
                <label for="message-title">题目</label>
                <input type="text" id="message-title" class="form-control" 
                       value="${this.escapeHtml(message.title || '')}" 
                       placeholder="信息主题">
            </div>
            <div class="form-row">
                <div class="col-md-6">
                    <div class="form-group">
                        <label for="message-speaker">讲员</label>
                        <input type="text" id="message-speaker" class="form-control" 
                               value="${this.escapeHtml(message.speaker || '')}" 
                               placeholder="讲员姓名">
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="form-group">
                        <label for="message-series">系列</label>
                        <input type="text" id="message-series" class="form-control" 
                               value="${this.escapeHtml(message.series || '')}" 
                               placeholder="所属系列（可选）">
                    </div>
                </div>
            </div>
            <div class="form-group">
                <label for="message-outline">大纲/要点</label>
                <textarea id="message-outline" class="form-control" rows="6" 
                          placeholder="请输入信息大纲，每行一个要点...">${this.escapeHtml(message.outline || '')}</textarea>
                <small class="form-text text-muted">每行将作为一个要点显示</small>
            </div>
            <div class="form-row">
                <div class="col-md-6">
                    <div class="form-group">
                        <label for="message-duration">预计时长（分钟）</label>
                        <input type="number" id="message-duration" class="form-control" 
                               min="5" max="120" value="${message.duration || 45}">
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="form-group">
                        <label for="message-slide-style">幻灯片样式</label>
                        <select id="message-slide-style" class="form-control">
                            <option value="simple" ${message.slideStyle === 'simple' ? 'selected' : ''}>简约文字</option>
                            <option value="outline" ${message.slideStyle === 'outline' ? 'selected' : ''}>大纲列表</option>
                            <option value="full" ${message.slideStyle === 'full' ? 'selected' : ''}>完整显示</option>
                            <option value="progressive" ${message.slideStyle === 'progressive' ? 'selected' : ''}>逐步展开</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderSpecialFields(content) {
        return `
            <div class="form-group">
                <label for="special-title">标题</label>
                <input type="text" id="special-title" class="form-control" 
                       value="${this.escapeHtml(content.title || '')}" 
                       placeholder="特别项目标题">
            </div>
            <div class="form-group">
                <label for="special-text">内容</label>
                <textarea id="special-text" class="form-control" rows="4" 
                          placeholder="输入特别项目的内容...">${this.escapeHtml(content.text || '')}</textarea>
            </div>
            <div class="form-group">
                <label for="special-scripture">相关经文</label>
                <input type="text" id="special-scripture" class="form-control" 
                       value="${this.escapeHtml(content.scripture || '')}" 
                       placeholder="如：哥林多前书 13:13">
            </div>
        `;
    }
    
    renderActionButtons() {
        const fragment = document.createDocumentFragment();
        
        const section = document.createElement('div');
        section.className = 'editor-actions';
        section.innerHTML = `
            <button type="button" class="btn btn-primary btn-lg" id="save-page-changes">
                <i class="fas fa-save"></i> 保存修改
            </button>
            <button type="button" class="btn btn-secondary btn-lg" id="close-editor">
                <i class="fas fa-times"></i> 取消
            </button>
        `;
        
        fragment.appendChild(section);
        return fragment;
    }
    
    getPageTypeName(type) {
        const names = {
            'welcome': '欢迎页',
            'worship': '敬拜赞美',
            'announcements': '家事报告',
            'scripture': '经文分享',
            'message': '信息分享',
            'special': '特别项目'
        };
        return names[type] || type;
    }
    
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    bindEvents() {
        // 保存按钮
        document.addEventListener('click', (e) => {
            if (e.target.id === 'save-page-changes' || e.target.closest('#save-page-changes')) {
                this.savePageChanges();
            }
            if (e.target.id === 'close-editor' || e.target.closest('#close-editor')) {
                this.closeEditor();
            }
        });
        
        // 点击模态框外部关闭
        document.addEventListener('click', (e) => {
            const editorModal = document.getElementById('page-editor');
            if (editorModal && e.target === editorModal) {
                this.closeEditor();
            }
        });
        
        // ESC键关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeEditor();
            }
        });
    }
    
    savePageChanges() {
        if (!this.currentPage) return;
        
        try {
            // 保存通用字段
            this.currentPage.title = document.getElementById('page-title')?.value || '';
            this.currentPage.enabled = document.getElementById('page-enabled')?.checked || false;
            this.currentPage.showTitle = document.getElementById('page-show-title')?.checked !== false;
            
            // 保存样式字段
            this.currentPage.backgroundColor = document.getElementById('page-bg-color')?.value || '#ffffff';
            this.currentPage.textColor = document.getElementById('page-text-color')?.value || '#000000';
            this.currentPage.fontSize = document.getElementById('page-font-size')?.value || 'medium';
            this.currentPage.align = document.getElementById('page-align')?.value || 'center';
            
            // 保存类型特定字段
            this.saveTypeSpecificFields(this.currentPage);
            
            // 通知 ConfigManager 数据已更改
            if (this.configManager && typeof this.configManager.markDirty === 'function') {
                this.configManager.markDirty();
                this.configManager.initializePageList(); // 刷新页面列表
            }
            
            // 显示成功消息
            alert('页面设置已保存！');
            
            // 关闭编辑器
            this.closeEditor();
            
        } catch (error) {
            console.error('保存页面时出错:', error);
            alert('保存失败：' + error.message);
        }
    }
    
    saveTypeSpecificFields(page) {
        if (!page.content) page.content = {};
        
        switch (page.type) {
            case 'welcome':
                page.content.text = document.getElementById('welcome-text')?.value || '';
                page.content.subtext = document.getElementById('welcome-subtext')?.value || '';
                page.content.style = document.getElementById('welcome-style')?.value || 'classic';
                break;
                
            case 'worship':
                page.content.order = document.getElementById('worship-order')?.value || 'manual';
                page.content.backgroundMusic = document.getElementById('worship-background')?.value || 'none';
                page.content.slideDuration = parseInt(document.getElementById('worship-slide-duration')?.value) || 15;
                break;
                
            case 'announcements':
                page.content.layout = document.getElementById('announcements-layout')?.value || 'list';
                page.content.showTime = document.getElementById('announcements-show-time')?.checked || false;
                page.content.highlightStyle = document.getElementById('announcements-highlight-important')?.value || 'red';
                break;
                
            case 'scripture':
                if (!page.content.scripture) page.content.scripture = {};
                page.content.scripture.book = document.getElementById('scripture-book')?.value || '';
                page.content.scripture.chapter = document.getElementById('scripture-chapter')?.value || '';
                page.content.scripture.verse = document.getElementById('scripture-verse')?.value || '';
                page.content.scripture.text = document.getElementById('scripture-text')?.value || '';
                page.content.scripture.translation = document.getElementById('scripture-translation')?.value || 'cuv';
                page.content.scripture.displayStyle = document.getElementById('scripture-display-style')?.value || 'full';
                break;
                
            case 'message':
                if (!page.content.message) page.content.message = {};
                page.content.message.title = document.getElementById('message-title')?.value || '';
                page.content.message.speaker = document.getElementById('message-speaker')?.value || '';
                page.content.message.series = document.getElementById('message-series')?.value || '';
                page.content.message.outline = document.getElementById('message-outline')?.value || '';
                page.content.message.duration = parseInt(document.getElementById('message-duration')?.value) || 45;
                page.content.message.slideStyle = document.getElementById('message-slide-style')?.value || 'simple';
                break;
                
            case 'special':
                page.content.title = document.getElementById('special-title')?.value || '';
                page.content.text = document.getElementById('special-text')?.value || '';
                page.content.scripture = document.getElementById('special-scripture')?.value || '';
                break;
        }
    }
}