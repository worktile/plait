import { WorkflowElement } from '@plait/workflow';
export const mockWorkflowData: WorkflowElement[] = [
    {
        id: '1',
        value: { children: [{ text: '开始' }] },
        type: 'origin',
        points: [[248, 153]]
    },
    {
        id: '1001',
        value: { children: [{ text: '要做' }] },
        type: 'todo',
        points: [],
        width: 120,
        height: 38,
        x: 400,
        y: 268.5
    },
    {
        id: '1002',
        value: { children: [{ text: '进行中' }] },
        type: 'in_progess',
        points: [],
        width: 120,
        height: 38,
        x: 600,
        y: 268.5
    },
    {
        id: '1003',
        value: { children: [{ text: '已完成' }] },
        type: 'done',
        points: [],
        width: 120,
        height: 38,
        x: 800,
        y: 268.5
    },
    {
        id: '002',
        value: { children: [{ text: '连线2' }] },
        type: 'global',
        from: [],
        to: { id: '1002', port: 5 },
        points: []
    },
    {
        id: '003',
        value: { children: [{ text: '连线3' }] },
        type: 'directed',
        from: [
            {
                id: '1001',
                port: 0
            }
        ],
        to: {
            id: '1002',
            port: 7
        },
        points: []
    },
    {
        id: '003',
        value: { children: [{ text: '连线3' }] },
        type: 'directed',
        from: [
            {
                id: '1002',
                port: 1
            }
        ],
        to: {
            id: '1003',
            port: 3
        },
        conditions: [
            {
                operation: 'all'
            }
        ],
        points: []
    }
];
