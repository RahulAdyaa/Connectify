//when we join a channel , there is gonna be an event listener just like we had client on user publish
let handleMemberJoined= async(MemberId)=>{
    console.log('A New Member has joined the room:',MemberId)
    addMemberToDom(MemberId)

    let members= await channel.getMembers()
    updatemembertotal(members)
    let{name} = await rtmclient.getUserAttributesByKeys(MemberId,['name']) // destructuring the return value that is name here
    addBotmessagetoDOM(`Welcome to the room ${name}! 👋`)
}

let addMemberToDom = async (MemberId)=>{
    let{name} = await rtmclient.getUserAttributesByKeys(MemberId,['name']) // destructuring the return value that is name here
    let membersWrapper=document.getElementById('member__list')
    let MemberItem = `<div class="member__wrapper" id="member__${MemberId}__wrapper">
                        <span class="green__icon"></span>
                        <p class="member_name">${name}</p>
                    </div>`

    membersWrapper.insertAdjacentHTML('beforeend',MemberItem)
}
let updatemembertotal=async(members)=>{
   
    let total = document.getElementById('members__count')
    total.innerText=members.length
}


let handleMemberLeft=async(MemberId)=>{
    removeMemberfromDOM(MemberId)

    let members= await channel.getMembers()
    updatemembertotal(members)

}
let removeMemberfromDOM=async(MemberId)=>{
    let memberWrapper=document.getElementById(`member__${MemberId}__wrapper`)
    let name=memberWrapper.getElementsByClassName('member_name')[0].textContent
    
    addBotmessagetoDOM(` ${name} has left the room 👋`) // sending message to everyone that someone left the room
    memberWrapper.remove()
    
}

let getMembers=async()=>{
    let members=await channel.getMembers() // for showing your own id when you enter
    updatemembertotal(members)
    for(let i=0 ; members.length>i;i++){
        addMemberToDom(members[i])
    }
}

//adding functionality of delivering messages

let handleChannelMessage = async (messageData,MemberId)=>{
    console.log('A new message was received')
    let data=JSON.parse(messageData.text)//parsing the JSON into text format
    // console.log('Message Data: ',data);

    //for remote users to actually see the chats
    if(data.type ==='chat'){
        addmessagetoDOM(data.displayname,data.message)
    }

    if(data.type==='user_left')
    {
        document.getElementById(`user-container-${data.uid}`).remove()

        for(let i=0 ; videoFrames.length>i;i++){
            {
                videoFrames[i].style.height='300px'
                videoFrames[i].style.width='300px'
            } 
        }
    }

}
let sendMessage = async(e) =>{
    e.preventDefault()

    let message=e.target.message.value
    channel.sendMessage({text:JSON.stringify({'type':'chat','message':message,'displayname':displayName})})
    addmessagetoDOM(displayName,message)
    e.target.reset()
}


let addmessagetoDOM = (name,message)=>{
    let messagesWrapper =document.getElementById('messages')

    let newmessage=`  <div class="message__wrapper">        
                <div class="message__body">
                    <strong class="message__author">${name}👋</strong>
                    <p class="message__text">${message}</p>
                </div>
            </div>`

    messagesWrapper.insertAdjacentHTML('beforeend',newmessage)

    let lastmessage=document.querySelector('#messages .message__wrapper:last-child')
    if(lastmessage)
    {
        lastmessage.scrollIntoView()
    }
}

let addBotmessagetoDOM = (botmessage)=>{
    let messagesWrapper =document.getElementById('messages')

    let newmessage=`<div class="message__wrapper">
                    <div class="message__body__bot">
                        <strong class="message__author__bot">🤖WESTUDY Bot</strong>
                        <p class="message__text__bot">${botmessage}</p>
                    </div>
                </div>`

    messagesWrapper.insertAdjacentHTML('beforeend',newmessage)

    let lastmessage=document.querySelector('#messages .message__wrapper:last-child')
    if(lastmessage)
    {
        lastmessage.scrollIntoView()
    }
}


let leaveChannel=async()=>{
    await channel.leave()
    await rtmclient.logout()
}
//event listenener for message functionality


window.addEventListener('beforeunload',leaveChannel)
let messageForm=document.getElementById('message__form')
messageForm.addEventListener('submit',sendMessage)
