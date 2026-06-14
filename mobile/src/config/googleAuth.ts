// src/config/googleAuth.ts 14/06/2024
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import { getAuth, signInWithCredential, GoogleAuthProvider } from 'firebase/auth';

WebBrowser.maybeCompleteAuthSession();

const ANDROID_CLIENT_ID = '124650527048-sl3c4r15v4fjtua8mdcj172at0chihe1.apps.googleusercontent.com';
const WEB_CLIENT_ID = '124650527048-sl3c4r15v4fjtua8mdcj172at0chihe1.apps.googleusercontent.com';
const IOS_CLIENT_ID = '124650527048-sl3c4r15v4fjtua8mdcj172at0chihe1.apps.googleusercontent.com';

export const useGoogleAuth = () => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: ANDROID_CLIENT_ID,
    iosClientId: IOS_CLIENT_ID,
    webClientId: WEB_CLIENT_ID,
    redirectUri: makeRedirectUri({
      scheme: 'loteriasia',
    }),
  });

  const signInWithGoogle = async () => {
    try {
      const result = await promptAsync();
      
      if (result?.type === 'success') {
        const { id_token } = result.params;
        const credential = GoogleAuthProvider.credential(id_token);
        const auth = getAuth();
        await signInWithCredential(auth, credential);
        return { success: true };
      } else if (result?.type === 'cancel') {
        return { success: false, error: 'Login cancelado' };
      } else {
        return { success: false, error: 'Falha no login' };
      }
    } catch (error: any) {
      console.error('Erro no Google Login:', error);
      return { success: false, error: error.message };
    }
  };

  return {
    signInWithGoogle,
    request,
    promptAsync,
  };
};
