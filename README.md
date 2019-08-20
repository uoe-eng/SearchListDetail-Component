# SearchListDetail component

## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn run serve
```

### Compiles and minifies for production
```
yarn run build
```

### Run your tests
```
yarn run test
```

### Lints and fixes files
```
yarn run lint
```

### Run your end-to-end tests
```
yarn run test:e2e
```

### Run your unit tests
```
yarn run test:unit
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

# Usage guide

The component takes a single prop called `collections` which is of type `Array`.
```
<SearchListDetail>
  :collections="[
    <collection>,
    <collection>,
    ...
  ]"
</SearchListDetail>
```

Each `<collection>` is an object with the following keys
```
{
  name: String,                  // required
  columns: Array of Objects,     // required
  previewOrder: Array of String, // optional (default = all column names)
  show: Boolean,                 // optional (default = true)
}
```
* `name` is the name of the collection, which is the name used to fetch it from the API in the URL `...api/<name>/<id>`.
* `columns` is a description of all the columns you want the component to show.
* `previewOrder` can be set if you want to override the default subset and order of the columns displayed in a preview card.
* `show` can be set to false if you don't want the collection to show in the search results.

Each `column` in the array `columns` has the following keys
```
columns: [
  {
    name: String,           // required
    alias: String,          // optional (default = name)
    searchOperator: String, // optional (default = 'contains')
    caseSensitive: Boolean, // optional (default = false)
    searchable: Boolean,    // optional (default = true)
  },
  ...
]
```
* `name` is the name of the entry's attribute you want to display as a column, or if displaying a relationship using `<relationship>.<atrribute>`.
* `alias` is what will be displayed in place of the column name.
* `searchOperator` can be one of `'contains'`, `'matches'`, `'startsWith'`, `'endsWith'`, which represents how the particular column will be searched. These options correspond with the keys in `config.SEARCH_OPERATORS` and `config.ILIKE_FILTERS`, so additional ones can be added if needed.
* `caseSensitive` determines if the search on a column should be case sensitive or not. If false, both the search and the column will be converted using `.toUpperCase()` before passed into the selected `searchOperator`.
* `searchable` determines the initial state of the advanced search checkbox for the column. The user will be able to toggle this.

## Example
This example shows a simple use case for describing the columns as well as a relationship.

*Note that even though you don't want the `matriclation_numbers` collection to be searchable, you must still describe it in order to fetch the data to display a person's relationships.*
```
<SearchListDetail>
  :collections="[
    {
      name: 'people',
      columns: [
        {
          name: 'first_name',
          alias: 'First Name',
        },
        {
          name: 'surname',
        },
        {
          name: 'matriculation_numbers.matriculation_number',
          alias: 'Matric Number',
          searchOperator: 'matches',
          caseSensitive: true,
        },
      ],
      previewOrder: ['first_name', 'surname'],
    },
    {
      name: 'matriculation_numbers',
      columns: [{ name: matriculation_number }],
      show: false,
    },
  ]"
</SearchListDetail>
```

# Technical guide

## Definitions and keywords

I have tried to keep the naming conventions as consistent as possible thoughout the project, here are the definitions for the most common / possibly ambiguous ones.
* `SLD` is short for `SearchListDetail`
* A `collection` represents a table in the database
* The navigation bar has several `pages` that the user can switch between, each of which contains one or more collections
* Each collection has `entries` which represent the rows in a database table
* If an `id` is mentioned it will always be in reference to an entry
* Entries and collections have `columns`, similar to the columns in a database table
* The text displayed when showing a column's name is an `alias`
* A collection's `options` holds information about itself and its columns
* A `cleanEntry` is an entry without the relationship data
* The `localstore` is a scoped Vuex store, local to each instance of the component
* The `globalstore` is the store passed into the top component, usually equivalent to `this.$store`
* A `card` (which represents an entry) can either be `expanded` (showing all attributes and relationships) or in `preview` mode (showing only a subset)
* An `overlay` is a card that is displayed over another card to display a related entry
* Two entries that are related to each other are `linked` and can be `unlinked`
* The `quickSearch` is the first seach request that contains no relationship data
* The `longSearch` is the delayed search that comes after, containing required relationship data

## Concepts and classes

### Collection class
This class defined in `Collection.js` represents the options for a collection. It holds the following:
* The collection's name (`this.name`)
* If the collection should be searchable (`this.options.show`)
* Column descriptions (name, alias, search operator, case sensitivity, searchability) (`this.options.columns`)
* Subset of columns shown in a preview card (`this.options.previewOrder`)
* An array of IDs representing the search results for entries of this type (`this.searchResults`)
* A getter method to get an array of column names (`this.columnNames`)

