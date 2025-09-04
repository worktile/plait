import { MindElement } from '../../interfaces';

export const getTestingChildren = (): MindElement[] => {
    return [
        {
            type: 'mind',
            id: 'DJCxA',
            rightNodeCount: 3,
            data: { topic: { children: [{ text: 'Central Topic' }] } },
            children: [
                { id: 'HcJWT', type: 'mind_child', data: { topic: { children: [{ text: 'Main Topic 1' }] } }, children: [] },
                { id: 'xAWFi', type: 'mind_child', data: { topic: { children: [{ text: 'Main Topic 2' }] } }, children: [] },
                { id: 'yTTcb', type: 'mind_child', data: { topic: { children: [{ text: 'Main Topic 3' }] } }, children: [] },
                {
                    id: 'PYTyJ',
                    data: { topic: { children: [{ text: 'Abstract' }] } },
                    type: 'mind_child',
                    children: [],
                    strokeColor: '#AAAAAA',
                    strokeWidth: 2,
                    branchColor: '#AAAAAA',
                    branchWidth: 2,
                    start: 0,
                    end: 1
                }
            ],
            isRoot: true,
            points: [[1117, 590]],
            isCollapsed: false
        }
    ];
};
