export interface DischargeQueueItem {
  opdid:            number;
  fullname:         string;
  bedno:            string;
  nustname:         string;
  nustno:           number;
  doctname:         string;
  doctor_id:        number;
  unit:             string;
  isSchemeRequired: boolean;
  disReqDt:         string | null;
  disSumDt:         string | null;
  schemeClearDt:    string | null;
  pharmClearDt:     string | null;
  finClearDt:       string | null;
  waitingMins:      number;
  status:           string;
}
