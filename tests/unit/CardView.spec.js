import Vuex from 'vuex'
import { expect } from 'chai'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import sinon from 'sinon'
// import config from '@/components/config'
import CardView from '@/components/CardView'

describe('CardView.vue', function() {
  let store,
    localVue,
    personCard,
    catCard,
    getCollectionStub,
    getPeopleAliasStub,
    getCatAliasStub,
    getEntryStub

  beforeEach(function() {
    localVue = createLocalVue()
    localVue.use(Vuex)
    getCollectionStub = sinon.stub()

    getPeopleAliasStub = sinon.stub()
    getPeopleAliasStub.withArgs('first_name').returns('First Name')
    getPeopleAliasStub.withArgs('last_name').returns('Surname')
    getPeopleAliasStub.withArgs('cat_name').returns('Cat Name')

    getCatAliasStub = sinon.stub()
    getCatAliasStub.withArgs('name').returns('Name')
    getCatAliasStub.withArgs('owners.first_name').returns('Owners')
    getCatAliasStub.withArgs('siblings.name').returns('Siblings')

    getEntryStub = sinon.stub()
    getEntryStub.withArgs('people', '1').returns({
      first_name: 'Alice',
      last_name: 'Smith',
      cat_name: 'Ella',
    })
    getEntryStub.withArgs('people', '2').returns({
      first_name: 'Bob',
      last_name: 'Smithers',
      cat_name: 'Felix',
    })
    getEntryStub.withArgs('people', '3').returns({
      first_name: 'Charlie',
      last_name: 'Smithson',
      cat_name: 'Felix',
    })
    getEntryStub.withArgs('cats', '1').returns({
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
    })
    getEntryStub.withArgs('cats', '2').returns({
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
    })

    // prettier-ignore
    store = new Vuex.Store({
      state: {
        page: 'people',
        getCollection: getCollectionStub,
        expansionState: {
          cats: {},
          people: {},
        },
        sldProp: {
          firstAttrAsCardTitle: false,
        },
        getEntry: getEntryStub,
        collections: [
          {
            name: 'people',
            columnNames: ['first_name', 'last_name', 'cat_name'],
            getAlias: getPeopleAliasStub,
            options: {
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
          },
          {
            name: 'cats',
            columnNames: ['name', 'owners.first_name', 'siblings.name'],
            getAlias: getCatAliasStub,
            options: {
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
                }
              ],
              previewOrder: ['name', 'owners.first_name'],
            },
          },
        ],
      },
      actions: {
        setPage: () => {},
      },
    })

    getCollectionStub.withArgs('people').returns(store.state.collections[0])
    getCollectionStub.withArgs('cats').returns(store.state.collections[1])

    personCard = shallowMount(CardView, {
      localVue,
      propsData: {
        localstore: store,
        type: 'people',
        id: '2',
        isReadOnly: true,
        isExpanded: false,
        expanded: store.state.expansionState.people,
      },
    })

    catCard = shallowMount(CardView, {
      localVue,
      propsData: {
        localstore: store,
        type: 'cats',
        id: '1',
        isReadOnly: true,
        isExpanded: false,
        expanded: store.state.expansionState.cats,
      },
    })
  })

  it('does not show input boxes for read only cards', function() {
    const inputs = personCard.findAll('input')
    expect(inputs.length).to.equal(0)
  })

  it('shows data for a preview read only card', function() {
    const columns = personCard.findAll('.column')
    expect(columns.length).to.equal(2)
    expect(columns.at(0).text()).to.equal('First Name:')
    expect(columns.at(1).text()).to.equal('Surname:')

    const values = personCard.findAll('.value')
    expect(values.length).to.equal(2)
    expect(values.at(0).text()).to.equal('Bob')
    expect(values.at(1).text()).to.equal('Smithers')
  })

  it('shows data for an expanded read only card', function() {
    personCard.setProps({ isExpanded: true })

    const columns = personCard.findAll('.column')
    expect(columns.length).to.equal(3)
    expect(columns.at(0).text()).to.equal('First Name:')
    expect(columns.at(1).text()).to.equal('Surname:')
    expect(columns.at(2).text()).to.equal('Cat Name:')

    const values = personCard.findAll('.value')
    expect(values.length).to.equal(3)
    expect(values.at(0).text()).to.equal('Bob')
    expect(values.at(1).text()).to.equal('Smithers')
    expect(values.at(2).text()).to.equal('Felix')
  })

  it('shows data for a preview read only card with title', function() {
    store.state.sldProp.firstAttrAsCardTitle = true

    const title = personCard.find('.title')
    expect(title.text()).to.equal('Bob')

    const columns = personCard.findAll('.column')
    expect(columns.length).to.equal(1)
    expect(columns.at(0).text()).to.equal('Surname:')

    const values = personCard.findAll('.value')
    expect(values.length).to.equal(1)
    expect(values.at(0).text()).to.equal('Smithers')
  })

  it('shows data for an expanded read only card with title', function() {
    store.state.sldProp.firstAttrAsCardTitle = true
    personCard.setProps({ isExpanded: true })

    const title = personCard.find('.title')
    expect(title.text()).to.equal('Bob')

    const columns = personCard.findAll('.column')
    expect(columns.length).to.equal(2)
    expect(columns.at(0).text()).to.equal('Surname:')
    expect(columns.at(1).text()).to.equal('Cat Name:')

    const values = personCard.findAll('.value')
    expect(values.length).to.equal(2)
    expect(values.at(0).text()).to.equal('Smithers')
    expect(values.at(1).text()).to.equal('Felix')
  })

  it('provides pre-filled input boxes for an editable card', function() {
    personCard.setProps({ isReadOnly: false, isExpanded: true })

    const columns = personCard.findAll('.column')
    expect(columns.length).to.equal(3)
    expect(columns.at(0).text()).to.equal('First Name:')
    expect(columns.at(1).text()).to.equal('Surname:')
    expect(columns.at(2).text()).to.equal('Cat Name:')

    const inputs = personCard.findAll('input')
    expect(inputs.length).to.equal(3)
    expect(inputs.at(0).element.value).to.equal('Bob')
    expect(inputs.at(1).element.value).to.equal('Smithers')
    expect(inputs.at(2).element.value).to.equal('Felix')
  })

  it('hides save and close buttons when in preview', function() {
    expect(personCard.findAll('.close').length).to.equal(0)
    expect(personCard.findAll('.save').length).to.equal(0)
  })

  it('shows save and close buttons when expanded', function() {
    personCard.setProps({ isReadOnly: false, isExpanded: true })

    expect(personCard.findAll('.close').length).to.equal(1)
    expect(personCard.findAll('.save').length).to.equal(1)
  })

  it('shows non-clickable relationship buttons in preview', function() {
    const buttons = catCard.findAll('.relationshipNoClick')
    expect(buttons.length).to.equal(1)
    expect(buttons.at(0).text()).to.equal('Alice')
  })

  it('shows clickable relationship buttons in an expanded card', function() {
    catCard.setProps({ isExpanded: true })
    const buttons = catCard.findAll('.relationship')
    expect(buttons.length).to.equal(2)
    expect(buttons.at(0).text()).to.equal('Alice')
    // Felix is a sibling for Ella
    expect(buttons.at(1).text()).to.equal('Felix')
  })

  it('supports multiple relationships for one column', function() {
    // cat/2 has two owners, Bob and Charlie. Ella is a sibling
    catCard.setProps({ id: '2', isExpanded: true })
    const buttons = catCard.findAll('.relationship')
    expect(buttons.length).to.equal(3)
    expect(buttons.at(0).text()).to.equal('Bob')
    expect(buttons.at(1).text()).to.equal('Charlie')
    expect(buttons.at(2).text()).to.equal('Ella')
  })

  it('shows an overlay on top of a card', function() {
    expect(catCard.findAll('.overlay').length).to.equal(0)

    catCard.setProps({
      isReadOnly: false,
      isExpanded: true,
      expanded: {
        type: 'cats',
        id: '1',
        overlay: {
          type: 'people',
          id: '1',
        },
      },
    })

    expect(catCard.findAll('.overlay').length).to.equal(1)
    expect(catCard.find('.overlay').attributes().type).to.equal('people')
    expect(catCard.find('.overlay').attributes().id).to.equal('1')
  })

  it('is able to show overlays of the same type', function() {
    expect(catCard.findAll('.overlay').length).to.equal(0)

    catCard.setProps({
      isReadOnly: false,
      isExpanded: true,
      expanded: {
        type: 'cats',
        id: '1',
        overlay: {
          type: 'cats',
          id: '2',
        },
      },
    })

    expect(catCard.findAll('.overlay').length).to.equal(1)
    expect(catCard.find('.overlay').attributes().type).to.equal('cats')
    expect(catCard.find('.overlay').attributes().id).to.equal('2')
  })

  it('disables relationships clicks when there is an overlay', function() {
    catCard.setProps({
      isReadOnly: false,
      isExpanded: true,
    })

    expect(catCard.findAll('.relationship').length).to.equal(2)
    expect(catCard.findAll('.relationshipNoClick').length).to.equal(0)

    catCard.setProps({
      expanded: {
        type: 'cats',
        id: '1',
        overlay: {
          type: 'cats',
          id: '2',
        },
      },
    })

    expect(catCard.findAll('.relationship').length).to.equal(0)
    // cats/1 will go back to preview mode, so there will be only one button
    expect(catCard.findAll('.relationshipNoClick').length).to.equal(1)
    expect(catCard.find('.relationshipNoClick').text()).to.equal('Alice')
  })

  it('shows overlays on top of overlays', function() {
    catCard.setProps({
      isReadOnly: false,
      isExpanded: true,
      expanded: {
        type: 'cats',
        id: '1',
        overlay: {
          type: 'cats',
          id: '2',
          overlay: {
            type: 'cats',
            id: '1',
          },
        },
      },
    })

    // an overlay is just another card, so if it is given the expanded prop with
    // an overlay key, it will be able to display overlays too
    const overlayProps = catCard.find('.overlay').vm.$options.propsData
    expect(overlayProps.expanded).to.deep.equal({
      type: 'cats',
      id: '2',
      overlay: {
        type: 'cats',
        id: '1',
      },
    })
  })

  it('calls addOverlay() when a relationship button is clicked', function() {
    catCard.setProps({ isExpanded: true })
    const spy = sinon.spy()
    store.state.expansionState.addOverlay = spy

    const buttons = catCard.findAll('.relationship')
    buttons.at(0).trigger('click')
    buttons.at(1).trigger('click')

    expect(spy.callCount).to.equal(2)
    // first click is the owner people/1
    expect(spy.getCall(0).args).to.deep.equal(['people', 'people', '1'])
    // second click is the sibling cats/2
    expect(spy.getCall(1).args).to.deep.equal(['people', 'cats', '2'])
  })

  it('calls setExpanded when non-expanded card is clicked', function() {
    const spy = sinon.spy()
    store.state.expansionState.setExpanded = spy

    catCard.find('.sld-card-view').trigger('click')
    expect(spy.callCount).to.equal(1)
    expect(spy.getCall(0).args).to.deep.equal(['cats', 'cats', '1'])
  })

  it('disables clicks when the card is already expanded', function() {
    catCard.setProps({ isExpanded: true })
    const spy = sinon.spy()
    store.state.expansionState.setExpanded = spy

    catCard.find('.sld-card-view').trigger('click')
    expect(spy.callCount).to.equal(0)
  })

  it('removes overlay and resets search result when closing', function() {
    catCard.setProps({ isReadOnly: false, isExpanded: true })
    const spy = sinon.spy()
    store.state.expansionState.removeOverlay = spy

    store.state.collections[1].searchResults = { '1': 'new value to replace' }
    store.state.page = 'cats'

    catCard.find('.close').trigger('click')
    setTimeout(() => {
      expect(spy.callCount).to.equal(1)
      expect(spy.getCall(0).args).to.deep.equal(['cats'])
      // on close, search result is reset to the old value
      expect(store.state.collections[1].searchResults).to.deep.equal({
        '1': getEntryStub('cats', '1'),
      })
    }, 0)
  })

  it('removes overlay and patches entry when saving', function() {
    catCard.setProps({ isReadOnly: false, isExpanded: true })
    store.state.page = 'cats'

    const removeOverlaySpy = sinon.spy()
    store.state.expansionState.removeOverlay = removeOverlaySpy

    const patchSpy = sinon.spy()
    store.state.collections[1].patch = patchSpy

    catCard.find('.save').trigger('click')

    expect(removeOverlaySpy.callCount).to.equal(1)
    expect(removeOverlaySpy.getCall(0).args).to.deep.equal(['cats'])

    expect(patchSpy.callCount).to.equal(1)
    expect(patchSpy.getCall(0).args).to.deep.equal(['1'])
  })

  it('does not write an entry to searchResults on card close if the result does not already exist (bugfix)', function() {
    catCard.setProps({ isReadOnly: false, isExpanded: true })

    store.state.collections[1].searchResults = {}
    store.state.page = 'cats'

    store.state.expansionState.removeOverlay = () => {}

    catCard.find('.close').trigger('click')
    setTimeout(() => {
      // on close, search result is not set because it does not exist in the search results
      expect(store.state.collections[1].searchResults).to.deep.equal({})
    }, 0)
  })
})
