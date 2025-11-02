const esbuild = require('esbuild');

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

/**
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
  name: 'esbuild-problem-matcher',

  setup(build) {
    build.onStart(() => {
      console.log('[watch] build started');
    });
    build.onEnd(result => {
      result.errors.forEach(({ text, location }) => {
        console.error(`✘ [ERROR] ${text}`);
        console.error(`    ${location.file}:${location.line}:${location.column}:`);
      });
      console.log('[watch] build finished');
    });
  },
};

async function main() {
  const extensionContext = await esbuild.context({
    entryPoints: ['src/extension.ts'],
    bundle: true,
    format: 'cjs',
    minify: production,
    sourcemap: !production,
    sourcesContent: false,
    platform: 'node',
    outfile: 'dist/extension.js',
    external: ['vscode'],
    logLevel: 'silent',
    plugins: [
      esbuildProblemMatcherPlugin,
    ],
  });

  const mcpContext = await esbuild.context({
    entryPoints: ['src/index.ts'],
    bundle: true,
    format: 'cjs',
    minify: production,
    sourcemap: !production,
    sourcesContent: false,
    platform: 'node',
    outfile: 'dist/index.js',
    logLevel: 'silent',
    plugins: [
      esbuildProblemMatcherPlugin,
    ],
  });

  if (watch) {
    await Promise.all([
      extensionContext.watch(),
      mcpContext.watch()
    ]);
  } else {
    await Promise.all([
      extensionContext.rebuild(),
      mcpContext.rebuild()
    ]);
    await extensionContext.dispose();
    await mcpContext.dispose();
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
