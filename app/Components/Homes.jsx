"use client";
// import React, { useRef, useEffect } from "react";

// export default function home() {
//   const names = useRef();

//   async function handleSubmit() {
//     // const data = {
//     //   names: names.current.value,
//     // };
//     console.log("Hello fucker");
//     // console.log(data);
//     const loggedInResponse = await fetch(
//       // `http://localhost:3001/${names.current.value}`,
//       `/api/search`,
//       // `/api/${names.current.value}`,
//       {
//         method: "POST",
//         // headers: {
//         //   "Content-Type": "application/json",
//         //   // Authorization: `Bearer ${user[0]}`,
//         // },
//         body: JSON.stringify(names.current.value),
//       }
//     );
//     const loggedIn = await loggedInResponse.json();
//     console.log(loggedIn);
//   }
//   return (
//     <>
//       <div>
//         <input
//           className="auto-input"
//           type="text"
//           placeholder="Search"
//           ref={names}
//         />
//         <button className="mybutton" onClick={handleSubmit}>
//           Scrape
//         </button>
//       </div>
//     </>
//   );
// }

import React, { useRef, useState } from "react";
import Product from "./Product";

export default function home() {
  const names = useRef();
  const [loggedIn, setLoggedIn] = useState(null);

  async function handleSubmit() {
    const loggedInResponse = await fetch("/api/search", {
      method: "GET",
      body: JSON.stringify(names.current.value.trim()),
    });
    const loggedInData = await loggedInResponse.json();
    setLoggedIn(loggedInData);
  }

  return (
    <>
      <div>
        <input
          className="auto-input"
          type="text"
          placeholder="Search"
          ref={names}
        />
        <button className="mybutton" onClick={handleSubmit}>
          Scrape
        </button>
      </div>

      {/* {loggedIn && <Product contents={loggedIn} />} */}
      {loggedIn && loggedIn.length >= 10 && (
        <div>
          {loggedIn.map((content, key) => {
            return <Product key={key} content={content} />;
          })}
        </div>
      )}
    </>
  );
}
