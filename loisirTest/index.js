/**
 * @format
 */
//import {EventEmitter} from 'events';
//import 'events';
//global.EventEmitter = EventEmitter;
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
//import { EventEmitter } from 'events';
//global.EventEmitter = EventEmitter;
//import 'event-target-polyfill';

AppRegistry.registerComponent(appName, () => App);
