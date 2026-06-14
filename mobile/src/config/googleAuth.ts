import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import { getAuth, signInWithCredential, GoogleAuthProvider } from 'firebase/auth';

WebBrowser.maybeCompleteAuthSession();

// CLIENT ID DO ANDROID (que você criou)
const ANDROID_CLIENT_ID = '124650527048-sl3c4r15v4fjtua8mdcj172at0chihe1.apps.googleusercontent.com';

// CLIENT ID DO WEB (pode ser o antigo ou o novo - o que estiver no Firebase)
const WEB_CLIENT_ID = '124650527048-sl3c4r15v4fjtua8mdcj172at0chihe1.apps.googleusercontent.com';

export const useGoogleAuth = () => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: ANDROID_CLIENT_ID,
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
      } else {
        return { success: false, error: 'Login cancelado' };
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