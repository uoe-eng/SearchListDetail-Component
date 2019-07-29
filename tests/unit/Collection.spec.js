import { expect } from 'chai'
import Collection from '@/components/Collection'
import sinon from 'sinon'

describe('Collection.js', function() {
  let collection,
    updateSearchResultsSpy,
    jvPatchSpy,
    jvPatchStub,
    jvGetSpy,
    jvGetStub,
    localstore,
    globalstore

  beforeEach(function() {
    updateSearchResultsSpy = sinon.spy()
    jvPatchSpy = sinon.spy()
    jvGetSpy = sinon.spy()

    jvPatchStub = sinon.stub().callsFake((action, args) => {
      jvPatchSpy(action, args)
      // return new Promise((resolve) => resolve())
      // non-async version
      return {
        then: (callback) => callback(),
      }
    })

    jvGetStub = sinon.stub()
    jvGetStub.withArgs('people').callsFake(() => {
      jvGetSpy()
      return {
        1: {
          first_name: 'Alice',
          last_name: 'Smith',
          cats: {},
        },
        2: {
          first_name: 'Bob',
          last_name: 'Smithers',
          cats: {
            1: {
              name: 'Ella',
            },
          },
        },
        3: {
          first_name: 'Charlie',
          last_name: 'Smithson',
          cats: {
            1: {
              name: 'Ella',
            },
            2: {
              name: 'Felix',
            },
          },
        },
        4: {
          first_name: 'David',
          last_name: 'Smith',
          cats: {},
        },
      }
    })
    jvGetStub.withArgs('cats').callsFake(() => {
      jvGetSpy()
      return {
        1: {
          name: 'Ella',
        },
        2: {
          name: 'Felix',
        },
        3: {
          name: 'Gelard',
        },
      }
    })

    const sldProp = {
      name: 'people',
      columns: [
        {
          name: 'first_name',
          alias: 'First Name',
          caseSensitive: true,
        },
        {
          name: 'last_name',
          alias: 'Surname',
          searchOperator: 'matches',
        },
        {
          name: 'cats.name',
        },
      ],
      previewOrder: ['last_name', 'first_name'],
    }

    localstore = {
      dispatch: updateSearchResultsSpy,
    }

    globalstore = {
      dispatch: jvPatchStub,
      getters: {
        'jv/get': jvGetStub,
      },
    }

    collection = new Collection(sldProp, localstore, globalstore)

    collection.searchResults = {
      1: {
        first_name: 'Alice',
        last_name: 'Smith',
        cats: {},
      },
      2: {
        first_name: 'Bob',
        last_name: 'Smithers',
        cats: {
          1: {
            _jv: {
              type: 'cats',
              id: 1,
            },
          },
        },
      },
      3: {
        first_name: 'Charlie',
        last_name: 'Smithson',
        cats: {
          1: {
            _jv: {
              type: 'cats',
              id: 1,
            },
          },
          2: {
            _jv: {
              type: 'cats',
              id: 2,
            },
          },
        },
      },
    }
  })

  it('sets the default values in the constructor', function() {
    const expected = {
      name: 'people',
      localstore: localstore,
      globalstore: globalstore,
      columnNames: ['first_name', 'last_name', 'cats.name'],
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
            caseSensitive: false,
            searchOperator: 'matches',
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
      },
    }
    expect(collection.name).to.equal(expected.name)
    expect(collection.localstore).to.equal(localstore)
    expect(collection.globalstore).to.equal(globalstore)
    expect(collection.columnNames).to.deep.equal(expected.columnNames)
    expect(collection.options).to.deep.equal(expected.options)
  })

  it('patches a record to the store and updates the store', function() {
    collection.getClean = sinon.stub()
    collection.getClean.withArgs('42').returns('this is an entry')
    collection.patch('42')
    expect(jvPatchSpy.args[0]).to.deep.equal(['jv/patch', 'this is an entry'])
    expect(updateSearchResultsSpy.callCount).to.be.equal(1)
    // set timeout because the async promise needs to be resolved first
    // setTimeout(() => {
    //   expect(updateSearchResultsSpy.callCount).to.be.equal(1)
    // }, 0)
  })

  it('provides the alias for a column', function() {
    expect(collection.getAlias('first_name')).to.equal('First Name')
    expect(collection.getAlias('last_name')).to.equal('Surname')
  })

  it('uses the column name as the alias if none is specified', function() {
    expect(collection.getAlias('cats.name')).to.equal('cats.name')
  })

  it('gets an entry from the search results (and not store)', function() {
    expect(collection.get(1)).to.equal(collection.searchResults[1])
    expect(collection.get(2)).to.equal(collection.searchResults[2])
    expect(collection.get(3)).to.equal(collection.searchResults[3])
    expect(jvGetSpy.callCount).to.equal(0)
  })

  it('gets an entry from store when it is not in the search', function() {
    expect(collection.get(4)).to.deep.equal({
      first_name: 'David',
      last_name: 'Smith',
      cats: {},
    })
    expect(jvGetSpy.callCount).to.equal(1)
  })

  it('gets a deep copy of an entry from the search', function() {
    expect(collection.get(1, true)).to.not.equal(collection.searchResults[1])
    expect(collection.get(2, true)).to.not.equal(collection.searchResults[2])
    expect(collection.get(3, true)).to.not.equal(collection.searchResults[3])

    expect(collection.get(1, true)).to.deep.equal(collection.searchResults[1])
    expect(collection.get(2, true)).to.deep.equal(collection.searchResults[2])
    expect(collection.get(3, true)).to.deep.equal(collection.searchResults[3])

    expect(jvGetSpy.callCount).to.equal(0)

    expect(collection.get(4, true)).to.deep.equal({
      first_name: 'David',
      last_name: 'Smith',
      cats: {},
    })
    expect(jvGetSpy.callCount).to.equal(1)
  })

  it('filters entries from a simple search', function() {
    expect(collection.filter('l')).to.deep.equal({
      1: {
        first_name: 'Alice',
        last_name: 'Smith',
        cats: {},
      },
      3: {
        first_name: 'Charlie',
        last_name: 'Smithson',
        cats: {
          1: {
            name: 'Ella',
          },
          2: {
            name: 'Felix',
          },
        },
      },
    })
  })

  it('filters entries with case sensitive column options', function() {
    // first names are set to case sensitive so 'Alice' won't be matched by 'a'
    expect(collection.filter('a')).to.deep.equal({
      3: {
        first_name: 'Charlie',
        last_name: 'Smithson',
        cats: {
          1: {
            name: 'Ella',
          },
          2: {
            name: 'Felix',
          },
        },
      },
      4: {
        first_name: 'David',
        last_name: 'Smith',
        cats: {},
      },
    })
  })

  it('filters entries with different column search operators', function() {
    // surname is set to 'matching' search operator so e.g. 'Smithson' won't appear
    expect(collection.filter('smith')).to.deep.equal({
      1: {
        first_name: 'Alice',
        last_name: 'Smith',
        cats: {},
      },
      4: {
        first_name: 'David',
        last_name: 'Smith',
        cats: {},
      },
    })
  })

  it('ignores columns that are set to not searchable', function() {
    // set the last name to not searchable
    collection.options.columns[1].searchable = false
    expect(collection.filter('smith')).to.deep.equal({})
  })

  it('returns no results when all columns are set to unsearchable', function() {
    collection.options.columns[0].searchable = false
    collection.options.columns[1].searchable = false

    // ignores Bob even though 'Smithers' has an 'i'
    expect(collection.filter('i')).to.deep.equal({})
  })

  it('returns no results for an empty seach', function() {
    // ignores Bob even though 'Smithers' has an 'i'
    expect(collection.filter('')).to.deep.equal({})
  })

  // the function ids() will determine in which order the results are displayed
  it('returns a list of IDs sorted by ID', function() {
    expect(collection.ids()).to.deep.equal(['1', '2', '3'])
  })

  it('returns a list of IDs sorted by a column', function() {
    // load more interestingly sortable data
    collection.searchResults = {
      1: {
        first_name: 'Bob',
        last_name: 'Ross',
      },
      2: {
        first_name: 'Alice',
        last_name: 'Wonderland',
      },
      3: {
        first_name: 'David',
        last_name: 'Tennant',
      },
      4: {
        first_name: 'Charlie',
        last_name: 'Sheen',
      },
    }

    collection.columnSorting = {
      column: 1,
      sortOrder: 'desc',
    }
    expect(collection.ids()).to.deep.equal(['3', '4', '1', '2'])

    collection.columnSorting = {
      column: 2,
      sortOrder: 'asc',
    }
    expect(collection.ids()).to.deep.equal(['1', '4', '3', '2'])
  })

  it('returns the id and column name from a table coordinate', function() {
    expect(collection.fromCoordinates(2, 0)).to.deep.equal({
      id: '3',
      col: 'first_name',
    })
    expect(collection.fromCoordinates(1, 1)).to.deep.equal({
      id: '2',
      col: 'last_name',
    })
  })

  it('returns a table of data ready for handsontable to use', function() {
    expect(collection.getAllData('details')).to.deep.equal([
      ['details', 'Alice', 'Smith', '-'],
      ['details', 'Bob', 'Smithers', 'Ella'],
      ['details', 'Charlie', 'Smithson', '2 items...'],
    ])
  })

  // tests for splitting data into two arrays for handsontable
  it('returns all data in the top table with no expansion', function() {
    // no row expanded
    const splitTableData = collection.splitIntoTables({}, 'details')
    expect(splitTableData.top).to.deep.equal([
      ['details', 'Alice', 'Smith', '-'],
      ['details', 'Bob', 'Smithers', 'Ella'],
      ['details', 'Charlie', 'Smithson', '2 items...'],
    ])
    expect(splitTableData.topIDs).to.deep.equal(['1', '2', '3'])
    expect(splitTableData.bottom).to.deep.equal([])
    expect(splitTableData.bottomIDs).to.deep.equal([])
  })

  it('returns no data in top table if first is expanded', function() {
    // row Alice expanded
    const splitTableData = collection.splitIntoTables({ id: '1' }, 'details')
    expect(splitTableData.top).to.deep.equal([])
    expect(splitTableData.topIDs).to.deep.equal([])
    expect(splitTableData.bottom).to.deep.equal([
      ['details', 'Bob', 'Smithers', 'Ella'],
      ['details', 'Charlie', 'Smithson', '2 items...'],
    ])
    expect(splitTableData.bottomIDs).to.deep.equal(['2', '3'])
  })

  it('returns data in both tables', function() {
    // row Bob expanded
    const splitTableData = collection.splitIntoTables({ id: '2' }, 'details')
    expect(splitTableData.top).to.deep.equal([
      ['details', 'Alice', 'Smith', '-'],
    ])
    expect(splitTableData.topIDs).to.deep.equal(['1'])
    expect(splitTableData.bottom).to.deep.equal([
      ['details', 'Charlie', 'Smithson', '2 items...'],
    ])
    expect(splitTableData.bottomIDs).to.deep.equal(['3'])
  })

  it('returns no data in bottom table if last is expanded', function() {
    // row Bob expanded
    const splitTableData = collection.splitIntoTables({ id: '3' }, 'details')
    expect(splitTableData.top).to.deep.equal([
      ['details', 'Alice', 'Smith', '-'],
      ['details', 'Bob', 'Smithers', 'Ella'],
    ])
    expect(splitTableData.topIDs).to.deep.equal(['1', '2'])
    expect(splitTableData.bottom).to.deep.equal([])
    expect(splitTableData.bottomIDs).to.deep.equal([])
  })
})
