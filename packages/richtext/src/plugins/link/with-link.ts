import { Editor, Node, Element } from "slate";
import { RichtextEditor } from "../richtext-editor";

export const withLink = <T extends RichtextEditor>(editor: T) => {
    const e = editor as T;
    const { renderElement } = e;

    // e.renderElement = (element: Element & { type: string }) => {
    //     if (element.type)
    //     return renderElement(node);
    // }

    return e;
}