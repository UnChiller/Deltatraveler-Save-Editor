import { defineConfig } from 'vite'

export default defineConfig({
    base: "",
    publicDir: "misc",
    build: {
        outDir: "../dist",
        emptyOutDir: true,
        sourcemap: true,
    },
})