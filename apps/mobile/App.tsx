import React, { useRef, useCallback, useMemo } from 'react';
import { StyleSheet, BackHandler, Platform, ActivityIndicator, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const ANDROID_URL = 'http://10.0.2.2:3001';
const IOS_URL = 'http://10.0.0.43:3001';
const APP_URL = Platform.OS === 'android' ? ANDROID_URL : IOS_URL;

export default function App() {
    const webViewRef = useRef<WebView>(null);
    const canGoBackRef = useRef(false);

    const handleNavigationStateChange = useCallback((navState: any) => {
        canGoBackRef.current = navState.canGoBack;
    }, []);

    React.useEffect(() => {
        if (Platform.OS === 'android') {
            const onBackPress = () => {
                if (canGoBackRef.current && webViewRef.current) {
                    webViewRef.current.goBack();
                    return true;
                }
                return false;
            };

            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => subscription.remove();
        }
    }, []);

    const source = useMemo(() => ({ uri: APP_URL }), []);

    console.log("App Rendered timestamp:", Date.now());

    return (
        <View style={styles.container}>
            <View style={styles.statusBarBox}>
                <StatusBar style="auto" />
            </View>
            <WebView
                key="webview-static-key"
                ref={webViewRef}
                source={source}
                style={styles.webview}
                onNavigationStateChange={handleNavigationStateChange}
                startInLoadingState={true}
                renderLoading={() => (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#2563eb" />
                    </View>
                )}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                automaticallyAdjustContentInsets={false}
                keyboardDisplayRequiresUserAction={false}
                sharedCookiesEnabled={true}
                bounces={false}
                overScrollMode="never"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    statusBarBox: {
        height: Platform.OS === 'ios' ? 50 : 30,
        backgroundColor: '#fff',
        zIndex: 20,
    },
    webview: {
        flex: 1,
    },
    loadingContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    }
});
