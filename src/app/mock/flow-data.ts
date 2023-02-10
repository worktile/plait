import { FlowElement, FlowPosition } from '@plait/flow';
export const mockFlowData: FlowElement[] = [
    {
        id: '1',
        data: {
            value: { children: [{ text: '开始' }] }
        },
        type: 'node',
        points: [[248, 153]]
    },
    {
        id: '1001',
        data: {
            value: { children: [{ text: '要做' }] }
        },
        type: 'node',
        points: [[400, 268.5]],
        width: 120,
        height: 38
    },
    {
        id: '1002',
        data: {
            value: { children: [{ text: '进行中' }] }
        },
        type: 'node',
        points: [[600, 268.5]],
        width: 120,
        height: 38
    },
    {
        id: '1003',
        data: {
            value: { children: [{ text: '已完成' }] }
        },
        type: 'node',
        points: [[800, 268.5]],
        width: 120,
        height: 38
    },
    {
        id: '002',
        data: {
            value: { children: [{ text: '连线2' }] }
        },
        type: 'edge',
        source: {
            node: {
                id: '1001',
                data: {
                    value: { children: [{ text: '要做' }] }
                },
                type: 'node',
                points: [[400, 268.5]],
                width: 120,
                height: 38
            },
            position: FlowPosition.bottom
        },
        target: {
            node: {
                id: '1002',
                data: {
                    value: { children: [{ text: '进行中' }] }
                },
                type: 'node',
                points: [[600, 268.5]],
                width: 120,
                height: 38
            },
            position: FlowPosition.top
        },
        points: []
    }
];
