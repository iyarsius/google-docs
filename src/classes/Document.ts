import { docs_v1, docs } from "@googleapis/docs";
import { Text } from "./Text";
import { Table } from "./Table";
import { ITableOptions } from "../types/Table";

export class Document {
    docID: string;
    index: number = 1;
    requests: docs_v1.Schema$Request[] = [];
    currentStyle: docs_v1.Schema$UpdateParagraphStyleRequest;

    constructor(public title: string, public client: docs_v1.Docs) {
    };

    setStyle(style: docs_v1.Schema$ParagraphStyle): this {
        if (this.currentStyle) {
            this.currentStyle.range.endIndex = this.index;
            this.requests.push({ updateParagraphStyle: this.currentStyle });
        }

        this.currentStyle = {
            range: { startIndex: this.index },
            paragraphStyle: style,
            fields: Object.keys(style).join(",")
        };

        return this
    }

    addText(text: string, options?: docs_v1.Schema$TextStyle): this {
        const textRequest = new Text(text, options);

        textRequest.setIndex(this.index);
        this.index += textRequest.size + 1;

        this.requests.push(...textRequest.toRequest());

        return this;
    };

    addTable(headers: string[], rows: { [key: string]: string }[], options?: ITableOptions): this {
        const tableRequest = new Table(headers, rows, options);

        tableRequest.setIndex(this.index);
        this.index += tableRequest.size + 1;

        this.requests.push(...tableRequest.toRequest());

        return this;
    };

    async render() {
        this.currentStyle.range.endIndex = this.index;
        this.requests.push({ updateParagraphStyle: this.currentStyle });

        const doc = await this.client.documents.create({
            requestBody: {
                title: this.title
            }
        });

        this.docID = doc.data.documentId;

        for (const req of this.requests) {
            console.log(req);
        }

        return this.client.documents.batchUpdate({
            documentId: this.docID,
            requestBody: {
                requests: this.requests
            }
        });
    };

    getUrl() {
        if (!this.docID) throw new Error("Document has not been rendered yet.");

        return `https://docs.google.com/document/d/${this.docID}/edit`;
    }
}