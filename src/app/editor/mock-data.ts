import { PlaitMind } from '@plait/mind';
import { PlaitDrawElement } from '@plait/draw';

/**
 * 数据结构说明
 * 1. type 属性定义数据类型，不同插件的数据结构 type 不同
 * 2. points 确定元素位置
 *   1. 思维导图只有根节点有 points 属性，其余节点位置是根据思维导图布局算法推算出来的，每个思维导图节点都存一个 width 和 height 属性，确定节点的宽度和高度，文本变化或者拖动宽度是会调整 width 和 height
 *   2. 流程图每一个节点都有 points 属性，类型为：[Point, Point]，确定流程图元素的 Rectangle 范围，所有流程图都统一基于 Rectangle 确定图形
 *   3. 流程图连线 - 不存在自定义节点: points 类型也是 [Source, Target]，当关联到其它元素时 points 里面的 Source 和 Target 失效以关联元素推算 Source 和 Target
 *   3. 流程图连线 - 存在自定义节点: points 类型也是 [Source, ...turningPoints, Target], 中间部分 turningPoints 代表自定义拐点
 * 3. 思维导图节点可能存在 children 属性代表子节点，流程图图形不存在节点嵌套永远在跟层
 * 4. 思维导图存在 data 属性：存储节点文本和Emoji，流程图存在 text 属性：存储元素文本（类型和思维导图中的 data.topic 相同）
 * 5. 思维导图和流程图图形 text 字段都支持基本的富文本格式，类型是 Slate 富文本编辑器的 Element 类型
 * 6. 思维导图 type 目前只有一个: 'mind', 流程图 type 目前有三种情况：'geometry'（几何图形）|'arrow-line'（连线）|'image'（图片）
 * 7. 流程图 type type 是 geometry 的情况：通过 shape 区分不同的图形（GeometryShapes 枚举），基本图形和流程图图形不基于字段区分，只以 shape 字段区分
 * 8. 其它的属性
 */

// 基础思维导图数据结构
export const mockMindData: PlaitMind[] = [
    {
        type: 'mind',
        id: '1',
        rightNodeCount: 3,
        data: { topic: { children: [{ text: '脑图调研' }] }, emojis: [{ name: '🏀' }, { name: '🌈' }] },
        children: [
            {
                id: '1-1',
                type: 'mind_child',
                data: {
                    topic: { children: [{ text: '富文本' }] },
                    emojis: [{ name: '🤩' }, { name: '🤘' }],
                    image: {
                        url: 'https://atlas-rc.pingcode.com/files/public/5ffa68d453ffebf847cf49b9/origin-url',
                        width: 364,
                        height: 160
                    }
                },
                children: []
            },
            {
                id: '1-4',
                type: 'mind_child',
                data: { topic: { children: [{ text: '知名脑图产品' }] } },
                children: [
                    {
                        id: '1-4-1',
                        type: 'mind_child',
                        data: { topic: { children: [{ text: '布局算法' }] } },
                        children: []
                    },
                    {
                        id: '1-4-2',
                        type: 'mind_child',
                        data: { topic: { children: [{ text: 'non-layered-tidy-trees' }] } },
                        children: [
                            {
                                id: '1-4-2-1',
                                type: 'mind_child',
                                data: { topic: { children: [{ text: '鱼骨图哦' }] } },
                                children: [],
                                width: 56,
                                height: 20
                            },
                            {
                                id: '1-4-2-2',
                                type: 'mind_child',
                                data: { topic: { children: [{ text: '缩进布局' }] } },
                                children: [],
                                width: 56,
                                height: 20
                            }
                        ]
                    },
                    {
                        id: '1-4-3',
                        type: 'mind_child',
                        data: { topic: { children: [{ text: '知名脑图产品' }] } },
                        children: []
                    }
                ]
            },
            {
                id: '1-5',
                type: 'mind_child',
                data: { topic: { children: [{ text: 'xxxxxxx' }] } },
                children: [
                    {
                        id: '1-5-1',
                        type: 'mind_child',
                        data: { topic: { children: [{ text: '鱼骨图哦' }] } },
                        children: [],
                        width: 56,
                        height: 20
                    },
                    {
                        id: '1-5-2',
                        type: 'mind_child',
                        data: { topic: { children: [{ text: '缩进布局' }] } },
                        children: []
                    }
                ]
            }
        ],
        points: [[560, 360]]
    }
];

// 基础流程图数据结构
export const mockDrawData: PlaitDrawElement[] = [
    {
        id: 'GMKAE',
        type: 'geometry',
        shape: 'terminal',
        angle: 0,
        opacity: 1,
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
        text: {
            children: [
                {
                    text: '判断'
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
        type: 'arrow-line',
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
        type: 'arrow-line',
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
        type: 'arrow-line',
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
        type: 'arrow-line',
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
        type: 'arrow-line',
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

export const mockRotateData: PlaitDrawElement[] = [
    {
        id: 'jhETT',
        type: 'geometry',
        shape: 'rectangle',
        angle: 0.26179938779914913,
        opacity: 1,
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
