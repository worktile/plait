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
 * 6. 思维导图 type 目前只有一个: 'mindmap', 流程图 type 目前有三种情况：'geometry'（几何图形）|'arrow-line'（连线）|'image'（图片）
 * 7. 流程图 type type 是 geometry 的情况：通过 shape 区分不同的图形（GeometryShapes 枚举），基本图形和流程图图形不基于字段区分，只以 shape 字段区分
 * 8. 其它的属性
 */

// 基础思维导图数据结构
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

// 基础流程图数据结构
export const mockDrawData: PlaitDrawElement[] = [
    {
        children: [
            {
                children: [
                    {
                        children: [
                            {
                                children: [
                                    {
                                        children: [
                                            {
                                                children: [
                                                    {
                                                        children: [
                                                            {
                                                                children: [],
                                                                id: 'DYEyH',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文文文文文文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 112,
                                                                height: 20
                                                            }
                                                        ],
                                                        id: 'JwzDC',
                                                        data: {
                                                            topic: {
                                                                children: [
                                                                    {
                                                                        text: '文文-文文文文文文'
                                                                    }
                                                                ]
                                                            }
                                                        },
                                                        width: 119,
                                                        height: 20
                                                    }
                                                ],
                                                id: 'RwYeR',
                                                data: {
                                                    topic: {
                                                        children: [
                                                            {
                                                                text: '文文文文'
                                                            }
                                                        ]
                                                    }
                                                },
                                                width: 56,
                                                height: 20
                                            }
                                        ],
                                        id: 'NxCMZ',
                                        data: {
                                            topic: {
                                                children: [
                                                    {
                                                        text: '文文文文'
                                                    }
                                                ]
                                            }
                                        },
                                        width: 56,
                                        height: 20
                                    },
                                    {
                                        children: [
                                            {
                                                children: [
                                                    {
                                                        children: [],
                                                        id: 'FSwYM',
                                                        data: {
                                                            topic: {
                                                                children: [
                                                                    {
                                                                        text: '文文文文文文文文文文文文文文'
                                                                    }
                                                                ]
                                                            }
                                                        },
                                                        width: 196,
                                                        height: 20
                                                    }
                                                ],
                                                id: 'aGFGT',
                                                data: {
                                                    topic: {
                                                        children: [
                                                            {
                                                                text: '文文文'
                                                            }
                                                        ]
                                                    }
                                                },
                                                width: 42,
                                                height: 20
                                            },
                                            {
                                                children: [
                                                    {
                                                        children: [],
                                                        id: 'zNwjA',
                                                        data: {
                                                            topic: {
                                                                children: [
                                                                    {
                                                                        text: '文文文文文文文文文，文文url文文文文'
                                                                    }
                                                                ]
                                                            }
                                                        },
                                                        width: 241.6982421875,
                                                        height: 20
                                                    }
                                                ],
                                                id: 'RtaKP',
                                                data: {
                                                    topic: {
                                                        children: [
                                                            {
                                                                text: '文文文'
                                                            }
                                                        ]
                                                    }
                                                },
                                                width: 42,
                                                height: 20
                                            }
                                        ],
                                        id: 'JCYYH',
                                        data: {
                                            topic: {
                                                children: [
                                                    {
                                                        text: '文文文文文'
                                                    }
                                                ]
                                            }
                                        },
                                        width: 70,
                                        height: 20
                                    }
                                ],
                                id: 'ibcsH',
                                data: {
                                    topic: {
                                        children: [
                                            {
                                                text: '文文文文文'
                                            }
                                        ]
                                    }
                                },
                                width: 70,
                                height: 20
                            }
                        ],
                        id: 'kQKTt',
                        data: {
                            topic: {
                                children: [
                                    {
                                        text: '文文文文文文'
                                    }
                                ]
                            }
                        },
                        width: 84,
                        height: 20
                    },
                    {
                        children: [
                            {
                                children: [
                                    {
                                        children: [],
                                        id: 'GEtFQ',
                                        data: {
                                            topic: {
                                                children: [
                                                    {
                                                        text: '文文文文'
                                                    }
                                                ]
                                            }
                                        },
                                        width: 56,
                                        height: 20
                                    }
                                ],
                                id: 'bPRGt',
                                data: {
                                    topic: {
                                        children: [
                                            {
                                                text: '文文文文文'
                                            }
                                        ]
                                    }
                                },
                                width: 70,
                                height: 20
                            }
                        ],
                        id: 'nRnxd',
                        data: {
                            topic: {
                                children: [
                                    {
                                        text: '文文文文'
                                    }
                                ]
                            }
                        },
                        width: 56,
                        height: 20
                    },
                    {
                        children: [
                            {
                                children: [],
                                id: 'cEXKj',
                                data: {
                                    topic: {
                                        children: [
                                            {
                                                text: '文文文文文文文-文文文文文文'
                                            }
                                        ]
                                    }
                                },
                                width: 189,
                                height: 20
                            }
                        ],
                        id: 'HkyXs',
                        data: {
                            topic: {
                                children: [
                                    {
                                        text: '文文文文文文'
                                    }
                                ]
                            }
                        },
                        width: 84,
                        height: 20
                    },
                    {
                        children: [
                            {
                                children: [
                                    {
                                        children: [],
                                        id: 'czhiP',
                                        data: {
                                            topic: {
                                                children: [
                                                    {
                                                        text: '文文文文文文文-文文-文文文文文文'
                                                    }
                                                ]
                                            }
                                        },
                                        width: 223,
                                        height: 20,
                                        points: [[0, 0]]
                                    }
                                ],
                                id: 'aNiDT',
                                data: {
                                    topic: {
                                        children: [
                                            {
                                                text: '文文文文文文'
                                            }
                                        ]
                                    }
                                },
                                width: 84,
                                height: 20
                            }
                        ],
                        id: 'pbbyR',
                        data: {
                            topic: {
                                children: [
                                    {
                                        text: '文文'
                                    }
                                ]
                            }
                        },
                        width: 28,
                        height: 20
                    }
                ],
                id: 'ejXWp',
                data: {
                    topic: {
                        children: [
                            {
                                text: '文文文文'
                            }
                        ]
                    }
                },
                width: 56,
                height: 20
            },
            {
                children: [
                    {
                        children: [
                            {
                                children: [
                                    {
                                        children: [
                                            {
                                                children: [
                                                    {
                                                        children: [
                                                            {
                                                                children: [
                                                                    {
                                                                        children: [],
                                                                        id: 'cAfDc',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文文文文文文文文文文文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 182,
                                                                        height: 20
                                                                    },
                                                                    {
                                                                        children: [],
                                                                        id: 'xaHwM',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文文文文文文文文文文文文文文文文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 252,
                                                                        height: 20
                                                                    }
                                                                ],
                                                                id: 'HnEnw',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 56,
                                                                height: 20
                                                            },
                                                            {
                                                                children: [
                                                                    {
                                                                        children: [],
                                                                        id: 'ECwNE',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文文文文文文文文文文文文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 196,
                                                                        height: 20
                                                                    },
                                                                    {
                                                                        children: [],
                                                                        id: 'JXyEP',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文文文文文文文文文文文文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 196,
                                                                        height: 20
                                                                    }
                                                                ],
                                                                id: 'JXySG',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 56,
                                                                height: 20
                                                            }
                                                        ],
                                                        id: 'wBYXs',
                                                        data: {
                                                            topic: {
                                                                children: [
                                                                    {
                                                                        text: '文文文文'
                                                                    }
                                                                ]
                                                            }
                                                        },
                                                        width: 56,
                                                        height: 20
                                                    },
                                                    {
                                                        children: [
                                                            {
                                                                children: [
                                                                    {
                                                                        children: [
                                                                            {
                                                                                children: [],
                                                                                id: 'TpHbY',
                                                                                data: {
                                                                                    topic: {
                                                                                        children: [
                                                                                            {
                                                                                                text: '文文“文文3文文”'
                                                                                            }
                                                                                        ]
                                                                                    }
                                                                                },
                                                                                width: 121,
                                                                                height: 20
                                                                            }
                                                                        ],
                                                                        id: 'zfyWF',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 56,
                                                                        height: 20
                                                                    },
                                                                    {
                                                                        children: [
                                                                            {
                                                                                children: [],
                                                                                id: 'adRkX',
                                                                                data: {
                                                                                    topic: {
                                                                                        children: [
                                                                                            {
                                                                                                text: '文文3文文'
                                                                                            }
                                                                                        ]
                                                                                    }
                                                                                },
                                                                                width: 65,
                                                                                height: 20
                                                                            },
                                                                            {
                                                                                children: [],
                                                                                id: 'MGYHf',
                                                                                data: {
                                                                                    topic: {
                                                                                        children: [
                                                                                            {
                                                                                                text: '文文2文文'
                                                                                            }
                                                                                        ]
                                                                                    }
                                                                                },
                                                                                width: 65,
                                                                                height: 20,
                                                                                points: [[0, 0]]
                                                                            },
                                                                            {
                                                                                children: [],
                                                                                id: 'GBwjJ',
                                                                                data: {
                                                                                    topic: {
                                                                                        children: [
                                                                                            {
                                                                                                text: '文文1文文'
                                                                                            }
                                                                                        ]
                                                                                    }
                                                                                },
                                                                                width: 65,
                                                                                height: 20,
                                                                                points: [[0, 0]]
                                                                            }
                                                                        ],
                                                                        id: 'XMxzC',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 56,
                                                                        height: 20
                                                                    },
                                                                    {
                                                                        children: [],
                                                                        id: 'dFJpT',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 56,
                                                                        height: 20
                                                                    }
                                                                ],
                                                                id: 'bxdKX',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 56,
                                                                height: 20
                                                            },
                                                            {
                                                                children: [
                                                                    {
                                                                        children: [
                                                                            {
                                                                                children: [],
                                                                                id: 'PteGp',
                                                                                data: {
                                                                                    topic: {
                                                                                        children: [
                                                                                            {
                                                                                                text: '文文文文文文文'
                                                                                            }
                                                                                        ]
                                                                                    }
                                                                                },
                                                                                width: 98,
                                                                                height: 20
                                                                            }
                                                                        ],
                                                                        id: 'iePdP',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 42,
                                                                        height: 20
                                                                    },
                                                                    {
                                                                        children: [
                                                                            {
                                                                                children: [],
                                                                                id: 'jRdYC',
                                                                                data: {
                                                                                    topic: {
                                                                                        children: [
                                                                                            {
                                                                                                text: '文文文文文文文'
                                                                                            }
                                                                                        ]
                                                                                    }
                                                                                },
                                                                                width: 98,
                                                                                height: 20
                                                                            }
                                                                        ],
                                                                        id: 'ARWba',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 56,
                                                                        height: 20
                                                                    }
                                                                ],
                                                                id: 'JhTSy',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 56,
                                                                height: 20
                                                            }
                                                        ],
                                                        id: 'ipYNz',
                                                        data: {
                                                            topic: {
                                                                children: [
                                                                    {
                                                                        text: '文文'
                                                                    }
                                                                ]
                                                            }
                                                        },
                                                        width: 28,
                                                        height: 20
                                                    },
                                                    {
                                                        children: [
                                                            {
                                                                children: [],
                                                                id: 'ADWCT',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文文文文文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 98,
                                                                height: 20
                                                            },
                                                            {
                                                                children: [],
                                                                id: 'pdWBY',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文文文文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 84,
                                                                height: 20
                                                            }
                                                        ],
                                                        id: 'fxRdk',
                                                        data: {
                                                            topic: {
                                                                children: [
                                                                    {
                                                                        text: '文文文文文文'
                                                                    }
                                                                ]
                                                            }
                                                        },
                                                        width: 84,
                                                        height: 20
                                                    },
                                                    {
                                                        children: [
                                                            {
                                                                children: [
                                                                    {
                                                                        children: [],
                                                                        id: 'ZNxPH',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 56,
                                                                        height: 20
                                                                    },
                                                                    {
                                                                        children: [],
                                                                        id: 'NrPCT',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 56,
                                                                        height: 20
                                                                    }
                                                                ],
                                                                id: 'ckRef',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: 'tab'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 22,
                                                                height: 20
                                                            },
                                                            {
                                                                children: [
                                                                    {
                                                                        children: [
                                                                            {
                                                                                children: [],
                                                                                id: 'EyQxs',
                                                                                data: {
                                                                                    topic: {
                                                                                        children: [
                                                                                            {
                                                                                                text: '文文文文文文文，文文文文文文'
                                                                                            }
                                                                                        ]
                                                                                    }
                                                                                },
                                                                                width: 196,
                                                                                height: 20
                                                                            }
                                                                        ],
                                                                        id: 'JaYjm',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 56,
                                                                        height: 20
                                                                    }
                                                                ],
                                                                id: 'cfRFM',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 56,
                                                                height: 20
                                                            },
                                                            {
                                                                children: [
                                                                    {
                                                                        children: [],
                                                                        id: 'hZQZK',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 56,
                                                                        height: 20
                                                                    }
                                                                ],
                                                                id: 'MMwEQ',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文文文文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 84,
                                                                height: 20
                                                            },
                                                            {
                                                                children: [],
                                                                id: 'fDBGG',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文文文文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 84,
                                                                height: 20
                                                            },
                                                            {
                                                                children: [],
                                                                id: 'pQdhj',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文文文文文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 98,
                                                                height: 20
                                                            }
                                                        ],
                                                        id: 'sjybQ',
                                                        data: {
                                                            topic: {
                                                                children: [
                                                                    {
                                                                        text: '文文文文文文文文'
                                                                    }
                                                                ]
                                                            }
                                                        },
                                                        width: 112,
                                                        height: 20
                                                    },
                                                    {
                                                        children: [],
                                                        id: 'JdiyG',
                                                        data: {
                                                            topic: {
                                                                children: [
                                                                    {
                                                                        text: '文文文文'
                                                                    }
                                                                ]
                                                            }
                                                        },
                                                        width: 56,
                                                        height: 20
                                                    },
                                                    {
                                                        children: [],
                                                        id: 'jmZjY',
                                                        data: {
                                                            topic: {
                                                                children: [
                                                                    {
                                                                        text: '文文文文文'
                                                                    }
                                                                ]
                                                            }
                                                        },
                                                        width: 70,
                                                        height: 20
                                                    },
                                                    {
                                                        children: [],
                                                        id: 'BFyJe',
                                                        data: {
                                                            topic: {
                                                                children: [
                                                                    {
                                                                        text: '文文文文文文'
                                                                    }
                                                                ]
                                                            }
                                                        },
                                                        width: 84,
                                                        height: 20
                                                    }
                                                ],
                                                id: 'bawSF',
                                                data: {
                                                    topic: {
                                                        children: [
                                                            {
                                                                text: '文文文文'
                                                            }
                                                        ]
                                                    }
                                                },
                                                width: 56,
                                                height: 20
                                            },
                                            {
                                                children: [
                                                    {
                                                        children: [
                                                            {
                                                                children: [
                                                                    {
                                                                        children: [],
                                                                        id: 'GFPDw',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文文文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 70,
                                                                        height: 20
                                                                    }
                                                                ],
                                                                id: 'mTWXi',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 56,
                                                                height: 20
                                                            },
                                                            {
                                                                children: [
                                                                    {
                                                                        children: [],
                                                                        id: 'rQmWG',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文，文文文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 98,
                                                                        height: 20
                                                                    },
                                                                    {
                                                                        children: [
                                                                            {
                                                                                children: [],
                                                                                id: 'CEjFD',
                                                                                data: {
                                                                                    topic: {
                                                                                        children: [
                                                                                            {
                                                                                                text: '文文文文文文文文文文xx文x文'
                                                                                            }
                                                                                        ]
                                                                                    }
                                                                                },
                                                                                width: 190,
                                                                                height: 20,
                                                                                points: [[0, 0]]
                                                                            }
                                                                        ],
                                                                        id: 'CempX',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 14,
                                                                        height: 20
                                                                    },
                                                                    {
                                                                        children: [
                                                                            {
                                                                                children: [],
                                                                                id: 'YQKax',
                                                                                data: {
                                                                                    topic: {
                                                                                        children: [
                                                                                            {
                                                                                                text: '文文文文文文文文文文xx文x文-xx文x文'
                                                                                            }
                                                                                        ]
                                                                                    }
                                                                                },
                                                                                width: 245,
                                                                                height: 20
                                                                            }
                                                                        ],
                                                                        id: 'PWjmp',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 42,
                                                                        height: 20
                                                                    }
                                                                ],
                                                                id: 'yAKFJ',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 56,
                                                                height: 20
                                                            },
                                                            {
                                                                children: [
                                                                    {
                                                                        children: [],
                                                                        id: 'JJjth',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文文文、文文文文、文文文文文文、文文文文文文文、文文文文文文、文文文文文文、文文文文文文、文文文（文文文/文文文文）'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 476,
                                                                        height: 40
                                                                    }
                                                                ],
                                                                id: 'DtfEf',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 56,
                                                                height: 20
                                                            },
                                                            {
                                                                children: [
                                                                    {
                                                                        children: [],
                                                                        id: 'ajTJM',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文：文文文文文文文文文文文文文文文文文文文文文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 350,
                                                                        height: 20
                                                                    }
                                                                ],
                                                                id: 'NiPKW',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 28,
                                                                height: 20
                                                            },
                                                            {
                                                                children: [
                                                                    {
                                                                        children: [
                                                                            {
                                                                                children: [],
                                                                                id: 'dXYTB',
                                                                                data: {
                                                                                    topic: {
                                                                                        children: [
                                                                                            {
                                                                                                text: '文文文文“文文文文文文文文(文文)”'
                                                                                            }
                                                                                        ]
                                                                                    }
                                                                                },
                                                                                width: 234,
                                                                                height: 20
                                                                            }
                                                                        ],
                                                                        id: 'GYkNJ',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 56,
                                                                        height: 20
                                                                    },
                                                                    {
                                                                        children: [
                                                                            {
                                                                                children: [],
                                                                                id: 'xrZyY',
                                                                                data: {
                                                                                    topic: {
                                                                                        children: [
                                                                                            {
                                                                                                text: '文文文文“文文文文文文文文(文文文文)”'
                                                                                            }
                                                                                        ]
                                                                                    }
                                                                                },
                                                                                width: 262,
                                                                                height: 20,
                                                                                points: [[0, 0]]
                                                                            }
                                                                        ],
                                                                        id: 'nJmMP',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文文文文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 84,
                                                                        height: 20
                                                                    }
                                                                ],
                                                                id: 'wNSsS',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 56,
                                                                height: 20
                                                            }
                                                        ],
                                                        id: 'TxfbZ',
                                                        data: {
                                                            topic: {
                                                                children: [
                                                                    {
                                                                        text: '文文文文文文'
                                                                    }
                                                                ]
                                                            }
                                                        },
                                                        width: 84,
                                                        height: 20
                                                    },
                                                    {
                                                        children: [
                                                            {
                                                                children: [
                                                                    {
                                                                        children: [],
                                                                        id: 'KAJAA',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文文文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 70,
                                                                        height: 20
                                                                    }
                                                                ],
                                                                id: 'wnPTm',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 56,
                                                                height: 20,
                                                                points: [[0, 0]]
                                                            },
                                                            {
                                                                children: [
                                                                    {
                                                                        children: [],
                                                                        id: 'kZihw',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文，文文文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 98,
                                                                        height: 20
                                                                    },
                                                                    {
                                                                        children: [
                                                                            {
                                                                                children: [],
                                                                                id: 'xYSyM',
                                                                                data: {
                                                                                    topic: {
                                                                                        children: [
                                                                                            {
                                                                                                text: '文文文文文文文文文文xx文x文'
                                                                                            }
                                                                                        ]
                                                                                    }
                                                                                },
                                                                                width: 190,
                                                                                height: 20,
                                                                                points: [[0, 0]]
                                                                            }
                                                                        ],
                                                                        id: 'FhxtM',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 14,
                                                                        height: 20
                                                                    },
                                                                    {
                                                                        children: [
                                                                            {
                                                                                children: [],
                                                                                id: 'ptbcA',
                                                                                data: {
                                                                                    topic: {
                                                                                        children: [
                                                                                            {
                                                                                                text: '文文文文文文文文文文xx文x文-xx文x文'
                                                                                            }
                                                                                        ]
                                                                                    }
                                                                                },
                                                                                width: 245,
                                                                                height: 20
                                                                            }
                                                                        ],
                                                                        id: 'DbjbX',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 42,
                                                                        height: 20
                                                                    }
                                                                ],
                                                                id: 'KEzri',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 56,
                                                                height: 20,
                                                                points: [[0, 116]]
                                                            },
                                                            {
                                                                children: [
                                                                    {
                                                                        children: [],
                                                                        id: 'yWmyw',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文文文、文文文文、文文文文、文文文文文文、文文文文文文、文文文文文文、文文文（文文文/文文文文）'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 476,
                                                                        height: 40
                                                                    }
                                                                ],
                                                                id: 'pBYBc',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 56,
                                                                height: 20,
                                                                points: [[0, 0]]
                                                            },
                                                            {
                                                                children: [
                                                                    {
                                                                        children: [],
                                                                        id: 'AXBXr',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文：文文文文文文文文文文文文文文文文文文文文文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 350,
                                                                        height: 20
                                                                    }
                                                                ],
                                                                id: 'QsPWK',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 28,
                                                                height: 20,
                                                                points: [[0, 0]]
                                                            },
                                                            {
                                                                children: [
                                                                    {
                                                                        children: [
                                                                            {
                                                                                children: [],
                                                                                id: 'WrxMH',
                                                                                data: {
                                                                                    topic: {
                                                                                        children: [
                                                                                            {
                                                                                                text: '文文文文“文文文文文文文文(文文)”'
                                                                                            }
                                                                                        ]
                                                                                    }
                                                                                },
                                                                                width: 234,
                                                                                height: 20
                                                                            }
                                                                        ],
                                                                        id: 'XsTNT',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 56,
                                                                        height: 20
                                                                    },
                                                                    {
                                                                        children: [
                                                                            {
                                                                                children: [],
                                                                                id: 'xAxYa',
                                                                                data: {
                                                                                    topic: {
                                                                                        children: [
                                                                                            {
                                                                                                text: '文文文文“文文文文文文文文(文文文文)”'
                                                                                            }
                                                                                        ]
                                                                                    }
                                                                                },
                                                                                width: 262,
                                                                                height: 20,
                                                                                points: [[0, 0]]
                                                                            }
                                                                        ],
                                                                        id: 'amFQc',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文文文文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 84,
                                                                        height: 20
                                                                    }
                                                                ],
                                                                id: 'wJWPr',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 56,
                                                                height: 20,
                                                                points: [[0, 0]]
                                                            }
                                                        ],
                                                        id: 'bceaD',
                                                        data: {
                                                            topic: {
                                                                children: [
                                                                    {
                                                                        text: '文文文文文文'
                                                                    }
                                                                ]
                                                            }
                                                        },
                                                        width: 84,
                                                        height: 20
                                                    },
                                                    {
                                                        children: [
                                                            {
                                                                children: [
                                                                    {
                                                                        children: [],
                                                                        id: 'DYDrX',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文文文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 70,
                                                                        height: 20
                                                                    }
                                                                ],
                                                                id: 'rnafT',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 56,
                                                                height: 20,
                                                                points: [[0, 0]]
                                                            },
                                                            {
                                                                children: [
                                                                    {
                                                                        children: [],
                                                                        id: 'hndJZ',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文，文文文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 98,
                                                                        height: 20
                                                                    },
                                                                    {
                                                                        children: [
                                                                            {
                                                                                children: [],
                                                                                id: 'bknHG',
                                                                                data: {
                                                                                    topic: {
                                                                                        children: [
                                                                                            {
                                                                                                text: '文文文文文文文文文文xx文x文'
                                                                                            }
                                                                                        ]
                                                                                    }
                                                                                },
                                                                                width: 190,
                                                                                height: 20,
                                                                                points: [[0, 0]]
                                                                            }
                                                                        ],
                                                                        id: 'WmYtE',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 14,
                                                                        height: 20
                                                                    },
                                                                    {
                                                                        children: [
                                                                            {
                                                                                children: [],
                                                                                id: 'wWphY',
                                                                                data: {
                                                                                    topic: {
                                                                                        children: [
                                                                                            {
                                                                                                text: '文文文文文文文文文文xx文x文-xx文x文'
                                                                                            }
                                                                                        ]
                                                                                    }
                                                                                },
                                                                                width: 245,
                                                                                height: 20
                                                                            }
                                                                        ],
                                                                        id: 'MAhSM',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 42,
                                                                        height: 20
                                                                    }
                                                                ],
                                                                id: 'mBKis',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 56,
                                                                height: 20,
                                                                points: [[0, 116]]
                                                            },
                                                            {
                                                                children: [
                                                                    {
                                                                        children: [],
                                                                        id: 'mkNEt',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文文文、文文文文、文文文文文文、文文文、文文文文文文、文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 420,
                                                                        height: 20
                                                                    }
                                                                ],
                                                                id: 'jaEYC',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 56,
                                                                height: 20,
                                                                points: [[0, 0]]
                                                            },
                                                            {
                                                                children: [
                                                                    {
                                                                        children: [],
                                                                        id: 'ynbFj',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文：文文文文文文文文文文文文文文文文文，文文文文文文文文文文文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 462,
                                                                        height: 20
                                                                    }
                                                                ],
                                                                id: 'ybPrk',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 28,
                                                                height: 20
                                                            },
                                                            {
                                                                children: [
                                                                    {
                                                                        children: [
                                                                            {
                                                                                children: [],
                                                                                id: 'PcWRN',
                                                                                data: {
                                                                                    topic: {
                                                                                        children: [
                                                                                            {
                                                                                                text: '文文文文“文文文文文文文(文文)”'
                                                                                            }
                                                                                        ]
                                                                                    }
                                                                                },
                                                                                width: 220,
                                                                                height: 20
                                                                            }
                                                                        ],
                                                                        id: 'EfwTS',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 56,
                                                                        height: 20
                                                                    },
                                                                    {
                                                                        children: [
                                                                            {
                                                                                children: [],
                                                                                id: 'TphcT',
                                                                                data: {
                                                                                    topic: {
                                                                                        children: [
                                                                                            {
                                                                                                text: '文文文文“文文文文文文文(文文文文)”'
                                                                                            }
                                                                                        ]
                                                                                    }
                                                                                },
                                                                                width: 248,
                                                                                height: 20,
                                                                                points: [[0, 0]]
                                                                            }
                                                                        ],
                                                                        id: 'dwcwC',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文文文文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 84,
                                                                        height: 20
                                                                    }
                                                                ],
                                                                id: 'AyrhS',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 56,
                                                                height: 20,
                                                                points: [[0, 0]]
                                                            }
                                                        ],
                                                        id: 'hKzBZ',
                                                        data: {
                                                            topic: {
                                                                children: [
                                                                    {
                                                                        text: '文文文文文'
                                                                    }
                                                                ]
                                                            }
                                                        },
                                                        width: 70,
                                                        height: 20
                                                    },
                                                    {
                                                        children: [
                                                            {
                                                                children: [
                                                                    {
                                                                        children: [],
                                                                        id: 'tMain',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文文文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 70,
                                                                        height: 20
                                                                    }
                                                                ],
                                                                id: 'hsMjw',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 56,
                                                                height: 20,
                                                                points: [[0, 0]]
                                                            },
                                                            {
                                                                children: [
                                                                    {
                                                                        children: [],
                                                                        id: 'YtxbJ',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文，文文文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 98,
                                                                        height: 20
                                                                    },
                                                                    {
                                                                        children: [
                                                                            {
                                                                                children: [],
                                                                                id: 'fZzXf',
                                                                                data: {
                                                                                    topic: {
                                                                                        children: [
                                                                                            {
                                                                                                text: '文文文文文文文文文文xx文x文'
                                                                                            }
                                                                                        ]
                                                                                    }
                                                                                },
                                                                                width: 190,
                                                                                height: 20,
                                                                                points: [[0, 0]]
                                                                            }
                                                                        ],
                                                                        id: 'rkmRd',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 14,
                                                                        height: 20
                                                                    },
                                                                    {
                                                                        children: [
                                                                            {
                                                                                children: [],
                                                                                id: 'NNbZy',
                                                                                data: {
                                                                                    topic: {
                                                                                        children: [
                                                                                            {
                                                                                                text: '文文文文文文文文文文xx文x文-xx文x文'
                                                                                            }
                                                                                        ]
                                                                                    }
                                                                                },
                                                                                width: 245,
                                                                                height: 20
                                                                            }
                                                                        ],
                                                                        id: 'GehYp',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 42,
                                                                        height: 20
                                                                    }
                                                                ],
                                                                id: 'iRHMd',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 56,
                                                                height: 20,
                                                                points: [[0, 116]]
                                                            },
                                                            {
                                                                children: [
                                                                    {
                                                                        children: [],
                                                                        id: 'hkTAn',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文文文、文文文文、文文文文、文文文文文文、文文文文文文、文文文（文文文/文文文文）'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 476,
                                                                        height: 40
                                                                    }
                                                                ],
                                                                id: 'weKzw',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 56,
                                                                height: 20,
                                                                points: [[0, 0]]
                                                            },
                                                            {
                                                                children: [
                                                                    {
                                                                        children: [],
                                                                        id: 'asFeK',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文：文文文文文文文文文文文文文文文文文文文文文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 350,
                                                                        height: 20
                                                                    }
                                                                ],
                                                                id: 'wjjWx',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 28,
                                                                height: 20,
                                                                points: [[0, 0]]
                                                            },
                                                            {
                                                                children: [
                                                                    {
                                                                        children: [
                                                                            {
                                                                                children: [],
                                                                                id: 'YwbMZ',
                                                                                data: {
                                                                                    topic: {
                                                                                        children: [
                                                                                            {
                                                                                                text: '文文文文“文文文文文文文文文(文文)”'
                                                                                            }
                                                                                        ]
                                                                                    }
                                                                                },
                                                                                width: 248,
                                                                                height: 20
                                                                            }
                                                                        ],
                                                                        id: 'twMwW',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 56,
                                                                        height: 20
                                                                    },
                                                                    {
                                                                        children: [
                                                                            {
                                                                                children: [],
                                                                                id: 'ZdjCy',
                                                                                data: {
                                                                                    topic: {
                                                                                        children: [
                                                                                            {
                                                                                                text: '文文文文“文文文文文文文文文(文文文文)”'
                                                                                            }
                                                                                        ]
                                                                                    }
                                                                                },
                                                                                width: 276,
                                                                                height: 20,
                                                                                points: [[0, 0]]
                                                                            }
                                                                        ],
                                                                        id: 'EfDNn',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文文文文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 84,
                                                                        height: 20
                                                                    }
                                                                ],
                                                                id: 'BCEPC',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 56,
                                                                height: 20,
                                                                points: [[0, 0]]
                                                            }
                                                        ],
                                                        id: 'WQSWZ',
                                                        data: {
                                                            topic: {
                                                                children: [
                                                                    {
                                                                        text: '文文文文文文文'
                                                                    }
                                                                ]
                                                            }
                                                        },
                                                        width: 98,
                                                        height: 20
                                                    },
                                                    {
                                                        children: [
                                                            {
                                                                children: [
                                                                    {
                                                                        children: [],
                                                                        id: 'XYzED',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文文文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 70,
                                                                        height: 20
                                                                    }
                                                                ],
                                                                id: 'Sjist',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 56,
                                                                height: 20,
                                                                points: [[0, 0]]
                                                            },
                                                            {
                                                                children: [
                                                                    {
                                                                        children: [],
                                                                        id: 'BiwDT',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文，文文文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 98,
                                                                        height: 20
                                                                    },
                                                                    {
                                                                        children: [
                                                                            {
                                                                                children: [],
                                                                                id: 'nFxHS',
                                                                                data: {
                                                                                    topic: {
                                                                                        children: [
                                                                                            {
                                                                                                text: '文文文文文文文文文文xx文x文'
                                                                                            }
                                                                                        ]
                                                                                    }
                                                                                },
                                                                                width: 190,
                                                                                height: 20,
                                                                                points: [[0, 0]]
                                                                            }
                                                                        ],
                                                                        id: 'GmRpM',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 14,
                                                                        height: 20
                                                                    },
                                                                    {
                                                                        children: [
                                                                            {
                                                                                children: [],
                                                                                id: 'NdfGk',
                                                                                data: {
                                                                                    topic: {
                                                                                        children: [
                                                                                            {
                                                                                                text: '文文文文文文文文文文xx文x文-xx文x文'
                                                                                            }
                                                                                        ]
                                                                                    }
                                                                                },
                                                                                width: 245,
                                                                                height: 20
                                                                            }
                                                                        ],
                                                                        id: 'pwjcQ',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 42,
                                                                        height: 20
                                                                    }
                                                                ],
                                                                id: 'hrPkS',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 56,
                                                                height: 20,
                                                                points: [[0, 116]]
                                                            },
                                                            {
                                                                children: [
                                                                    {
                                                                        children: [],
                                                                        id: 'FQGkh',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文文文、文文文文、文文文文、文文文文文文、文文文、文文文文文文、文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 476,
                                                                        height: 40
                                                                    }
                                                                ],
                                                                id: 'DxMDM',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 56,
                                                                height: 20,
                                                                points: [[0, 0]]
                                                            },
                                                            {
                                                                children: [
                                                                    {
                                                                        children: [],
                                                                        id: 'jKWcM',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文：文文文文文文文文文文文文文文文文文，文文文文文文文文文文文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 462,
                                                                        height: 20
                                                                    }
                                                                ],
                                                                id: 'bBpxc',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 28,
                                                                height: 20
                                                            },
                                                            {
                                                                children: [
                                                                    {
                                                                        children: [
                                                                            {
                                                                                children: [],
                                                                                id: 'cfjFi',
                                                                                data: {
                                                                                    topic: {
                                                                                        children: [
                                                                                            {
                                                                                                text: '文文文文“文文文文文文文文文文(文文)”'
                                                                                            }
                                                                                        ]
                                                                                    }
                                                                                },
                                                                                width: 262,
                                                                                height: 20
                                                                            }
                                                                        ],
                                                                        id: 'iACKh',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 56,
                                                                        height: 20
                                                                    },
                                                                    {
                                                                        children: [
                                                                            {
                                                                                children: [],
                                                                                id: 'MQzTk',
                                                                                data: {
                                                                                    topic: {
                                                                                        children: [
                                                                                            {
                                                                                                text: '文文文文“文文文文文文文文文文(文文文文)”'
                                                                                            }
                                                                                        ]
                                                                                    }
                                                                                },
                                                                                width: 290,
                                                                                height: 20,
                                                                                points: [[0, 0]]
                                                                            }
                                                                        ],
                                                                        id: 'tDwrW',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文文文文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 84,
                                                                        height: 20
                                                                    }
                                                                ],
                                                                id: 'xmHNs',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 56,
                                                                height: 20,
                                                                points: [[0, 0]]
                                                            }
                                                        ],
                                                        id: 'crppT',
                                                        data: {
                                                            topic: {
                                                                children: [
                                                                    {
                                                                        text: '文文文文文文文文'
                                                                    }
                                                                ]
                                                            }
                                                        },
                                                        width: 112,
                                                        height: 20
                                                    }
                                                ],
                                                id: 'pCaZi',
                                                data: {
                                                    topic: {
                                                        children: [
                                                            {
                                                                text: '文文文文'
                                                            }
                                                        ]
                                                    }
                                                },
                                                width: 56,
                                                height: 20
                                            }
                                        ],
                                        id: 'EJSHp',
                                        data: {
                                            topic: {
                                                children: [
                                                    {
                                                        text: '文文文文'
                                                    }
                                                ]
                                            }
                                        },
                                        width: 56,
                                        height: 20
                                    },
                                    {
                                        children: [
                                            {
                                                children: [
                                                    {
                                                        children: [
                                                            {
                                                                children: [
                                                                    {
                                                                        children: [],
                                                                        id: 'tDDPY',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 42,
                                                                        height: 20
                                                                    }
                                                                ],
                                                                id: 'swGFj',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 42,
                                                                height: 20
                                                            }
                                                        ],
                                                        id: 'rChyt',
                                                        data: {
                                                            topic: {
                                                                children: [
                                                                    {
                                                                        text: '文文文文'
                                                                    }
                                                                ]
                                                            }
                                                        },
                                                        width: 56,
                                                        height: 20
                                                    },
                                                    {
                                                        children: [
                                                            {
                                                                children: [
                                                                    {
                                                                        children: [],
                                                                        id: 'sNieC',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文文文文文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 98,
                                                                        height: 20
                                                                    }
                                                                ],
                                                                id: 'sWnmx',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 42,
                                                                height: 20,
                                                                points: [[0, 0]]
                                                            },
                                                            {
                                                                children: [
                                                                    {
                                                                        children: [],
                                                                        id: 'zdtzH',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文文文文文文文文文文文文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 196,
                                                                        height: 20
                                                                    }
                                                                ],
                                                                id: 'axyxK',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 56,
                                                                height: 20,
                                                                points: [[0, 58]]
                                                            }
                                                        ],
                                                        id: 'ncrHw',
                                                        data: {
                                                            topic: {
                                                                children: [
                                                                    {
                                                                        text: '文文'
                                                                    }
                                                                ]
                                                            }
                                                        },
                                                        width: 28,
                                                        height: 20
                                                    },
                                                    {
                                                        children: [],
                                                        id: 'Pfxct',
                                                        data: {
                                                            topic: {
                                                                children: [
                                                                    {
                                                                        text: '文文'
                                                                    }
                                                                ]
                                                            }
                                                        },
                                                        width: 28,
                                                        height: 20
                                                    },
                                                    {
                                                        children: [],
                                                        id: 'QdrCQ',
                                                        data: {
                                                            topic: {
                                                                children: [
                                                                    {
                                                                        text: '文文文文'
                                                                    }
                                                                ]
                                                            }
                                                        },
                                                        width: 56,
                                                        height: 20
                                                    }
                                                ],
                                                id: 'edKER',
                                                data: {
                                                    topic: {
                                                        children: [
                                                            {
                                                                text: '文文'
                                                            }
                                                        ]
                                                    }
                                                },
                                                width: 28,
                                                height: 20
                                            },
                                            {
                                                children: [
                                                    {
                                                        children: [
                                                            {
                                                                children: [],
                                                                id: 'SnNRQ',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文、文文文文、文文文、文文文、文文文文、文文文、文文文、文文文、文文文文文、文文文文、文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 476,
                                                                height: 40
                                                            }
                                                        ],
                                                        id: 'HhTHd',
                                                        data: {
                                                            topic: {
                                                                children: [
                                                                    {
                                                                        text: '文文'
                                                                    }
                                                                ]
                                                            }
                                                        },
                                                        width: 28,
                                                        height: 20
                                                    },
                                                    {
                                                        children: [
                                                            {
                                                                children: [
                                                                    {
                                                                        children: [],
                                                                        id: 'QsRRd',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文文文文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 84,
                                                                        height: 20
                                                                    }
                                                                ],
                                                                id: 'prZmP',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 56,
                                                                height: 20
                                                            },
                                                            {
                                                                children: [
                                                                    {
                                                                        children: [],
                                                                        id: 'ByHrw',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文文、文文文、文文文文、文文文、文文文、文文文、文文文文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 420,
                                                                        height: 20
                                                                    }
                                                                ],
                                                                id: 'QByMx',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 56,
                                                                height: 20
                                                            },
                                                            {
                                                                children: [
                                                                    {
                                                                        children: [
                                                                            {
                                                                                children: [],
                                                                                id: 'mZfRj',
                                                                                data: {
                                                                                    topic: {
                                                                                        children: [
                                                                                            {
                                                                                                text: '文文文文'
                                                                                            }
                                                                                        ]
                                                                                    }
                                                                                },
                                                                                width: 56,
                                                                                height: 20
                                                                            }
                                                                        ],
                                                                        id: 'bSNak',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 56,
                                                                        height: 20,
                                                                        points: [[0, 0]]
                                                                    },
                                                                    {
                                                                        children: [
                                                                            {
                                                                                children: [],
                                                                                id: 'GBnXP',
                                                                                data: {
                                                                                    topic: {
                                                                                        children: [
                                                                                            {
                                                                                                text: '文文文文'
                                                                                            }
                                                                                        ]
                                                                                    }
                                                                                },
                                                                                width: 56,
                                                                                height: 20
                                                                            }
                                                                        ],
                                                                        id: 'twTfz',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 56,
                                                                        height: 20,
                                                                        points: [[0, 58]]
                                                                    },
                                                                    {
                                                                        children: [
                                                                            {
                                                                                children: [],
                                                                                id: 'YESsS',
                                                                                data: {
                                                                                    topic: {
                                                                                        children: [
                                                                                            {
                                                                                                text: '文文文文文文'
                                                                                            }
                                                                                        ]
                                                                                    }
                                                                                },
                                                                                width: 84,
                                                                                height: 20
                                                                            }
                                                                        ],
                                                                        id: 'bNTKB',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 56,
                                                                        height: 20,
                                                                        points: [[0, 116]]
                                                                    }
                                                                ],
                                                                id: 'XFxsi',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 56,
                                                                height: 20
                                                            }
                                                        ],
                                                        id: 'QeeHP',
                                                        data: {
                                                            topic: {
                                                                children: [
                                                                    {
                                                                        text: '文文'
                                                                    }
                                                                ]
                                                            }
                                                        },
                                                        width: 28,
                                                        height: 20
                                                    },
                                                    {
                                                        children: [
                                                            {
                                                                children: [
                                                                    {
                                                                        children: [],
                                                                        id: 'wAedW',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文文文文文文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 112,
                                                                        height: 20
                                                                    }
                                                                ],
                                                                id: 'PCXws',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 28,
                                                                height: 20
                                                            },
                                                            {
                                                                children: [
                                                                    {
                                                                        children: [
                                                                            {
                                                                                children: [
                                                                                    {
                                                                                        children: [],
                                                                                        id: 'eEChe',
                                                                                        data: {
                                                                                            topic: {
                                                                                                children: [
                                                                                                    {
                                                                                                        text: '文文文文，文文'
                                                                                                    }
                                                                                                ]
                                                                                            }
                                                                                        },
                                                                                        width: 98,
                                                                                        height: 20
                                                                                    }
                                                                                ],
                                                                                id: 'AKHWT',
                                                                                data: {
                                                                                    topic: {
                                                                                        children: [
                                                                                            {
                                                                                                text: '文文文文文文'
                                                                                            }
                                                                                        ]
                                                                                    }
                                                                                },
                                                                                width: 84,
                                                                                height: 20
                                                                            },
                                                                            {
                                                                                children: [
                                                                                    {
                                                                                        children: [],
                                                                                        id: 'QJnrs',
                                                                                        data: {
                                                                                            topic: {
                                                                                                children: [
                                                                                                    {
                                                                                                        text: '文文文文'
                                                                                                    }
                                                                                                ]
                                                                                            }
                                                                                        },
                                                                                        width: 56,
                                                                                        height: 20
                                                                                    }
                                                                                ],
                                                                                id: 'XYMTb',
                                                                                data: {
                                                                                    topic: {
                                                                                        children: [
                                                                                            {
                                                                                                text: '文文文文文文'
                                                                                            }
                                                                                        ]
                                                                                    }
                                                                                },
                                                                                width: 84,
                                                                                height: 20,
                                                                                points: [[0, 0]]
                                                                            }
                                                                        ],
                                                                        id: 'hCQRN',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文文文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 70,
                                                                        height: 20
                                                                    },
                                                                    {
                                                                        children: [],
                                                                        id: 'MrQjQ',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文文文文文文文文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 140,
                                                                        height: 20
                                                                    }
                                                                ],
                                                                id: 'QnZbF',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 28,
                                                                height: 20
                                                            }
                                                        ],
                                                        id: 'GEQES',
                                                        data: {
                                                            topic: {
                                                                children: [
                                                                    {
                                                                        text: '文文'
                                                                    }
                                                                ]
                                                            }
                                                        },
                                                        width: 28,
                                                        height: 20
                                                    }
                                                ],
                                                id: 'fxhbN',
                                                data: {
                                                    topic: {
                                                        children: [
                                                            {
                                                                text: '文文'
                                                            }
                                                        ]
                                                    }
                                                },
                                                width: 28,
                                                height: 20
                                            },
                                            {
                                                children: [
                                                    {
                                                        children: [
                                                            {
                                                                children: [],
                                                                id: 'GeKCD',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文文文文文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 98,
                                                                height: 20
                                                            }
                                                        ],
                                                        id: 'Dxbim',
                                                        data: {
                                                            topic: {
                                                                children: [
                                                                    {
                                                                        text: '文文文文'
                                                                    }
                                                                ]
                                                            }
                                                        },
                                                        width: 56,
                                                        height: 20
                                                    },
                                                    {
                                                        children: [
                                                            {
                                                                children: [
                                                                    {
                                                                        children: [
                                                                            {
                                                                                children: [],
                                                                                id: 'rHpTn',
                                                                                data: {
                                                                                    topic: {
                                                                                        children: [
                                                                                            {
                                                                                                text: '文文文文文'
                                                                                            }
                                                                                        ]
                                                                                    }
                                                                                },
                                                                                width: 70,
                                                                                height: 20
                                                                            }
                                                                        ],
                                                                        id: 'ktJyK',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文文文文文文文文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 140,
                                                                        height: 20
                                                                    },
                                                                    {
                                                                        children: [
                                                                            {
                                                                                children: [],
                                                                                id: 'brxBp',
                                                                                data: {
                                                                                    topic: {
                                                                                        children: [
                                                                                            {
                                                                                                text: '文文文文文文文文'
                                                                                            }
                                                                                        ]
                                                                                    }
                                                                                },
                                                                                width: 112,
                                                                                height: 20
                                                                            }
                                                                        ],
                                                                        id: 'JNtYt',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文文文文文文文文文文文文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 196,
                                                                        height: 20,
                                                                        points: [[0, 0]]
                                                                    }
                                                                ],
                                                                id: 'Xcfry',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 42,
                                                                height: 20
                                                            }
                                                        ],
                                                        id: 'PWDJY',
                                                        data: {
                                                            topic: {
                                                                children: [
                                                                    {
                                                                        text: '文文文文'
                                                                    }
                                                                ]
                                                            }
                                                        },
                                                        width: 56,
                                                        height: 20
                                                    },
                                                    {
                                                        children: [
                                                            {
                                                                children: [],
                                                                id: 'ppQdG',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文文文文文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 98,
                                                                height: 20
                                                            }
                                                        ],
                                                        id: 'zzdRm',
                                                        data: {
                                                            topic: {
                                                                children: [
                                                                    {
                                                                        text: '文文文'
                                                                    }
                                                                ]
                                                            }
                                                        },
                                                        width: 42,
                                                        height: 20
                                                    },
                                                    {
                                                        children: [
                                                            {
                                                                children: [],
                                                                id: 'FEMBd',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文文文文文文文文文文文文、文文、文文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 280,
                                                                height: 20
                                                            }
                                                        ],
                                                        id: 'Zyzxt',
                                                        data: {
                                                            topic: {
                                                                children: [
                                                                    {
                                                                        text: '文文文文文文'
                                                                    }
                                                                ]
                                                            }
                                                        },
                                                        width: 84,
                                                        height: 20,
                                                        points: [[0, 0]]
                                                    },
                                                    {
                                                        children: [
                                                            {
                                                                children: [
                                                                    {
                                                                        children: [],
                                                                        id: 'hbdKx',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文文文文文文文文文文文/文文文文文文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 272,
                                                                        height: 20
                                                                    }
                                                                ],
                                                                id: 'SkmZS',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文文文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 70,
                                                                height: 20
                                                            },
                                                            {
                                                                children: [
                                                                    {
                                                                        children: [],
                                                                        id: 'YtrMP',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文文文文文文文文文文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 168,
                                                                        height: 20
                                                                    }
                                                                ],
                                                                id: 'ybcpc',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 28,
                                                                height: 20
                                                            }
                                                        ],
                                                        id: 'ydesH',
                                                        data: {
                                                            topic: {
                                                                children: [
                                                                    {
                                                                        text: '文文'
                                                                    }
                                                                ]
                                                            }
                                                        },
                                                        width: 28,
                                                        height: 20,
                                                        points: [[0, 0]]
                                                    }
                                                ],
                                                id: 'PTKhF',
                                                data: {
                                                    topic: {
                                                        children: [
                                                            {
                                                                text: '文文文文'
                                                            }
                                                        ]
                                                    }
                                                },
                                                width: 56,
                                                height: 20
                                            },
                                            {
                                                children: [
                                                    {
                                                        children: [
                                                            {
                                                                children: [],
                                                                id: 'yXRdK',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文：文文文文文文文文文文\n文文：文文文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 182,
                                                                height: 40
                                                            }
                                                        ],
                                                        id: 'nkXiM',
                                                        data: {
                                                            topic: {
                                                                children: [
                                                                    {
                                                                        text: '文文'
                                                                    }
                                                                ]
                                                            }
                                                        },
                                                        width: 28,
                                                        height: 20
                                                    },
                                                    {
                                                        children: [
                                                            {
                                                                children: [
                                                                    {
                                                                        children: [
                                                                            {
                                                                                children: [],
                                                                                id: 'axdQf',
                                                                                data: {
                                                                                    topic: {
                                                                                        children: [
                                                                                            {
                                                                                                text: '文文文文、文文文文、文文文文文'
                                                                                            }
                                                                                        ]
                                                                                    }
                                                                                },
                                                                                width: 210,
                                                                                height: 20
                                                                            }
                                                                        ],
                                                                        id: 'dNZKQ',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 28,
                                                                        height: 20
                                                                    },
                                                                    {
                                                                        children: [
                                                                            {
                                                                                children: [],
                                                                                id: 'tDPjY',
                                                                                data: {
                                                                                    topic: {
                                                                                        children: [
                                                                                            {
                                                                                                text: '文文文文文文文文文文文文'
                                                                                            }
                                                                                        ]
                                                                                    }
                                                                                },
                                                                                width: 168,
                                                                                height: 20
                                                                            }
                                                                        ],
                                                                        id: 'HcNfw',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 28,
                                                                        height: 20
                                                                    }
                                                                ],
                                                                id: 'pQHNM',
                                                                height: 20,
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 56
                                                            },
                                                            {
                                                                children: [
                                                                    {
                                                                        children: [
                                                                            {
                                                                                children: [],
                                                                                id: 'KQYPt',
                                                                                data: {
                                                                                    topic: {
                                                                                        children: [
                                                                                            {
                                                                                                text: '文文文文文、文文、文文'
                                                                                            }
                                                                                        ]
                                                                                    }
                                                                                },
                                                                                width: 154,
                                                                                height: 20
                                                                            }
                                                                        ],
                                                                        id: 'kcbGr',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 28,
                                                                        height: 20
                                                                    },
                                                                    {
                                                                        children: [
                                                                            {
                                                                                children: [
                                                                                    {
                                                                                        children: [],
                                                                                        id: 'tbapw',
                                                                                        data: {
                                                                                            topic: {
                                                                                                children: [
                                                                                                    {
                                                                                                        text: '文文文文文文文文文文文文文文文文文文文'
                                                                                                    }
                                                                                                ]
                                                                                            }
                                                                                        },
                                                                                        width: 266,
                                                                                        height: 20
                                                                                    }
                                                                                ],
                                                                                id: 'BWAXH',
                                                                                data: {
                                                                                    topic: {
                                                                                        children: [
                                                                                            {
                                                                                                text: '文文文文文'
                                                                                            }
                                                                                        ]
                                                                                    }
                                                                                },
                                                                                width: 70,
                                                                                height: 20,
                                                                                points: [[0, 0]]
                                                                            },
                                                                            {
                                                                                children: [
                                                                                    {
                                                                                        children: [],
                                                                                        id: 'dXfWH',
                                                                                        data: {
                                                                                            topic: {
                                                                                                children: [
                                                                                                    {
                                                                                                        text: '文文文文文文文文文文文文文文文文文文文'
                                                                                                    }
                                                                                                ]
                                                                                            }
                                                                                        },
                                                                                        width: 266,
                                                                                        height: 20
                                                                                    }
                                                                                ],
                                                                                id: 'YyNmY',
                                                                                data: {
                                                                                    topic: {
                                                                                        children: [
                                                                                            {
                                                                                                text: '文文'
                                                                                            }
                                                                                        ]
                                                                                    }
                                                                                },
                                                                                width: 28,
                                                                                height: 20,
                                                                                points: [[0, 0]]
                                                                            },
                                                                            {
                                                                                children: [
                                                                                    {
                                                                                        children: [],
                                                                                        id: 'cikxa',
                                                                                        data: {
                                                                                            topic: {
                                                                                                children: [
                                                                                                    {
                                                                                                        text: '文文/文文文文'
                                                                                                    }
                                                                                                ]
                                                                                            }
                                                                                        },
                                                                                        width: 90,
                                                                                        height: 20
                                                                                    }
                                                                                ],
                                                                                id: 'XfXRN',
                                                                                data: {
                                                                                    topic: {
                                                                                        children: [
                                                                                            {
                                                                                                text: '文文'
                                                                                            }
                                                                                        ]
                                                                                    }
                                                                                },
                                                                                width: 28,
                                                                                height: 20,
                                                                                points: [[0, 0]]
                                                                            }
                                                                        ],
                                                                        id: 'HPeZa',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 28,
                                                                        height: 20
                                                                    },
                                                                    {
                                                                        children: [
                                                                            {
                                                                                children: [
                                                                                    {
                                                                                        children: [],
                                                                                        id: 'HTeWM',
                                                                                        data: {
                                                                                            topic: {
                                                                                                children: [
                                                                                                    {
                                                                                                        text: '文文文文文文文文'
                                                                                                    }
                                                                                                ]
                                                                                            }
                                                                                        },
                                                                                        width: 112,
                                                                                        height: 20
                                                                                    }
                                                                                ],
                                                                                id: 'cnXwH',
                                                                                data: {
                                                                                    topic: {
                                                                                        children: [
                                                                                            {
                                                                                                text: '文文文文'
                                                                                            }
                                                                                        ]
                                                                                    }
                                                                                },
                                                                                width: 56,
                                                                                height: 20
                                                                            },
                                                                            {
                                                                                children: [
                                                                                    {
                                                                                        children: [
                                                                                            {
                                                                                                children: [],
                                                                                                id: 'RpHjc',
                                                                                                data: {
                                                                                                    topic: {
                                                                                                        children: [
                                                                                                            {
                                                                                                                text: '文文文文'
                                                                                                            }
                                                                                                        ]
                                                                                                    }
                                                                                                },
                                                                                                width: 56,
                                                                                                height: 20
                                                                                            }
                                                                                        ],
                                                                                        id: 'MRjCr',
                                                                                        data: {
                                                                                            topic: {
                                                                                                children: [
                                                                                                    {
                                                                                                        text: '文文文文'
                                                                                                    }
                                                                                                ]
                                                                                            }
                                                                                        },
                                                                                        width: 56,
                                                                                        height: 20
                                                                                    },
                                                                                    {
                                                                                        children: [
                                                                                            {
                                                                                                children: [],
                                                                                                id: 'GfBed',
                                                                                                data: {
                                                                                                    topic: {
                                                                                                        children: [
                                                                                                            {
                                                                                                                text: '文文文文'
                                                                                                            }
                                                                                                        ]
                                                                                                    }
                                                                                                },
                                                                                                width: 56,
                                                                                                height: 20
                                                                                            }
                                                                                        ],
                                                                                        id: 'mBEXn',
                                                                                        data: {
                                                                                            topic: {
                                                                                                children: [
                                                                                                    {
                                                                                                        text: '文文文文'
                                                                                                    }
                                                                                                ]
                                                                                            }
                                                                                        },
                                                                                        width: 56,
                                                                                        height: 20
                                                                                    },
                                                                                    {
                                                                                        children: [
                                                                                            {
                                                                                                children: [],
                                                                                                id: 'yTCNt',
                                                                                                data: {
                                                                                                    topic: {
                                                                                                        children: [
                                                                                                            {
                                                                                                                text: '文文文文文文'
                                                                                                            }
                                                                                                        ]
                                                                                                    }
                                                                                                },
                                                                                                width: 84,
                                                                                                height: 20
                                                                                            }
                                                                                        ],
                                                                                        id: 'hBhrr',
                                                                                        data: {
                                                                                            topic: {
                                                                                                children: [
                                                                                                    {
                                                                                                        text: '文文文文'
                                                                                                    }
                                                                                                ]
                                                                                            }
                                                                                        },
                                                                                        width: 56,
                                                                                        height: 20
                                                                                    }
                                                                                ],
                                                                                id: 'RQsae',
                                                                                data: {
                                                                                    topic: {
                                                                                        children: [
                                                                                            {
                                                                                                text: '文文文文'
                                                                                            }
                                                                                        ]
                                                                                    }
                                                                                },
                                                                                width: 56,
                                                                                height: 20
                                                                            }
                                                                        ],
                                                                        id: 'zMCwF',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 28,
                                                                        height: 20
                                                                    }
                                                                ],
                                                                id: 'TNQGa',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文文文文文文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 112,
                                                                height: 20
                                                            }
                                                        ],
                                                        id: 'ickQX',
                                                        height: 20
                                                    },
                                                    {
                                                        children: [
                                                            {
                                                                children: [
                                                                    {
                                                                        children: [],
                                                                        id: 'jxMti',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文文文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 70,
                                                                        height: 20
                                                                    },
                                                                    {
                                                                        children: [],
                                                                        id: 'cETkm',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 28,
                                                                        height: 20
                                                                    },
                                                                    {
                                                                        children: [],
                                                                        id: 'mwffp',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 56,
                                                                        height: 20
                                                                    }
                                                                ],
                                                                id: 'bCTFn',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 28,
                                                                height: 20
                                                            },
                                                            {
                                                                children: [
                                                                    {
                                                                        children: [],
                                                                        id: 'fpPxQ',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文文文文文文文文文文文文文文文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 238,
                                                                        height: 20
                                                                    }
                                                                ],
                                                                id: 'FBQWe',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 56,
                                                                height: 20
                                                            },
                                                            {
                                                                children: [
                                                                    {
                                                                        children: [],
                                                                        id: 'RPBBz',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文文文文文文文文文文文文文文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 224,
                                                                        height: 20
                                                                    }
                                                                ],
                                                                id: 'fRJYx',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文文文文文文文文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 140,
                                                                height: 20
                                                            },
                                                            {
                                                                children: [
                                                                    {
                                                                        children: [],
                                                                        id: 'tnKBZ',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文文文文文文文文文文文文文文文文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 252,
                                                                        height: 20
                                                                    }
                                                                ],
                                                                id: 'acXZH',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文文文文文文“文文”'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 154,
                                                                height: 20
                                                            },
                                                            {
                                                                children: [
                                                                    {
                                                                        children: [],
                                                                        id: 'tTDCY',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文文文文文文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 112,
                                                                        height: 20
                                                                    }
                                                                ],
                                                                id: 'EGfeX',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 28,
                                                                height: 20
                                                            },
                                                            {
                                                                children: [
                                                                    {
                                                                        children: [],
                                                                        id: 'msQdb',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文文文文文文文文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 140,
                                                                        height: 20
                                                                    }
                                                                ],
                                                                id: 'zJBxp',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文文文文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 84,
                                                                height: 20
                                                            }
                                                        ],
                                                        id: 'jADwH',
                                                        data: {
                                                            topic: {
                                                                children: [
                                                                    {
                                                                        text: '文文文文'
                                                                    }
                                                                ]
                                                            }
                                                        },
                                                        width: 56,
                                                        height: 20,
                                                        isCollapsed: false
                                                    }
                                                ],
                                                id: 'jtSTj',
                                                data: {
                                                    topic: {
                                                        children: [
                                                            {
                                                                text: '文文文文文文文'
                                                            }
                                                        ]
                                                    }
                                                },
                                                width: 98,
                                                height: 20,
                                                isCollapsed: false
                                            }
                                        ],
                                        id: 'CDreb',
                                        data: {
                                            topic: {
                                                children: [
                                                    {
                                                        text: '文文文文'
                                                    }
                                                ]
                                            }
                                        },
                                        width: 56,
                                        height: 20
                                    },
                                    {
                                        children: [
                                            {
                                                children: [],
                                                id: 'wnhyt',
                                                data: {
                                                    topic: {
                                                        children: [
                                                            {
                                                                text: '文文文文文文文文文文文文文，文文文文文文文，文文文文文文文文'
                                                            }
                                                        ]
                                                    }
                                                },
                                                width: 420,
                                                height: 20
                                            }
                                        ],
                                        id: 'ZCwac',
                                        data: {
                                            topic: {
                                                children: [
                                                    {
                                                        text: '文文文文文文'
                                                    }
                                                ]
                                            }
                                        },
                                        width: 84,
                                        height: 20
                                    },
                                    {
                                        children: [
                                            {
                                                children: [
                                                    {
                                                        children: [
                                                            {
                                                                children: [
                                                                    {
                                                                        children: [],
                                                                        id: 'HEwTy',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文文文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 70,
                                                                        height: 20
                                                                    }
                                                                ],
                                                                id: 'NnKWh',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 42,
                                                                height: 20
                                                            }
                                                        ],
                                                        id: 'hKFfd',
                                                        data: {
                                                            topic: {
                                                                children: [
                                                                    {
                                                                        text: '文文文文'
                                                                    }
                                                                ]
                                                            }
                                                        },
                                                        width: 56,
                                                        height: 20
                                                    },
                                                    {
                                                        children: [
                                                            {
                                                                children: [
                                                                    {
                                                                        children: [],
                                                                        id: 'SmWbN',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文文文文文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 98,
                                                                        height: 20
                                                                    }
                                                                ],
                                                                id: 'tfPHi',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 42,
                                                                height: 20
                                                            },
                                                            {
                                                                children: [
                                                                    {
                                                                        children: [],
                                                                        id: 'bPjiD',
                                                                        data: {
                                                                            topic: {
                                                                                children: [
                                                                                    {
                                                                                        text: '文文文文文文文文文文文文文文'
                                                                                    }
                                                                                ]
                                                                            }
                                                                        },
                                                                        width: 196,
                                                                        height: 20
                                                                    }
                                                                ],
                                                                id: 'rxcWj',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 56,
                                                                height: 20
                                                            }
                                                        ],
                                                        id: 'MfjBx',
                                                        data: {
                                                            topic: {
                                                                children: [
                                                                    {
                                                                        text: '文文'
                                                                    }
                                                                ]
                                                            }
                                                        },
                                                        width: 28,
                                                        height: 20
                                                    }
                                                ],
                                                id: 'zXrQr',
                                                data: {
                                                    topic: {
                                                        children: [
                                                            {
                                                                text: '文文'
                                                            }
                                                        ]
                                                    }
                                                },
                                                width: 28,
                                                height: 20
                                            },
                                            {
                                                children: [
                                                    {
                                                        children: [],
                                                        id: 'BFndz',
                                                        data: {
                                                            topic: {
                                                                children: [
                                                                    {
                                                                        text: '文文文文文文文'
                                                                    }
                                                                ]
                                                            }
                                                        },
                                                        width: 98,
                                                        height: 20
                                                    }
                                                ],
                                                id: 'ppmQt',
                                                data: {
                                                    topic: {
                                                        children: [
                                                            {
                                                                text: '文文文文文'
                                                            }
                                                        ]
                                                    }
                                                },
                                                width: 70,
                                                height: 20
                                            },
                                            {
                                                children: [
                                                    {
                                                        children: [],
                                                        id: 'ctBTC',
                                                        data: {
                                                            topic: {
                                                                children: [
                                                                    {
                                                                        text: '文文文文文文文文文文文文文、文文、文文文'
                                                                    }
                                                                ]
                                                            }
                                                        },
                                                        width: 280,
                                                        height: 20
                                                    }
                                                ],
                                                id: 'wZxte',
                                                data: {
                                                    topic: {
                                                        children: [
                                                            {
                                                                text: '文文文文文文'
                                                            }
                                                        ]
                                                    }
                                                },
                                                width: 84,
                                                height: 20
                                            },
                                            {
                                                children: [
                                                    {
                                                        children: [
                                                            {
                                                                children: [],
                                                                id: 'mDCpP',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文文文文文文文文文文文/文文文文文文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 272,
                                                                height: 20
                                                            }
                                                        ],
                                                        id: 'tfRNR',
                                                        data: {
                                                            topic: {
                                                                children: [
                                                                    {
                                                                        text: '文文文文文'
                                                                    }
                                                                ]
                                                            }
                                                        },
                                                        width: 70,
                                                        height: 20
                                                    },
                                                    {
                                                        children: [
                                                            {
                                                                children: [],
                                                                id: 'eyGPy',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文文文文文文文文文文文文文文文文文文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 280,
                                                                height: 20
                                                            }
                                                        ],
                                                        id: 'mrRwa',
                                                        data: {
                                                            topic: {
                                                                children: [
                                                                    {
                                                                        text: '文文'
                                                                    }
                                                                ]
                                                            }
                                                        },
                                                        width: 28,
                                                        height: 20
                                                    }
                                                ],
                                                id: 'NGTyz',
                                                data: {
                                                    topic: {
                                                        children: [
                                                            {
                                                                text: '文文'
                                                            }
                                                        ]
                                                    }
                                                },
                                                width: 28,
                                                height: 20
                                            }
                                        ],
                                        id: 'heQNA',
                                        data: {
                                            topic: {
                                                children: [
                                                    {
                                                        text: '文文文文'
                                                    }
                                                ]
                                            }
                                        },
                                        width: 56,
                                        height: 20
                                    }
                                ],
                                id: 'HTrre',
                                data: {
                                    topic: {
                                        children: [
                                            {
                                                text: '文文文文文文'
                                            }
                                        ]
                                    }
                                },
                                width: 84,
                                height: 20
                            },
                            {
                                children: [
                                    {
                                        children: [
                                            {
                                                children: [],
                                                id: 'EEMGJ',
                                                data: {
                                                    topic: {
                                                        children: [
                                                            {
                                                                text: '文文文文'
                                                            }
                                                        ]
                                                    }
                                                },
                                                width: 56,
                                                height: 20
                                            }
                                        ],
                                        id: 'XHayD',
                                        data: {
                                            topic: {
                                                children: [
                                                    {
                                                        text: '文文文文'
                                                    }
                                                ]
                                            }
                                        },
                                        width: 56,
                                        height: 20
                                    }
                                ],
                                id: 'XAJpE',
                                data: {
                                    topic: {
                                        children: [
                                            {
                                                text: '文文文文文文'
                                            }
                                        ]
                                    }
                                },
                                width: 84,
                                height: 20
                            }
                        ],
                        id: 'bbsEb',
                        data: {
                            topic: {
                                children: [
                                    {
                                        text: '文文文文'
                                    }
                                ]
                            }
                        },
                        width: 56,
                        height: 20
                    },
                    {
                        children: [
                            {
                                children: [
                                    {
                                        children: [
                                            {
                                                children: [
                                                    {
                                                        children: [
                                                            {
                                                                children: [],
                                                                id: 'iYbCQ',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文文文文文文文文文文文80'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 185,
                                                                height: 20
                                                            },
                                                            {
                                                                children: [],
                                                                id: 'HCJCm',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文文文文文文文70'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 129,
                                                                height: 20
                                                            }
                                                        ],
                                                        id: 'jRCCb',
                                                        data: {
                                                            topic: {
                                                                children: [
                                                                    {
                                                                        text: '文文文'
                                                                    }
                                                                ]
                                                            }
                                                        },
                                                        width: 42,
                                                        height: 20
                                                    },
                                                    {
                                                        children: [
                                                            {
                                                                children: [],
                                                                id: 'yhkFx',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '1~99文文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 78,
                                                                height: 20
                                                            }
                                                        ],
                                                        id: 'xaCEB',
                                                        data: {
                                                            topic: {
                                                                children: [
                                                                    {
                                                                        text: '文文文文'
                                                                    }
                                                                ]
                                                            }
                                                        },
                                                        width: 56,
                                                        height: 20
                                                    }
                                                ],
                                                id: 'pmxhR',
                                                data: {
                                                    topic: {
                                                        children: [
                                                            {
                                                                text: '文文'
                                                            }
                                                        ]
                                                    }
                                                },
                                                width: 28,
                                                height: 20
                                            },
                                            {
                                                children: [
                                                    {
                                                        children: [],
                                                        id: 'ritsK',
                                                        data: {
                                                            topic: {
                                                                children: [
                                                                    {
                                                                        text: '文文文文文文文文文 <、文文文文文 >'
                                                                    }
                                                                ]
                                                            }
                                                        },
                                                        width: 240,
                                                        height: 20
                                                    }
                                                ],
                                                id: 'NstMd',
                                                data: {
                                                    topic: {
                                                        children: [
                                                            {
                                                                text: '文文文文'
                                                            }
                                                        ]
                                                    }
                                                },
                                                width: 56,
                                                height: 20
                                            },
                                            {
                                                children: [
                                                    {
                                                        children: [],
                                                        id: 'nidSG',
                                                        data: {
                                                            topic: {
                                                                children: [
                                                                    {
                                                                        text: '文文文文文文文文文文文文文文文文'
                                                                    }
                                                                ]
                                                            }
                                                        },
                                                        width: 224,
                                                        height: 20,
                                                        points: [[0, 0]]
                                                    },
                                                    {
                                                        children: [],
                                                        id: 'fecXn',
                                                        data: {
                                                            topic: {
                                                                children: [
                                                                    {
                                                                        text: '文文文文文文文文文文文文'
                                                                    }
                                                                ]
                                                            }
                                                        },
                                                        width: 168,
                                                        height: 20,
                                                        points: [[0, 58]]
                                                    }
                                                ],
                                                id: 'ktkYF',
                                                data: {
                                                    topic: {
                                                        children: [
                                                            {
                                                                text: '文文文文'
                                                            }
                                                        ]
                                                    }
                                                },
                                                width: 56,
                                                height: 20
                                            }
                                        ],
                                        id: 'irdXp',
                                        data: {
                                            topic: {
                                                children: [
                                                    {
                                                        text: '文文文'
                                                    }
                                                ]
                                            }
                                        },
                                        width: 42,
                                        height: 20
                                    },
                                    {
                                        children: [
                                            {
                                                children: [],
                                                id: 'pCtZp',
                                                data: {
                                                    topic: {
                                                        children: [
                                                            {
                                                                text: '文文文文'
                                                            }
                                                        ]
                                                    }
                                                },
                                                width: 56,
                                                height: 20
                                            }
                                        ],
                                        id: 'yNDRm',
                                        data: {
                                            topic: {
                                                children: [
                                                    {
                                                        text: '文文'
                                                    }
                                                ]
                                            }
                                        },
                                        width: 28,
                                        height: 20
                                    },
                                    {
                                        children: [
                                            {
                                                children: [
                                                    {
                                                        children: [
                                                            {
                                                                children: [],
                                                                id: 'tNzEa',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文文文文文“文文文文”'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 168,
                                                                height: 20
                                                            }
                                                        ],
                                                        id: 'EnzmE',
                                                        data: {
                                                            topic: {
                                                                children: [
                                                                    {
                                                                        text: '文文文文文文-文文文文文文文文文文<文文'
                                                                    }
                                                                ]
                                                            }
                                                        },
                                                        width: 269,
                                                        height: 20
                                                    },
                                                    {
                                                        children: [
                                                            {
                                                                children: [],
                                                                id: 'GrTYN',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文文文文文“文文”'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 140,
                                                                height: 20
                                                            }
                                                        ],
                                                        id: 'MKAmr',
                                                        data: {
                                                            topic: {
                                                                children: [
                                                                    {
                                                                        text: '文文文文文文-文文文文文文文文文文≥文文'
                                                                    }
                                                                ]
                                                            }
                                                        },
                                                        width: 269,
                                                        height: 20,
                                                        points: [[0, 0]]
                                                    }
                                                ],
                                                id: 'RwNJt',
                                                data: {
                                                    topic: {
                                                        children: [
                                                            {
                                                                text: '文文文文文文文文文'
                                                            }
                                                        ]
                                                    }
                                                },
                                                width: 126,
                                                height: 20
                                            },
                                            {
                                                children: [
                                                    {
                                                        children: [
                                                            {
                                                                children: [],
                                                                id: 'NDmWy',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文文文文文文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 112,
                                                                height: 20
                                                            }
                                                        ],
                                                        id: 'WsCAx',
                                                        data: {
                                                            topic: {
                                                                children: [
                                                                    {
                                                                        text: '文文文文文文-文文文文-文文文文文文文文文＞文文'
                                                                    }
                                                                ]
                                                            }
                                                        },
                                                        width: 321,
                                                        height: 20
                                                    },
                                                    {
                                                        children: [
                                                            {
                                                                children: [],
                                                                id: 'miBXy',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文文文文文文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 112,
                                                                height: 20
                                                            }
                                                        ],
                                                        id: 'NGrdG',
                                                        data: {
                                                            topic: {
                                                                children: [
                                                                    {
                                                                        text: '文文文文文文-文文文文-文文文文文文文文文≤文文'
                                                                    }
                                                                ]
                                                            }
                                                        },
                                                        width: 317,
                                                        height: 20,
                                                        points: [[0, 0]]
                                                    }
                                                ],
                                                id: 'cKcMz',
                                                data: {
                                                    topic: {
                                                        children: [
                                                            {
                                                                text: '文文文文文'
                                                            }
                                                        ]
                                                    }
                                                },
                                                width: 70,
                                                height: 20
                                            }
                                        ],
                                        id: 'xynxx',
                                        data: {
                                            topic: {
                                                children: [
                                                    {
                                                        text: '文文文'
                                                    }
                                                ]
                                            }
                                        },
                                        width: 42,
                                        height: 20
                                    }
                                ],
                                id: 'KcnXX',
                                data: {
                                    topic: {
                                        children: [
                                            {
                                                text: '文文-文文文文文文'
                                            }
                                        ]
                                    }
                                },
                                width: 119,
                                height: 20
                            },
                            {
                                children: [
                                    {
                                        children: [
                                            {
                                                children: [
                                                    {
                                                        children: [
                                                            {
                                                                children: [],
                                                                id: 'RwhTx',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文文文文文文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 112,
                                                                height: 20,
                                                                points: [[0, 0]]
                                                            }
                                                        ],
                                                        id: 'GiKFs',
                                                        data: {
                                                            topic: {
                                                                children: [
                                                                    {
                                                                        text: '文文文文文文-文文文文-文文文文-文文文文文文文文文文文文文>文文'
                                                                    }
                                                                ]
                                                            }
                                                        },
                                                        width: 435,
                                                        height: 20
                                                    },
                                                    {
                                                        children: [
                                                            {
                                                                children: [],
                                                                id: 'xFHsc',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文文文文文文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 112,
                                                                height: 20,
                                                                points: [[0, 0]]
                                                            }
                                                        ],
                                                        id: 'GXnRe',
                                                        data: {
                                                            topic: {
                                                                children: [
                                                                    {
                                                                        text: '文文文文文文-文文文文-文文文文-文文文文文文文文文文文文文≤文文'
                                                                    }
                                                                ]
                                                            }
                                                        },
                                                        width: 435,
                                                        height: 20,
                                                        points: [[0, 0]]
                                                    }
                                                ],
                                                id: 'FSTRr',
                                                data: {
                                                    topic: {
                                                        children: [
                                                            {
                                                                text: '文文文文文文文文文文文文文文文'
                                                            }
                                                        ]
                                                    }
                                                },
                                                width: 210,
                                                height: 20
                                            },
                                            {
                                                children: [
                                                    {
                                                        children: [
                                                            {
                                                                children: [],
                                                                id: 'EhAbt',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文文文文文文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 112,
                                                                height: 20,
                                                                points: [[0, 0]]
                                                            }
                                                        ],
                                                        id: 'iTZyt',
                                                        data: {
                                                            topic: {
                                                                children: [
                                                                    {
                                                                        text: '文文文文文文-文文文文-文文文文-文文文文文文文文文文文文文文>文文'
                                                                    }
                                                                ]
                                                            }
                                                        },
                                                        width: 449,
                                                        height: 20,
                                                        points: [[0, 0]]
                                                    },
                                                    {
                                                        children: [
                                                            {
                                                                children: [],
                                                                id: 'bphQJ',
                                                                data: {
                                                                    topic: {
                                                                        children: [
                                                                            {
                                                                                text: '文文文文文文文文'
                                                                            }
                                                                        ]
                                                                    }
                                                                },
                                                                width: 112,
                                                                height: 20,
                                                                points: [[0, 0]]
                                                            }
                                                        ],
                                                        id: 'QwkJe',
                                                        data: {
                                                            topic: {
                                                                children: [
                                                                    {
                                                                        text: '文文文文文文-文文文文-文文文文-文文文文文文文文文文文文文文≤文文'
                                                                    }
                                                                ]
                                                            }
                                                        },
                                                        width: 449,
                                                        height: 20,
                                                        points: [[0, 58]]
                                                    }
                                                ],
                                                id: 'BwYax',
                                                data: {
                                                    topic: {
                                                        children: [
                                                            {
                                                                text: '文文文文文文文文文文文文文文文文'
                                                            }
                                                        ]
                                                    }
                                                },
                                                width: 224,
                                                height: 20
                                            }
                                        ],
                                        id: 'xsDAa',
                                        data: {
                                            topic: {
                                                children: [
                                                    {
                                                        text: '文文文'
                                                    }
                                                ]
                                            }
                                        },
                                        width: 42,
                                        height: 20
                                    }
                                ],
                                id: 'QBshb',
                                data: {
                                    topic: {
                                        children: [
                                            {
                                                text: '文文-文文文文文文'
                                            }
                                        ]
                                    }
                                },
                                width: 119,
                                height: 20
                            }
                        ],
                        id: 'WdpSe',
                        data: {
                            topic: {
                                children: [
                                    {
                                        text: '文文文文'
                                    }
                                ]
                            }
                        },
                        width: 56,
                        height: 20
                    }
                ],
                id: 'tpzZt',
                data: {
                    topic: {
                        children: [
                            {
                                text: '文文文'
                            }
                        ]
                    }
                },
                width: 42,
                height: 20
            },
            {
                children: [
                    {
                        children: [
                            {
                                children: [
                                    {
                                        children: [],
                                        id: 'fZYEZ',
                                        data: {
                                            topic: {
                                                children: [
                                                    {
                                                        text: 'id、qc_group_id、qc_group_name、qc_bodypart_id、qc_bodypart_name、study_date、department_id、qc_bodypart_day_statistics_json_result、create_time、update_time'
                                                    }
                                                ]
                                            }
                                        },
                                        width: 476,
                                        height: 60
                                    }
                                ],
                                id: 'waBJM',
                                data: {
                                    topic: {
                                        children: [
                                            {
                                                text: 'study_qc_qc_bodypart_day_statistics'
                                            }
                                        ]
                                    }
                                },
                                width: 244,
                                height: 20
                            },
                            {
                                children: [
                                    {
                                        children: [],
                                        id: 'acPAM',
                                        data: {
                                            topic: {
                                                children: [
                                                    {
                                                        text: 'id、qc_bodypart_day_statistics_id、qualitative_detail_json、create_time、update_time'
                                                    }
                                                ]
                                            }
                                        },
                                        width: 476,
                                        height: 40
                                    }
                                ],
                                id: 'QHxTY',
                                data: {
                                    topic: {
                                        children: [
                                            {
                                                text: 'study_qc_qc_bodypart_qualitative_detail'
                                            }
                                        ]
                                    }
                                },
                                width: 269,
                                height: 20
                            },
                            {
                                children: [
                                    {
                                        children: [],
                                        id: 'pCWac',
                                        data: {
                                            topic: {
                                                children: [
                                                    {
                                                        text: 'id、qc_bodypart_day_statistics_id、deduction_item_id、deduction_item_detail_json、create_time、update_time'
                                                    }
                                                ]
                                            }
                                        },
                                        width: 476,
                                        height: 40
                                    }
                                ],
                                id: 'KNZjc',
                                data: {
                                    topic: {
                                        children: [
                                            {
                                                text: 'study_qc_qc_bodypart_deduction_item_detail'
                                            }
                                        ]
                                    }
                                },
                                width: 304,
                                height: 20
                            },
                            {
                                children: [
                                    {
                                        children: [],
                                        id: 'jHdee',
                                        data: {
                                            topic: {
                                                children: [
                                                    {
                                                        text: 'id、study_doctor_id、study_doctor_name、qc_bodypart_id、qc_bodypart_name、study_date、department_id、qc_bodypart_study_statistics_json、create_time、update_time'
                                                    }
                                                ]
                                            }
                                        },
                                        width: 476,
                                        height: 60
                                    }
                                ],
                                id: 'PNBCQ',
                                data: {
                                    topic: {
                                        children: [
                                            {
                                                text: 'study_qc_study_doctor_qc_bodypart_day_statistics'
                                            }
                                        ]
                                    }
                                },
                                width: 337,
                                height: 20
                            },
                            {
                                children: [
                                    {
                                        children: [],
                                        id: 'YBYib',
                                        data: {
                                            topic: {
                                                children: [
                                                    {
                                                        text: 'id、study_doctor_qc_bodypart_day_statistics_id、qualitative_detail_json、create_time、update_time'
                                                    }
                                                ]
                                            }
                                        },
                                        width: 476,
                                        height: 40
                                    }
                                ],
                                id: 'JcFaR',
                                data: {
                                    topic: {
                                        children: [
                                            {
                                                text: 'study_qc_study_doctor_qc_bodypart_qualitative_detail'
                                            }
                                        ]
                                    }
                                },
                                width: 363,
                                height: 20
                            },
                            {
                                children: [
                                    {
                                        children: [],
                                        id: 'TTYaE',
                                        data: {
                                            topic: {
                                                children: [
                                                    {
                                                        text: 'id、study_doctor_qc_bodypart_day_statistics_id、deduction_item_id、deduction_item_detail_json、create_time、update_time、'
                                                    }
                                                ]
                                            }
                                        },
                                        width: 476,
                                        height: 40
                                    }
                                ],
                                id: 'JDEMF',
                                data: {
                                    topic: {
                                        children: [
                                            {
                                                text: 'study_qc_study_doctor_qc_bodypart_deduction_item_detail'
                                            }
                                        ]
                                    }
                                },
                                width: 397,
                                height: 20
                            }
                        ],
                        id: 'ckDic',
                        data: {
                            topic: {
                                children: [
                                    {
                                        text: '文文文'
                                    }
                                ]
                            }
                        },
                        width: 42,
                        height: 20
                    }
                ],
                id: 'enHrX',
                data: {
                    topic: {
                        children: [
                            {
                                text: '文文文文文'
                            }
                        ]
                    }
                },
                width: 70,
                height: 20
            },
            {
                children: [
                    {
                        children: [],
                        id: 'sKSQp',
                        data: {
                            topic: {
                                children: [
                                    {
                                        text: 'MM01-544【文文文文文文文文文文】文文文文文文文文文文文文，文文500'
                                    }
                                ]
                            }
                        },
                        width: 476,
                        height: 40
                    },
                    {
                        children: [],
                        id: 'aaJHY',
                        data: {
                            topic: {
                                children: [
                                    {
                                        text: 'MM01-543【文文文文文文文文】文文文文文文文文文文文文，文文文文文文文文，文文文文'
                                    }
                                ]
                            }
                        },
                        width: 476,
                        height: 40
                    },
                    {
                        children: [],
                        id: 'eJmni',
                        data: {
                            topic: {
                                children: [
                                    {
                                        text: 'MM01-542【文文文文文文文文】文文文文文文文，文文文文文文文文文文文文，文文文文文文文文文文文文文文'
                                    }
                                ]
                            }
                        },
                        width: 476,
                        height: 40
                    },
                    {
                        children: [],
                        id: 'WiPnA',
                        data: {
                            topic: {
                                children: [
                                    {
                                        text: 'MM01-56【文文文文文文】文文文文，文文文文文文文/文文文文文文/文文文文文文文文'
                                    }
                                ]
                            }
                        },
                        width: 476,
                        height: 40
                    },
                    {
                        children: [],
                        id: 'CxRCP',
                        data: {
                            topic: {
                                children: [
                                    {
                                        text: 'MM01-510【文文文文文文文文】文文文文文文文文文文文文文文文文文'
                                    }
                                ]
                            }
                        },
                        width: 453,
                        height: 20
                    }
                ],
                id: 'HEKKs',
                data: {
                    topic: {
                        children: [
                            {
                                text: '文文文文'
                            }
                        ]
                    }
                },
                width: 56,
                height: 20
            },
            {
                children: [
                    {
                        children: [],
                        id: 'DiQPP',
                        data: {
                            topic: {
                                children: [
                                    {
                                        text: '文'
                                    }
                                ]
                            }
                        },
                        width: 14,
                        height: 20
                    }
                ],
                id: 'rbYKp',
                data: {
                    topic: {
                        children: [
                            {
                                text: '文文文文'
                            }
                        ]
                    }
                },
                width: 56,
                height: 20
            },
            {
                children: [],
                id: 'YKMsm',
                data: {
                    topic: {
                        children: [
                            {
                                text: '文文文文文文文文'
                            }
                        ]
                    }
                },
                width: 112,
                height: 20,
                strokeWidth: 2,
                branchWidth: 2,
                start: 1,
                end: 1
            }
        ],
        id: 'ijPxT',
        data: {
            topic: {
                children: [
                    {
                        text: 'V2.1.0-文文文文文文文文文文文文文文文文文文文'
                    }
                ]
            }
        },
        width: 403,
        height: 25,
        layout: 'right',
        rightNodeCount: 4,
        isRoot: true,
        type: 'mindmap',
        points: [[230, 208]]
    }
] as any as PlaitDrawElement[];

