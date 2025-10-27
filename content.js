// Knot GPT v2 - All Platforms + Fixed Copy
console.log("Knot GPT v2 loaded");

class KnotGPT {
    constructor() {
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.currentView = 'list'; // 'list' or 'expanded'
        this.expandedMemory = null;
        this.theme = 'dark'; // 'dark' or 'light'
        this.init();
    }

    init() {
        this.loadSettings();
        this.createFloatingIcon();
        this.createSidebar();
        this.loadMemories();
        this.startCaptureInterval();
        this.setupDragBehavior();
        this.applyTheme();
    }

    loadSettings() {
        chrome.storage.local.get(['knotSettings'], (result) => {
            if (result.knotSettings) {
                this.theme = result.knotSettings.theme || 'dark';
            }
        });
    }

    saveSettings() {
        chrome.storage.local.set({
            knotSettings: {
                theme: this.theme
            }
        });
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
    }

    createFloatingIcon() {
        if (document.getElementById('knot-floating-icon')) return;
        
        const icon = document.createElement('div');
        icon.id = 'knot-floating-icon';
        icon.innerHTML = '🔗';
        icon.title = 'Knot GPT - Click to open sidebar';
        
        // INLINE STYLES as backup
        icon.style.position = 'fixed';
        icon.style.right = '20px';
        icon.style.top = '50%';
        icon.style.transform = 'translateY(-50%)';
        icon.style.width = '44px';
        icon.style.height = '44px';
        icon.style.background = this.theme === 'dark' ? '#1a1a1a' : '#ffffff';
        icon.style.border = this.theme === 'dark' ? '1px solid #333' : '1px solid #ddd';
        icon.style.borderRadius = '8px';
        icon.style.cursor = 'grab';
        icon.style.zIndex = '10000';
        icon.style.display = 'flex';
        icon.style.alignItems = 'center';
        icon.style.justifyContent = 'center';
        icon.style.fontSize = '20px';
        icon.style.color = this.theme === 'dark' ? 'white' : '#333';
        icon.style.opacity = '0.9';
        icon.style.transition = 'opacity 0.2s, background 0.2s';
        icon.style.userSelect = 'none';
        icon.style.fontFamily = 'Arial, sans-serif';
        
        // Hover effect
        icon.addEventListener('mouseenter', () => {
            icon.style.opacity = '1';
            icon.style.background = this.theme === 'dark' ? '#2a2a2a' : '#f5f5f5';
        });
        icon.addEventListener('mouseleave', () => {
            icon.style.opacity = '0.9';
            icon.style.background = this.theme === 'dark' ? '#1a1a1a' : '#ffffff';
        });
        
        document.body.appendChild(icon);
        console.log("✅ Floating icon created");
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
        sidebar.style.background = this.theme === 'dark' ? '#1a1a1a' : '#ffffff';
        sidebar.style.border = this.theme === 'dark' ? '1px solid #333' : '1px solid #ddd';
        sidebar.style.borderLeft = 'none';
        sidebar.style.borderRadius = '12px 0 0 12px';
        sidebar.style.zIndex = '9999';
        sidebar.style.display = 'flex';
        sidebar.style.flexDirection = 'column';
        sidebar.style.transition = 'transform 0.3s ease';
        sidebar.style.boxShadow = this.theme === 'dark' ? '-4px 0 20px rgba(0, 0, 0, 0.3)' : '-4px 0 20px rgba(0, 0, 0, 0.1)';
        sidebar.style.fontFamily = 'Arial, sans-serif';
        sidebar.style.color = this.theme === 'dark' ? '#e0e0e0' : '#333333';
        
        sidebar.innerHTML = `
            <div style="padding: 16px; border-bottom: 1px solid ${this.theme === 'dark' ? '#333' : '#ddd'}; background: ${this.theme === 'dark' ? '#0d0d0d' : '#f8f9fa'}; border-radius: 12px 0 0 0; display: flex; justify-content: space-between; align-items: center;">
                <div style="font-weight: 600; color: ${this.theme === 'dark' ? '#e0e0e0' : '#333'}; font-size: 14px;">Knot GPT</div>
                <div style="display: flex; gap: 8px;">
                    <button class="knot-theme-toggle" title="Toggle theme" style="background: none; border: none; color: ${this.theme === 'dark' ? '#888' : '#666'}; cursor: pointer; padding: 4px; border-radius: 4px; font-size: 14px;">🌓</button>
                    <button class="knot-collapse-btn" title="Collapse" style="background: none; border: none; color: ${this.theme === 'dark' ? '#888' : '#666'}; cursor: pointer; padding: 4px; border-radius: 4px; font-size: 18px;">×</button>
                </div>
            </div>
            <div style="padding: 12px 16px; border-bottom: 1px solid ${this.theme === 'dark' ? '#333' : '#ddd'};">
                <input type="text" id="knot-search" placeholder="Search conversations..." style="width: 100%; padding: 8px 12px; background: ${this.theme === 'dark' ? '#0d0d0d' : '#f8f9fa'}; border: 1px solid ${this.theme === 'dark' ? '#333' : '#ddd'}; border-radius: 6px; color: ${this.theme === 'dark' ? '#e0e0e0' : '#333'}; font-size: 13px;">
            </div>
            <div class="knot-results" style="flex: 1; overflow: hidden; display: flex; flex-direction: column;">
                <div class="knot-list-view" style="flex: 1; overflow-y: auto; padding: 8px;">
                    <div style="color: ${this.theme === 'dark' ? '#888' : '#666'}; text-align: center; padding: 20px; font-size: 13px;">No memories yet. Start chatting!</div>
                </div>
                <div class="knot-expanded-view" style="display: none; flex: 1; flex-direction: column; height: 100%;">
                    <!-- Expanded content will be inserted here -->
                </div>
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
        
        document.querySelector('.knot-theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });
        
        document.getElementById('knot-floating-icon').addEventListener('click', () => {
            this.toggleSidebar();
        });
    }

    toggleTheme() {
        this.theme = this.theme === 'dark' ? 'light' : 'dark';
        this.applyTheme();
        this.saveSettings();
        this.refreshUI();
    }

    refreshUI() {
        // Update sidebar styles
        const sidebar = document.getElementById('knot-sidebar');
        if (sidebar) {
            sidebar.style.background = this.theme === 'dark' ? '#1a1a1a' : '#ffffff';
            sidebar.style.border = this.theme === 'dark' ? '1px solid #333' : '1px solid #ddd';
            sidebar.style.color = this.theme === 'dark' ? '#e0e0e0' : '#333333';
            sidebar.style.boxShadow = this.theme === 'dark' ? '-4px 0 20px rgba(0, 0, 0, 0.3)' : '-4px 0 20px rgba(0, 0, 0, 0.1)';
        }

        // Update floating icon
        const icon = document.getElementById('knot-floating-icon');
        if (icon) {
            icon.style.background = this.theme === 'dark' ? '#1a1a1a' : '#ffffff';
            icon.style.border = this.theme === 'dark' ? '1px solid #333' : '1px solid #ddd';
            icon.style.color = this.theme === 'dark' ? 'white' : '#333';
        }

        // Refresh current view
        this.renderCurrentView();
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

    getPlatformName() {
        const hostname = window.location.hostname;
        const url = window.location.href;
        
        if (hostname.includes('chatgpt.com') || hostname.includes('chat.openai.com')) {
            return 'ChatGPT';
        } else if (hostname.includes('deepseek.com')) {
            return 'DeepSeek';
        } else if (hostname.includes('x.com') && url.includes('/grok')) {
            return 'Grok';
        } else if (hostname.includes('grok.com')) {
            return 'Grok';
        } else if (hostname.includes('claude.ai')) {
            return 'Claude';
        } else if (hostname.includes('gemini.google.com')) {
            return 'Gemini';
        } else {
            return 'Unknown';
        }
    }

    searchMemories(query) {
        chrome.storage.local.get(['knotMemories'], (result) => {
            const memories = result.knotMemories || [];
            const filtered = query.trim() ? 
                memories.filter(memory => memory.text.toLowerCase().includes(query.toLowerCase())) : 
                memories;
            
            const deduplicated = this.deduplicateMemories(filtered).slice(0, 7); // Limit to 7 results
            this.displayMemories(deduplicated, query);
        });
    }

    deduplicateMemories(memories) {
        const seen = new Map();
        const unique = [];
        
        // Sort by timestamp (newest first)
        memories.sort((a, b) => b.timestamp - a.timestamp);
        
        for (const memory of memories) {
            // Create signature based on content similarity
            const signature = this.createMemorySignature(memory.text);
            
            if (!seen.has(signature)) {
                seen.set(signature, true);
                unique.push(memory);
            }
        }
        
        return unique;
    }

    createMemorySignature(text) {
        // Normalize text and take first 150 chars for signature
        return text.toLowerCase()
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 150);
    }

    displayMemories(memories, query) {
        const listView = document.querySelector('.knot-list-view');
        const expandedView = document.querySelector('.knot-expanded-view');
        
        // Ensure we're in list view
        listView.style.display = 'block';
        expandedView.style.display = 'none';
        this.currentView = 'list';
        
        if (memories.length === 0) {
            listView.innerHTML = `<div style="color: ${this.theme === 'dark' ? '#888' : '#666'}; text-align: center; padding: 20px; font-size: 13px;">${query ? 'No memories found' : 'No memories yet. Start chatting!'}</div>`;
            return;
        }
        
        listView.innerHTML = memories.map(memory => `
            <div class="knot-memory-item" data-memory-id="${memory.id}" 
                 style="background: ${this.theme === 'dark' ? '#0d0d0d' : '#f8f9fa'}; 
                        border: 1px solid ${this.theme === 'dark' ? '#333' : '#ddd'}; 
                        border-radius: 6px; 
                        padding: 8px 10px; 
                        margin-bottom: 8px; 
                        cursor: pointer; 
                        transition: all 0.2s; 
                        font-size: 13px; 
                        line-height: 1.4;">
                <div class="knot-memory-text" style="color: ${this.theme === 'dark' ? '#e0e0e0' : '#333'}; margin-bottom: 4px;">
                    ${this.truncateText(memory.text, 120, query)}
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div class="knot-memory-date" style="color: ${this.theme === 'dark' ? '#888' : '#666'}; font-size: 11px;">
                        ${new Date(memory.timestamp).toLocaleDateString()}
                    </div>
                    <div class="knot-platform-badge" 
                         style="font-size: 10px; 
                                background: ${this.theme === 'dark' ? '#333' : '#e9ecef'}; 
                                color: ${this.theme === 'dark' ? '#aaa' : '#666'}; 
                                padding: 2px 6px; 
                                border-radius: 3px;">
                        ${memory.platform}
                    </div>
                </div>
            </div>
        `).join('');
        
        // Add click listeners
        listView.querySelectorAll('.knot-memory-item').forEach(item => {
            item.addEventListener('click', () => {
                const memoryId = item.getAttribute('data-memory-id');
                const memory = memories.find(m => m.id === memoryId);
                if (memory) {
                    this.showExpandedView(memory);
                }
            });
            
            // Hover effects
            item.addEventListener('mouseenter', () => {
                item.style.background = this.theme === 'dark' ? '#2a2a2a' : '#e9ecef';
                item.style.borderColor = this.theme === 'dark' ? '#6366f1' : '#007bff';
            });
            item.addEventListener('mouseleave', () => {
                item.style.background = this.theme === 'dark' ? '#0d0d0d' : '#f8f9fa';
                item.style.borderColor = this.theme === 'dark' ? '#333' : '#ddd';
            });
        });
    }

    showExpandedView(memory) {
        this.currentView = 'expanded';
        this.expandedMemory = memory;
        
        const listView = document.querySelector('.knot-list-view');
        const expandedView = document.querySelector('.knot-expanded-view');
        
        listView.style.display = 'none';
        expandedView.style.display = 'flex';
        
        expandedView.innerHTML = `
            <button class="knot-back-button" 
                    style="background: none; 
                           border: none; 
                           border-bottom: 1px solid ${this.theme === 'dark' ? '#333' : '#ddd'};
                           color: ${this.theme === 'dark' ? '#e0e0e0' : '#333'}; 
                           cursor: pointer; 
                           padding: 12px 16px; 
                           text-align: left;
                           font-size: 13px;">
                ← Back to search
            </button>
            <div class="knot-expanded-content" 
                 style="flex: 1; 
                        overflow-y: auto; 
                        padding: 16px; 
                        white-space: pre-wrap;
                        line-height: 1.5;
                        color: ${this.theme === 'dark' ? '#e0e0e0' : '#333'};">
                ${memory.text}
            </div>
            <div style="padding: 16px; 
                        border-top: 1px solid ${this.theme === 'dark' ? '#333' : '#ddd'}; 
                        background: ${this.theme === 'dark' ? '#0d0d0d' : '#f8f9fa'};">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="color: ${this.theme === 'dark' ? '#888' : '#666'}; font-size: 12px;">
                        ${new Date(memory.timestamp).toLocaleString()}
                    </span>
                    <span class="knot-platform-badge" 
                          style="font-size: 11px; 
                                 background: ${this.theme === 'dark' ? '#333' : '#e9ecef'}; 
                                 color: ${this.theme === 'dark' ? '#aaa' : '#666'}; 
                                 padding: 2px 8px; 
                                 border-radius: 3px;">
                        ${memory.platform}
                    </span>
                </div>
                <button class="knot-copy-full-btn" 
                        style="width: 100%; 
                               padding: 8px; 
                               background: ${this.theme === 'dark' ? '#333' : '#007bff'}; 
                               color: white; 
                               border: none; 
                               border-radius: 4px; 
                               cursor: pointer; 
                               font-size: 12px;">
                    Copy Full Text
                </button>
            </div>
        `;
        
        // Add back button listener
        expandedView.querySelector('.knot-back-button').addEventListener('click', () => {
            this.showListView();
        });
        
        // Add copy button listener (FIXED - uses event listener)
        expandedView.querySelector('.knot-copy-full-btn').addEventListener('click', () => {
            this.copyExpandedMemory();
        });
    }

    showListView() {
        this.currentView = 'list';
        this.expandedMemory = null;
        
        const listView = document.querySelector('.knot-list-view');
        const expandedView = document.querySelector('.knot-expanded-view');
        
        listView.style.display = 'block';
        expandedView.style.display = 'none';
        
        // Refresh the search to show current results
        const currentQuery = document.getElementById('knot-search').value;
        this.searchMemories(currentQuery);
    }

    copyExpandedMemory() {
        if (this.expandedMemory) {
            // Use execCommand instead of clipboard API (FIXED)
            const textArea = document.createElement('textarea');
            textArea.value = this.expandedMemory.text;
            document.body.appendChild(textArea);
            textArea.select();
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            
            if (successful) {
                // Visual feedback
                const button = document.querySelector('.knot-copy-full-btn');
                const originalText = button.textContent;
                button.textContent = '✓ Copied!';
                button.style.background = this.theme === 'dark' ? '#10b981' : '#28a745';
                setTimeout(() => {
                    button.textContent = originalText;
                    button.style.background = this.theme === 'dark' ? '#333' : '#007bff';
                }, 2000);
            }
        }
    }

    renderCurrentView() {
        if (this.currentView === 'expanded' && this.expandedMemory) {
            this.showExpandedView(this.expandedMemory);
        } else {
            this.showListView();
        }
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
                // Use execCommand for consistency
                const textArea = document.createElement('textarea');
                textArea.value = memory.text;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
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
                    url: window.location.href,
                    platform: this.getPlatformName()
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
let knotGPT;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        knotGPT = new KnotGPT();
    });
} else {
    knotGPT = new KnotGPT();
}
