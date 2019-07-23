import Vuex from 'vuex'
import { expect } from 'chai'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import NavBar from '@/components/NavBar'
import config from '@/components/config'
import sinon from 'sinon'

describe('NavBar.vue', function() {
  let store, localVue, setPageSpy, wrapper, navBarItems

  beforeEach(function() {
    localVue = createLocalVue()
    localVue.use(Vuex)
    setPageSpy = sinon.spy()

    store = new Vuex.Store({
      state: {
        page: config.ALL_PAGE_NAME,
        collections: [
          {
            name: 'people',
            searchResults: {
              '0': '',
              '1': '',
              '2': '',
              '3': '',
              '4': '',
            },
          },
          {
            name: 'phone_numbers',
            searchResults: {
              '0': '',
              '1': '',
              '2': '',
            },
          },
          {
            name: 'emails',
            searchResults: {},
          },
        ],
      },
      actions: {
        setPage: setPageSpy,
      },
    })

    wrapper = shallowMount(NavBar, {
      localVue,
      propsData: {
        localstore: store,
      },
    })
    navBarItems = wrapper.findAll('.nav-bar-item')
  })

  it('draws the correct four tabs', function() {
    expect(navBarItems.length).to.equal(4)
    expect(navBarItems.at(0).text()).to.equal(config.ALL_PAGE_TEXT)
    expect(navBarItems.at(1).text()).to.equal('people')
    expect(navBarItems.at(2).text()).to.equal('phone_numbers')
    expect(navBarItems.at(3).text()).to.equal('emails')
  })

  it('updates the .selected class correctly', function() {
    expect(navBarItems.at(0).classes()).to.contain('selected')
    expect(navBarItems.at(1).classes()).to.not.contain('selected')
    expect(navBarItems.at(2).classes()).to.not.contain('selected')
    expect(navBarItems.at(3).classes()).to.not.contain('selected')

    store.state.page = 'people'
    expect(navBarItems.at(0).classes()).to.not.contain('selected')
    expect(navBarItems.at(1).classes()).to.contain('selected')
    expect(navBarItems.at(2).classes()).to.not.contain('selected')
    expect(navBarItems.at(3).classes()).to.not.contain('selected')

    store.state.page = config.ALL_PAGE_NAME
    expect(navBarItems.at(0).classes()).to.contain('selected')
    expect(navBarItems.at(1).classes()).to.not.contain('selected')
    expect(navBarItems.at(2).classes()).to.not.contain('selected')
    expect(navBarItems.at(3).classes()).to.not.contain('selected')
  })

  it('updates selected page in store', function() {
    navBarItems.at(0).trigger('click')
    navBarItems.at(1).trigger('click')
    navBarItems.at(0).trigger('click')
    navBarItems.at(2).trigger('click')
    navBarItems.at(2).trigger('click')
    navBarItems.at(3).trigger('click')
    expect(setPageSpy.callCount).to.equal(6)

    expect(setPageSpy.getCall(0).args[1]).to.equal(config.ALL_PAGE_NAME)
    expect(setPageSpy.getCall(1).args[1]).to.equal('people')
    expect(setPageSpy.getCall(2).args[1]).to.equal(config.ALL_PAGE_NAME)
    expect(setPageSpy.getCall(3).args[1]).to.equal('phone_numbers')
    expect(setPageSpy.getCall(4).args[1]).to.equal('phone_numbers')
    expect(setPageSpy.getCall(5).args[1]).to.equal('emails')
  })

  // prettier-ignore
  it('displays results count', function() {
    wrapper.setProps({ displayResultCount: false })
    expect(navBarItems.at(0).contains('span > span')).to.be.false
    expect(navBarItems.at(1).contains('span > span')).to.be.false
    expect(navBarItems.at(2).contains('span > span')).to.be.false
    expect(navBarItems.at(3).contains('span > span')).to.be.false

    wrapper.setProps({ displayResultCount: true })
    expect(navBarItems.at(0).contains('span > span'))
    expect(navBarItems.at(1).contains('span > span'))
    expect(navBarItems.at(2).contains('span > span'))
    expect(navBarItems.at(3).contains('span > span'))
    expect(navBarItems.at(0).find('span > span').text()).to.equal('(8)')
    expect(navBarItems.at(1).find('span > span').text()).to.equal('(5)')
    expect(navBarItems.at(2).find('span > span').text()).to.equal('(3)')
    expect(navBarItems.at(3).find('span > span').text()).to.equal('(0)')
  })
})
