export default {
    build: {
        target: 'esnext',
        rollupOptions: {
            input: {
                main: 'src/index.html',
                test: 'src/test.html'
            }
        }
    },
    root: 'src'
}
