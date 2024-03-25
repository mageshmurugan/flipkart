import React from "react";

export default function Product({ content }) {
  // console.log(content);
  return (
    <>
      {/* <h1>hello</h1> */}
      {/* {content.map((content, key) => { */}
      {/* return ( */}
      <div>
        <h3>{content.Heading}</h3>
        <p>{content.Price}</p>
        <p>{content.Rating}</p>
        <p>{content.Review}</p>
        <p>{content.Offer}</p>
        <p>{content.AnchorTag}</p>
        <p>{content.Image}</p>
      </div>
      {/* ); */}
      {/* })} */}
    </>
  );
}
