const APP_ID = "16d2a74913534e69b3e6b6560d8cfeac"

let uid = sessionStorage.getItem('uid')
if (!uid) {
    uid = String(Math.floor(Math.random() * 10000))
    sessionStorage.setItem("uid", uid)
}

let token = null;
let client;

let rtmclient;
let channel;



const querystring = window.location.search;
const urlparams = new URLSearchParams(querystring);

let roomid = urlparams.get('room');

if (!roomid) {
    roomid = 'main';
}
let displayName=sessionStorage.getItem('display_name') // if we have been to the website before , then no need to will it again , it will be stored in the local storage
if(!displayName)
{
    window.location='lobby.html' //without display name , no will allowed
}

let localtracks = [];
let remoteusers = {};
let localScreenTracks;
let sharingScreen=false;


let joinroominit = async () => {

    rtmclient = await AgoraRTM.createInstance(APP_ID)
    await rtmclient.login({uid,token})

    await rtmclient.addOrUpdateLocalUserAttributes({'name':displayName});

    channel= await rtmclient.createChannel(roomid)
    await channel.join()



    channel.on('MemberJoined',handleMemberJoined)
    channel.on('MemberLeft',handleMemberLeft)
    channel.on('ChannelMessage',handleChannelMessage)

    getMembers()
    addBotmessagetoDOM(`Welcome to the room    ${displayName}! 👋`)

    client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    await client.join(APP_ID, roomid, token, uid);
    

    client.on('user-published' , handleUserPublished)
    client.on('user-left' , handleuserleft)

}

let joinstream = async () => {
    document.getElementById('join-btn').style.display="none"
    document.getElementsByClassName('stream__actions')[0].style.display='flex'
    localtracks = await AgoraRTC.createMicrophoneAndCameraTracks({},{encoderConfig:{
        width:{min:640,ideal:1280,max:1280},
        height:{min:480,ideal:720,max:720}
    }});//first for audio and second for the video


    let player = `<div class="video__container" id="user-container-${uid}">
                    <div class="video-player" id="user-${uid}"></div>
                  </div>`

    document.getElementById('streams__container').insertAdjacentHTML('beforeend', player)
    document.getElementById( `user-container-${uid}` ).addEventListener('click',expandVideoFrame)
    localtracks[1].play(`user-${uid}`)
    await client.publish([localtracks[0],localtracks[1]])
}

let switchToCamera = async() =>{
    let player = `<div class="video__container" id="user-container-${uid}">
                    <div class="video-player" id="user-${uid}"></div>
                  </div>`
    displayFrame.insertAdjacentHTML('beforeend', player)
    await localtracks[0].setMuted(true)
    await localtracks[1].setMuted(true)

    document.getElementById('mic-btn').classList.remove('active')
    document.getElementById('screen-btn').classList.remove('active')

    localtracks[1].play(`user-${uid}`)
    await client.publish([localtracks[1]]) //publishing video track

}

let handleUserPublished = async(user , mediaType) =>{
    remoteusers[user.uid]= user
    await client.subscribe(user , mediaType)
    let player=document.getElementById(`user-container-${user.uid}`)
    if(player === null)
    {
        player= `<div class="video__container" id="user-container-${user.uid}">
                <div class="video-player" id="user-${user.uid}"></div>
                </div>`
        document.getElementById('streams__container').insertAdjacentHTML('beforeend', player)
        document.getElementById( `user-container-${user.uid}` ).addEventListener('click',expandVideoFrame)

    }
    if(displayFrame.style.display){
        let videoFrames=document.getElementById(`user-container-${user.uid}`)
        videoFrames.style.height='100px' 
        videoFrames.style.width='100px'
    }

    if(mediaType == 'video'){
        user.videoTrack.play(`user-${user.uid}`)
    }
    if(mediaType ==='audio')
    {
        user.audioTrack.play()
    }
}

function addAudioPlayer(uid){
}

let handleuserleft = async(user)=>
{
    delete remoteusers[user.uid]
let item=document.getElementById(`user-container-${user.uid}`)
if(item)
{
    item.remove()
}

    document.getElementById(`user-container-${user.uid}`).remove()
    //whenever the user leaves , it should also remove the space it was occupying in the stream box
    if(userIdInDisplayFrame === `user-container-${user.uid}`)
    {
        displayFrame.style.display=null
        let videoFrames =  document.getElementsByClassName('video__container')
        for(let i=0 ; videoFrames.length>i;i++)
        {
            videoFrames[i].style.height='300px'
            videoFrames[i].style.width='300px'
        }
        
    }
}

