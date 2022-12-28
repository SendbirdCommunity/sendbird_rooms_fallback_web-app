import "./styles.css";
import SendBirdCall from "sendbird-calls"

const getRoomDetailButton = document.getElementById('get_room_details');
getRoomDetailButton.addEventListener('click', () => init())

const getRoomDetails = () => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const encodedBase64UrlParams = urlParams.get('data')
    const decodedBase64UrlParams = atob(encodedBase64UrlParams)
    return JSON.parse(decodedBase64UrlParams)
}

const init = async () => {

    const decodedUrlDataParam = getRoomDetails();
    initSendbirdRoom(decodedUrlDataParam.app_id)
    const authenticated = await authenticateSendbirdRoom(decodedUrlDataParam)
    if (authenticated) {
        console.log("Authenticated!")
        await enterSendBirdRoom(decodedUrlDataParam);
    }
}


const initSendbirdRoom = (appId) => SendBirdCall.init(appId)

const authenticateSendbirdRoom = async (decodedUrlDataParam) => {
    try {
        await SendBirdCall.authenticate({
            userId: decodedUrlDataParam.service_user_id,
            accessToken: decodedUrlDataParam.creds.token
        })
        return await SendBirdCall.connectWebSocket().then(() => true).catch((e) => false)
    } catch (e) {
        return false
    }
}

const enterSendBirdRoom = async (decodedUrlDataParam) => {
    const enterParams = {videoEnabled: true, audioEnabled: true};
    const localMediaView = document.getElementById('local_video_element_id');
    try {
        console.log(decodedUrlDataParam)
        const room = await SendBirdCall.fetchRoomById(decodedUrlDataParam.room_id)
        await room.enter(enterParams);
        // Set local media view.
        room.localParticipant.setMediaView(localMediaView);
        // Called when a remote participant is connected to the media stream and starts sending the media stream.
        // Other room events are available. https://sendbird.com/docs/calls/v1/javascript/guides/group-call#2-handle-events-in-a-room-3-receive-events-on-enter-and-exit
        room.on('remoteParticipantStreamStarted', (remoteParticipant) => console.log("participant entered"))
        return
    } catch (e) {
        console.log(e)
    }
}




