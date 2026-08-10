/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

vi.mock('../components/AppHeader/AppHeader', () => ({
  default: () => <div data-testid="legacy-flow-header">FLOW</div>,
}));

vi.mock('./SubscriptionPage/SubscriptionPage', () => ({
  default: () => <div data-testid="subscription-page">cabinet</div>,
}));

vi.mock('./PaymentSuccessPage/PaymentSuccessPage', () => ({
  default: () => <div data-testid="payment-success-page">success</div>,
}));

vi.mock('./PaymentFailedPage/PaymentFailedPage', () => ({
  default: () => <div data-testid="payment-failed-page">failed</div>,
}));

vi.mock('./HomeAuthGuard', () => ({
  default: ({ children }: { children: JSX.Element }) => children,
}));

describe('App payment return routes', () => {
  it('registers /payment/success route', () => {
    render(
      <MemoryRouter initialEntries={['/payment/success']}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('payment-success-page')).toBeTruthy();
    expect(screen.queryByTestId('legacy-flow-header')).toBeNull();
  });

  it('registers /payment/failed route', () => {
    render(
      <MemoryRouter initialEntries={['/payment/failed']}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('payment-failed-page')).toBeTruthy();
    expect(screen.queryByTestId('legacy-flow-header')).toBeNull();
  });
});
