import Vuex from 'vuex'
import { expect } from 'chai'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import SearchBox from '@/components/SearchBox'
import sinon from 'sinon'

describe('SearchBox.vue', function() {
  let store, localVue, spy, wrapper

  beforeEach(function() {
    localVue = createLocalVue()
    localVue.use(Vuex)
    spy = sinon.spy()

    store = new Vuex.Store({
      state: {
        search: '',
      },
      actions: {
        updateSerachResults: spy,
      },
    })

    wrapper = shallowMount(SearchBox, {
      localVue,
      propsData: {
        localstore: store,
      },
    })
  })

  it('updates the store search value', function() {
    wrapper.find('input').setValue('Alice')
    expect(store.state.search).to.equal('Alice')
    wrapper.find('input').setValue('')
    expect(store.state.search).to.equal('')
  })

  it('calls updateSerachResults for each search', function() {
    wrapper.find('input').setValue('Bob')
    expect(spy.callCount).to.equal(1)
    wrapper.find('input').setValue('')
    expect(spy.callCount).to.equal(2)
    wrapper.find('input').setValue('Charlie')
    expect(spy.callCount).to.equal(3)
  })
})