export const mockTableData: PlaitDrawElement[] = [
    {
        id: 'jhETT',
        points: [
            [-100, -100],
            [500, 300]
        ],
        type: 'table',
        rows: [
            {
                id: 'row-1',
                height: 30
            },
            {
                id: 'row-2',
                height: 30
            },
            {
                id: 'row-3'
            },
            {
                id: 'row-4'
            }
        ],
        columns: [
            {
                id: 'column-1'
            },
            {
                id: 'column-2'
            },
            {
                id: 'column-3'
            }
        ],
        cells: [
            {
                id: 'v-cell-1-1',
                rowId: 'row-1',
                columnId: 'column-1',
                colspan: 3,
                textHeight: 20,
                text: {
                    children: [
                        {
                            text: 'merge cell'
                        }
                    ],
                    align: 'center'
                }
            },
            {
                id: 'v-cell-2-1',
                rowId: 'row-2',
                textHeight: 20,
                columnId: 'column-1',
                text: {
                    children: [
                        {
                            text: 'cell-2-1'
                        }
                    ],
                    align: 'center'
                }
            },
            {
                id: 'v-cell-2-2',
                rowId: 'row-2',
                textHeight: 20,
                columnId: 'column-2',
                text: {
                    children: [
                        {
                            text: ''
                        }
                    ],
                    align: 'center'
                }
            },
            {
                id: 'v-cell-2-3',
                rowId: 'row-2',
                textHeight: 20,
                columnId: 'column-3',
                text: {
                    children: [
                        {
                            text: ''
                        }
                    ],
                    align: 'center'
                }
            },
            {
                id: 'v-cell-3-1',
                rowId: 'row-3',
                textHeight: 20,
                columnId: 'column-1',
                text: {
                    children: [
                        {
                            text: ''
                        }
                    ],
                    align: 'center'
                }
            },
            {
                id: 'v-cell-3-2',
                rowId: 'row-3',
                textHeight: 20,
                columnId: 'column-2',
                text: {
                    children: [
                        {
                            text: ''
                        }
                    ],
                    align: 'center'
                }
            },
            {
                id: 'v-cell-3-3',
                rowId: 'row-3',
                textHeight: 20,
                columnId: 'column-3',
                text: {
                    children: [
                        {
                            text: ''
                        }
                    ],
                    align: 'center'
                }
            },
            {
                id: 'v-cell-4-1',
                rowId: 'row-4',
                textHeight: 20,
                columnId: 'column-1',
                text: {
                    children: [
                        {
                            text: ''
                        }
                    ],
                    align: 'center'
                }
            },
            {
                id: 'v-cell-4-2',
                rowId: 'row-4',
                textHeight: 20,
                columnId: 'column-2',
                text: {
                    children: [
                        {
                            text: ''
                        }
                    ],
                    align: 'center'
                }
            },
            {
                id: 'v-cell-4-3',
                rowId: 'row-4',
                textHeight: 20,
                columnId: 'column-3',
                text: {
                    children: [
                        {
                            text: ''
                        }
                    ],
                    align: 'center'
                }
            }
        ]
    },
    {
        id: 'TTjhE',
        points: [
            [600, -100],
            [1200, 300]
        ],
        type: 'table',
        rows: [
            {
                id: 'row-1'
            },
            {
                id: 'row-2'
            },
            {
                id: 'row-3'
            },
            {
                id: 'row-4'
            }
        ],
        columns: [
            {
                id: 'column-1',
                width: 30
            },
            {
                id: 'column-2',
                width: 30
            },
            {
                id: 'column-3'
            }
        ],
        cells: [
            {
                id: 'h-cell-1-1',
                rowId: 'row-1',
                columnId: 'column-1',
                textHeight: 20,
                rowspan: 4,
                text: {
                    children: [
                        {
                            text: '合并单元格'
                        }
                    ],
                    align: 'center',
                    direction: 'vertical'
                }
            },
            {
                id: 'h-cell-1-2',
                rowId: 'row-1',
                textHeight: 20,
                columnId: 'column-2',
                text: {
                    children: [
                        {
                            text: 'cell-1-2'
                        }
                    ],
                    align: 'center',
                    direction: 'vertical'
                }
            },
            {
                id: 'h-cell-1-3',
                rowId: 'row-1',
                textHeight: 20,
                columnId: 'column-3',
                text: {
                    children: [
                        {
                            text: ''
                        }
                    ],
                    align: 'center'
                }
            },
            {
                id: 'h-cell-2-2',
                rowId: 'row-2',
                textHeight: 20,
                columnId: 'column-2',
                text: {
                    children: [
                        {
                            text: ''
                        }
                    ],
                    align: 'center'
                }
            },
            {
                id: 'h-cell-2-3',
                rowId: 'row-2',
                textHeight: 20,
                columnId: 'column-3',
                text: {
                    children: [
                        {
                            text: ''
                        }
                    ],
                    align: 'center'
                }
            },
            {
                id: 'h-cell-3-2',
                rowId: 'row-3',
                textHeight: 20,
                columnId: 'column-2',
                text: {
                    children: [
                        {
                            text: ''
                        }
                    ],
                    align: 'center'
                }
            },
            {
                id: 'h-cell-3-3',
                rowId: 'row-3',
                textHeight: 20,
                columnId: 'column-3',
                text: {
                    children: [
                        {
                            text: 'cell-3-3'
                        }
                    ],
                    align: 'center'
                }
            },
            {
                id: 'h-cell-4-2',
                rowId: 'row-4',
                textHeight: 20,
                columnId: 'column-2',
                text: {
                    children: [
                        {
                            text: ''
                        }
                    ],
                    align: 'center'
                }
            },
            {
                id: 'h-cell-4-3',
                rowId: 'row-4',
                textHeight: 20,
                columnId: 'column-3',
                text: {
                    children: [
                        {
                            text: ''
                        }
                    ],
                    align: 'center'
                }
            }
        ]
    }
] as PlaitDrawElement[];

