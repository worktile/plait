import { Editor, Node, Element } from "slate";
import { RichtextEditor } from "../richtext-editor";

export const withLink = <T extends RichtextEditor>(editor: T) => {
    const e = editor as T;
    const { isInline } = e;

    e.isInline = (element: any) => {
        if (element.type === 'link') {
            return true;
        }
        return isInline(element);
    }

    return e;
}