export const PlaitDefaultSchema = {
    type: {
        type: 'string',
        enum: [
            // PlaitGroup
            'group',

            // Text
            'paragraph',

            // Geometry
            'geometry',

            // PlaitArrowLine
            'arrow-line',

            // PlaitCommonImage
            'image',

            // PlaitTable
            'table',
            'swimlane',

            // PlaitVectorLine
            'vector-line'
        ],
        description: 'Plait 支持的类型'
    },
    points: {
        type: 'array',
        items: {
            type: 'array',
            items: { type: 'number' },
            minItems: 2,
            maxItems: 2
        },
        minItems: 2,
        maxItems: 2,
        description: '元素位置和大小，格式为 [[x1, y1], [x2, y2]]，定义矩形的左上角和右下角坐标'
    },
    angle: {
        type: 'number',
        description: '元素角度，0-360度（可选）'
    },
    groupId: { type: 'string', description: '组ID（可选）' },
    children: {
        type: 'array',
        description: '子元素数组，数组中每个子元素都是一个完整的 PlaitElement（可选）'
    }
};

export const PlaitTextSchema = {
    text: {
        type: 'object',
        properties: {
            children: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        text: {
                            type: 'string',
                            description: '文本内容（可选）'
                        }
                    }
                },
                description: '文本数组（可选）。'
            },
            align: {
                type: 'string',
                enum: ['left', 'center', 'right'],
                description: '对齐方式（可选）'
            }
        }
    }
};

// Geometry、PlaitVectorLine
export const PlaitGeometrySchema = {
    shape: {
        type: 'string',
        enum: [
            // Geometry （GeometryShapes = BasicShapes | FlowchartSymbols | UMLSymbols）
            // ① BasicShapes
            'rectangle',
            'ellipse',
            'diamond',
            'roundRectangle',
            'parallelogram',
            'text',
            'triangle',
            'leftArrow',
            'trapezoid',
            'rightArrow',
            'cross',
            'star',
            'pentagon',
            'hexagon',
            'octagon',
            'pentagonArrow',
            'processArrow',
            'twoWayArrow',
            'comment',
            'roundComment',
            'cloud',
            // ② FlowchartSymbols
            'process',
            'decision',
            'data',
            'connector',
            'terminal',
            'database',
            'hardDisk',
            'internalStorage',
            'manualInput',
            'preparation',
            'manualLoop',
            'merge',
            'delay',
            'storedData',
            'or',
            'summingJunction',
            'predefinedProcess',
            'offPage',
            'document',
            'multiDocument',
            'noteCurlyLeft',
            'noteCurlyRight',
            'noteSquare',
            'display',
            // ③ UMLSymbols
            'actor',
            'useCase',
            'container',
            'note',
            'package',
            'combinedFragment',
            'class',
            'interface',
            'activation',
            'object',
            'deletion',
            'activityClass',
            'simpleClass',
            'component',
            'componentBox',
            'template',
            'port',
            'branchMerge',
            'assembly',
            'requiredInterface',
            'providedInterface',

            // PlaitArrowLine、PlaitVectorLine
            'straight',
            'curve',
            'elbow',

            // Mind
            'round-rectangle',
            'underline'
        ],
        description:
            "只有当 type 为 'geometry' 时，shape 值可以是以下值： 'rectangle', 'ellipse', 'diamond', 'roundRectangle', 'parallelogram', 'text', 'triangle', 'leftArrow', 'trapezoid', 'rightArrow', 'cross', 'star', 'pentagon', 'hexagon', 'octagon', 'pentagonArrow', 'processArrow', 'twoWayArrow', 'comment', 'roundComment', 'cloud', 'process', 'decision', 'data', 'connector', 'terminal', 'database', 'hardDisk', 'internalStorage', 'manualInput', 'preparation', 'manualLoop', 'merge', 'delay', 'storedData', 'or', 'summingJunction', 'predefinedProcess', 'offPage', 'document', 'multiDocument', 'noteCurlyLeft', 'noteCurlyRight', 'noteSquare', 'display', 'actor', 'useCase', 'container', 'note', 'package', 'combinedFragment', 'class', 'interface', 'activation', 'object', 'deletion', 'activityClass', 'simpleClass', 'component', 'componentBox', 'template', 'port', 'branchMerge', 'assembly', 'requiredInterface', 'providedInterface'。只有当 type 为 'arrow-line' 时，shape 值可以是以下值： 'straight', 'curve', 'elbow'。只有当 type 为 'vector-line' 时，shape 值可以是以下值： 'straight', 'curve'。只有当 type 为 'mind_child'、'mind'、'mindmap' 时，shape 值可以是以下值： 'round-rectangle', 'underline'。（可选）"
    },
    fill: {
        type: 'string',
        pattern: '^#[0-9A-Fa-f]{6}$',
        description: '填充颜色，十六进制格式如 #E3F2FD（可选）'
    },
    strokeColor: {
        type: 'string',
        pattern: '^#[0-9A-Fa-f]{6}$',
        description: '边框颜色，十六进制格式如 #1976D2（可选）'
    },
    strokeWidth: {
        type: 'number',
        minimum: 1,
        maximum: 10,
        description: '边框宽度，默认 2（可选）。'
    },
    strokeStyle: {
        type: 'string',
        enum: ['solid', 'dashed', 'dotted'],
        description: '边框样式，默认 solid（可选）'
    },
    opacity: {
        type: 'number',
        minimum: 0,
        maximum: 1,
        description: '元素透明度，0-1（可选）'
    }
};

