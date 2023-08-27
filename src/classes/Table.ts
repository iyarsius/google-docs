import { docs_v1 } from "@googleapis/docs";
import { ITableOptions } from "../types/Table";

export class Table {
    size: number;
    index: number;

    constructor(public headers: string[], public rows: { [key: string]: string }[], public options?: ITableOptions) {
        // remove non header row values and add empty values for missing headers
        for (const row of rows) {
            for (const header of headers) {
                if (!row[header]) {
                    row[header] = "";
                };
            };

            for (const header of Object.keys(row)) {
                if (!headers.includes(header)) {
                    delete row[header];
                };
            }
        };

        const headerCharsSize = headers.reduce((acc, header) => acc + header.length, 0);
        const rowsCharsSize = rows.reduce((acc, row) => acc + Object.values(row).reduce((acc, value) => acc + value.length, 0), 0);
        const tableSize = 4 + 2 * headers.length * (rows.length + 1)

        this.size = headerCharsSize + rowsCharsSize + tableSize;
    };

    public setIndex(index: number): void {
        this.index = index;
    };

    public toRequest(): docs_v1.Schema$Request[] {
        const requests: docs_v1.Schema$Request[] = [{
            insertTable: {
                location: { index: this.index },
                columns: this.headers.length,
                rows: this.rows.length + 1,
            }
        }];

        if (this.options?.columnsProperties) {
            requests.push(...this.options.columnsProperties.map((prop) => ({
                updateTableColumnProperties: {
                    tableStartLocation: { index: this.index },
                    columnIndices: [prop.columnID],
                    tableColumnProperties: prop.properties
                }
            })));
        };

        if (this.options?.tableCellStyle) {
            requests.push({
                updateTableCellStyle: {
                    tableStartLocation: { index: this.index },
                    tableCellStyle: this.options.tableCellStyle,
                    fields: "*"
                }
            });
        };

        let index = this.index + 4;

        for (const header of this.headers) {
            requests.push({
                insertText: {
                    location: { index: index },
                    text: header
                }
            });

            index += header.length + 2;
        }

        for (let i = 0; i < this.rows.length; i++) {
            index += 1;

            for (const header of this.headers) {
                const row = this.rows[i];

                if (!row[header]) {
                    index++;
                    continue;
                };

                requests.push({
                    insertText: {
                        location: { index: index },
                        text: row[header]
                    }
                });

                index += row[header].length + 2;
            };
        }

        return requests;
    };
};