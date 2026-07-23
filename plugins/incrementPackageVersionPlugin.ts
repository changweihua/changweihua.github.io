import fs from 'fs';
export const incrementPackageVersionPlugin = ()=> {
    return {
        name: 'increment-package-version-plugin',
        // writeBundle ---vite生命周期钩子函数,打包时会调用
        writeBundle(opts, bundle) {
            const packageJsonPath = './package.json';
            try {
                const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
                packageJson.version = incrementVersion(packageJson.version);
                fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
            } catch (error) {
                console.error('Error reading or writing package.json:', error);
            }
        }
    };
}
function incrementVersion(version) {
    const parts = version.split('.');
    parts[parts.length - 1] = String(parseInt(parts[parts.length - 1]) + 1);
    return parts.join('.');
}



// import { defineConfig } from 'vite';
// import vue from '@vitejs/plugin-vue'
// import { incrementPackageVersionPlugin } from './incrementPackageVersionPlugin';
// export default defineConfig(({ command, mode })=>{
//     return {
//         base: '',
//         resolve: {
//           alias: {
//           '@': resolve(__dirname, './src')
//           }
//         },
//         ......,

//         plugins: [ vue(), incrementPackageVersionPlugin() ],

//         ......
//     }
// });
