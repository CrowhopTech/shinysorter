import { Inject, Injectable } from '@angular/core';
import {
    AuthChangeEvent,
    AuthSession,
    createClient,
    PostgrestError,
    Session,
    SupabaseClient,
} from '@supabase/supabase-js';
import { FileObject } from '@supabase/storage-js';
import axios, { AxiosResponse } from 'axios';
import { AppService, TOKEN } from './app.service';
import { SearchMode } from './filequery';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { FileSaverService } from 'ngx-filesaver';
import { Database } from '../schema';
import * as path from 'path';

export interface Profile {
    id?: string;
    username: string;
    website: string;
    avatar_url: string;
}

export type FileEntry = Database['public']['Tables']['files']['Row'] & FileObject;
export type FilePatch = Database['public']['Tables']['files']['Update'];

export type TaggedFileEntry = FileEntry & { filetags: { "tagid": number; }[]; }; // Use TaggedFileEntry when using `from(*,filetags(tagid))`. Easy way to get the tag IDs with a file.
export type Tag = Database['public']['Tables']['tags']['Row'];
export type TagCreate = Database['public']['Tables']['tags']['Insert'];
export type TagPatch = Database['public']['Tables']['tags']['Update'];

export type Question = Database['public']['Tables']['questions']['Row'];
export type QuestionOption = Database['public']['Tables']['questionoptions']['Row'];
export type QuestionOptionCreate = Database['public']['Tables']['questionoptions']['Insert'];
export type QuestionWithOptions = Question & { questionoptions: QuestionOption[]; };

export type QuestionCreate = Database['public']['Tables']['questions']['Insert'];
export type QuestionCreateWithOptions = QuestionCreate & { questionoptions: QuestionOptionCreate[]; };
export type QuestionPatch = Database['public']['Tables']['questions']['Update'];
export type QuestionPatchWithOptions = QuestionPatch & { questionoptions: QuestionOption[]; };

@Injectable({
    providedIn: 'root',
})
export class SupabaseService {
    private supabase: SupabaseClient;
    _session: AuthSession | null = null;

    constructor(private appService: AppService, private http: HttpClient, private fileSaver: FileSaverService) {
        if (!appService.settings) {
            throw new Error("appService settings are not initialized");
        }

        this.supabase = createClient<Database>(appService.settings.supabaseAddress, appService.settings.supabaseKey);
    }

    get session() {
        this.supabase.auth.getSession().then(({ data }) => {
            this._session = data.session;
        });
        return this._session;
    }

    authChanges(callback: (event: AuthChangeEvent, session: Session | null) => void) {
        return this.supabase.auth.onAuthStateChange(callback);
    }

    signIn(email: string) {
        return this.supabase.auth.signInWithOtp({ email });
    }

    signOut() {
        return this.supabase.auth.signOut();
    }

    async getFileByID(id: number) {
        const { data, error } = await this.supabase.from("files").select("*, filetags(tagid)").eq("id", id).returns<TaggedFileEntry>().maybeSingle();
        if (error) {
            if (error.code == "PGRST116") { // JSON object requested, multiple (or no) rows returned
                return { data: null, error: null };
            }
            return { data: null, error: error };
        }
        return { data: data, error: null };
    }

    countFiles(includeTags: number[], includeMode: SearchMode, excludeTags: number[], excludeMode: SearchMode, tagged: boolean, limit: number = 10, cont: number = 0): Promise<{ count: number, error: Error | null; }> {
        return new Promise(async (resolve) => {
            if (!this.appService.settings) {
                resolve({ count: -1, error: new Error("appService settings not set") });
                return;
            }

            let params: any = {};
            if (includeTags.length > 0) {
                params.includeTags = includeTags;
                params.includeMode = includeMode;
            }
            if (excludeTags.length > 0) {
                params.excludeTags = excludeTags;
                params.excludeMode = excludeMode;
            }
            params.tagged = tagged;
            params.limit = limit;
            params.continue = cont;
            params.getCount = true; // Only difference!

            const response: AxiosResponse<{ count: number; }> = await axios.get<{ count: number; }>(this.appService.settings.queryServerAddress, {
                params: params,
            });
            if (response.status != 200) {
                resolve({ count: -1, error: new Error(`unexpected status from listFiles ${response.status} ${response.statusText}`) });
                return;
            }
            resolve({ count: response.data.count, error: null });
        });
    }

