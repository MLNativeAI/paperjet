# Test Fixtures for DocumentExtractionService

This directory contains test fixtures for Go-style table-driven tests. Each fixture consists of two JSON files:

1. `{fixture_name}_config.json` - The WorkflowConfiguration used for extraction
2. `{fixture_name}_results.json` - The expected ExtractionResult

## Fixture Structure

### Config File (`*_config.json`)
Contains the workflow configuration with fields and tables to extract:
```json
{
  "fields": [
    {
      "id": "fld_xxx",
      "name": "field_name",
      "description": "Field description",
      "type": "text|number|date|currency|boolean",
      "categoryId": "cat_xxx",
      "required": true
    }
  ],
  "tables": [
    {
      "id": "tbl_xxx",
      "name": "table_name",
      "description": "Table description",
      "columns": [
        {
          "id": "col_xxx",
          "name": "column_name",
          "description": "Column description",
          "type": "text|number|date|currency|boolean",
          "required": true
        }
      ],
      "categoryId": "cat_xxx"
    }
  ]
}
```

### Results File (`*_results.json`)
Contains the expected extraction results:
```json
{
  "fields": [
    {
      "fieldName": "field_name",
      "value": "extracted_value"
    }
  ],
  "tables": [
    {
      "tableName": "table_name",
      "rows": [
        {
          "values": {
            "column_name": "cell_value"
          }
        }
      ]
    }
  ]
}
```

## Current Fixtures

- `bank_details_extractor` - Polish mBank statement extraction
- Add more fixtures here as they are created

## Adding New Fixtures

1. Create `{fixture_name}_config.json` with the workflow configuration
2. Create `{fixture_name}_results.json` with the expected extraction results
3. Add the fixture to the `testCases` array in `engine.test.ts`
4. Update this README with the new fixture description

## Usage in Tests

The fixtures are loaded automatically by the test framework using the `loadFixture()` function. Each fixture is run as a separate test case in the table-driven test suite.