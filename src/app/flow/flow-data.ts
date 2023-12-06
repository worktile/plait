import { Direction } from '@plait/core';
import { FlowBaseData, FlowElement, FlowElementType } from '@plait/flow';

export interface WorkflowType extends FlowBaseData {
    initialState?: boolean;
}

export const mockFlowData: FlowElement<WorkflowType>[] = [
    {
        id: '001',
        data: {
            text: { children: [{ text: '连线1' }] },
            icon: '⚡️'
        },
        type: FlowElementType.edge,
        source: {
            nodeId: '1001',
            position: Direction.top
        },
        target: {
            nodeId: '1002',
            position: Direction.top,
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
            nodeId: '1',
            position: Direction.bottom
        },
        target: {
            nodeId: '1001',
            position: Direction.left,
            marker: true
        },
        undeletable: true,
        points: []
    },
    {
        id: '003',
        data: {
            text: { children: [{ text: '连线2' }] }
        },
        type: FlowElementType.edge,
        source: {
            nodeId: '1002',
            position: Direction.right
        },
        target: {
            nodeId: '1003',
            position: Direction.left,
            marker: true
        },
        points: []
    },
    {
        id: '1',
        data: {
            text: { children: [{ text: '开始' }] },
            initialState: true
        },
        type: FlowElementType.node,
        width: 120,
        height: 36,
        handles: [],
        undeletable: true,
        points: [[248, 153]]
    },
    {
        id: '1001',
        data: {
            text: { children: [{ text: '打开' }] }
        },
        type: FlowElementType.node,
        points: [[400, 268.5]],
        width: 120,
        height: 36,
        styles: {
            stroke: 'rgb(86, 171, 251)',
            fill: 'rgb(86, 171, 251)'
        },
        undeletable: true
    },
    {
        id: '1002',
        data: {
            text: { children: [{ text: '进行中' }] }
        },
        type: FlowElementType.node,
        points: [[600, 268.5]],
        width: 120,
        height: 36,
        styles: {
            stroke: 'rgb(246, 198, 89)',
            fill: 'rgb(246, 198, 89)',
            activeFill: '#fff'
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
        height: 36,
        styles: {
            stroke: 'rgb(115, 216, 151)',
            fill: 'rgb(115, 216, 151)'
        }
    },
    // 曲线/直线
    {
        id: 'edge-0',
        data: {
            text: { children: [{ text: 'label' }] },
            icon: '⚡️'
        },
        shape: 'curve',
        type: FlowElementType.edge,
        source: {
            nodeId: 'node-2',
            position: Direction.top
        },
        target: {
            nodeId: 'node-3',
            position: Direction.top,
            marker: true
        },
        points: []
    },
    {
        id: 'edge-2',
        data: {
            text: { children: [{ text: 'create' }] }
        },
        type: FlowElementType.edge,
        source: {
            nodeId: 'node-1',
            position: Direction.bottom
        },
        target: {
            nodeId: 'node-2',
            position: Direction.left,
            marker: true
        },
        undeletable: true,
        points: []
    },
    {
        id: 'edge-3',
        data: {
            text: { children: [{ text: '连线2' }] }
        },
        shape: 'straight',
        type: FlowElementType.edge,
        source: {
            nodeId: 'node-3',
            position: Direction.right
        },
        target: {
            nodeId: 'node-4',
            position: Direction.left,
            marker: true
        },
        points: []
    },
    {
        id: 'node-1',
        data: {
            text: { children: [{ text: '开始' }] },
            initialState: true
        },
        type: FlowElementType.node,
        width: 120,
        height: 36,
        handles: [],
        undeletable: true,
        points: [[248, 400]]
    },
    {
        id: 'node-2',
        data: {
            text: { children: [{ text: '打开' }] }
        },
        type: FlowElementType.node,
        points: [[400, 500]],
        width: 120,
        height: 36,
        styles: {
            stroke: 'rgb(86, 171, 251)',
            fill: 'rgb(86, 171, 251)'
        },
        undeletable: true
    },
    {
        id: 'node-3',
        data: {
            text: { children: [{ text: '进行中' }] }
        },
        type: FlowElementType.node,
        points: [[600, 500]],
        width: 120,
        height: 36,
        styles: {
            stroke: 'rgb(246, 198, 89)',
            fill: 'rgb(246, 198, 89)',
            activeFill: '#fff'
        }
    },
    {
        id: 'node-4',
        data: {
            text: { children: [{ text: '已完成' }] }
        },
        type: FlowElementType.node,
        points: [[900, 500]],
        width: 120,
        height: 36,
        styles: {
            stroke: 'rgb(115, 216, 151)',
            fill: 'rgb(115, 216, 151)'
        }
    }
];
