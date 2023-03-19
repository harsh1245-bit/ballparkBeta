import React, { useEffect, useState } from 'react';
import { animated, useSpring } from "react-spring";
import CanvasJSReact from './canvasjs.react';
import supabase from "./config/supabaseClient"
import styles from "../styles/canva.module.scss";

import Score from "./Score";
//var CanvasJS = CanvasJSReact.CanvasJS;
var CanvasJSChart = CanvasJSReact.CanvasJSChart;

var today = new Date();
today.setDate(today.getDate()-1);
  var dd = String(today.getDate()).padStart(2,'0');
  var mm = String(today.getMonth()+1).padStart(2,'0');
  var yyyy = today.getFullYear();
  today = mm+'/'+dd+'/'+yyyy;
export default function Canva() {
    const [histData,setHistData] = useState(new Array(20).fill(false));
    // eslint-disable-next-line
    const [showPercentile, setShowPercentile] = useState(null)
    // eslint-disable-next-line
    const [lastScore, setLastScore] = useState(localStorage.getItem("yesterdayScore")?localStorage.getItem("yesterdayScore"):null)
    const [percentile,setPercentile] = useState(0)
    const [loadingScore,setloadingScore] = useState(false)
    const animProps = useSpring({
        opacity: 1,
        from: { opacity: 0 },
        config: { duration: 500 },
      });
    useEffect(()=>{
        const fetchScores = async()=>{
            //console.log("yeaaaa")
            const {data,error} = await supabase.from('userData').select('*').eq('id',today);

            if(error){

            }
            //console.log(data,error)
            const x = data[0].scores;
            
            setHistData(x);
            setloadingScore(true);
            //localStorage.setItem("lastPlayedDate","03/17/2023")
            //localStorage.setItem("lastPlayedScore",3);
            //console.log("data",histData)
            if(localStorage.getItem("playedYesterday")==="true"){
                setShowPercentile(true);
                console.log("true working")
            }
            if(localStorage.getItem("playedYesterday")==="false"){
                setShowPercentile(false);
                console.log("false working");
            }
            if(localStorage.getItem("playedYesterday")==="true"){
                percentil(x,lastScore);
                console.log("working");
            }
        }
        const percentil = (arr,val)=>{
            console.log(val,arr)
            let count = 0;
            var x = []
            for(let i=0; i<arr.length; i++){
                for(let j=0; j<arr[i]; j++){
                    x.push(i);
                }
            }
            x.forEach(v=>{
                if(v<val){
                    count++;
                } else if(v===val){
                    count+=0.5;
                }
            });
            setPercentile((100*count/x.length).toFixed(2));
            console.log(percentile)

            
        }
        fetchScores();
        
        // eslint-disable-next-line
    },[])
	
    const options = {
        animationEnabled: true,
        theme: "light2",

        title: {
          text: "Scores distribution of last day"
        },
        axisX:{
            title: "Scores",
            reversed: false,
        },
        axisY:{
            title: "Number of People",
            includeZero: true,
        },
        data: [{	
                

                  type: "bar",
                  dataPoints: [
                      { label: "0",  y: histData[0]  },
                      { label: "1", y: histData[1] },
                      { label: "2", y:histData[2]  },
                      { label: "3",  y: histData[3]  },
                      { label: "4",  y: histData[4] },
                      { label: "5",  y: histData[5]  },
                      { label: "6", y: histData[6]  },
                      { label: "7", y: histData[7] },
                      { label: "8",  y: histData[8]  },
                      { label: "9",  y: histData[9]  },
                      { label: "10",  y: histData[10]  },
                      { label: "11", y: histData[11] },
                      { label: "12", y:histData[12]  },
                      { label: "13",  y: histData[13]  },
                      { label: "14",  y: histData[14] },
                      { label: "15",  y: histData[15]  },
                      { label: "16", y: histData[16]  },
                      { label: "17", y: histData[17] },
                      { label: "18",  y: histData[18]  },
                      { label: "19",  y: histData[19]  },
                      { label: "20",  y: histData[20]  },
                      

                  ]
         }]
     }
		return (
		<div>
            <animated.div style={animProps} className={styles.gameOver}>
            <h1 style={{color:"white", display:"block"}}>Today's score</h1>

            <div className={styles.scoresWrapper}>
                
                <div className={styles.score}>
                <Score score={localStorage.getItem("lastPlayedScore")} title="Streak" />
                </div>
                <div className={styles.score}>
                <Score score={localStorage.getItem("highscore")} title="Best streak" />
                </div>
            </div>
            
            </animated.div>
            {loadingScore?(
                <>{showPercentile?(
                <div>
                    <animated.div style={animProps} className={styles.gameOver}>
                    <h1 style={{color:"white", display:"block"}}>Yesterday's score</h1>
                    <div className={styles.scoresWrapper}>
                
                        <div className={styles.score}>
                        <Score score={localStorage.getItem("yesterdayScore")} title="Streak" />
                        </div>
                        <div className={styles.score}>
                        <Score score= {percentile} title="Percentile score" />
                        </div>
                    </div>
                    </animated.div>
                </div>
                ):(<div style={{color:"white"}}><h3>You did not play yesterday</h3></div>)}</>
            ):(<div style={{color:"white"}}>Loading yesterdays's score.</div>)}
			<CanvasJSChart options = {options}
				/* onRef={ref => this.chart = ref} */
			/>
			{/*You can get reference to the chart instance as shown above using onRef. This allows you to access all chart properties and methods*/}
		</div>
		);
	}
	

  