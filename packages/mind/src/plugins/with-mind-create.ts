import { PlaitBoard } from "@plait/core";
import { PlaitMindBoard } from "./with-mind.board";

export const withCreateMind = (board: PlaitBoard) => {
    const newBoard = board as PlaitBoard & PlaitMindBoard;

    return newBoard;
};
