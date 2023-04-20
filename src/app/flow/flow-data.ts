import { FlowBaseData, FlowElement, FlowElementType, FlowPosition } from '@plait/flow';

export interface WorkflowType extends FlowBaseData {
    initialState?: boolean;
}

export const mockFlowData: FlowElement<WorkflowType>[] = [
    {
        id: '1',
        data: {
            text: { children: [{ text: '开始' }] },
            initialState: true
        },
        type: FlowElementType.node,
        width: 120,
        height: 38,
        handles: [],
        points: [[248, 153]]
    },
    {
        id: '1001',
        data: {
            text: { children: [{ text: '要做' }] }
        },
        type: FlowElementType.node,
        points: [[400, 268.5]],
        width: 120,
        height: 38,
        styles: {
            stroke: '#5dcfff',
            fill: '#5dcfff'
        }
    },
    {
        id: '1002',
        data: {
            text: { children: [{ text: '进行中' }] }
        },
        type: FlowElementType.node,
        points: [[600, 268.5]],
        width: 120,
        height: 38,
        styles: {
            stroke: 'rgb(179, 212, 255)',
            fill: 'rgb(222, 235, 255)'
        }
    },
    {
        id: '1003',
        data: {
            text: { children: [{ text: '已完成' }] }
        },
        type: FlowElementType.node,
        points: [[900, 268.5]],
        width: 120,
        height: 38,
        styles: {
            stroke: 'rgb(171, 245, 209)',
            fill: 'rgb(227, 252, 239)'
        }
    },
    {
        id: '001',
        data: {
            text: { children: [{ text: '连线连线连线' }] }
        },
        type: FlowElementType.edge,
        source: {
            id: '1001',
            position: FlowPosition.top
        },
        target: {
            id: '1002',
            position: FlowPosition.top,
            marker: true
        },
        points: []
    },
    {
        id: '002',
        data: {
            text: { children: [{ text: 'create' }] }
        },
        type: FlowElementType.edge,
        source: {
            id: '1',
            position: FlowPosition.bottom
        },
        target: {
            id: '1001',
            position: FlowPosition.left,
            marker: true
        },
        points: []
    },
    {
        id: '003',
        data: {
            text: { children: [{ text: '连线3' }] }
        },
        type: FlowElementType.edge,
        source: {
            id: '1002',
            position: FlowPosition.right
        },
        target: {
            id: '1003',
            position: FlowPosition.left,
            marker: true
        },
        points: []
    }
];
