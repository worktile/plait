import { PlaitBoard } from "../interfaces";

export const deleteFragment = (board: PlaitBoard) => {
    const elements = board.getDeletedFragment([]);
    board.deleteFragment(elements);
}