import React, { Component,useEffect, useState } from 'react';
import CanvasJSReact from './canvasjs.react';
import supabase from "./config/supabaseClient"
var CanvasJS = CanvasJSReact.CanvasJS;
var CanvasJSChart = CanvasJSReact.CanvasJSChart;

var today = new Date();
  var dd = String(today.getDate()).padStart(2,'0');
  var mm = String(today.getMonth()+1).padStart(2,'0');
  var yyyy = today.getFullYear();
  today = mm+'/'+dd+'/'+yyyy;
export default function Canva() {
    const [histData,setHistData] = useState(new Array(20).fill(false));
    useEffect(()=>{
        const fetchScores = async()=>{
            //console.log("yeaaaa")
            const {data,error} =  await supabase.
            from('userData').select('*').eq('id',today);
            //console.log(data,error)
            const x = data[0].scores;
            
            setHistData(x);
            //console.log("data",histData)
        }
        fetchScores();
    })
	
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
			<CanvasJSChart options = {options}
				/* onRef={ref => this.chart = ref} */
			/>
			{/*You can get reference to the chart instance as shown above using onRef. This allows you to access all chart properties and methods*/}
		</div>
		);
	}
	

  