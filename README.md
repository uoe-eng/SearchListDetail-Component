# SearchListDeatil Component

## Current features
* Results separated by type in tabs with a sticky navigation bar
* The 'All' tab displays results in cards
* The other tabs display results with row-expandable handsontable components
* 'All' tab cards link to their corresponding type tab and expands its row automatically
* Mobile layout where cards are used instead of tables
* Navigation bar scrolls horizontally if too long
* Data is editable from both the cards and table cells
* Navigation by keyboard and tab is possible in the table views
* All state data is stored in a local store module, potential for URL routing in the future
* Columns can be sorted by handsontable, the order will be saved in vue and update
* Sorted columns stay sorted when switching tabs
* Expanded cards / rows stay expanded when switching tabs
* Edited fields will patch to the server from both the table and cards
* Closing a card will revert any change made by the user in that card
* Escape closes card, enter saves card
* Columns can be relationships
* Table shows how many related record there are for a relationship column
* Expanded cards show buttons for relationship columns which will bring up the card for the related record
* Collapsed cards just show a list of texts for the relationship column
* Simple search box available (client side filtering only)
* In the props, each column can have search options (operator, case sensitivity)
* Search operators are configurable in config.js
* Advanced search available to filter by column
* Can toggle multiple columns on/off at once
* Can specify an alias for a column (eg. to show "First Name" instead of "preferred_name")

## Next steps
* Keyboard navigation for switching tabs
* Add automated tests

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
