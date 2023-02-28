import { Component, OnInit } from '@angular/core';
import { APIUtilityService } from '../../apiutility.service';
import { SupabaseService, Tag } from '../../supabase.service';

@Component({
  selector: 'app-tag-settings',
  templateUrl: './tag-settings.component.html',
  styleUrls: ['./tag-settings.component.sass']
})
export class TagSettingsComponent implements OnInit {
  constructor(public apiUtility: APIUtilityService, private supaService: SupabaseService) { }

  public tags?: Tag[];
  public tagsErr?: string;

  ngOnInit(): void {
    this.refetchTags();
  }

  public async refetchTags() {
    this.tags = undefined;
    this.tagsErr = undefined;
    const { data, error } = await this.supaService.listTags();
    if (error) {
      this.tagsErr = error.toString();
      return;
    }
    this.tags = data as Tag[];
  }
}
