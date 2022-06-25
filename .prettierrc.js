module.exports = {
    eslintIntegration: true,
    stylelintIntegration: true,
    tabWidth: 4,
    semi: true,
    printWidth: 140,
    proseWrap: 'preserve',
    trailingComma: 'none',
    singleQuote: true,
    overrides: [
        {
            files: '*.js',
            options: {
                tabWidth: 4
            }
        },
        {
            files: '*.ts',
            options: {
                tabWidth: 4
            }
        },
        {
            files: '*.scss',
            options: {
                tabWidth: 4
            }
        },
        {
            files: '*.css',
            options: {
                tabWidth: 4
            }
        }
    ]
};
