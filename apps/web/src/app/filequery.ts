import { HttpParams } from '@angular/common/http';
import { Params } from '@angular/router';
import { Tag } from './supabase.service';

export type SearchMode = "any" | "all"

export class FileQuery {
  static includeTagsParam = "includeTags"
  static excludeTagsParam = "excludeTags"
  static includeModeParam = "includeOperator"
  static excludeModeParam = "excludeOperator"
  static taggedParam = "hasBeenTagged"

  constructor(public includeTags: number[],
    public excludeTags: number[],
    public includeMode: SearchMode,
    public excludeMode: SearchMode,
    public hasBeenTagged: boolean,
    public continueID: string = "") { }

  public httpParams(): HttpParams {
    let params = new HttpParams();
    if (this.includeTags.length > 0) {
      params = params.set(FileQuery.includeTagsParam, this.includeTags.join(","))
      params = params.set(FileQuery.includeModeParam, this.includeMode)
    }
    if (this.excludeTags.length > 0) {
      params = params.set(FileQuery.excludeTagsParam, this.excludeTags.join(","))
      params = params.set(FileQuery.excludeModeParam, this.excludeMode)
    }
    if (!this.hasBeenTagged) {
      params = params.set(FileQuery.taggedParam, this.hasBeenTagged)
    }

    return params
  }

  public searchPageParams(itName: string, imName: string, etName: string, emName: string): Params {
    let params: Params = {}
    if (this.includeTags.length > 0) {
      params[itName] = this.includeTags.join(",")
      params[imName] = this.includeMode
    }
    if (this.excludeTags.length > 0) {
      params[etName] = this.excludeTags.join(",")
      params[emName] = this.excludeMode
    }

    return params
  }

  public getIncludedTags(allTags: Tag[] | undefined): Tag[] {
    if (!allTags) return []
    return allTags.filter(tag => this.includeTags.find(id => tag.id === id))
  }

  public getExcludedTags(allTags: Tag[] | undefined): Tag[] {
    if (!allTags) return []
    return allTags.filter(tag => this.excludeTags.find(id => tag.id === id))
  }

  public getUnusedTags(allTags: Tag[] | undefined): Tag[] {
    if (!allTags) return []
    return allTags.filter(tag => (!this.includeTags.find(id => tag.id === id) && !this.excludeTags.find(id => tag.id === id)))
  }

  public equals(other: FileQuery): boolean {
    if (!other) {
      return false
    }

    if (this.includeMode != other.includeMode ||
      this.excludeMode != other.excludeMode ||
      this.includeTags != other.includeTags ||
      this.excludeTags != other.excludeTags ||
      this.hasBeenTagged != other.hasBeenTagged) {
      return false
    }
    return true
  }
}
