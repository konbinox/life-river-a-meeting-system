/**
 * 配置管理器
 * 负责配置界面的所有交互逻辑
 */

class ConfigManager {
    constructor() {
        this.currentData = null;
        this.isDirty = false;
        console.log('ConfigManager 已创建');
    }
    
    async initialize() {
        console.log('初始化配置管理器...');
        try {
            await this.loadData();
            this.initializeUI();
            this.bindEvents();
            console.log('配置管理器初始化完成');
        } catch (error) {
            console.error('初始化失败:', error);
            this.showError('初始化失败: ' + error.message);
        }
    }
    
    async loadData() {
        const saved = localStorage.getItem('churchMeetingConfig');
        if (saved) {
            this.currentData = JSON.parse(saved);
        } else {
            this.currentData = this.getDefaultData();
        }
    }
    
    getDefaultData() {
        return {
            pages: [
                { id: 'page1', title: '欢迎页', type: 'welcome', enabled: true, order: 1 },
                { id: 'page2', title: '敬拜赞美', type: 'worship', enabled: true, order: 2 },
                { id: 'page3', title: '家事报告', type: 'announcements', enabled: true, order: 3 }
            ]
        };
    }
    
    initializeUI() {
        this.initializePageList();
    }
    
    initializePageList() {
        const container = document.getElementById('page-list');
        if (!container) {
            console.error('找不到页面列表容器');
            return;
        }
        
        container.innerHTML = '';
        
        const pages = this.currentData.pages || [];
        if (pages.length === 0) {
            container.innerHTML = '<p class="no-items">暂无页面</p>';
            return;
        }
        
        pages.forEach(page => {
            const item = document.createElement('div');
            item.className = 'page-item';
            item.innerHTML = `
                <div class="page-info">
                    <input type="checkbox" id="check-${page.id}" ${page.enabled ? 'checked' : ''}>
                    <label for="check-${page.id}">${page.title}</label>
                    <span>${page.type}</span>
                </div>
                <div class="page-controls">
                    <button class="btn edit-btn" data-id="${page.id}">编辑</button>
                </div>
            `;
            
            const editBtn = item.querySelector('.edit-btn');
            // 使用最简单的 onclick 绑定
            editBtn.onclick = (e) => {
                e.stopPropagation();
                const pageId = editBtn.getAttribute('data-id');
                console.log('点击编辑按钮:', pageId);
                this.editPage(pageId);
            };
            
            container.appendChild(item);
        });
    }
    
    editPage(pageId) {
        console.log('=== editPage 开始 ===');
        console.log('编辑页面ID:', pageId);
        
        const page = this.currentData.pages.find(p => p.id === pageId);
        if (!page) {
            console.error('找不到页面');
            return;
        }
        
        console.log('页面信息:', page);
        
        // 移除可能存在的旧模态框
        const oldModal = document.getElementById('edit-modal');
        if (oldModal) oldModal.remove();
        
        // 创建模态框
        const modal = document.createElement('div');
        modal.id = 'edit-modal';
        
        // 设置样式 - 内联避免CSS影响
        Object.assign(modal.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: '10000'
        });
        
        // 内容区域
        const content = document.createElement('div');
        Object.assign(content.style, {
            backgroundColor: 'white',
            padding: '25px',
            borderRadius: '10px',
            width: '450px',
            maxWidth: '90%',
            boxShadow: '0 5px 30px rgba(0,0,0,0.3)'
        });
        
