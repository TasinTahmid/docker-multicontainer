import { useState, useEffect } from "react";
import axios from "axios";

export default function Fib() {
	const [seenIndexes, setSeenIndexes] = useState([]);
	const [values, setValues] = useState({});
	const [index, setIndex] = useState("");

	const fetchValues = async () => {
		const res = await axios.get("/api/values/current");
		setValues(res.data);
	};

	const fetchIndexes = async () => {
		const res = await axios.get("/api/values/all");
		setSeenIndexes(res.data);
	};

	// useEffect(() => {
	//   fetchValues();
	//   fetchIndexes();
	// }, []);

	const handleSubmit = async (event) => {
		event.preventDefault();
		await axios.post("/api/values", { index });
		setIndex("");
		// refresh so new results show up
		fetchValues();
		fetchIndexes();
	};

	return (
		<div>
			<form onSubmit={handleSubmit} className="c-fibonacci-form">
				<label>Enter your index:</label>
				<input
					value={index}
					onChange={(e) => setIndex(e.target.value)}
				/>
				<button>Submit</button>
			</form>

			<h3>Indexes I have seen:</h3>
			{seenIndexes.map(({ number }) => number).join(", ")}

			<h3>Calculated Values:</h3>
			{Object.entries(values).map(([key, value]) => (
				<div key={key}>
					For index {key} I calculated {value}
				</div>
			))}
		</div>
	);
}
