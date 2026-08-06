import {
  isStalePriceScheduleSubmitError,
  normalizePriceChangeNotice,
} from './subscriptionPriceNotice';

describe('normalizePriceChangeNotice', () => {
  it('returns null when schedule is absent', () => {
    expect(
      normalizePriceChangeNotice({
        schedule: null,
        latestDecision: null,
      }),
    ).toBeNull();
  });

  it('maps schedule fields and ACCEPTED decision', () => {
    expect(
      normalizePriceChangeNotice({
        schedule: {
          id: 'sched-1',
          subscriptionLevelId: 'tier-12',
          currentPriceKopecks: 49900,
          newPriceKopecks: 59900,
          effectiveAt: '2026-09-01T00:00:00.000Z',
        },
        latestDecision: 'ACCEPTED',
      }),
    ).toEqual({
      scheduleId: 'sched-1',
      subscriptionLevelId: 'tier-12',
      currentPriceKopecks: 49900,
      newPriceKopecks: 59900,
      effectiveAt: '2026-09-01T00:00:00.000Z',
      latestDecision: 'ACCEPTED',
    });
  });

  it('maps backend REFUSED to UI DECLINED', () => {
    expect(
      normalizePriceChangeNotice({
        schedule: {
          id: 'sched-1',
          subscriptionLevelId: 'tier-12',
          currentPriceKopecks: 49900,
          newPriceKopecks: 59900,
          effectiveAt: '2026-09-01T00:00:00.000Z',
        },
        latestDecision: 'REFUSED',
      })?.latestDecision,
    ).toBe('DECLINED');
  });

  it('includes tierName when provided via options', () => {
    expect(
      normalizePriceChangeNotice(
        {
          schedule: {
            id: 'sched-1',
            subscriptionLevelId: 'tier-12',
            currentPriceKopecks: 49900,
            newPriceKopecks: 59900,
            effectiveAt: '2026-09-01T00:00:00.000Z',
          },
          latestDecision: null,
        },
        { tierName: '12 литров' },
      )?.tierName,
    ).toBe('12 литров');
  });
});

describe('isStalePriceScheduleSubmitError', () => {
  it('detects axios-shaped 404 stale schedule errors', () => {
    expect(
      isStalePriceScheduleSubmitError({
        status: 404,
        code: '404',
        message: 'Active price schedule not found',
      }),
    ).toBe(true);
  });

  it('ignores generic server errors', () => {
    expect(isStalePriceScheduleSubmitError(new Error('500'))).toBe(false);
  });
});
