import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../shared/api.service';
import { CompanyItem, ProdListByCompBody, ProdListByCompItem } from './cwap-master.models';

@Injectable({ providedIn: 'root' })
export class CwapMasterService {
        constructor(private api: ApiService) { }

        getCompanyList(firm: string): Observable<CompanyItem[]> {
                return this.api.get<CompanyItem[]>('/api/Pharmacy/PoRegisterAPI/GetMfgList', { firm });
        }

        getDatas(body: ProdListByCompBody): Observable<ProdListByCompItem[]> {
                return this.api.post<ProdListByCompItem[]>('/api/Pharmacy/PhCommonAPI/ProdListByCompRDLC', body);
        }

        exportReport(body: ProdListByCompBody): Observable<Blob> {
                return this.api.postBlob('/api/Pharmacy/PhCommonAPI/ProdListByCompRDLC', body);
        }
}
