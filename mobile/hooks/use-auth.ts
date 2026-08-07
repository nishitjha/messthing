import { useAuth as useClerkAuth, useSSO, useUser } from "@clerk/clerk-expo";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useState } from "react";
import axios from "@/utils/axios"

// i have no idea why people do this but apparently it's smoother
WebBrowser.maybeCompleteAuthSession();

export function useAuth() {
  const { isLoaded: authLoaded, signOut, userId } = useClerkAuth();
  const { isLoaded: userLoaded, user } = useUser();
  const { startSSOFlow } = useSSO();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const email = user?.emailAddresses?.[0]?.emailAddress;
  let signedInWithOtherID =
    !!userId &&
    !!email &&
    !/^[^\s@]+@pilani\.bits-pilani\.ac\.in$/i.test(email);

  const isLoading = !authLoaded || !userLoaded || isSigningIn;

  const signInWithGoogle = useCallback(async () => {
    try {
      setIsSigningIn(true);

      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_google",
        redirectUrl: Linking.createURL("/callback"),
      });

      console.log("Created session ID:", createdSessionId);
      console.log(user);

      if (createdSessionId && setActive) {
        // make a request to backend to store in db
        // could've skipped this too but eh
        const req = await axios.post("/users/", {
          user
        });
        
        const response = await req.data

        await setActive({ session: createdSessionId });
      }
    } catch (error) {
      // don't bother reporting it lolol
    } finally {
      setIsSigningIn(false);
    }
  }, [startSSOFlow]);

  const handleSignOut = useCallback(async () => {
    try {
      signedInWithOtherID = false;
      await signOut();
    } catch (error) {
      // don't bother reporting it lolol
    }
  }, [signOut]);

  return {
    isLoading,
    isAuthenticated: !!userId,
    user,
    signInWithGoogle,
    signOut: handleSignOut,
    signedInWithOtherID,
  };
}
