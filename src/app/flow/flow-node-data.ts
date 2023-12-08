import { Direction } from '@plait/core';
import { FlowElement, FlowElementType } from '@plait/flow';
import { Handles, WorkflowType } from './flow-data';

export const mockBasicNodes: FlowElement<WorkflowType>[] = [
    {
        id: 'basic_node_01',
        data: {
            text: { children: [{ text: 'Basic Node' }] }
        },
        type: FlowElementType.node,
        points: [[300, 268.5]],
        width: 120,
        height: 36
    },
    {
        id: 'basic_node_02',
        data: {
            text: { children: [{ text: 'With Styles' }] }
        },
        type: FlowElementType.node,
        points: [[500, 268.5]],
        styles: {
            stroke: 'rgb(246, 198, 89)',
            fill: 'rgb(246, 198, 89)',
            activeFill: '#fff'
        },
        width: 120,
        height: 36
    },
    {
        id: 'basic_edge_01',
        type: FlowElementType.edge,
        source: {
            nodeId: 'basic_node_01',
            position: Direction.right
        },
        target: {
            nodeId: 'basic_node_02',
            position: Direction.left
        },
        points: []
    }
];

export const mockCustomNodes: FlowElement<WorkflowType>[] = [
    {
        id: 'custom_node',
        data: {
            text: { children: [{ text: '开始' }] },
            initialState: true
        },
        type: FlowElementType.node,
        width: 120,
        height: 36,
        handles: [],
        undeletable: true,
        points: [[200, 153]]
    },
    {
        id: 'custom_node_01',
        data: {
            text: { children: [{ text: 'With Styles' }] }
        },
        styles: {
            stroke: 'rgb(86, 171, 251)',
            fill: 'rgb(86, 171, 251)'
        },
        type: FlowElementType.node,
        points: [[400, 268.5]],
        width: 120,
        height: 36
    },
    {
        id: 'custom_node_02',
        data: {
            text: { children: [{ text: 'With Styles' }] }
        },
        styles: {
            stroke: 'rgb(115, 216, 151)',
            fill: 'rgb(115, 216, 151)'
        },
        type: FlowElementType.node,
        points: [[600, 268.5]],
        width: 120,
        height: 36
    },
    {
        id: 'custom_edge_01',
        type: FlowElementType.edge,
        source: {
            nodeId: 'custom_node_01',
            position: Direction.top
        },
        target: {
            nodeId: 'custom_node_02',
            position: Direction.top,
             marker: true
        },
        points: []
    },
    {
        id: 'custom_edge_02',
        type: FlowElementType.edge,
        source: {
            nodeId: 'custom_node',
            position: Direction.bottom
        },
        target: {
            nodeId: 'custom_node_01',
            position: Direction.left,
            marker: true
        },
        points: []
    }
];

export const mockCustomHandles: FlowElement<WorkflowType>[] = [
    {
        id: 'custom_handle_01',
        data: {
            text: { children: [{ text: 'Custom' }] }
        },
        styles: {
            stroke: 'rgb(86, 171, 251)',
            fill: 'rgb(86, 171, 251)'
        },
        type: FlowElementType.node,
        points: [[300, 268.5]],
        handles: [
            {
                position: 'top'
            },
            {
                position: 'left'
            }
        ],
        width: 120,
        height: 36
    },
    {
        id: 'custom_handle_02',
        data: {
            text: { children: [{ text: 'Custom' }] }
        },
        styles: {
            stroke: 'rgb(246, 198, 89)',
            fill: 'rgb(246, 198, 89)',
            activeFill: '#fff'
        },
        type: FlowElementType.node,
        handles: Handles,
        points: [[500, 268.5]],
        width: 120,
        height: 36
    },
    {
        id: 'handle_edge_01',
        type: FlowElementType.edge,
        source: {
            nodeId: 'custom_handle_01',
            position: Direction.top
        },
        target: {
            nodeId: 'custom_handle_02',
            position: Direction.bottom,
            handleId: 'bottomLeft',
            marker: true
        },
        points: []
    }
];

export const mockUndeletableNodes: FlowElement<WorkflowType>[] = [
    {
        id: 'custom_handle_01',
        data: {
            text: { children: [{ text: 'Default' }] }
        },
        styles: {
            stroke: 'rgb(86, 171, 251)',
            fill: 'rgb(86, 171, 251)'
        },
        type: FlowElementType.node,
        points: [[300, 268.5]],
        undeletable: true,
        width: 120,
        height: 36
    },
    {
        id: 'custom_handle_02',
        data: {
            text: { children: [{ text: 'Custom' }] }
        },
        styles: {
            stroke: 'rgb(246, 198, 89)',
            fill: 'rgb(246, 198, 89)',
            activeFill: '#fff'
        },
        undeletable: true,
        type: FlowElementType.node,
        points: [[500, 268.5]],
        width: 120,
        height: 36
    },
    {
        id: 'undeletable_edge_01',
        type: FlowElementType.edge,
        source: {
            nodeId: 'custom_handle_01',
            position: Direction.top
        },
        target: {
            nodeId: 'custom_handle_02',
            position: Direction.top
        },
        undeletable: true,
        points: []
    }
];
