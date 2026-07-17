import { withTooltip } from '@asnefedov/uikit/withTooltip';
import { Badge } from '@asnefedov/uikit/Badge';

/**
 * Компонент Badge с тултипом
 */
const BadgeWithTooltip = withTooltip({ direction: 'downCenter' })(Badge);

export default BadgeWithTooltip;
