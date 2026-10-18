import {Redirect} from 'expo-router';

// Round tracking is available only in the native iOS and Android app.
export default function PlayWeb(){return <Redirect href="/"/>;}
