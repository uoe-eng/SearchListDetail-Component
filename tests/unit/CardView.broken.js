import Vuex from 'vuex'
import { expect } from 'chai'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import sinon from 'sinon'
import CardView from '@/components/CardView'
import SldStore from '@/components/SldStore'
import Collection from '@/components/Collection'
import ExpansionState from '@/components/ExpansionState'

describe('CardView.vue', function() {
  let localVue, personCard, catCard, localstore, store, sldProp, database
  
  beforeEach(function() {
    localVue = createLocalVue()
    localVue.use(Vuex)

    database = {
      people: {
        1: {
          first_name: 'Alice',
          last_name: 'Smith',
          _jv: { relationships: { cats: { data: null } } },
        },
        2: {
          first_name: 'Bob',
          last_name: 'Smithers',
          _jv: { relationships: { cats: { data: { type: 'cats', id: 1 } } } },
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
        1: {
          name: 'Ella',
          _jv: {
            relationships: {
              owners: {
                data: [{ type: 'person', id: 2 }, { type: 'person', id: 3 }],
              },
            },
          },
        },
        2: {
          name: 'Felix',
          _jv: {
            relationships: { owners: { data: { type: 'person', id: 3 } } },
          },
        },
        3: {
          name: 'Gelard',
          _jv: { relationships: { owners: { data: null } } },
        },
      },
    }

    sldProp = {
      collections: [
        {
          name: 'people',
          columns: [
            { name: 'first_name', alias: 'First Name', caseSensitive: true },
            { name: 'last_name', alias: 'Surname', searchOperator: 'matches' },
            { name: 'cats.name' },
          ],
          previewOrder: ['last_name', 'first_name'],
        },
        {
          name: 'phone_numbers',
          columns: [{ name: 'phone_number', alias: 'Number' }],
          show: false,
        },
        {
          name: 'cats',
          columns: [
            { name: 'name', alias: 'Name' },
            { name: 'owners.first_name' },
          ],
        },
      ],
      firstAttrAsCardTitle: true,
      countResults: true,
    }

    localstore = SldStore

    store = {
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

    localstore.state.sldProp = sldProp
    localstore.state.globalstore = () => store
    localstore.state.collectionsOptions = sldProp.collections.map((options) => {
      return new Collection(options)
    })
    localstore.state.expansionState = new ExpansionState(
      sldProp.collections.map((collection) => collection.name)
    )

    personCard = shallowMount(CardView, {
      store,
      propsData: {
        localstore: localstore,
        type: 'people',
        id: '2',
        isReadOnly: true,
        isExpanded: false,
        expanded: localstore.state.expansionState.people,
      },
    })

    catCard = shallowMount(CardView, {
      store,
      propsData: {
        localstore: localstore,
        type: 'cats',
        id: '1',
        isReadOnly: true,
        isExpanded: false,
        expanded: localstore.state.expansionState.cats,
      },
    })
  })

  it('does something', function() {
    // console.log('localstore', localstore)
    console.log('personCard.html()', personCard.html())
    console.log('catCard.html()', catCard.html())
  })

  it('does not show input boxes for read only cards', function() {
    const inputs = personCard.findAll('input')
    expect(inputs.length).to.equal(0)
  })
  
  it('shows data for a preview read only card', function() {
    localstore.state.sldProp.firstAttrAsCardTitle = false
    const columns = personCard.findAll('.column')
    expect(columns.length).to.equal(2)
    expect(columns.at(0).text()).to.equal('Surname:')
    expect(columns.at(1).text()).to.equal('First Name:')

    const values = personCard.findAll('.value')
    expect(values.length).to.equal(2)
    expect(values.at(0).text()).to.equal('Smithers')
    expect(values.at(1).text()).to.equal('Bob')
  })

  it('shows data for an expanded read only card', function() {
    localstore.state.sldProp.firstAttrAsCardTitle = false
    personCard.setProps({ isExpanded: true })

    const columns = personCard.findAll('.column')
    expect(columns.length).to.equal(3)
    expect(columns.at(0).text()).to.equal('First Name:')
    expect(columns.at(1).text()).to.equal('Surname:')
    expect(columns.at(2).text()).to.equal('cats.name:')

    const values = personCard.findAll('.value')
    expect(values.length).to.equal(3) // relationship is also a value
    expect(values.at(0).text()).to.equal('Bob')
    expect(values.at(1).text()).to.equal('Smithers')

    const relationships = personCard.findAll('.relationship')
    expect(relationships.at(0).text()).to.equal('Ella')
  })

  it('shows data for a preview read only card with title', function() {
    localstore.state.sldProp.firstAttrAsCardTitle = true
    console.log('personCard', personCard.html())

    const title = personCard.find('.title')
    expect(title.text()).to.equal('Smithers')

    const columns = personCard.findAll('.column')
    expect(columns.length).to.equal(1)
    expect(columns.at(0).text()).to.equal('First Name:')

    const values = personCard.findAll('.value')
    expect(values.length).to.equal(1)
    expect(values.at(0).text()).to.equal('Bob')
  })

  it('shows data for an expanded read only card with title', function() {
    localstore.state.sldProp.firstAttrAsCardTitle = true
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

    store.state.collectionsOptions[1].searchResults = { '1': 'new value to replace' }
    store.state.page = 'cats'

    catCard.find('.close').trigger('click')
    setTimeout(() => {
      expect(spy.callCount).to.equal(1)
      expect(spy.getCall(0).args).to.deep.equal(['cats'])
      // on close, search result is reset to the old value
      expect(store.state.collectionsOptions[1].searchResults).to.deep.equal({
        '1': getEntryStub('cats', '1'),
      })
    }, 0)
  })

  it('removes overlay and patches entry when saving', function() {
    catCard.setProps({ isReadOnly: false, isExpanded: true })
    store.state.page = 'cats'

    const removeOverlaySpy = sinon.spy()
    store.state.expansionState.removeOverlay = removeOverlaySpy

    catCard.find('.save').trigger('click')

    expect(removeOverlaySpy.callCount).to.equal(1)
    expect(removeOverlaySpy.getCall(0).args).to.deep.equal(['cats'])

    expect(patchSpy.callCount).to.equal(1)
  })

  it('does not write an entry to searchResults on card close if the result does not already exist (bugfix)', function() {
    catCard.setProps({ isReadOnly: false, isExpanded: true })

    store.state.collectionsOptions[1].searchResults = {}
    store.state.page = 'cats'

    store.state.expansionState.removeOverlay = () => {}

    catCard.find('.close').trigger('click')
    setTimeout(() => {
      // on close, search result is not set because it does not exist in the search results
      expect(store.state.collectionsOptions[1].searchResults).to.deep.equal({})
    }, 0)
  })
})
