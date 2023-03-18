import React, { Component,useEffect, useState } from 'react'
import Chart from 'react-google-charts'
import supabase from "./config/supabaseClient"
var today = new Date();
  var dd = String(today.getDate()).padStart(2,'0');
  var mm = String(today.getMonth()+1).padStart(2,'0');
  var yyyy = today.getFullYear();
  today = mm+'/'+dd+'/'+yyyy;

const HistogramData = [
  ['Quarks'],
  [0],
  [0],
  [0],
  [1],
  [2],
  [3],
  [4],
]
const chartOptions = {
  title: 'Charges of subatomic particles',
  legend: { position: 'top', maxLines: 2 },
  colors: ['#5C3292'],
  interpolateNulls: false,
}

export default function Hist() {
    const [histData,setHistData] = useState(null);
    useEffect(()=>{
        const fetchScores = async()=>{
            const {data,error} = await supabase.
            from('userData').select('*').eq('id',today);
    
            const x = data[0].scores;
            const histDat = [['scores']]
    
            for(let i=0; i<x.length; i++){
                let j = x[i];
                for(let k=0; k<j; k++){
                    let z = []
                    z.push(i)
                    histDat.push(z);
                }
            }
            //console.log(histDat);
            setHistData(histDat);
    
        }
        fetchScores();
    })
  
    return (
      <div className="container mt-5">
        <h2>React Histogram Chart Example</h2>
        <Chart
          width={'1600px'}
          height={'320px'}
          chartType="Histogram"
          loader={<div>Loading Chart</div>}
          data={histData}
          options={chartOptions}
          rootProps={{ 'data-testid': '5' }}
        />
      </div>
    )
  }

