import { toEzyCourseInt, normalizeBaseUrl, parseTagIds } from '../../nodes/EzyCourse/utils/helpers';

describe('Field mapping and transformations', () => {
  describe('isCompleted boolean to integer conversion', () => {
    it('converts true to 1', () => {
      expect(toEzyCourseInt(true)).toBe(1);
    });

    it('converts false to 0', () => {
      expect(toEzyCourseInt(false)).toBe(0);
    });
  });

  describe('baseUrl normalization', () => {
    it('removes trailing slash', () => {
      expect(normalizeBaseUrl('https://academy.com/')).toBe('https://academy.com');
    });

    it('leaves URL without trailing slash unchanged', () => {
      expect(normalizeBaseUrl('https://academy.com')).toBe('https://academy.com');
    });

    it('removes only one trailing slash (double slash leaves one)', () => {
      // regex /\/$/ strips the last slash; a second call would strip the next one.
      // Documenting the actual behaviour so any future change is explicit.
      const result = normalizeBaseUrl('https://academy.com//');
      expect(result).toBe('https://academy.com/');
    });

    it('handles URL with path and trailing slash', () => {
      expect(normalizeBaseUrl('https://academy.com/api/')).toBe('https://academy.com/api');
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
    it('parses comma-separated tag IDs', () => {
      expect(parseTagIds('1,2,3')).toEqual([1, 2, 3]);
    });

    it('handles spaces around commas', () => {
      expect(parseTagIds('1, 2, 3')).toEqual([1, 2, 3]);
    });

    it('filters out invalid values', () => {
      expect(parseTagIds('1,abc,3')).toEqual([1, 3]);
    });

    it('returns empty array for empty string', () => {
      expect(parseTagIds('')).toEqual([]);
    });

    it('parses a single tag ID', () => {
      expect(parseTagIds('42')).toEqual([42]);
    });

    it('handles leading and trailing spaces in the full string', () => {
      expect(parseTagIds(' 1 , 2 , 3 ')).toEqual([1, 2, 3]);
    });

    it('filters out all values when none are numeric', () => {
      expect(parseTagIds('abc,def,ghi')).toEqual([]);
    });

    it('handles duplicate IDs (no deduplication)', () => {
      expect(parseTagIds('1,1,2')).toEqual([1, 1, 2]);
    });
  });
});
