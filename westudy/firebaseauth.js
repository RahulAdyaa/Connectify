// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,GithubAuthProvider
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyD1geaIDgWNu3MVJyCZgBNrZBhCduTLtog",
    authDomain: "connectify-27cfd.firebaseapp.com",
    projectId: "connectify-27cfd",
    storageBucket: "connectify-27cfd.appspot.com",
    messagingSenderId: "547787628643",
    appId: "1:547787628643:web:6bbfef44dfccadf3a49856"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();
const provider = new GoogleAuthProvider(); // Initialize the Google Auth Provider

function showMessage(message, divId) {
    var messageDiv = document.getElementById(divId);
    messageDiv.style.display = "block";
    messageDiv.innerHTML = message;
    messageDiv.style.opacity = 1;
    setTimeout(function () {
        messageDiv.style.opacity = 0;
    }, 5000);
}

const signUp = document.getElementById('submitSignUp');
signUp.addEventListener('click', (event) => {
    event.preventDefault();
    const email = document.getElementById('rEmail').value;
    const password = document.getElementById('rPassword').value;
    const firstName = document.getElementById('fName').value;
    const lastName = document.getElementById('lName').value;

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            const userData = {
                email: email,
                firstName: firstName,
                lastName: lastName
            };
            showMessage('Account Created Successfully', 'signUpMessage');
            const docRef = doc(db, "users", user.uid);
            setDoc(docRef, userData)
                .then(() => {
                    window.location.href = 'signuppage.html';
                })
                .catch((error) => {
                    console.error("error writing document", error);
                });
        })
        .catch((error) => {
            const errorCode = error.code;
            if (errorCode === 'auth/email-already-in-use') {
                showMessage('Email Address Already Exists !!!', 'signUpMessage');
            } else {
                showMessage('Unable to create User', 'signUpMessage');
            }
        });
});

const signIn = document.getElementById('submitSignIn');
signIn.addEventListener('click', (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            showMessage('Login is successful', 'signInMessage');
            const user = userCredential.user;
            localStorage.setItem('loggedInUserId', user.uid);
            window.location.href = 'lobby.html';
        })
        .catch((error) => {
            const errorCode = error.code;
            if (errorCode === 'auth/wrong-password') {
                showMessage('Incorrect Email or Password', 'signInMessage');
            } else if (errorCode === 'auth/user-not-found') {
                showMessage('Account does not Exist', 'signInMessage');
            } else {
                showMessage('Error: ' + error.message, 'signInMessage');
            }
        });
});

// Password Reset
const reset = document.getElementById("resetPassword"); // Assuming your reset button has id="resetPassword"
reset.addEventListener("click", function (e) {
    e.preventDefault();
    const email = document.getElementById('email').value;

    if (!email) {
        alert('Please enter your email address');
        return;
    }

    sendPasswordResetEmail(auth, email)
        .then(() => {
            alert('Password reset email sent to ' + email);
        })
        .catch((error) => {
            if (error.code === 'auth/user-not-found') {
                alert('No user found with this email address.');
            } else {
                alert('Error: ' + error.message);
            }
        });
});

// Google login button
const googleLoginBtnSignin = document.getElementById("google-login-btn-signin");
googleLoginBtnSignin.addEventListener("click", function (e) {
    e.preventDefault(); // Prevent default action
    signInWithPopup(auth, provider)
        .then((result) => {
            // This gives you a Google Access Token
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken; // Access token if you need to make API calls

            // The signed-in user info
            const user = result.user;
            console.log("User Info:", user);
            console.log("Google ID:", user.uid); // Log Google ID (UID)

            // Redirect to another page after login
            window.location.href = "./lobby.html";
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error(`Error (${errorCode}): ${errorMessage}`); // Log error details
        });
});

// Facebook login button
const facebookLoginBtnSignin = document.getElementById("facebook-login-btn-signin");
facebookLoginBtnSignin.addEventListener("click", function (e) {
    e.preventDefault();
    alert("Facebook login clicked on Signin!");
});

// GitHub login button
const githubLoginBtnSignin = document.getElementById("github-login-btn-signin");

githubLoginBtnSignin.addEventListener("click", function (e) {
    e.preventDefault();

    const provider = new GithubAuthProvider();
    
    signInWithPopup(auth, provider)
        .then((result) => {
            // This gives you a GitHub Access Token. You can use it to access the GitHub API.
            const credential = GithubAuthProvider.credentialFromResult(result);
            const token = credential.accessToken; // Get the access token.
            const user = result.user; // Get the signed-in user.

            console.log("User signed in:", user);
            console.log("Access Token:", token);

            // Redirect to the lobby page after successful login.
            window.location.href = "./lobby.html";
        })
        .catch((error) => {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            const email = error.customData?.email; // Use optional chaining to avoid errors if email is undefined.
            const credential = GithubAuthProvider.credentialFromError(error);

            console.error("Error during GitHub login:", {
                errorCode,
                errorMessage,
                email,
                credential
            });

            // Optionally display an error message to the user.
            alert(`Login failed: ${errorMessage}`);
        });
});
function logout(){
    firebase.auth().signOut().then(()=>{
        console.log("User signed out");
        window.location.href = "./homepage_signin.html";

    }).catch(e=>{
        console.log(e)
    })
}



document.getElementById("signuppage_btn").style.color="black"
