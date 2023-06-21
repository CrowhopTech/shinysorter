import { Request, Response, NextFunction, request } from 'express';
import { Client as PGClient } from 'pg';

const includeTagsParam = "includeTags";
const includeModeParam = "includeMode";
const excludeTagsParam = "excludeTags";
const excludeModeParam = "excludeMode";
const avoidFileParam = "avoidFile";
const continueParam = "continue";
const limitParam = "limit";
const countParam = "getCount";
const hasContentParam = "hasContent";
const taggedParam = "tagged";

function parseNumberArrayParam(req: Request, param: string): number[] {
    if (!req.query) {
        return [];
    }
    const val = req.query[param];
    if (!val || val.length == 0) {
        return [];
    }
    if (val.constructor.name == "Array") {
        const valArr = val as string[];
        return valArr.map(v => parseInt(v));
    }
    if (val as string) {
        console.log(typeof (val));
        console.log(val);
        const split = (val as string).split(",");
        return split.map(s => parseInt(s));
    }

    throw new Error("unhandled type case in parseNumberArrayParam!");
}

function parseQueryModeParam(req: Request, param: string, def: "all" | "any"): "all" | "any" {
    if (!req.query) {
        return def;
    }
    const val = req.query[param];
    if (!val || val.length == 0) {
        return def;
    }
    if (val as string) {
        const cast = (val as string);
        if (cast == "all" || cast == "any") {
            return cast;
        }
        throw new Error(`invalid value ${cast} for parseQueryModeParam, should be 'any' or 'all'`);
    }

    throw new Error("unhandled type case in parseQueryModeParam!");
}

function parseNumberParam(req: Request, param: string, def: number): number {
    if (!req.query) {
        return def;
    }
    const val = req.query[param];
    if (!val || val.length == 0) {
        return def;
    }
    if (val as string) {
        return parseInt(val as string);
    }

    throw new Error("unhandled type case in parseNumberParam!");
}

function parseStringParam(req: Request, param: string, def: string): string {
    if (!req.query) {
        return def;
    }
    const val = req.query[param];
    if (!val || val.length == 0) {
        return def;
    }
    if (val as string) {
        return val as string;
    }

    throw new Error("unhandled type case in parseStringParam!");
}

function parseBooleanParam(req: Request, param: string, def: boolean): boolean {
    if (!req.query) {
        return def;
    }
    const val = req.query[param];
    if (!val || val.length == 0) {
        return def;
    }
    if (val as string) {
        if (val == 'true') return true;
        if (val == 'false') return false;
        throw new Error(`unknown boolean value ${val}`);
    }

    throw new Error("unhandled type case in parseString!");
}

function getClient(): PGClient {
    const pgConnectionString = process.env.PG_CONNECTION_STRING;
    if (!pgConnectionString || pgConnectionString == "") {
        throw new Error("No Postgres connection string provided in client");
    }
    const client = new PGClient({
        connectionString: pgConnectionString,
    });
    return client;
}

class FileQueryParams {
    includeTags: number[] = [];
    excludeTags: number[] = [];
    includeMode: "all" | "any" = "all";
    excludeMode: "all" | "any" = "all";
    avoidFile: number | undefined = undefined;
    continueID: string | undefined = undefined;
    limit: number | undefined = undefined;
    hasContent: boolean = true;
    tagged: boolean = true;
    getCount: boolean | undefined = undefined;
    getRandom: boolean = false;
}

function parseAllQueryParameters(req: Request, allowContinue: boolean, allowLimit: boolean, allowCount: boolean): FileQueryParams {
    let params = new FileQueryParams();
    params.includeTags = parseNumberArrayParam(req, includeTagsParam);
    params.excludeTags = parseNumberArrayParam(req, excludeTagsParam);
    params.includeMode = parseQueryModeParam(req, includeModeParam, "all");
    params.excludeMode = parseQueryModeParam(req, excludeModeParam, "all");
    params.avoidFile = parseNumberParam(req, avoidFileParam, -1);
    if (allowContinue) {
        params.continueID = parseStringParam(req, continueParam, "");
    }
    if (allowLimit) {
        params.limit = parseNumberParam(req, limitParam, 10);
    }
    params.hasContent = parseBooleanParam(req, hasContentParam, true);
    params.tagged = parseBooleanParam(req, taggedParam, true);
    if (allowCount) {
        params.getCount = parseBooleanParam(req, countParam, false);
    }

    return params;
};