        content.innerHTML = `
            <h2 style="margin-top:0; color:#2c3e50; border-bottom:2px solid #eee; padding-bottom:10px;">
                <span style="color:#e74c3c;">✏️</span> 编辑页面
            </h2>
            
            <div style="margin:20px 0;">
                <div style="margin-bottom:15px;">
                    <label style="display:block; margin-bottom:5px; font-weight:bold; color:#34495e;">
                        页面标题
                    </label>
                    <input type="text" 
                           id="edit-title" 
                           value="${this.escapeHtml(page.title)}"
                           style="width:100%; padding:10px; border:2px solid #3498db; border-radius:5px; font-size:16px;">
                </div>
                
                <div style="margin-bottom:15px;">
                    <label style="display:block; margin-bottom:5px; font-weight:bold; color:#34495e;">
                        页面类型
                    </label>
                    <select id="edit-type" style="width:100%; padding:10px; border:2px solid #3498db; border-radius:5px; font-size:16px;">
                        <option value="welcome" ${page.type === 'welcome' ? 'selected' : ''}>欢迎页</option>
                        <option value="worship" ${page.type === 'worship' ? 'selected' : ''}>敬拜赞美</option>
                        <option value="announcements" ${page.type === 'announcements' ? 'selected' : ''}>家事报告</option>
                    </select>
                </div>
                
                <div style="background:#f8f9fa; padding:15px; border-radius:8px; margin:20px 0;">
                    <h3 style="margin-top:0; color:#9b59b6;">🎨 页面样式</h3>
                    
                    <div style="display:flex; gap:15px; margin-bottom:15px;">
                        <div style="flex:1;">
                            <label style="display:block; margin-bottom:5px; color:#555;">背景色</label>
                            <input type="color" id="edit-bgcolor" value="${page.backgroundColor || '#ffffff'}"
                                   style="width:100%; height:40px; cursor:pointer;">
                        </div>
                        <div style="flex:1;">
                            <label style="display:block; margin-bottom:5px; color:#555;">文字色</label>
                            <input type="color" id="edit-textcolor" value="${page.textColor || '#000000'}"
                                   style="width:100%; height:40px; cursor:pointer;">
                        </div>
                    </div>
                </div>
            </div>
            
            <div style="display:flex; gap:10px; justify-content:flex-end; padding-top:20px; border-top:1px solid #eee;">
                <button id="edit-cancel" 
                        style="padding:10px 20px; background:#95a5a6; color:white; border:none; border-radius:5px; cursor:pointer; font-size:14px;">
                    取消
                </button>
                <button id="edit-save" 
                        style="padding:10px 20px; background:#27ae60; color:white; border:none; border-radius:5px; cursor:pointer; font-size:14px; font-weight:bold;">
                    保存设置
                </button>
            </div>
            
            <div id="debug-area" style="margin-top:15px; padding:10px; background:#f1f1f1; border-radius:5px; font-family:monospace; font-size:12px;">
                状态: 等待操作...
            </div>
        `;
        
        modal.appendChild(content);
        document.body.appendChild(modal);
        console.log('模态框已添加到页面');
        
        // === 事件绑定 ===
        const debugArea = document.getElementById('debug-area');
        
        // 取消按钮 - 直接onclick
        document.getElementById('edit-cancel').onclick = function() {
            console.log('取消按钮被点击');
            debugArea.innerHTML = '取消按钮被点击 - ' + new Date().toLocaleTimeString();
            modal.remove();
        };
        
        // 保存按钮 - 直接onclick
        document.getElementById('edit-save').onclick = () => {
            console.log('保存按钮被点击');
            debugArea.innerHTML = '保存按钮被点击 - ' + new Date().toLocaleTimeString();
            
            const titleInput = document.getElementById('edit-title');
            const title = titleInput.value.trim();
            
            if (!title) {
                debugArea.innerHTML += '<br>错误: 标题不能为空';
                alert('请输入页面标题');
                titleInput.focus();
                return;
            }
            
            // 更新数据
            page.title = title;
            page.type = document.getElementById('edit-type').value;
            page.backgroundColor = document.getElementById('edit-bgcolor').value;
            page.textColor = document.getElementById('edit-textcolor').value;
            
            // 更新UI
            this.initializePageList();
            this.isDirty = true;
            
            debugArea.innerHTML += `<br>成功: 已更新页面 "${title}"`;
            
            // 延迟关闭，显示成功信息
            setTimeout(() => {
                modal.remove();
                this.showSuccess(`页面 "${title}" 已更新`);
            }, 1000);
        };
        
        // 模态框点击关闭
        modal.onclick = (e) => {
            if (e.target === modal) {
                console.log('点击背景关闭');
                modal.remove();
            }
        };
        
        // ESC键关闭
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                console.log('ESC键关闭');
                modal.remove();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
        
        // 移除时清理事件
        modal.addEventListener('remove', () => {
            document.removeEventListener('keydown', escHandler);
        });
        
        // 聚焦到标题输入框
        setTimeout(() => {
            const titleInput = document.getElementById('edit-title');
            if (titleInput) {
                titleInput.focus();
                titleInput.select();
                console.log('标题输入框已聚焦');
            }
        }, 50);
        
        console.log('=== editPage 结束 ===');
    }
    
    // 辅助方法
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    showSuccess(message) {
        alert('✅ ' + message);
    }
    
    showError(message) {
        alert('❌ ' + message);
    }
    
    bindEvents() {
        // 可以在这里添加其他事件绑定
    }
}