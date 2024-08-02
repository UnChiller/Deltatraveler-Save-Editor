import { defineConfig } from 'vite'

export default defineConfig({
    base: "",
    publicDir: "public",
    build: {
        outDir: "../dist",
        emptyOutDir: true,
        sourcemap: true,
    },
})