import { RectangleClient } from "../interfaces/graph";

export interface BoardComponentInterface {
    markForCheck: () => void;
    scrollToRectangle: (client: RectangleClient) => void;
}
