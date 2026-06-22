import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../shared/api.service';
import {
  HostelRawRow,
  PivotData,
  BuildingRow,
  InstInfo,
} from './hostel-dashboard.models';

const BASE = '/api/Campus/RoommastsAPI';

@Injectable({ providedIn: 'root' })
export class HostelDashboardService {
  constructor(private api: ApiService) {}

  load(): Observable<PivotData> {
    return this.api
      .get<HostelRawRow[]>(`${BASE}/HostelSummaryRaw`)
      .pipe(map(rows => this.pivot(rows)));
  }

  private pivot(rows: HostelRawRow[]): PivotData {
    // 1. Distinct institutes ordered by Inst_id
    const instMap = new Map<number, string>();
    rows.forEach(r => instMap.set(r.Inst_id, r.Inst_cd));
    const institutes: InstInfo[] = Array.from(instMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([Inst_id, Inst_cd]) => ({ Inst_id, Inst_cd }));

    // 2. Accumulate per building
    const buildingMap = new Map<number, BuildingRow>();
    rows.forEach(r => {
      if (!buildingMap.has(r.Building_id)) {
        buildingMap.set(r.Building_id, {
          Building_nm: r.Building_nm,
          Building_id: r.Building_id,
          cells:      {},
          instTotals: {},
          total:      0,
        });
      }
      const row = buildingMap.get(r.Building_id)!;
      const key =
        r.ResType === 'E'
          ? `${r.Inst_cd}_E`
          : r.Sex === 'M'
            ? `${r.Inst_cd}_B`
            : `${r.Inst_cd}_G`;
      row.cells[key] = (row.cells[key] ?? 0) + r.Cnt;
      row.instTotals[r.Inst_id] = (row.instTotals[r.Inst_id] ?? 0) + r.Cnt;
      row.total += r.Cnt;
    });

    const buildings = Array.from(buildingMap.values()).sort((a, b) =>
      a.Building_nm.localeCompare(b.Building_nm),
    );

    // 3. Grand-total row
    const totalRow: BuildingRow = {
      Building_nm: 'TOTAL',
      Building_id: 0,
      cells:       {},
      instTotals:  {},
      total:       0,
    };
    buildings.forEach(b => {
      Object.entries(b.cells).forEach(([k, v]) => {
        totalRow.cells[k] = (totalRow.cells[k] ?? 0) + v;
      });
      Object.entries(b.instTotals).forEach(([k, v]) => {
        totalRow.instTotals[+k] = (totalRow.instTotals[+k] ?? 0) + v;
      });
      totalRow.total += b.total;
    });

    // 4. KPI
    const sumCells = (suffix: string) =>
      Object.entries(totalRow.cells)
        .filter(([k]) => k.endsWith(suffix))
        .reduce((s, [, v]) => s + v, 0);

    const kpi = {
      total: totalRow.total,
      boys:  sumCells('_B'),
      girls: sumCells('_G'),
      staff: sumCells('_E'),
    };

    return { institutes, buildings, totalRow, kpi };
  }
}
