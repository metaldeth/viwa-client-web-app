import { withTooltip } from '@asnefedov/uikit/withTooltip';
import { DatePicker } from '@asnefedov/uikit/DatePicker';

/**
 * Компонент DatePicker с тултипом
 */
const DatePickerWithTooltip = withTooltip({ direction: 'downCenter' })(DatePicker);

export default DatePickerWithTooltip;
