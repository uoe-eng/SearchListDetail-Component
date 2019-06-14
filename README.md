# SearchListDeatil Component

## Current features
(too long for a commit message)
* Separated result type in tabs with a sticky navigation bar
* The 'All' tab displays results in cards 
* The other tabs display results with row-expandable handsontable components
* 'All' tab cards link to their corresponding type tab and expands its row automatically

## Next steps
* Give the CardView component two modes: 'preview' and 'full'. 'preview' will be shown as search results in the 'All' tab and 'full' will be used when a handsontable row is expanded.
* Make the data editable from the cards and from the tables directly.

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
