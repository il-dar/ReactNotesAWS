# Expo Version of the React Native Notes Tutorial

This is an Expo version of the React Native Notes Tutorial.

## Pre-requisites

1. [Node](https://nodejs.org) - any version at the LTS version or beyond is good enough.
2. A JavaScript Editor ([Visual Studio Code](https://code.visualstudio.com/) or [Nuclide](https://nuclide.io/) is recommended.  Ensure you add any packages appropriate to React Native development).
3. The [Expo](https://expo.io) App installed on an iOS or Android Device

## Install awsmobile CLI

```
npm install -g awsmobile-cli
awsmobile configure
```

You may need to add a PATH.  On MacOS, global modules are stored in /usr/local/bin and may need `sudo` privileges to install.  On Windows, global modules are stored in %APPDATA%\\npm.

When running awsmobile configure, a process is started that links the awsmobile CLI to your AWS account.  This requires that you log in to the AWS console.

## Download the Repository

Download [the GitHub repo](https://github.com/adrianhall/react-native-expo-notes).

1. Go to [the GitHub repo](https://github.com/adrianhall/react-native-expo-notes).
2. Click **Clone or download**.
3. Click **Download ZIP**.
4. Unpack the ZIP file.
5. Open a terminal in the new directory.  Run `yarn install`.
6. Run `yarn start` to start the app.

If you have XCode or Android Studio installed, you can run Expo on the emulator.  Use `yarn run ios` or `yarn run android` for this.  It works more consistently if the emulator or simulator is already running.  If you do not have XCode or Android Studio installed, you can run Expo on your own phone using `yarn start`.

## Add Analytics

1. Change directory to your project directory.
2. Run `awsmobile init`.
  * Where is your project's source directory: (src) **src**
  * Where is your project's distribution directory that stores build artifacts: (build) _Enter_
  * What is your project's build command: (npm run-script build) _Enter_
  * What is your project's start command for local test run: (npm run-script start) **yarn start**
  * What awsmobile projexct name would you like to use: (...) **notes-app**
3. Run `yarn add aws-amplify-react-native`
4. Add the following code to the `App.js` file (under the other imports):

```
import Amplify from 'aws-amplify-react-native';
import awsconfig from './src/aws-exports';

Amplify.configure(awsconfig);
```

5. Run the application again.
6. Run `awsmobile console`:
  * Click **Analytics** in the top right corner.
  * Click **Analytics** in the top left corner (side menu).
  * Validate that there is one endpoint recorded.

Add custom events to your app.  In this section, we add an "add-note" and "delete-note" event when those events happen in your app:

1. Edit `./src/screens/NoteListScreen.js`.  At the top of the file, add the following import:

```
import { Analytics } from 'aws-amplify-react-native';
```

2. Edit the `onAddNote()` method to be the following:

```
    static onAddNote(navigate) {
        Analytics.record('add-note');
        navigate('details', { noteId: uuid.v4() });
    }
```

3. Edit the `onDeleteNote()` method to be the following:

```
    onDeleteNote(item) {
        Analytics.record('delete-note');
        this.props.deleteNote(item.noteId);
    }
```

4. Run the app again.  Make some changes (add/delete notes).  Then view the analytics again.  In the **Events** page, you should see the appropriate events.  (You must refresh the page to get the new events to show up by name).

## Add Authentication

1. Run `awsmobile user-signin enable`.
2. Run `awsmobile pushy`.
3. Replace the Amplify import in `App.js` with the following:

```
import Amplify, { withAuthenticator } from 'aws-amplify-react-native';
```

4.  Replace the `export default` line at the bottom of `App.js` with the following:

```
export default withAuthenticator(App);
```

5. Run the app.

You will be prompted with the username/password prompt.  You can sign up first, then use the same information to sign in.  Also, check the Analytics - you will now see 1 daily active user.

## GraphQL / AWS AppSync

**Note**: In this version, we are using an API key to secure the data.  A "real" app will link the Cognito identity service to AppSync.

### Create the AWS AppSync Service

1. Open the AWS AppSync console.
2. Click **Create API**.
3. Enter a suitable name (like NotesApp), select **Custom schema**, click **Create**.
4. Click **Schema** in the left-hand menu.
5. Replace the contents of the Schema editor with the following:

```
type Note {
        noteId: ID!
        title: String!
        content: String!
}

type Query {
        getNote(noteId: ID!): Note
        allNote(count: Int, nextToken: String): [Note]
}

type Mutation {
        putNote(noteId: ID!, title: String!, content: String!): Note
        deleteNote(noteId: ID!): Note
}

schema {
  query:Query
  mutation:Mutation
}
```

6. Click **Save**.
7. Click **Create Resources**.
8. Select _Note_ in the drop-down to Select a type.
9. Scroll to the bottom of the page, click **Create**.  Wait for the DynamoDB table operation to complete.


### Test the GraphQL Service

1. Click **Queries** in the left-hand navigation.
2. Replace the contents of the Queries editor with the following:

```
query ListAllNotes {
    allNote {
        noteId, title
    }
}

query GetNote($noteId:ID!) {
    getNote(noteId:$noteId) {
        noteId, title, content
    }
}

mutation SaveNote($noteId:ID!,$title:String!,$content:String!) {
    putNote(noteId:$noteId, title:$title, content:$content) {
        noteId, title, content
    }
}

mutation DeleteNote($noteId:ID!) {
    deleteNote(noteId:$noteId) {
        noteId
    }
}
```

3. Replace the content of the Query Variables section with the following:

```
{
  "noteId": "4c34d384-b715-4258-9825-1d34e8e6003b",
  "title": "Console Test",
  "content": "A test from the console"
}
```

4. Use the Play button to do operations - save, delete, list-all and get note.

### Update the Client App

1. Go to the AppSync console and select your API.
2. At the bottom of the page, select **React Native**; download the configuration file (`AppSync.js`).
3. Copy `AppSync.js` (just downloaded) into `./src`
4. Run the following:

```
yarn add react-apollo graphql-tag aws-sdk aws-appsync aws-appsync-react
```

5. Create `./src/graphql.js` as follows:

```
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

const ListAllNotes = gql`query ListAllNotes {
    allNote {
        noteId, title
    }
}`;

const GetNote = gql`query GetNote($noteId:ID!) {
    getNote(noteId:$noteId) {
        noteId, title, content
    }
}`;

const SaveNote = gql`mutation SaveNote($noteId:ID!,$title:String!,$content:String!) {
    putNote(noteId:$noteId, title:$title, content:$content) {
        noteId, title, content
    }
}`;

const DeleteNote = gql`mutation DeleteNote($noteId:ID!) {
    deleteNote(noteId:$noteId) {
        noteId
    }
}`;

const operations = {
    ListAllNotes: graphql(ListAllNotes, {
        options: {
            fetchPolicy: 'network-only'
        },
        props: ({ data }) => {
            return {
                loading: data.loading,
                notes: data.allNote
            };
        }
    }),

    GetNote: graphql(GetNote, {
        options: props => {
            return {
                fetchPolicy: 'network-only',
                variables: { noteId: props.navigation.state.params.noteId }
            };
        },
        props: ({ data }) => {
            return {
                loading: data.loading,
                note: data.getNote
            }
        }
    }),

    DeleteNote: graphql(DeleteNote, {
        options: {
            refetchQueries: [ { query: ListAllNotes } ]
        },
        props: props => ({
            deleteNote: (noteId) => {
                return props.mutate({
                    variables: { noteId },
                    optimisticResponse: {
                        deleteNote: { noteId, __typename: 'Note' }
                    }
                })
            }
        })
    }),

    SaveNote: graphql(SaveNote, {
        options: {
            refetchQueries: [ { query: ListAllNotes } ]
        },
        props: props => ({
            saveNote: (note) => {
                return props.mutate({
                    variables: note,
                    optimisticResponse: {
                        putNote: { ...note, __typename: 'Note' }
                    }
                })
            }
        })
    })
};

export default operations;
```

**Note:** The queries within the `gql` boundary is the same query as is used in the AppSync Queries page.  The operations are used to bind the GraphQL queries and mutations to function props on the React components.

6. Update `App.js` to instantiate the AppSync connection.  Adjust the imports as follows:

```
// import { Provider } from 'react-redux';
// import { PersistGate } from 'redux-persist/es/integration/react';
// import { persistor, store } from './src/redux/store';

import AWSAppSyncClient from 'aws-appsync';
import { Rehydrated } from 'aws-appsync-react';
import { ApolloProvider } from 'react-apollo';
import appsyncConfig from './src/AppSync';
```

Then add the appSyncClient code below the Amplify.configure() code:

```
const appsyncClient = new AWSAppSyncClient({
  url: appsyncConfig.graphqlEndpoint,
  region: appsyncConfig.region,
  auth: { type: appsyncConfig.authenticationType, apiKey: appsyncConfig.apiKey }
});
```

Finally, change the render() method of the `App` class as follows:

```
  render() {
    const Navigator = StackNavigator(navigatorConfig);

    return (
      <ApolloProvider client={appsyncClient}>
        <Rehydrated>
          <Navigator/>
        </Rehydrated>
      </ApolloProvider>
    );
  }
```

7. Update `./src/screens/NoteListScreen.js`:
  * Comment out the REDUX imports (at the top of the file - marked)
  * Add the following AppSync imports:

  ```
  import { compose } from 'react-apollo';
  import GraphQL from '../graphql';
  ```

  * Comment out the `mapStateToProps`, `mapDispatchToProps` and `connect` blocks (at the bottom of the file - marked).
  * Add the following in their place:

  ```
  const NoteListScreen = compose(
      GraphQL.ListAllNotes,
      GraphQL.DeleteNote
  )(NoteList);
  ```

8. Update `./src/screens/NoteDetailsScreen.js`:
  * Comment out the REDUX imports (at the top of the file - marked)
  * Add the following AppSync imports:

  ```
  import { compose } from 'react-apollo';
  import GraphQL from '../graphql';
  ```

  * Comment out the `mapStateToProps`, `mapDispatchToProps` and `connect` blocks (at the bottom of the file - marked).
  * Add the following in their place:

  ```
  const NoteDetailsScreen = compose(
      GraphQL.GetNote,
      GraphQL.SaveNote
  )(NoteDetails);
  ```

9. Run the application.  Add a new note, delete a note, etc.
10. Check the DynamoDB database - there should be items in the table.
