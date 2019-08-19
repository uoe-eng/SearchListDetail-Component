import { expect } from 'chai'
import Collection from '@/components/Collection'

describe('Collection.js', function() {
  const people = new Collection({
    name: 'people',
    columns: [
      { name: 'first_name', alias: 'First Name', caseSensitive: true },
      { name: 'last_name', alias: 'Surname', searchOperator: 'matches' },
      { name: 'cats.name' },
    ],
    previewOrder: ['last_name', 'first_name'],
  })

  it('sets the default values in the constructor', function() {
    expect(people).to.deep.equal({
      name: 'people',
      options: {
        name: 'people',
        columns: [
          {
            name: 'first_name',
            alias: 'First Name',
            caseSensitive: true,
            searchOperator: 'contains',
            searchable: true,
          },
          {
            name: 'last_name',
            alias: 'Surname',
            searchOperator: 'matches',
            caseSensitive: false,
            searchable: true,
          },
          {
            name: 'cats.name',
            alias: 'cats.name',
            caseSensitive: false,
            searchOperator: 'contains',
            searchable: true,
          },
        ],
        previewOrder: ['last_name', 'first_name'],
        show: true,
      },
      searchResults: [],
    })
  })

  it('returns the column names for the collection', function() {
    expect(people.columnNames).to.deep.equal([
      'first_name',
      'last_name',
      'cats.name',
    ])
  })
})
