import { Editor, Transforms } from 'slate';
import { EDITOR_TO_ON_CHANGE } from '../utils/weak-maps';
import { RichtextEditor } from './richtext-editor';

export const withRichtext = <T extends Editor>(editor: T) => {
    const e = editor as T & RichtextEditor;
    const { onChange, insertData } = e;

    e.onChange = () => {
        const onContextChange = EDITOR_TO_ON_CHANGE.get(editor);

        if (onContextChange) {
            onContextChange();
        }

        onChange();
    };

    e.insertBreak = () => {
        editor.insertText('\n');
    };

    e.insertData = (data: DataTransfer) => {
        const text = data.getData('text/plain');
        if (text) {
            const lines = text.split(/\r\n|\r|\n/);
            let split = false;

            for (const line of lines) {
                if (split) {
                    Transforms.splitNodes(e, { always: true });
                }

                e.insertText(line);
                split = true;
            }
            return;
        }
        insertData(data);
    };

    return e;
};
