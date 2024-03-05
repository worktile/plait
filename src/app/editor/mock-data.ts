import { PlaitMind } from '@plait/mind';
import { PlaitDrawElement } from '@plait/draw';

export const mockMindData: PlaitMind[] = [
    {
        type: 'mindmap',
        id: '1',
        rightNodeCount: 3,
        data: { topic: { children: [{ text: '脑图调研' }] }, emojis: [{ name: '🏀' }, { name: '🌈' }] },
        children: [
            {
                id: '1-1',
                data: {
                    topic: { children: [{ text: '富文本' }] },
                    emojis: [{ name: '🤩' }, { name: '🤘' }],
                    image: {
                        url: 'https://atlas-rc.pingcode.com/files/public/5ffa68d453ffebf847cf49b9/origin-url',
                        width: 364,
                        height: 160
                    }
                },
                children: [],
                width: 42,
                height: 20
            },
            {
                id: '1-4',
                data: { topic: { children: [{ text: '知名脑图产品' }] } },
                children: [
                    {
                        id: '1-4-1',
                        data: { topic: { children: [{ text: '布局算法' }] } },
                        children: [],
                        width: 56,
                        height: 20
                    },
                    {
                        id: '1-4-2',
                        data: { topic: { children: [{ text: 'non-layerd-tidy-trees' }] } },
                        children: [
                            {
                                id: '1-4-2-1',
                                data: { topic: { children: [{ text: '鱼骨图哦' }] } },
                                children: [],
                                width: 56,
                                height: 20
                            },
                            {
                                id: '1-4-2-2',
                                data: { topic: { children: [{ text: '缩进布局' }] } },
                                children: [],
                                width: 56,
                                height: 20
                            }
                        ],
                        width: 144.8046875,
                        height: 20
                    },
                    {
                        id: '1-4-3',
                        data: { topic: { children: [{ text: '知名脑图产品' }] } },
                        children: [],
                        width: 84,
                        height: 20
                    }
                ],
                width: 84,
                height: 20
            },
            {
                id: '1-5',
                data: { topic: { children: [{ text: 'xxxxxxx' }] } },
                children: [
                    {
                        id: '1-5-1',
                        data: { topic: { children: [{ text: '鱼骨图哦' }] } },
                        children: [],
                        width: 56,
                        height: 20
                    },
                    {
                        id: '1-5-2',
                        data: { topic: { children: [{ text: '缩进布局' }] } },
                        children: [],
                        width: 56,
                        height: 20
                    }
                ],
                width: 48,
                height: 20
            }
        ],
        width: 72,
        height: 25,
        isRoot: true,
        points: [[560, 360]]
    }
];

