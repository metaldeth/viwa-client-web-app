import SubscriptionPriceNoticeModule, {
  ACCEPT_PATH,
  DECLINE_PATH,
  NOTICE_PATH,
} from './subscriptionPriceNoticeModule';

describe('subscriptionPriceNoticeModule', () => {
  it('fetches notice from /client/price-change/notice', async () => {
    const get = vi.fn().mockResolvedValue({
      schedule: {
        id: 'sched-1',
        subscriptionLevelId: 'tier-12',
        currentPriceKopecks: 49900,
        newPriceKopecks: 59900,
        effectiveAt: '2026-09-01T00:00:00.000Z',
      },
      latestDecision: null,
    });
    const module = new SubscriptionPriceNoticeModule({ get } as never);

    const response = await module.fetchNotice();

    expect(get).toHaveBeenCalledWith(NOTICE_PATH);
    expect(response.schedule?.id).toBe('sched-1');
  });

  it('posts accept with scheduleId only', async () => {
    const post = vi.fn().mockResolvedValue({
      decision: 'ACCEPTED',
      decidedAt: '2026-08-01T00:00:00.000Z',
    });
    const module = new SubscriptionPriceNoticeModule({ post } as never);

    await module.accept({ scheduleId: 'sched-1' });

    expect(post).toHaveBeenCalledWith(ACCEPT_PATH, { scheduleId: 'sched-1' });
  });

  it('posts decline with scheduleId only', async () => {
    const post = vi.fn().mockResolvedValue({
      decision: 'REFUSED',
      decidedAt: '2026-08-01T00:00:00.000Z',
    });
    const module = new SubscriptionPriceNoticeModule({ post } as never);

    await module.decline({ scheduleId: 'sched-1' });

    expect(post).toHaveBeenCalledWith(DECLINE_PATH, { scheduleId: 'sched-1' });
  });
});
