import { withTooltip } from '@asnefedov/uikit/withTooltip';
import { FC } from 'react';
import { TableHeaderButtonProps } from './types';
import { Button } from '@asnefedov/uikit/Button';

const ContainerWithTooltip = withTooltip({ direction: 'downCenter', mode: 'mouseover' })(Button);

/**
 * Кнопка для таблицы
 */
const TableHeaderButton: FC<TableHeaderButtonProps> = (props) => {
  const newProps = {
    ...props,
    view: 'clear' as const,
  };

  if (typeof newProps.tooltipText === 'string') {
    return <ContainerWithTooltip {...newProps} tooltipProps={{ content: newProps.tooltipText }} />;
  }
  return <Button {...newProps} />;
};

export default TableHeaderButton;
