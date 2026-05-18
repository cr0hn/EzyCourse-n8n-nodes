describe('Field mapping and transformations', () => {
  describe('isCompleted boolean to integer conversion', () => {
    function toEzyCourseInt(value: boolean): number {
      return value ? 1 : 0;
    }

    it('converts true to 1', () => {
      expect(toEzyCourseInt(true)).toBe(1);
    });

    it('converts false to 0', () => {
      expect(toEzyCourseInt(false)).toBe(0);
    });
  });

  describe('baseUrl normalization', () => {
    function normalizeBaseUrl(url: string): string {
      return url.replace(/\/$/, '');
    }

    it('removes trailing slash', () => {
      expect(normalizeBaseUrl('https://academy.com/')).toBe('https://academy.com');
    });

    it('leaves URL without trailing slash unchanged', () => {
      expect(normalizeBaseUrl('https://academy.com')).toBe('https://academy.com');
    });
  });

  describe('product type values', () => {
    const validProductTypes = [
      'course', 'bundle_course', 'private_chat', 'community', 'group',
      'digital_product', 'physical_product', 'video_library', 'audio_library',
      'membership', 'organization', 'coaching_program',
    ];

    it('contains all 12 expected product types', () => {
      expect(validProductTypes).toHaveLength(12);
    });

    it('includes membership and organization (price_id mandatory)', () => {
      expect(validProductTypes).toContain('membership');
      expect(validProductTypes).toContain('organization');
    });
  });

  describe('tag IDs format', () => {
    function parseTagIds(input: string): number[] {
      return input.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
    }

    it('parses comma-separated tag IDs', () => {
      expect(parseTagIds('1,2,3')).toEqual([1, 2, 3]);
    });

    it('handles spaces around commas', () => {
      expect(parseTagIds('1, 2, 3')).toEqual([1, 2, 3]);
    });

    it('filters out invalid values', () => {
      expect(parseTagIds('1,abc,3')).toEqual([1, 3]);
    });
  });
});
