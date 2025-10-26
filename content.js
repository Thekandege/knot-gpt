// Knot GPT - Stable Version with Link Icon
console.log("Knot GPT loaded");

class KnotGPT {
    constructor() {
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.init();
    }

    init() {
        this.createFloatingIcon();
        this.createSidebar();
        this.loadMemories();
        this.startCaptureInterval();
        this.setupDragBehavior();
    }

    createFloatingIcon() {
        if (document.getElementById('knot-floating-icon')) return;
        
        const icon = document.createElement('div');
        icon.id = 'knot-floating-icon';
        icon.innerHTML = '🔗'; // Link icon instead of K
        icon.title = 'Knot GPT - Click to open sidebar';
        
        // INLINE STYLES as backup
        icon.style.position = 'fixed';
        icon.style.right = '20px';
        icon.style.top = '50%';
        icon.style.transform = 'translateY(-50%)';
        icon.style.width = '44px';
        icon.style.height = '44px';
        icon.style.background = '#1a1a1a';
        icon.style.border = '1px solid #333';
        icon.style.borderRadius = '8px';
        icon.style.cursor = 'grab';
        icon.style.zIndex = '10000';
        icon.style.display = 'flex';
        icon.style.alignItems = 'center';
        icon.style.justifyContent = 'center';
        icon.style.fontSize = '20px';
        icon.style.color = 'white';
        icon.style.opacity = '0.9';
        icon.style.transition = 'opacity 0.2s, background 0.2s';
        icon.style.userSelect = 'none';
        icon.style.fontFamily = 'Arial, sans-serif';
        
        // Hover effect
        icon.addEventListener('mouseenter', () => {
            icon.style.opacity = '1';
            icon.style.background = '#2a2a2a';
        });
        icon.addEventListener('mouseleave', () => {
            icon.style.opacity = '0.9';
            icon.style.background = '#1a1a1a';
        });
        
        document.body.appendChild(icon);
        console.log("✅ Floating icon created with link symbol");
    }

    createSidebar() {
        if (document.getElementById('knot-sidebar')) return;
        
        const sidebar = document.createElement('div');
        sidebar.id = 'knot-sidebar';
        sidebar.className = 'collapsed';
        
        // INLINE STYLES for sidebar
        sidebar.style.position = 'fixed';
        sidebar.style.right = '0';
        sidebar.style.top = '50%';
        sidebar.style.transform = 'translateY(-50%)';
        sidebar.style.width = '300px';
        sidebar.style.height = '80vh';
        sidebar.style.background = '#1a1a1a';
        sidebar.style.border = '1px solid #333';
        sidebar.style.borderLeft = 'none';
        sidebar.style.borderRadius = '12px 0 0 12px';
        sidebar.style.zIndex = '9999';
        sidebar.style.display = 'flex';
        sidebar.style.flexDirection = 'column';
        sidebar.style.transition = 'transform 0.3s ease';
        sidebar.style.boxShadow = '-4px 0 20px rgba(0, 0, 0, 0.3)';
        sidebar.style.fontFamily = 'Arial, sans-serif';
        sidebar.style.color = '#e0e0e0';
        
        sidebar.innerHTML = `
            <div style="padding: 16px; border-bottom: 1px solid #333; background: #0d0d0d; border-radius: 12px 0 0 0; display: flex; justify-content: space-between; align-items: center;">
                <div style="font-weight: 600; color: #e0e0e0; font-size: 14px;">Knot GPT</div>
                <button class="knot-collapse-btn" title="Collapse" style="background: none; border: none; color: #888; cursor: pointer; padding: 4px; border-radius: 4px; font-size: 18px;">×</button>
            </div>
            <div style="padding: 12px 16px; border-bottom: 1px solid #333;">
                <input type="text" id="knot-search" placeholder="Search conversations..." style="width: 100%; padding: 8px 12px; background: #0d0d0d; border: 1px solid #333; border-radius: 6px; color: #e0e0e0; font-size: 13px;">
            </div>
            <div class="knot-results" style="flex: 1; overflow-y: auto; padding: 8px;">
                <div style="color: #888; text-align: center; padding: 20px; font-size: 13px;">No memories yet. Start chatting!</div>
            </div>
        `;
        
        document.body.appendChild(sidebar);
        
        // Event listeners
        document.getElementById('knot-search').addEventListener('input', (e) => {
            this.searchMemories(e.target.value);
        });
        
        document.querySelector('.knot-collapse-btn').addEventListener('click', () => {
            this.toggleSidebar();
        });
        
        document.getElementById('knot-floating-icon').addEventListener('click', () => {
            this.toggleSidebar();
        });
    }

