# SearchListDeatil Component

## Current features
* Separated result type in tabs with a sticky navigation bar
* The 'All' tab displays results in cards 
* The other tabs display results with row-expandable handsontable components
* 'All' tab cards link to their corresponding type tab and expands its row automatically
* Mobile layout where cards are used instead of tables
* Navigation bar scrolls horizontally if too long
* Expanded cards stay expanded when switching tabs
* Data is editable from both the cards and table cells
* Navigation by keyboard and tab is possible in the table views
* All data structures regarding state are stored in the root component, potential for URL routing
* Columns can be sorted by handsontable, the order will be saved in vue and is reactive
* Sorted columns stay sorted when switching tabs

## Next steps
* Patch collections to the server (will require real server)
* Add search box
* Add advanced search settings with column filters
* Keyboard navigation for switching tabs

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
