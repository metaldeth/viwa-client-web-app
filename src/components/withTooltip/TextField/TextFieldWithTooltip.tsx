import { withTooltip } from '@asnefedov/uikit/withTooltip';
import { TextField } from '@asnefedov/uikit/TextField';

/**
 * Компонент TextField с тултипом
 */
const TextFieldWithTooltip = withTooltip({ direction: 'downCenter' })(TextField);

export default TextFieldWithTooltip;
