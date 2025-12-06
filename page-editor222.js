/**
 * 页面编辑器模块 - 完整版
 * 保留你的原有方法，并补齐所有页面类型的编辑器与保存逻辑
 */

class PageEditor {
    constructor(configManager) {
        this.configManager = configManager;
        this.currentPage = null;
    }
    
    /**
     * 打开页面编辑对话框
     * @param {string} pageId - 页面ID
     */
    open(pageId) {
        const page = this.configManager.currentData.pages?.find(p => p.id === pageId);
        if (!page) return;
        
        this.currentPage = page;
        this.createModal(page);
        this.bindEvents();
    }
    
    /**
     * 创建编辑对话框
     */
    createModal(page) {
        const modalHtml = `
            <div class="modal-overlay" id="edit-page-modal">
                <div class="modal-content" style="max-width: 600px;">
                    <h2><i class="fas fa-edit"></i> 编辑页面</h2>
                    
                    <!-- 基本设置 -->
                    <div class="form-section">
                        <h3><i class="fas fa-cog"></i> 基本设置</h3>
                        
                        <div class="form-group">
                            <label>页面标题 *</label>
                            <input type="text" class="form-control" id="edit-page-title" 
                                   value="${this.escapeHtml(page.title || '')}" 
                                   placeholder="请输入页面标题">
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
                                <option value="communion" ${page.type === 'communion' ? 'selected' : ''}>圣餐</option>
                                <option value="birthday" ${page.type === 'birthday' ? 'selected' : ''}>生日祝福</option>
                            </select>
                        </div>
                    </div>
                    
                    <!-- 页面内容编辑区域（根据类型动态显示） -->
                    <div id="page-content-editor">
                        ${this.getContentEditor(page)}
                    </div>
                    
                    <!-- 样式设置 -->
                    <div class="form-section">
                        <h3><i class="fas fa-palette"></i> 显示样式</h3>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>页面背景色</label>
                                <div class="color-input-group">
                                    <input type="color" class="color-picker" id="edit-page-bgcolor" 
                                           value="${page.backgroundColor || '#ffffff'}">
                                    <input type="text" class="color-hex" id="edit-page-bgcolor-hex" 
                                           value="${page.backgroundColor || '#ffffff'}" placeholder="#FFFFFF" maxlength="7">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>文字颜色</label>
                                <div class="color-input-group">
                                    <input type="color" class="color-picker" id="edit-page-textcolor" 
                                           value="${page.textColor || '#000000'}">
                                    <input type="text" class="color-hex" id="edit-page-textcolor-hex" 
                                           value="${page.textColor || '#000000'}" placeholder="#000000" maxlength="7">
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>字体大小</label>
                                <select class="form-control" id="edit-page-fontsize">
                                    <option value="normal" ${page.fontSize === 'normal' ? 'selected' : ''}>正常</option>
                                    <option value="large" ${page.fontSize === 'large' ? 'selected' : ''}>较大</option>
                                    <option value="xlarge" ${page.fontSize === 'xlarge' ? 'selected' : ''}>特大</option>
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
                    
                    <!-- 按钮 -->
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
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }
    
    /**
     * 根据页面类型获取内容编辑器
     */
    getContentEditor(page) {
        switch(page.type) {
            case 'welcome': return this.getWelcomeEditor(page);
            case 'worship': return this.getWorshipEditor(page);
            case 'announcements': return this.getAnnouncementsEditor(page);
            case 'scripture': return this.getScriptureEditor(page);
            case 'message': return this.getMessageEditor(page);
            case 'offering': return this.getOfferingEditor(page);
            case 'closing': return this.getClosingEditor(page);
            case 'prayer': return this.getPrayerEditor(page);
            case 'communion': return this.getCommunionEditor(page);
            case 'birthday': return this.getBirthdayEditor(page);
            default:
                return `<p class="no-special-content">此页面类型无需特殊内容设置</p>`;
        }
    }
    
    /**
     * 欢迎页面编辑器
     */
    getWelcomeEditor(page) {
        const text = page.content?.text || '';
        const subtext = page.content?.subtext || '';
        
        return `
            <div class="form-section">
                <h3><i class="fas fa-handshake"></i> 欢迎内容</h3>
                <div class="form-group">
                    <label>主标题</label>
                    <input type="text" class="form-control" id="edit-welcome-text" value="${this.escapeHtml(text)}" placeholder="欢迎参加今日主日崇拜">
                </div>
                <div class="form-group">
                    <label>副标题</label>
                    <input type="text" class="form-control" id="edit-welcome-subtext" value="${this.escapeHtml(subtext)}" placeholder="在主爱中合一，在圣灵里敬拜">
                </div>
            </div>
        `;
    }
    
    /**
     * 敬拜页面编辑器（保留你的实现）
     */
    getWorshipEditor(page) {
        const songs = page.content?.songs || [];
        
        let songsHtml = '';
        if (songs.length > 0) {
            songsHtml = songs.map((song, index) => `
                <div class="song-edit-item" data-index="${index}">
                    <div class="song-edit-header">
                        <input type="text" class="form-control" value="${this.escapeHtml(song.title)}" 
                               placeholder="歌曲名称" data-field="title">
                        <button class="btn btn-danger btn-sm remove-song" data-index="${index}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    <textarea class="form-control" placeholder="歌词" data-field="lyrics">${this.escapeHtml(song.lyrics || '')}</textarea>
                </div>
            `).join('');
        }
        
        return `
            <div class="form-section">
                <h3><i class="fas fa-music"></i> 歌曲管理</h3>
                <div id="song-edit-list">
                    ${songsHtml}
                </div>
                <button class="btn btn-secondary btn-sm" id="add-song-in-edit">
                    <i class="fas fa-plus"></i> 添加歌曲
                </button>
            </div>
        `;
    }
    
    /**
     * 报告页面编辑器（保留你的实现）
     */
    getAnnouncementsEditor(page) {
        const items = page.content?.items || [];
        
        let itemsHtml = '';
        if (items.length > 0) {
            itemsHtml = items.map((item, index) => `
                <div class="announcement-edit-item" data-index="${index}">
                    <div class="announcement-edit-header">
                        <input type="text" class="form-control" value="${this.escapeHtml(item.title)}" 
                               placeholder="报告标题" data-field="title">
                        <div class="checkbox-group">
                            <input type="checkbox" id="important-${index}" ${item.important ? 'checked' : ''} data-field="important">
                            <label for="important-${index}">重要</label>
                        </div>
                        <button class="btn btn-danger btn-sm remove-announcement" data-index="${index}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    <textarea class="form-control" placeholder="报告内容" data-field="content">${this.escapeHtml(item.content || '')}</textarea>
                </div>
            `).join('');
        }
        
        return `
            <div class="form-section">
                <h3><i class="fas fa-bullhorn"></i> 报告管理</h3>
                <div id="announcement-edit-list">
                    ${itemsHtml}
                </div>
                <button class="btn btn-secondary btn-sm" id="add-announcement-in-edit">
                    <i class="fas fa-plus"></i> 添加报告
                </button>
            </div>
        `;
    }
    
    /**
     * 经文页面编辑器（保留你的实现）
     */
    getScriptureEditor(page) {
        const scripture = page.content?.scripture || { book: '创世记', chapter: 1, verse: 1, text: '' };
        
        return `
            <div class="form-section">
                <h3><i class="fas fa-bible"></i> 经文内容</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label>书卷</label>
                        <input type="text" class="form-control" id="edit-scripture-book" 
                               value="${this.escapeHtml(scripture.book)}" placeholder="如：创世记">
                    </div>
                    <div class="form-group">
                        <label>章节</label>
                        <input type="number" class="form-control" id="edit-scripture-chapter" 
                               value="${scripture.chapter || 1}" min="1">
                    </div>
                    <div class="form-group">
                        <label>节数</label>
                        <input type="number" class="form-control" id="edit-scripture-verse" 
                               value="${scripture.verse || 1}" min="1">
                    </div>
                </div>
                <div class="form-group">
                    <label>经文内容</label>
                    <textarea class="form-control" id="edit-scripture-text" rows="4">${this.escapeHtml(scripture.text || '')}</textarea>
                </div>
            </div>
        `;
    }
    
    /**
     * 信息分享页面编辑器（保留你的实现）
     */
    getMessageEditor(page) {
        const message = page.content?.message || { title: '', speaker: '', outline: '', notes: '' };
        
        return `
            <div class="form-section">
                <h3><i class="fas fa-microphone"></i> 信息内容</h3>
                <div class="form-group">
                    <label>信息标题</label>
                    <input type="text" class="form-control" id="edit-message-title" 
                           value="${this.escapeHtml(message.title)}" placeholder="信息标题">
                </div>
                <div class="form-group">
                    <label>讲员</label>
                    <input type="text" class="form-control" id="edit-message-speaker" 
                           value="${this.escapeHtml(message.speaker)}" placeholder="讲员姓名">
                </div>
                <div class="form-group">
                    <label>大纲</label>
                    <textarea class="form-control" id="edit-message-outline" rows="3">${this.escapeHtml(message.outline || '')}</textarea>
                </div>
                <div class="form-group">
                    <label>讲道笔记</label>
                    <textarea class="form-control" id="edit-message-notes" rows="4">${this.escapeHtml(message.notes || '')}</textarea>
                </div>
            </div>
        `;
    }
    
    /**
     * 奉献页面编辑器
     */
    getOfferingEditor(page) {
        const note = page.content?.note || '';
        return `
            <div class="form-section">
                <h3><i class="fas fa-donate"></i> 奉献说明</h3>
                <textarea class="form-control" id="edit-offering-note" rows="3">${this.escapeHtml(note)}</textarea>
            </div>
        `;
    }
    
    /**
     * 结束祝福页面编辑器
     */
    getClosingEditor(page) {
        const blessing = page.content?.blessing || '';
        return `
            <div class="form-section">
                <h3><i class="fas fa-praying-hands"></i> 结束祝福</h3>
                <textarea class="form-control" id="edit-closing-blessing" rows="3">${this.escapeHtml(blessing)}</textarea>
            </div>
        `;
    }
    
    /**
     * 祷告页面编辑器
     */
    getPrayerEditor(page) {
        const prayer = page.content?.prayer || '';
        return `
            <div class="form-section">
                <h3><i class="fas fa-pray"></i> 祷告内容</h3>
                <textarea class="form-control" id="edit-prayer-text" rows="4">${this.escapeHtml(prayer)}</textarea>
            </div>
        `;
    }
    
    /**
     * 圣餐页面编辑器
     */
    getCommunionEditor(page) {
        const instruction = page.content?.instruction || '';
        return `
            <div class="form-section">
                <h3><i class="fas fa-bread-slice"></i> 圣餐说明</h3>
                <textarea class="form-control" id="edit-communion-instruction" rows="3">${this.escapeHtml(instruction)}</textarea>
            </div>
        `;
    }
    
    /**
     * 生日祝福页面编辑器
     */
    getBirthdayEditor(page) {
        const wishes = page.content?.wishes || '';
        return `
            <div class="form-section">
                <h3><i class="fas fa-birthday-cake"></i> 生日祝福</h3>
                <textarea class="form-control" id="edit-birthday-wishes" rows="3">${this.escapeHtml(wishes)}</textarea>
            </div>
        `;
    }
    
    /**
     * 绑定事件
     */
    bindEvents() {
        // 颜色输入联动
        this.setupColorInput('edit-page-bgcolor', 'edit-page-bgcolor-hex');
        this.setupColorInput('edit-page-textcolor', 'edit-page-textcolor-hex');
        
        // 类型切换时重新加载内容编辑器
        document.getElementById('edit-page-type').addEventListener('change', (e) => {
            this.currentPage.type = e.target.value;
            this.updateContentEditor();
        });
        
        // 动态内容编辑
        this.bindContentEvents();
        
        // 保存
        document.getElementById('save-edit').addEventListener('click', () => this.save());
        
        // 取消
        document.getElementById('cancel-edit').addEventListener('click', () => this.close());
        
        // 点击背景关闭
        document.getElementById('edit-page-modal').addEventListener('click', (e) => {
            if (e.target.id === 'edit-page-modal') this.close();
        });
        
        // ESC键关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.close();
        });
    }
    
    /**
     * 绑定内容相关事件
     */
    bindContentEvents() {
        // 歌曲编辑事件
        document.getElementById('add-song-in-edit')?.addEventListener('click', () => {
            this.addSongItem();
        });
        
        // 报告编辑事件
        document.getElementById('add-announcement-in-edit')?.addEventListener('click', () => {
            this.addAnnouncementItem();
        });
        
        // 删除歌曲
        document.querySelectorAll('.remove-song').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.closest('.remove-song').dataset.index);
                this.removeSongItem(index);
            });
        });
        
        // 删除报告
        document.querySelectorAll('.remove-announcement').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.closest('.remove-announcement').dataset.index);
                this.removeAnnouncementItem(index);
            });
        });
    }
    
    /**
     * 更新内容编辑器
     */
    updateContentEditor() {
        const editorContainer = document.getElementById('page-content-editor');
        editorContainer.innerHTML = this.getContentEditor(this.currentPage);
        this.bindContentEvents();
    }
    
    /**
     * 添加歌曲项
     */
    addSongItem() {
        if (!this.currentPage.content) this.currentPage.content = {};
        if (!this.currentPage.content.songs) this.currentPage.content.songs = [];
        
        this.currentPage.content.songs.push({
            title: '新歌曲',
            lyrics: '',
            key: 'C',
            tempo: '中板'
        });
        
        this.updateContentEditor();
    }
    
    /**
     * 添加报告项
     */
    addAnnouncementItem() {
        if (!this.currentPage.content) this.currentPage.content = {};
        if (!this.currentPage.content.items) this.currentPage.content.items = [];
        
        this.currentPage.content.items.push({
            title: '新报告',
            content: '',
            important: false
        });
        
        this.updateContentEditor();
    }
    
    /**
     * 移除歌曲项
     */
    removeSongItem(index) {
        if (this.currentPage.content?.songs) {
            this.currentPage.content.songs.splice(index, 1);
            this.updateContentEditor();
        }
    }
    
    /**
     * 移除报告项
     */
    removeAnnouncementItem(index) {
        if (this.currentPage.content?.items) {
            this.currentPage.content.items.splice(index, 1);
            this.updateContentEditor();
        }
    }
    
    /**
     * 保存编辑
     */
    save() {
        const title = document.getElementById('edit-page-title').value.trim();
        if (!title) {
            alert('请输入页面标题');
            document.getElementById('edit-page-title').focus();
            return;
        }
        
        // 更新页面基本属性
        this.currentPage.title = title;
        this.currentPage.type = document.getElementById('edit-page-type').value;
        this.currentPage.backgroundColor = document.getElementById('edit-page-bgcolor').value;
        this.currentPage.textColor = document.getElementById('edit-page-textcolor').value;
        this.currentPage.fontSize = document.getElementById('edit-page-fontsize').value;
        this.currentPage.align = document.getElementById('edit-page-align').value;
        this.currentPage.showTitle = document.getElementById('edit-page-showtitle').checked;
        
        // 更新内容数据
        this.saveContentData();
        
        // 更新主界面
        this.configManager.initializePageList();
        this.configManager.markDirty();
        this.configManager.showSuccess(`页面"${title}"已更新`);
        
        this.close();
    }
    
    /**
     * 保存内容数据（补齐所有类型）
     */
    saveContentData() {
        switch(this.currentPage.type) {
            case 'welcome': this.saveWelcomeData(); break;
            case 'worship': this.saveSongsData(); break;
            case 'announcements': this.saveAnnouncementsData(); break;
            case 'scripture': this.saveScriptureData(); break;
            case 'message': this.saveMessageData(); break;
            case 'offering': this.saveOfferingData(); break;
            case 'closing': this.saveClosingData(); break;
            case 'prayer': this.savePrayerData(); break;
            case 'communion': this.saveCommunionData(); break;
            case 'birthday': this.saveBirthdayData(); break;
        }
    }
    
    /**
     * 保存欢迎内容
     */
    saveWelcomeData() {
        if (!this.currentPage.content) this.currentPage.content = {};
        this.currentPage.content.text = document.getElementById('edit-welcome-text')?.value || '';
        this.currentPage.content.subtext = document.getElementById('edit-welcome-subtext')?.value || '';
    }
    
    /**
     * 保存歌曲数据（保留你的实现）
     */
    saveSongsData() {
        if (!this.currentPage.content) this.currentPage.content = {};
        
        const songItems = document.querySelectorAll('.song-edit-item');
        this.currentPage.content.songs = Array.from(songItems).map(item => ({
            title: item.querySelector('[data-field="title"]').value,
            lyrics: item.querySelector('[data-field="lyrics"]').value,
            key: 'C', // 可扩展独立输入
            tempo: '中板'
        }));
    }
    
    /**
     * 保存报告数据（保留你的实现）
     */
    saveAnnouncementsData() {
        if (!this.currentPage.content) this.currentPage.content = {};
        
        const announcementItems = document.querySelectorAll('.announcement-edit-item');
        this.currentPage.content.items = Array.from(announcementItems).map(item => ({
            title: item.querySelector('[data-field="title"]').value,
            content: item.querySelector('[data-field="content"]').value,
            important: item.querySelector('[data-field="important"]').checked
        }));
    }
    
    /**
     * 保存经文数据（保留你的实现）
     */
    saveScriptureData() {
        if (!this.currentPage.content) this.currentPage.content = {};
        
        this.currentPage.content.scripture = {
            book: document.getElementById('edit-scripture-book').value,
            chapter: parseInt(document.getElementById('edit-scripture-chapter').value) || 1,
            verse: parseInt(document.getElementById('edit-scripture-verse').value) || 1,
            text: document.getElementById('edit-scripture-text').value
        };
    }
    
    /**
     * 保存信息数据（保留你的实现）
     */
    saveMessageData() {
        if (!this.currentPage.content) this.currentPage.content = {};
        
        this.currentPage.content.message = {
            title: document.getElementById('edit-message-title').value,
            speaker: document.getElementById('edit-message-speaker').value,
            outline: document.getElementById('edit-message-outline').value,
            notes: document.getElementById('edit-message-notes').value
        };
    }
    
    /**
     * 保存奉献数据
     */
    saveOfferingData() {
        if (!this.currentPage.content) this.currentPage.content = {};
        this.currentPage.content.note = document.getElementById('edit-offering-note')?.value || '';
    }
    
    /**
     * 保存结束祝福数据
     */
    saveClosingData() {
        if (!this.currentPage.content) this.currentPage.content = {};
        this.currentPage.content.blessing = document.getElementById('edit-closing-blessing')?.value || '';
    }
    
    /**
     * 保存祷告数据
     */
    savePrayerData() {
        if (!this.currentPage.content) this.currentPage.content = {};
        this.currentPage.content.prayer = document.getElementById('edit-prayer-text')?.value || '';
    }
    
    /**
     * 保存圣餐数据
     */
    saveCommunionData() {
        if (!this.currentPage.content) this.currentPage.content = {};
        this.currentPage.content.instruction = document.getElementById('edit-communion-instruction')?.value || '';
    }
    
    /**
     * 保存生日祝福数据
     */
    saveBirthdayData() {
        if (!this.currentPage.content) this.currentPage.content = {};
        this.currentPage.content.wishes = document.getElementById('edit-birthday-wishes')?.value || '';
    }
    
    /**
     * 关闭对话框
     */
    close() {
        const modal = document.getElementById('edit-page-modal');
        if (modal) modal.remove();
        this.currentPage = null;
    }
    
    /**
     * 颜色输入联动
     */
    setupColorInput(colorId, hexId) {
        const colorPicker = document.getElementById(colorId);
        const hexInput = document.getElementById(hexId);
        
        if (!colorPicker || !hexInput) return;
        
        colorPicker.addEventListener('input', () => {
            hexInput.value = colorPicker.value.toUpperCase();
        });
        
        hexInput.addEventListener('input', () => {
            let value = hexInput.value;
            if (value && !value.startsWith('#')) value = '#' + value;
            if (/^#[0-9A-F]{6}$/i.test(value)) {
                colorPicker.value = value;
            }
        });
    }
    
    /**
     * HTML转义
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text ?? '';
        return div.innerHTML;
    }
}
