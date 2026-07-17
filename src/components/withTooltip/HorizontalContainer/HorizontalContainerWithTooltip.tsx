import { withTooltip } from '@asnefedov/uikit/withTooltip';
import HorizontalContainer from '../../HorizontalContainer';

/**
 * HorizontalContainer с tooltip
 */
const HorizontalContainerWithTooltip = withTooltip({ direction: 'downCenter' })(
  HorizontalContainer,
);

export default HorizontalContainerWithTooltip;
