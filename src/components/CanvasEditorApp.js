import React, { useEffect, useRef, useState } from 'react';
import '../components/CanvasEditorApp.css';


class CanvasEditor {
  constructor(canvas, templateData) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.templateData = templateData;
    this.image = new Image();
    this.image.onload = this.drawCanvas.bind(this);
    this.designPattern = new Image();
    this.designPattern.src = templateData.urls.design_pattern;
  }

  loadImage(url, callback) {
    const image = new Image();
    image.onload = () => callback(image);
    image.src = url;
  }


  drawCanvas() {
    // Draw background color
    this.context.fillStyle = this.templateData.background_color || "#9D5748";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  
    // Draw design pattern
    const pattern = this.context.createPattern(this.designPattern, 'repeat');
    this.context.fillStyle = pattern;
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  
    // Draw image within the mask
    this.context.globalCompositeOperation = 'source-in';
    this.context.drawImage(this.image, this.templateData.image_mask.x, this.templateData.image_mask.y, this.templateData.image_mask.width, this.templateData.image_mask.height);
  
    // Draw mask stroke
    this.context.globalCompositeOperation = 'destination-over';
    const stroke = new Image();
    stroke.onload = () => {
      this.context.drawImage(stroke, this.templateData.image_mask.x, this.templateData.image_mask.y, this.templateData.image_mask.width, this.templateData.image_mask.height);
  
      // Draw CTA button and text
      this.drawCTAButton();
  
      // Draw caption text with padding
      this.context.globalCompositeOperation = 'source-over';
      this.context.font = `${this.templateData.caption.font_size}px Arial`;
      this.context.fillStyle = this.templateData.caption.text_color;
      this.context.textAlign = 'left'; // Set text alignment to left
  
      const maxWordsPerLine = 6; // Maximum words per line
      const padding = 10; // Padding around the caption text
      const captionX = this.templateData.caption.position.x + padding;
      const captionY = this.templateData.caption.position.y + padding;
  
      this.drawTextWithWrap(
        this.templateData.caption.text,
        captionX,
        captionY,
        maxWordsPerLine,
        padding
      );
    };
    stroke.src = this.templateData.urls.stroke;
  
    // Draw selected image if it is different from the design pattern
    if (this.templateData.urls.mask !== this.templateData.urls.design_pattern) {
      const selectedImage = new Image();
      selectedImage.crossOrigin = "anonymous"; // Enable cross-origin for images
      selectedImage.onload = () => {
        this.context.globalCompositeOperation = 'source-over';
        this.context.drawImage(selectedImage, this.templateData.image_mask.x, this.templateData.image_mask.y, this.templateData.image_mask.width, this.templateData.image_mask.height);
      };
      selectedImage.src = this.templateData.urls.mask;
    }
  }




  drawCTAButton() {
    const ctaX = this.templateData.cta.position.x + (this.templateData.cta.wrap_length || 20);
    const ctaY = this.templateData.cta.position.y;

    // Draw rounded rectangle for CTA button
    this.context.fillStyle = this.templateData.cta.background_color || "#000000";
    this.roundRect(ctaX, ctaY, this.canvas.width - ctaX * 2, this.templateData.cta.font_size + 24, 12);

    // Draw CTA text
    this.context.fillStyle = this.templateData.cta.text_color;
    this.context.font = `${this.templateData.cta.font_size || 30}px Arial`;
    this.context.textAlign = "center";
    this.context.fillText(this.templateData.cta.text, this.canvas.width / 2, ctaY + this.templateData.cta.font_size + 12);
  }

  roundRect(x, y, width, height, radius) {
    this.context.beginPath();
    this.context.moveTo(x + radius, y);
    this.context.arcTo(x + width, y, x + width, y + height, radius);
    this.context.arcTo(x + width, y + height, x, y + height, radius);
    this.context.arcTo(x, y + height, x, y, radius);
    this.context.arcTo(x, y, x + radius, y, radius);
    this.context.closePath();
    this.context.fill();
  }



  drawTextWithWrap(text, x, y, maxWordsPerLine, padding) {
    const words = text.split(' ');
    let currentLine = '';
    let currentY = y + padding;

    words.forEach((word, index) => {
      if (index > 0 && index % maxWordsPerLine === 0) {
        // Draw the current line and move to the next line
        this.context.fillText(currentLine, x + padding, currentY);
        currentLine = word + ' ';
        currentY += this.templateData.caption.font_size + padding * 2; // Move to the next line with padding
      } else {
        currentLine += word + ' ';
      }
    });

    // Draw the last line
    this.context.fillText(currentLine, x + padding, currentY);
  }


}

const CanvasEditorApp = () => {
  const canvasRef = useRef(null);
  const [captionText, setCaptionText] = useState('1 & 2 BHK Luxury Apartments at just Rs.34.97 Lakhs'); // Initial caption text state
  const [ctaText, setCtaText] = useState('Shop Now'); // Initial CTA text state
  const [backgroundColor, setBackgroundColor] = useState(''); // Initial background color state
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;

    const templateData = {
      caption: {
        text: captionText,
        position: { x: 50, y: 50 },
        max_characters_per_line: 31,
        font_size: 44,
        alignment: "left",
        text_color: "#FFFFFF",
      },
      cta: {
        text: ctaText,
        position: { x: 190, y: 320 },
        text_color: "#FFFFFF",
        background_color: "#000000",
      },
      image_mask: {
        x: 56,
        y: 442,
        width: 970,
        height: 600,
      },
      urls: {
        mask: "https://d273i1jagfl543.cloudfront.net/templates/global_temp_landscape_temp_10_mask.png",
        stroke: "https://d273i1jagfl543.cloudfront.net/templates/global_temp_landscape_temp_10_Mask_stroke.png",
        design_pattern: "https://d273i1jagfl543.cloudfront.net/templates/global_temp_landscape_temp_10_Design_Pattern.png",
      },
    };

    if (selectedImage) {
      templateData.urls.mask = selectedImage; // Use the selected image as the mask
    }

    const canvasEditor = new CanvasEditor(canvas, templateData);
    canvasEditor.drawCanvas();
  }, [captionText, ctaText, backgroundColor, selectedImage]); // Run when any relevant state changes

  return (
    <div className='main'>
      <canvas
        ref={canvasRef}
        width="1080"
        height="1080"
        style={{ width: '540px', height: '540px', backgroundColor: backgroundColor || '#9D5748' }}
        className='img'
      />
      <div className='input'>
        <div className='header'>
          <div className='head'>Ad Customization
          <div className='h'>Customize your ad and get the templates accordingly</div>
          </div>
          <div className='m'>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Caption Text:</label><br></br>
            <input id="small-input" className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 sm:text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" type="text" value={captionText} onChange={(e) => setCaptionText(e.target.value)} />
          </div><br></br>
          <div>
            <label>CTA Text:</label><br></br>
            <input type="text" value={ctaText} onChange={(e) => setCtaText(e.target.value)} />
          </div><br></br>
          <div>
            <label>Background Color:</label><br></br>
            <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} />
          </div>
          <div>
            <label>Choose Image:</label><br></br>
            <input type="file" accept="image/*" onChange={handleImageChange} />
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanvasEditorApp;
