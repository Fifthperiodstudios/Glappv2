import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { Tabs, TabScreen } from 'react-native-paper-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';

import { loginStudent, loginTeacher } from '../api/LoginApi';
import { RootStackParamList } from '../AppContent';
import LoginComponent from '../Components/LoginComponent'
import { loggedIn } from '../Statemanagement/AppSlice';
import { useAppDispatch } from '../Statemanagement/hooks';
import { loginStateChanged, LoginStates } from '../Statemanagement/LoginSlice';

type Props = NativeStackScreenProps<RootStackParamList, 'SignIn'>;

export default function LoginScreen({navigation, route} : Props) {
  const dispatch = useAppDispatch();

  let onLoginStudent = function(username: string, password: string) {
    console.log("logging In");
    loginStudent(username, password).then((user) => {
      dispatch(loggedIn(user));

      dispatch(loginStateChanged({
        isSignedIn: true,
        status: {
          status: LoginStates.LOGGED_IN,
          message: ""
        }
      }));
    },(error: Error) => {
      console.log(error.message);
      
      dispatch(loginStateChanged({
        isSignedIn: false,
        status: {
          status: LoginStates.ERROR,
          message: error.message
        },
      }));
    });
  };

  let onLoginTeacher = function(username: string, password: string) {
    loginTeacher(username, password).then((user) => {
      dispatch(loggedIn(user));

      dispatch(loginStateChanged({
        isSignedIn: true,
        status: {
          status: LoginStates.LOGGED_IN,
          message: ""
        }
      }));
    },(error: Error) => {

      console.log(error.message);

      dispatch(loginStateChanged({
        isSignedIn: false,
        status: {
          status: LoginStates.ERROR,
          message: error.message
        },
      }));
    });
  };

  return (
      <SafeAreaView style={{flex: 1}}>
      <StatusBar/>
      <Tabs style={{backgroundColor: "white"}}>
        <TabScreen label="Schüler:In">
          <LoginComponent type="student" onLogin={onLoginStudent}/>
        </TabScreen>
        <TabScreen label="Lehrer:In">
          <View style={{flex: 1, justifyContent: 'center'}}>
            <LoginComponent type="teacher" onLogin={onLoginTeacher}/>
          </View>
        </TabScreen>
      </Tabs>
    </SafeAreaView>
  );
}