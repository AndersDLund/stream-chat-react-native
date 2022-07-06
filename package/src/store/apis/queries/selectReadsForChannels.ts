import { QuickSqliteClient } from '../../QuickSqliteClient';
import { tables } from '../../schema';
import type { JoinedReadRow } from '../../types';

export const selectReadsForChannels = (cids: string[]): JoinedReadRow[] => {
  const questionMarks = Array(cids.length).fill('?').join(',');
  const readsColumnNames = Object.keys(tables.reads.columns)
    .map((name) => `'${name}', a.${name}`)
    .join(', ');
  const userColumnNames = Object.keys(tables.users.columns)
    .map((name) => `'${name}', b.${name}`)
    .join(', ');
  const result = QuickSqliteClient.selectQuery(
    `SELECT
      json_object(
        'user', json_object(
          ${userColumnNames}
        ),
        ${readsColumnNames}
      ) as value
    FROM reads a
    LEFT JOIN
      users b
    ON b.id = a.userId 
    WHERE a.cid in (${questionMarks})`,
    cids,
  );

  return result.map((r) => JSON.parse(r.value));
};
