const logoutbtn=document.getElementById('logout_btn');

logoutbtn.addEventListener('click',()=>{
    const loggedInUserId=document.getElementById('loggedInUserId')
    localStorage.removeItem('loggedInUserId');

})