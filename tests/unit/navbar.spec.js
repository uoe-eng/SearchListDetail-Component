import Vuex from 'vuex'
import { expect } from 'chai'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import NavBar from '@/components/NavBar'
import config from '@/components/config'
import sinon from 'sinon'

describe('NavBar.vue', () => {
  let store, localVue, setPageSpy, wrapper, navBarItems

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)
    setPageSpy = sinon.spy()

    store = new Vuex.Store({
      state: {
        sld: {
          page: config.ALL_PAGE_NAME,
          searchOptions: { people: '', phone_numbers: '', emails: '' },
          collections: {
            people: {
              searchResults: {
                result1: '',
                result2: '',
                result3: '',
                result4: '',
                result5: '',
              },
            },
            phone_numbers: {
              searchResults: {
                result1: '',
                result2: '',
                result3: '',
              },
            },
            emails: {
              searchResults: {},
            },
          },
        },
      },
      actions: {
        setPage: setPageSpy,
      },
    })

    wrapper = shallowMount(NavBar, { store, localVue })
    navBarItems = wrapper.findAll('.nav-bar-item')
  })

  it('draws the correct four tabs', () => {
    expect(navBarItems.length).to.equal(4)
    expect(navBarItems.at(0).text()).to.equal(config.ALL_PAGE_TEXT)
    expect(navBarItems.at(1).text()).to.equal('people')
    expect(navBarItems.at(2).text()).to.equal('phone_numbers')
    expect(navBarItems.at(3).text()).to.equal('emails')
  })

  it('updates the .selected class correctly', () => {
    expect(navBarItems.at(0).classes()).to.contain('selected')
    expect(navBarItems.at(1).classes()).to.not.contain('selected')
    expect(navBarItems.at(2).classes()).to.not.contain('selected')
    expect(navBarItems.at(3).classes()).to.not.contain('selected')

    store.state.sld.page = 'people'
    expect(navBarItems.at(0).classes()).to.not.contain('selected')
    expect(navBarItems.at(1).classes()).to.contain('selected')
    expect(navBarItems.at(2).classes()).to.not.contain('selected')
    expect(navBarItems.at(3).classes()).to.not.contain('selected')

    store.state.sld.page = config.ALL_PAGE_NAME
    expect(navBarItems.at(0).classes()).to.contain('selected')
    expect(navBarItems.at(1).classes()).to.not.contain('selected')
    expect(navBarItems.at(2).classes()).to.not.contain('selected')
    expect(navBarItems.at(3).classes()).to.not.contain('selected')
  })

  it('updates selected page in store', () => {
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

  it('displays results', () => {
    wrapper.setProps({ displayResultCount: false })
    expect(navBarItems.at(0).contains('span > span')).to.equal(false)
    expect(navBarItems.at(1).contains('span > span')).to.equal(false)
    expect(navBarItems.at(2).contains('span > span')).to.equal(false)
    expect(navBarItems.at(3).contains('span > span')).to.equal(false)

    wrapper.setProps({ displayResultCount: true })
    expect(navBarItems.at(0).contains('span > span')).to.equal(true)
    expect(navBarItems.at(1).contains('span > span')).to.equal(true)
    expect(navBarItems.at(2).contains('span > span')).to.equal(true)
    expect(navBarItems.at(3).contains('span > span')).to.equal(true)
    // prettier-ignore
    expect(navBarItems.at(0).find('span > span').text()).to.equal('(8)')
    // prettier-ignore
    expect(navBarItems.at(1).find('span > span').text()).to.equal('(5)')
    // prettier-ignore
    expect(navBarItems.at(2).find('span > span').text()).to.equal('(3)')
    // prettier-ignore
    expect(navBarItems.at(3).find('span > span').text()).to.equal('(0)')
  })
})
