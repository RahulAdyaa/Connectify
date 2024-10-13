let form =document.getElementById('lobby__form')


//get name from local storage
let displayName=sessionStorage.getItem('display_name') // if we have been to the website before , then no need to will it again , it will be stored in the local storage
if(displayName)
{
    form.name.value=displayName // can check by going into inspect and then under applications , session storage , local storage
}

form.addEventListener('submit', (e)=>{
    e.preventDefault()  //taking care of all the funtionality that occurs when the form is submitted

        sessionStorage.setItem('display_name',e.target.name.value)
    let inviteCode = e.target.room.value
    if(!inviteCode)
    {
        inviteCode=String(Math.floor(Math.random()*10000))
    }

    window.location = `room.html?room=${inviteCode}`
})