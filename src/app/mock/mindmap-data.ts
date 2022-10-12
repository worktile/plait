import { PlaitMindmap, MindmapNodeShape } from '@plait/mindmap';
import { MindmapLayoutType } from '@plait/layouts';

export const mockMindmapData: PlaitMindmap = {
    type: 'mindmap',
    id: '1',
    rightNodeCount: 3,
    value: { children: [{ text: 'root' }] },
    shape: MindmapNodeShape.underline,
    layout: MindmapLayoutType.upward,
    children: [
        {
            id: '1-1',
            value: { children: [{ text: '1' }] },
            children: [
                {
                    id: '1-1-1',
                    value: { children: [{ text: '2' }] },
                    children: [],
                    width: 10,
                    height: 24,
                    shape: MindmapNodeShape.roundRectangle
                },
                {
                    id: '1-1-2',
                    value: { children: [{ text: '3' }] },
                    children: [],
                    width: 10,
                    height: 24
                }
            ],
            width: 10,
            height: 24
        },
        {
            id: '1-4',
            value: { children: [{ text: '4' }] },
            children: [
                {
                    id: '1-4-1',
                    value: { children: [{ text: '5' }] },
                    children: [],
                    width: 10,
                    height: 24
                },
                {
                    id: '1-4-2',
                    value: { children: [{ text: '12' }] },
                    children: [
                        {
                            id: '1-4-2-1',
                            value: { children: [{ text: '6' }] },
                            children: [],
                            width: 10,
                            height: 24
                        },
                        {
                            id: '1-4-2-2',
                            value: { children: [{ text: '7' }] },
                            children: [],
                            width: 10,
                            height: 24
                        }
                    ],
                    width: 10,
                    height: 24
                },
                {
                    id: '1-4-3',
                    value: { children: [{ text: '8' }] },
                    children: [],
                    width: 10,
                    height: 24
                }
            ],
            width: 10,
            height: 24
        },
        {
            id: '1-5',
            value: { children: [{ text: '9' }] },
            children: [
                {
                    id: '1-5-1',
                    value: { children: [{ text: '10' }] },
                    children: [],
                    width: 10,
                    height: 24
                },
                {
                    id: '1-5-2',
                    value: { children: [{ text: '11' }] },
                    children: [],
                    width: 10,
                    height: 24
                }
            ],
            width: 10,
            height: 24
        }
    ],
    width: 30,
    height: 25,
    isRoot: true,
    points: [[100, 360]]
};
