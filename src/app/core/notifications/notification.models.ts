export interface NotificationItem {
  Notification_id: number;
  Vtype: string;
  Username: string;
  Msg: string;
  Inst_id: number | null;
  Readon: string | null;
  NotiDt: string | null;
}

export interface NotificationPayload {
  Notification_id?: number;
  Vtype: string;
  Username: string;
  Msg: string;
  Inst_id: number | null;
  Readon?: string | null;
}
