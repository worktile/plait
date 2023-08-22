import { PlaitMind } from '@plait/mind';
import { MindLayoutType } from '@plait/layouts';
import { PlaitGeometry, GeometryShape, PlaitLine, LineShape, LineMarkerType } from '@plait/draw';

export const mockData: (PlaitMind | PlaitGeometry | PlaitLine)[] = [
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
                children: [
                    {
                        id: 'abc',
                        data: { topic: { children: [{ text: '布局算法' }] } },
                        children: [],
                        width: 56,
                        height: 20
                    },
                    {
                        id: '1-1-1',
                        data: { topic: { children: [{ text: '布局算法' }] } },
                        children: [],
                        width: 56,
                        height: 20
                    },
                    {
                        id: '1-1-2',
                        data: { topic: { children: [{ text: '知名脑图产品' }] } },
                        children: [],
                        width: 84,
                        height: 20
                    },
                    {
                        id: '1-1-4',
                        data: { topic: { children: [{ text: '知名脑图产品' }] } },
                        children: [],
                        width: 84,
                        height: 20
                    },
                    {
                        id: '1-1-3',
                        isAbstract: true,
                        data: { topic: { children: [{ text: '概要' }] } },
                        children: [],
                        start: 0,
                        end: 0,
                        width: 28,
                        height: 20
                    }
                ],
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
    },
    {
        type: 'mindmap',
        id: '2',
        rightNodeCount: 3,
        data: { topic: { children: [{ text: '脑图调研' }] } },
        children: [
            {
                id: '2-1',
                data: { topic: { children: [{ text: '富文本' }] } },
                children: [],
                width: 42,
                height: 20
            },
            {
                id: '2-2',
                data: { topic: { children: [{ text: '知名脑图产品' }] } },
                children: [],
                width: 84,
                height: 20
            },
            {
                id: '2-3',
                data: { topic: { children: [{ text: 'xxxxxxx' }] } },
                children: [
                    {
                        id: '2-3-1',
                        data: { topic: { children: [{ text: '鱼骨图哦' }] } },
                        children: [],
                        width: 56,
                        height: 20
                    },
                    {
                        id: '2-3-2',
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
        points: [[560, 700]]
    },
    {
        id: '666',
        type: 'geometry',
        shape: GeometryShape.rectangle,
        angle: 0,
        opacity: 1,
        text: { children: [{ text: '几何图形' }] },
        textHeight: 20,
        strokeColor: '#333333',
        strokeWidth: 2,
        points: [
            [880, 450],
            [940, 510]
        ]
    },
    {
        id: '222',
        type: 'geometry',
        shape: GeometryShape.text,
        angle: 0,
        autoSize: false,
        opacity: 1,
        text: { children: [{ text: '几何图形' }] },
        textHeight: 20,
        points: [
            [980, 450],
            [1040, 510]
        ]
    },
    {
        id: '233',
        type: 'line',
        shape: LineShape.elbow,
        autoSize: false,
        source: {
            marker: LineMarkerType.none
        },
        target: {
            marker: LineMarkerType.arrow
        },
        opacity: 1,
        strokeColor: '#333333',
        strokeWidth: 2,
        points: [
            [980, 450],
            [1040, 510]
        ]
    }
];