// PlaitArrowLine、ForceAtlasEdgeElement;
export const PlaitArrowLineSchema = {
    source: {
        type: 'object',
        properties: {
            boundId: { type: 'string', description: '绑定元素ID（可选）' },
            connection: {
                type: 'array',
                items: { type: 'number' },
                minItems: 2,
                maxItems: 2,
                description: '连接点，格式为 [x, y]（可选）'
            },
            marker: {
                type: 'string',
                enum: [
                    'arrow',
                    'none',
                    'open-triangle',
                    'solid-triangle',
                    'sharp-arrow',
                    'one-side-up',
                    'one-side-down',
                    'hollow-triangle',
                    'single-slash'
                ],
                description: '箭头类型，默认 arrow（可选）'
            }
        },
        description: '箭头线源点（可选）。当 type 为 arrow-line 时可设置该属性。'
    },
    target: {
        type: 'object',
        properties: {
            boundId: { type: 'string', description: '绑定元素ID（可选）' },
            connection: {
                type: 'array',
                items: { type: 'number' },
                minItems: 2,
                maxItems: 2,
                description: '连接点，格式为 [x, y]（可选）'
            },
            marker: {
                type: 'string',
                enum: [
                    'arrow',
                    'none',
                    'open-triangle',
                    'solid-triangle',
                    'sharp-arrow',
                    'one-side-up',
                    'one-side-down',
                    'hollow-triangle',
                    'single-slash'
                ],
                description: '箭头类型，默认 arrow（可选）'
            }
        },
        description: '箭头线目标点（可选）。当 type 为 arrow-line 时可设置该属性。'
    },
    texts: {
        type: 'array',
        items: {
            type: 'object',
            properties: {
                ...PlaitTextSchema,
                position: { type: 'number', description: 'Percentage of positioning based on line length.（可选）' }
            }
        },
        description: '文本（可选）。当 type 为 arrow-line 时可设置该属性。'
    }
};

export const PlaitTableSchema = {
    rows: {
        type: 'array',
        items: {
            type: 'object',
            properties: { id: { type: 'string', description: '行ID（可选）' }, height: { type: 'number', description: '行高度（可选）' } }
        },
        description: '行（可选）。当 type 为 table 时可设置该属性。'
    },
    columns: {
        type: 'array',
        items: {
            type: 'object',
            properties: { id: { type: 'string', description: '列ID（可选）' }, width: { type: 'number', description: '列宽度（可选）' } }
        },
        description: '列（可选）。当 type 为 table 时可设置该属性。'
    },
    cells: {
        type: 'array',
        items: {
            type: 'object',
            properties: {
                id: { type: 'string', description: '单元格ID（可选）' },
                rowId: { type: 'string', description: '行ID（可选）' },
                columnId: { type: 'string', description: '列ID（可选）' },
                colspan: { type: 'number', description: '列跨度（可选）' },
                rowspan: { type: 'number', description: '行跨度（可选）' },
                ...PlaitTextSchema,
                fill: { type: 'string', description: '填充颜色，十六进制格式如 #E3F2FD（可选）' }
            },
            description: '单元格（可选）。当 type 为 table 时可设置该属性。'
        }
    },
    header: { type: 'boolean', description: '是否显示表头，默认 false（可选）。当 type 为 swimlane 时可设置该属性。' }
};

export const PlaitMindSchema = {
    rightNodeCount: { type: 'number', description: '右节点数量（可选）。当 type 为 mind_child、mind、mindmap 时可设置该属性。' },
    manualWidth: { type: 'number', description: '手动宽度（可选）。当 type 为 mind_child、mind、mindmap 时可设置该属性。' },
    branchColor: {
        type: 'string',
        description: '分支颜色，十六进制格式如 #1976D2（可选）。当 type 为 mind_child、mind、mindmap 时可设置该属性。'
    },
    branchWidth: { type: 'number', description: '分支宽度，默认 2（可选）。当 type 为 mind_child、mind、mindmap 时可设置该属性。' },
    branchShape: {
        type: 'string',
        enum: ['bight', 'polyline'],
        description: '分支样式（可选）。当 type 为 mind_child、mind、mindmap 时可设置该属性。'
    },
    layout: {
        type: 'string',
        enum: [
            'right',
            'left',
            'standard',
            'upward',
            'downward',
            'right-bottom-indented',
            'right-top-indented',
            'left-top-indented',
            'left-bottom-indented'
        ],
        description: '布局类型（可选）。当 type 为 mind_child、mind、mindmap 时可设置该属性。'
    },
    isCollapsed: { type: 'boolean', description: '是否折叠，默认 false（可选）。当 type 为 mind_child、mind、mindmap 时可设置该属性。' },
    start: { type: 'number', description: '开始位置（可选）。当 type 为 mind_child、mind、mindmap 时可设置该属性。' },
    end: { type: 'number', description: '结束位置（可选）。当 type 为 mind_child、mind、mindmap 时可设置该属性。' }
};

export const PlaitElementSchemas = {
    ...PlaitDefaultSchema,
    ...PlaitTextSchema,
    ...PlaitGeometrySchema,
    ...PlaitArrowLineSchema,
    ...PlaitTableSchema,
    ...PlaitMindSchema
};
