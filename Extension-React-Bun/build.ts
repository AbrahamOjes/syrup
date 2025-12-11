import { copyFile, mkdir, cp } from 'node:fs/promises';
import { join } from 'node:path';
import { build as v_build } from 'vite';

type Browser = 'chrome' | 'firefox';

async function ensureDir(dir: string) {
    try {
        await mkdir(dir, { recursive: true });
    } catch (_error) {
        // Directory might already exist
    }
}

async function buildForBrowser(browser: Browser) {
    const outDir = `./dist/${browser}`;

    try {
        // Ensure output directory exists
        await ensureDir(outDir);

        // Build popup (this also cleans the output directory)
        await v_build({
            build: {
                outDir: `${outDir}`,
            },
            configFile: './vite.config.ts',
        })

        // Build content script
        await Bun.build({
            entrypoints: ['./src/content/index.ts'],
            outdir: `${outDir}/content`,
            target: 'browser',
            minify: true,
        });

        // Build background script
        await Bun.build({
            entrypoints: ['./src/background/index.ts'],
            outdir: `${outDir}/background`,
            target: 'browser',
            minify: true,
        });

        // Copy static files
        await copyFile(
            join(process.cwd(), `src/manifest/${browser}.json`),
            join(process.cwd(), `${outDir}/manifest.json`)
        );

        // Recursive copy public folder to outDir
        await cp(
            join(process.cwd(), 'src/public'),
            join(process.cwd(), `${outDir}`),
            {
                recursive: true,
                preserveTimestamps: true,
            }
        );

        console.log(`Build completed successfully for ${browser}!`);
    } catch (error) {
        console.error(`Build failed for ${browser}:`, error);
        process.exit(1);
    }
}

// Build for both browsers
async function build() {
    await buildForBrowser('chrome');
}

build();