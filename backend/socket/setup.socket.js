import { deleteSong, getSongs, upVoteSong } from "../redis/songService.redis.js";

export const setupSocket = (io)=>{
    io.on('connection',async (socket)=>{
        console.log("A User Connected");
        /* Initial list of songs */
        try {
            const initialFetch = await getSongs();
            const parsedSongs = JSON.parse(JSON.stringify(initialFetch));
            console.log(parsedSongs);   
            socket.emit('updateTopSongs', parsedSongs)
           
        } catch (error) {
            console.error("Error fetching initial top songs", error);
        }
    
        /* Fetch Songs */
        socket.on('getSongs',async()=>{
            try {
                const songs = await getSongs();
                const parsedSongs = JSON.parse(JSON.stringify(songs));
                socket.emit('fetchSongs', parsedSongs)
                /* socket.emit('updateTopSongs', parsedSongs) */
            } catch (error) {
                console.error("Error in getSongs", error);
            }    
        })
    
        /* Delete Song */
        socket.on("deleteSong",async(videoId)=>{
            deleteSong(videoId);
            const initialFetch = await getSongs();
            const parsedSongs = JSON.parse(JSON.stringify(initialFetch));
            console.log(parsedSongs);   
            socket.emit('updateTopSongs', parsedSongs)
        })
        
        /* Upvote song */
        socket.on('upvote',async(song)=>{
            try {
                await upVoteSong(song);  // Upvote the song in Redis
                const topSongs = await getSongs();  // Fetch updated song list
                console.log("Updated Songs:", topSongs);
                
                io.emit('updateTopSongs', topSongs); 
            } catch (error) {
                console.error("error in upvoting",error)
            }
        })
    
        /* Disconnection Handling */
        socket.on('disconnect',()=>{
            console.log("A user Disconnected");
        })
    })
}