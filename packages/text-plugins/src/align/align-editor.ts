import { Alignment, ParagraphElement } from '@plait/common';
import { Editor, Transforms, Node } from 'slate';

export const AlignEditor = {
    isActive(editor: Editor, alignment: Alignment) {
        const blockElement = Node.get(editor, defaultPath) as ParagraphElement;
        if (blockElement) {
            const { align } = blockElement;
            return align === alignment;
        }
        return false;
    },
    setAlign(editor: Editor, alignment: Alignment) {
        const props: Partial<ParagraphElement> = {
            align: alignment
        };
        Transforms.setNodes(editor, props, {
            at: defaultPath
        });
    }
};

const defaultPath = [0];