export const mockSwimlaneData: PlaitDrawElement[] = [
    {
        id: 'swimlaneVertical',
        points: [
            [-100, -100],
            [200, 400]
        ],
        type: 'swimlane',
        shape: 'swimlaneVertical',
        rows: [
            {
                id: 'row-1',
                height: 30
            },
            {
                id: 'row-2',
                height: 30
            },
            {
                id: 'row-3'
            }
        ],
        columns: [
            {
                id: 'column-1'
            },
            {
                id: 'column-2'
            }
        ],
        cells: [
            {
                id: 'v-cell-1-1',
                rowId: 'row-1',
                columnId: 'column-1',
                textHeight: 20,
                text: {
                    children: [
                        {
                            text: '垂直泳道'
                        }
                    ],
                    align: 'center'
                }
            },
            {
                id: 'v-cell-2-1',
                rowId: 'row-2',
                textHeight: 20,
                columnId: 'column-1',
                text: {
                    children: [
                        {
                            text: ''
                        }
                    ],
                    align: 'center'
                }
            },
            {
                id: 'v-cell-2-2',
                rowId: 'row-2',
                textHeight: 20,
                columnId: 'column-2',
                text: {
                    children: [
                        {
                            text: ''
                        }
                    ],
                    align: 'center'
                }
            },
            {
                id: 'v-cell-3-1',
                rowId: 'row-3',
                columnId: 'column-1'
            },
            {
                id: 'v-cell-3-2',
                rowId: 'row-3',
                columnId: 'column-2'
            }
        ]
    },
    {
        id: 'swimlaneHorizontal',
        points: [
            [300, 0],
            [900, 300]
        ],
        type: 'swimlane',
        shape: 'swimlaneHorizontal',
        rows: [
            {
                id: 'row-1'
            },
            {
                id: 'row-2'
            }
        ],
        columns: [
            {
                id: 'column-1',
                width: 30
            },
            {
                id: 'column-2',
                width: 30
            },
            {
                id: 'column-3'
            }
        ],
        cells: [
            {
                id: 'h-cell-1-1',
                rowId: 'row-1',
                columnId: 'column-1',
                textHeight: 20,
                text: {
                    children: [
                        {
                            text: '水平泳道'
                        }
                    ],
                    align: 'center'
                }
            },
            {
                id: 'h-cell-1-2',
                rowId: 'row-1',
                columnId: 'column-2',
                textHeight: 20,
                text: {
                    children: [
                        {
                            text: ''
                        }
                    ],
                    align: 'center'
                }
            },
            {
                id: 'h-cell-1-3',
                rowId: 'row-1',
                columnId: 'column-3'
            },
            {
                id: 'h-cell-2-2',
                rowId: 'row-2',
                columnId: 'column-2',
                textHeight: 20,
                text: {
                    children: [
                        {
                            text: ''
                        }
                    ],
                    align: 'center'
                }
            },
            {
                id: 'h-cell-2-3',
                rowId: 'row-2',
                columnId: 'column-3'
            }
        ]
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
