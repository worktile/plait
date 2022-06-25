import { PlaitOperation } from '../interfaces/operation';
import { PlaitBoard } from '../interfaces/board';
import { createDraft, finishDraft, isDraft } from 'immer';
import { Viewport } from '../interfaces/viewport';
import { Selection } from '../interfaces/selection';
import { PlaitNode } from '../interfaces/node';

export interface GeneralTransforms {
    transform: (board: PlaitBoard, op: PlaitOperation) => void;
}

const applyToDraft = (board: PlaitBoard, selection: Selection | null, viewport: Viewport, op: PlaitOperation) => {
    switch (op.type) {
        case 'insert_node': {
            const { path, node } = op;
            const parent = PlaitNode.parent(board, path);
            const index = path[path.length - 1];

            if (!parent.children || index > parent.children.length) {
                throw new Error(
                    `Cannot apply an "insert_node" operation at path [${path}] because the destination is past the end of the node.`
                );
            }

            parent.children.splice(index, 0, node);
            break;
        }
        case 'remove_node': {
            const { path } = op;
            const parent = PlaitNode.parent(board, path);
            const index = path[path.length - 1];

            if (!parent.children || index > parent.children.length) {
                throw new Error(
                    `Cannot apply an "insert_node" operation at path [${path}] because the destination is past the end of the node.`
                );
            }
            parent.children.splice(index, 1);
            break;
        }
        case 'set_node': {
            const { path, properties, newProperties } = op;

            if (path.length === 0) {
                throw new Error(`Cannot set properties on the root node!`);
            }

            const node = PlaitNode.get(board, path);

            for (const key in newProperties) {
                const value = newProperties[key];

                if (value == null) {
                    delete node[key];
                } else {
                    node[key] = value;
                }
            }

            // properties that were previously defined, but are now missing, must be deleted
            for (const key in properties) {
                if (!newProperties.hasOwnProperty(key)) {
                    delete node[key];
                }
            }

            break;
        }
        case 'set_viewport': {
            const { newProperties } = op;
            if (newProperties == null) {
                viewport = newProperties;
            } else {
                if (viewport == null) {
                    if (!Viewport.isViewport(newProperties)) {
                        throw new Error(
                            `Cannot apply an incomplete "set_viewport" operation properties ${JSON.stringify(
                                newProperties
                            )} when there is no current viewport.`
                        );
                    }
                    viewport = { ...newProperties };
                }

                for (const key in newProperties) {
                    const value = newProperties[key];

                    if (value == null) {
                        delete viewport[key];
                    } else {
                        viewport[key] = value;
                    }
                }
            }
            break;
        }
        case 'set_selection': {
            const { newProperties } = op;
            if (newProperties == null) {
                selection = newProperties;
            } else {
                if (selection === null) {
                    selection = op.newProperties;
                } else {
                    selection.anchor = newProperties.anchor;
                    selection.focus = newProperties.focus;
                }
            }
            break;
        }
    }
    return { selection, viewport };
};

export const GeneralTransforms: GeneralTransforms = {
    /**
     * Transform the board by an operation.
     */
    transform(board: PlaitBoard, op: PlaitOperation): void {
        board.children = createDraft(board.children);
        let viewport = board.viewport && createDraft(board.viewport);
        let selection = board.selection && createDraft(board.selection);

        try {
            const state = applyToDraft(board, selection, viewport, op);
            viewport = state.viewport;
            selection = state.selection;
        } finally {
            board.children = finishDraft(board.children);

            if (selection) {
                board.selection = isDraft(selection) ? (finishDraft(selection) as Selection) : selection;
            } else {
                board.selection = null;
            }
            board.viewport = isDraft(viewport) ? (finishDraft(viewport) as Viewport) : viewport;
        }
    }
};
