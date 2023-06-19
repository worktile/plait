/**
 * @type {import('@docgeni/core').DocgeniConfig}
 */
module.exports = {
    mode: 'full',
    title: 'plait',
    description: '',
    docsDir: 'docs',
    repoUrl: 'https://github.com/worktile/plait',
    siteProjectName: 'demo',
    navs: [
        null,
        {
            title: 'Mind',
            path: 'examples/mind',
            lib: 'mind',
            locales: {}
        },
        {
          title: 'Flow',
          path: 'examples/flow',
          lib: 'mind',
          locales: {}
      },
        {
            title: 'GitHub',
            path: 'https://github.com/worktile/plait',
            isExternal: true
        }
    ],
    libs: [
        // {
        //     name: 'richtext',
        //     rootDir: 'packages/richtext',
        //     include: ['src'],
        //     exclude: [],
        //     apiMode: 'automatic',
        //     categories: []
        // },
        {
            name: 'plait',
            rootDir: 'packages/plait',
            include: ['src'],
            exclude: [],
            apiMode: 'automatic',
            categories: []
        }
        // {
        //     name: 'mind',
        //     rootDir: 'packages/mind',
        //     include: ['src'],
        //     exclude: [],
        //     apiMode: 'automatic',
        //     categories: []
        // },
        // {
        //     name: 'layouts',
        //     rootDir: 'packages/layouts',
        //     include: ['src'],
        //     exclude: [],
        //     apiMode: 'automatic',
        //     categories: []
        // },
        // {
        //     name: 'flow',
        //     rootDir: 'packages/flow',
        //     include: ['src'],
        //     exclude: [],
        //     apiMode: 'automatic',
        //     categories: []
        // }
    ],
    defaultLocale: 'zh-cn'
};
