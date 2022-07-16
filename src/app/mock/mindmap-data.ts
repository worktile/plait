import { PlaitMindmap } from 'mindmap';

export const mockMindmapData: PlaitMindmap = {
    type: 'mindmap',
    id: '1',
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
        { id: '1-2', value: { children: [{ text: '绘图技术' }] }, children: [], width: 56, height: 24 },
        { id: '1-3', value: { children: [{ text: '布局算法' }] }, children: [], width: 56, height: 24 },
        {
            id: '1-4',
            value: { children: [{ text: '知名脑图产品' }] },
            children: [
                {
                    id: '1-4-1',
                    value: { children: [{ text: '布局算法' }] },
                    children: [],
                    width: 56,
                    height: 24
                },
                {
                    id: '1-4-2',
                    value: { children: [{ text: 'non-layerd-tidy-trees' }] },
                    children: [],
                    width: 144.8046875,
                    height: 24
                },
                {
                    id: '1-4-3',
                    value: { children: [{ text: '知名脑图产品' }] },
                    children: [],
                    width: 84,
                    height: 24
                }
            ],
            width: 84,
            height: 24
        }
    ],
    width: 72,
    height: 24,
    isRoot: true,
    points: [[360, 280]]
};