let toggleCamera = async (e) =>
{
    let button=e.currentTarget

    if(localtracks[1].muted)
    {
        await localtracks[1].setMuted(false)// if its currently muted , we are gonna unmute it
        button.classList.add('active')
    }
    else{
        await localtracks[1].setMuted(true)// if its currently not muted , we are gonna mute it
        button.classList.remove('active')
    }
}

let toggleMic = async (e) =>
{
    let button=e.currentTarget

    if(localtracks[0].muted)
    {
        await localtracks[0].setMuted(false)// if mic currently muted , we are gonna unmute it
        button.classList.add('active')
    }
    else{
        await localtracks[0].setMuted(true)// if mic currently not muted , we are gonna mute it
        button.classList.remove('active')
    }
}
let toggleScreen = async(e) =>{
    let screenButton = e.currentTarget
    //if we need to publish the scrren , we need to let the camera go away so that the screen could be shared 
    let cameraButton = document.getElementById('camera-btn')
    if(!sharingScreen)
    {
        sharingScreen=true

        screenButton.classList.add('active')//to add a class to that button
        cameraButton.classList.remove( 'active' ) //removing the active class from the video button so user can see whats which is active  
        cameraButton.style.display='none'
        
        //we will get the stream of our screen and then addtrack with this stream in which we have added a new track //hide the video from the frontend when sharing
        localScreenTracks= await AgoraRTC.createScreenVideoTrack()  //creating the video track for the screen share
        document.getElementById(`user-container-${uid}`).remove()
        displayFrame.style.display='block'

        let player= `<div class="video__container" id="user-container-${uid}">
                <div class="video-player" id="user-${uid}"></div>
                </div>`
        displayFrame.insertAdjacentHTML('beforeend',player)
        document.getElementById( `user-container-${uid}` ).addEventListener('click',expandVideoFrame)
        userIdInDisplayFrame = `user-container-${uid}`
        localScreenTracks.play(`user-${uid}`) // playing the video in specified container 

        await client.unpublish([localtracks[1]])
        await client.publish([localScreenTracks])

        let videoFrames=document.getElementsByClassName("video-player").getElementsByClassName('video__container')
        for(let i=0; i<videoFrames.length; i++)
        {
            if(videoFrames[i].id!=userIdInDisplayFrame)
            {
            videoFrames[i].style.height='100px'
            videoFrames[i].style.width='100px'
            }
    
        }
    }   
    else{
        sharingScreen=false
        cameraButton.style.display='block'
        document.getElementById(`user-container-${uid}`).remove()
        await client.unpublish([localScreenTracks])

        switchToCamera()
    }
}

let leavestream=async(e)=>{
    //when user wnts to leave the streaming mode
    e.preventDefault()
    document.getElementById('join-btn').style.display="block"
    document.getElementsByClassName('stream__actions')[0].style.display='none'

    //to turn off the tracks that are video , audio
    for(let i=0;localtracks.length > i ;i++){
        localtracks[i].stop()
        localtracks[i].close() //stop and close the tracks

    }
    //to unpublish the local tracks ie audio and video
    await client.unpublish([localtracks[0],localtracks[1]])
    if(localScreenTracks)
    {
        await client.unpublish([localScreenTracks])

    }
    document.getElementById(`user-container-${uid}`).remove()
    if(userIdInDisplayFrame===`user-container-${uid}`){
        displayName.style.display=null

        for(let i=0 ; videoFrames.length>i;i++)
            {
                videoFrames[i].style.height='300px'
                videoFrames[i].style.width='300px'
            } 
        }
    channel.sendMessage({text:JSON.stringify({'type':'user_left','uid':uid})})
}

document.getElementById('camera-btn').addEventListener('click', toggleCamera)
document.getElementById('mic-btn').addEventListener('click', toggleMic)
document.getElementById('screen-btn').addEventListener('click', toggleScreen)

document.getElementById('join-btn').addEventListener('click',joinstream)
document.getElementById('leave-btn').addEventListener('click',leavestream)
joinroominit()