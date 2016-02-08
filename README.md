# firestation
A simple, configurable admin interface for Firebase, built on React.

## Global Dependencies

- npm

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
        children: {
            pets: [
                {   
                    key: 'picture',
                    title: 'Profile Pic'
                    cell: ImageCell,
                    cellProps: {
                        width: '120',
                        height: '120'
                    }
                },
                { 
                    key: 'name',
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
            ],
            owners: [
                {   
                    key: 'title',
                    cell: TextCell
                }
            ]
        }
    }

That's it. The `children` array contains configuration for each child you want to render in the dashboard.

We provide default cells for common data formats. These are:

- `TextCell`
- `ImageCell`
- `SelectCell`

We're adding to this, but you can write custom react cells if you need anything fancy.

## Running locally

Just use

    npm start

Now go to http://127.0.0.1:8080.

## Building for distribution

Build that shiz:

    webpack

Deploy `dist` wherever.