import express from "express";
import cors from "cors";
const port = 3000;
import cheerio from "cheerio";
import got from "got";
import extractUrls from "extract-urls";

const app = express();
express.json({
  strict: false,
});
app.get("/", (req, res) => {
  res.json({
    message: "HelloWorld",
  });
});

app.get("/video-get/:query", async (req, res) => {
  const query = req.params.query;
  const baseURI = `https://www.xtits.com/search/${query}/`;
  const body = await (await got(baseURI)).body;
  const $ = cheerio.load(body);
  const videoInformation = [];
  $(".wrapper")
    .find(".wrapper-holder")
    .find(".container")
    .find(".main-content")
    .find("#list_videos_videos_list_search_result")
    .find(".thumbs-holder")
    .find(".thumb-item")
    .map(async (index, element) => {
      const title = $(element)
        .find(`a.js-open-popup`)
        .find(".info-holder")
        .find("p.title")
        .text()
        .trim();
      const _duration = $(element)
        .find(`a.js-open-popup`)
        .find(".img-holder")
        .find("span.time")
        .text()
        .trim();
      const milliseconds = msToDuration(_duration);
      for (const result of [{ duration: _duration, ms: milliseconds }]) {
        if (result?.ms <= 600000) return;
        const eachVideoThumbnail = $(`span:contains("${result.duration}")`)
          .parent()
          .parent()
          .parent()
          .find("a.js-open-popup")
          .find(".img-holder")
          .find("img")
          .attr("data-original");
        const eachVideoHREF = $(`span:contains("${result.duration}")`)
          .parent()
          .parent()
          .parent()
          .find("a.js-open-popup")
          .attr("href");
        return videoInformation.push({
          uri: eachVideoHREF,
          thumbnail: eachVideoThumbnail,
          title,
          duration: _duration,
        });
      }
    });
  const finalVideoLook = [];
  const sortedArray = videoInformation.sort(() => Math.random() - 0.5);
  const slicedArray = sortedArray.slice(0, 5);
  for (const data of slicedArray) {
    const response = await fetchVideo(data.uri);
    finalVideoLook.push({
      duration: data.duration,
      thumbnail: data.thumbnail,
      title: response.title,
      uri: response.uri[0],
    });
  }
  return res.send({
    finalVideoLook,
  });
});

