import { withTooltip } from '@asnefedov/uikit/withTooltip';
import { Text } from '@asnefedov/uikit/Text';

/**
 * Компонент Text с тултипом
 */
const TextWithTooltip = withTooltip({ direction: 'downCenter' })(Text);

export default TextWithTooltip;
