import sanitizeUserSettings from '../sanitizeUserSettings';

describe('sanitizeUserSettings', () => {
  it('falls back to defaults for non-finite follower values', () => {
    expect(
      sanitizeUserSettings({
        defaultFollowers: Number.NEGATIVE_INFINITY,
      }).defaultFollowers,
    ).toBe(10);
  });

  it('normalizes numeric strings and floors decimals', () => {
    expect(
      sanitizeUserSettings({
        defaultSlow: '45.9' as unknown as number,
        defaultFollowers: '12' as unknown as number,
        toastDuration: '2500.7' as unknown as number,
      }),
    ).toMatchObject({
      defaultSlow: 45,
      defaultFollowers: 12,
      toastDuration: 2500,
    });
  });
});
