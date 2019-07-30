import { expect } from 'chai'
import config from '@/components/config'

describe('Search Operators', function() {
  it('supports a "contains" operator', function() {
    const contains = config.SEARCH_OPERATORS.contains
    expect(contains('Abc', 'A')).to.be.true
    expect(contains('Abc', 'b')).to.be.true
    expect(contains('Abc', 'c')).to.be.true
    expect(contains('Abc', 'd')).to.be.false
  })

  it('supports a "matches" operator', function() {
    const matches = config.SEARCH_OPERATORS.matches
    expect(matches('Abc', 'Abc')).to.be.true
    expect(matches('Abc', 'A')).to.be.false
    expect(matches('Abc', 'b')).to.be.false
    expect(matches('Abc', 'c')).to.be.false
  })

  it('supports a "startsWith" operator', function() {
    const startsWith = config.SEARCH_OPERATORS.startsWith
    expect(startsWith('Abc', 'A')).to.be.true
    expect(startsWith('Abc', 'Ab')).to.be.true
    expect(startsWith('Abc', 'Abc')).to.be.true
    expect(startsWith('Abc', 'Abcd')).to.be.false
    expect(startsWith('Abc', 'b')).to.be.false
    expect(startsWith('Abc', 'c')).to.be.false
  })

  it('supports a "endsWith" operator', function() {
    const endsWith = config.SEARCH_OPERATORS.endsWith
    expect(endsWith('Abc', 'c')).to.be.true
    expect(endsWith('Abc', 'bc')).to.be.true
    expect(endsWith('Abc', 'Abc')).to.be.true
    expect(endsWith('Abc', 'AAbc')).to.be.false
    expect(endsWith('Abc', 'b')).to.be.false
    expect(endsWith('Abc', 'A')).to.be.false
  })
})
