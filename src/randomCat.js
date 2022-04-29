import axios from "axios";
import "dotenv/config";

export default async function getRandomCat() {
	const url = "https://api.thecatapi.com/v1/images/search";

	try {
		const { data } = await axios.get(url, {
			withCredentials: true,
			headers: {
				"X-API-KEY": process.env.X_API_KEY,
			},
		});

		return data[0].url;
	} catch (err) {
		console.log(err);
	}
}