    setupDragBehavior() {
        const icon = document.getElementById('knot-floating-icon');
        
        icon.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.dragOffset.x = e.clientX - icon.getBoundingClientRect().left;
            this.dragOffset.y = e.clientY - icon.getBoundingClientRect().top;
            icon.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            
            icon.style.right = 'auto';
            icon.style.left = (e.clientX - this.dragOffset.x) + 'px';
            icon.style.top = (e.clientY - this.dragOffset.y) + 'px';
        });

        document.addEventListener('mouseup', () => {
            if (!this.isDragging) return;
            
            this.isDragging = false;
            icon.style.cursor = 'grab';
            
            // Snap to right edge if close
            const rect = icon.getBoundingClientRect();
            if (rect.right > window.innerWidth - 100) {
                icon.style.left = 'auto';
                icon.style.right = '20px';
            }
        });
    }

    toggleSidebar() {
        const sidebar = document.getElementById('knot-sidebar');
        if (sidebar.classList.contains('collapsed')) {
            sidebar.classList.remove('collapsed');
            sidebar.style.transform = 'translateY(-50%)';
        } else {
            sidebar.classList.add('collapsed');
            sidebar.style.transform = 'translateX(100%) translateY(-50%)';
        }
    }

    searchMemories(query) {
        chrome.storage.local.get(['knotMemories'], (result) => {
            const memories = result.knotMemories || [];
            const resultsContainer = document.querySelector('.knot-results');
            
            if (!query.trim()) {
                this.displayMemories(memories.slice(0, 10), resultsContainer, query);
                return;
            }
            
            const filtered = memories.filter(memory =>
                memory.text.toLowerCase().includes(query.toLowerCase())
            ).slice(0, 10);
            
            this.displayMemories(filtered, resultsContainer, query);
        });
    }

    displayMemories(memories, container, query) {
        if (memories.length === 0) {
            container.innerHTML = '<div style="color: #888; text-align: center; padding: 20px; font-size: 13px;">No memories found</div>';
            return;
        }
        
        container.innerHTML = memories.map(memory => `
            <div class="knot-memory-item" data-memory-id="${memory.id}" style="background: #0d0d0d; border: 1px solid #333; border-radius: 6px; padding: 8px 10px; margin-bottom: 8px; cursor: pointer; transition: background 0.2s; font-size: 13px; line-height: 1.4;">
                <div class="knot-memory-text" style="color: #e0e0e0; margin-bottom: 4px;">${this.truncateText(memory.text, 120, query)}</div>
                <div class="knot-memory-date" style="color: #888; font-size: 11px;">${new Date(memory.timestamp).toLocaleDateString()}</div>
            </div>
        `).join('');
        
        // Add click listeners
        container.querySelectorAll('.knot-memory-item').forEach(item => {
            item.addEventListener('click', () => {
                const memoryId = item.getAttribute('data-memory-id');
                this.copyMemoryToClipboard(memoryId);
                
                // Visual feedback
                item.style.borderColor = '#10b981';
                setTimeout(() => {
                    item.style.borderColor = '';
                }, 1000);
            });
            
            // Hover effects
            item.addEventListener('mouseenter', () => {
                item.style.background = '#2a2a2a';
                item.style.borderColor = '#6366f1';
            });
            item.addEventListener('mouseleave', () => {
                item.style.background = '#0d0d0d';
                item.style.borderColor = '#333';
            });
        });
    }

    truncateText(text, length, searchTerm = '') {
        if (searchTerm && searchTerm.trim() !== '') {
            const lowerText = text.toLowerCase();
            const lowerTerm = searchTerm.toLowerCase();
            const termIndex = lowerText.indexOf(lowerTerm);
            
            if (termIndex !== -1) {
                const start = Math.max(0, termIndex - 40);
                const end = Math.min(text.length, termIndex + searchTerm.length + 80);
                let excerpt = text.substring(start, end);
                
                if (start > 0) excerpt = '...' + excerpt;
                if (end < text.length) excerpt = excerpt + '...';
                
                return excerpt;
            }
        }
        
        return text.length > length ? text.substring(0, length) + '...' : text;
    }

    copyMemoryToClipboard(memoryId) {
        chrome.storage.local.get(['knotMemories'], (result) => {
            const memories = result.knotMemories || [];
            const memory = memories.find(m => m.id === memoryId);
            
            if (memory) {
                navigator.clipboard.writeText(memory.text).then(() => {
                    console.log("📋 Copied memory to clipboard");
                });
            }
        });
    }

    captureConversations() {
        const selectors = [
            '[data-testid^="conversation-turn"]',
            '[class*="message"]',
            '.message',
            'main div',
            '.flex-1 > div'
        ];
        
        let chatElements = [];
        
        for (let selector of selectors) {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 2) {
                chatElements = elements;
                break;
            }
        }
        
        chatElements.forEach((element, index) => {
            const text = element.innerText || element.textContent;
            if (text && text.length > 20 && 
                !text.includes('Stop generating') &&
                !text.includes('Regenerate')) {
                
                this.saveMemory({
                    id: `${window.location.href}-${index}-${Date.now()}`,
                    text: text.trim(),
                    timestamp: Date.now(),
                    url: window.location.href
                });
            }
        });
    }

    saveMemory(memory) {
        chrome.storage.local.get(['knotMemories'], (result) => {
            const memories = result.knotMemories || [];
            
            // Simple duplicate check
            const isDuplicate = memories.some(m => m.text === memory.text);
            
            if (!isDuplicate) {
                memories.push(memory);
                const trimmedMemories = memories.slice(-500);
                chrome.storage.local.set({ knotMemories: trimmedMemories });
            }
        });
    }

    loadMemories() {
        chrome.storage.local.get(['knotMemories'], (result) => {
            console.log(`📚 Loaded ${result.knotMemories ? result.knotMemories.length : 0} memories`);
        });
    }

    startCaptureInterval() {
        setInterval(() => {
            this.captureConversations();
        }, 5000);
    }
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new KnotGPT();
    });
} else {
    new KnotGPT();
}