import { withTooltip } from '@asnefedov/uikit/withTooltip';
import { Icon } from '@asnefedov/icons/__internal__/src/icons/Icon/Icon';

/**
 * Icon c тултипом
 */
const IconWithTooltip = withTooltip({ direction: 'downRight' })(Icon);

export default IconWithTooltip;