    listFiles(includeTags: number[], includeMode: SearchMode, excludeTags: number[], excludeMode: SearchMode, tagged: boolean, limit: number = 10, cont: number = 0): Promise<{ data: TaggedFileEntry[], error: Error | null; }> {
        return new Promise(async (resolve) => {
            if (!this.appService.settings) {
                resolve({ data: [], error: new Error("appService settings not set") });
                return;
            }

            let params: any = {};
            if (includeTags.length > 0) {
                params.includeTags = includeTags;
                params.includeMode = includeMode;
            }
            if (excludeTags.length > 0) {
                params.excludeTags = excludeTags;
                params.excludeMode = excludeMode;
            }
            params.tagged = tagged;
            params.limit = limit;
            params.continue = cont;

            const response: AxiosResponse<TaggedFileEntry[]> = await axios.get<TaggedFileEntry[]>(this.appService.settings.queryServerAddress, {
                params: params,
            });
            if (response.status != 200) {
                resolve({ data: [], error: new Error(`unexpected status from listFiles: ${response.status} ${response.statusText}`) });
            }
            resolve({ data: response.data, error: null });
        });
    }

    getRandomFile(includeTags: number[], includeMode: SearchMode, excludeTags: number[], excludeMode: SearchMode, tagged: boolean, avoidFile?: number): Promise<{ data: TaggedFileEntry | null, error: null; } | { data: null, error: Error; }> {
        return new Promise(async (resolve) => {
            if (!this.appService.settings) {
                resolve({ data: null, error: new Error("appService settings not set") });
                return;
            }

            let params: any = {};
            if (includeTags.length > 0) {
                params.includeTags = includeTags;
                params.includeMode = includeMode;
            }
            if (excludeTags.length > 0) {
                params.excludeTags = excludeTags;
                params.excludeMode = excludeMode;
            }
            params.tagged = tagged;
            if (avoidFile) {
                params.avoidFile = avoidFile;
            }

            const response: AxiosResponse<TaggedFileEntry> = await axios.get<TaggedFileEntry>(this.appService.settings.queryServerAddress + "/random", {
                params: params,
                validateStatus: (status: number) => status == 200 || status == 404,
            });
            if (response.status == 404) {
                resolve({ data: null, error: null });
            }
            if (response.status != 200) {
                resolve({ data: null, error: new Error(`unexpected status from getRandomFile: ${response.status} ${response.statusText}`) });
            }
            resolve({ data: response.data, error: null });
        });
    }

    async deleteFile(id: number) {
        const result = await this.getFileByID(id);
        const data = result.data;
        if (result.error) {
            return Promise.reject(`Failed to get file by ID ${id}: ${result.error}`);
        }

        await this.supabase.from("filetags").delete().eq("fileid", id);
        await this.supabase.from("files").delete().eq("id", id);

        if (data) {
            await this.supabase.storage.from("files").remove([data.filename]);
            await this.supabase.storage.from("thumbs").remove([data.storageID]);
        }

        return Promise.resolve();
    }

    // ===== File Contents

    fileContentsAddress(path: string): string {
        return this.supabase.storage.from("files").getPublicUrl(path).data.publicUrl;
    }

    thumbContentsAddress(storageID: string): string {
        return this.supabase.storage.from("thumbs").getPublicUrl(storageID).data.publicUrl;
    }

    public downloadFileContents(fileName: string) {
        if (!fileName || fileName.length == 0) {
            return;
        }
        this.http.get(this.fileContentsAddress(fileName), { observe: 'response', responseType: 'blob' }).subscribe((res: HttpResponse<Blob>) => {
            this.fileSaver.save(res.body, fileName);
        });
    }

    async patchFile(id: number, patch?: FilePatch, tags?: number[]): Promise<PostgrestError | null> {
        return new Promise(async (resolve) => {
            if (patch != undefined) {
                const { error } = await this.supabase.from("files").update(patch).eq("id", id);
                if (error) {
                    resolve(error);
                }
            }
            if (tags != undefined) {
                // Get tags currently on file
                const { data, error } = await this.getFileByID(id);
                if (error) {
                    resolve(error);
                }
                if (data as TaggedFileEntry) {
                    const existingTags: number[] = (data as TaggedFileEntry).filetags.map((t: any) => t.tagid);
                    // Calculate tag delta so that we don't waste effort
                    const tagsToRemove: number[] = existingTags.filter(t => !tags.includes(t));
                    const tagsToAdd: number[] = tags.filter(t => !existingTags.includes(t));
                    if (tagsToRemove.length > 0) {
                        const { error } = await this.supabase.from("filetags").delete().in("tagid", tagsToRemove);
                        if (error) {

                            resolve(error);
                        }
                    }
                    if (tagsToAdd.length > 0) {
                        const { error } = await this.supabase.from("filetags").insert(tagsToAdd.map(t => { return { "fileid": id, "tagid": t }; }));
                        if (error) {
                            resolve(error);
                        }
                    }
                }
            }
            resolve(null);
        });
    }

