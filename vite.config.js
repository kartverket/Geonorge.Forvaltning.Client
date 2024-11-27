import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import jsconfigPaths from 'vite-jsconfig-paths';
import basicSsl from '@vitejs/plugin-basic-ssl';
import eslint from 'vite-plugin-eslint';
import svgr from "vite-plugin-svgr";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
    plugins: [
        react(),
        jsconfigPaths(),
        basicSsl(),
        svgr(),
        eslint({
            cache: false,
            include: ['./src/**/*.js', './src/**/*.jsx'],
            exclude: []
        })
    ],
    build: {
        outDir: 'build',
        assetsDir: 'assets',
        emptyOutDir: true,
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        }
    },
    server: {
        port: 44389,
        https: true,
        hmr: {
            port: 44391
        }
    }
});