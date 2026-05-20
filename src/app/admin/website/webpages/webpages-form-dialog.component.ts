import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { Editor, NgxEditorModule, Toolbar } from 'ngx-editor';
import { WebpagesService } from './webpages.service';
import { Webpage } from './webpages.models';
import { ToastService } from '../../../core/toast/toast.service';

@Component({
  selector: 'app-webpages-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxEditorModule],
  templateUrl: './webpages-form-dialog.component.html',
})
export class WebpagesFormDialogComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  saving = false;
  editor!: Editor;
  contentMode: 'wysiwyg' | 'html' = 'wysiwyg';

  readonly toolbar: Toolbar = [
    ['bold', 'italic', 'underline', 'strike'],
    ['ordered_list', 'bullet_list'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['link', 'image'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
    ['horizontal_rule', 'format_clear'],
    ['undo', 'redo'],
  ];

  get isEdit(): boolean { return !!this.data; }

  constructor(
    private fb: FormBuilder,
    private service: WebpagesService,
    private dialogRef: DialogRef<boolean, WebpagesFormDialogComponent>,
    private toast: ToastService,
    @Inject(DIALOG_DATA) public data: Webpage | null,
  ) {}

  ngOnInit(): void {
    this.editor = new Editor();
    this.form = this.fb.group({
      Webpage_id: [this.data?.Webpage_id ?? 0],
      Site:       [this.data?.Site ?? '',      [Validators.maxLength(5)]],
      Page_nm:    [this.data?.Page_nm ?? '',   [Validators.maxLength(50)]],
      Page_desc:  [this.data?.Page_desc ?? ''],
      Page_cont:  [this.data?.Page_cont ?? ''],
      Dept_id:    [this.data?.Dept_id ?? null],
    });
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }

  onSave(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    this.service.save(this.form.value).subscribe({
      next: () => {
        this.toast.show(this.isEdit ? 'Webpage updated' : 'Webpage created', { variant: 'success', duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.toast.show(err?.error?.Message || 'Error saving webpage', { variant: 'error', duration: 3000 });
        this.saving = false;
      },
    });
  }

  onCancel(): void { this.dialogRef.close(); }
}
