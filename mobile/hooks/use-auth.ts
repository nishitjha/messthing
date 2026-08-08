import { useAuth as useClerkAuth, useSSO, useUser } from "@clerk/clerk-expo";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useEffect, useRef, useState } from "react";
import axios from "@/utils/axios";

WebBrowser.maybeCompleteAuthSession();

export function useAuth() {
  const { isLoaded: authLoaded, signOut, userId } = useClerkAuth();
  const { isLoaded: userLoaded, user } = useUser();
  const { startSSOFlow } = useSSO();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const syncedUserId = useRef<string | null>(null);

  const email = user?.emailAddresses?.[0]?.emailAddress;
  const signedInWithOtherID =
    !!userId &&
    !!email &&
    !/^[^\s@]+@pilani\.bits-pilani\.ac\.in$/i.test(email);

  const isLoading = !authLoaded || !userLoaded || isSigningIn;

  useEffect(() => {
    if (!userId || !user || signedInWithOtherID) return;
    if (syncedUserId.current === userId) return;

    syncedUserId.current = userId;

    const syncUser = async () => {
      try {
        await axios.post("/users/", { 
id: userId, email: email, name: user.fullName
         });
      } catch (error) {
        console.error("Error storing user in database:", error);
        syncedUserId.current = null;
      }
    };

    syncUser();
  }, [userId, user, signedInWithOtherID]);

  const signInWithGoogle = useCallback(async () => {
    try {
      setIsSigningIn(true);

      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_google",
        redirectUrl: Linking.createURL("/callback"),
      });

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
      }
    } catch (error) {
      console.error("sign in failed:", error);
    } finally {
      setIsSigningIn(false);
    }
  }, [startSSOFlow]);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("sign out failed:", error);
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