import { RadixTree } from './radixtree.js';

export function initializeApp() {
    const urlInput = document.getElementById('urlInput') as HTMLInputElement;
    const loadButton = document.getElementById('loadButton') as HTMLButtonElement;
    const statsDiv = document.getElementById('stats') as HTMLDivElement;
    const errorDiv = document.getElementById('error') as HTMLDivElement;

    if (!urlInput || !loadButton || !statsDiv || !errorDiv) {
        console.error('Required DOM elements not found');
        return;
    }

    loadButton.addEventListener('click', async () => {
        const url = urlInput.value.trim();
        if (!url) {
            errorDiv.textContent = 'Please enter a URL';
            return;
        }

        errorDiv.textContent = '';
        statsDiv.innerHTML = '<p>Loading...</p>';

        try {
            const tree = await RadixTree.loadFromUrl(url);
            const totalSize = tree.getTotalSize();
            
            // Helper function to format bytes
            const formatBytes = (bytes: number) => {
                const units = ['B', 'KB', 'MB', 'GB', 'TB'];
                let size = bytes;
                let unitIndex = 0;
                while (size >= 1024 && unitIndex < units.length - 1) {
                    size /= 1024;
                    unitIndex++;
                }
                return `${size.toFixed(2)} ${units[unitIndex]}`;
            };

            statsDiv.innerHTML = `
                <h3>File Statistics</h3>
                <p>Total size: ${totalSize.toLocaleString()} bytes (${formatBytes(totalSize)})</p>
            `;
        } catch (error) {
            statsDiv.innerHTML = `<p style="color: red">Error: ${error}</p>`;
        }
    });
}
