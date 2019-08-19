import { expect } from 'chai'
import util from '@/components/util'
import sinon from 'sinon'
import Collection from '@/components/Collection'

describe('util.js', function() {
  let database, globalstore, people
  const errorSpy = sinon.spy(console, 'error')

  beforeEach(function() {
    errorSpy.resetHistory()

    database = {
      people: {
        1: {
          first_name: 'Alice',
          last_name: 'Smith',
          _jv: { relationships: { cats: { data: [] } } },
        },
        2: {
          first_name: 'Bob',
          last_name: 'Smithers',
          _jv: { relationships: { cats: { data: [{ type: 'cats', id: 1 }] } } },
        },
        3: {
          first_name: 'Charlie',
          last_name: 'Smithson',
          _jv: {
            relationships: {
              cats: {
                data: [{ type: 'cats', id: 1 }, { type: 'cats', id: 2 }],
              },
            },
          },
        },
        4: {
          first_name: 'David',
          last_name: 'Smith',
          _jv: { relationships: { cats: { data: [] } } },
        },
      },
      cats: {
        1: { name: 'Ella' },
        2: { name: 'Felix' },
        3: { name: 'Gelard' },
      },
    }

    globalstore = {
      getters: {
        'jv/get': (query) => {
          switch (query) {
            case 'people':
              return database.people
            case 'cats':
              return database.cats
            case 'people/1':
              return database.people['1']
            case 'people/2':
              return database.people['2']
            case 'people/3':
              return database.people['3']
            case 'people/4':
              return database.people['4']
            case 'cats/1':
              return database.cats['1']
            case 'cats/2':
              return database.cats['2']
            case 'cats/3':
              return database.cats['3']
          }
        },
      },
    }

    people = new Collection({
      name: 'people',
      columns: [
        { name: 'first_name', alias: 'First Name', caseSensitive: true },
        { name: 'last_name', alias: 'Surname', searchOperator: 'matches' },
        { name: 'cats.name' },
      ],
      previewOrder: ['last_name', 'first_name'],
    })
  })

  it('gets a collection from the store by name', function() {
    const localstore = {
      state: {
        collections: [{ name: 'people' }, { name: 'cats' }, { name: 'dogs' }],
      },
    }

    expect(util.getCollection(localstore, 'people')).to.deep.equal({
      name: 'people',
    })
    expect(util.getCollection(localstore, 'cats')).to.deep.equal({
      name: 'cats',
    })
    expect(util.getCollection(localstore, 'dogs')).to.deep.equal({
      name: 'dogs',
    })
  })

  it('logs an error when collection does not exist', function() {
    const localstore = {
      state: {
        collections: [{ name: 'people' }, { name: 'cats' }, { name: 'dogs' }],
      },
    }

    util.getCollection(localstore, 'elephants')
    expect(errorSpy.callCount).to.equal(1)
  })

  it('cleans an entry', function() {
    const entry = {
      _jv: { data: '_jv' },
      name: 'Alice',
      surname: 'Alison',
      cats: { data: 'cat1' },
      dogs: { data: 'dog1' },
    }

    expect(util.cleanEntry(entry)).to.deep.equal({
      _jv: { data: '_jv' },
      name: 'Alice',
      surname: 'Alison',
    })
  })

  it('gets types and ids for related entries', function() {
    const entry = {
      _jv: {
        relationships: {
          cats: {
            data: [{ type: 'cats', id: '1' }, { type: 'cats', id: '2' }],
          },
          dogs: {
            data: { type: 'dogs', id: '3' },
          },
          jobs: { data: null },
        },
      },
    }

    expect(util.getRelatedEntries(entry, 'cats.name')).to.deep.equal([
      { type: 'cats', id: '1' },
      { type: 'cats', id: '2' },
    ])
    expect(util.getRelatedEntries(entry, 'dogs.name')).to.deep.equal([
      { type: 'dogs', id: '3' },
    ])
    expect(util.getRelatedEntries(entry, 'jobs.title')).to.deep.equal([])
  })

  it('logs an error when a relationship does not exist', function() {
    const entry = {
      _jv: {
        relationships: {
          cats: {
            data: [{ type: 'cats', id: '1' }, { type: 'cats', id: '2' }],
          },
          dogs: {
            data: { type: 'dogs', id: '3' },
          },
          jobs: { data: null },
        },
      },
    }

    util.getRelatedEntries(entry, 'nonexistent.relationship')
    expect(errorSpy.callCount).to.equal(1)
  })

  it('filters entries from a simple search', function() {
    expect(util.filterEntries(globalstore, people, 'l')).to.deep.equal(
      ['1', '3'] // Alice and Charlie
    )
  })

  it('filters entries with case sensitive column options', function() {
    // first names are set to case sensitive so 'Alice' won't be matched by 'a'
    expect(util.filterEntries(globalstore, people, 'a')).to.deep.equal(
      ['3', '4'] // Charlie and David
    )
  })

  it('filters entries with different column search operators', function() {
    // surname is set to 'matching' search operator so e.g. 'Smithson' won't appear
    expect(util.filterEntries(globalstore, people, 'smith')).to.deep.equal(
      ['1', '4'] // Alice Smith and David Smith
    )
  })

  it('ignores columns that are set to not searchable', function() {
    // set the last name to not searchable
    people.options.columns[1].searchable = false
    expect(util.filterEntries(globalstore, people, 'smith')).to.deep.equal([])
  })

  it('returns no results when all columns are set to unsearchable', function() {
    people.options.columns[0].searchable = false
    people.options.columns[1].searchable = false

    // ignores Bob even though 'Smithers' has an 'i'
    expect(util.filterEntries(globalstore, people, 'i')).to.deep.equal([])
  })

  it('returns no results for an empty seach', function() {
    // ignores Bob even though 'Smithers' has an 'i'
    expect(util.filterEntries(globalstore, people, '')).to.deep.equal([])
  })

  it('returns table data for handsontable', function() {
    people.searchResults = ['1', '2', '3']
    const data = util.getSplitTableData(globalstore, undefined, people)
    expect(data).to.deep.equal({
      top: [
        ['+', 'Alice', 'Smith', '-'],
        ['+', 'Bob', 'Smithers', 'Ella'],
        ['+', 'Charlie', 'Smithson', '2 items...'],
      ],
      topIDs: ['1', '2', '3'],
      bottom: [],
      bottomIDs: [],
    })
  })

  it('returns table data where the top entry is expanded', function() {
    people.searchResults = ['1', '2', '3']
    const data = util.getSplitTableData(globalstore, '1', people)
    expect(data).to.deep.equal({
      top: [],
      topIDs: [],
      bottom: [
        ['+', 'Bob', 'Smithers', 'Ella'],
        ['+', 'Charlie', 'Smithson', '2 items...'],
      ],
      bottomIDs: ['2', '3'],
    })
  })

  it('returns table data where an entry in the middle is expanded', function() {
    people.searchResults = ['1', '2', '3']
    const data = util.getSplitTableData(globalstore, '2', people)
    expect(data).to.deep.equal({
      top: [['+', 'Alice', 'Smith', '-']],
      topIDs: ['1'],
      bottom: [['+', 'Charlie', 'Smithson', '2 items...']],
      bottomIDs: ['3'],
    })
  })

  it('returns table data the bottom entry is expanded', function() {
    people.searchResults = ['1', '2', '3']
    const data = util.getSplitTableData(globalstore, '3', people)
    expect(data).to.deep.equal({
      top: [['+', 'Alice', 'Smith', '-'], ['+', 'Bob', 'Smithers', 'Ella']],
      topIDs: ['1', '2'],
      bottom: [],
      bottomIDs: [],
    })
  })

  it('returns the alias for a column', function() {
    expect(util.getColumnAlias(people, 'first_name')).to.equal('First Name')
    expect(util.getColumnAlias(people, 'last_name')).to.equal('Surname')
  })

  it('returns the column name if alias is unspecified', function() {
    expect(util.getColumnAlias(people, 'cats.name')).to.equal('cats.name')
  })
})
