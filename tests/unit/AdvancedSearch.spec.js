import Vuex from 'vuex'
import { expect } from 'chai'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import sinon from 'sinon'
import config from '@/components/config'
import AdvancedSearch from '@/components/AdvancedSearch'

describe('AdvancedSearch.vue', function() {
  let store, localVue, spy, wrapper

  beforeEach(function() {
    localVue = createLocalVue()
    localVue.use(Vuex)
    spy = sinon.spy()

    store = new Vuex.Store({
      state: {
        expandedAdvancedSearch: false,
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
          },
        ],
      },
      actions: {
        updateSearchResults: spy,
      },
    })

    wrapper = shallowMount(AdvancedSearch, {
      localVue,
      propsData: {
        localstore: store,
      },
    })
  })

  it('opens and closes', function() {
    // check it's closed
    expect(wrapper.find('#advanced-search').exists()).to.be.false
    expect(wrapper.find('.advanced-search-button').exists()).to.be.true

    // open
    wrapper.find('.advanced-search-button').trigger('click')
    expect(store.state.expandedAdvancedSearch).to.be.true
    expect(wrapper.find('#advanced-search').exists()).to.be.true
    expect(wrapper.find('.advanced-search-button').exists()).to.be.false

    // close
    wrapper.find('#advanced-search-close').trigger('click')
    expect(store.state.expandedAdvancedSearch).to.be.false
    expect(wrapper.find('#advanced-search').exists()).to.be.false
    expect(wrapper.find('.advanced-search-button').exists()).to.be.true
  })

  it('displays the collections', function() {
    // open
    wrapper.find('.advanced-search-button').trigger('click')

    const titles = wrapper.findAll('#advanced-search .collection .title')
    const toggleAllBtns = wrapper.findAll('#advanced-search .collection button')
    const titlePrepend = config.ADV_SEARCH_COLLECTION_TITLE_PREPEND
    expect(titles.length).to.equal(2)
    expect(toggleAllBtns.length).to.equal(2)
    expect(titles.at(0).text()).to.equal(titlePrepend + 'people')
    expect(titles.at(1).text()).to.equal(titlePrepend + 'cats')
  })

  it('displays the columns', function() {
    // open
    wrapper.find('.advanced-search-button').trigger('click')

    const checkboxes = wrapper.findAll('#advanced-search .collection .checkbox')
    expect(checkboxes.at(0).text()).to.equal('First Name')
    expect(checkboxes.at(1).text()).to.equal('Surname')
    expect(checkboxes.at(2).text()).to.equal('Cat')
    expect(checkboxes.at(3).text()).to.equal('Name')
    expect(checkboxes.at(4).text()).to.equal('Owner')
  })

  // prettier-ignore
  const expectState = (state) => {
    const peopleColumns = store.state.collections[0].options.columns
    const catsColumns =   store.state.collections[1].options.columns
    expect(peopleColumns[0].searchable).to.equal(state[0])
    expect(peopleColumns[1].searchable).to.equal(state[1])
    expect(peopleColumns[2].searchable).to.equal(state[2])
    expect(  catsColumns[0].searchable).to.equal(state[3])
    expect(  catsColumns[1].searchable).to.equal(state[4])
  }

  it('toggles checkbox states in store', function() {
    // open
    wrapper.find('.advanced-search-button').trigger('click')

    const checkboxes = wrapper.findAll('#advanced-search .collection .checkbox')

    expectState([true, true, true, true, true])
    checkboxes.at(0).trigger('click')
    expectState([false, true, true, true, true])
    checkboxes.at(4).trigger('click')
    expectState([false, true, true, true, false])
    checkboxes.at(0).trigger('click')
    expectState([true, true, true, true, false])
    checkboxes.at(4).trigger('click')
    expectState([true, true, true, true, true])
  })

  it('toggles all checkboxes with the toggle all button', function() {
    // open
    wrapper.find('.advanced-search-button').trigger('click')

    const toggleAllBtns = wrapper.findAll('#advanced-search .collection button')
    const checkboxes = wrapper.findAll('#advanced-search .collection .checkbox')

    // first three are people, last two are cats
    expectState([true, true, true, true, true])
    toggleAllBtns.at(0).trigger('click')
    expectState([false, false, false, true, true])
    checkboxes.at(2).trigger('click')
    expectState([false, false, true, true, true])
    toggleAllBtns.at(0).trigger('click')
    expectState([true, true, true, true, true])

    // the first checkbox's value is the one that is inverted for the whole collection
    checkboxes.at(0).trigger('click')
    expectState([false, true, true, true, true])
    toggleAllBtns.at(0).trigger('click')
    expectState([true, true, true, true, true])

    toggleAllBtns.at(1).trigger('click')
    expectState([true, true, true, false, false])
    checkboxes.at(4).trigger('click')
    expectState([true, true, true, false, true])
    toggleAllBtns.at(1).trigger('click')
    expectState([true, true, true, true, true])
  })

  it('calls the store to update search results', function() {
    // open
    wrapper.find('.advanced-search-button').trigger('click')

    wrapper.find('#advanced-search .collection .checkbox').trigger('click')
    expect(spy.callCount).to.equal(1)

    // clicking the toggle all button should only fire off one update
    wrapper.find('#advanced-search .collection button').trigger('click')
    expect(spy.callCount).to.equal(2)
  })
})
