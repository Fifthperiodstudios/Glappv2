import { useLinkProps } from '@react-navigation/native';
import {Linking, View, StyleSheet} from 'react-native'
import {Text, useTheme} from 'react-native-paper'

type PolicyAgreementsProps = {
    marginEnds: {marginLeft: number, marginRight: number},
    marginTop?: number,
    color: string
}

export default function PolicyAgreements(props: PolicyAgreementsProps) {
    let theme = useTheme();

    return (
        <View style={{...policyStyle.policyContainer, ...props.marginEnds, marginTop: props.marginTop}}>
            <Text style={{marginBottom: 10, color: props.color}}
                  onPress={() => Linking.openURL("https://gymnasium-lohmar.org/index.php/disclaimer")}>
                Datenschutzbestimmung
            </Text>
            <Text style={{color: props.color}}
                  onPress={() => Linking.openURL("https://gymnasium-lohmar.org/index.php/impressum")}>
                Nutzungsbedinungen
            </Text>
        </View>
    )
}

const policyStyle = StyleSheet.create({
    policyContainer: {
        flex: 1,
        justifyContent: "center",
        alignSelf: 'baseline',
    }
})
