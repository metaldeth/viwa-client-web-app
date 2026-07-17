import { GridTableProps } from './types';
import styles from './GridTable.module.scss';
import classNames from 'classnames';

/**
 * Таблица типа grid
 */
/**
 * Таблица типа grid
 */
const GridTable = <T,>({
  data,
  cellComponent: CellComponent,
  rowHeaderHeight = 36,
  rowContentHeight = 120,
  getRowTitle,
  rowGap = 16,
  cellGap = 8,
  showRowHeaders = true,
  rowContentClassName,
  layout = 'scroll',
  wrapColumns = 6,
}: GridTableProps<T>) => {
  const isWrap = layout === 'wrap';

  const normalizedData = isWrap ? [data.reduce<T[]>((acc, row) => acc.concat(row), [])] : data;

  return (
    <div className={styles.gridTable} style={{ gap: rowGap }}>
      {normalizedData.map((rowData, rowIndex) => (
        <div key={rowIndex} className={styles.gridRow}>
          {showRowHeaders && getRowTitle && !isWrap && (
            <div className={styles.rowHeader} style={{ height: rowHeaderHeight }}>
              {getRowTitle(rowIndex, rowData)}
            </div>
          )}
          <div
            className={classNames(styles.rowContent, rowContentClassName)}
            style={
              isWrap
                ? {
                    display: 'grid',
                    gridTemplateColumns: `repeat(${wrapColumns}, minmax(0, 1fr))`,
                    columnGap: cellGap,
                    rowGap: cellGap,
                    height: 'auto',
                    maxHeight: 'none',
                    overflowX: 'visible',
                  }
                : {
                    display: 'grid',
                    gridTemplateColumns: `repeat(${rowData.length}, 1fr)`,
                    gap: cellGap,
                    height: 'auto',
                    maxHeight: rowContentHeight,
                    overflowX: 'auto',
                  }
            }
          >
            {rowData.map((cellData, cellIndex) => (
              <div key={cellIndex} className={styles.gridCell}>
                <CellComponent data={cellData} rowIndex={rowIndex} cellIndex={cellIndex} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default GridTable;
