// functionality dealing with interpreting the sld prop
export default class SldProp {
  constructor(prop) {
    this.collections = prop.collections
    this.collectionNames = prop.collections.map((collection) => {
      return collection.name
    })
    console.log(this.getCollectionOptions('people'))
  }

  getCollectionByName = (collectionName) => {
    const index = this.collectionNames.indexOf(collectionName)
    if (index == -1) {
      console.error('Collection name', collectionName, 'not found in SldProp', this.collections)
    }
    return this.collections[index]
  }
}
