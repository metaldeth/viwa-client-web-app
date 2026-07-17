import { withTooltip } from '@asnefedov/uikit/withTooltip';
import { Text } from '@asnefedov/uikit/Text';

/**
 * Компонент div с тултипом
 */
const DivWithTooltip = withTooltip({ direction: 'downCenter' })(Text);

export default DivWithTooltip;
