import { FlowElement, FlowElementType, FlowPosition } from '@plait/flow';
export const mockFlowData: FlowElement[] = [
    {
        id: '1',
        data: {
            value: { children: [{ text: '开始' }] }
        },
        type: FlowElementType.node,
        points: [[248, 153]]
    },
    {
        id: '1001',
        data: {
            value: { children: [{ text: '要做' }] }
        },
        type: FlowElementType.node,
        points: [[400, 268.5]],
        width: 120,
        height: 38
    },
    {
        id: '1002',
        data: {
            value: { children: [{ text: '进行中' }] }
        },
        type: FlowElementType.node,
        points: [[600, 268.5]],
        width: 120,
        height: 38
    },
    {
        id: '1003',
        data: {
            value: { children: [{ text: '已完成' }] }
        },
        type: FlowElementType.node,
        points: [[800, 268.5]],
        width: 120,
        height: 38
    },
    {
        id: '002',
        data: {
            value: { children: [{ text: '连线2' }] }
        },
        type: FlowElementType.edge,
        source: {
            id: '1001',
            position: FlowPosition.bottom
        },
        target: {
            id: '1002',
            position: FlowPosition.top
        },
        points: []
    }
];
