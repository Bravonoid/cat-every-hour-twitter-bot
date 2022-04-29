import { TwitterApi } from "twitter-api-v2";
import axios from "axios";
import fs from "fs";
import { fileTypeFromFile } from "file-type";
import { CronJob } from "cron";
import express from "express";
import "dotenv/config";

const app = express();
const port = process.env.PORT || 3000;

import getRandomCat from "./src/randomCat.js";

const twitterClient = new TwitterApi({
	appKey: process.env.TWITTER_APP_KEY,
	appSecret: process.env.TWITTER_APP_SECRET,
	accessToken: process.env.TWITTER_ACCESS_TOKEN,
	accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

const downloadImage = (url, image_path) =>
	axios({
		url,
		responseType: "stream",
	}).then(
		(response) =>
			new Promise((resolve, reject) => {
				response.data
					.pipe(fs.createWriteStream(image_path))
					.on("finish", () => resolve())
					.on("error", (e) => reject(e));
			})
	);

const tweet = async () => {
	const cat = await getRandomCat();
	await downloadImage(cat, "cat.png");

	const path = "cat.png";
	const mediaId = await twitterClient.v1.uploadMedia(path, {
		mimeType: (await fileTypeFromFile(path)).mime,
	});

	await twitterClient.v1.tweet("", {
		media_ids: mediaId,
	});
};

const job = new CronJob(
	"0 * * * *",
	async function () {
		tweet();
		console.log("Tweets send");
	},
	null,
	false,
	"Asia/Jakarta"
);

app.listen(port, () => {
	console.log("Tweeting every hour");
	job.start();
});
