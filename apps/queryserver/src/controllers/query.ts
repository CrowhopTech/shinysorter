import { Request, Response, NextFunction, request } from 'express';
import { Client as PGClient } from 'pg';

const includeTagsParam = "includeTags";
const includeModeParam = "includeMode";
const excludeTagsParam = "excludeTags";
const excludeModeParam = "excludeMode";
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

const getQuery = async (req: Request, res: Response, next: NextFunction) => {
    const pgConnectionString = process.env.PG_CONNECTION_STRING;
    if (!pgConnectionString || pgConnectionString == "") {
        return res.status(500).json("No Postgres connection string provided in client");
    }
    const client = new PGClient({
        connectionString: pgConnectionString,
    });

    try {
        await client.connect();

        let includeTags = parseNumberArrayParam(req, includeTagsParam);
        let excludeTags = parseNumberArrayParam(req, excludeTagsParam);
        let includeMode: "all" | "any" = parseQueryModeParam(req, includeModeParam, "all");
        let excludeMode: "all" | "any" = parseQueryModeParam(req, excludeModeParam, "all");
        let continueID = parseStringParam(req, continueParam, "");
        let limit = parseNumberParam(req, limitParam, 10);
        let hasContent = parseBooleanParam(req, hasContentParam, true);
        let tagged = parseBooleanParam(req, taggedParam, true);
        let getCount = parseBooleanParam(req, countParam, false);

        let selectStatement = getCount ? 'count(*) as filecount' : '*';

        let queryIdx = 2; // 1 params already in there
        let innerQueryString = `WHERE files."hasBeenTagged"=$1`;
        let queryArgs: any[] = [tagged];

        if (continueID.length > 0) {
            innerQueryString += ` AND files.id>\$${queryIdx++}`;
            queryArgs.push(continueID);
        }

        let queryString = `SELECT ${selectStatement} FROM (
            SELECT files.*, storage.objects.metadata, storage.objects.name, ARRAY_AGG(filetags.tagid ORDER BY filetags.tagid) AS tags
            FROM files
            LEFT JOIN filetags ON filetags.fileid = files.id
            LEFT JOIN storage.objects ON storage.objects.id = files."storageID" AND storage.objects.bucket_id = 'test-bucket'
            ${innerQueryString}
            GROUP BY files.id, storage.objects.id ORDER BY files.id
        ) AS fwt`;

        let tagQueries: string[] = [];

        if (includeTags.length > 0) {
            let queries: string[] = [];
            includeTags.forEach(t => {
                queries.push(`\$${queryIdx++}=ANY(tags)`);
                queryArgs.push(t);
            });
            const joiner = (includeMode == "all") ? " AND " : " OR ";
            tagQueries.push(`(${queries.join(joiner)})`);
        }

        if (excludeTags.length > 0) {
            let queries: string[] = [];
            excludeTags.forEach(t => {
                queries.push(`\$${queryIdx++}=ANY(tags)`);
                queryArgs.push(t);
            });
            const joiner = (excludeMode == "all") ? " AND " : " OR ";
            tagQueries.push(`NOT (${queries.join(joiner)})`);
        }

        if (tagQueries.length > 0) {
            queryString += " WHERE " + tagQueries.join(" AND ");
        }
        if (!getCount && limit > 0) {
            queryString += ` LIMIT \$${queryIdx++}`;
            queryArgs.push(limit);
        }

        console.log(`Running with query:\n${queryString}\nArgs: ${queryArgs}`);

        let result = await client.query(queryString, queryArgs);

        if (getCount) {
            let count = result.rows.map(input => parseInt(input.filecount))[0];
            return res.status(200).json({ "count": count });
        }

        // Do a bit of reformatting to make sure we match the format expected if we used a supabase join (like `from('tags').select('*, filetags(tagid)')`)
        let formattedResult = result.rows.map(input => {
            // Move the "tags" field (array of strings) to the "filetags" field (array of {"tagid": number} structs)
            input.filetags = [];
            let existingTags = input.tags as string[];
            input.tags = undefined;
            if (!existingTags) {
                return input;
            }
            console.log(existingTags);
            input.filetags = existingTags.filter(t => t != null).map(tString => { return { "tagid": parseInt(tString) }; });
            return input;
        });

        return res.status(200).json(formattedResult);
    } catch (err: any) {
        console.error(err);
        return res.status(500).json(err);
    } finally {
        client.end((err: Error) => console.warn(`Failed to close postgres connection: ${err}`));
    }
};

export default { getQuery };