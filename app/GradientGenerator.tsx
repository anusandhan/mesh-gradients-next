'use client'

import { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';
import { PiArrowCircleDownBold, PiShuffleBold } from 'react-icons/pi';

const GradientGenerator = () => {
  const [backgroundColor, setBackgroundColor] = useState('#12013A');
  const [colorInputs, setColorInputs] = useState(['#330EA6', '#6932CD', '#E49DE8', '#633A86']);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Function to convert hex color to rgba
  const hexToRgba = (hex: string, alpha: number = 1) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const generateNoise = (ctx: CanvasRenderingContext2D, width: number, height: number, alpha: number = 0.03) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    for (let i = 0; i < imageData.data.length; i += 4) {
      let noise = Math.random() * 255 * alpha;
      imageData.data[i] += noise;
      imageData.data[i + 1] += noise;
      imageData.data[i + 2] += noise;
    }
    ctx.putImageData(imageData, 0, 0);
  };

  const generateMeshGradient = useCallback((randomize: boolean = false) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
  
        colorInputs.forEach((color) => {
          const x = randomize ? Math.random() * canvas.width : canvas.width / 2;
          const y = randomize ? Math.random() * canvas.height : canvas.height / 2;
  
          const scaleFactor = 0.8; // Adjusted scale factor as per your comment
          const endRadius = randomize ? (Math.random() * scaleFactor + scaleFactor) * Math.min(canvas.width, canvas.height) : Math.max(canvas.width, canvas.height) * scaleFactor;
  
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, endRadius);
          gradient.addColorStop(0, color);
          gradient.addColorStop(0.8, hexToRgba(color, 0.2));
          gradient.addColorStop(1, hexToRgba(color, 0));
          ctx.fillStyle = gradient;
  
          // Create an irregular blob
          const path = new Path2D();
          const numPoints = 5 + Math.floor(Math.random() * 5); // fewer points for more irregularity
          let points = [];
  
          // Generate random points around the center (x, y)
          for (let i = 0; i < numPoints; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radiusVariance = 0.3 + Math.random() * 0.7;
            const pointRadius = endRadius * radiusVariance;
            points.push({
              x: x + pointRadius * Math.cos(angle),
              y: y + pointRadius * Math.sin(angle)
            });
          }
  
          // Move to the first point
          path.moveTo(points[0].x, points[0].y);
  
          // Draw the blob using Bezier curves
          for (let i = 0; i < points.length; i++) {
            const nextIndex = (i + 1) % points.length;
            const nextPoint = points[nextIndex];
            const cp1 = {
              x: (points[i].x + nextPoint.x) / 2,
              y: (points[i].y + nextPoint.y) / 2
            };
            // This control point is now chosen by a random deviation from the midpoint
            const cp2 = {
              x: cp1.x + (Math.random() - 0.5) * endRadius,
              y: cp1.y + (Math.random() - 0.5) * endRadius
            };
            path.quadraticCurveTo(cp2.x, cp2.y, nextPoint.x, nextPoint.y);
          }
  
          path.closePath();
          ctx.fill(path);
          ctx.filter = 'blur(60px)';
        });
  
        // Apply original filter values
        ctx.filter = 'blur(60px)';
        ctx.drawImage(canvas, 0, 0);
        ctx.filter = 'contrast(130%) saturate(110%)';
        ctx.drawImage(canvas, 0, 0);
        ctx.filter = 'blur(30px)';
        ctx.drawImage(canvas, 0, 0);
        ctx.filter = 'none';
  
        // Generate noise if you have this function
        generateNoise(ctx, canvas.width, canvas.height);
      }
    }
  }, [backgroundColor, colorInputs]);  

  useEffect(() => {
    generateMeshGradient();
  }, [generateMeshGradient]);

  const handleBackgroundColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBackgroundColor(event.target.value);
  };

  const handleColorInputChange = (colorIndex: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const newColors = [...colorInputs];
    newColors[colorIndex] = event.target.value;
    setColorInputs(newColors);
  };

  const handleRandomize = () => {
    generateMeshGradient(true);
  };

  // Assuming a function to handle downloading the canvas as an image is required
  const downloadCanvasAsImage = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'mesh-gradient-wallpaper.png';
      link.href = image;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div>
      <Head>
        <title>Mesh Gradient Wallpaper Generator</title>
      </Head>
      <div className="controls flex mx-8 my-4 items-end">
        <div className='mr-4 w-1/8'>
        <label htmlFor="backgroundColorPicker" className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'>Background Color</label>
        <input
          type="text"
          id="backgroundColorPicker"
          className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
          value={backgroundColor}
          onChange={handleBackgroundColorChange}
        />
        </div>
        <div className='grid grid-cols-4 gap-6 w-1/2'>
        {colorInputs.map((color, index) => (
          <div key={index}>
          <label htmlFor="backgroundColorPicker" className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'>Color {index+1} </label>
          <input
            type="text"
            value={color}
            className=' bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
            onChange={handleColorInputChange(index)}
          />
          </div>
        ))}
        </div>
        
        <div className='ml-8 flex gap-4 items-end'>
        <button className='flex gap-2 items-center text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-4 py-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700' onClick={() => generateMeshGradient(true)}>
           <PiShuffleBold/>
          Randomize
        </button>
        <button className='flex gap-2 items-center text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700' onClick={downloadCanvasAsImage}>
          <PiArrowCircleDownBold/>
          Download
        </button>
      
        </div>
        
        </div>
        <div className='ccontainer rounded-lg mx-8 my-2 overflow-hidden'>
        <canvas
        ref={canvasRef}
        width={1920}
        height={1080}
        style={{ width: '100%', height: 'auto' }}
      />

        </div>
      
    </div>
  );
};

export default GradientGenerator;
