import Vue from 'vue'
import Vuex from 'vuex'
import { expect } from 'chai'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import sinon from 'sinon'
import TableSearch from '@/components/TableSearch'
import ExpansionState from '@/components/ExpansionState'

describe('TableSearch.vue', function() {
  let store, localVue, spy, wrapper, getCollectionStub, getPeopleAliasStub

  beforeEach(function() {
    localVue = createLocalVue()
    localVue.use(Vuex)
    spy = sinon.spy()
    getCollectionStub = sinon.stub()

    getPeopleAliasStub = sinon.stub()
    getPeopleAliasStub.withArgs('first_name').returns('First Name')
    getPeopleAliasStub.withArgs('last_name').returns('Surname')
    getPeopleAliasStub.withArgs('cat.name').returns('Cat')

    store = new Vuex.Store({
      state: {
        page: 'people',
        getCollection: getCollectionStub,
        expansionState: new ExpansionState(['people', 'cats']),
        sldProp: {
          detailsTitle: 'details',
          detailsText: '+',
        },
        collections: [
          {
            name: 'people',
            columnNames: ['first_name', 'last_name', 'cat.name'],
            getAlias: getPeopleAliasStub,
            options: {
              columns: [
                {
                  name: 'first_name',
                  alias: 'First Name',
                  searchable: true,
                },
                {
                  name: 'last_name',
                  alias: 'Surname',
                  searchable: true,
                },
                {
                  name: 'cat.name',
                  alias: 'Cat',
                  searchable: true,
                },
              ],
            },
            searchResults: {
              1: {
                first_name: 'Alice',
                last_name: 'Smith',
              },
              2: {
                first_name: 'Bob',
                last_name: 'Smithers',
              },
              3: {
                first_name: 'Charlie',
                last_name: 'Smithson',
              },
              4: {
                first_name: 'David',
                last_name: 'Smith',
              },
            },
          },
          {
            name: 'cats',
            options: {
              columns: [
                {
                  name: 'name',
                  alias: 'Name',
                  searchable: true,
                },
                {
                  name: 'person.first_name',
                  alias: 'Owner',
                  searchable: true,
                },
              ],
            },
            searchResults: {
              1: {
                name: 'Ella',
              },
              2: {
                name: 'Felix',
              },
              3: {
                name: 'Gerald',
              },
            },
          },
        ],
      },
      actions: {
        updateSearchResults: spy,
      },
    })

    getCollectionStub.withArgs('people').returns(store.state.collections[0])
    getCollectionStub.withArgs('cats').returns(store.state.collections[1])

    wrapper = shallowMount(TableSearch, {
      localVue,
      propsData: {
        localstore: store,
        type: 'people',
      },
    })
  })

  it('gets aliases for the table headers', function() {
    expect(wrapper.vm.colHeaders).to.deep.equal([
      'details',
      'First Name',
      'Surname',
      'Cat',
    ])
  })

  it('shows no card when no row is expanded', function() {
    expect(wrapper.find('.expanded-card').exists()).to.be.false
  })

  it('shows a card when a row is expanded', function() {
    expect(wrapper.find('.expanded-card').exists()).to.be.false
    Vue.set(store.state.expansionState.people, 'type', 'people')
    Vue.set(store.state.expansionState.people, 'id', '2')
    const card = wrapper.find('.expanded-card')
    expect(card.exists()).to.be.true
    expect(card.attributes().id).to.equal('2')
    expect(card.attributes().type).to.equal('people')
  })

  it('shows card search in mobile view instead', function() {
    expect(wrapper.find('#table-search').exists()).to.be.true
    expect(wrapper.find('.cardsearch').exists()).to.be.false
    Vue.set(store.state, 'mobile', true)
    expect(wrapper.find('#table-search').exists()).to.be.false
    expect(wrapper.find('.cardsearch').exists()).to.be.true
  })
})
