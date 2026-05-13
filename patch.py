import re

with open('c:/Users/hamid/Documents/projects/antigravity/sequence-diagram-fast/index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Insert hamburger right after <body>
text = re.sub(r'(<body>\s*)', r'\1<!-- Overlay & Hamburger Toggle -->\n<div class="sidebar-overlay" onclick="toggleSidebar()"></div>\n<button class="hamburger-btn" onclick="toggleSidebar()" aria-label="Toggle Navigation">\n  <div class="bar-icon">\n    <span></span>\n    <span></span>\n    <span></span>\n  </div>\n</button>\n\n', text, count=1)

# Remove the old expand button and header
old_sidebar_controls = '''    <div class="sidebar-controls" style="padding: 0.5rem 1rem; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
      <span style="font-size: 0.7rem; font-weight: bold; color: var(--text2); letter-spacing: 0.05em;">NAVIGASI</span>
      <button onclick="document.getElementById('sidebar').classList.toggle('expanded')" style="background: rgba(88,166,255,0.1); border: 1px solid rgba(88,166,255,0.3); color: var(--accent); border-radius: 4px; cursor: pointer; padding: 3px 8px; font-size: 0.7rem; transition: background 0.2s;">
        ⇋ Expand
      </button>
    </div>'''

new_sidebar_controls = '''    <div class="sidebar-header">
      <h2>FAST Diagram</h2>
      <p>Navigasi Use Case</p>
    </div>
    <div class="sidebar-nav-top">'''

text = text.replace(old_sidebar_controls, new_sidebar_controls)

# Add closing div for sidebar-nav-top after class diagram
text = text.replace('<span>Class Diagram</span>\n    </div>', '<span>Class Diagram</span>\n      </div>\n    </div>')

with open('c:/Users/hamid/Documents/projects/antigravity/sequence-diagram-fast/index.html', 'w', encoding='utf-8') as f:
    f.write(text)
