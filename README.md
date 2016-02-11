# firestation
A simple, configurable admin interface for Firebase, built on React.

## Global Dependencies

- npm
- webpack

## Installation

Clone this repository.

Setup packages:

    npm i


## Configuration

You need to add a `firestation.config.js` file in the root of the project. This is where you configure your dashboard. Here's an example:

    import {ImageCell, TextCell, SelectCell} from 'components/cells.jsx';

    export default {
        auth: myAuthMethod,
        ref: myFirebaseRef,
        defaultChild: 'pets',
        refs: [
            {
                ref: myFirebaseRef.child('pets'),
                title: 'My Favorite Pets',
                orderBy: 'size.height',
                orderByDirection: 'desc',
                children: [
                    {
                        key: 'picture',
                        title: 'Profile Pic',
                        cell: ImageCell,
                        cellProps: {
                            width: '120',
                            height: '120'
                        },
                        canFilter: false
                    },
                    {
                        key: 'name',
                        cell: TextCell
                    },
                    {
                        key: 'size.height',
                        title: 'Height',
                        cell: TextCell
                    },
                    {
                        key: 'size.weight',
                        title: 'Weight',
                        cell: TextCell
                    },
                    {
                        key: 'species',
                        cell: SelectCell,
                        cellProps: {
                            options: [
                                {
                                    value: 'cat',
                                    title: 'Cat'
                                },
                                {
                                    value: 'dog',
                                    title: 'Dog'
                                }
                            ]
                        }
                    }
                ]
            },
            {
                ref: myFirebaseRef.child('owners').orderByChild('lazy').equalTo(true) // Full ref chaining support
                title: 'Lazy Owners',
                resolve: function (val, callback) {  // Custom firebase resolve method
                    val.calculatedLaziness = Math.random();
                    callback(val);
                },
                children: [
                    {
                        key: 'surname',
                        cell: TextCell,
                        canWrite: true
                    },
                    {
                        key: 'lazy',
                        cell: TextCell
                    },
                    {
                        key: 'calculatedLaziness',
                        cell: TextCell
                    }
                ]
            }
        ]
    }

That's it. The `ref` array contains configuration for each firebase ref you want to render in the dashboard.

#### Cell Types
We provide default cells for common data formats. These are:

- `TextCell`
- `LongTextCell` - renders a textarea for longer text
- `ImageCell` - set `width` and `height` in cellProps
- `SelectCell`
- `TimeSinceCell`
- `DateCell`
- `CurrencyCell` - set `symbol` in cellProps

We're adding to this, but you can write custom react cells if you need anything fancy. Each cell type may have custom `cellProps`. For example, `ImageCell` has two `width` and `height`.

#### Writable Cells
Cells can be read-only or read-and-write. You can customise this with the `canWrite` property, which will default to `false`:

    {
        key: 'surname',
        cell: TextCell,
        canWrite: true
    }

Currently only some cells support writing:
- TextCell
- LongTextCell
- SelectCell


## Running locally

Just use

    npm start

Now go to http://127.0.0.1:8080.

## Building for distribution

Build that shiz:

    webpack

Deploy `dist` wherever.
