module.exports = {
   root: true,
   env: { browser: true, es2020: true },
   extends: [
      'eslint:recommended',
      'plugin:react/recommended',
      'plugin:react/jsx-runtime',
      'plugin:react-hooks/recommended',
   ],
   ignorePatterns: ['dist', 'build', '.eslintrc.cjs'],
   parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
   settings: { react: { version: '18.2' } },
   plugins: ['react-refresh', 'only-warn'],
   rules: {
      'no-unused-vars': [
         'warn',
         { ignoreRestSiblings: true }
      ],
      'react-refresh/only-export-components': 0,
      'react/prop-types': 0,
      'react/no-unknown-property': 0,
      'react/display-name': 0
   },
}
