import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import styled from "styled-components";
import { CookiesProvider, Cookies,useCookies } from 'react-cookie';
import{ Card, List, ListItem,Button,Typography, Grid, Divider, ListItemText} from '@material-ui/core';
import { v1 as uuid } from "uuid";
require('dotenv').config();

const Container = styled.div`
    padding: 20px;
    display: flex;
    height: 100vh;
    width: 90%;
    margin: auto;
    flex-wrap: wrap;
`;

const StyledVideo = styled.video`
    height: 40%;
    width: 50%;
`;

const Video = (props) => {
    const ref = useRef();

    useEffect(() => {
        props.peer.peer.on("stream", stream => {
            ref.current.srcObject = stream;
        })
    });

    return (
        <div>
            <StyledVideo playsInline autoPlay ref={ref} style={{width:100+'%'}} />
            <Typography>{props.peer.name}</Typography>
        </div>
        
    );
}


const videoConstraints = {
    height: window.innerHeight / 2,
    width: window.innerWidth / 2
};

const AudioChannel = (props) => {

    const cookies = new Cookies();
    const userCookie=cookies.get('userCookie');

    const videoChat_server_url=process.env.REACT_APP_VIDEO_SERVER_URL;

    const [isAudio,setAudio]=useState(false);
    const [peers, setPeers] = useState([]);
    const socketRef = useRef();
    const userVideo = useRef();
    const peersRef = useRef([]);
    const roomID = props.room;

    const userDetail={
        room:roomID,
        name:userCookie.name,
        GID:userCookie.GID
    }

    console.log("On Top : ",peers);

    useEffect(()=>{
         window.onbeforeunload =()=>{
            if(socketRef.current){
                socketRef.current.close();
            } 
            setPeers([]);
         }
    })

    const wantsToJoin=()=>{
        socketRef.current = io.connect(`${videoChat_server_url}/`);
        navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: true }).then(stream => {
            userVideo.current.srcObject = stream;
            socketRef.current.emit("join room", userDetail);
            socketRef.current.on("all users", users => {
                const peers = [];
                users.forEach(user => {
                    const peer = createPeer(user.socketID, socketRef.current.id, stream);
                    peersRef.current.push({
                        peerID: user.socketID,
                        peer,
                        name:user.name,
                        GID:user.GID
                    })
                    peers.push(peer);
                })
                setPeers(peers);
            })

            socketRef.current.on("user joined", payload => {
                const peer = addPeer(payload.signal, payload.callerID, stream);
                peersRef.current.push({
                    peerID: payload.callerID,
                    peer,
                    name:payload.name,
                    GID:payload.GID
                })

                setPeers(users => [...users, peer]);
            });

            socketRef.current.on("receiving returned signal", payload => {
                const item = peersRef.current.find(p => p.peerID === payload.id);
                item.peer.signal(payload.signal);
            });

            socketRef.current.on("user left",id=>{
                console.log("Called...");
                const peerObj=peersRef.current.find(p=>p.peerID===id);
                if(peerObj){
                    peerObj.peer.destroy();
                }
                let remaining=[];
                peersRef.current.forEach(row=>{
                    if(row.peerID!==id){
                        remaining.push(row.peer);
                    }
                })
                const peers = peersRef.current.filter(p=>p.peerID!==id);
                peersRef.current=peers;
                setPeers(remaining);
            })

        })
    }

    const username=process.env.REACT_APP_USER_NAME;
    const credential=process.env.REACT_APP_CREDENTIAL;
    const stun_url=process.env.REACT_APP_STUN;
    const turn_url=process.env.REACT_APP_TURN;

    console.log("Changed : ",username,credential);

     function createPeer(userToSignal, callerID, stream) {
        const peer = new Peer({
            initiator: true,
            trickle: false,
              config: {
                iceServers: [{   
                    urls: [ stun_url ]
                }, 
                {   
                    username,   
                    credential,   
                    urls: [       
                        `${turn_url}:80?transport=udp`,            
                        `${turn_url}:443?transport=tcp`,        
                    ]
                }],
            },
            stream,
        });


        peer.on("signal", signal => {
            socketRef.current.emit("sending signal", { userToSignal, callerID, signal,name:userCookie.name, GID:userCookie.GID })
        })

        return peer;
    }

    function addPeer(incomingSignal, callerID, stream) {
        const peer = new Peer({
            initiator: false,
            trickle: false,
              config: {
                iceServers: [{   
                    urls: [ stun_url ]
                }, 
                {   
                    username,   
                    credential,   
                    urls: [       
                        `${turn_url}:80?transport=udp`,            
                        `${turn_url}:443?transport=tcp`,   
                    ]
                }],
            },
            stream,
        })

        peer.on("signal", signal => {
            socketRef.current.emit("returning signal", { signal, callerID })
        })

        peer.signal(incomingSignal);

        return peer;
    }

    const HandleAudio=()=>{
        //Wants To Leave
        if(isAudio){
            window.location.reload();
        }
        //Wants to Join
        else{
            wantsToJoin();
            setAudio(true);
        }

    }
   
    return (
         <Container style={{height:90+'vh'}}>
            <List>
                <ListItem>
                    <Button variant="contained" color="primary" onClick={HandleAudio}>
                        {isAudio?"Leave Stream":"Join Stream"}
                    </Button>
                    </ListItem>

                    {isAudio?<List>
                    <ListItem className="video-list">
                        <div>
                            <StyledVideo muted playsInline autoPlay ref={userVideo} style={{width:100+'%'}}/>
                            {console.log("Log : ",peers,peersRef.current)}
                            <Typography>You</Typography>
                        </div>
                    </ListItem>
                            {console.log('PeerRef : ',peersRef.current)}
                            {peersRef.current.map((peer, index) => {
                            return (

                                <ListItem className="video-list" key={peer.peerID}>
                                    <Video key={peer.peerID} peer={peer} />
                                </ListItem>
                            );
                        })}
                        </List>:null}
            </List> 
           
            
        </Container>
    );
};





export default AudioChannel;
