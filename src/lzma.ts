declare const LZMA: any;

// First, load the LZMA script
async function loadLZMA(): Promise<void> {
    if (typeof LZMA !== 'undefined') {
        console.log('LZMA already loaded:', LZMA);
        return;
    }
    
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = '/lzma_worker.js';
        
        script.onload = () => {
            console.log('LZMA script loaded, LZMA object:', LZMA);
            if (typeof LZMA === 'undefined') {
                reject(new Error('LZMA failed to initialize after script load'));
                return;
            }
            resolve();
        };
        
        script.onerror = (error) => {
            console.error('Failed to load LZMA script:', error);
            reject(new Error('Failed to load LZMA script'));
        };
        
        // Log the full URL we're trying to load
        console.log('Loading LZMA from:', new URL(script.src, window.location.href).href);
        document.head.appendChild(script);
    });
}

export async function decompress(data: Uint8Array): Promise<Uint8Array> {
    await loadLZMA();
    
    return new Promise((resolve, reject) => {
        try {
            // Add debug logging
            console.log('Input data length:', data.length);
            console.log('First few bytes:', Array.from(data.slice(0, 16)));
            console.log('Last few bytes:', Array.from(data.slice(-16)));
            
            // Verify we have enough data for LZMA header (13 bytes minimum)
            if (data.length < 13) {
                reject(new Error('Input data too short for LZMA format'));
                return;
            }

            // Try using the raw Uint8Array first
            LZMA.decompress(data, (result: Uint8Array | null, error: Error) => {
                if (!error && result) {
                    console.log('Decompression successful with Uint8Array, output size:', result.length);
                    resolve(new Uint8Array(result));
                } else {
                    // If that fails, try with Array.from()
                    const inputArray = Array.from(data);
                    LZMA.decompress(inputArray, (result2: Uint8Array | null, error2: Error) => {
                        if (error2) {
                            console.error('LZMA decompress error details:', error2);
                            reject(new Error(`LZMA decompression failed: ${error2.message}`));
                        } else if (!result2) {
                            reject(new Error('LZMA decompression returned null result'));
                        } else {
                            console.log('Decompression successful with Array, output size:', result2.length);
                            resolve(new Uint8Array(result2));
                        }
                    });
                }
            });
        } catch (e) {
            console.error('LZMA decompress exception:', e);
            reject(new Error(`LZMA decompression error: ${e instanceof Error ? e.message : String(e)}`));
        }
    });
}
