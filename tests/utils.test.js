
const { sentenceContainsMarkers, filesMatchPath,
  inputInCollection, isDiff, hclParse,
  uniqueElementsCount, isInCollection,
  sortUnstructuredCollection, writeFileSync } = require('../src/utils');

describe("Test utils.js ...", () => {

  describe("sentenceContainsMarkers(string,array[string]))", () => {
    test('sentence contains array values', () => {
      expect(sentenceContainsMarkers("## checklist \\n and le's remove", ['## checklist', 'remove'])).toBeTruthy();
    });

    test('sentence contains case insensitive values from an array', () => {
      expect(sentenceContainsMarkers("## Checklist \\n and le's remove", ['## checklist', 'remove'])).toBeTruthy();
    });

    test('sentence do not contains all the values from an array', () => {
      expect(sentenceContainsMarkers("## checklist \\n and le's remove", ['## checklist', 'added'])).toBeFalsy();
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

    test('single element is not a collection', () => {
      let first = "one";
      let second = ["one"];
      expect(isDiff(first, second, 1)).toBeFalsy();
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

    test('multiple arrays find unique elements count', () => {
      expect(uniqueElementsCount(["one"],["two"],["two", "three"])).toBe(3);
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
      expect(hclParse(hclString).resource.aws_kms_key.example).toStrictEqual([{ deletion_window_in_days: 10, description: 'kms-key-1' }]);
    });

    it.each([
      [['.gitlab-ci.yml'], ['terraform'], 0],
      [['.gitlab-ci.yml'], ['ci.yml'], 1],
      [['dynamodb/environments/datalake/eu-west-1/erasure/terraform.tfvars'], ['.gitlab-ci.yml', 'environments'], 1],
    ])('should filesMatchPath', (files, paths, result) => {
      expect(filesMatchPath(files, paths).length).toBe(result)
    });
  })

  describe("sortUnstructuredCollection(collection[string]))", () => {
    test('should sort collection of strings with commas', () => {
      let input = [
        'fulfilment_analytics_new_orders_v1_hbi_analytics_order_event_group_dlq,3,3',
        'dns_kafkaconnect_supply_chain_moomin_replen_rirolink_v1_deadletter,3,3',
        'hbi-onesearch-products-v5,3,3',
      ]
      let expected = [
        'dns_kafkaconnect_supply_chain_moomin_replen_rirolink_v1_deadletter,3,3',
        'fulfilment_analytics_new_orders_v1_hbi_analytics_order_event_group_dlq,3,3',
        'hbi-onesearch-products-v5,3,3',
      ]
      expect(sortUnstructuredCollection(input)).toStrictEqual(expected);
    });

    test('should sort collection of strings', () => {
      let input = [
        'fulfilment_analytics_new_orders_v1_hbi_analytics_order_event_group_dlq',
        'dns_kafkaconnect_supply_chain_moomin_replen_rirolink_v1_deadletter',
        'hbi-onesearch-products-v5',
      ]
      let expected = [
        'dns_kafkaconnect_supply_chain_moomin_replen_rirolink_v1_deadletter',
        'fulfilment_analytics_new_orders_v1_hbi_analytics_order_event_group_dlq',
        'hbi-onesearch-products-v5',
      ]
      expect(sortUnstructuredCollection(input)).toStrictEqual(expected);
    });

    test('should sort collection of strings with duplicates', () => {
      let input = [
        'fulfilment_analytics_new_orders_v1_hbi_analytics_order_event_group_dlq',
        'dns_kafkaconnect_supply_chain_moomin_replen_rirolink_v1_deadletter',
        'hbi-onesearch-products-v5',
        'hbi-onesearch-products-v5',
      ]
      let expected = [
        'dns_kafkaconnect_supply_chain_moomin_replen_rirolink_v1_deadletter',
        'fulfilment_analytics_new_orders_v1_hbi_analytics_order_event_group_dlq',
        'hbi-onesearch-products-v5',
        'hbi-onesearch-products-v5',
      ]
      expect(sortUnstructuredCollection(input)).toStrictEqual(expected);
    });
  })

  describe("writeFileSync(string,string))", () => {
    const fs = require("fs");
    let spyFsReadFileSync = jest
      .spyOn(fs, "writeFileSync")
      .mockReturnValue(true);
    writeFileSync('filename', 'some data to write')
    expect(spyFsReadFileSync).toHaveBeenCalledTimes(1);
  })
})