### Expansion state class
This class defined in `ExpansionState.js` represents which entries are expanded in each page and with which overlays. In the simplest case, there is a key for each page, each holding an object like
```
{ type: String, id: String }
```
 which represents the entry that is expanded on that page. When an overlay is added to the expanded card, a new key is added like so:
```
{
  type: String,
  id: String,
  overlay: { type: String, id: String },
}
```
An overlay is just another card, so it too can have its own overlay.

The class provides the following methods:
* `setExpanded()`: sets a page's expansion to one entry without overlays
* `addOverlay()`: adds an overlay to the deepest overlay in the data structure
* `removeOverlay()`: removes the deepest overlay from the data structure

For consistency, an expanded card without overlay is still called an overlay, so to "remove an overlay" on a page with a single expansion is equivalent to "removing the expansion".

### The local SLD store
This is a Vuex store saved into a variable that is passed around components as a prop (this method was chosen over creating store modules due to namespacing concerns). It is responsible for storing the state of the component, such as:
* The selected page
* The search term
* The collections' options, including search results (from `Collection.js`)
* The expansion state (from `ExpansionState.js`)
* A reference to the global store

Each sub component has access to this through the props since they all manipulate the state of the top component in some way.

The local store also acts as a proxy for patching and searching entries to and from the global store, using the actions `patch` and `updateSearchResults`.

### Searching entries
Fetching the search results from the server is done through the local store action `updateSearchResults`, which creates requests based on the store state, and updates each collection's `searchResults` array with IDs.

To improve response time, there is a short search that doesn't include relationship data, and a long search that does. The long search waits until all short searches are complete, since it relies on them to know which relationships to fetch. To do this, the local store's `pendingRequests` is incremented every time a request is sent, and decremented every time it completes. The long search then waits until the pending requests drop to 0. This may also be useful in the future if a loading animation needs to be shown.

### Keyboard bindings

Most of the code currently in place relating to keyboard bindings deals with moving the tab focus the handsontable component to the card view component and vice versa.

For going into the card from the tables, we need to add a variety of different listeners to the handsontable components, these can be found in `addTableHooks.js` (it contains a few more things unrelated to keyboard bindings too). In particular we need to:
* focus the first element of the card when `tab` is pressed on the last cell in the top table
* focus the last element of the card when `shift+tab` is pressed on the first cell in the bottom table
* focus the first cell in the top table when `tab` is pressed on the last cell in the bottom table
* focus the last cell in the bottom table when `shift+tab` is pressed on the first cell in the top table.

For going into the tables from the card, we don't have to use listeners to change the focus. The `CardView` template has two invisible elements at the top and bottom of the card which the user can tab into. When the top invisible element is tabbed into, focus is changed to the last cell in the top table. Equally when the bottom invisible element is tabbed into, focus is changed to the first cell in the bottom table. 

## File heirarchy

### SearchListDetail.vue
This is the top component housing all other components. It is responsible for initialising the local store and passing it down to all the components.

### Simple top level components
* `SearchBox.vue`: a component that provides an input box to alter the local store's search term.
* `AdvancedSearch.vue`: a component that provides checkboxes to toggle the columns' `searchable` attribute in the local store for each collection.
* `NavBar.vue`: a component that provides a row of tabs to change the `page` state in the local store.

### CardView.vue
A component to render an entry's card. At the bottom of the template, it uses another `CardView` component, which is how overlays are displayed.

In the current implementation, changes to the relationships are patched to the database immediately rather than waiting for the card to be saved.

There is also currently no way to select a relationship link from a list, you must type in the type and id manually for now.

### CardSearch.vue
This component is the main interface when on the "all" page or on mobile.
It simply iterates over an array of component(s) and lists all the entries as `CardView` components.

### TableSearch.vue
This is the main interface on desktop when looking at a single collection. The template consists of a card view component sandwiched between two handsontable components, or if the app is in mobile mode, it shows only a `CardSearch` component.

The main task here is to set up the two handsontable components correctly. In particular we need to:
* load the search results data into the data
* for each row, give handsontable some metadata that describes which id the entry belongs to
* update the column sorting to match the saved state
* add various hooks to the tables.

### addTableHooks.js
This file contains only one function which is only used in `TableSearch.vue`. It adds a variety of listeners to the handsontable components such as:
* when a column is sorted, update the column sorting state in the local store and update the search results
* when a cell's value is changed, patch the changes up to the server
* when the leftmost cell is being edited, set the expansion state and update the view
* add keybinding related hooks to navigate using tabs.

### util.js
This file contains a bunch of pure functions in the hopes of de-cluttering other files and making unit testing easier. These functions are mostly responsible for data manipulation are have little to do with the actual logic of the components.

## Development status

### Next steps
* Keyboard navigation for switching tabs
* Allow complex relationships to be specified in the component prop (more than one dot away)
* Create a new entry
* Read-only table cells for related items
* Show/hide collections using the advanced search feature, props only for initial state
