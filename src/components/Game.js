import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

//import { GameState } from "../types/game";
//import { Item } from "../types/item";
import createState from "../lib/create-state";
import Board from "./Board";
import Loading from "./Loading";
import Instructions from "./Instructions";
//import badCards from "../lib/bad-cards";
import supabase from "./config/supabaseClient"
import DropDown from "./DropDown";

import Canva from "./Canva";

export default function Game() {
  var today = new Date();
  //today.setDate(today.getDate()-1);
  var dd = String(today.getDate()).padStart(2,'0');
  var mm = String(today.getMonth()+1).padStart(2,'0');
  var yyyy = today.getFullYear();
  today = mm+'/'+dd+'/'+yyyy;
  
  const [state, setState] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [started, setStarted] = useState(false);
  const [items, setItems] = useState(null);
  const [date, setdate] = useState(localStorage.getItem("date")?localStorage.getItem("date"):"null")
  const [playedToday, setPlayedToday] = useState(today===localStorage.getItem("date")?true:false)
  const [questions, setQuestions] = useState(null);
  const [countries, setCountries] = useState(new Set(['United States', 'China', 'United Kingdom', 'Germany', 'Canada', 'India', 'Japan', 'France', 'Russia', 'Italy', 'Switzerland', 'Spain', 'Sweden', 'Netherlands', 'Israel', 'United Arab Emirates', 'Saudi Arabia', 'Belgium', 'Thailand', 'Pakistan', 'Iran', 'Portugal', 'South Korea']));
  //const suffList = ['%','Billion gallons','Fahrenheit','GW.h','Gigawatt-hours','MW','Megawatt-hours','Million units','Terawatt-hours','billion tons','cm','cycles','degree celcius','degree celsius','degree fahrenheit','females','houses','inches','kilo metres','km square','metres','micrograms per cubic metre','million litres','million terajoules','mm','people','thousand tons','tons','years']
 
  useEffect(() => {
    //setdate(localStorage.getItem("date")?localStorage.getItem("date"):"null")
    /*console.log(localStorage.getItem("date"))
    console.log(date);
    console.log(playedToday);*/
    const fetchQuestion= async ()=>{
      const suffs = ['people', '%', 'US $', 'tonnes', 'years','kWh/person']
      const tag = suffs[Math.floor(Math.random()*suffs.length)]
      //console.log(tag);
      const {data, error} = await supabase
      .from('ourWorld')
      .select('*').eq('suffix',tag);
  
      if(error){
          console.log("error")
          
      }
      
      if(data){
        const x =data;
        /*const quesArray = [];
        const  num = Math.floor(Math.random()*suffList.length);
        const reqTag = suffList[num];
        for(let i=0; i<x.length; i++){
          if(x[i].suffix===reqTag){
            quesArray.push(x[i]);
          }
        }*/
        setQuestions(x);
        //console.log(data);
      }
    }
    const fetchGameData = async () => {
      //setdate(localStorage.getItem("date")?localStorage.getItem("date"):"null")
      const res = await axios.get(
        "https://wikitrivia-data.tomjwatson.com/items.json"
      );
      const items = res.data
        .trim()
        .split("\n")
        .map((line) => {
          return JSON.parse(line);
        })
        // Filter out questions which give away their answers
        .filter((item) => !item.label.includes(String(item.year)))
        .filter((item) => !item.description.includes(String(item.year)))
        .filter((item) => !item.description.includes(String("st century" || "nd century" || "th century")))
        // Filter cards which have bad data as submitted in https://github.com/tom-james-watson/wikitrivia/discussions/2
        ;
      setItems(items);
    };

    fetchGameData();
    fetchQuestion();
  },[]);

  useEffect(() => {
    const createStateAsync = async() => {
      if (questions !== null) {
        setState(await createState(questions));
        setLoaded(true);
        //setCount(1);
        //console.log("working")
      }
    };
    
   createStateAsync();
  
    
    
    
  }, [questions]);
  const startGame = async ()=>{
    document.getElementById("load").style.display = "block";
    const arr = []
    let x = 0;
    const countryArr = Array.from(countries);
    for(let i=0; i<countryArr.length; i++){
      const countr = countryArr[i];
      for(let j=0; j<questions.length; j++){
        if(questions[j].country===countr){
          arr.push(questions[j]);
          //console.log(arr[x]);
          if(arr[x].answer>9999 && arr[x].answer<999999){
            arr[x].answer = (arr[x].answer/1000).toFixed(1);
            //console.log(arr[x].answer);
            arr[x].answer = arr[x].answer*1000;
          }
          else if(arr[x].answer>999999 && arr[x].answer<999999999){
            arr[x].answer = (arr[x].answer/1000000).toFixed(1);
            arr[x].answer = arr[x].answer*1000000;
          }
          else if(arr[x].answer>999999999 && arr[x].answer<999999999999){
            arr[x].answer = (arr[x].answer/1000000000).toFixed(1);
            arr[x].answer = arr[x].answer*1000000000;
          }
          x=x+1;
        }
      }
      
      setQuestions(arr);
      console.log(arr.length);
      //pickRandomques(arr,today);
    // eslint-disable-next-line
    const {data,error} = await supabase.from("dailyQues").select('*').eq("id",today);
    //console.log("data",data,error)
    if(data.length===0){
      if(arr.length>21){
      const copiedArray = arr.slice();
      const shuffled = copiedArray.sort(()=>0.5-Math.random());
      console.log(shuffled.slice(0,21),"shuffled");
      const {data,error} = await supabase.from('dailyQues').insert({"id":today,"ques":shuffled.slice(0,21)}).select()
      console.log(data,error);
      }
      //pickRandomques(arr,today);
    }
    else{
      //setLoaded(false);
      //console.log("false set hua");
      
      const x = data[0].ques;
      setQuestions(x);
      //setLoaded(true);
      //console.log("true hua")
    }
      console.log(questions.length);
    }
    
    setStarted(true);

  }
  
  const setRandomques=async(arr,today)=>{
    const copiedArray = arr.slice();
    const shuffled = copiedArray.sort(()=>0.5-Math.random());
    console.log(shuffled.slice(0,21),"shuffled");
    const {data,error} = await supabase.from('dailyQues').insert({"id":today,"ques":shuffled.slice(0,21)}).select()
    console.log(data,error);
    //return data;
    setQuestions(data);
  }
  // eslint-disable-next-line
  const pickRandomques=async(arr,today)=>{
    const {data,error} = await supabase.from("dailyQues").select('*').eq("id",today);
    console.log("data",data,error)
    if(data.length===0){
      setRandomques(arr,today)
    }
    else{
      //setLoaded(false);
      //console.log("false set hua");
      const x = data[0].ques;
      setQuestions(x);
      //setLoaded(true);
      //console.log("true hua")
    }
  }
  const resetGame = useCallback(() => {
    const resetGameAsync = async () => {
      window.location.reload();
      if (items !== null) {
        setState(await createState(questions));
      }
      //window.location.reload();
    };

    resetGameAsync();
    
  }, [questions,items]);
  
  const [highscore, setHighscore] = useState(
    Number(localStorage.getItem("highscore") ?? "0")
  );

  const updateCountries = useCallback((countrySet)=>{
    setCountries(countrySet);
    console.log(countries)
    
  },[countries])
  const updateHighscore = useCallback((score) => {
    localStorage.setItem("highscore", String(score));
    setHighscore(score);
  }, []);
  const updatedate = useCallback(()=>{
    var today = new Date();
    var dd = String(today.getDate()).padStart(2,'0');
    var mm = String(today.getMonth()+1).padStart(2,'0');
    var yyyy = today.getFullYear();
    today = mm+'/'+dd+'/'+yyyy;
    console.log("year",today);
    localStorage.setItem("date",today);
    setdate(today);
  },[])
  const updatePlayed = useCallback(()=>{
    setPlayedToday(true);
  },[])
  if (!loaded || state === null) {
    return <Loading />;
  }
  if(playedToday){
    return(
      <>
      
      <div style={{marginLeft:"auto",marginRight:"auto", marginTop:"10px",width:"70%"}}><Canva/></div>
      
      
      </>
    )

  }

  if (!started) {
    return (
      <>
      <Instructions highscore={highscore} start={startGame} />
      <div id="dropdown" style={{display:"none"}}><DropDown countries={countries} updateCountries={updateCountries}/></div>
      
      <div id="load" style={{display:"none", color:"white", marginTop:"10px"}}>Loading cards...</div>
      </>
    );
  }

  return (
    <>
    {loaded?(
      <Board
      highscore={highscore}
      state={state}
      setState={setState}
      resetGame={resetGame}
      updateHighscore={updateHighscore}
      date={date}
      updatedate = {updatedate}
      updatePlayed = {updatePlayed}
    />
    ):
  (
    <Loading/>
  )
  }
    </>
  );
}
