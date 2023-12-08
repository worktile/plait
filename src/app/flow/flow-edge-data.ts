import { Direction } from '@plait/core';
import { FlowBaseData, FlowElement, FlowElementType } from '@plait/flow';

const basicNodes: FlowElement<FlowBaseData>[] = [
    {
        id: '01',
        data: {
            text: { children: [{ text: 'Node' }] }
        },
        type: FlowElementType.node,
        points: [[300, 268.5]],
        width: 120,
        height: 36,
        styles: {
            stroke: 'rgb(246, 198, 89)',
            fill: 'rgb(246, 198, 89)',
            activeFill: '#fff'
        }
    },
    {
        id: '02',
        data: {
            text: { children: [{ text: 'Node' }] }
        },
        type: FlowElementType.node,
        points: [[500, 268.5]],
        width: 120,
        height: 36,
        styles: {
            stroke: 'rgb(115, 216, 151)',
            fill: 'rgb(115, 216, 151)'
        }
    }
];

export const mockBasicEdges: FlowElement<FlowBaseData>[] = [
    ...basicNodes,
    {
        id: 'basic_edge_1',
        type: FlowElementType.edge,
        data: {
            text: { children: [{ text: 'label' }] }
        },
        source: {
            nodeId: '01',
            position: Direction.top
        },
        target: {
            nodeId: '02',
            position: Direction.top
        },
        points: []
    },
    {
        id: 'basic_edge_2',
        type: FlowElementType.edge,
        source: {
            nodeId: '01',
            position: Direction.bottom
        },
        target: {
            nodeId: '02',
            position: Direction.left
        },
        points: []
    }
];

export const mockMarkEdges: FlowElement<FlowBaseData>[] = [
    ...basicNodes,
    {
        id: 'mark_edge_1',
        type: FlowElementType.edge,
        data: {
            text: { children: [{ text: 'label' }] }
        },
        source: {
            nodeId: '01',
            position: Direction.top
        },
        target: {
            nodeId: '02',
            position: Direction.top,
            marker: true
        },
        points: []
    },
    {
        id: 'mark_edge_2',
        type: FlowElementType.edge,
        source: {
            nodeId: '01',
            position: Direction.right,
            marker: true
        },
        target: {
            nodeId: '02',
            position: Direction.left,
            marker: true
        },
        points: []
    }
];

export const mockIconEdges: FlowElement<FlowBaseData>[] = [
    ...basicNodes,
    {
        id: 'icon_edge_1',
        type: FlowElementType.edge,
        data: {
            text: { children: [{ text: 'label' }] },
            icon: '🥳'
        },
        source: {
            nodeId: '01',
            position: Direction.top
        },
        target: {
            nodeId: '02',
            position: Direction.top,
            marker: true
        },
        points: []
    }
];

export const mockShapeEdges: FlowElement<FlowBaseData>[] = [
    {
        id: '01',
        data: {
            text: { children: [{ text: 'Node' }] }
        },
        type: FlowElementType.node,
        points: [[60, 350]],
        width: 120,
        height: 36,
        styles: {
            stroke: 'rgb(86, 171, 251)',
            fill: 'rgb(86, 171, 251)'
        }
    },
    {
        id: '02',
        data: {
            text: { children: [{ text: 'Node' }] }
        },
        type: FlowElementType.node,
        points: [[350, 268.5]],
        width: 120,
        height: 36,
        styles: {
            stroke: 'rgb(246, 198, 89)',
            fill: 'rgb(246, 198, 89)',
            activeFill: '#fff'
        }
    },
    {
        id: '03',
        data: {
            text: { children: [{ text: 'Node' }] }
        },
        type: FlowElementType.node,
        points: [[550, 268.5]],
        width: 120,
        height: 36,
        styles: {
            stroke: 'rgb(115, 216, 151)',
            fill: 'rgb(115, 216, 151)'
        }
    },
    {
        id: '04',
        data: {
            text: { children: [{ text: 'Node' }] }
        },
        type: FlowElementType.node,
        points: [[750, 268.5]],
        width: 120,
        height: 36
    },
    {
        id: 'shape_edge_1',
        type: FlowElementType.edge,
        data: {
            text: { children: [{ text: 'straight' }] },
            icon: '🥳'
        },
        shape: 'straight',
        source: {
            nodeId: '01',
            position: Direction.right
        },
        target: {
            nodeId: '02',
            position: Direction.left,
            marker: true
        },
        points: []
    },
    {
        id: 'shape_edge_2',
        type: FlowElementType.edge,
        data: {
            text: { children: [{ text: 'curve' }] }
        },
        shape: 'curve',
        source: {
            nodeId: '02',
            position: Direction.top
        },
        target: {
            nodeId: '03',
            position: Direction.top,
            marker: true
        },
        points: []
    },
    {
        id: 'shape_edge_3',
        type: FlowElementType.edge,
        data: {
            text: { children: [{ text: 'elbow' }] }
        },
        shape: 'elbow',
        source: {
            nodeId: '03',
            position: Direction.right
        },
        target: {
            nodeId: '04',
            position: Direction.top,
            marker: true
        },
        points: []
    }
];
