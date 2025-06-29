import { formatNumberWithCommas, translate } from '@/utils/helper';
import React, { useEffect, useRef, useState } from 'react';

const SemiDonutChart = ({ data, colors, totalEmiData, stroke }) => {
  const canvasRef = useRef(null);
  const [hoveredData, setHoveredData] = useState(null);

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');

    const total = data.reduce((prev, d) => prev + d.value, 0);

    const paintCanvas = () => {
      const width = canvasRef.current.clientWidth;
      const height = canvasRef.current.clientHeight;

      // Set canvas width and height
      canvasRef.current.width = width;
      canvasRef.current.height = height;

      const halfWidth = width * 0.5;
      const center = { x: width * 0.5, y: halfWidth };
      const radius = halfWidth - 30;
      const strokeWidth = stroke; // Adjust the stroke width as needed

      const pi = Math.PI;
      const pi2 = pi;
      let oldStart = pi; // Start angle at 180 degrees

      for (const entry of data) {
        const sweep = (entry.value / total) * pi2;

        ctx.beginPath();
        ctx.arc(center.x, center.y, radius, oldStart, oldStart + sweep);
        ctx.strokeStyle = colors[data.indexOf(entry) % colors.length];
        ctx.lineWidth = strokeWidth;
        ctx.stroke();

        oldStart += sweep;
      }
    };

    const handleMouseMove = (event) => {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // Check if mouse is over any data point
      for (const entry of data) {
        const width = canvasRef.current.clientWidth;
        const halfWidth = width * 0.5;
        const center = { x: width * 0.5, y: halfWidth };
        const angle = Math.atan2(y - center.y, x - center.x);
        const startAngle = Math.PI - (Math.PI / 180) * 180;
        const endAngle = startAngle + (entry.value / total) * Math.PI * 2;

        // if (angle >= startAngle && angle <= endAngle) {
        //   setHoveredData({ clientX: event.clientX, clientY: event.clientY, ...entry });
        //   return;
        // }
      }

      // No data point hovered
      // setHoveredData(null);
    };
    canvasRef.current.addEventListener('mousemove', handleMouseMove);

    if (ctx) {
      paintCanvas();
    }


  }, [data, colors]);


  useEffect(() => {

  }, [hoveredData])

  return (
    <div className='chart_div'>
      <canvas ref={canvasRef} className='custom_chart'>
      </canvas>
      <div className="show_chart_data" >
        <p>
          {translate("totalAmount")}
        </p>
        <span>
          {formatNumberWithCommas(totalEmiData.total_amount)}
        </span>
      </div>
    </div>
  );
};

export default SemiDonutChart;
