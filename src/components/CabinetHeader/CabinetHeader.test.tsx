/**
 * @vitest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import CabinetHeader from './CabinetHeader';

const logoutMock = vi.fn().mockResolvedValue(undefined);
const clearTokensMock = vi.fn();
const getRefreshTokenMock = vi.fn(() => 'refresh-token');

vi.mock('../../app/api', () => ({
  api: {
    getRefreshToken: () => getRefreshTokenMock(),
    clearTokens: () => clearTokensMock(),
    auth: {
      logout: (...args: unknown[]) => logoutMock(...args),
    },
  },
}));

vi.mock('../../pages/ValidationPage/helpers', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../pages/ValidationPage/helpers')>();
  return {
    ...actual,
    clearClientAuthStorage: vi.fn(),
  };
});

function renderHeader(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/home" element={<CabinetHeader />} />
        <Route path="/auth" element={<div data-testid="auth-page">auth</div>} />
        <Route path="/m/:serial/home" element={<CabinetHeader />} />
        <Route
          path="/m/:serial/auth"
          element={<div data-testid="machine-auth-page">machine auth</div>}
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe('CabinetHeader', () => {
  beforeEach(() => {
    logoutMock.mockClear();
    clearTokensMock.mockClear();
    getRefreshTokenMock.mockReturnValue('refresh-token');
  });

  it('opens menu from hamburger and shows logout action', () => {
    renderHeader('/home');

    const menuButton = screen.getByRole('button', { name: /Меню кабинета/i });
    expect(menuButton.hasAttribute('disabled')).toBe(false);
    expect(menuButton.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(menuButton);

    expect(menuButton.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByRole('menuitem', { name: /Выйти/i })).toBeTruthy();
  });

  it('closes menu on outside click and Escape', () => {
    renderHeader('/home');

    const menuButton = screen.getByRole('button', { name: /Меню кабинета/i });
    fireEvent.click(menuButton);
    expect(screen.getByRole('menuitem', { name: /Выйти/i })).toBeTruthy();

    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('menuitem', { name: /Выйти/i })).toBeNull();

    fireEvent.click(menuButton);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menuitem', { name: /Выйти/i })).toBeNull();
  });

  it('logs out and navigates to /auth from /home', () => {
    renderHeader('/home');

    fireEvent.click(screen.getByRole('button', { name: /Меню кабинета/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /Выйти/i }));

    expect(logoutMock).toHaveBeenCalledWith('refresh-token');
    expect(clearTokensMock).toHaveBeenCalled();
    expect(screen.getByTestId('auth-page')).toBeTruthy();
  });

  it('logs out and navigates to machine auth path from /m/:serial/home', () => {
    renderHeader('/m/VIWA-001/home');

    fireEvent.click(screen.getByRole('button', { name: /Меню кабинета/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: /Выйти/i }));

    expect(screen.getByTestId('machine-auth-page')).toBeTruthy();
  });
});
