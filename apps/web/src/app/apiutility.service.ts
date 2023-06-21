import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FileSaverService } from 'ngx-filesaver';
import { AppService } from './app.service';
import { SupabaseService, Tag, TaggedFileEntry } from './supabase.service';
import { AxiosError } from 'axios';

@Injectable({
  providedIn: 'root'
})
export class APIUtilityService {
  tagsMap?: Map<number, string>;
  tagsFetchError?: string;

  constructor(private supaService: SupabaseService) { } // TODO: we need to call updateTagCache() ASAP (but not in the constructor cuz it breaks unit tests)

  // ===== Tag Cache
  public async updateTagCache() {
    this.tagsMap = undefined;
    this.tagsFetchError = undefined;
    const { data, error } = await this.supaService.listTags();
    if (error) {
      throw error;
    }
    const tags = data as Tag[];
    if (tags) {
      this.tagsMap = new Map<number, string>();
      tags.forEach(tag => { if (tag.id && tag.name) { this.tagsMap?.set(tag.id, tag.name); } });
    }
  }

  public getTagName(tagID: (number | undefined | null)): string | undefined {
    if (!this.tagsMap || !tagID) {
      return undefined;
    }
    return this.tagsMap.get(tagID);
  }

  public async getRandomUntaggedFile(avoidFile?: number): Promise<{ file: TaggedFileEntry | null, error: Error | null; }> {
    const { data: file, error } = await this.supaService.getRandomFile([], "all", [], "all", false, avoidFile);
    if (error) {
      return { file: null, error: error };
    }
    return { file, error: null };
  }
}
