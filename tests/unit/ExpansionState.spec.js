import { expect } from 'chai'
import ExpansionState from '@/components/ExpansionState'
import config from '@/components/config'

describe('ExpansionState.js', function() {
  let expansionState

  beforeEach(function() {
    expansionState = new ExpansionState(['people', 'cats', 'dogs'])
  })

  it('initialises the data structure', function() {
    const expected = {
      [config.ALL_PAGE_NAME]: {},
      people: {},
      cats: {},
      dogs: {},
    }
    expect(expansionState).to.deep.equal(expected)
  })

  it('sets the expansion for pages', function() {
    expansionState.setExpanded(config.ALL_PAGE_NAME, 'dogs', '2')
    expansionState.setExpanded('people', 'people', '1')
    expansionState.setExpanded(config.ALL_PAGE_NAME, 'cats', '3')

    const expected = {
      [config.ALL_PAGE_NAME]: {
        type: 'cats',
        id: '3',
      },
      people: {
        type: 'people',
        id: '1',
      },
      cats: {},
      dogs: {},
    }
    expect(expansionState).to.deep.equal(expected)
  })

  it('closes singly expanded pages', function() {
    expansionState.setExpanded('cats', 'cats', '1')
    expansionState.setExpanded(config.ALL_PAGE_NAME, 'people', '2')
    expansionState.removeOverlay('cats')
    expansionState.removeOverlay(config.ALL_PAGE_NAME)

    const expected = {
      [config.ALL_PAGE_NAME]: {},
      people: {},
      cats: {},
      dogs: {},
    }
    expect(expansionState).to.deep.equal(expected)
  })

  it('adds overlays to expanded items', function() {
    expansionState.setExpanded('dogs', 'dogs', '4')
    expansionState.addOverlay('dogs', 'people', '1')

    expansionState.setExpanded('cats', 'cats', '3')
    expansionState.addOverlay('cats', 'people', '1')

    const expected = {
      [config.ALL_PAGE_NAME]: {},
      people: {},
      cats: {
        type: 'cats',
        id: '3',
        overlay: {
          type: 'people',
          id: '1',
        },
      },
      dogs: {
        type: 'dogs',
        id: '4',
        overlay: {
          type: 'people',
          id: '1',
        },
      },
    }
    expect(expansionState).to.deep.equal(expected)
  })

  it('adds overlays to overlays', function() {
    expansionState.setExpanded('dogs', 'dogs', '4')
    expansionState.addOverlay('dogs', 'people', '1')
    expansionState.addOverlay('dogs', 'cats', '3')
    expansionState.addOverlay('dogs', 'people', '1')

    const expected = {
      [config.ALL_PAGE_NAME]: {},
      people: {},
      cats: {},
      dogs: {
        type: 'dogs',
        id: '4',
        overlay: {
          type: 'people',
          id: '1',
          overlay: {
            type: 'cats',
            id: '3',
            overlay: {
              type: 'people',
              id: '1',
            },
          },
        },
      },
    }
    expect(expansionState).to.deep.equal(expected)
  })

  it('removes overlays from overlays', function() {
    expansionState.setExpanded('dogs', 'dogs', '4')
    expansionState.addOverlay('dogs', 'people', '1')
    expansionState.addOverlay('dogs', 'cats', '3')
    expansionState.addOverlay('dogs', 'people', '1')

    expansionState.setExpanded('cats', 'cats', '3')
    expansionState.addOverlay('cats', 'people', '1')
    expansionState.addOverlay('cats', 'dogs', '4')
    expansionState.addOverlay('cats', 'people', '1')

    expansionState.removeOverlay('dogs')
    expansionState.removeOverlay('cats')
    expansionState.removeOverlay('dogs')
    expansionState.removeOverlay('cats')
    expansionState.removeOverlay('dogs')
    expansionState.removeOverlay('cats')

    const expected = {
      [config.ALL_PAGE_NAME]: {},
      people: {},
      cats: {
        type: 'cats',
        id: '3',
      },
      dogs: {
        type: 'dogs',
        id: '4',
      },
    }
    expect(expansionState).to.deep.equal(expected)
  })
})
