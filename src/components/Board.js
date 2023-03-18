import React, { useState, useMemo, useLayoutEffect } from "react";
import { DragDropContext} from "react-beautiful-dnd";
import useAutoMoveSensor from "../lib/useAutoMoveSensor";
import supabase from "./config/supabaseClient"
//import { GameState } from "../types/game";
import { checkCorrect, preloadImage, getRandomItem } from "../lib/items";
import NextItemList from "./next-item-list";
import PlayedItemList from "./played-item-list";
import styles from "../styles/board.module.scss";
import Hearts from "./Hearts";
import GameOver from "./Game-over";

export default function Board(props) {
  const { highscore, resetGame, state, setState, updateHighscore, date, updatedate,updatePlayed} = props;

  const [isDragging, setIsDragging] = useState(false);
  
  async function onDragStart() {
    setIsDragging(true);
    navigator.vibrate(20);
  }
  async function updateSupbaseScores(x,today){
    const {data,error} = await supabase.from('userData').update({scores:x}).eq('id',today).select()
    console.log(data,error);
  }
  async function onDragEnd(result) {
    setIsDragging(false);

    const { source, destination } = result;

    if (
      !destination ||
      state.next === null ||
      (source.droppableId === "next" && destination.droppableId === "next")
    ) {
      return;
    }

    const item = { ...state.next };

    if (source.droppableId === "next" && destination.droppableId === "played") {
      const newDeck = [...state.deck];
      const newPlayed = [...state.played];
      const { correct, delta } = checkCorrect(
        newPlayed,
        item,
        destination.index
      );
      newPlayed.splice(destination.index, 0, {
        ...state.next,
        played: { correct },
      });

      const newNext = state.nextButOne;
      const newNextButOne = getRandomItem(
        newDeck,
        newNext ? [...newPlayed, newNext] : newPlayed
      );
      const newImageCache = [preloadImage(newNextButOne.image)];

      setState({
        ...state,
        deck: newDeck,
        imageCache: newImageCache,
        next: newNext,
        nextButOne: newNextButOne,
        played: newPlayed,
        lives: correct ? state.lives : state.lives - 1,
        badlyPlaced: correct
          ? null
          : {
              index: destination.index,
              rendered: false,
              delta,
            },
      });
    } else if (
      source.droppableId === "played" &&
      destination.droppableId === "played"
    ) {
      const newPlayed = [...state.played];
      const [item] = newPlayed.splice(source.index, 1);
      newPlayed.splice(destination.index, 0, item);

      setState({
        ...state,
        played: newPlayed,
        badlyPlaced: null,
      });
    }
    if(state.lives===0){
      //updatedate();
      var today = new Date();
      var dd = String(today.getDate()).padStart(2,'0');
      var mm = String(today.getMonth()+1).padStart(2,'0');
      var yyyy = today.getFullYear();
      today = mm+'/'+dd+'/'+yyyy;
      localStorage.setItem("date",today);
      let {data, error} = await supabase
      .from('userData')
      .select('*').eq('id',today);
  
      if(error){
          console.log("error")
      }
      if(data){
        console.log(data);
        if(data.length===0){
          console.log("this working")
          const {data, error} =  supabase
          .from('userData')
          .insert({id: today})
          console.log(data,error)
          
        }
        else{
          console.log(data[0].scores)
          let x = data[0].scores;
          x[score] = x[score]+1;
          console.log(x);
          
          updateSupbaseScores(x,today);
          updatePlayed();
        }
        
      }
      updatedate();
    }
  }

  // Ensure that newly placed items are rendered as draggables before trying to
  // move them to the right place if needed.
  useLayoutEffect(() => {
    if (
      state.badlyPlaced &&
      state.badlyPlaced.index !== null &&
      !state.badlyPlaced.rendered
    ) {
      setState({
        ...state,
        badlyPlaced: { ...state.badlyPlaced, rendered: true },
      });
    }
  }, [setState, state]);

  const score = useMemo(() => {
    return state.played.filter((item) => item.played.correct).length - 1;
  }, [state.played]);

  useLayoutEffect(() => {
    if (score > highscore) {
      updateHighscore(score);
    }
  }, [score, highscore, updateHighscore]);
  return (
    <DragDropContext
      onDragEnd={onDragEnd}
      onDragStart={onDragStart}
      sensors={[useAutoMoveSensor.bind(null, state)]}
    >
      <div className={styles.wrapper}>
        <div className={styles.top}>
          <Hearts lives={state.lives} />
          {state.lives > 0 ? (
            <>
              <NextItemList next={state.next} />
            </>
          ) : (
            <GameOver
              highscore={highscore}
              resetGame={resetGame}
              score={score}
              date={date}
            />
          )}
        </div>
        <div id="bottom" className={styles.bottom}>
          <PlayedItemList
            badlyPlacedIndex={
              state.badlyPlaced === null ? null : state.badlyPlaced.index
            }
            isDragging={isDragging}
            items={state.played}
          />
        </div>
      </div>
    </DragDropContext>
  );
}