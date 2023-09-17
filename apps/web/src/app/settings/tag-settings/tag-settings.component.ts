import { Component, OnInit } from '@angular/core';
import { APIUtilityService } from '../../apiutility.service';
import { SupabaseService, Tag } from '../../supabase.service';
import { MatDialog } from '@angular/material/dialog';
import { TagDeleteDialogComponent } from './tag-delete-dialog/tag-delete-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TagEditDialogComponent } from './tag-edit-dialog/tag-edit-dialog.component';

@Component({
  selector: 'app-tag-settings',
  templateUrl: './tag-settings.component.html',
  styleUrls: ['./tag-settings.component.sass']
})
export class TagSettingsComponent implements OnInit {
  constructor(public apiUtility: APIUtilityService, private supaService: SupabaseService, public dialog: MatDialog, public snackbar: MatSnackBar) { }

  public tags?: Tag[];
  public tagsErr?: string;

  ngOnInit(): void {
    this.refetchTags();
  }

  pastelColorForText(text: string | undefined): string {
    if (!text) {
      return "";
    }
    const hash = text.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);
    const pastelStrength = '93%';
    return `hsl(${hash % 360}, ${pastelStrength}, ${pastelStrength})`;
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

  deleteTag(tag: Tag) {
    if (!tag) {
      return;
    }

    this.dialog.open(TagDeleteDialogComponent, {
      data: {
        tagName: tag.name
      }
    }).afterClosed().subscribe(async (result: boolean) => {
      if (result) {
        const { error } = await this.supaService.deleteTag(tag.id);
        if (error) {
          this.snackbar.open(`Failed to delete tag ${tag.name}: ${error.message}`, undefined, { duration: 7500 });
        }
        this.refetchTags();
      }
    });
  }

  editTag(tag: Tag) {
    if (!tag) {
      return;
    }

    this.dialog.open(TagEditDialogComponent, {
      data: {
        tag: tag,
      }
    }).afterClosed().subscribe(async (result: Tag | null) => {
      if (result == null) {
        return;
      }

      const { error } = await this.supaService.patchTag(result);
      if (error) {
        this.snackbar.open(`Failed to edit tag ${tag.name}: ${error.message}`, undefined, { duration: 7500 });
      }
      this.refetchTags();
    });
  }
}