app.get("/star-get/:name", async (req, res) => {
  const name = req.params.name;
  const BASE_URI = "https://www.babepedia.com";
  const uri = `https://www.babepedia.com/babe/${name}`;
  const request = await got(uri);
  const rawBody = request.body;
  const $ = cheerio.load(rawBody);
  const isError = $(".parent").find("main#content").has("span.results").html();
  if (isError !== null) throw Error("No PornStar found for the given name.");
  const sourceImage = $(".parent")
    .find("main#content")
    .find("#biography > #profbox")
    .find("#profimg")
    .find("a")
    .attr("href");
  const coverImage = `https://www.babepedia.com${sourceImage}`;
  const starName = $(".parent")
    .find("main#content")
    .find("#biography > #bioarea")
    .find("h1#babename")
    .text();
  const aboutStar = $(".parent")
    .find("main#content")
    .find(".babebanner")
    .find("p")
    .contents();
  let description;
  let a = [...aboutStar];
  const __result = a
    .filter((e) => e.type === "text" && $(e).text().trim())
    .map((e) => $(e).text().trim());
  const s = __result
    .map((v, i, a) => {
      return v;
    })
    .join(" ");
  s.includes("Performances Solo") || s.includes("Solo:")
    ? (description = s.substring(0, s.lastIndexOf("Performances Solo:")))
    : (description = s);
  const performancesPath = $(`h2:contains("${starName} Performances")`).html();
  const performances = [];
  performancesPath === null
    ? performances.push(logicOnNull($))
    : performances.push(getPerformances($));
  const rating = $(".parent")
    .find("main#content")
    .find("#biography > #bioarea")
    .find("#tn15rating")
    .find(".rating")
    .find("b")
    .html()
    ?.trim();
  const _currentRanking = $(".parent")
    .find("main#content")
    .find("#biography > #bioarea")
    .find(".ratingstats")
    .find("small")
    .contents();
  const arr = [..._currentRanking];
  const _result = arr
    .filter((e) => e.type === "text" && $(e).text().trim())
    .map((e) => $(e).text().trim());
  const result = _result[0];
  const currentRanking = result
    .slice(result.lastIndexOf(":") + 1, result.length)
    ?.trim();
  const regex = /\d+/g;
  const favouriteNumber = _result[1].match(regex)?.[0];
  const ethniCity = getFromSpan($, `Ethnicity:`).trim();
  const _braSize = getFromSpan($, "Bra/cup size:");
  const braSize = _braSize
    .slice(_braSize.lastIndexOf(":") + 1, _braSize.length)
    ?.trim();
  const height = getFromSpan($, "Height:");
  const weight = getFromSpan($, "Weight:");
  const _hairColor = getFromSpan($, "Hair color:");
  const hairColor = _hairColor
    .slice(_hairColor.lastIndexOf(":") + 1, _hairColor.length)
    ?.trim();
  const AKA = $(".parent")
    .find("main#content")
    .find("#biography > #bioarea")
    .find("h2#aka")
    .text();
  const active = getFromSpan($, "Years active:");
  const str = active.indexOf("-") + 1;
  const yearsActive = active.slice(str, active.length).trim();
  const age = getFromSpan($, "Age:");
  const profession = getProfession($, "Profession:", BASE_URI);
  const tattoos = getFromSpan($, "Tattoos:");
  const _bodyType = getFromSpan($, "Body type:");
  const bodyType = _bodyType
    .slice(_bodyType.lastIndexOf(":") + 1, _bodyType.length)
    ?.trim();
  const boobsType = getFromSpan($, "Boobs:");
  const piercings = getFromSpan($, "Piercings:");
  const images = [];
  const imagePath = $(".parent")
    .find("main#content")
    .find(".separate")
    .find(".thumbnail")
    .each((index, element) => {
      const $_ = $(element).find("a").attr("href")?.replace(" ", "%20");
      const starImages = `${BASE_URI}${$_}`;
      images.push(starImages);
    });
  const information = {
    name: starName,
    description,
    aka: AKA,
    braSize,
    images,
    boobsType,
    bodyType,
    hairColor,
    height,
    weight,
    yearsActive,
    profession,
    piercings,
    coverImage,
    ethniCity,
    performances,
    age,
    tattoos,
    rating,
    favouriteNumber,
    currentRanking,
  };

  return res.send({
    information,
  });
});

app.listen(port, () => console.log("Hello the port is now live."));

