import { docs_v1 } from "@googleapis/docs";

export interface IColomnProperties {
    columnID: number;
    properties: docs_v1.Schema$TableColumnProperties;
};

export interface ITableOptions {
    columnsProperties?: IColomnProperties[];
    tableCellStyle?: docs_v1.Schema$TableCellStyle;
}