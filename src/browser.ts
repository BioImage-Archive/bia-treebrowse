import { RadixTree, RadixTreeNode, RadixTreeEdge } from './radixtree';

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
        
        // Add icon based on whether it's a file or directory
        const icon = document.createElement('span');
        icon.className = 'node-icon';
        icon.textContent = node.children && node.children.length > 0 ? '📁' : '📄';
        
        content.innerHTML = `
            <span class="path">${path || '/'}</span>
            <span class="size">${RadixTree.formatSize(size)}</span>
        `;
        content.insertBefore(icon, content.firstChild);

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
                    node.children?.forEach((edge: RadixTreeEdge) => {
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
            
            // Add total size display
            const totalSize = tree.getTotalSize();
            const totalSizeDiv = document.createElement('div');
            totalSizeDiv.className = 'total-size';
            totalSizeDiv.innerHTML = `Total Size: ${RadixTree.formatSize(totalSize)}`;
            treeView.appendChild(totalSizeDiv);
            
            // Add the tree view
            treeView.appendChild(createNodeElement(tree.root));
        } catch (error) {
            treeView.innerHTML = `<p class="error">Error: ${error}</p>`;
        }
    });
}
