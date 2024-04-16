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
                        data: { topic: { children: [{ text: 'non-layered-tidy-trees' }] } },
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
] as PlaitDrawElement[];

export const mockGroupData: PlaitDrawElement[] = [
    {
        id: 'group1',
        type: 'group'
    },
    {
        id: 'group2',
        type: 'group',
        groupId: 'group3'
    },
    {
        id: 'group3',
        type: 'group'
    },
    {
        id: 'jimNt',
        type: 'geometry',
        shape: 'rectangle',
        angle: 0,
        opacity: 1,
        textHeight: 20,
        groupId: 'group1',
        text: {
            children: [
                {
                    text: 'group1'
                }
            ],
            align: 'center'
        },
        points: [
            [-98.814453125, 66.53125],
            [55.880859375, 126.71875]
        ],
        strokeWidth: 2,
        fill: '#e48483'
    },
    {
        id: 'bRBzf',
        type: 'geometry',
        shape: 'rectangle',
        angle: 0,
        opacity: 1,
        textHeight: 20,
        groupId: 'group1',
        text: {
            children: [
                {
                    text: 'group1'
                }
            ],
            align: 'center'
        },
        points: [
            [136.806640625, 66.53125],
            [291.501953125, 126.71875]
        ],
        strokeWidth: 2,
        fill: '#e48483'
    },
    {
        id: 'erasy',
        type: 'geometry',
        shape: 'rectangle',
        angle: 0,
        opacity: 1,
        textHeight: 20,
        groupId: 'group3',
        text: {
            children: [
                {
                    text: 'group3'
                }
            ],
            align: 'center'
        },
        points: [
            [19.580078125, 318.6376953125],
            [174.275390625, 378.8251953125]
        ],
        strokeWidth: 2,
        fill: '#69b1e4'
    },
    {
        id: 'YcTFs',
        type: 'geometry',
        shape: 'text',
        angle: 0,
        opacity: 1,
        textHeight: 20,
        text: {
            children: [
                {
                    text: 'group3 包含 group2'
                }
            ]
        },
        points: [
            [-275.482421875, 302.318359375],
            [-138.091796875, 322.318359375]
        ],
        autoSize: true
    },
    {
        id: 'ztmWw',
        type: 'geometry',
        shape: 'rectangle',
        angle: 0,
        opacity: 1,
        textHeight: 20,
        groupId: 'group2',
        text: {
            children: [
                {
                    text: 'group2'
                }
            ],
            align: 'center'
        },
        points: [
            [-98.814453125, 197.279296875],
            [55.880859375, 257.466796875]
        ],
        strokeWidth: 2,
        fill: '#e48483'
    },
    {
        id: 'bWiPp',
        type: 'geometry',
        shape: 'rectangle',
        angle: 0,
        opacity: 1,
        textHeight: 20,
        groupId: 'group2',
        text: {
            children: [
                {
                    text: 'group2'
                }
            ],
            align: 'center'
        },
        points: [
            [139.3486328125, 197.279296875],
            [294.0439453125, 257.466796875]
        ],
        strokeWidth: 2,
        fill: '#e48483'
    }
] as PlaitDrawElement[];

export const mockRotateData: PlaitDrawElement[] = [
    {
        id: 'jhETT',
        type: 'geometry',
        shape: 'rectangle',
        angle: 0.26179938779914913,
        opacity: 1,
        textHeight: 20,
        text: {
            children: [
                {
                    text: ''
                }
            ],
            align: 'center'
        },
        points: [
            [-1030.04296875, 90.8828125],
            [-888.55859375, 157.25390625]
        ],
        strokeWidth: 2
    },
    {
        id: 'xHBRi',
        type: 'geometry',
        shape: 'ellipse',
        angle: 0.26179938779914913,
        opacity: 1,
        textHeight: 20,
        text: {
            children: [
                {
                    text: ''
                }
            ],
            align: 'center'
        },
        points: [
            [-773.125, 79.6015625],
            [-596.98046875, 157.25390625]
        ],
        strokeWidth: 2
    },
    {
        id: 'rGzmy',
        type: 'geometry',
        shape: 'triangle',
        angle: 0.26179938779914913,
        opacity: 1,
        textHeight: 20,
        text: {
            children: [
                {
                    text: ''
                }
            ],
            align: 'center'
        },
        points: [
            [-477.746678637868, 63.45135257428139],
            [-397.718165112132, 164.65973141009368]
        ],
        strokeWidth: 2
    },
    {
        id: 'zsHJk',
        type: 'geometry',
        shape: 'twoWayArrow',
        angle: 0.7853981633974483,
        opacity: 1,
        textHeight: 20,
        text: {
            children: [
                {
                    text: ''
                }
            ],
            align: 'center'
        },
        points: [
            [-1035.76171875, 283.5751953125],
            [-882.83984375, 333.6494140625]
        ],
        strokeWidth: 2
    },
    {
        id: 'MXpTt',
        type: 'geometry',
        shape: 'cross',
        angle: 0.7853981633974483,
        opacity: 1,
        textHeight: 20,
        text: {
            children: [
                {
                    text: ''
                }
            ],
            align: 'center'
        },
        points: [
            [-745.8359375, 265.3056640625],
            [-602.85546875, 351.9189453125]
        ],
        strokeWidth: 2
    },
    {
        id: 'kpnyW',
        type: 'geometry',
        shape: 'roundComment',
        angle: 0.7853981633974483,
        opacity: 1,
        textHeight: 20,
        text: {
            children: [
                {
                    text: ''
                }
            ],
            align: 'center'
        },
        points: [
            [-494.71484375, 267.48193359375],
            [-344.26953125, 355.75146484375]
        ],
        strokeWidth: 2
    },
    {
        id: 'SwRcR',
        type: 'geometry',
        shape: 'text',
        angle: 0.26179938779914913,
        opacity: 1,
        textHeight: 24,
        text: {
            children: [
                {
                    text: '测试测试 ： Test',
                    'font-size': 16
                }
            ]
        },
        points: [
            [-215.50390625, 102.0555419921875],
            [-84.30078125, 126.0555419921875]
        ],
        autoSize: true
    },
    {
        id: 'reEQK',
        type: 'image',
        angle: 0.7853981633974483,
        points: [
            [-223.90771484375, 247.76884450604837],
            [-40.78662109375, 369.45576486895163]
        ],
        url: 'https://cdn-aliyun.pingcode.com/static/site/img/why-pingcode.8922701.png'
    },

    {
        id: 'CWwJT',
        type: 'geometry',
        shape: 'text',
        angle: 0,
        opacity: 1,
        textHeight: 24,
        text: {
            children: [
                {
                    text: '旋转 15 度',
                    bold: true,
                    'font-size': 16,
                    color: '#e03130'
                }
            ]
        },
        points: [
            [-1237.798828125, 97.84893798828125],
            [-1154.970703125, 121.84893798828125]
        ],
        autoSize: true
    },
    {
        id: 'YapKc',
        type: 'geometry',
        shape: 'text',
        angle: 0,
        opacity: 1,
        textHeight: 24,
        text: {
            children: [
                {
                    text: '旋转 45 度',
                    bold: true,
                    'font-size': 16,
                    color: '#e03130'
                }
            ]
        },
        points: [
            [-1233.25830078125, 288.90362548828125],
            [-1147.39892578125, 312.90362548828125]
        ],
        autoSize: true
    }
] as PlaitDrawElement[];
