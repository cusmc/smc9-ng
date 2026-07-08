import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ActiveToast, IndividualConfig, ToastrService } from 'ngx-toastr';
import { ToastItem } from './toast.models';

export interface ToastOptions {
  title?: string;
  message: string;
  timeOut?: number;
}

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastShowOptions {
  variant?: ToastVariant;
  duration?: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _items = new BehaviorSubject<ToastItem[]>([]);
  readonly items: Observable<ToastItem[]> = this._items.asObservable();

  constructor(private readonly toastr: ToastrService) {}

  show(message: string, options?: ToastShowOptions): string {
    const variant = options?.variant ?? 'info';
    const title = this.defaultTitleForVariant(variant);
    const toast = this.showByVariant(variant, message, title, {
      timeOut: options?.duration ?? 3000
    });
    return toast?.toastId.toString() ?? '';
  }

  open(message: string, _action?: string, config?: { duration?: number; panelClass?: string }): void {
    let variant: ToastVariant = 'info';
    if (config?.panelClass?.includes('error')) {
      variant = 'error';
    }
    this.show(message, { variant, duration: config?.duration ?? 3000 });
  }

  dismiss(id: string): void {
    const parsedId = Number(id);
    if (Number.isFinite(parsedId)) {
      this.toastr.remove(parsedId);
      return;
    }
    this.toastr.clear();
  }

  showSuccess(message: string, title = 'Success'): void {
    this.toastr.success(message, title, this.buildOptions(2500, true, 'ngx-toastr toast-success'));
  }

  showError(message: string, title = 'Error'): void {
    this.toastr.error(message, title, this.buildOptions(3000, false, 'ngx-toastr toast-error'));
  }

  showWarning(message: string, title = 'Warning'): void {
    this.toastr.warning(message, title, this.buildOptions(2500, false, 'ngx-toastr toast-warning'));
  }

  showInfo(message: string, title = 'Information'): void {
    this.toastr.info(message, title, this.buildOptions(2500, false, 'ngx-toastr toast-info'));
  }

  showSaveSuccess(itemName = 'Item'): void {
    this.showSuccess(`${itemName} saved successfully!`, 'Success');
  }

  showUpdateSuccess(itemName = 'Item'): void {
    this.showSuccess(`${itemName} updated successfully!`, 'Success');
  }

  showDeleteSuccess(itemName = 'Item'): void {
    this.showSuccess(`${itemName} deleted successfully!`, 'Success');
  }

  showSaveError(itemName = 'Item', error?: string): void {
    const message = error || `Failed to save ${itemName.toLowerCase()}. Please try again.`;
    this.showError(message, 'Save Failed');
  }

  showUpdateError(itemName = 'Item', error?: string): void {
    const message = error || `Failed to update ${itemName.toLowerCase()}. Please try again.`;
    this.showError(message, 'Update Failed');
  }

  showLoadError(itemName = 'Data', error?: string): void {
    const message = error || `Failed to load ${itemName.toLowerCase()}. Please try again.`;
    this.showError(message, 'Load Failed');
  }

  showValidationError(message = 'Please check the form and try again.'): void {
    this.showWarning(message, 'Validation Error');
  }

  showSessionError(message = 'Your session has expired. Please login again.'): void {
    this.showWarning(message, 'Session Expired');
  }

  showNotFoundError(itemName = 'Item'): void {
    this.showError(`${itemName} not found. Please refresh and try again.`, 'Not Found');
  }

  showNetworkError(): void {
    this.showError(
      'Network connection error. Please check your internet connection and try again.',
      'Connection Error'
    );
  }

  showPermissionError(): void {
    this.showWarning('You do not have permission to perform this action.', 'Access Denied');
  }

  showCustom(
    message: string,
    type: ToastVariant,
    title?: string,
    options?: Partial<ToastOptions>
  ): void {
    const defaultOptions = {
      timeOut: type === 'error' ? 10000 : 2000,
      progressBar: true,
      closeButton: true,
      enableHtml: type === 'success'
    };
    this.showByVariant(type, message, title || this.defaultTitleForVariant(type), {
      ...defaultOptions,
      ...options
    });
  }

  clearAll(): void {
    this.toastr.clear();
  }

  clearToast(toastId: number): void {
    this.toastr.clear(toastId);
  }

  showLoginSuccess(userName?: string): void {
    const message = userName ? `Welcome back, ${userName}!` : 'Login successful!';
    this.showSuccess(message, 'Welcome');
  }

  showLoginError(error?: string): void {
    const message = error || 'Invalid credentials. Please check your username and password.';
    this.showError(message, 'Login Failed');
  }

  showLogoutSuccess(): void {
    this.showInfo('You have been logged out successfully.', 'Logged Out');
  }

  showPasswordResetSuccess(): void {
    this.showSuccess('Password reset instructions have been sent to your email.', 'Reset Link Sent');
  }

  showPasswordResetError(error?: string): void {
    const message = error || 'Failed to send password reset link. Please try again.';
    this.showError(message, 'Reset Failed');
  }

  showPasswordChangeSuccess(): void {
    this.showSuccess('Password changed successfully!', 'Password Updated');
  }

  showPasswordChangeError(error?: string): void {
    const message = error || 'Failed to change password. Please check your current password.';
    this.showError(message, 'Password Change Failed');
  }

  showUploadSuccess(fileName?: string): void {
    const message = fileName ? `${fileName} uploaded successfully!` : 'File uploaded successfully!';
    this.showSuccess(message, 'Upload Complete');
  }

  showUploadError(fileName?: string, error?: string): void {
    const message =
      error ||
      (fileName ? `Failed to upload ${fileName}. Please try again.` : 'File upload failed. Please try again.');
    this.showError(message, 'Upload Failed');
  }

  showUploadProgress(fileName: string, progress: number): void {
    this.showInfo(`Uploading ${fileName}: ${progress}%`, 'Upload in Progress');
  }

  showDownloadSuccess(fileName?: string): void {
    const message = fileName ? `${fileName} downloaded successfully!` : 'File downloaded successfully!';
    this.showSuccess(message, 'Download Complete');
  }

  showDownloadError(fileName?: string, error?: string): void {
    const message =
      error ||
      (fileName ? `Failed to download ${fileName}. Please try again.` : 'File download failed. Please try again.');
    this.showError(message, 'Download Failed');
  }

  showFileDeleteSuccess(fileName?: string): void {
    const message = fileName ? `${fileName} deleted successfully!` : 'File deleted successfully!';
    this.showSuccess(message, 'File Deleted');
  }

  showFileDeleteError(fileName?: string, error?: string): void {
    const message =
      error ||
      (fileName ? `Failed to delete ${fileName}. Please try again.` : 'File deletion failed. Please try again.');
    this.showError(message, 'Delete Failed');
  }

  showFileSizeError(maxSize: string): void {
    this.showError(`File size exceeds the maximum allowed size of ${maxSize}.`, 'File Too Large');
  }

  showFileTypeError(allowedTypes?: string[]): void {
    const types = allowedTypes ? allowedTypes.join(', ') : 'allowed types';
    this.showError(`Invalid file type. Please upload a file with ${types}.`, 'Invalid File Type');
  }

  showImportSuccess(itemCount?: number): void {
    const message = itemCount ? `${itemCount} items imported successfully!` : 'Data imported successfully!';
    this.showSuccess(message, 'Import Complete');
  }

  showImportError(error?: string): void {
    const message = error || 'Failed to import data. Please check the file format and try again.';
    this.showError(message, 'Import Failed');
  }

  showExportSuccess(fileName?: string): void {
    const message = fileName ? `Data exported to ${fileName} successfully!` : 'Data exported successfully!';
    this.showSuccess(message, 'Export Complete');
  }

  showExportError(error?: string): void {
    const message = error || 'Failed to export data. Please try again.';
    this.showError(message, 'Export Failed');
  }

  showSearchSuccess(resultCount?: number): void {
    const message = resultCount !== undefined ? `Found ${resultCount} result(s)` : 'Search completed successfully!';
    this.showInfo(message, 'Search Results');
  }

  showSearchError(error?: string): void {
    const message = error || 'Search failed. Please try again with different keywords.';
    this.showError(message, 'Search Failed');
  }

  showNoResultsFound(searchTerm?: string): void {
    const message = searchTerm ? `No results found for "${searchTerm}".` : 'No results found.';
    this.showInfo(message, 'No Results');
  }

  showBadRequestError(error?: string): void {
    const message = error || 'Invalid request. Please check your input and try again.';
    this.showError(message, 'Bad Request');
  }

  showUnauthorizedError(): void {
    this.showError('You are not authorized to access this resource. Please login again.', 'Unauthorized');
  }

  showForbiddenError(): void {
    this.showError('Access to this resource is forbidden.', 'Forbidden');
  }

  showServerError(error?: string): void {
    const message = error || 'Server error occurred. Please try again later or contact support.';
    this.showError(message, 'Server Error');
  }

  showServiceUnavailableError(): void {
    this.showError('Service is temporarily unavailable. Please try again later.', 'Service Unavailable');
  }

  showTimeoutError(): void {
    this.showError('Request timed out. Please check your connection and try again.', 'Request Timeout');
  }

  showCopySuccess(item?: string): void {
    const message = item ? `${item} copied to clipboard!` : 'Copied to clipboard!';
    this.showSuccess(message, 'Copied');
  }

  showCopyError(error?: string): void {
    const message = error || 'Failed to copy to clipboard. Please try again.';
    this.showError(message, 'Copy Failed');
  }

  showRefreshSuccess(): void {
    this.showSuccess('Data refreshed successfully!', 'Refreshed');
  }

  showRefreshError(error?: string): void {
    const message = error || 'Failed to refresh data. Please try again.';
    this.showError(message, 'Refresh Failed');
  }

  showBulkDeleteSuccess(count: number): void {
    this.showSuccess(`${count} item(s) deleted successfully!`, 'Bulk Delete Complete');
  }

  showBulkDeleteError(count?: number, error?: string): void {
    const message =
      error ||
      (count ? `Failed to delete ${count} item(s). Please try again.` : 'Bulk delete failed. Please try again.');
    this.showError(message, 'Bulk Delete Failed');
  }

  showBulkUpdateSuccess(count: number): void {
    this.showSuccess(`${count} item(s) updated successfully!`, 'Bulk Update Complete');
  }

  showBulkUpdateError(count?: number, error?: string): void {
    const message =
      error ||
      (count ? `Failed to update ${count} item(s). Please try again.` : 'Bulk update failed. Please try again.');
    this.showError(message, 'Bulk Update Failed');
  }

  showNoSelectionError(): void {
    this.showWarning('Please select at least one item to perform this action.', 'No Selection');
  }

  showActionCancelled(): void {
    this.showInfo('Action cancelled.', 'Cancelled');
  }

  showActionInProgress(action: string): void {
    this.showInfo(`${action} is in progress...`, 'Processing');
  }

  showActionComplete(action: string): void {
    this.showSuccess(`${action} completed successfully!`, 'Complete');
  }

  showFormDirtyWarning(): void {
    this.showWarning('You have unsaved changes. Are you sure you want to leave?', 'Unsaved Changes');
  }

  showRequiredFieldError(fieldName?: string): void {
    const message = fieldName ? `Please fill in the ${fieldName} field.` : 'Please fill in all required fields.';
    this.showWarning(message, 'Required Field');
  }

  showInvalidFormatError(fieldName?: string): void {
    const message = fieldName
      ? `Invalid format for ${fieldName}. Please check and try again.`
      : 'Invalid format. Please check your input and try again.';
    this.showWarning(message, 'Invalid Format');
  }

  showNotificationSent(): void {
    this.showSuccess('Notification sent successfully!', 'Notification Sent');
  }

  showNotificationError(error?: string): void {
    const message = error || 'Failed to send notification. Please try again.';
    this.showError(message, 'Notification Failed');
  }

  showEmailSent(): void {
    this.showSuccess('Email sent successfully!', 'Email Sent');
  }

  showEmailError(error?: string): void {
    const message = error || 'Failed to send email. Please try again.';
    this.showError(message, 'Email Failed');
  }

  showStatusChangeSuccess(newStatus: string): void {
    this.showSuccess(`Status changed to ${newStatus} successfully!`, 'Status Updated');
  }

  showStatusChangeError(error?: string): void {
    const message = error || 'Failed to change status. Please try again.';
    this.showError(message, 'Status Change Failed');
  }

  showDuplicateError(itemName?: string): void {
    const message = itemName
      ? `${itemName} already exists. Please use a different name.`
      : 'This item already exists. Please use a different value.';
    this.showWarning(message, 'Duplicate Entry');
  }

  showConflictError(error?: string): void {
    const message = error || 'A conflict occurred. The data may have been modified by another user.';
    this.showWarning(message, 'Conflict Detected');
  }

  showSubscriptionSuccess(planName?: string): void {
    const message = planName ? `Successfully subscribed to ${planName}!` : 'Subscription successful!';
    this.showSuccess(message, 'Subscribed');
  }

  showSubscriptionError(error?: string): void {
    const message = error || 'Failed to process subscription. Please try again.';
    this.showError(message, 'Subscription Failed');
  }

  showPaymentSuccess(amount?: string): void {
    const message = amount ? `Payment of ${amount} processed successfully!` : 'Payment processed successfully!';
    this.showSuccess(message, 'Payment Complete');
  }

  showPaymentError(error?: string): void {
    const message = error || 'Payment processing failed. Please try again.';
    this.showError(message, 'Payment Failed');
  }

  private buildOptions(timeOut: number, enableHtml: boolean, toastClass: string): Partial<IndividualConfig> {
    return {
      timeOut,
      progressBar: true,
      progressAnimation: 'decreasing',
      closeButton: true,
      enableHtml,
      toastClass
    };
  }

  private showByVariant(
    type: ToastVariant,
    message: string,
    title: string,
    options?: Partial<IndividualConfig>
  ): ActiveToast<any> | undefined {
    switch (type) {
      case 'success':
        return this.toastr.success(message, title, options);
      case 'error':
        return this.toastr.error(message, title, options);
      case 'warning':
        return this.toastr.warning(message, title, options);
      default:
        return this.toastr.info(message, title, options);
    }
  }

  private defaultTitleForVariant(variant: ToastVariant): string {
    switch (variant) {
      case 'success':
        return 'Success';
      case 'error':
        return 'Error';
      case 'warning':
        return 'Warning';
      default:
        return 'Information';
    }
  }
}
