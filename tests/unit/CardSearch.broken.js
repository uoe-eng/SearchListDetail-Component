import Vuex from 'vuex'
import { expect } from 'chai'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import sinon from 'sinon'
import config from '@/components/config'
import CardSearch from '@/components/CardSearch'

describe('CardSearch.vue', function() {
  let store, localVue, spy, wrapper, getCollectionStub

  beforeEach(function() {
    localVue = createLocalVue()
    localVue.use(Vuex)
    spy = sinon.spy()
    getCollectionStub = sinon.stub()

    store = new Vuex.Store({
      state: {
        page: config.ALL_PAGE_NAME,
        getCollection: getCollectionStub,
        expansionState: {
          [config.ALL_PAGE_NAME]: {},
          people: {},
          cats: {},
        },
        collections: [
          {
            name: 'people',
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

    wrapper = shallowMount(CardSearch, {
      localVue,
      propsData: {
        localstore: store,
      },
    })
  })

  it('shows card results in the "ALL" page', function() {
    const cardResults = wrapper.findAll('.card-result')
    expect(cardResults.length).to.equal(7)

    expect(cardResults.at(0).attributes().type).to.equal('people')
    expect(cardResults.at(1).attributes().type).to.equal('people')
    expect(cardResults.at(2).attributes().type).to.equal('people')
    expect(cardResults.at(3).attributes().type).to.equal('people')
    expect(cardResults.at(4).attributes().type).to.equal('cats')
    expect(cardResults.at(5).attributes().type).to.equal('cats')
    expect(cardResults.at(6).attributes().type).to.equal('cats')

    expect(cardResults.at(0).attributes().id).to.equal('1')
    expect(cardResults.at(1).attributes().id).to.equal('2')
    expect(cardResults.at(2).attributes().id).to.equal('3')
    expect(cardResults.at(3).attributes().id).to.equal('4')
    expect(cardResults.at(4).attributes().id).to.equal('1')
    expect(cardResults.at(5).attributes().id).to.equal('2')
    expect(cardResults.at(6).attributes().id).to.equal('3')
  })

  it('shows only one collection for other pages', function() {
    // set page to people
    wrapper.setProps({ showOnly: 'people' })
    let cardResults = wrapper.findAll('.card-result')
    expect(cardResults.length).to.equal(4)

    expect(cardResults.at(0).attributes().type).to.equal('people')
    expect(cardResults.at(1).attributes().type).to.equal('people')
    expect(cardResults.at(2).attributes().type).to.equal('people')
    expect(cardResults.at(3).attributes().type).to.equal('people')

    expect(cardResults.at(0).attributes().id).to.equal('1')
    expect(cardResults.at(1).attributes().id).to.equal('2')
    expect(cardResults.at(2).attributes().id).to.equal('3')
    expect(cardResults.at(3).attributes().id).to.equal('4')

    // set page to cats
    wrapper.setProps({ showOnly: 'cats' })
    cardResults = wrapper.findAll('.card-result')
    expect(cardResults.length).to.equal(3)

    expect(cardResults.at(0).attributes().type).to.equal('cats')
    expect(cardResults.at(1).attributes().type).to.equal('cats')
    expect(cardResults.at(2).attributes().type).to.equal('cats')

    expect(cardResults.at(0).attributes().id).to.equal('1')
    expect(cardResults.at(1).attributes().id).to.equal('2')
    expect(cardResults.at(2).attributes().id).to.equal('3')
  })

  // prettier-ignore
  it('tells cards if they should be expanded/readonly or not', function() {
    const cardResults = wrapper.findAll('.card-result')

    const expectState = (attr, state) => {
      expect(cardResults.at(0).attributes()[attr]).to.equal(state[0])
      expect(cardResults.at(1).attributes()[attr]).to.equal(state[1])
      expect(cardResults.at(2).attributes()[attr]).to.equal(state[2])
      expect(cardResults.at(3).attributes()[attr]).to.equal(state[3])
      expect(cardResults.at(4).attributes()[attr]).to.equal(state[4])
      expect(cardResults.at(5).attributes()[attr]).to.equal(state[5])
      expect(cardResults.at(6).attributes()[attr]).to.equal(state[6])
    }

    expectState('isexpanded', [undefined, undefined, undefined, undefined, undefined, undefined, undefined])
    expectState('isreadonly', ['true', 'true', 'true', 'true', 'true', 'true', 'true'])

    store.state.expansionState[config.ALL_PAGE_NAME] = {
      type: 'people',
      id: '2',
    }
    expectState('isexpanded', [undefined, 'true', undefined, undefined, undefined, undefined, undefined])
    expectState('isreadonly', ['true', undefined, 'true', 'true', 'true', 'true', 'true'])

    store.state.expansionState[config.ALL_PAGE_NAME] = {
      type: 'cats',
      id: '1',
    }
    expectState('isexpanded', [undefined, undefined, undefined, undefined, 'true', undefined, undefined])
    expectState('isreadonly', ['true', 'true', 'true', 'true', undefined, 'true', 'true'])

    store.state.expansionState[config.ALL_PAGE_NAME] = {}
    expectState('isexpanded', [undefined, undefined, undefined, undefined, undefined, undefined, undefined])
    expectState('isreadonly', ['true', 'true', 'true', 'true', 'true', 'true', 'true'])

  })
})
