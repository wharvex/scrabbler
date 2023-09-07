import React, { ReactElement } from "react";
import { Props } from "../interfaces/Props";

export const Puzzle: React.FC<Props> = (props: Props) => {
    const getCell = (
        row: number,
        col: number,
        cellProps: Props
    ): ReactElement => {
        const contents: string = cellProps.puzModel[row][col].contents;
        const cellClass: string = contents === "*" ? "App-blank-cell" : "";
        return <td className={cellClass}>{contents}</td>;
    };

    const getRows = (
        rowProps: Props
    ): ReactElement<any, string | React.JSXElementConstructor<any>>[] => {
        const rows: ReactElement<
            any,
            string | React.JSXElementConstructor<any>
        >[] = [];
        for (let i = 0; i < rowProps.puzModel.length; i++) {
            let row: ReactElement[] = [];
            for (let j = 0; j < rowProps.puzModel[i].length; j++) {
                row.push(getCell(i, j, rowProps));
            }
            rows.push(<tr>{row}</tr>);
        }
        return rows;
    };

    return (
        <table>
            <tbody>{getRows(props)}</tbody>
        </table>
    );
};
