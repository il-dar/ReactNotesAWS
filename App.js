import React from 'react';
import { StackNavigator } from 'react-navigation';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/es/integration/react';
import { navigatorConfig } from './src/screens';
import { persistor, store } from './src/redux/store';
import Amplify from 'aws-amplify-react-native';
import Amplify from 'aws-amplify';
import awsconfig from './src/aws-exports';

Amplify.configure(awsconfig);



export default class App extends React.Component {
  render() {
    const Navigator = StackNavigator(navigatorConfig);

    return (
      <Provider store={store}>
        <PersistGate persistor={persistor}>
          <Navigator/>
        </PersistGate>
      </Provider>
    );
  }
};
