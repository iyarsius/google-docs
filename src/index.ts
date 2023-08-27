import { auth as Auth, AuthPlus, docs_v1, docs } from "@googleapis/docs";
import { Document } from "./classes/Document";
import { JWT } from "google-auth-library";
import { drive_v3 } from "@googleapis/drive";

export class Client {
    docClient: docs_v1.Docs;
    auth: AuthPlus["GoogleAuth"]['prototype'];
    drive: drive_v3.Drive;

    constructor(credentials: { client_email: string, private_key: string }) {
        this.auth = new Auth.GoogleAuth({
            credentials: credentials,
            scopes: ['https://www.googleapis.com/auth/documents']
        });

        const jwt = new JWT({
            email: credentials.client_email,
            key: credentials.private_key,
            scopes: ['https://www.googleapis.com/auth/drive']
        });

        this.drive = new drive_v3.Drive({
            auth: jwt,
        });
    };

    async init(): Promise<void> {
        const authClient = await this.auth.getClient();

        this.docClient = docs({ version: 'v1', auth: authClient });
    }

    createDocument(title: string): Document {
        return new Document(title, this.docClient);
    };

    async shareDocument(docID: string, options: { emailAddress?: string; role: "owner" | "writer" | "reader"; type: "user" | "group" | "domain" | "anyone"; }): Promise<void> {
        await this.drive.permissions.create({
            fileId: docID,
            requestBody: options
        });
    };
}