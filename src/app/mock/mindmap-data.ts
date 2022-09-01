import { PlaitMindmap, MindmapNodeShape } from '@plait/mindmap';
import { MindmapLayoutType } from '@plait/layouts';

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
                    height: 24,
                    shape: MindmapNodeShape.underline
                },
                {
                    id: '1-1-2',
                    value: { children: [{ text: '知名脑图产品' }] },
                    children: [],
                    width: 84,
                    height: 24,
                    shape: MindmapNodeShape.underline
                }
            ],
            width: 42,
            height: 24,
            isCollapsed: true,
            shape: MindmapNodeShape.underline
        },
        { id: '1-2', value: { children: [{ text: '绘图技术' }] }, children: [], width: 56, height: 24, shape: MindmapNodeShape.underline },
        { id: '1-3', value: { children: [{ text: '布局算法' }] }, children: [], width: 56, height: 24, shape: MindmapNodeShape.underline },
        {
            id: '1-4',
            value: { children: [{ text: '知名脑图产品' }] },
            children: [
                {
                    id: '1-4-1',
                    value: { children: [{ text: '布局算法' }] },
                    children: [],
                    width: 56,
                    height: 24,
                    shape: MindmapNodeShape.underline
                },
                {
                    id: '1-4-2',
                    value: { children: [{ text: 'non-layerd-tidy-trees' }] },
                    children: [
                        {
                            id: '1-4-2-1',
                            value: { children: [{ text: '鱼骨图哦' }] },
                            children: [],
                            width: 72,
                            height: 24,
                            shape: MindmapNodeShape.underline
                        },
                        {
                            id: '1-4-2-2',
                            value: { children: [{ text: '缩进布局' }] },
                            children: [],
                            width: 72,
                            height: 24,
                            shape: MindmapNodeShape.underline
                        }
                    ],
                    width: 144.8046875,
                    height: 24,
                    shape: MindmapNodeShape.underline,
                    layout: MindmapLayoutType.right
                },
                {
                    id: '1-4-3',
                    value: { children: [{ text: '知名脑图产品' }] },
                    children: [],
                    width: 84,
                    height: 24,
                    shape: MindmapNodeShape.underline
                }
            ],
            width: 84,
            height: 24,
            shape: MindmapNodeShape.underline,
            layout: MindmapLayoutType.rightBottomIndented
        },
        {
            id: '1-5',
            value: { children: [{ text: 'xxxxxxx' }] },
            children: [],
            width: 72,
            height: 24,
            shape: MindmapNodeShape.underline
        }
    ],
    width: 72,
    height: 24,
    isRoot: true,
    points: [[700, 300]],
    shape: MindmapNodeShape.underline,
    layout: MindmapLayoutType.right
};
