import React, {useState, useEffect, useMemo} from 'react';
import axios from 'axios';
import {FaCheck} from 'react-icons/fa';

const StyleSelector = ({handleOnClickStyle, styleSelector, style}) => {
  const [image, setImage] = useState(0);

  const hideCheckmark = (thumbnail)=>{
    console.log('WHAT DOES THIS PRODUCE', styleSelector);
    // console.log('thumbnail', thumbnail);
    console.log('style', style);
    if (thumbnail !== style) {
      return 'display-overlay'
    }
  }

  return (
    <div className='style-selector'>
      {styleSelector.map(thumbnail =>
        <div className='thumbnail-container'>
          <img
            className='style-thumbnail'
            src={thumbnail.photos?.[0].thumbnail_url}
            key={thumbnail.photos?.[0].thumbnail_url}
            onClick={()=>{handleOnClickStyle(thumbnail)}}
          />
          <div className={`overlay ${hideCheckmark(thumbnail)}`}>
            <FaCheck/>
          </div>
        </div>
      )}
    </div>
  )
}

export default StyleSelector;