export const mockDrawData: PlaitDrawElement[] = [
    {
        id: 'GMKAE',
        type: 'geometry',
        shape: 'terminal',
        angle: 0,
        opacity: 1,
        textHeight: 20,
        text: {
            children: [
                {
                    text: '结束'
                }
            ],
            align: 'center'
        },
        points: [
            [-107, 443.9999999999999],
            [13, 503.9999999999999]
        ],
        strokeWidth: 2
    },
    {
        id: 'WEycp',
        type: 'geometry',
        shape: 'process',
        angle: 0,
        opacity: 1,
        textHeight: 20,
        text: {
            children: [
                {
                    text: '过程'
                }
            ],
            align: 'center'
        },
        points: [
            [98, 283.9999999999999],
            [218, 343.9999999999999]
        ],
        strokeWidth: 2
    },
    {
        id: 'rJcaT',
        type: 'geometry',
        shape: 'decision',
        angle: 0,
        opacity: 1,
        textHeight: 20,
        text: {
            children: [
                {
                    text: '过程'
                }
            ],
            align: 'center'
        },
        points: [
            [-117, 278.9999999999999],
            [23, 348.9999999999999]
        ],
        strokeWidth: 2
    },
    {
        id: 'RpDPy',
        type: 'geometry',
        shape: 'process',
        angle: 0,
        opacity: 1,
        textHeight: 20,
        text: {
            children: [
                {
                    text: '过程'
                }
            ],
            align: 'center'
        },
        points: [
            [-107, 163.9999999999999],
            [13, 223.9999999999999]
        ],
        strokeWidth: 2
    },
    {
        id: 'xRzpF',
        type: 'geometry',
        shape: 'terminal',
        angle: 0,
        opacity: 1,
        textHeight: 20,
        text: {
            children: [
                {
                    text: '开始'
                }
            ],
            align: 'center'
        },
        points: [
            [-107, 48.999999999999886],
            [13, 108.99999999999989]
        ],
        strokeWidth: 2
    },
    {
        id: 'hhyEm',
        type: 'line',
        shape: 'elbow',
        source: {
            marker: 'none',
            connection: [0.5, 1],
            boundId: 'WEycp'
        },
        texts: [],
        target: {
            marker: 'arrow',
            connection: [1, 0.5],
            boundId: 'GMKAE'
        },
        opacity: 1,
        points: [
            [-277, -129.0000000000001],
            [-277, -129.0000000000001]
        ],
        strokeWidth: 2
    },
    {
        id: 'NQbHa',
        type: 'line',
        shape: 'elbow',
        source: {
            marker: 'none',
            connection: [1, 0.5],
            boundId: 'rJcaT'
        },
        texts: [
            {
                text: {
                    children: [
                        {
                            text: '否'
                        }
                    ]
                },
                position: 0.5,
                width: 14,
                height: 20
            }
        ],
        target: {
            marker: 'arrow',
            connection: [0, 0.5],
            boundId: 'WEycp'
        },
        opacity: 1,
        points: [
            [-277, -129.0000000000001],
            [-277, -129.0000000000001]
        ],
        strokeWidth: 2
    },
    {
        id: 'dBQka',
        type: 'line',
        shape: 'elbow',
        source: {
            marker: 'none',
            connection: [0.5, 1],
            boundId: 'rJcaT'
        },
        texts: [
            {
                text: {
                    children: [
                        {
                            text: '是'
                        }
                    ]
                },
                position: 0.5,
                width: 14,
                height: 20
            }
        ],
        target: {
            marker: 'arrow',
            connection: [0.5, 0],
            boundId: 'GMKAE'
        },
        opacity: 1,
        points: [
            [-277, -129.0000000000001],
            [-277, -129.0000000000001]
        ],
        strokeWidth: 2
    },
    {
        id: 'nTHrr',
        type: 'line',
        shape: 'elbow',
        source: {
            marker: 'none',
            connection: [0.5, 1],
            boundId: 'RpDPy'
        },
        texts: [],
        target: {
            marker: 'arrow',
            connection: [0.5, 0],
            boundId: 'rJcaT'
        },
        opacity: 1,
        points: [
            [-277, -129.0000000000001],
            [-277, -129.0000000000001]
        ],
        strokeWidth: 2
    },
    {
        id: 'PMShX',
        type: 'line',
        shape: 'elbow',
        source: {
            marker: 'none',
            connection: [0.5, 1],
            boundId: 'xRzpF'
        },
        texts: [],
        target: {
            marker: 'arrow',
            connection: [0.5, 0],
            boundId: 'RpDPy'
        },
        opacity: 1,
        points: [
            [-277, -129.0000000000001],
            [-277, -129.0000000000001]
        ],
        strokeWidth: 2
    }
    // {
    //     id: 'aYaKp',
    //     type: 'geometry',
    //     shape: 'rectangle',
    //     angle: 5.86874495248496,
    //     opacity: 1,
    //     textHeight: 20,
    //     text: {
    //         children: [
    //             {
    //                 text: 'rotated text'
    //             }
    //         ],
    //         align: 'center'
    //     },
    //     points: [
    //         [-478.30078125, 108.99999999999989],
    //         [-195.15234375, 231.88671875]
    //     ],
    //     strokeWidth: 2
    // }
    // {
    //     id: 'JaNyh',
    //     type: 'geometry',
    //     shape: 'ellipse',
    //     angle: 6.86874495248496,
    //     opacity: 1,
    //     textHeight: 20,
    //     text: {
    //         children: [
    //             {
    //                 text: ''
    //             }
    //         ],
    //         align: 'center'
    //     },
    //     points: [
    //         [-834.0263671875, 236.5234375],
    //         [-637.8779296875, 311.93359375]
    //     ],
    //     strokeWidth: 2
    // },
    // {
    //     id: 'FHknH',
    //     type: 'geometry',
    //     shape: 'triangle',
    //     angle: 4.86874495248496,
    //     opacity: 1,
    //     textHeight: 20,
    //     text: {
    //         children: [
    //             {
    //                 text: ''
    //             }
    //         ],
    //         align: 'center'
    //     },
    //     points: [
    //         [-693.52490234375, -13.8203125],
    //         [-600.31005859375, 132.7578125]
    //     ],
    //     strokeWidth: 2
    // },
    // {
    //     id: 'zMSeG',
    //     type: 'geometry',
    //     shape: 'rightArrow',
    //     angle: 0.86874495248496,
    //     opacity: 1,
    //     textHeight: 20,
    //     text: {
    //         children: [
    //             {
    //                 text: ''
    //             }
    //         ],
    //         align: 'center'
    //     },
    //     points: [
    //         [-542.94287109375, 307.9296875],
    //         [-338.20458984375, 382.59375]
    //     ],
    //     strokeWidth: 2
    // }
] as PlaitDrawElement[];
