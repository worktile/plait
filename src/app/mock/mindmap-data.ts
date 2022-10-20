import { PlaitMindmap } from '@plait/mindmap';
import { MindmapLayoutType } from '@plait/layouts';

export const mockMindmapData: PlaitMindmap = {
    type: 'mindmap',
    id: '1',
    rightNodeCount: 3,
    value: { children: [{ text: '脑图调研' }] },
    children: [
        {
            id: '1-1',
            value: { children: [{ text: '富文本' }] },
            children: [
                {
                    id: '1-1-1',
                    value: { children: [{ text: '布局算法' }] },
                    children: [],
                    width: 56,
                    height: 24
                },
                {
                    id: '1-1-2',
                    value: { children: [{ text: '知名脑图产品' }] },
                    children: [],
                    width: 84,
                    height: 24
                }
            ],
            width: 42,
            height: 24
        },
        {
            id: '1-4',
            value: { children: [{ text: '知名脑图产品' }] },
            children: [
                {
                    id: '1-4-1',
                    value: { children: [{ text: '1-4-1' }] },
                    children: [],
                    width: 56,
                    height: 24
                },
                {
                    id: '1-4-2',
                    value: { children: [{ text: '1-4-2' }] },
                    children: [
                        {
                            id: '1-4-2-1',
                            value: { children: [{ text: '1-4-2-1' }] },
                            children: [
                                {
                                    id: '1-4-2-1-1',
                                    value: { children: [{ text: '1-4-2-1-1' }] },
                                    children: [],
                                    width: 72,
                                    height: 24
                                },
                                {
                                    id: '1-4-2-1-2',
                                    value: { children: [{ text: '1-4-2-1-2' }] },
                                    children: [],
                                    width: 72,
                                    height: 24
                                },
                            ],
                            width: 72,
                            height: 24
                        },
                        {
                            id: '1-4-2-2',
                            value: { children: [{ text: '1-4-2-2' }] },
                            children: [],
                            width: 72,
                            height: 24
                        },
                        {
                            id: '1-4-2-3',
                            value: { children: [{ text: '1-4-2-3' }] },
                            children: [],
                            width: 72,
                            height: 24
                        },
                        {
                            id: '1-4-2-4',
                            value: { children: [{ text: '1-4-2-4' }] },
                            children: [],
                            width: 72,
                            height: 24
                        }
                    ],
                    width: 144.8046875,
                    height: 24,
                    layout: MindmapLayoutType.rightFishBone
                },
                {
                    id: '1-4-3',
                    value: { children: [{ text: '1-4-3' }] },
                    children: [],
                    width: 84,
                    height: 24
                }
            ],
            width: 84,
            height: 24
        },
        {
            id: '1-5',
            value: { children: [{ text: 'xxxxxxx' }] },
            children: [
                {
                    id: '1-5-1',
                    value: { children: [{ text: '鱼骨图哦' }] },
                    children: [],
                    width: 72,
                    height: 24
                },
                {
                    id: '1-5-2',
                    value: { children: [{ text: '缩进布局' }] },
                    children: [],
                    width: 72,
                    height: 24
                }
            ],
            width: 48,
            height: 24,
        }
    ],
    width: 72,
    height: 25,
    isRoot: true,
    points: [[60, 360]],
    layout: MindmapLayoutType.rightFishBone
};
