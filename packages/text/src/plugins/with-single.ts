import { Transforms } from 'slate';
import { AngularEditor } from 'slate-angular';

export const withSingleLine = <T extends AngularEditor>(editor: T) => {
    const e = editor as T;
    const { insertData } = e;

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
