
const { sentenceContainsValues,
  inputInCollection, isDiff, hclParse,
  uniqueElementsCount, isInCollection } = require('../src/utils');

describe("Test utils.js ...", () => {

  describe("sentenceContainsValues(string,array[string]))", () => {
    test('sentence contains array values', () => {
      expect(sentenceContainsValues("## checklist \\n and le's remove", ['## checklist', 'remove'])).toBeTruthy();
    });

    test('sentence contains case insensitive values from an array', () => {
      expect(sentenceContainsValues("## Checklist \\n and le's remove", ['## checklist', 'remove'])).toBeTruthy();
    });

    test('sentence do not contains all the values from an array', () => {
      expect(sentenceContainsValues("## checklist \\n and le's remove", ['## checklist', 'added'])).toBeFalsy();
    });
  })

  describe("inputInCollection(string,collection[string]))", () => {
    test('input is in collection', () => {
      expect(inputInCollection('mysql', ['mysql', 'postgres'])).toBeTruthy();
    });
    test('input not in collection', () => {
      expect(inputInCollection('dynamo', ['mysql', 'postgres'])).toBeFalsy();
    });
  })

  describe("isDiff(collection,  collection)", () => {

    test('object length is more then one', () => {
      let first = ["one", "two", "three"];
      let second = ["one"];
      expect(isDiff(first, second, 1)).toBeTruthy();
    });

    test('two objects similar', () => {
      let first = [
        {
          hash_key: 'basketId',
          name: 'idx_by_basket_id',
          non_key_attributes: [],
          projection_type: 'KEYS_ONLY',
          range_key: '',
          read_capacity: null,
          write_capacity: null
        },
        {
          hash_key: 'customerId',
          name: 'idx_by_customer_id',
          non_key_attributes: [],
          projection_type: 'KEYS_ONLY',
          range_key: 'id',
          read_capacity: null,
          write_capacity: null
        },
        {
          hash_key: 'customerEmail',
          name: 'idx_by_customer_email',
          non_key_attributes: [],
          projection_type: 'KEYS_ONLY',
          range_key: 'id',
          read_capacity: null,
          write_capacity: null
        }
      ];
      let second = [
        {
          hash_key: 'basketId',
          name: 'idx_by_basket_id',
          non_key_attributes: [],
          projection_type: 'KEYS_ONLY',
          range_key: '',
          read_capacity: null,
          write_capacity: null
        },
        {
          hash_key: 'customerId',
          name: 'idx_by_customer_id',
          non_key_attributes: [],
          projection_type: 'KEYS_ONLY',
          range_key: 'id',
          read_capacity: null,
          write_capacity: null
        },
        {
          hash_key: 'customerEmail',
          name: 'idx_by_customer_email',
          non_key_attributes: [],
          projection_type: 'KEYS_ONLY',
          range_key: 'id',
          read_capacity: null,
          write_capacity: null
        }
      ];
      expect(isDiff(first, second, 1)).toBeFalsy();
    });

    test('single key different', () => {
      let first = [
        {
          hash_key: 'basketId',
          name: 'idx_by_basket_id',
          non_key_attributes: [],
          projection_type: 'KEYS_ONLY',
          range_key: '',
          read_capacity: null,
          write_capacity: null
        },
        {
          hash_key: 'customerId',
          name: 'idx_by_customer_id',
          non_key_attributes: [],
          projection_type: 'KEYS_ONLY',
          range_key: 'id',
          read_capacity: null,
          write_capacity: null
        },
        {
          hash_key: 'customerEmail',
          name: 'idx_by_customer_email',
          non_key_attributes: [],
          projection_type: 'KEYS_ONLY',
          range_key: 'id',
          read_capacity: null,
          write_capacity: null
        }
      ];
      let second = [
        {
          hash_key: 'basketId',
          name: 'idx_by_basket_id',
          non_key_attributes: [],
          projection_type: 'KEYS_ONLY',
          range_key: '',
          read_capacity: null,
          write_capacity: null
        },
        {
          hash_key: 'customerId',
          name: 'idx_by_customer_id_x',
          non_key_attributes: [],
          projection_type: 'KEYS_ONLY',
          range_key: 'id',
          read_capacity: null,
          write_capacity: null
        },
        {
          hash_key: 'customerEmail',
          name: 'idx_by_customer_email',
          non_key_attributes: [],
          projection_type: 'KEYS_ONLY',
          range_key: 'id',
          read_capacity: 1,
          write_capacity: null
        }
      ];
      expect(isDiff(first, second, 1)).toBeTruthy();
    });
  })

  describe("uniqueElementsCount(collection[any]))", () => {

    it.each([
      [['one', 'one', 'two', 'two'], 2],
      [['one', 'one'], 1],
      [['one', 'two', 'three'], 3],
    ])('collection of elements %p contains unique %p', (elements, result) => {
      expect(uniqueElementsCount(elements)).toEqual(result);
    });
  })

  describe("isInCollection(string,collection[string]))", () => {

    it.each([
      ['one', ['one', 'two'], true],
      // not in collection
      ['four', ['one', 'two'], false],
    ])('element %p is in collection %p', (target, collection, result) => {
      expect(isInCollection(target, collection)).toEqual(result);
    });
  })

  describe("hclParse(string))", () => {

    test('parse valid hcl input', () => {
      const hclString = `
        # Create a resource
        resource "aws_kms_key" "example" {
          description             = "kms-key-1"
          deletion_window_in_days = 10
        }
        `
      console.log(hclParse(hclString).resource.aws_kms_key.example)
      expect(hclParse(hclString).resource.aws_kms_key.example).toStrictEqual([{ deletion_window_in_days: 10, description: 'kms-key-1' }]);
    });
  })
})