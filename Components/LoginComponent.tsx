import { Button, Text, TextInput, useTheme } from "react-native-paper";
import { Image, View, StyleSheet } from "react-native";
import PolicyAgreements from "./PolicyAgreements";
import { useState } from "react";

type LoginComponentProps = {
    type: string,
    onLogin: (username: string, password: string) => void,
    errorMessage?: string,
    showError?: boolean
}

export default function LoginComponent(props: LoginComponentProps) {

    let theme = useTheme();
    const [username, setUsername] = useState("peterparker");
    const [password, setPassword] = useState("");
    
    return (
        <View style={{flex: 1}}>
            <Text variant="headlineMedium"  style={{...loginScreenStyles.marginEnds, ...loginScreenStyles.loginText}}>
            Login
            </Text>

            <View style={{...loginScreenStyles.gymloTextContainer, ...loginScreenStyles.marginEnds}}>
                <View>
                    <Text variant="titleLarge" style={{fontWeight: "bold"}}>
                    Gymnasium Lohmar
                    </Text>
                    <Text variant="titleLarge" style={{fontWeight: "bold"}}>
                    App
                    </Text>
                </View>

                <Image source={require('../assets/gymlo_logo.png')} />
            </View>

            <View style={{...loginScreenStyles.marginEnds, ...loginScreenStyles.loginFieldsContainer}}>
                <TextInput mode='outlined' value='peterparker' onChangeText={setUsername}/>
                <TextInput mode='outlined' placeholder='Passwort' onChangeText={setPassword} secureTextEntry={true}/>
                <Button 
                    style={{marginTop: 10, backgroundColor: props.type == "student" ? theme.colors.primary : theme.colors.primaryContainer}}
                    theme={{roundness: 1}}
                    icon="login" 
                    mode="contained"
                    onPress={() => props.onLogin(username, password)}>
        
                    {props.type == "student" ? "Login SchülerInnen" : "Login LehrerInnen"} 
                
                </Button>

                {props.showError !== undefined && props.showError === true ? 
                    <Text>{props.errorMessage}</Text> : null
                }
            </View>

            <PolicyAgreements marginEnds={loginScreenStyles.marginEnds} color="#6AA5EA"/>
        </View>
    );
}

const loginScreenStyles = StyleSheet.create({
    marginEnds: {
        marginLeft: 15,
        marginRight: 15
    },
    loginText: {
        flex: 1,
        textAlignVertical: "center",
        fontWeight: "bold",
        marginTop: 20
    },
    gymloTextContainer: {
        flex: 1, 
        flexDirection: 'row',
         justifyContent: 'center'
    },
    loginFieldsContainer: {
        flex: 2, 
        marginBottom: 30,
        justifyContent: "flex-end"
    },
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center'
    },
  });