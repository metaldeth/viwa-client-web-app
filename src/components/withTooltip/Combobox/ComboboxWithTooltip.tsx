import { withTooltip } from '@asnefedov/uikit/withTooltip';
import { Combobox } from '@asnefedov/uikit/Combobox';

/**
 * Компонент Combobox с тултипом
 */
const ComboboxWithTooltip = withTooltip({ direction: 'downCenter' })(Combobox);

export default ComboboxWithTooltip;
