import axios from "axios";
import { VITE_API_URL } from "../constants/config";

export default async function handleUpload(files, id) {
  try {
    const fd = new FormData();
    files.forEach(file => fd.append("files", file.data));
    const response = await axios.post(`${VITE_API_URL}/attachments/${id}`, fd);
    return response.data.files.map(file => file.url);
  } catch (err) {
    console.error(err);
  }
}