function getFromSpan($, t) {
  return $(`span:contains("${t}")`)
    .parent()
    .text()
    .trim()
    .split(" ")
    .slice(1)
    .join(" ")
    .split("\n")[0]
    .trim();
}
function getProfession($, t, base) {
  const array = [];
  const stringArray = [];
  $(`span:contains("${t}")`)
    .parent()
    .find("a")
    .map((index, el) => {
      const _href = $(el).attr("href");
      const _texts = $(el).text();
      array.push({ profession: _texts, professionURI: `${base}${_href}` });
      stringArray.push(`[${_texts}](${base}${_href})`);
    });
  return {
    stringArray,
    professionArray: array,
  };
}
function getPerformances($) {
  const _solo = $(".parent")
    .find("main#content")
    .find(`p:contains("Solo")`)
    .text();
  const solo = _solo.slice(_solo.lastIndexOf(":") + 1, _solo.length).trim();
  const _girl = $(".parent")
    .find("main#content")
    .find(`p:contains("Girl/girl")`)
    .text();
  const girl = _girl.slice(_girl.lastIndexOf(":") + 1, _girl.length).trim();
  const _boys = $(".parent")
    .find("main#content")
    .find(`p:contains("Boy/girl")`)
    .text();
  const _lesbian = $(".parent")
    .find("main#content")
    .find(`p:contains("Lesbian")`)
    .text();
  const lesbian = _lesbian
    .slice(_lesbian.lastIndexOf(":") + 1, _lesbian.length)
    .trim();
  const boy_girl = _boys.slice(_boys.lastIndexOf(":") + 1, _boys.length).trim();
  const __special = $(".parent")
    .find("main#content")
    .find(`p:contains("Special")`)
    .text();
  const special = __special
    .slice(__special.lastIndexOf(":") + 1, __special.length)
    .trim();
  const _object = {
    solo,
    girl_Girl: girl,
    boyGirl: boy_girl,
    special: special === null ? "No Specials" : special,
    lesbian,
  };
  return _object;
}
function logicOnNull($) {
  let arr = [];
  const data = $(`p:contains("
Solo:")`).text();
  const subStringedText = data
    .slice(data.lastIndexOf("Performances") + 12, data.length)
    .trim()
    .replace(/\s/gm, "");
  const falseOrTrue = subStringedText.includes("Lesbian");
  if (falseOrTrue === true) {
    let special = subStringedText.includes("Special:");
    let girlGirl = subStringedText.includes("Girl/girl");
    const __solo = subStringedText.slice(
      subStringedText.lastIndexOf("Solo:") + 5,
      subStringedText.length
    );
    const solo = __solo.substring(0, __solo.lastIndexOf("Lesbian:"));
    const __lesbian = __solo.slice(
      __solo.lastIndexOf("Lesbian:") + 8,
      __solo.length
    );
    const lesbian = __lesbian.substring(0, __lesbian.lastIndexOf("Boy/girl:"));
    const _boy__Girl = __lesbian.slice(__lesbian.lastIndexOf("Boy/girl") + 9);
    const boy_Girl = _boy__Girl.substring(0, _boy__Girl.lastIndexOf(","));
    return {
      solo,
      boyGirl: boy_Girl,
      girl_Girl: girlGirl === true ? "Pussy Licking" : "Unable to fetch",
      lesbian,
      special: special === true ? `Unable to fetch special.` : "No special.",
    };
  } else {
    const newStr = subStringedText.slice(subStringedText.indexOf("Solo:") + 5);
    const solo = newStr.substring(0, newStr.lastIndexOf("Girl/girl")).trim();
    const _girl_Girl = newStr
      .slice(newStr.lastIndexOf("Girl/girl") + 10, newStr.length)
      .trim();
    const girl_Girl = _girl_Girl
      .substring(0, _girl_Girl.lastIndexOf("Boy/girl"))
      .trim();
    const _boyGirl = _girl_Girl.slice(
      _girl_Girl.lastIndexOf("Boy/girl:") + 9,
      _girl_Girl.length
    );
    const boyGirl = _boyGirl
      .substring(0, _boyGirl.lastIndexOf("Special:"))
      .trim();
    const specialMoves = _boyGirl
      .slice(_boyGirl.lastIndexOf("Special:") + 8, _boyGirl.length)
      ?.trim();
    return {
      solo,
      girl_Girl,
      boyGirl,
      special: specialMoves,
      lesbian: "No Lesbian.",
    };
  }
}

async function fetchVideo(_uri) {
  const body = (await got(_uri)).body;
  const $ = cheerio.load(body);
  const title = $(".wrapper")
    .find(".wrapper-holder")
    .find(".main-holder")
    .find(".container-holder")
    .find(".content-box")
    .find(".container")
    .find(".headline")
    .find(".title-holder")
    .find("h1.title")
    .text()
    .trim();
  const videoURI = $(".wrapper")
    .find(".wrapper-holder")
    .find(".main-holder")
    .find(".container-holder")
    .find(".content-box")
    .find(".container")
    .find(".block-content")
    .find(".content-holder")
    .find(".player-holder")
    .find("script")
    .last()
    .html();
  const cleanURI = videoURI?.slice(0, videoURI?.lastIndexOf("video_url") + 1);
  const uri = extractUrls(cleanURI);
  const filteredURI = uri.filter(
    (u, i) => u.endsWith(".mp4/") || u.endsWith(".mp4")
  );
  return {
    uri: filteredURI,
    title,
  };
}

function msToDuration(timeInString) {
  let milliseconds;
  if (timeInString.split(":").length === 2) {
    /* For MM:SS */
    return (milliseconds =
      Number(timeInString.split(":")[0]) * 60000 +
      Number(timeInString.split(":")[1]) * 1000);
  } else if (timeInString.split(":").length === 3) {
    /* For HH:MM:SS */
    return (milliseconds =
      Number(timeInString.split(":")[0]) * 3600000 +
      Number(timeInString.split(":")[1]) * 60000 +
      Number(timeInString.split(":")[2]) * 1000);
  } else if (timeInString.split(":").length === 4) {
    /* For DD:HH:MM:SS */
    return (milliseconds =
      Number(timeInString.split(":")[0]) * 86400000 +
      Number(timeInString.split(":")[1]) * 3600000 +
      Number(timeInString.split(":")[2]) * 60000 +
      Number(timeInString.split(":")[3]) * 1000);
  }
}
