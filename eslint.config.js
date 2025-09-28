import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

export default [
    js.configs.recommended,
    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            parser: typescriptParser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
            globals: {
                console: 'readonly',
                Buffer: 'readonly',
                globalThis: 'readonly',
                window: 'readonly',
                document: 'readonly',
                sessionStorage: 'readonly',
                localStorage: 'readonly',
                URLSearchParams: 'readonly',
                Blob: 'readonly',
                FormData: 'readonly'
            },
        },
        plugins: {
            '@typescript-eslint': typescript,
        },
        rules: {
            ...typescript.configs.recommended.rules,
        },
    },
    {
        ignores: ['dist', 'node_modules'],
    },
];
