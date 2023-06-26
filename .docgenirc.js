/**
 * @type {import('@docgeni/core').DocgeniConfig}
 */
module.exports = {
    mode: 'full',
    title: 'Plait',
    description: '',
    logoUrl: 'assets/plait-logo.png',
    docsDir: 'docs',
    repoUrl: 'https://github.com/worktile/plait',
    navs: [
        null,
        {
            title: 'Board Online',
            path: 'https://plait-gamma.vercel.app',
            isExternal: true
        },
        {
            title: 'Flow Online',
            path: 'https://plait-gamma.vercel.app/flow',
            isExternal: true
        }
    ],
    defaultLocale: 'zh-cn'
};
