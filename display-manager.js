/**
 * 显示管理器
 * 负责页面渲染和动画效果
 */

class DisplayManager {
    constructor() {
        this.transitionDuration = 300;
        this.animationType = 'fade';
    }
    
    renderPage(pageData) {
        // 这里可以添加更复杂的渲染逻辑
        // 目前由app.js直接处理
        console.log('渲染页面:', pageData.title);
    }
    
    animateTransition(fromPage, toPage, direction = 'next') {
        const contentContainer = document.querySelector('.page-content');
        
        // 添加过渡动画类
        contentContainer.classList.add(`transition-${this.animationType}`);
        
        // 设置动画方向
        contentContainer.style.animationDirection = direction === 'next' ? 'normal' : 'reverse';
        
        // 动画结束后移除类
        setTimeout(() => {
            contentContainer.classList.remove(`transition-${this.animationType}`);
        }, this.transitionDuration);
    }
    
    updateDisplaySettings(settings) {
        if (settings.theme) {
            this.setTheme(settings.theme);
        }
        
        if (settings.fontSize) {
            this.setFontSize(settings.fontSize);
        }
    }
    
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        
        // 这里可以添加主题切换的具体样式
        switch(theme) {
            case 'dark':
                document.body.style.backgroundColor = '#1a1a1a';
                document.body.style.color = '#ffffff';
                break;
            case 'light':
            default:
                document.body.style.backgroundColor = '#f5f5f5';
                document.body.style.color = '#333333';
        }
    }
    
    setFontSize(size) {
        const sizes = {
            'small': '12px',
            'medium': '16px',
            'large': '20px',
            'xlarge': '24px'
        };
        
        document.documentElement.style.fontSize = sizes[size] || sizes.medium;
    }
}

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
    .transition-fade {
        animation: fadeInOut ${this.transitionDuration}ms ease;
    }
    
    .transition-slide {
        animation: slideInOut ${this.transitionDuration}ms ease;
    }
    
    @keyframes fadeInOut {
        0% { opacity: 0; }
        100% { opacity: 1; }
    }
    
    @keyframes slideInOut {
        0% { transform: translateX(100%); }
        100% { transform: translateX(0); }
    }
`;
document.head.appendChild(style);

// 创建显示管理器实例
const displayManager = new DisplayManager();
window.displayManager = displayManager;