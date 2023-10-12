import { MindElement } from '../../interfaces';

export const getTestingChildren = (): MindElement[] => {
    return [
        {
            type: 'mindmap',
            id: 'DJCxA',
            rightNodeCount: 3,
            data: { topic: { children: [{ text: 'Central Topic' }] } },
            children: [
                { id: 'HcJWT', data: { topic: { children: [{ text: 'Main Topic 1' }] } }, children: [], width: 25, height: 20 },
                { id: 'xAWFi', data: { topic: { children: [{ text: 'Main Topic 2' }] } }, children: [], width: 25, height: 20 },
                { id: 'yTTcb', data: { topic: { children: [{ text: 'Main Topic 3' }] } }, children: [], width: 25, height: 20 },
                {
                    id: 'PYTyJ',
                    data: { topic: { children: [{ text: 'Abstract' }] } },
                    children: [],
                    width: 28,
                    height: 20,
                    strokeColor: '#AAAAAA',
                    strokeWidth: 2,
                    branchColor: '#AAAAAA',
                    branchWidth: 2,
                    start: 0,
                    end: 1
                }
            ],
            width: 72.2,
            height: 25,
            isRoot: true,
            points: [[1117, 590]],
            isCollapsed: false
        }
    ];
};
