import { docs_v1 } from "@googleapis/docs";

export class Text {
    size: number;
    index: number;

    constructor(public content: string, public options?: docs_v1.Schema$TextStyle) {
        this.content = content + "\n";
        this.size = content.length;
    };

    public setIndex(index: number): void {
        this.index = index;
    };

    public toRequest(): docs_v1.Schema$Request[] {
        const requests: docs_v1.Schema$Request[] = [{
            insertText: {
                location: { index: this.index },
                text: this.content
            }
        }];

        if (this.options) {
            requests.push({
                updateTextStyle: {
                    range: { startIndex: this.index, endIndex: this.index + this.size },
                    textStyle: this.options,
                    fields: Object.keys(this.options).join(",")
                }
            });
        };

        return requests;
    };
}