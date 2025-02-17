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
            <span class="size">${
                node.children && node.children.length > 0 
                ? `${RadixTree.formatSize(RadixTree.getNodeSize(node))} total`
                : RadixTree.formatSize(size)
            }</span>
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
            const statsDiv = document.createElement('div');
            statsDiv.className = 'total-size';
            
            // Add total size and toggle button
            const totalSize = tree.getTotalSize();
            const summaryHeader = document.createElement('div');
            summaryHeader.style.display = 'flex';
            summaryHeader.style.justifyContent = 'space-between';
            summaryHeader.style.alignItems = 'center';
            
            const toggleButton = document.createElement('button');
            toggleButton.className = 'summary-toggle';
            toggleButton.textContent = 'Show Summary';
            
            const totalSizeSpan = document.createElement('span');
            // Get file types first
            const fileTypes = tree.getAllFileTypes();
            const fileCount = tree.getTotalFileCount();
            const mostCommonType = fileTypes.length > 0 ? fileTypes[0][0] : 'none';
            totalSizeSpan.textContent = `Total Size: ${RadixTree.formatSize(totalSize)} | ${fileCount} files | Most common: ${mostCommonType}`;
            
            summaryHeader.appendChild(toggleButton);
            summaryHeader.appendChild(totalSizeSpan);
            
            statsDiv.appendChild(summaryHeader);
            
            // Add file types table
            if (fileTypes.length > 0) {
                statsDiv.appendChild(document.createElement('br'));
                
                const table = document.createElement('table');
                table.className = 'file-types-table';
                
                // Create header row
                const headerRow = table.insertRow();
                ['Type', 'Size', 'Files', 'Percentage'].forEach(text => {
                    const th = document.createElement('th');
                    th.textContent = text;
                    headerRow.appendChild(th);
                });
                
                // Create data rows
                // Add all file types
                fileTypes.forEach(([ext, stats]) => {
                    const row = table.insertRow();
                    
                    const typeCell = row.insertCell();
                    typeCell.className = 'file-type';
                    typeCell.textContent = ext;
                    
                    const sizeCell = row.insertCell();
                    sizeCell.className = 'file-size';
                    sizeCell.textContent = RadixTree.formatSize(stats.size);
                    
                    const countCell = row.insertCell();
                    countCell.className = 'file-count';
                    countCell.textContent = stats.count.toString();
                    
                    const percentCell = row.insertCell();
                    percentCell.className = 'file-percentage';
                    percentCell.textContent = `${stats.percentage.toFixed(1)}%`;
                });

                // Add totals row
                const totalsRow = table.insertRow();
                totalsRow.className = 'totals-row';
                
                const totalsLabelCell = totalsRow.insertCell();
                totalsLabelCell.textContent = 'TOTAL';
                totalsLabelCell.className = 'file-type';
                
                const totalsSizeCell = totalsRow.insertCell();
                totalsSizeCell.textContent = RadixTree.formatSize(totalSize);
                totalsSizeCell.className = 'file-size';
                
                const totalsCountCell = totalsRow.insertCell();
                totalsCountCell.textContent = fileTypes.reduce((sum, [_, stats]) => sum + stats.count, 0).toString();
                totalsCountCell.className = 'file-count';
                
                const totalsPercentCell = totalsRow.insertCell();
                totalsPercentCell.textContent = '100.0%';
                totalsPercentCell.className = 'file-percentage';
                
                table.style.display = 'none';
                statsDiv.appendChild(table);
                
                // Add toggle functionality
                toggleButton.addEventListener('click', () => {
                    const isVisible = table.style.display !== 'none';
                    table.style.display = isVisible ? 'none' : '';
                    toggleButton.textContent = isVisible ? 'Show Summary' : 'Hide Summary';
                });
            }
            
            treeView.appendChild(statsDiv);
            
            // Add the tree view
            treeView.appendChild(createNodeElement(tree.root));
        } catch (error) {
            treeView.innerHTML = `<p class="error">Error: ${error}</p>`;
        }
    });
}
