import { Amplify } from 'aws-amplify'
import { withAuthenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import GNSS from './ui-components/GNSS'
import './App.css';

function App({ signOut, user }) { 
  return (
    <GNSS/>
  );
}

export default withAuthenticator(App);
