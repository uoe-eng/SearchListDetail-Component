import Vue from 'vue'
import Vuex from 'vuex'
import { expect } from 'chai'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import sinon from 'sinon'
import SearchListDetail from '@/components/SearchListDetail'
import Collection from '@/components/Collection'
import ExpansionState from '@/components/ExpansionState'

describe('SearchListDetail.vue', function() {
  let store, localVue, dispatchStub, dispatchSpy, jvGetStub, wrapper, sldProp

  beforeEach(function() {
    localVue = createLocalVue()
    localVue.use(Vuex)

    dispatchStub = sinon.stub()
    dispatchSpy = sinon.spy()
    dispatchStub.callsFake((action, args) => {
      dispatchSpy(action, args)
      return new Promise((r) => r())
    })

    jvGetStub = sinon.stub()
    jvGetStub.withArgs('people').returns({
      1: {
        first_name: 'Alice',
        last_name: 'Smith',
        cat_name: 'Ella',
      },
      2: {
        first_name: 'Bob',
        last_name: 'Smithers',
        cat_name: 'Felix',
      },
      3: {
        first_name: 'Charlie',
        last_name: 'Smithson',
        cat_name: 'Felix',
      },
    })
    jvGetStub.withArgs('cats').returns({
      1: {
        name: 'Ella',
        _jv: {
          relationships: {
            owners: {
              data: { type: 'people', id: '1' },
            },
            siblings: {
              data: { type: 'cats', id: '2' },
            },
          },
        },
      },
      2: {
        name: 'Felix',
        _jv: {
          relationships: {
            owners: {
              data: [{ type: 'people', id: '2' }, { type: 'people', id: '3' }],
            },
            siblings: {
              data: { type: 'cats', id: '1' },
            },
          },
        },
      },
    })

    store = {
      dispatch: dispatchStub,
      getters: {
        'jv/get': jvGetStub,
      },
    }

    sldProp = {
      firstAttrAsCardTitle: true,
      detailsTitle: 'details',
      detailsText: '+',
      countResults: true,
      collections: [
        {
          name: 'people',
          columns: [
            {
              name: 'first_name',
              alias: 'First Name',
            },
            {
              name: 'last_name',
              alias: 'Surname',
            },
            {
              name: 'cat_name',
              alias: 'Cat Name',
            },
          ],
          previewOrder: ['first_name', 'last_name'],
        },
        {
          name: 'cats',
          columns: [
            {
              name: 'name',
              alias: 'Name',
            },
            {
              name: 'owners.first_name',
              alias: 'Owners',
            },
            {
              name: 'siblings.name',
              alias: 'Siblings',
            },
          ],
          previewOrder: ['name', 'owners.first_name'],
        },
      ],
    }

    wrapper = shallowMount(SearchListDetail, {
      localVue,
      store,
      propsData: {
        options: sldProp,
      },
    })
  })

  it('shows only search box and advanced search initially', function() {
    expect(Object.keys(wrapper.vm.$refs).length).to.equal(3)
    expect(wrapper.vm.$refs.sld).to.exist
    expect(wrapper.vm.$refs.searchbox).to.exist
    expect(wrapper.vm.$refs.advsearch).to.exist
  })

  it('shows a navbar and CardSearch with a search', function() {
    Vue.set(wrapper.vm.localstore.state, 'search', 's')
    expect(Object.keys(wrapper.vm.$refs).length).to.equal(5)
    expect(wrapper.vm.$refs.sld).to.exist
    expect(wrapper.vm.$refs.searchbox).to.exist
    expect(wrapper.vm.$refs.advsearch).to.exist
    expect(wrapper.vm.$refs.navbar).to.exist
    expect(wrapper.vm.$refs.cardsearch).to.exist
  })

  it('shows a TableSearch when navigated to a page', function() {
    Vue.set(wrapper.vm.localstore.state, 'search', 's')
    Vue.set(wrapper.vm.localstore.state, 'page', 'people')
    expect(wrapper.vm.$refs.tablesearch).to.exist
  })

  it('initialises $nextTick in the store', function() {
    expect(wrapper.vm.localstore.state.nextTick).to.equal(wrapper.vm.$nextTick)
  })

  it('initialises sldProp in the store', function() {
    expect(wrapper.vm.localstore.state.sldProp).to.equal(sldProp)
  })

  it('initialises the collections in the store', function() {
    expect(wrapper.vm.localstore.state.collections[0].name).to.equal('people')
    expect(wrapper.vm.localstore.state.collections[1].name).to.equal('cats')
    expect(wrapper.vm.localstore.state.collections[0].options).to.deep.equal(
      new Collection(sldProp.collections[0], null, null).options
    )
    expect(wrapper.vm.localstore.state.collections[1].options).to.deep.equal(
      new Collection(sldProp.collections[1], null, null).options
    )
  })

  it('initialises the expansion state in the store', function() {
    expect(wrapper.vm.localstore.state.expansionState).to.deep.equal(
      new ExpansionState(['people', 'cats'])
    )
  })
})
