import fetch from "node-fetch";

const API_KEY = "AIzaSyDC7kRQUR6Xr2L6FHTzqRnr5y3fa2hhBzo"; // replace this

async function testKey() {
  const res = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models",
    {
      headers: { "x-goog-api-key": API_KEY },
    }
  );
  const data = await res.json();
  console.log(data);
}

testKey();