    listTags() {
        return this.supabase.from<"tags", Tag>("tags").select("*");
    }

    createTag(toCreate: TagCreate) {
        return this.supabase.from("tags").insert(toCreate as TagCreate);
    }

    patchTag(patch?: TagPatch) {
        return this.supabase.from("tags").update(patch);
    }
    deleteTag(tagID: number) {
        return this.supabase.from("tags").delete().eq("id", tagID);
    }

    listQuestions() {
        return this.supabase.from<"questions", QuestionWithOptions>("questions").select("*,questionoptions(*)").order("orderingID");
    }

    createQuestion(toCreate: QuestionCreate, options?: QuestionOptionCreate[]): Promise<PostgrestError | null> {
        return new Promise(async (resolve) => {
            const { data, error } = await this.supabase.from("questions").insert(toCreate as QuestionCreate).select("id").single();
            if (error) {
                resolve(error);
            }

            if (options != undefined && data != null) {
                options.forEach(to => to.questionid = data.id);
                const { error: insertError } = await this.supabase.from("questionoptions").insert(options);
                if (insertError) {
                    resolve(insertError);
                }
            }
            resolve(null);
        });
    }

    async patchQuestion(id: number, patch?: QuestionPatch, options?: QuestionOptionCreate[]): Promise<PostgrestError | null> {
        return new Promise(async (resolve) => {
            if (patch != undefined) {
                const { error } = await this.supabase.from("questions").update(patch).eq("id", id);
                if (error) {
                    resolve(error);
                }
            }
            if (options != undefined) {
                // Supabase doesn't like this field, postgrest adds it as a query parameter and then PG complains because it's a null entry
                options.forEach(to => delete to.id);

                // Find all options currently on file (to reload them if needed)
                const { error: listError, data: originalOptions } = await this.supabase.from("questionoptions").select("*").eq("questionid", id);
                if (listError) {
                    resolve(listError);
                }

                // Drop all options currently on file
                const { error: deleteError } = await this.supabase.from("questionoptions").delete().eq("questionid", id);
                if (deleteError) {
                    resolve(deleteError);
                }

                // Try to insert the new options
                const { error: insertError } = await this.supabase.from("questionoptions").insert(options);
                if (insertError) {
                    // Revert by deleting all options again and adding the old ones back
                    const { error: newDeleteError } = await this.supabase.from("questionoptions").delete().eq("questionid", id);
                    if (newDeleteError) {
                        resolve(newDeleteError);
                    }

                    const { error: newInsertError } = await this.supabase.from("questionoptions").insert(originalOptions);
                    if (newInsertError) {
                        resolve(newInsertError);
                    }

                    resolve(insertError);
                }
            }
            resolve(null);
        });
    }

    async reorderQuestions(newOrder: number[]): Promise<PostgrestError | Error | null> {
        return new Promise(async (resolve) => {
            // List all questions
            const { data, error } = await this.listQuestions();
            if (error) resolve(error);
            const questions = data as QuestionWithOptions[];

            const questionMap = new Map<number, Question>();

            // Create a map from question ID to question struct
            questions.forEach(q => questionMap.set(q.id, q));

            // Loop over new order, populate new array with proper ordering IDs as we go, removing from map
            let newOrderArray: Question[] = [];

            let orderingID = 1;
            newOrder.forEach(qid => {
                const question = questionMap.get(qid);
                if (question == undefined) {
                    resolve(new Error(`question ${qid} not found`));
                    return;
                }
                questionMap.delete(qid);
                question.orderingID = orderingID;
                newOrderArray.push(question);
                orderingID++;
            });

            // At end, if anything is left in map, return error
            if (questionMap.size > 0) {
                resolve(new Error(`not all questions were included in the reorder request, missing questions: ${questionMap.keys()}`));
                return;
            }

            const questionPatch = newOrderArray.map(q => { return { "id": q.id, "orderingID": q.orderingID }; });
            // Re-write questions with new order
            const { error: upsertError } = await this.supabase.from("questions").upsert(questionPatch);
            if (upsertError) {
                resolve(new Error(`error while updating questions during reorder: ${upsertError}`));
            }

            resolve(null);
        });
    }

    deleteQuestion(questionID: number): Promise<PostgrestError | null> {
        return new Promise(async (resolve) => {
            const { error: optionError } = await this.supabase.from("questionoptions").delete().eq("questionid", questionID);
            if (optionError) {
                resolve(optionError);
            }
            const { error } = await this.supabase.from("questions").delete().eq("id", questionID);
            resolve(error);
        });
    }


}