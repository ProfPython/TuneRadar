import React, { useEffect, useRef, useState } from "react";
import YouTube from "react-youtube";
import styles from "./styles/YoutubeViewer.module.css";

const YoutubeViewer = (props) => {
  const [activeVideoID, setActiveVideoID] = useState(null);
  const players = useRef({});

  // State to store the recently searched music
  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    // Check if there are any new matches that need to be added to the recent searches
    if (props.matches.length > 0) {
      const validMatches = props.matches.filter((match) => match.YouTubeID);
      
      if (validMatches.length > 0) {
        // Add the latest search to the recentSearches state, ensuring no duplicates
        setRecentSearches((prevSearches) => {
          const newSearch = validMatches[0]; 
          const updatedSearches = [newSearch, ...prevSearches]; // Add the new search to the beginning
          
          // Remove duplicates 
          return updatedSearches.filter((value, index, self) =>
            index === self.findIndex((t) => (
              t.SongTitle === value.SongTitle && t.SongArtist === value.SongArtist
            ))
          );
        });
      }
    }
  }, [props.matches]);
 

  useEffect(() => {
    console.log("Received matches:", props.matches);
    if (props.matches.length > 0) {
      // Filter out matches with empty YouTubeID
      const validMatches = props.matches.filter((match) => match.YouTubeID);
  
      if (validMatches.length > 0) {
        const firstVideoID = validMatches[0].YouTubeID;
        document
          .getElementById(`slide-${firstVideoID}`)
          .scrollIntoView({ behavior: "smooth" });
        setActiveVideoID(firstVideoID);
      }
    }
  }, [props.matches]);

  const onReady = (event, videoId) => {
    players.current[videoId] = event.target;
  };

  const onPlay = (event) => {
    const videoId = event.target.getVideoData().video_id;
    setActiveVideoID(videoId);

    // Pause other videos
    Object.values(players.current).forEach((player) => {
      const otherVideoId = player.getVideoData().video_id;
      if (
        otherVideoId !== videoId &&
        player.getPlayerState() === 1 /* Playing */
      ) {
        player.pauseVideo();
      }
    });
  };

  return (
    <>
      <div className={styles.YoutubeViewer}>
        {!props.matches.length ? null : (
          <div className={styles.Slider}>
            {[ // Wrap the result of reduce() in an array
            props.matches
              .filter((match) => match.YouTubeID) // Filter out matches with empty YouTubeID
              .reduce((max, match) => (match.Score > max.Score ? match : max)) // Find the match with the highest score
          ].map((match, index) => {
              const start = (parseInt(match.Timestamp) / 1000) | 0;

              return (
                <div
                  key={index}
                  id={`slide-${match.YouTubeID}`}
                  className={styles.SlideItem}
                >
                  <YouTube
                    videoId={match.YouTubeID}
                    opts={{
                      playerVars: { start: start, rel: 0 },
                    }}
                    iframeClassName={styles.Iframe}
                    onReady={(event) => onReady(event, match.YouTubeID)}
                    onPlay={onPlay}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Recently Searched Music */}
        <div className={styles.RecentSearches}>
          <h4>Recently Searched Music</h4>
          {/* Check if there are no recent searches */}
          {recentSearches.length === 0 ? (
            <p>No matches yet, try searching for a song!</p>
          ) : (
            <ul>
            {recentSearches.map((search, index) => {
              const youtubeUrl = `https://www.youtube.com/watch?v=${search.YouTubeID}`;
              return (
                <li key={index} className={styles.RecentSearchItem}>
                  <a href={youtubeUrl} className={styles.RecentSearchLink} target="_blank" rel="noopener noreferrer">
                    <span className={styles.MusicTitle}>
                      {search.SongTitle} - {search.SongArtist}
                    </span>
                  </a>
                </li>
              );
              })}
            </ul>
          )}
        </div>
      </div>
    </>
  );
};

export default YoutubeViewer;