import axios from "axios";

export default axios.create({
    baseURL: "https://creatives-api.bigads.co",
    headers: {
        "Content-type": "application/json"
    }
})