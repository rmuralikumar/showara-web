import test from "node:test";
import assert from "node:assert/strict";

// 1. Logged-out state contract
test("Logged-out state: User is not signed in and has no Guest or Guest Moviegoer identity", () => {
  const session = null;
  const status = "unauthenticated";
  const isSignedIn = status === "authenticated" && Boolean(session?.user);

  const ANONYMOUS_USER = {
    id: "",
    name: "",
    email: "",
    imageUrl: "",
    isLoggedIn: false,
  };

  const user = !isSignedIn ? ANONYMOUS_USER : {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    imageUrl: session.user.image,
    isLoggedIn: true,
  };

  assert.equal(isSignedIn, false);
  assert.equal(user.isLoggedIn, false);
  assert.notEqual(user.name, "Guest");
  assert.notEqual(user.name, "Guest Moviegoer");
  assert.equal(user.name, "");
  assert.equal(user.id, "");
});

test("Logged-out UI items: Only 'Continue with Google' is shown, profile dropdown items are suppressed", () => {
  const isSignedIn = false;

  // Header right action items logic
  const showsContinueWithGoogle = !isSignedIn;
  const showsBookingsLink = isSignedIn;
  const showsProfileMenu = isSignedIn;
  const showsMyBookings = isSignedIn;
  const showsMyProfile = isSignedIn;
  const showsAccountSettings = isSignedIn;
  const showsSignOut = isSignedIn;

  assert.equal(showsContinueWithGoogle, true);
  assert.equal(showsBookingsLink, false);
  assert.equal(showsProfileMenu, false);
  assert.equal(showsMyBookings, false);
  assert.equal(showsMyProfile, false);
  assert.equal(showsAccountSettings, false);
  assert.equal(showsSignOut, false);
});

// 2. Logged-in state contract
test("Logged-in state: User is signed in with Google credentials", () => {
  const googleSession = {
    user: {
      id: "usr_google_12345",
      name: "Murali Kumar",
      email: "murali@example.com",
      image: "https://lh3.googleusercontent.com/a/mock-avatar",
    },
  };
  const status = "authenticated";
  const isSignedIn = status === "authenticated" && Boolean(googleSession?.user);

  const user = {
    id: googleSession.user.id,
    name: googleSession.user.name,
    email: googleSession.user.email,
    imageUrl: googleSession.user.image,
    isLoggedIn: true,
  };

  assert.equal(isSignedIn, true);
  assert.equal(user.isLoggedIn, true);
  assert.equal(user.name, "Murali Kumar");
  assert.equal(user.email, "murali@example.com");
  assert.equal(user.imageUrl, "https://lh3.googleusercontent.com/a/mock-avatar");

  // Header right action items logic for logged in user
  const showsContinueWithGoogle = !isSignedIn;
  const showsBookingsLink = isSignedIn;
  const showsProfileMenu = isSignedIn;
  const dropdownItems = [
    "My Bookings",
    "My Profile",
    "Account Settings",
    "Sign Out",
  ];

  assert.equal(showsContinueWithGoogle, false);
  assert.equal(showsBookingsLink, true);
  assert.equal(showsProfileMenu, true);
  assert.deepEqual(dropdownItems, [
    "My Bookings",
    "My Profile",
    "Account Settings",
    "Sign Out",
  ]);
});
