import React, { useState, useEffect } from 'react';
import Card from './Card.jsx';
import axios from 'axios';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import Promise from 'bluebird';

let Carousel = ({ id }) => {

  let overviewId = id || 40359;
  let [productList, setProductList] = useState([]);
  let [styleList, setStyleList] = useState([]);
  let [sectionIndex, setSectionIndex] = useState(0);
  let [jump, setJump] = useState(0);
  let [carouselWidth, setCarouselWidth] = useState(0);
  let [nCardsDisplayed, setNCardsDisplayed] = useState(0);
  let [indexOffset, setIndexOffset] = useState(0);
  let [starsList, setStarsList] = useState([]);
  const cardWidth = 259;

  const logAll = (array) => {
    array.forEach((value) => {
      console.log(value);
    })
  }

  const clicker = (mode) => {
    if (mode === 'prev') {
      // This makes sure not to croll past the first item
      if (sectionIndex !== -1) {
        setSectionIndex(sectionIndex -= 1)
      }
      setJump(jump = sectionIndex * cardWidth);

      //logAll([`Carousel Width: ${carouselWidth}`, `Number Of Cards Displayed: ${nCardsDisplayed}`, `Idex Offset: ${indexOffset}`, `Section Index: ${sectionIndex}`, `Jump: ${jump}`, `===============`]);

      // Finding the track on the DOM
      let track = document.querySelector(`.track`);
      // Transforming the carousel according to how far it needs to jump
      track.style.transform = `translateX(-${jump}px)`;

    } else if (mode === 'next') {
      setCarouselWidth(carouselWidth = document.querySelector(`.carousel-container`).clientWidth);
      setNCardsDisplayed(nCardsDisplayed = Math.ceil(carouselWidth / cardWidth));

      if (nCardsDisplayed + sectionIndex !== productList.length) {
        setSectionIndex(sectionIndex += 1);
      }

      setJump(jump = sectionIndex * cardWidth);

      //logAll([`Carousel Width: ${carouselWidth}`, `Number Of Cards Displayed: ${nCardsDisplayed}`, `Idex Offset: ${indexOffset}`, `Section Index: ${sectionIndex}`, `Jump: ${jump}`, `# of Products: ${productList.length}`, `===============`]);

      let track = document.querySelector(`.track`);
      track.style.transform = `translateX(-${jump}px)`;
    } else {
      console.log(`Danger in clicker Will Robinson!`)
    }
  }

  const calculateStarAvg = (ratingsObj) => {

    let totalReviews = 0;
    let totalStars = 0;

    for (let key in ratingsObj) {
      if (ratingsObj[key] !== NaN) {
        totalReviews += parseInt(ratingsObj[key]);
        totalStars += (parseInt(key) * ratingsObj[key]);
      }
    }

    let avg = totalStars / totalReviews;

    return avg;
  }

  // Responsible for getting the data for the carousel
  useEffect(() => {
    axios.get(`/products?id=${overviewId}&related=true`)
      .then((results) => {
        let idList = results.data;
        return idList;
      })
      .then((idList) => {
        Promise.all(idList.map((id) => axios.get(`/products?id=${id}&styles=true`)))
          .then((values) => {
            let allValues = values.map((item) => {return item.data});
            setStyleList(allValues)
            return allValues;
          })
        return idList;
      })
      .then((idList) => {
        Promise.all(idList.map((id) => axios.get(`/products?id=${id}`)))
          .then((values) => {
            let allValues = values.map((item) => {return item.data});
            setProductList(allValues);
            return allValues;
          })
        return idList;
      })
      .then((idList) => {
        Promise.all(idList.map((id) => axios.get(`/review/meta?product_id=${id}`)))
          .then((values) => {
            setStarsList(starsList = values.map((item) => {
              return {
                id: item.data.product_id,
                ratings: item.data.ratings
              }
            }));
            return starsList;
          })
          .then((starsList) => {
            starsList.forEach((product, index) => {
              let average = calculateStarAvg(product.ratings);
              starsList[index]['avg'] = average;
            })
          })
      })
      .catch((err) => console.log(`Error in carousel GET: ${err}`))
  }, [])

  // Controls the hiding and showing of the previous and next buttons at the appropriate time
  useEffect(() => {
    let prev = document.querySelector(`.prev`);
    let next = document.querySelector(`.next`);

    if (sectionIndex === 0){
      prev.style.display = 'none';
    } else {
      prev.style.display = 'block';
    }

    if (sectionIndex + nCardsDisplayed === productList.length) {
      next.style.display = 'none';
    } else {
      next.style.display = 'block';
    }
  })

  return (
    <div className="carousel-container" key="outer" >
      <div className="nav" key="nav">
        <FaArrowLeft className="prev button" onClick={() => {clicker('prev')}} />
        <FaArrowRight className="next button" onClick={() => {clicker('next'); console.log('Star List: ', starsList)}} />
      </div>
      <div className="inner-carousel" key="inner">
        <div className="track" key="track">
          {
            productList.map((product, index) =>
              <Card stars={starsList[index]} pic={styleList[index].results[0].photos[0].url} item={product} salePrice={styleList[index].results[3].sale_price} key={product.product_id} />
            )
          }
        </div>
      </div>
    </div>
  )
}

export default Carousel = Carousel;