function generateSQLQuery(params: FileQueryParams): { queryString: string, queryArgs: any[]; } {
    if (params.getCount && params.getRandom) {
        throw new Error("Cannot get count and random at the same time");
    }

    let selectStatement = params.getCount ? 'count(*) as filecount' : '*';

    let queryIdx = 2; // 1 params already in there
    let innerQueryString = `WHERE files."hasBeenTagged"=$1`;
    let queryArgs: any[] = [params.tagged];

    if (params.continueID && params.continueID.length > 0) {
        innerQueryString += ` AND files.id>\$${queryIdx++}`;
        queryArgs.push(params.continueID);
    }

    if (params.avoidFile && params.avoidFile >= 0) {
        innerQueryString += ` AND files.id!=\$${queryIdx++}`;
        queryArgs.push(params.avoidFile);
    }

    const orderBy = params.getRandom ? "random()" : "files.id";

    let queryString = `SELECT ${selectStatement} FROM (
        SELECT files.*, storage.objects.metadata, storage.objects.name, ARRAY_AGG(filetags.tagid ORDER BY filetags.tagid) AS tags
        FROM files
        LEFT JOIN filetags ON filetags.fileid = files.id
        LEFT JOIN storage.objects ON storage.objects.id = files."storageID" AND storage.objects.bucket_id = 'test-bucket'
        ${innerQueryString}
        GROUP BY files.id, storage.objects.id ORDER BY ${orderBy}
    ) AS fwt`;

    let tagQueries: string[] = [];

    if (params.includeTags.length > 0) {
        let queries: string[] = [];
        params.includeTags.forEach(t => {
            queries.push(`\$${queryIdx++}=ANY(tags)`);
            queryArgs.push(t);
        });
        const joiner = (params.includeMode == "all") ? " AND " : " OR ";
        tagQueries.push(`(${queries.join(joiner)})`);
    }

    if (params.excludeTags.length > 0) {
        let queries: string[] = [];
        params.excludeTags.forEach(t => {
            queries.push(`\$${queryIdx++}=ANY(tags)`);
            queryArgs.push(t);
        });
        const joiner = (params.excludeMode == "all") ? " AND " : " OR ";
        tagQueries.push(`NOT (${queries.join(joiner)})`);
    }

    if (tagQueries.length > 0) {
        queryString += " WHERE " + tagQueries.join(" AND ");
    }
    if (!params.getCount && params.limit && params.limit > 0) {
        queryString += ` LIMIT \$${queryIdx++}`;
        queryArgs.push(params.limit);
    }
    return { queryString, queryArgs };
}

// Converts a database result into the format that would be returned by PostgREST
function convertToTaggedFileEntry(input: any): any {
    // Move the "tags" field (array of strings) to the "filetags" field (array of {"tagid": number} structs)
    input.filetags = [];
    let existingTags = input.tags as string[];
    input.tags = undefined;
    if (!existingTags) {
        return input;
    }
    input.filetags = existingTags.filter(t => t != null).map(tString => { return { "tagid": parseInt(tString) }; });
    return input;
}

const getQuery = async (req: Request, res: Response, next: NextFunction) => {
    let client: PGClient | undefined = undefined;
    try {
        client = getClient();
        await client.connect();

        const queryParams = parseAllQueryParameters(req, true, true, true);

        const { queryString, queryArgs } = generateSQLQuery(queryParams);

        console.log(`Running with query:\n${queryString}\nArgs: ${queryArgs}`);

        let result = await client.query(queryString, queryArgs);

        if (queryParams.getCount) {
            let count = result.rows.map(input => parseInt(input.filecount))[0];
            return res.status(200).json({ "count": count });
        }

        const formattedResult = result.rows.map(convertToTaggedFileEntry);
        return res.status(200).json(formattedResult);
    } catch (err: any) {
        console.error(err);
        return res.status(500).json(err);
    } finally {
        if (client) {
            client.end((err: Error) => { if (err !== undefined) { console.warn(`Failed to close postgres connection: ${err}`); } });
        }
    }
};

const getRandomFile = async (req: Request, res: Response, next: NextFunction) => {
    let client: PGClient | undefined = undefined;
    try {
        client = getClient();
        await client.connect();

        const queryParams = parseAllQueryParameters(req, false, false, false);
        queryParams.getRandom = true;
        queryParams.limit = 1;

        const { queryString, queryArgs } = generateSQLQuery(queryParams);

        console.log(`Running with getRandom query:\n${queryString}\nArgs: ${queryArgs}`);

        let result = await client.query(queryString, queryArgs);
        if (result.rowCount == 0) {
            return res.status(404).json(null);
        }
        const formattedResult = convertToTaggedFileEntry(result.rows[0]);

        return res.status(200).json(formattedResult);
    } catch (err: any) {
        console.error(err);
        return res.status(500).json(err);
    } finally {
        if (client) {
            client.end((err: Error) => { if (err !== undefined) { console.warn(`Failed to close postgres connection: ${err}`); } });
        }
    }
};

export default { getQuery, getRandomFile };