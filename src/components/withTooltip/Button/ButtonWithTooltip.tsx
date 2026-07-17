import { withTooltip } from '@asnefedov/uikit/withTooltip';
import { Button } from '@asnefedov/uikit/Button';

/**
 * Компонент Button с тултипом
 */
const ButtonWithTooltip = withTooltip({ direction: 'downCenter' })(Button);

export default ButtonWithTooltip;
