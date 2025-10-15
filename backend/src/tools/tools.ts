import { Tool } from '@modelcontextprotocol/sdk/types';
import { PlaitElementSchemas } from './schemas';

export const tools: Tool[] = [
    {
        name: 'create_element',
        description: 'Create a new element on the Plait board',
        inputSchema: {
            type: 'object',
            properties: PlaitElementSchemas,
            required: ['type', 'points', 'source', 'target']
        }
    },
    {
        name: 'batch_create_elements',
        description: 'Batch create new elements on the Plait board',
        inputSchema: {
            type: 'object',
            properties: PlaitElementSchemas,
            required: ['type', 'points']
        }
    },
    {
        name: 'update_element',
        description: 'Update the existing element',
        inputSchema: {
            type: 'object',
            properties: {
                id: {
                    type: 'string',
                    description: 'The ID of the element to update'
                },
                ...PlaitElementSchemas
            },
            required: ['id']
        }
    },
    {
        name: 'delete_element',
        description: 'Delete the element',
        inputSchema: {
            type: 'object',
            properties: {
                id: {
                    type: 'string',
                    description: 'The ID of the element to delete'
                }
            },
            required: ['id']
        }
    }
];

export const toolNames = tools.map((tool) => tool.name);
