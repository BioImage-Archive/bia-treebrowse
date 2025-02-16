import { RadixTree, RadixTreeNode, RadixTreeEdge } from './radixtree.js';

export function initializeApp() {
    const urlInput = document.getElementById('urlInput') as HTMLInputElement;
    const loadButton = document.getElementById('loadButton') as HTMLButtonElement;
    const treeView = document.getElementById('treeView') as HTMLDivElement;
    const errorDiv = document.getElementById('error') as HTMLDivElement;

    if (!urlInput || !loadButton || !treeView || !errorDiv) {
        console.error('Required DOM elements not found');
        return;
    }

    function createNodeElement(node: RadixTreeNode, path: string = ''): HTMLElement {
        const nodeDiv = document.createElement('div');
        nodeDiv.className = 'tree-node';
        
        const size = RadixTree.getLongSize(node.size);
        const content = document.createElement('div');
        content.className = 'node-content';
        content.innerHTML = `
            <span class="path">${path || '/'}</span>
            <span class="size">${RadixTree.formatSize(size)}</span>
        `;
        nodeDiv.appendChild(content);

        if (node.children && node.children.length > 0) {
            const childrenDiv = document.createElement('div');
            childrenDiv.className = 'node-children hidden';
            
            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'toggle-btn';
            toggleBtn.textContent = '▶';
            content.insertBefore(toggleBtn, content.firstChild);

            toggleBtn.addEventListener('click', () => {
                const isHidden = childrenDiv.classList.contains('hidden');
                childrenDiv.classList.toggle('hidden');
                toggleBtn.textContent = isHidden ? '▼' : '▶';
                
                // Lazy load children
                if (isHidden && childrenDiv.children.length === 0) {
                    node.children.forEach((edge: RadixTreeEdge) => {
                        if (edge.child) {
                            const childPath = path + (edge.edge_label || '');
                            childrenDiv.appendChild(createNodeElement(edge.child, childPath));
                        }
                    });
                }
            });

            nodeDiv.appendChild(childrenDiv);
        }

        return nodeDiv;
    }

    loadButton.addEventListener('click', async () => {
        const url = urlInput.value.trim();
        if (!url) {
            errorDiv.textContent = 'Please enter a URL';
            return;
        }

        errorDiv.textContent = '';
        treeView.innerHTML = '<p>Loading...</p>';

        try {
            const tree = await RadixTree.loadFromUrl(url);
            treeView.innerHTML = '';
            treeView.appendChild(createNodeElement(tree.root));
        } catch (error) {
            treeView.innerHTML = `<p class="error">Error: ${error}</p>`;
        }
    });
}
